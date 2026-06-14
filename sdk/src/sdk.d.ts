import type { AgentConfig, AgentState, ConservationState, FleetStatus, GovernorConfig, GovernorDecision, Task, TaskResult, WrappableAgent, WrappedAgent, AgentRole } from './types.js';
import { Governor } from './governor.js';
/**
 * Agent — a fleet member with γ budget and conservation tracking.
 *
 * Agents execute tasks within their budget. Every execution:
 * 1. Checks if the fleet has conservation headroom
 * 2. Runs the task
 * 3. Reports γ/η back to the fleet
 */
export declare class Agent {
    readonly id: string;
    readonly name: string;
    readonly role: AgentConfig['role'];
    readonly gammaBudget: number;
    private gammaUsed;
    private etaProduced;
    private phase;
    private readonly fleet;
    constructor(fleet: Fleet, config: AgentConfig);
    /**
     * Execute a task with conservation governance.
     *
     * Before execution: checks fleet conservation headroom.
     * After execution: records γ/η to fleet ledger.
     * If conservation would be violated: returns error result.
     */
    execute(task: string): Promise<TaskResult>;
    /** Get current agent state snapshot */
    getState(): AgentState;
    /** Remaining γ budget for this agent */
    getBudget(): number;
    /** Set the agent phase */
    setPhase(phase: AgentState['phase']): void;
}
/**
 * Fleet — manages agents, tracks conservation, uses Governor for decisions.
 *
 * The fleet is the top-level governance unit. It maintains a running
 * ledger of γ and η across all agents and enforces the conservation law.
 */
export declare class Fleet {
    readonly name: string;
    readonly governor: Governor;
    readonly createdAt: number;
    private agents;
    private totalGamma;
    private totalEta;
    constructor(options: {
        name: string;
        governor?: Partial<GovernorConfig>;
    });
    /** Spawn a new agent in the fleet */
    spawn(config: AgentConfig): Agent;
    /** Get the current fleet status */
    status(): FleetStatus;
    /**
     * Execute a task through the fleet's governance pipeline.
     * The task is routed to an appropriate agent.
     */
    execute(task: Task): Promise<TaskResult>;
    /** Get current governor decision for the fleet */
    getDecision(): GovernorDecision;
    /** Get current conservation state */
    getConservation(): ConservationState;
    /** Register an existing agent (from any framework) into governance */
    registerExisting(agent: WrappableAgent, role: AgentRole): WrappedAgent;
    /** Record γ/η from task execution (internal, called by Agent) */
    recordTask(gamma: number, eta: number): void;
    /** Total γ consumed across all agents */
    get totalGammaUsed(): number;
    /** Total η produced across all agents */
    get totalEtaProduced(): number;
    /** Get an agent by ID */
    getAgent(id: string): Agent | undefined;
    /** List all agents */
    getAgents(): Agent[];
}
