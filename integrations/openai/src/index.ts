// ─── SuperInstance × OpenAI Agents SDK Integration ───────────────────────────
//
// Conservation-law governance for OpenAI agents.
//
// The OpenAI Agents SDK (npm: @openai/agents) provides Runner.run() which
// executes an agent and returns a result string. This integration wraps that
// execution with SuperInstance's conservation governance:
//
//   γ + η ≤ C   where C = log₂(3) ≈ 1.585 bits
//
// Before execution: conservation budget is checked.
// During execution: token usage is tracked (optional, via TokenTracker).
// After execution: γ/η are computed and reported to the fleet.
//

import {
  Fleet,
  type AgentConfig,
  type AgentRole,
  type TaskResult,
  type ConservationState,
  type GovernorDecision,
} from '@superinstance/sdk';
import { TokenTracker } from './token-tracker.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Context passed to the execute function before running.
 * Lets the OpenAI agent adapt its behavior based on governance state.
 */
export interface GovernorContext {
  /** Remaining γ budget for this agent */
  budgetRemaining: number;
  /** Fleet conservation state */
  conservationDelta: number;
  /** Governor recommendation */
  recommendedAction: 'release' | 'throttle' | 'hold';
}

/**
 * Options for creating a governed agent.
 */
export interface GovernedAgentOptions {
  /** The fleet this agent belongs to */
  fleet: Fleet;
  /** Agent role in the fleet */
  role: AgentRole;
  /** Display name */
  name: string;
  /** Maximum γ this agent can consume */
  gammaBudget: number;
  /**
   * Execute a task and return the result string.
   *
   * In production, this wraps OpenAI's Runner.run():
   *
   *   import { Runner } from '@openai/agents';
   *   execute: async (task, ctx) => {
   *     return await Runner.run(agent, task);
   *   }
   */
  execute: (task: string, context?: GovernorContext) => Promise<string>;
}

// ─── GovernedAgent ───────────────────────────────────────────────────────────

/**
 * A governed OpenAI agent wrapped with SuperInstance conservation governance.
 *
 * Each GovernedAgent:
 * 1. Has a γ budget — tasks that would exceed it are blocked
 * 2. Reports γ/η to the fleet after every execution
 * 3. Can request capabilities and delegate to other fleet agents
 * 4. Tracks token usage via TokenTracker
 */
export class GovernedAgent {
  readonly name: string;
  readonly role: AgentRole;

  private readonly fleet: Fleet;
  private readonly gammaBudget: number;
  private readonly executeFn: (task: string, context?: GovernorContext) => Promise<string>;
  private readonly tracker: TokenTracker;
  private gammaUsed: number = 0;
  private etaProduced: number = 0;

  constructor(options: GovernedAgentOptions) {
    this.fleet = options.fleet;
    this.name = options.name;
    this.role = options.role;
    this.gammaBudget = options.gammaBudget;
    this.executeFn = options.execute;
    this.tracker = new TokenTracker();
  }

  /**
   * Execute a task with conservation governance.
   *
   * Flow:
   * 1. Build GovernorContext from current fleet state
   * 2. Check agent budget and fleet conservation
   * 3. Call the wrapped execute function
   * 4. Compute γ/η from result
   * 5. Report to fleet ledger
   * 6. Return TaskResult
   */
  async execute(task: string): Promise<TaskResult> {
    const taskId = `gov-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 1. Check agent budget
    const budgetRemaining = this.gammaBudget - this.gammaUsed;
    if (budgetRemaining <= 0.001) {
      return {
        taskId,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: '',
        conservationCheck: this.fleet.getConservation(),
      };
    }

    // 2. Check fleet conservation and governor
    const decision = this.fleet.getDecision();
    const conservation = this.fleet.getConservation();

    if (conservation.status === 'violated') {
      return {
        taskId,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: '',
        conservationCheck: conservation,
      };
    }

    // 3. Build governor context for the execute function
    const ctx: GovernorContext = {
      budgetRemaining,
      conservationDelta: conservation.delta,
      recommendedAction: this.mapDecision(decision.action),
    };

    // 4. If governor says throttle hard, block execution
    if (decision.action === 'throttle' && decision.magnitude > 0.7) {
      return {
        taskId,
        success: false,
        gammaUsed: 0,
        etaProduced: 0,
        output: '',
        conservationCheck: decision.conservation,
      };
    }

    // 5. Execute the task
    let output: string;
    let success = true;
    try {
      output = await this.executeFn(task, ctx);
    } catch (err) {
      output = err instanceof Error ? err.message : String(err);
      success = false;
    }

    // 6. Compute γ/η
    const gamma = this.tracker.tokensToGamma(
      Math.min(task.length * 1.5, 8000), // estimate prompt tokens from task
      Math.min(output.length * 0.75, 4000), // estimate completion tokens from output
    );
    const eta = this.tracker.outputToEta(output, success);

    // 7. Report to fleet
    this.fleet.recordTask(gamma, eta);
    this.gammaUsed += gamma;
    this.etaProduced += eta;

    return {
      taskId,
      success,
      gammaUsed: gamma,
      etaProduced: eta,
      output,
      conservationCheck: this.fleet.getConservation(),
    };
  }

  /**
   * Request a capability from the fleet.
   * Routes through the fleet's capability router.
   */
  async request(capability: string, params?: Record<string, unknown>): Promise<unknown> {
    const router = this.fleet.getRouter();
    const response = await router.route({
      capability: capability as any,
      params: params ?? {},
      agentId: this.name,
    });
    return response;
  }

  /**
   * Delegate a task to another agent role in the fleet.
   */
  async delegate(toRole: AgentRole, task: string, budget?: number): Promise<unknown> {
    const router = this.fleet.getRouter();
    const response = await router.route({
      capability: 'delegate',
      params: { toRole, task, gammaBudget: budget ?? 0.1 },
      agentId: this.name,
    });
    return response;
  }

  /** Remaining γ budget for this agent */
  getBudget(): number {
    return Math.max(0, this.gammaBudget - this.gammaUsed);
  }

  /** Get cumulative token usage tracked by this agent */
  getTokenUsage() {
    return this.tracker.getCumulative();
  }

  /** Get agent state snapshot */
  getState(): unknown {
    return {
      name: this.name,
      role: this.role,
      gammaUsed: this.gammaUsed,
      etaProduced: this.etaProduced,
      budgetRemaining: this.getBudget(),
      gammaBudget: this.gammaBudget,
      tokens: this.tracker.getCumulative(),
    };
  }

  // ─── Private ────────────────────────────────────────────────────────────

  private mapDecision(
    action: GovernorDecision['action'],
  ): GovernorContext['recommendedAction'] {
    if (action === 'release' || action === 'spawn') return 'release';
    if (action === 'throttle' || action === 'merge') return 'throttle';
    return 'hold';
  }
}

// ─── Factory Functions ───────────────────────────────────────────────────────

/**
 * Create a single governed OpenAI agent.
 *
 * @example
 * ```typescript
 * import { Fleet } from '@superinstance/sdk';
 * import { createGovernedAgent } from '@superinstance/openai-integration';
 *
 * const fleet = new Fleet({ name: 'my-fleet' });
 * const agent = createGovernedAgent({
 *   fleet,
 *   role: 'builder',
 *   name: 'MyBuilder',
 *   gammaBudget: 0.3,
 *   execute: async (task) => {
 *     // In production: return await Runner.run(openaiAgent, task);
 *     return `Done: ${task}`;
 *   },
 * });
 *
 * const result = await agent.execute('Build a REST API');
 * ```
 */
export function createGovernedAgent(options: GovernedAgentOptions): GovernedAgent {
  return new GovernedAgent(options);
}

/**
 * Create a fleet of governed OpenAI agents.
 *
 * @example
 * ```typescript
 * const { fleet, agents } = createGovernedFleet({
 *   name: 'my-fleet',
 *   agents: [
 *     { name: 'Builder', role: 'builder', gammaBudget: 0.3, execute: runBuilder },
 *     { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, execute: runResearcher },
 *   ],
 * });
 * ```
 */
export function createGovernedFleet(options: {
  name: string;
  agents: Array<{
    name: string;
    role: AgentRole;
    gammaBudget: number;
    execute: (task: string, context?: GovernorContext) => Promise<string>;
  }>;
}): { fleet: Fleet; agents: GovernedAgent[] } {
  const fleet = new Fleet({ name: options.name });
  const agents = options.agents.map((a) =>
    createGovernedAgent({ fleet, ...a }),
  );
  return { fleet, agents };
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export { TokenTracker } from './token-tracker.js';
export type { TokenUsage } from './token-tracker.js';
