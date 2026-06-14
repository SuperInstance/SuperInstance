// ─── SuperInstance Framework Wrappers ────────────────────────────────────────
//
// Wrap existing agents from any framework with conservation governance.
// Each wrapper:
// 1. Registers the agent with the fleet
// 2. Before execute: checks conservation budget
// 3. After execute: reports γ/η to fleet
// 4. If conservation violated: returns error instead of executing
//
/** Default γ budget per framework agent */
const FRAMEWORK_BUDGETS = {
    openai: 0.35,
    langgraph: 0.30,
    crewai: 0.25,
    generic: 0.20,
};
/**
 * Core wrapping logic shared by all framework wrappers.
 * Creates a governed agent that checks conservation before executing.
 */
function createWrappedAgent(agent, fleet, role, framework) {
    const gammaBudget = FRAMEWORK_BUDGETS[framework] ?? FRAMEWORK_BUDGETS.generic;
    // Spawn a fleet agent to track this wrapper
    const fleetAgent = fleet.spawn({
        name: agent.name,
        role,
        gammaBudget,
    });
    let gammaUsed = 0;
    let etaProduced = 0;
    const wrappedExecute = async (task) => {
        const taskId = `wrapped-${Date.now()}`;
        // 1. Check conservation before executing
        const conservation = fleet.getConservation();
        if (conservation.delta < 0) {
            return {
                taskId,
                success: false,
                gammaUsed: 0,
                etaProduced: 0,
                output: '',
                conservationCheck: conservation,
            };
        }
        // Check governor decision
        const decision = fleet.getDecision();
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
        // Check agent budget
        if (gammaUsed >= gammaBudget) {
            return {
                taskId,
                success: false,
                gammaUsed: 0,
                etaProduced: 0,
                output: '',
                conservationCheck: conservation,
            };
        }
        // 2. Execute the real agent
        let output;
        try {
            output = await agent.execute(task);
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            return {
                taskId,
                success: false,
                gammaUsed: 0,
                etaProduced: 0,
                output: errMsg,
                conservationCheck: fleet.getConservation(),
            };
        }
        // 3. Estimate γ/η from output
        const gamma = Math.max(0.01, Math.min(0.1, output.length / 5000));
        const eta = Math.max(0.01, Math.min(0.08, output.length / 8000));
        // 4. Report to fleet
        gammaUsed += gamma;
        etaProduced += eta;
        return {
            taskId,
            success: true,
            gammaUsed: gamma,
            etaProduced: eta,
            output,
            conservationCheck: fleet.getConservation(),
        };
    };
    const getState = () => {
        return fleetAgent.getState();
    };
    return {
        name: agent.name,
        role,
        execute: wrappedExecute,
        getState,
        framework,
    };
}
/**
 * Wrap an OpenAI Agents SDK agent with conservation governance.
 *
 * ```typescript
 * import { wrapOpenAI } from 'superinstance';
 * const governed = wrapOpenAI(myOpenAIAgent, fleet, 'builder');
 * ```
 */
export function wrapOpenAI(agent, fleet, role) {
    return createWrappedAgent(agent, fleet, role, 'openai');
}
/**
 * Wrap a LangGraph graph/agent with conservation governance.
 *
 * ```typescript
 * import { wrapLangGraph } from 'superinstance';
 * const governed = wrapLangGraph(myGraph, fleet, 'researcher');
 * ```
 */
export function wrapLangGraph(graph, fleet, role) {
    return createWrappedAgent(graph, fleet, role, 'langgraph');
}
/**
 * Wrap a CrewAI crew with conservation governance.
 *
 * ```typescript
 * import { wrapCrewAI } from 'superinstance';
 * const governed = wrapCrewAI(myCrew, fleet, 'builder');
 * ```
 */
export function wrapCrewAI(crew, fleet, role) {
    return createWrappedAgent(crew, fleet, role, 'crewai');
}
/**
 * Wrap any agent that has an `execute(task: string) => Promise<string>` method.
 *
 * ```typescript
 * import { wrapGeneric } from 'superinstance';
 * const governed = wrapGeneric(myCustomAgent, fleet, 'validator');
 * ```
 */
export function wrapGeneric(agent, fleet, role) {
    return createWrappedAgent({ ...agent, framework: agent.framework ?? 'generic' }, fleet, role, agent.framework ?? 'generic');
}
//# sourceMappingURL=wrapper.js.map