// ─── SuperInstance Core Types ───────────────────────────────────────────────
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
// Convergence: δ(n) = (1/√n)(1 - 3/(2n))
//

/** Conservation state — the health snapshot of a fleet */
export interface ConservationState {
  /** γ — coupling cost (compute invested in coordination) */
  gamma: number;
  /** η — value produced (useful output) */
  eta: number;
  /** C — capacity (always log₂(3) ≈ 1.585) */
  C: number;
  /** δ — remaining budget: C − (γ + η) */
  delta: number;
  /** Fleet health status */
  status: 'healthy' | 'monitor' | 'tight' | 'violated';
}

// ─── Agent Types ─────────────────────────────────────────────────────────────

export type AgentRole = 'builder' | 'researcher' | 'validator' | 'deployer' | 'orchestrator';

export type AgentPhase = 'active' | 'standby' | 'incubate' | 'sunset';

export interface AgentConfig {
  name?: string;
  role: AgentRole;
  /** Maximum γ this agent can consume */
  gammaBudget: number;
}

export interface AgentState {
  id: string;
  name: string;
  role: AgentRole;
  phase: AgentPhase;
  gammaUsed: number;
  etaProduced: number;
  conservationRemaining: number;
}

// ─── Task Types ──────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  description: string;
  estimatedGamma: number;
  estimatedEta: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  gammaUsed: number;
  etaProduced: number;
  output: string;
  conservationCheck: ConservationState;
}

// ─── Fleet Types ─────────────────────────────────────────────────────────────

export interface FleetStatus {
  name: string;
  agentCount: number;
  activeAgents: number;
  conservation: ConservationState;
  agents: AgentState[];
  convergenceDelta: number;
  uptime: number;
}

// ─── Governor Types ──────────────────────────────────────────────────────────

export interface GovernorConfig {
  /** Target γ/C ratio (default 0.5 = balanced) */
  setpoint: number;
  /** Proportional gain */
  Kp: number;
  /** Integral gain */
  Ki: number;
  /** Derivative gain */
  Kd: number;
  /** Minimum error to act on (prevents jitter) */
  deadband: number;
}

export interface GovernorDecision {
  action: 'release' | 'throttle' | 'spawn' | 'merge' | 'hold';
  targetAgent?: string;
  magnitude: number;
  reason: string;
  conservation: ConservationState;
}

// ─── Wrapper Types ───────────────────────────────────────────────────────────

export interface WrappableAgent {
  name: string;
  execute: (task: string) => Promise<string>;
  framework?: string;
}

export interface WrappedAgent {
  name: string;
  role: AgentRole;
  execute: (task: string) => Promise<TaskResult>;
  getState(): AgentState;
  framework: string;
}
