// ─── SuperInstance LangGraph Integration ─────────────────────────────────────
//
// Wrap LangGraph StateGraphs with conservation-law governance.
// Every graph invocation becomes a conservation-tracked operation.
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//

import { Fleet } from '@superinstance/sdk';
import type { AgentRole, TaskResult, ConservationState } from '@superinstance/sdk';
import { extractConservation, injectConservation } from './state-adapter.js';
import type { ConservationChannel } from './state-adapter.js';

/** Task ID counter for governed invocations */
let govTaskIdCounter = 0;

/**
 * Minimal graph interface — anything with an `invoke` method.
 * This matches LangGraph's StateGraph, CompiledGraph, and runnable graphs.
 */
export interface InvocableGraph<TState> {
  invoke(state: TState): Promise<TState>;
}

/**
 * Options for wrapping a LangGraph graph with conservation governance.
 */
export interface GovernGraphOptions<TState> {
  /** The fleet that governs this graph */
  fleet: Fleet;
  /** The graph to wrap (LangGraph StateGraph, CompiledGraph, etc.) */
  graph: InvocableGraph<TState>;
  /** Agent role assigned to this graph */
  role: AgentRole;
  /** Maximum γ this graph can consume across all invocations */
  gammaBudget: number;
  /** Human-readable name for this graph in fleet status */
  name: string;
}

/**
 * GovernedGraph — a LangGraph wrapper that enforces conservation law.
 *
 * Before each invocation:
 *   1. Checks fleet conservation headroom
 *   2. Checks this graph's remaining γ budget
 *   3. If either is exhausted, returns a blocked result
 *
 * After each invocation:
 *   1. Estimates γ consumed and η produced
 *   2. Records to the fleet ledger
 *   3. Returns both the state and conservation metadata
 */
export class GovernedGraph<TState> {
  private readonly fleet: Fleet;
  private readonly graph: InvocableGraph<TState>;
  readonly role: AgentRole;
  readonly gammaBudget: number;
  readonly name: string;

  private gammaUsed: number = 0;
  private etaProduced: number = 0;
  private invocationCount: number = 0;

  constructor(options: GovernGraphOptions<TState>) {
    this.fleet = options.fleet;
    this.graph = options.graph;
    this.role = options.role;
    this.gammaBudget = options.gammaBudget;
    this.name = options.name;
  }

  /**
   * Run the graph with conservation governance.
   *
   * Returns the final state plus a TaskResult with γ/η accounting.
   * If budget is exhausted or conservation violated, returns a blocked result
   * with the input state unchanged.
   */
  async invoke(state: TState): Promise<{ state: TState; result: TaskResult }> {
    const taskId = `gov-graph-${++govTaskIdCounter}`;

    // 1. Check this graph's remaining budget
    if (this.gammaUsed >= this.gammaBudget) {
      return {
        state,
        result: {
          taskId,
          success: false,
          gammaUsed: 0,
          etaProduced: 0,
          output: `Graph '${this.name}' γ budget exhausted (${this.gammaUsed.toFixed(4)}/${this.gammaBudget.toFixed(4)})`,
          conservationCheck: this.fleet.getConservation(),
        },
      };
    }

    // 2. Check fleet conservation
    const decision = this.fleet.getDecision();
    if (decision.action === 'throttle' && decision.magnitude > 0.7) {
      return {
        state,
        result: {
          taskId,
          success: false,
          gammaUsed: 0,
          etaProduced: 0,
          output: `Fleet throttled: ${decision.reason}`,
          conservationCheck: decision.conservation,
        },
      };
    }

    // 3. Execute the graph
    let outputState: TState;
    try {
      outputState = await this.graph.invoke(state);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        state,
        result: {
          taskId,
          success: false,
          gammaUsed: 0,
          etaProduced: 0,
          output: `Graph execution failed: ${errMsg}`,
          conservationCheck: this.fleet.getConservation(),
        },
      };
    }

    // 4. Estimate γ/η from the state transition
    const stateSize = this.estimateStateSize(state, outputState);
    const gamma = Math.max(0.005, Math.min(0.1, stateSize * 0.002));
    const eta = Math.max(0.005, Math.min(0.08, stateSize * 0.0012));

    // 5. Record to fleet ledger
    this.fleet.recordTask(gamma, eta);
    this.gammaUsed += gamma;
    this.etaProduced += eta;
    this.invocationCount++;

    return {
      state: outputState,
      result: {
        taskId,
        success: true,
        gammaUsed: gamma,
        etaProduced: eta,
        output: `Graph '${this.name}' invocation #${this.invocationCount} completed`,
        conservationCheck: this.fleet.getConservation(),
      },
    };
  }

  /** Check if the graph can run given current budget and fleet state */
  canRun(): boolean {
    if (this.gammaUsed >= this.gammaBudget) return false;
    const conservation = this.fleet.getConservation();
    return conservation.delta > 0 && conservation.status !== 'violated';
  }

  /** Get current conservation state from the fleet */
  getConservation(): ConservationState {
    return this.fleet.getConservation();
  }

  /** γ consumed by this graph so far */
  getGammaUsed(): number {
    return this.gammaUsed;
  }

  /** η produced by this graph so far */
  getEtaProduced(): number {
    return this.etaProduced;
  }

  /** Remaining γ budget */
  getRemainingBudget(): number {
    return Math.max(0, this.gammaBudget - this.gammaUsed);
  }

  /** Number of successful invocations */
  getInvocationCount(): number {
    return this.invocationCount;
  }

  /** Rough size estimate for state transition γ/η calculation */
  private estimateStateSize(input: TState, output: TState): number {
    try {
      const inSize = JSON.stringify(input as unknown as Record<string, unknown>).length;
      const outSize = JSON.stringify(output as unknown as Record<string, unknown>).length;
      return Math.max(inSize, outSize, 50);
    } catch {
      return 100;
    }
  }
}

/**
 * Wrap a LangGraph graph with conservation governance.
 *
 * @example
 * ```typescript
 * const governed = governGraph({
 *   fleet: myFleet,
 *   graph: myCompiledStateGraph,
 *   role: 'builder',
 *   gammaBudget: 0.3,
 *   name: 'build-pipeline',
 * });
 * const { state, result } = await governed.invoke(initialState);
 * ```
 */
export function governGraph<TState>(
  options: GovernGraphOptions<TState>,
): GovernedGraph<TState> {
  return new GovernedGraph(options);
}

/**
 * Wrap an individual graph node with γ budget tracking.
 *
 * Use this when you want per-node governance inside a LangGraph StateGraph
 * rather than governing the whole graph at once.
 *
 * @example
 * ```typescript
 * const governedResearch = governNode(researchNode, fleet, 0.15);
 * const governedBuild = governNode(buildNode, fleet, 0.25);
 * graph.addNode('research', governedResearch);
 * graph.addNode('build', governedBuild);
 * ```
 */
export function governNode<TState>(
  nodeFn: (state: TState) => Promise<TState>,
  fleet: Fleet,
  gammaBudget: number,
): (state: TState) => Promise<TState> {
  let gammaUsed = 0;

  return async (state: TState): Promise<TState> => {
    // Check budget
    if (gammaUsed >= gammaBudget) {
      // Pass through without executing — budget exhausted
      return state;
    }

    // Check fleet conservation
    const conservation = fleet.getConservation();
    if (conservation.status === 'violated') {
      return state;
    }

    // Execute node
    const result = await nodeFn(state);

    // Estimate and record γ/η
    const stateSize = typeof result === 'object' && result !== null
      ? JSON.stringify(result).length
      : 100;
    const gamma = Math.max(0.005, Math.min(0.05, stateSize * 0.001));
    const eta = Math.max(0.005, Math.min(0.04, stateSize * 0.0008));

    fleet.recordTask(gamma, eta);
    gammaUsed += gamma;

    return result;
  };
}

/**
 * Agent spec for createGovernedMultiAgent.
 */
export interface GovernedAgentSpec {
  /** Unique name for this agent */
  name: string;
  /** Agent role in the fleet */
  role: AgentRole;
  /** γ budget allocated to this agent */
  gammaBudget: number;
  /** The agent's invoke function (graph node, chain, etc.) */
  invoke: (state: any) => Promise<any>;
}

/**
 * Options for creating a governed multi-agent graph.
 */
export interface CreateGovernedMultiAgentOptions {
  /** Name for the fleet that will govern these agents */
  fleetName: string;
  /** Agent specifications */
  agents: GovernedAgentSpec[];
}

/**
 * Create a governed multi-agent pipeline.
 *
 * Maps LangGraph's multi-agent pattern to a fleet of conservation-governed agents.
 * Each agent gets its own γ budget. Agents execute sequentially in declaration order,
 * with the fleet enforcing conservation law throughout.
 *
 * In production, wire these governed nodes into a LangGraph StateGraph
 * with custom edges. This function provides a simple sequential pipeline
 * for quick starts and testing.
 *
 * @example
 * ```typescript
 * const { fleet, invoke } = createGovernedMultiAgent({
 *   fleetName: 'my-pipeline',
 *   agents: [
 *     { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, invoke: researchNode },
 *     { name: 'Builder', role: 'builder', gammaBudget: 0.3, invoke: buildNode },
 *     { name: 'Validator', role: 'validator', gammaBudget: 0.15, invoke: validateNode },
 *   ],
 * });
 * const result = await invoke({ task: 'build rate limiter' });
 * ```
 */
export function createGovernedMultiAgent(options: CreateGovernedMultiAgentOptions): {
  fleet: Fleet;
  invoke: (input: any) => Promise<any>;
} {
  const fleet = new Fleet({ name: options.fleetName });

  // Spawn a fleet agent for each spec
  const governedNodes = options.agents.map((spec) => {
    fleet.spawn({ name: spec.name, role: spec.role, gammaBudget: spec.gammaBudget });
    return {
      spec,
      governedFn: governNode(spec.invoke, fleet, spec.gammaBudget),
    };
  });

  /**
   * Sequential pipeline — runs each governed node in order.
   * In production, replace this with a LangGraph StateGraph
   * that wires nodes with conditional edges.
   */
  const invoke = async (input: any): Promise<any> => {
    let state = input;

    // Inject initial conservation channel
    const initialConservation = fleet.getConservation();
    state = injectConservation(state, {
      gamma: initialConservation.gamma,
      eta: initialConservation.eta,
      delta: initialConservation.delta,
      agentCount: initialConservation.C, // Replaced below
    });

    // Run each governed node sequentially
    for (const { spec, governedFn } of governedNodes) {
      // Update conservation channel before each node
      const cons = fleet.getConservation();
      state = injectConservation(state, {
        gamma: cons.gamma,
        eta: cons.eta,
        delta: cons.delta,
        agentCount: options.agents.length,
      });

      state = await governedFn(state);

      if (state === null || state === undefined) {
        state = {};
      }
    }

    // Final conservation state
    const finalCons = fleet.getConservation();
    state = injectConservation(state, {
      gamma: finalCons.gamma,
      eta: finalCons.eta,
      delta: finalCons.delta,
      agentCount: options.agents.length,
    });

    return state;
  };

  return { fleet, invoke };
}

// Re-export state adapter utilities
export { extractConservation, injectConservation };
export type { ConservationChannel };
