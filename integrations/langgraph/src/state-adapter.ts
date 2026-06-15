// ─── LangGraph State ↔ Conservation State Adapter ────────────────────────────
//
// Bridges LangGraph state channels and SuperInstance conservation state.
// Allows conservation metadata to flow through the graph alongside
// application state, enabling per-node budget checks.
//

/**
 * Conservation channel — the conservation metadata that flows through
 * a LangGraph state graph alongside application data.
 *
 * This mirrors the key fields from ConservationState but is designed
 * to be embedded as a channel within a larger state object.
 */
export interface ConservationChannel {
  /** γ — coupling cost consumed so far */
  gamma: number;
  /** η — value produced so far */
  eta: number;
  /** δ — remaining conservation budget (C − γ − η) */
  delta: number;
  /** Number of agents in the fleet */
  agentCount: number;
}

/** Key used to store conservation data in LangGraph state */
export const CONSERVATION_KEY = '__conservation__';

/**
 * Extract conservation metadata from a LangGraph state object.
 *
 * Looks for a `__conservation__` key in the state and returns its contents.
 * If not present, returns an empty partial.
 *
 * @example
 * ```typescript
 * const cons = extractConservation(state);
 * if (cons.gamma !== undefined && cons.gamma > 0.5) {
 *   throw new Error('γ budget exceeded');
 * }
 * ```
 */
export function extractConservation(state: Record<string, any>): Partial<ConservationChannel> {
  const channel = state[CONSERVATION_KEY];
  if (channel && typeof channel === 'object') {
    const result: Partial<ConservationChannel> = {};
    if (typeof channel.gamma === 'number') result.gamma = channel.gamma;
    if (typeof channel.eta === 'number') result.eta = channel.eta;
    if (typeof channel.delta === 'number') result.delta = channel.delta;
    if (typeof channel.agentCount === 'number') result.agentCount = channel.agentCount;
    return result;
  }
  return {};
}

/**
 * Inject conservation state into a LangGraph state object.
 *
 * Creates a shallow copy of the state with the conservation channel updated.
 * Does not mutate the original state.
 *
 * @example
 * ```typescript
 * const newState = injectConservation(state, {
 *   gamma: 0.15,
 *   eta: 0.08,
 *   delta: 1.355,
 *   agentCount: 3,
 * });
 * ```
 */
export function injectConservation(
  state: Record<string, any>,
  channel: ConservationChannel,
): Record<string, any> {
  return {
    ...state,
    [CONSERVATION_KEY]: {
      gamma: channel.gamma,
      eta: channel.eta,
      delta: channel.delta,
      agentCount: channel.agentCount,
    },
  };
}

/**
 * Create a reducer for LangGraph's Channel interface that merges
 * conservation channel updates.
 *
 * In LangGraph, state channels use reducers to combine updates.
 * This creates a reducer suitable for the conservation channel.
 *
 * @example
 * ```typescript
 * import { Annotation } from '@langchain/langgraph';
 *
 * const StateGraph = Annotation.Root({
 *   messages: Annotation<any[]>({ reducer: (a, b) => [...a, ...b] }),
 *   __conservation__: conservationReducer(),
 * });
 * ```
 */
export function conservationReducer() {
  return {
    reducer: (
      current: ConservationChannel | undefined,
      update: Partial<ConservationChannel>,
    ): ConservationChannel => {
      const base: ConservationChannel = current ?? {
        gamma: 0,
        eta: 0,
        delta: Math.log2(3),
        agentCount: 0,
      };
      return {
        gamma: update.gamma ?? base.gamma,
        eta: update.eta ?? base.eta,
        delta: update.delta ?? base.delta,
        agentCount: update.agentCount ?? base.agentCount,
      };
    },
    default: (): ConservationChannel => ({
      gamma: 0,
      eta: 0,
      delta: Math.log2(3),
      agentCount: 0,
    }),
  };
}
