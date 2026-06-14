// ─── SuperInstance SDK — Main Entry ──────────────────────────────────────────
//
// Conservation-law governance for AI agent fleets.
// Works with any framework: OpenAI, LangGraph, CrewAI, custom agents.
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//
// Core classes
export { Fleet, Agent } from './sdk.js';
export { Governor } from './governor.js';
// Framework wrappers
export { wrapOpenAI, wrapLangGraph, wrapCrewAI, wrapGeneric, } from './wrapper.js';
// ─── Constants ───────────────────────────────────────────────────────────────
/** C = log₂(3) ≈ 1.585 — the conservation capacity constant */
export const C = Math.log2(3);
/** Human-readable conservation law */
export const CONSERVATION_LAW = 'γ + η ≤ C where C = log₂(3) ≈ 1.585';
/**
 * δ(n) = (1/√n)(1 − 3/(2n)) — convergence rate.
 * Measures coordination overhead cancellation as fleet grows.
 */
export function convergenceDelta(n) {
    if (n <= 0)
        return Infinity;
    if (n < 3)
        return 1;
    return (1 / Math.sqrt(n)) * (1 - 3 / (2 * n));
}
//# sourceMappingURL=index.js.map