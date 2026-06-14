// ─── SuperInstance Conservation PID Governor ─────────────────────────────────
//
// Drives γ → C/2 (balanced equilibrium) using a ternary PID controller.
// Enforces the conservation law: γ + η ≤ C where C = log₂(3) ≈ 1.585.
//
// The ternary substrate {-1, 0, +1} maps to control actions:
//   -1 → throttle (reduce γ)
//    0 → hold (within deadband)
//   +1 → release (increase γ)
//
/** Default governor configuration — balanced operation at γ/C = 0.5 */
const DEFAULT_CONFIG = {
    setpoint: 0.5, // Target γ/C ratio
    Kp: 0.8, // Proportional gain
    Ki: 0.15, // Integral gain
    Kd: 0.25, // Derivative gain
    deadband: 0.03, // 3% deadband — prevents jitter
};
/** Anti-windup clamp for integral term */
const INTEGRAL_CLAMP = 1.0;
/** Low-pass filter coefficient for derivative term */
const DERIVATIVE_FILTER_ALPHA = 0.3;
/**
 * Governor — PID controller that drives fleet γ toward the setpoint.
 *
 * The controller treats γ/C ratio as the process variable and outputs
 * ternary control decisions: throttle (-1), hold (0), or release (+1).
 */
export class Governor {
    config;
    integral = 0;
    prevError = 0;
    derivativeFiltered = 0;
    initialized = false;
    constructor(config) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    /** C = log₂(3) — the conservation capacity constant */
    getC() {
        return Math.log2(3);
    }
    /**
     * δ(n) = (1/√n)(1 − 3/(2n)) — convergence rate.
     * Measures how coordination overhead shrinks with fleet size.
     * At n=10: δ≈0.29 (66% cancellation)
     * At n=100: δ≈0.097 (90% cancellation)
     * At n=10000: δ≈0.0097 (99% cancellation)
     */
    getConvergence(n) {
        if (n <= 0)
            return Infinity;
        if (n < 3)
            return 1; // Below 3 agents, full overhead
        return (1 / Math.sqrt(n)) * (1 - 3 / (2 * n));
    }
    /**
     * Observe the fleet and compute conservation state.
     * Returns the current γ/η/C/delta/status snapshot.
     */
    observe(state) {
        const C = this.getC();
        const total = state.gamma + state.eta;
        const delta = C - total;
        let status;
        if (delta < 0) {
            status = 'violated';
        }
        else if (delta < 0.1) {
            status = 'tight';
        }
        else if (delta < 0.3) {
            status = 'monitor';
        }
        else {
            status = 'healthy';
        }
        return {
            gamma: state.gamma,
            eta: state.eta,
            C,
            delta,
            status,
        };
    }
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
    decide(state) {
        const C = this.getC();
        const conservation = this.observe(state);
        // Hard conservation check — if violated, immediate throttle
        if (conservation.delta < 0) {
            return {
                action: 'throttle',
                targetAgent: undefined,
                magnitude: Math.min(1, Math.abs(conservation.delta)),
                reason: `Conservation violated: γ + η = ${(state.gamma + state.eta).toFixed(4)} > C = ${C.toFixed(4)}`,
                conservation,
            };
        }
        // PID control on γ/C ratio
        const ratio = state.gamma / C;
        const error = this.config.setpoint - ratio;
        // Proportional term
        const pTerm = this.config.Kp * error;
        // Integral term with anti-windup
        this.integral += error;
        this.integral = Math.max(-INTEGRAL_CLAMP, Math.min(INTEGRAL_CLAMP, this.integral));
        const iTerm = this.config.Ki * this.integral;
        // Derivative term with low-pass filter
        let dTerm;
        if (!this.initialized) {
            this.derivativeFiltered = 0;
            this.initialized = true;
            dTerm = 0;
        }
        else {
            const rawDerivative = error - this.prevError;
            this.derivativeFiltered =
                DERIVATIVE_FILTER_ALPHA * rawDerivative +
                    (1 - DERIVATIVE_FILTER_ALPHA) * this.derivativeFiltered;
            dTerm = this.config.Kd * this.derivativeFiltered;
        }
        this.prevError = error;
        // PID output
        const output = pTerm + iTerm + dTerm;
        // Map to ternary decision with deadband
        let action;
        let reason;
        if (output > this.config.deadband) {
            // Positive output → γ below setpoint → release budget
            action = 'release';
            // Check if we have room to spawn
            const convergence = this.getConvergence(state.agentCount);
            if (conservation.delta > 0.3 && convergence < 0.2) {
                action = 'spawn';
                reason = `Sufficient headroom (δ=${conservation.delta.toFixed(4)}) and good convergence (δ(n)=${convergence.toFixed(4)}) — recommend spawning agent`;
            }
            else {
                reason = `γ/C=${ratio.toFixed(3)} below setpoint ${this.config.setpoint} — releasing budget (PID output: ${output.toFixed(4)})`;
            }
        }
        else if (output < -this.config.deadband) {
            // Negative output → γ above setpoint → throttle
            action = 'throttle';
            reason = `γ/C=${ratio.toFixed(3)} above setpoint ${this.config.setpoint} — throttling (PID output: ${output.toFixed(4)})`;
        }
        else {
            // Within deadband → hold
            action = 'hold';
            reason = `γ/C=${ratio.toFixed(3)} within deadband ±${this.config.deadband} of setpoint — holding`;
        }
        // Special case: if fleet is small and healthy, suggest spawning
        if (action === 'release' && state.agentCount < 3 && conservation.delta > 0.5) {
            action = 'spawn';
            reason = `Small fleet (${state.agentCount} agents) with large headroom (δ=${conservation.delta.toFixed(4)}) — recommend spawning`;
        }
        // Special case: if fleet is large and tight, suggest merging
        if (action === 'throttle' && state.agentCount > 7 && conservation.delta < 0.2) {
            action = 'merge';
            reason = `Large fleet (${state.agentCount} agents) approaching capacity (δ=${conservation.delta.toFixed(4)}) — recommend merging agents`;
        }
        return {
            action,
            targetAgent: undefined,
            magnitude: Math.abs(output),
            reason,
            conservation,
        };
    }
    /** Reset the PID controller state (integral, derivative) */
    reset() {
        this.integral = 0;
        this.prevError = 0;
        this.derivativeFiltered = 0;
        this.initialized = false;
    }
}
//# sourceMappingURL=governor.js.map