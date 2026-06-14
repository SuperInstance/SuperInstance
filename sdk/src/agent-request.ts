// ─── SuperInstance Agent Request Logic ───────────────────────────────────────
//
// Implements the request() method for agents — the core modular capability
// that lets agents dynamically access fleet resources at runtime.
//
// Before executing a request:
//   1. Check if the capability is registered
//   2. Check if agent has γ budget for the request
//   3. Execute the handler
//   4. Deduct γ from agent's budget
//   5. Return response with conservation metadata
//

import type { CapabilityRequest, CapabilityResponse, Capability } from './modular.js';
import type { Fleet } from './sdk.js';

/** Minimum γ reserve an agent must keep — can't spend below this */
const MIN_RESERVE = 0.001;

/** Maximum γ any single request can cost */
const MAX_REQUEST_COST = 0.15;

/**
 * Mutable budget tracker — passed by reference so mutations persist.
 */
export interface BudgetTracker {
  value: number;
}

/**
 * Execute a capability request on behalf of an agent.
 *
 * This function is called by Agent.request() — it enforces budget
 * constraints and records γ/η to the fleet ledger.
 *
 * @param fleet - The fleet instance
 * @param agentId - The requesting agent's ID
 * @param gammaUsed - Mutable tracker for γ used (pass agent's tracker)
 * @param agentGammaBudget - Agent's total γ budget
 * @param capability - Which capability to request
 * @param params - Parameters for the capability
 * @returns The capability response
 */
export async function executeRequest(
  fleet: Fleet,
  agentId: string,
  gammaUsed: BudgetTracker,
  agentGammaBudget: number,
  capability: Capability,
  params?: Record<string, unknown>,
): Promise<CapabilityResponse> {
  // Build the request
  const request: CapabilityRequest = {
    capability,
    params: params ?? {},
    agentId,
  };

  // Check if fleet has this capability
  const router = fleet.getRouter();
  if (!router.has(capability)) {
    return {
      success: false,
      error: `Capability '${capability}' is not registered. Available: ${router.listAvailable().join(', ') || '(none)'}`,
      gammaCost: 0,
      etaProduced: 0,
    };
  }

  // Check agent budget — estimate cost (actual cost comes from handler)
  // Reserve a small amount so agent never hits exactly 0
  const remainingBudget = agentGammaBudget - gammaUsed.value - MIN_RESERVE;
  if (remainingBudget <= 0) {
    return {
      success: false,
      error: `Agent '${agentId}' has exhausted γ budget (used ${gammaUsed.value.toFixed(4)} / ${agentGammaBudget.toFixed(4)}). Request denied.`,
      gammaCost: 0,
      etaProduced: 0,
    };
  }

  // Route the request through the fleet's capability router
  const response = await router.route(request);

  // Sanity check on γ cost
  const actualCost = Math.min(response.gammaCost, MAX_REQUEST_COST);

  // Check if the cost would exceed remaining budget
  if (actualCost > remainingBudget) {
    return {
      success: false,
      error: `Request would cost γ=${actualCost.toFixed(4)} but agent has only ${remainingBudget.toFixed(4)} remaining.`,
      gammaCost: 0,
      etaProduced: 0,
    };
  }

  // Deduct γ from agent's budget tracker
  gammaUsed.value += actualCost;

  // Record γ/η to the fleet ledger
  if (actualCost > 0 || response.etaProduced > 0) {
    fleet.recordTask(actualCost, response.etaProduced);
  }

  // Return response with adjusted cost
  return {
    ...response,
    gammaCost: actualCost,
  };
}
