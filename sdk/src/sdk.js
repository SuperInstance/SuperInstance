// ─── SuperInstance Fleet SDK ─────────────────────────────────────────────────
//
// The main user-facing API. Create fleets, spawn agents, execute governed tasks.
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//
import { Governor } from './governor.js';
import { wrapGeneric } from './wrapper.js';
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
 */
export class Agent {
    id;
    name;
    role;
    gammaBudget;
    gammaUsed = 0;
    etaProduced = 0;
    phase = 'active';
    fleet;
    constructor(fleet, config) {
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
    async execute(task) {
        const taskId = `task-${++taskIdCounter}`;
        // Estimate γ/η for this task (simplified: proportional to task length)
        const taskWeight = Math.min(0.15, task.length / 1000);
        const estimatedGamma = Math.max(0.01, taskWeight * 0.6);
        const estimatedEta = Math.max(0.01, taskWeight * 0.4);
        // Check agent budget
        if (this.gammaUsed + estimatedGamma > this.gammaBudget) {
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
        this.gammaUsed += actualGamma;
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
    /** Get current agent state snapshot */
    getState() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            phase: this.phase,
            gammaUsed: this.gammaUsed,
            etaProduced: this.etaProduced,
            conservationRemaining: Math.max(0, this.gammaBudget - this.gammaUsed),
        };
    }
    /** Remaining γ budget for this agent */
    getBudget() {
        return Math.max(0, this.gammaBudget - this.gammaUsed);
    }
    /** Set the agent phase */
    setPhase(phase) {
        this.phase = phase;
    }
}
/**
 * Fleet — manages agents, tracks conservation, uses Governor for decisions.
 *
 * The fleet is the top-level governance unit. It maintains a running
 * ledger of γ and η across all agents and enforces the conservation law.
 */
export class Fleet {
    name;
    governor;
    createdAt;
    agents = new Map();
    totalGamma = 0;
    totalEta = 0;
    constructor(options) {
        this.name = options.name;
        this.governor = new Governor(options.governor);
        this.createdAt = Date.now();
    }
    /** Spawn a new agent in the fleet */
    spawn(config) {
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
    status() {
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
    async execute(task) {
        // Find an agent with sufficient budget
        const candidates = Array.from(this.agents.values()).filter((a) => a.getBudget() >= task.estimatedGamma && a.getState().phase === 'active');
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
    getDecision() {
        return this.governor.decide({
            gamma: this.totalGamma,
            eta: this.totalEta,
            agentCount: this.agents.size,
        });
    }
    /** Get current conservation state */
    getConservation() {
        return this.governor.observe({
            gamma: this.totalGamma,
            eta: this.totalEta,
            agentCount: this.agents.size,
        });
    }
    /** Register an existing agent (from any framework) into governance */
    registerExisting(agent, role) {
        return wrapGeneric(agent, this, role);
    }
    /** Record γ/η from task execution (internal, called by Agent) */
    recordTask(gamma, eta) {
        this.totalGamma += gamma;
        this.totalEta += eta;
    }
    /** Total γ consumed across all agents */
    get totalGammaUsed() {
        return this.totalGamma;
    }
    /** Total η produced across all agents */
    get totalEtaProduced() {
        return this.totalEta;
    }
    /** Get an agent by ID */
    getAgent(id) {
        return this.agents.get(id);
    }
    /** List all agents */
    getAgents() {
        return Array.from(this.agents.values());
    }
}
//# sourceMappingURL=sdk.js.map