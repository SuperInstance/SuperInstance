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
export {
  wrapOpenAI,
  wrapLangGraph,
  wrapCrewAI,
  wrapGeneric,
} from './wrapper.js';

// Modular capability system
export {
  CapabilityRouter,
  createSearchHandler,
  createBudgetHandler,
  createValidateHandler,
  createConserveHandler,
  createStatusHandler,
  createReportHandler,
} from './modular.js';

// Delegation system
export {
  createDelegator,
  delegate,
} from './fleet-delegate.js';

// All types
export type {
  ConservationState,
  AgentRole,
  AgentPhase,
  AgentConfig,
  AgentState,
  Task,
  TaskResult,
  FleetStatus,
  GovernorConfig,
  GovernorDecision,
  WrappableAgent,
  WrappedAgent,
} from './types.js';

// Modular types
export type {
  Capability,
  CapabilityRequest,
  CapabilityResponse,
  CapabilityHandler,
} from './modular.js';

// Delegation types
export type {
  DelegationRequest,
  DelegationResult,
} from './fleet-delegate.js';

// Dashboard
export { FleetDashboard } from './dashboard.js';
export type { DashboardOptions } from './dashboard.js';

// Telemetry system
export { TelemetryReporter } from './telemetry.js';
export { TelemetryReceiver } from './telemetry-receiver.js';

// Telemetry types
export type {
  TelemetryConfig,
  FleetSnapshot,
  ConservationAlert,
} from './telemetry.js';
export type { AggregateMetrics } from './telemetry-receiver.js';

// ─── Constants ───────────────────────────────────────────────────────────────

/** C = log₂(3) ≈ 1.585 — the conservation capacity constant */
export const C = Math.log2(3);

/** Human-readable conservation law */
export const CONSERVATION_LAW = 'γ + η ≤ C where C = log₂(3) ≈ 1.585';

/**
 * δ(n) = (1/√n)(1 − 3/(2n)) — convergence rate.
 * Measures coordination overhead cancellation as fleet grows.
 */
export function convergenceDelta(n: number): number {
  if (n <= 0) return Infinity;
  if (n < 3) return 1;
  return (1 / Math.sqrt(n)) * (1 - 3 / (2 * n));
}
