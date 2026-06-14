// ─── SuperInstance Inter-Agent Delegation ────────────────────────────────────
//
// Agents can delegate tasks to other agents in the fleet.
// This is how agents "of other agents" work — a builder can delegate
// research to a researcher, who delegates validation to a validator.
//
// The delegation system finds the best agent for a task based on:
// 1. Role match
// 2. Budget availability
// 3. Phase (must be active)
//

import type { Fleet } from './sdk.js';
import type { AgentRole, TaskResult } from './types.js';
import type { CapabilityRequest, CapabilityResponse } from './modular.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A delegation request from one agent to another */
export interface DelegationRequest {
  fromAgent: string;       // Agent ID of the requester
  toRole: AgentRole;       // Desired role to delegate to
  task: string;            // Task description
  gammaBudget: number;     // γ budget allocated for the delegated work
}

/** The result of a delegation */
export interface DelegationResult {
  success: boolean;
  delegatedTo: string;     // Agent ID that received the delegation
  result?: TaskResult;     // Task result if executed
  error?: string;          // Error message if failed
}

// ─── Delegator ───────────────────────────────────────────────────────────────

/**
 * Create a delegation handler for the capability router.
 *
 * When an agent requests the 'delegate' capability, this handler:
 * 1. Finds agents with the requested role
 * 2. Selects the one with the most remaining budget
 * 3. Executes the task on that agent
 * 4. Returns the result to the requesting agent
 */
export function createDelegator(fleet: Fleet): (req: CapabilityRequest) => Promise<CapabilityResponse> {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const params = req.params;
    const toRole = params.toRole as AgentRole | undefined;
    const task = params.task as string | undefined;
    const budget = Number(params.gammaBudget ?? 0.1);

    if (!toRole) {
      return {
        success: false,
        error: 'Missing required param: toRole',
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    if (!task) {
      return {
        success: false,
        error: 'Missing required param: task',
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    // Find agents with the requested role (exclude self)
    const candidates = fleet.getAgents().filter(
      (a) => a.role === toRole && a.getState().phase === 'active' && a.id !== req.agentId,
    );

    if (candidates.length === 0) {
      return {
        success: false,
        error: `No active '${toRole}' agent available for delegation (excluding self '${req.agentId}')`,
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    // Select the agent with the most remaining budget
    const selected = candidates.sort((a, b) => b.getBudget() - a.getBudget())[0];

    // Check if selected agent has enough budget
    if (selected.getBudget() < budget) {
      return {
        success: false,
        error: `Selected agent '${selected.name}' has only ${selected.getBudget().toFixed(4)} γ remaining, need ${budget.toFixed(4)}`,
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    // Execute the delegated task
    const result = await selected.execute(task);

    const delegationResult: DelegationResult = {
      success: result.success,
      delegatedTo: selected.id,
      result,
    };

    return {
      success: result.success,
      data: delegationResult,
      gammaCost: 0, // γ is recorded by the delegated agent's execute()
      etaProduced: 0,
    };
  };
}

/**
 * Standalone delegation function — can be called directly on the fleet.
 *
 * @param fleet - The fleet instance
 * @param fromAgent - ID of the requesting agent
 * @param toRole - Role to delegate to
 * @param task - Task description
 * @param gammaBudget - γ budget for the delegated work (default 0.1)
 * @returns The delegation result
 */
export async function delegate(
  fleet: Fleet,
  fromAgent: string,
  toRole: AgentRole,
  task: string,
  gammaBudget: number = 0.1,
): Promise<DelegationResult> {
  const params: Record<string, unknown> = { toRole, task, gammaBudget };
  const router = fleet.getRouter();

  const response = await router.route({
    capability: 'delegate',
    params,
    agentId: fromAgent,
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
