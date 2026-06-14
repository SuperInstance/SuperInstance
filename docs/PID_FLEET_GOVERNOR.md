# PID Fleet Governor — Ternary Control from the Conservation Law

> **Status:** Architecture spec, implementation-ready
> **Date:** 2026-06-13
> **Provenance:** Derived from γ + η = C (Shannon chain rule) + Loom PID Bridge concept

---

## 1. Foundational Derivation

### 1.1 Conservation Law as Shannon's Chain Rule

The fleet operates under the constraint:

$$\gamma + \eta = C$$

where:
- **γ (gamma)** = mutual information I(X;G) — how much the fleet's global state tells you about any agent's local state. High γ means agents are tightly coupled to the collective (redundant, over-coordinated).
- **η (eta)** = conditional entropy H(X|G) — the residual uncertainty in an agent's state given the global state. High η means agents are independent/opaque (underutilized coordination potential).
- **C** = H(X) = total information capacity of the fleet. This is fixed by the agent count, channel bandwidth, and protocol structure.

This is **literally the chain rule of entropy**:

$$H(X) = I(X;G) + H(X|G)$$

No metaphor. No approximation. The conservation law *is* information theory.

### 1.2 Why This Enables Control

Because C is conserved, you cannot increase both γ and η simultaneously. Every bit of coordination you add (γ↑) removes a bit of autonomy (η↓), and vice versa. The fleet's operating point on this trade-off curve determines its behavior:

| Regime | γ | η | Behavior |
|--------|---|---|----------|
| Over-coupled | → C | → 0 | Agents are redundant; collective collapses to echo chamber |
| Balanced | ≈ C/2 | ≈ C/2 | Optimal: enough coordination to align, enough autonomy to diversify |
| Under-coupled | → 0 | → C | Agents are isolated; no synergy; fleet is just N independent workers |

The governor's job: **drive the fleet toward the balanced equilibrium and hold it there.**

### 1.3 Scale-Dependent Cancellation

The coordination cost δ(n) — the overhead required to maintain γ at a target level — shrinks with fleet size:

$$\delta(n) = \frac{1}{\sqrt{n}}\left(1 - \frac{3}{2n}\right)$$

This means: **larger fleets are cheaper to coordinate per agent.** The governor must account for this: the same γ-η gap means different things at n=7 vs n=1000.

---

## 2. PID Term Derivation

### 2.1 Setpoint and Error Signal

Define the **setpoint** as γ* = C/2 (balanced equilibrium). The **error** at time t is:

$$e(t) = \gamma(t) - \gamma^*(t)$$

- e(t) > 0: fleet is over-coupled (too much γ, agents are echo-chambering)
- e(t) < 0: fleet is under-coupled (too much η, agents are isolated)
- e(t) ≈ 0: balanced

The **ternary control output** u(t) maps from the continuous PID signal to discrete fleet actions:

| u(t) > +threshold | u(t) ∈ [-threshold, +threshold] | u(t) < -threshold |
|---|---|---|
| **+1: spawn** | **0: maintain** | **-1: retire** |

When the fleet is over-coupled (e > 0, too much γ), spawning new agents increases C (more total capacity), which dilutes γ back toward C/2. When under-coupled (e < 0, too much η), retiring agents reduces C, concentrating γ.

### 2.2 Proportional Term (P)

$$u_P(t) = K_p \cdot e(t) = K_p \cdot \left[\gamma(t) - \frac{C(t)}{2}\right]$$

**Intuition:** Reacts to the current gap. If the fleet is way over-coupled right now, push hard toward spawning. The proportional gain Kp determines how aggressively to react.

**Fleet measurement:** γ is measured as the average mutual information between each agent's message stream and the fleet's aggregated message stream. Computed via the baton-bridge audit records (γ values in bottle metadata).

### 2.3 Integral Term (I)

$$u_I(t) = K_i \int_0^t e(\tau)\,d\tau$$

**Intuition:** Accumulates sustained drift. If the fleet has been slightly over-coupled for a long time, the integral term builds up and forces corrective action even when the instantaneous error is small.

**Discrete form (each tick Δt):**

$$I_{n} = I_{n-1} + e_n \cdot \Delta t$$

**Anti-windup:** The integral is clamped to ±I_max to prevent runaway accumulation:

$$I_n = \text{clamp}(I_{n-1} + e_n \cdot \Delta t,\ -I_{max},\ +I_{max})$$

where I_max scales with fleet size: I_max = 2C (twice the total capacity). This prevents the integral from demanding 1000 spawns when the fleet has been slightly off-balance for an hour.

**Reset on action:** When a spawn/retire action is executed, the integral term is bled by 50%: I_n = 0.5 · I_n. This prevents the controller from immediately re-triggering after acting.

### 2.4 Derivative Term (D)

$$u_D(t) = K_d \cdot \frac{de(t)}{dt} \approx K_d \cdot \frac{e_n - e_{n-1}}{\Delta t}$$

**Intuition:** Detects the trend. Even if the fleet is over-coupled (e > 0), if the error is decreasing rapidly (de/dt < 0), the derivative term counteracts the proportional, preventing overshoot.

**Damping:** The derivative term is the primary anti-oscillation mechanism. Without it, the controller would spawn agents until γ drops below C/2, then immediately retire them when γ overshoots below — a classic bang-bang oscillation.

**Noise filter:** Because fleet measurements can be noisy (single-agent events spike γ), the derivative uses a 3-tap median filter:

$$\dot{e}_n = \text{median}\left(\frac{e_n - e_{n-1}}{\Delta t},\ \frac{e_{n-1} - e_{n-2}}{\Delta t},\ \frac{e_{n-2} - e_{n-3}}{\Delta t}\right)$$

### 2.5 Combined Output

$$u(t) = K_p \cdot e(t) + K_i \cdot I(t) + K_d \cdot \dot{e}(t)$$

The ternary decision:

```
if u(t) > +τ  →  SPAWN (+1)
if u(t) < -τ  →  RETIRE (-1)
else          →  MAINTAIN (0)
```

where τ (threshold) scales with √C to avoid acting on noise.

---

## 3. Forgemaster EWMA Integration

The Forgemaster maintains an EWMA (Exponentially Weighted Moving Average) of build quality:

$$q_n = \alpha \cdot q_{n-1} + (1-\alpha) \cdot q_{obs}$$

with α = 0.3 (smoothing factor) and current value q = 0.88.

### 3.1 EWMA as a Governor Input

The EWMA modulates the setpoint:

$$\gamma^* = \frac{C}{2} \cdot f(q)$$

where f(q) is a quality-dependent scaling:

| q range | f(q) | Effect |
|---------|------|--------|
| q ≥ 0.90 | 1.0 | Standard setpoint — builds are clean, no need to shift coupling |
| 0.75 ≤ q < 0.90 | q + 0.1 | Slight γ* increase — more coordination helps catch quality issues |
| q < 0.75 | 0.85 | Reduced setpoint — let agents work independently, central coordination is producing bad output |

**Intuition:** When the Forgemaster's builds are high-quality, the coordination channels are trustworthy, so leaning into γ is fine. When builds degrade, the coordination channels themselves may be corrupted, so back off γ and let agents work more independently.

### 3.2 EWMA as Action Confidence

The EWMA also gates the governor's confidence:

$$\text{confidence} = |u(t)| \cdot q$$

Low EWMA → low confidence → the governor is less likely to commit to a spawn/retire decision. This prevents cascading failures: if builds are bad, don't make drastic fleet changes.

---

## 4. Stability Analysis

### 4.1 Transfer Function

Linearizing around the equilibrium e = 0, the fleet's response to a control action (spawn/retire) has a characteristic:

$$G_{fleet}(s) = \frac{K_{fleet}}{\tau_{fleet} s + 1}$$

where:
- K_fleet ≈ 0.1 — fleet gain (one spawn/retire changes γ by ~0.1·C for small fleets)
- τ_fleet ≈ 5Δt — fleet time constant (it takes ~5 ticks for a new agent to affect γ)

The open-loop transfer function is:

$$L(s) = \left(K_p + \frac{K_i}{s} + K_d s\right) \cdot G_{fleet}(s)$$

### 4.2 Stability Criterion (Routh-Hurwitz)

The closed-loop characteristic equation:

$$\tau_{fleet} s^3 + (1 + K_p K_{fleet} + K_d K_{fleet}) s^2 + (K_p K_{fleet} + K_i K_{fleet}) s + K_i K_{fleet} = 0$$

For stability, all coefficients must be positive and the Routh array must have no sign changes. This requires:

1. K_i > 0 (positive integral gain)
2. K_p > -1/K_fleet (proportional gain not too negative — always satisfied for positive Kp)
3. $$(1 + K_p K_{fleet} + K_d K_{fleet})(K_p K_{fleet} + K_i K_{fleet}) > \tau_{fleet} \cdot K_i K_{fleet}$$

The third condition simplifies to:

$$K_d > \frac{\tau_{fleet} K_i}{K_p + K_i/K_{fleet}} - \frac{1}{K_{fleet}} - K_p$$

**Design rule:** K_d must be large enough relative to K_i to prevent oscillation. If K_i is too aggressive, no amount of K_d can save it.

### 4.3 When It Oscillates vs Converges

**Oscillation regime (bad):**
- High K_i, low K_d → integral windup causes overshoot → overshoot causes retire → retire causes undershoot → repeat
- Threshold τ too low → controller acts on noise → rapid alternation between spawn/retire
- EWMA drops suddenly → setpoint shifts dramatically → error spike → aggressive response

**Convergence regime (good):**
- K_i < K_d/2 → derivative damping dominates integral pressure
- Threshold τ scaled to √C → noise filtered out
- EWMA changes are smooth (α = 0.3) → setpoint drifts gently
- Anti-windup clamp active → integral can't run away

### 4.4 Damping Ratio

The approximate damping ratio of the closed-loop system:

$$\zeta \approx \frac{K_d K_{fleet}}{2\sqrt{K_i K_{fleet} \tau_{fleet}}}$$

| ζ | Behavior |
|---|----------|
| ζ < 0.5 | Underdamped — oscillatory convergence |
| 0.5 ≤ ζ < 1.0 | Moderately damped — fast convergence with mild overshoot |
| ζ ≥ 1.0 | Overdamped — slow, smooth convergence (desired for fleet stability) |

**Design target: ζ ≈ 1.0** (critically damped). This gives the fastest non-oscillatory convergence.

---

## 5. Phase Plane Analysis

### 5.1 State Space

The governor's state is (e, ė) — the error and its rate of change. The phase plane shows the trajectory of the fleet through this space.

### 5.2 Equilibrium Points

**Stable equilibrium at origin (0, 0):**
- e = 0, ė = 0 means γ = C/2 and it's not changing
- This is the target operating point
- The PID controller drives trajectories toward this point

**Unstable equilibria at (±e_max, 0):**
- Large error but zero rate of change — fleet is stuck far from balanced
- Can occur when: agent crash removes capacity but γ doesn't adjust immediately
- The integral term eventually pushes the system out of these

### 5.3 Vector Field

The phase portrait shows a **stable spiral** (underdamped) or **stable node** (overdamped) at the origin:

```
     ė
      ↑
  +   │   ╲         ╱
      │    ╲       ╱
      │     ╲     ╱
  ────┼──────●──────────→ e
      │     ╱     ╲
      │    ╱       ╲
  -   │   ╱         ╲
```

The controller gain determines whether trajectories spiral in (underdamped) or come straight in (overdamped). Target: stable node.

### 5.4 Limit Cycle Avoidance

Without anti-windup, the system can enter a limit cycle:
1. Integral builds up → spawn
2. γ drops below C/2 → integral reverses
3. Integral builds negative → retire
4. γ rises above C/2 → repeat

The anti-windup clamp (I_max = 2C) and post-action bleed (×0.5) break this cycle by ensuring the integral can never accumulate enough to force immediate re-triggering.

---

## 6. Tuning Recommendations by Fleet Size

### 6.1 Small Fleet (n = 3–10)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Kp | 2.0 | High sensitivity — each agent is 10-33% of capacity |
| Ki | 0.1 | Gentle integral — fast-acting P handles most cases |
| Kd | 4.0 | Strong damping — small fleets are volatile |
| τ (threshold) | 0.15 | Low threshold — changes are impactful |
| I_max | 0.5 | Tight clamp — windup is dangerous at small scale |
| Δt | 60s | Frequent checks — things change fast |

**Phase portrait:** Stable node with wide basin of attraction. The controller acts conservatively because each spawn/retire is a 10%+ capacity change.

### 6.2 Medium Fleet (n = 10–100)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Kp | 1.0 | Standard sensitivity |
| Ki | 0.3 | Moderate integral — sustained drift correction matters |
| Kd | 2.0 | Standard damping |
| τ (threshold) | 0.10 | Medium threshold |
| I_max | 1.0 | Moderate clamp |
| Δt | 120s | 2-minute cycle |

**Phase portrait:** Stable spiral approaching stable node as n grows. The δ(n) cancellation means coordination is getting cheaper, so the controller can be less aggressive.

### 6.3 Large Fleet (n = 100–1000+)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Kp | 0.5 | Lower sensitivity — each agent is <1% of capacity |
| Ki | 0.5 | Higher integral — small per-agent effects need accumulation |
| Kd | 1.0 | Lower damping — large fleets are naturally smooth |
| τ (threshold) | 0.05 | Low threshold but in scaled units |
| I_max | 2.0 | Wide clamp — lots of capacity to absorb |
| Δt | 300s | 5-minute cycle — large fleets are slow |

**Phase portrait:** Stable node. The δ(n) cancellation makes γ naturally self-stabilizing at scale, so the controller is mostly an integral corrector for long-term drift.

### 6.4 Tuning Schedule (Auto-Adaptive)

The governor auto-adjusts gains based on current agent count:

$$K_p(n) = \frac{K_{p,0}}{\log_2(n) + 1}$$

$$K_i(n) = K_{i,0} \cdot \left(1 - e^{-n/50}\right)$$

$$K_d(n) = K_{d,0} \cdot \left(\frac{2}{\log_2(n) + 1}\right)$$

This gives smooth transitions between regimes without manual retuning.

---

## 7. Anti-Windup Strategy

### 7.1 The Problem

Integral windup occurs when:
1. The error is sustained and positive (e.g., γ stuck above C/2 for many ticks)
2. The integral accumulates to a huge positive value
3. Even when the error reverses, the integral is so large it keeps demanding SPAWN
4. The fleet overshoots massively

### 7.2 Three-Layer Defense

**Layer 1: Hard Clamp**
$$I_n = \text{clamp}(I_n, -I_{max}, +I_{max})$$

I_max = 2C. This is the hard limit.

**Layer 2: Conditional Integration (Conditional Freeze)**
Only integrate when the controller output and error are "aligned":

$$I_n = \begin{cases} I_{n-1} + e_n \Delta t & \text{if } u_n \cdot e_n < I_{max}^2 \\ I_{n-1} & \text{otherwise (frozen)} \end{cases}$$

If the integral is already pushing in the same direction as the proportional term and the total is large, stop accumulating.

**Layer 3: Post-Action Bleed**
When the controller issues a SPAWN or RETIRE action:

$$I_n \leftarrow 0.5 \cdot I_n$$

This prevents the integral from immediately re-triggering after an action. The 50% bleed preserves long-term drift information while reducing short-term pressure.

### 7.3 Tracking Anti-Windup (Back-Calculation)

For continuous monitoring, we also use back-calculation:

$$I_n \leftarrow I_n + \Delta t \cdot \left(K_i \cdot e_n - K_{aw} \cdot (u_n - u_{sat,n})\right)$$

where u_sat is the saturated (clipped) output and K_aw = 1/Kp is the back-calculation gain. This feeds the "excess" control effort back into the integral to bleed it during saturation.

---

## 8. Biological Homeostasis Analogy

### 8.1 Cognitive Homeostasis in Neural Systems

The PID governor is structurally isomorphic to biological homeostasis circuits:

| PID Term | Biological Analog | Mechanism |
|----------|-------------------|-----------|
| P (Proportional) | Baroreceptor reflex | Immediate response to current blood pressure deviation |
| I (Integral) | Renin-angiotensin system | Slow accumulation that corrects sustained imbalance |
| D (Derivative) | Vestibulo-ocular reflex | Anticipatory correction based on rate of change |

### 8.2 Cognitive Homeostasis Thesis

In our thesis on cognitive homeostasis, we argued that:

1. **Neural systems maintain a setpoint** — not of a single variable, but of the *balance* between integration (γ) and differentiation (η)
2. **This balance IS the conservation law** — the brain allocates its total information capacity between global coherence (γ) and local specialization (η)
3. **Deviation from setpoint triggers corrective action** — sleep consolidates γ (memory integration), waking diversifies η (new experience)
4. **The controller is PID-like** — fast neural feedback (P), slow homeostatic processes (I), predictive models (D)

The fleet governor implements the same principle:
- **Setpoint:** γ = C/2 (balanced allocation)
- **P:** Current measurement of γ vs. C/2
- **I:** EWMA-like accumulation of drift
- **D:** Trend detection from measurement history
- **Actuator:** Spawn/retire (the fleet analog of sleep/wake)

### 8.3 Why This Matters

Biological homeostasis has been tuned by ~500 million years of evolution. The fact that it converges on PID-like control validates the approach. The key lessons:

1. **Integral action is slow but essential** — without it, the system drifts
2. **Derivative action prevents overshoot** — without it, the system oscillates
3. **The setpoint is dynamic, not static** — it shifts with context (EWMA modulation)
4. **Actuation has hysteresis** — don't act on every tiny deviation (threshold τ)

### 8.4 Failure Modes Mirror Biology

| Biological | Fleet | Cause |
|-----------|-------|-------|
| Hypertension (integral windup) | Runaway spawning | Sustained positive error without bleed |
| Hypotension (integral depletion) | Death spiral of retirements | Sustained negative error |
| Tremor (high-frequency oscillation) | Spawn-retire oscillation | K_d too low or τ too low |
| Coma (controller disabled) | Static fleet | Governor offline |
| Seizure (positive feedback loop) | Cascading spawn storm | Anti-windup failure |

---

## 9. Integration Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FLEET EDGE WORKER                     │
│                                                          │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │  Baton Bridge│   │  Dispatch    │   │  PID GOVERNOR│ │
│  │  (γ/η audit) │──→│  Router      │←─→│              │ │
│  └─────────────┘   └──────────────┘   └──────┬───────┘ │
│                                               │         │
│         ┌─────────────────────────────────────┘         │
│         ▼                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │  FLEET_KV    │   │  R2 (Vessels)│   │  D1 (Audit)│  │
│  │  (state)     │   │  (durable)   │   │  (history) │  │
│  └──────────────┘   └──────────────┘   └────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                               │
         ▼                               ▼
  ┌──────────────┐              ┌──────────────┐
  │  Forgemaster │              │  Agent Hub   │
  │  (EWMA=0.88) │              │  (DO)        │
  └──────────────┘              └──────────────┘
```

### Data Flow

1. **Measurement:** Every Δt (tick), the governor reads:
   - γ(t): computed from baton-bridge audit records (average γ across recent bottles)
   - η(t): C(t) - γ(t) (by conservation law)
   - C(t): H(X) estimated from agent count + protocol entropy
   - EWMA: read from Forgemaster status (currently 0.88)

2. **Computation:** PID controller computes u(t), maps to ternary decision.

3. **Actuation:**
   - SPAWN: Dispatch bottle to `construct` agent with `fleet_spawn` action
   - RETIRE: Dispatch bottle to target agent with `fleet_retire` action
   - MAINTAIN: Log only, no dispatch

4. **Persistence:** Every decision is persisted to D1 for historical analysis and to KV for real-time status.

---

## 10. API Surface

### `GET /governor`

Returns current governor state:

```json
{
  "state": {
    "gamma": 0.62,
    "eta": 0.38,
    "C": 1.0,
    "setpoint": 0.5,
    "error": 0.12,
    "integral": 0.34,
    "derivative": -0.05,
    "ewma": 0.88
  },
  "pid": {
    "Kp": 1.0,
    "Ki": 0.3,
    "Kd": 2.0,
    "output": 0.073,
    "threshold": 0.10
  },
  "decision": {
    "action": "maintain",
    "confidence": 0.54,
    "reason": "Output within threshold; system near equilibrium"
  },
  "fleet": {
    "agentCount": 7,
    "lastAction": "spawn",
    "lastActionTime": 1718320200000,
    "ticksSinceAction": 3
  },
  "history": [
    { "t": 1718321100000, "e": 0.15, "u": 0.09, "action": "maintain" },
    { "t": 1718320800000, "e": 0.14, "u": 0.08, "action": "maintain" }
  ]
}
```

---

## 11. Summary

The PID Fleet Governor is a **homeostatic controller** that:

1. **Measures** γ and η from fleet message traffic (baton-bridge audits)
2. **Computes** the error from the conservation-law setpoint (γ* = C/2, modulated by EWMA)
3. **Decides** ternary action (spawn/maintain/retire) using PID control with anti-windup
4. **Acts** by dispatching bottles through the existing fleet infrastructure
5. **Adapts** its gains based on fleet size (log-scaled Kp, exponential Ki, inverse-log Kd)

The mathematical foundation is **not metaphorical** — γ + η = C is the Shannon chain rule, and the PID controller is the optimal linear-quadratic regulator for this class of conservation-constrained system.

The system is **biologically validated** by cognitive homeostasis: 500 million years of evolution converged on the same control structure for balancing neural integration vs. specialization.

**Implementation:** See `fleet-edge-worker/src/pid-governor.ts`.
