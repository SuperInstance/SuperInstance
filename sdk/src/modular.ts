// ─── SuperInstance Modular Capability System ────────────────────────────────
//
// The key innovation: agents request capabilities from the fleet at runtime.
// Instead of static wiring, agents dynamically discover and use fleet resources.
//
// Conservation Law: every capability request costs γ and may produce η.
//

import type { Fleet } from './sdk.js';
import type { ConservationState } from './types.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/** Capabilities that agents can request from the fleet */
export type Capability =
  | 'search'      // SHOAL semantic search
  | 'budget'      // Conservation budget check
  | 'validate'    // Ternary signal validation
  | 'conserve'    // Conservation invariant check
  | 'status'      // Fleet status
  | 'crate-info'  // Crate metadata lookup
  | 'spawn'       // Spawn a sub-agent
  | 'delegate'    // Delegate task to another agent
  | 'report';     // Report results to fleet

/** A capability request from an agent */
export interface CapabilityRequest {
  capability: Capability;
  params: Record<string, unknown>;
  agentId: string;
}

/** The response from a capability request */
export interface CapabilityResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  gammaCost: number;   // γ consumed by this request
  etaProduced: number;  // η produced
}

/** Handler function type for a capability */
export type CapabilityHandler = (req: CapabilityRequest) => Promise<CapabilityResponse>;

// ─── Capability Router ───────────────────────────────────────────────────────

/**
 * CapabilityRouter — the central registry for fleet capabilities.
 *
 * Agents route requests through the router. The router dispatches
 * to the registered handler, tracks γ/η costs, and returns results.
 */
export class CapabilityRouter {
  private handlers: Map<Capability, CapabilityHandler> = new Map();

  /** Register a handler for a capability */
  register(capability: Capability, handler: CapabilityHandler): void {
    this.handlers.set(capability, handler);
  }

  /** Unregister a capability handler */
  unregister(capability: Capability): void {
    this.handlers.delete(capability);
  }

  /** Route a capability request to its handler */
  async route(request: CapabilityRequest): Promise<CapabilityResponse> {
    const handler = this.handlers.get(request.capability);
    if (!handler) {
      return {
        success: false,
        error: `Unknown capability: '${request.capability}'. Available: ${this.listAvailable().join(', ')}`,
        gammaCost: 0,
        etaProduced: 0,
      };
    }
    return handler(request);
  }

  /** List all registered capabilities */
  listAvailable(): Capability[] {
    return Array.from(this.handlers.keys());
  }

  /** Check if a capability is registered */
  has(capability: Capability): boolean {
    return this.handlers.has(capability);
  }
}

// ─── Built-in Handler Factories ──────────────────────────────────────────────

/** Default γ cost per capability request (small — just routing overhead) */
const DEFAULT_GAMMA_COST = 0.005;

/** Default η produced per successful request */
const DEFAULT_ETA_PRODUCED = 0.003;

/** Catalog entry for search handler */
interface CatalogEntry {
  name: string;
  description: string;
  tags: string[];
}

/** Built-in pattern catalog (simulates SHOAL search results) */
const CATALOG: CatalogEntry[] = [
  {
    name: 'conservation-governor',
    description: 'PID controller driving γ → C/2 with ternary substrate',
    tags: ['governor', 'pid', 'conservation', 'control'],
  },
  {
    name: 'fleet-spawn',
    description: 'Dynamic agent spawning with budget enforcement',
    tags: ['spawn', 'agent', 'fleet', 'scale'],
  },
  {
    name: 'ternary-validator',
    description: 'Validates signals on {-1, 0, +1} substrate',
    tags: ['validate', 'ternary', 'signal'],
  },
  {
    name: 'convergence-calculator',
    description: 'Computes δ(n) = (1/√n)(1 − 3/(2n)) convergence rate',
    tags: ['convergence', 'math', 'scale'],
  },
  {
    name: 'framework-wrapper',
    description: 'Wraps external agents with conservation governance',
    tags: ['wrapper', 'openai', 'langgraph', 'crewai'],
  },
  {
    name: 'rate-limiter',
    description: 'Ternary rate limiter for fleet API calls',
    tags: ['rate', 'limiter', 'throttle'],
  },
  {
    name: 'circuit-breaker',
    description: 'Conservation-aware circuit breaker for agent execution',
    tags: ['circuit', 'breaker', 'safety'],
  },
];

/**
 * Search handler — provides SHOAL semantic search results.
 * Works offline with a built-in pattern catalog.
 */
export function createSearchHandler(): CapabilityHandler {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const query = String(req.params.query ?? '').toLowerCase();
    const topK = Number(req.params.topK ?? 3);

    if (!query) {
      return {
        success: false,
        error: 'Missing required param: query',
        gammaCost: DEFAULT_GAMMA_COST,
        etaProduced: 0,
      };
    }

    // Simple keyword matching against the catalog
    const results = CATALOG
      .map((item) => {
        const nameMatch = item.name.includes(query) ? 2 : 0;
        const descMatch = item.description.toLowerCase().includes(query) ? 1 : 0;
        const tagMatch = item.tags.some((t) => t.includes(query)) ? 1.5 : 0;
        const score = nameMatch + descMatch + tagMatch;
        return { item, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((r) => r.item);

    return {
      success: true,
      data: { query, results, count: results.length },
      gammaCost: DEFAULT_GAMMA_COST,
      etaProduced: DEFAULT_ETA_PRODUCED,
    };
  };
}

/**
 * Budget handler — returns the agent's remaining γ budget and fleet conservation.
 */
export function createBudgetHandler(fleet: Fleet): CapabilityHandler {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const agent = fleet.getAgent(req.agentId);
    if (!agent) {
      return {
        success: false,
        error: `Agent '${req.agentId}' not found in fleet`,
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    const conservation = fleet.getConservation();
    const state = agent.getState();

    return {
      success: true,
      data: {
        agentId: req.agentId,
        agentName: state.name,
        gammaBudget: agent.gammaBudget,
        gammaUsed: state.gammaUsed,
        gammaRemaining: agent.getBudget(),
        etaProduced: state.etaProduced,
        fleetConservation: conservation,
      },
      gammaCost: 0, // Budget check is free
      etaProduced: 0,
    };
  };
}

/**
 * Validate handler — validates ternary signals on {-1, 0, +1} substrate.
 * Checks that signals are valid ternary values and computes aggregate signal.
 */
export function createValidateHandler(): CapabilityHandler {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const signals = req.params.signals as unknown;

    if (!Array.isArray(signals)) {
      return {
        success: false,
        error: 'Missing or invalid param: signals (expected array)',
        gammaCost: DEFAULT_GAMMA_COST,
        etaProduced: 0,
      };
    }

    // Validate each signal is in {-1, 0, +1}
    const invalid: number[] = [];
    for (let i = 0; i < signals.length; i++) {
      const s = signals[i];
      if (s !== -1 && s !== 0 && s !== 1) {
        invalid.push(i);
      }
    }

    if (invalid.length > 0) {
      return {
        success: false,
        error: `Invalid ternary signals at indices: ${invalid.join(', ')}. Values must be -1, 0, or +1.`,
        data: { invalidIndices: invalid },
        gammaCost: DEFAULT_GAMMA_COST,
        etaProduced: 0,
      };
    }

    // Compute aggregate signal
    const sum: number = signals.reduce((acc: number, s: number) => acc + s, 0);
    const aggregate: number = signals.length > 0
      ? Math.sign(sum)
      : 0;

    return {
      success: true,
      data: {
        signals,
        count: signals.length,
        sum,
        aggregate,
        valid: true,
      },
      gammaCost: DEFAULT_GAMMA_COST,
      etaProduced: DEFAULT_ETA_PRODUCED,
    };
  };
}

/**
 * Conserve handler — checks the conservation invariant γ + η ≤ C.
 */
export function createConserveHandler(fleet: Fleet): CapabilityHandler {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const conservation = fleet.getConservation();

    // Check if custom γ/η values were provided for what-if analysis
    const customGamma = req.params.gamma as number | undefined;
    const customEta = req.params.eta as number | undefined;

    if (customGamma !== undefined && customEta !== undefined) {
      const capVal = conservation.C;
      const total = customGamma + customEta;
      const delta = capVal - total;
      const wouldViolate = delta < 0;

      return {
        success: true,
        data: {
          scenario: 'what-if',
          gamma: customGamma,
          eta: customEta,
          C: capVal,
          delta,
          wouldViolate,
          status: delta < 0 ? 'violated' : delta < 0.1 ? 'tight' : delta < 0.3 ? 'monitor' : 'healthy',
        },
        gammaCost: 0,
        etaProduced: 0,
      };
    }

    // Return current conservation state
    return {
      success: true,
      data: {
        scenario: 'current',
        gamma: conservation.gamma,
        eta: conservation.eta,
        C: conservation.C,
        delta: conservation.delta,
        status: conservation.status,
        invariantHolds: conservation.delta >= 0,
      },
      gammaCost: 0,
      etaProduced: 0,
    };
  };
}

/**
 * Status handler — returns fleet status snapshot.
 */
export function createStatusHandler(fleet: Fleet): CapabilityHandler {
  return async (_req: CapabilityRequest): Promise<CapabilityResponse> => {
    const status = fleet.status();
    return {
      success: true,
      data: status,
      gammaCost: 0,
      etaProduced: 0,
    };
  };
}

/**
 * Report handler — agents report their results back to the fleet.
 * Records γ/η and makes the result available.
 */
export function createReportHandler(fleet: Fleet): CapabilityHandler {
  return async (req: CapabilityRequest): Promise<CapabilityResponse> => {
    const gamma = Number(req.params.gamma ?? 0);
    const eta = Number(req.params.eta ?? 0);

    if (gamma > 0 || eta > 0) {
      fleet.recordTask(gamma, eta);
    }

    return {
      success: true,
      data: {
        recorded: true,
        gamma,
        eta,
        conservation: fleet.getConservation(),
      },
      gammaCost: 0,
      etaProduced: 0,
    };
  };
}
