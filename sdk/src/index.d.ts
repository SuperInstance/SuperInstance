export { Fleet, Agent } from './sdk.js';
export { Governor } from './governor.js';
export { wrapOpenAI, wrapLangGraph, wrapCrewAI, wrapGeneric, } from './wrapper.js';
export type { ConservationState, AgentRole, AgentPhase, AgentConfig, AgentState, Task, TaskResult, FleetStatus, GovernorConfig, GovernorDecision, WrappableAgent, WrappedAgent, } from './types.js';
/** C = log₂(3) ≈ 1.585 — the conservation capacity constant */
export declare const C: number;
/** Human-readable conservation law */
export declare const CONSERVATION_LAW = "\u03B3 + \u03B7 \u2264 C where C = log\u2082(3) \u2248 1.585";
/**
 * δ(n) = (1/√n)(1 − 3/(2n)) — convergence rate.
 * Measures coordination overhead cancellation as fleet grows.
 */
export declare function convergenceDelta(n: number): number;
