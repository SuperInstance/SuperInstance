// ─── SuperInstance Fleet SDK ─────────────────────────────────────────────────
//
// The main user-facing API. Create fleets, spawn agents, execute governed tasks.
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//

import type {
  AgentConfig,
  AgentState,
  ConservationState,
  FleetStatus,
  GovernorConfig,
  GovernorDecision,
  Task,
  TaskResult,
  WrappableAgent,
  WrappedAgent,
  AgentRole,
} from './types.js';
import { Governor } from './governor.js';
import { wrapGeneric } from './wrapper.js';
import {
  CapabilityRouter,
  createSearchHandler,
  createBudgetHandler,
  createValidateHandler,
  createConserveHandler,
  createStatusHandler,
  createReportHandler,
} from './modular.js';
import type { Capability, CapabilityHandler, CapabilityResponse } from './modular.js';
import { executeRequest } from './agent-request.js';
import type { BudgetTracker } from './agent-request.js';
import { createDelegator } from './fleet-delegate.js';
import type { DelegationResult } from './fleet-delegate.js';

/** Agent ID counter for unique identification */
let agentIdCounter = 0;

/** Task ID counter */
let taskIdCounter = 0;

/**
 * Agent — a fleet member with γ budget and conservation tracking.
 *
 * Agents execute tasks within their budget. Every execution:
 * 1. Checks if the fleet has conservation headroom
 * 2. Runs the task
 * 3. Reports γ/η back to the fleet
 *
 * Agents can also request capabilities from the fleet at runtime
 * via the modular request system.
 */
export class Agent {
  readonly id: string;
  readonly name: string;
  readonly role: AgentConfig['role'];
  readonly gammaBudget: number;

  /** Mutable γ tracker — shared with the request system */
  private _gammaUsedTracker: BudgetTracker = { value: 0 };
  private etaProduced: number = 0;
  private phase: AgentState['phase'] = 'active';
  private readonly fleet: Fleet;

  constructor(fleet: Fleet, config: AgentConfig) {
    this.fleet = fleet;
    this.id = `agent-${++agentIdCounter}`;
    this.name = config.name ?? `${config.role}-${agentIdCounter}`;
    this.role = config.role;
    this.gammaBudget = config.gammaBudget;
  }

  /**
   * Execute a task with conservation governance.
   *
   * Before execution: checks fleet conservation headroom.
   * After execution: records γ/η to fleet ledger.
   * If conservation would be violated: returns error result.
   */
  async execute(task: string): Promise<TaskResult> {
    const taskId = `task-${++taskIdCounter}`;

    // Estimate γ/η for this task (simplified: proportional to task length)
    const taskWeight = Math.min(0.15, task.length / 1000);
    const estimatedGamma = Math.max(0.01, taskWeight * 0.6);
    const estimatedEta = Math.max(0.01, taskWeight * 0.4);

    // Check agent budget
    if (this._gammaUsedTracker.value + estimatedGamma > this.gammaBudget) {
      return {
        taskId,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: '',
        conservationCheck: this.fleet.getConservation(),
      };
    }

    // Check fleet conservation
    const decision = this.fleet.getDecision();
    if (decision.action === 'throttle' && decision.magnitude > 0.5) {
      this.phase = 'standby';
      return {
        taskId,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: '',
        conservationCheck: decision.conservation,
      };
    }

    // Simulate task execution
    // In real usage, the caller provides the execution function via wrappers
    const actualGamma = estimatedGamma;
    const actualEta = estimatedEta;

    // Record to fleet
    this.fleet.recordTask(actualGamma, actualEta);
    this._gammaUsedTracker.value += actualGamma;
    this.etaProduced += actualEta;

    const conservation = this.fleet.getConservation();

    return {
      taskId,
      success: true,
      gammaUsed: actualGamma,
      etaProduced: actualEta,
      output: task,
      conservationCheck: conservation,
    };
  }

  /**
   * Request a capability from the fleet at runtime.
   *
   * This is the modular agent request system — agents dynamically
   * access fleet capabilities without static wiring.
   *
   * @example
   * const results = await agent.request('search', { query: 'rate limiter', topK: 3 });
   * const budget = await agent.request('budget');
   * const valid = await agent.request('validate', { signals: [1, -1, 0] });
   */
  async request(capability: Capability, params?: Record<string, unknown>): Promise<CapabilityResponse> {
    return executeRequest(
      this.fleet,
      this.id,
      this._gammaUsedTracker,
      this.gammaBudget,
      capability,
      params,
    );
  }

  /**
   * Delegate a task to another agent in the fleet by role.
   *
   * @example
   * const result = await agent.delegate('researcher', 'research ternary computing', 0.1);
   */
  async delegate(toRole: AgentRole, task: string, budget: number = 0.1): Promise<DelegationResult> {
    const router = this.fleet.getRouter();
    const response = await router.route({
      capability: 'delegate',
      params: { toRole, task, gammaBudget: budget },
      agentId: this.id,
    });

    if (!response.success) {
      return {
        success: false,
        delegatedTo: '',
        error: response.error,
      };
    }

    return response.data as DelegationResult;
  }

  /** Get current agent state snapshot */
  getState(): AgentState {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      phase: this.phase,
      gammaUsed: this._gammaUsedTracker.value,
      etaProduced: this.etaProduced,
      conservationRemaining: Math.max(0, this.gammaBudget - this._gammaUsedTracker.value),
    };
  }

  /** Remaining γ budget for this agent */
  getBudget(): number {
    return Math.max(0, this.gammaBudget - this._gammaUsedTracker.value);
  }

  /** Set the agent phase */
  setPhase(phase: AgentState['phase']): void {
    this.phase = phase;
  }
}

/**
 * Fleet — manages agents, tracks conservation, uses Governor for decisions.
 *
 * The fleet is the top-level governance unit. It maintains a running
 * ledger of γ and η across all agents and enforces the conservation law.
 *
 * The fleet also hosts a CapabilityRouter — the central registry for
 * modular capability requests from agents.
 */
export class Fleet {
  readonly name: string;
  readonly governor: Governor;
  readonly createdAt: number;

  private agents: Map<string, Agent> = new Map();
  private totalGamma: number = 0;
  private totalEta: number = 0;
  private router: CapabilityRouter;

  constructor(options: { name: string; governor?: Partial<GovernorConfig> }) {
    this.name = options.name;
    this.governor = new Governor(options.governor);
    this.createdAt = Date.now();
    this.router = new CapabilityRouter();

    // Auto-register built-in handlers
    this.registerBuiltins();
  }

  /** Spawn a new agent in the fleet */
  spawn(config: AgentConfig): Agent {
    // Check if fleet has capacity for another agent
    const conservation = this.getConservation();
    if (conservation.delta < config.gammaBudget * 0.5) {
      // Tight — but still spawn, agent just may not be able to use full budget
    }

    const agent = new Agent(this, config);
    this.agents.set(agent.id, agent);
    return agent;
  }

  /** Get the current fleet status */
  status(): FleetStatus {
    const conservation = this.getConservation();
    const agentStates = Array.from(this.agents.values()).map((a) => a.getState());
    const activeCount = agentStates.filter((a) => a.phase === 'active').length;

    return {
      name: this.name,
      agentCount: this.agents.size,
      activeAgents: activeCount,
      conservation,
      agents: agentStates,
      convergenceDelta: this.governor.getConvergence(this.agents.size),
      uptime: Date.now() - this.createdAt,
    };
  }

  /**
   * Execute a task through the fleet's governance pipeline.
   * The task is routed to an appropriate agent.
   */
  async execute(task: Task): Promise<TaskResult> {
    // Find an agent with sufficient budget
    const candidates = Array.from(this.agents.values()).filter(
      (a) => a.getBudget() >= task.estimatedGamma && a.getState().phase === 'active',
    );

    if (candidates.length === 0) {
      return {
        taskId: task.id,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: 'No agent with sufficient budget available',
        conservationCheck: this.getConservation(),
      };
    }

    // Pick the agent with the most remaining budget
    const agent = candidates.sort((a, b) => b.getBudget() - a.getBudget())[0];
    return agent.execute(task.description);
  }

  /** Get current governor decision for the fleet */
  getDecision(): GovernorDecision {
    return this.governor.decide({
      gamma: this.totalGamma,
      eta: this.totalEta,
      agentCount: this.agents.size,
    });
  }

  /** Get current conservation state */
  getConservation(): ConservationState {
    return this.governor.observe({
      gamma: this.totalGamma,
      eta: this.totalEta,
      agentCount: this.agents.size,
    });
  }

  /** Register an existing agent (from any framework) into governance */
  registerExisting(agent: WrappableAgent, role: AgentRole): WrappedAgent {
    return wrapGeneric(agent, this, role);
  }

  /**
   * Register a custom capability handler.
   * @example
   * fleet.registerCapability('search', mySearchHandler);
   */
  registerCapability(capability: Capability, handler: CapabilityHandler): void {
    this.router.register(capability, handler);
  }

  /** Get the fleet's capability router (internal, used by Agent.request) */
  getRouter(): CapabilityRouter {
    return this.router;
  }

  /** Record γ/η from task execution (internal, called by Agent) */
  recordTask(gamma: number, eta: number): void {
    this.totalGamma += gamma;
    this.totalEta += eta;
  }

  /** Total γ consumed across all agents */
  get totalGammaUsed(): number {
    return this.totalGamma;
  }

  /** Total η produced across all agents */
  get totalEtaProduced(): number {
    return this.totalEta;
  }

  /** Get an agent by ID */
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /** List all agents */
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /** Register built-in capability handlers */
  private registerBuiltins(): void {
    this.router.register('search', createSearchHandler());
    this.router.register('budget', createBudgetHandler(this));
    this.router.register('validate', createValidateHandler());
    this.router.register('conserve', createConserveHandler(this));
    this.router.register('status', createStatusHandler(this));
    this.router.register('report', createReportHandler(this));
    this.router.register('delegate', createDelegator(this));
    // 'spawn' and 'crate-info' are not registered by default —
    // users can register custom handlers for these
  }
}
