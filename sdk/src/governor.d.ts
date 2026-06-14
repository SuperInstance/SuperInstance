import type { ConservationState, GovernorConfig, GovernorDecision } from './types.js';
/**
 * Governor — PID controller that drives fleet γ toward the setpoint.
 *
 * The controller treats γ/C ratio as the process variable and outputs
 * ternary control decisions: throttle (-1), hold (0), or release (+1).
 */
export declare class Governor {
    readonly config: GovernorConfig;
    private integral;
    private prevError;
    private derivativeFiltered;
    private initialized;
    constructor(config?: Partial<GovernorConfig>);
    /** C = log₂(3) — the conservation capacity constant */
    getC(): number;
    /**
     * δ(n) = (1/√n)(1 − 3/(2n)) — convergence rate.
     * Measures how coordination overhead shrinks with fleet size.
     * At n=10: δ≈0.29 (66% cancellation)
     * At n=100: δ≈0.097 (90% cancellation)
     * At n=10000: δ≈0.0097 (99% cancellation)
     */
    getConvergence(n: number): number;
    /**
     * Observe the fleet and compute conservation state.
     * Returns the current γ/η/C/delta/status snapshot.
     */
    observe(state: {
        gamma: number;
        eta: number;
        agentCount: number;
    }): ConservationState;
    /**
     * Decide what action to take based on current state.
     * Uses PID control to drive γ/C → setpoint.
     *
     * PID terms:
     *   P = Kp * error
     *   I = Ki * integral (anti-windup clamped)
     *   D = Kd * derivative (low-pass filtered)
     *
     * Output maps to ternary decisions:
     *   output > deadband  → release (+1)
     *   |output| < deadband → hold (0)
     *   output < -deadband → throttle (-1)
     */
    decide(state: {
        gamma: number;
        eta: number;
        agentCount: number;
    }): GovernorDecision;
    /** Reset the PID controller state (integral, derivative) */
    reset(): void;
}
