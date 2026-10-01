# Edge-First Architecture

> **Version:** 1.0
> **Date:** 2026-07-12
> **Scope:** Energy as primary constraint · Edge runtime · Offline-first · Trawl reference implementation
> **Depends on:** FLUX Bytecode Spec v1.0 · PLATO Wire Protocol v0.1 · Constraint Theory (γ + η = C)

---

## 1. The Energy Law

Energy is to edge AI what location is to real estate — the single constraint that determines everything else.

Every inference costs joules. Every simulation costs joules. Every byte stored costs joules to maintain. The energy budget IS the architecture. This is not a metaphor. A fishing boat has a finite fuel tank. Every trolling hour burns diesel. Every haul costs energy. You can't troll forever. You can't haul infinitely. The energy budget determines where you fish, how long you stay, when you move, and what you can afford to compute while doing it.

Cloud AI exists in a regime of energy abundance. The data center has effectively unlimited power, cooling, and bandwidth. Abundance creates slop — bloated models, redundant API calls, stateless retries, framework overhead nobody measures. Remove the abundance and the slop becomes visible. Remove the abundance and you are forced to build precisely.

**The Edge-First Principle:** If it can't run on a fishing boat, it doesn't belong in the architecture. The boat is the reference environment — limited power, intermittent connectivity, real consequences, physical constraints. Every design decision must survive the question: *does this work at sea with a battery and a spotty satellite link?*

The energy law subsumes the crystallization curve. Moving from fluid inference (η) to crystallized bytecode (γ) is fundamentally an energy optimization — trading expensive joules (LLM inference at ~30W sustained) for cheap joules (FLUX bytecode execution at ~0.1W). The constraint equation γ + η = C still holds, but C is now measured in watts, not dollars. The dollar cost was always a proxy for the energy cost. On the edge, we deal with the real thing.

---

## 2. The Hebbian Infrastructure

Nodes that fire together, wire together. Nodes that are used most get stronger. Connections that carry the most signal get more bandwidth. The system wires itself based on real usage patterns, not planned architecture. This is natural selection at the infrastructure level.

### 2.1 Local Optimization, Global Emergence

There is no central planner. Each node tracks three metrics:

| Metric | Unit | Description |
|--------|------|-------------|
| **Usage frequency** | invocations/hour | How often this node is queried |
| **Response latency** | milliseconds | Wall-clock time from request to response |
| **Energy cost** | joules/op | Measured or estimated energy per invocation |

From these, each node computes its **value/cost ratio**:

```
value_cost = usage_frequency × signal_quality / (energy_cost + latency_penalty)
```

Nodes with high ratios are promoted: more cache space, higher priority in the scheduling queue, permission to spawn helper nodes. Nodes with low ratios atrophy: reduced cache, deferred scheduling, eventual suspension. No coordinator makes this decision — each node optimizes locally, and the global topology emerges from the aggregate of local decisions.

### 2.2 Synaptic Strengthening

This is Hebbian learning applied to infrastructure, not weights. The patterns are:

- **Frequent path → fast path.** If node A frequently queries node B, a direct link is established (local cache, precomputed response, shared memory segment). The hop cost drops to zero.
- **Cold path → lazy path.** If a connection hasn't been used in N ticks, it enters cold storage. Re-establishing it costs more energy, but maintaining it costs nothing. This mirrors neural pruning.
- **High-latency link → async link.** If a connection's latency exceeds a threshold, the protocol switches from synchronous ASK to asynchronous TELL-with-callback. The system degrades gracefully under load.

### 2.3 Implementation in FLUX

The Hebbian layer is implemented as FLUX bytecode — the same VM, the same conservation fences, the same deterministic physics. Each node runs a periodic self-assessment cycle (PLATO alarm-triggered, not threaded):

1. Read local metrics from the history ring buffer
2. Compute value/cost ratio
3. Execute promotion or atrophy FLUX routine
4. Broadcast updated capability vector to neighbors via `BROADCAST`

This is natural selection: the infrastructure adapts to fit the environment it actually operates in, not the environment someone planned for.

---

## 3. The Edge Stack

Six layers, each independently viable. The system works with only Layer 0. Each layer above adds capability but also costs energy. The boat decides how high to stack.

```
  ┌──────────────────────────────────────────────────────────┐
  │  Layer 5 — SYNC (optional, eventual consistency)         │
  │  Matrix fleet sync · cloud mirror · satellite burst      │
  ├──────────────────────────────────────────────────────────┤
  │  Layer 4 — INTERFACE (A2UI)                              │
  │  View generation from local data · no cloud render       │
  ├──────────────────────────────────────────────────────────┤
  │  Layer 3 — COORDINATION (PLATO rooms)                    │
  │  Local rooms · deadband wakefulness · alarm evaluation   │
  ├──────────────────────────────────────────────────────────┤
  │  Layer 2 — CONSERVATION (FLUX fences)                    │
  │  Energy budget enforcement · γ/η tradeoff · cycle limits │
  ├──────────────────────────────────────────────────────────┤
  │  Layer 1 — RUNTIME (local inference)                     │
  │  Quantized models · on-device NLP · distilled reflexes   │
  ├──────────────────────────────────────────────────────────┤
  │  Layer 0 — HARDWARE (whatever is on the boat)            │
  │  Raspberry Pi · Jetson · phone · laptop · ESP32 · sensors│
  └──────────────────────────────────────────────────────────┘
```

### Layer 0 — Hardware

No assumptions. The edge runs on whatever compute is physically present: a Raspberry Pi 5 bolted to the bulkhead, a Jetson Orin powered by the house bank, a crew member's phone, an ESP32 wired to a temperature sensor. Heterogeneous. Replaceable. No single point of failure.

The hardware layer exposes a uniform interface: **I can compute X at Y joules/op with Z ms latency.** The layers above don't care whether that's a GPU or a microcontroller. They care about the energy budget and the deadline.

### Layer 1 — Runtime

Local model inference only. No API calls to the cloud. Models are:

- **Quantized** — INT4/INT8 for inference, small enough to fit in device RAM
- **Distilled** — trained down from larger models, retaining domain-specific competence
- **Specialized** — not general-purpose LLMs, but focused models for specific tasks (catch identification, route optimization, equipment anomaly detection)

When a decision can be crystallized, it moves from Layer 1 (expensive inference) to Layer 2 (cheap bytecode). The crystallization curve bends downward.

### Layer 2 — Conservation

FLUX bytecode fences. The energy budget enforcer lives here. Every operation that wants to execute must pass through the conservation gate:

- Is there energy budget remaining for this tick?
- Is this operation within the γ/η ratio for this agent?
- Is the cycle budget sufficient for this FLUX routine?

When the budget runs low, the gate triages. Low-priority inferences are deferred. Model precision drops (INT8 → INT4 → INT2). Non-critical sync is postponed. The system degrades gracefully — it doesn't crash, it gets simpler.

### Layer 3 — Coordination

PLATO rooms running locally. Agents live in rooms, communicate via the wire protocol, evaluate alarms against sensor history, and actuate responses. No cloud required. Rooms are the social structure of the edge — bounded contexts where agents share knowledge tiles, negotiate over resources, and coordinate action.

Deadband wakefulness is key: agents only wake when something meaningfully changes. A PLATO room on a boat at anchor might tick once per minute. The same room underway might tick ten times per minute. The tick rate adapts to the energy budget and the rate of environmental change.

### Layer 4 — Interface

A2UI (Agent-to-UI) generates views from local data. No cloud rendering, no remote frontend. The interface is composed from local state — sensor readings, catch logs, maps cached offline, model outputs. The crew sees what the system knows, rendered on whatever display is available (phone screen, chartplotter, e-ink tablet, paper printout).

### Layer 5 — Sync

Optional. When connectivity is available (cellular in port, satellite at sea, Wi-Fi at the dock), state syncs to the cloud. This is eventual consistency — the cloud is a mirror, not a master. If the cloud is never available, the system still works. If the cloud is available, the system gets smarter (fleet knowledge sharing, model updates) but does not become dependent.

Sync is burst-oriented: when a connection appears, the system transmits compressed state deltas. When the connection drops, the system continues. There is no "reconnecting..." spinner. There is no offline mode. Offline is the mode.

---

## 4. The Wattage Budget

Every operation has an energy cost. The system maintains a running energy budget enforced by the FLUX conservation layer.

### 4.1 Cost Model

| Operation | Typical Cost | Unit | Notes |
|-----------|-------------|------|-------|
| **Inference** | 0.5–5.0 | joules/token | Scales with model size and quantization |
| **Storage (write)** | 0.001–0.01 | joules/byte | Flash write/erase cycle |
| **Storage (refresh)** | 0.0001 | joules/byte/day | Background refresh, negligible for flash |
| **Network (TX)** | 0.5–50 | joules/packet | Depends on radio (Wi-Fi vs. satellite) |
| **Sensing** | 0.01–0.5 | joules/reading | Depends on sensor type |
| **FLUX execution** | ~0.0001 | joules/instruction | Orders of magnitude cheaper than inference |

These are order-of-magnitude estimates. Real values depend on hardware. The system profiles itself during operation and learns its own costs.

### 4.2 Budget Enforcement

The budget is a conservation law — same FLUX bytecode, same deterministic physics as every other constraint in the system. The enforcement loop:

```
tick:
  budget = measure_available_energy()
  pending = prioritize_operations(budget)
  for op in pending:
    if op.cost <= budget:
      execute(op)
      budget -= op.cost
    else:
      defer_or_drop(op)
  carry_remaining(budget)
```

Prioritization follows a strict hierarchy:

1. **Safety-critical** — navigation, collision avoidance, man-overboard. Always executes.
2. **Operational** — catch logging, quota tracking, equipment monitoring. Executes if budget allows.
3. **Optimization** — route planning, predictive maintenance, model refinement. Executes if budget is comfortable.
4. **Convenience** — UI refresh, cloud sync, analytics. Executes only with surplus budget.

### 4.3 Triage Protocol

When the energy budget falls below a critical threshold, the system triages:

- **Drop model precision** — INT8 → INT4 → INT2. Fewer bits, less energy, lower fidelity. The inference is still made, but with less confidence.
- **Defer non-critical inferences** — batch them for the next charging cycle or shore-power connection.
- **Suspend background learning** — stop distillation and training loops. Preserve energy for inference.
- **Reduce tick rate** — PLATO rooms tick less frequently. Deadband thresholds widen. The system sleeps more.
- **Minimum viable operation** — only safety-critical and quota-tracking functions remain. The system becomes a very expensive clipboard. But it still works.

---

## 5. The Offline-First Principle

The system must function completely offline. Cloud connectivity is a bonus, not a dependency.

### 5.1 What Offline-First Means

| Capability | Cloud-First | Offline-First |
|-----------|-------------|---------------|
| Model inference | API call to GPT/Claude | Local quantized model |
| Data storage | Postgres on RDS | SQLite on device |
| Decision making | Server-side logic | FLUX bytecode, local |
| State management | Server-authoritative | Local-first, CRDT sync |
| UI rendering | SSR/SPA from cloud | A2UI from local state |
| Knowledge | Web search, RAG | Local knowledge tiles, cached |

### 5.2 Design Constraints

Offline-first imposes hard constraints that make the system better even when online:

1. **All models run locally.** Quantized, distilled, small. A 4-bit 3B model that fits in 2GB RAM is worth more than GPT-4 that requires a data center you can't reach.
2. **All data is stored locally.** SQLite databases, flat JSON files, append-only logs. The cloud gets a copy, not the original.
3. **All decisions are made locally.** No blocking on API calls. If the model says "set a course northeast," the system does it. If the cloud later disagrees, the cloud can send a correction — but the decision was already made.
4. **Sync is eventual consistency.** When connection is available, state deltas propagate. Conflicts resolve via Lamport clocks and last-writer-wins per key. The system never waits for sync to complete before acting.

### 5.3 The Connectivity Spectrum

The system is designed for the full spectrum of connectivity:

- **In port (Wi-Fi/cellular):** Full sync, model updates, cloud mirror. The system takes advantage of abundance when it exists.
- **Nearshore (cellular):** Compressed state sync, critical alerts. Reduced bandwidth, selective sync.
- **Offshore (satellite, intermittent):** Burst sync of critical data only. Position reports, catch totals, safety messages. Everything else queues locally.
- **Dark (no connectivity):** Full autonomous operation. All decisions local. Queue for later sync. The system doesn't know it's "offline" because offline is the default.

---

## 6. The Trawl Integration

The commercial fishing operation is the reference use case. If the architecture works on a boat, it works anywhere.

### 6.1 Catch Logging (Energy-Cost-Aware)

Every catch event is logged locally. The log entry includes:

- Species, count, weight (sensor-assisted or manual entry)
- Location (GPS), depth, water temperature
- Gear configuration, bait type, troll speed
- Time (local clock, Lamport-stamped)
- Energy cost of the logging operation itself

The energy-cost field is not decorative. It feeds back into the Hebbian layer: if catch logging is expensive (e.g., running species identification via local vision model), the system explores cheaper alternatives (e.g., manual entry with autocomplete from cached species list). The system optimizes its own operational overhead.

### 6.2 Route Planning (PLATO Pasture)

The PLATO "pasture" concept — knowledge tiles that describe productive fishing grounds — runs entirely locally. Pasture tiles are built from:

- Historical catch data (local SQLite)
- Sea surface temperature (cached satellite data, updated when in range)
- Bathymetry (preloaded charts)
- Tide and current models (computed locally from astronomical tables)
- Recent catch rates by area (fleet knowledge tiles, synced when available)

Route suggestions are generated by local inference (quantized model) and validated by FLUX conservation fences (does the route exceed the fuel budget? does it violate quota constraints?). The captain sees the suggestion on the A2UI display. The decision is the captain's. The system provides inference; the human provides judgment.

### 6.3 Quota Enforcement (Conservation Fence)

Quota tracking is a conservation law enforced by FLUX bytecode. It runs offline, deterministically, on every haul:

1. Read current quota state from local storage
2. Add haul totals (species × count × weight)
3. Compare against regulatory limits (IFQ allocations, stored locally)
4. If quota exceeded → alarm, notification, automatic reporting flag
5. Log the transaction immutably (append-only, hash-chained)

The quota fence cannot be bypassed by a network outage. It is physics — same as the energy budget. The boat can't accidentally overfish because the cloud was down.

### 6.4 Equipment Monitoring (Sensor Data, Local Inference)

Engine temperature, fuel flow, bilge level, refrigeration temperature, GPS heading — all read by PLATO sensors, stored in history ring buffers, evaluated by alarm thresholds. Anomaly detection runs as a local model:

- **Normal operation:** cheap statistical thresholds (deadband). Nearly zero inference cost.
- **Anomaly suspected:** local model inference (quantized, ~1 joules/inference). Identifies probable cause.
- **Critical anomaly:** full diagnostic routine (FLUX bytecode, consults maintenance knowledge tiles). Suggests action.

The escalation from deadband → inference → diagnostic is itself energy-aware. The system doesn't run the expensive model on every sensor reading. It runs the cheap check, and only escalates when the cheap check fails.

### 6.5 Regulatory Compliance (NOAA Reports)

Federal fishing reports (VTR, eLogbook, landing reports) are generated locally from catch log data. The format is deterministic — FLUX bytecode templates produce the required XML/PDF/CSV. Reports are:

1. Generated locally at the end of each trip or haul
2. Stored in an outbound queue
3. Transmitted automatically when connectivity is available (cellular in range, Wi-Fi in port)
4. Hash-chained for tamper evidence

No cloud dependency. The regulator gets the report. The boat gets compliance. The system runs on a battery.

---

## 7. Development on the Edge

R&D is driven by real environment demands, not roadmaps. Features get built because the boat needs them. The wattage budget prevents feature bloat — every feature must justify its energy cost. This is constraint-driven development.

### 7.1 The Energy Gate for New Features

Every proposed feature must answer:

1. **What does it cost in joules?** (per invocation, per hour, per day)
2. **What does it replace?** (if nothing, it's additive cost)
3. **What happens if it's not there?** (if nothing breaks, it's not needed)
4. **Can it crystallize?** (if yes, the cost drops over time)

If a feature can't answer all four questions, it doesn't ship. This is not bureaucracy — it's physics. The energy budget is finite. Every joule spent on a feature nobody uses is a joule not available for a haul.

### 7.2 Constraint-Driven Development

Constraints produce precision. Abundance produces slop. The history of computing demonstrates this repeatedly:

- **Apollo Guidance Computer (4KB RAM):** produced the most reliable software ever written because every byte was contested.
- **Modern web app (unlimited RAM):** produces Electron chat clients that use 2GB.
- **Edge AI (10W budget):** will produce models that are small, focused, and efficient because they have to be.

The edge-first development cycle:

```
observe environment → identify need → build minimum feature
    → measure energy cost → iterate until cost/quality ratio is acceptable
    → crystallize into bytecode → move on
```

No sprints. No story points. The boat needs a thing, the thing gets built, the thing proves itself in energy and utility, the thing stays or gets cut.

### 7.3 The Crystallization Imperative

Every feature that runs on Layer 1 (inference) should be migrating toward Layer 2 (bytecode). The crystallization curve isn't just about cost reduction — it's about energy reduction. A crystallized routine uses 100×–1000× less energy than the equivalent inference. On the edge, that's the difference between running for 8 hours and running for 800 hours on the same battery.

Features that resist crystallization (genuinely novel situations requiring fluid reasoning) are the system's η budget — carefully rationed, only deployed when the crystallized reflexes fail. The γ/η ratio on the edge skews heavily toward γ. The boat runs on instinct, mostly. Intelligence is the reserve, called up when instinct isn't enough.

---

## 8. Architectural Consequences

The energy-first, edge-first, offline-first architecture produces systems with specific properties:

| Property | Cloud-First System | Edge-First System |
|----------|-------------------|-------------------|
| **Latency** | 100–2000ms (network) | 1–50ms (local) |
| **Availability** | Depends on connectivity | Always available |
| **Cost curve** | Flat or rising (per-query pricing) | Declining (crystallization) |
| **Privacy** | Data leaves device | Data stays local |
| **Autonomy** | Server-authoritative | Locally autonomous |
| **Failure mode** | Service unavailable | Graceful degradation |
| **Energy profile** | Unmeasured, unbounded | Measured, budgeted |
| **Complexity** | Framework-heavy, abstracted | Minimal, direct |

The edge-first system is harder to build. It requires discipline. But the result is a system that works when the cloud is gone, gets cheaper over time, and respects the physical reality that computation costs energy.

---

## 9. Reference Implementation Checklist

A conforming edge-first implementation must provide:

- [ ] **Local inference** — at least one quantized model running on-device, no network dependency
- [ ] **FLUX conservation gates** — energy budget enforcement on all operations
- [ ] **PLATO local rooms** — agent coordination without cloud round-trips
- [ ] **SQLite or flat-file storage** — no database server required
- [ ] **Offline operation** — full functionality with zero network connectivity
- [ ] **Eventual sync** — compressed state delta propagation when connectivity appears
- [ ] **Hebbian adaptation** — nodes track usage and adjust resource allocation
- [ ] **A2UI rendering** — interface composed from local state, no remote frontend
- [ ] **Energy profiling** — real or estimated joules/op for every operation
- [ ] **Graceful degradation** — triage protocol when energy budget is low

---

## 10. The Boat Remains the Reference

Everything in this document traces back to the fishing boat. The boat is the design environment, the test environment, and the deployment environment. If a design decision doesn't make sense on the boat, it doesn't make sense in the architecture.

The boat teaches:

- **Energy is finite.** The tank is the budget.
- **Connectivity is intermittent.** The satellite is not always there.
- **Decisions have consequences.** A wrong course wastes fuel. A missed quota costs the season.
- **Precision comes from constraint.** You can't carry spare everything, so you carry the right thing.
- **The system must work when things go wrong.** Rough weather, equipment failure, crew fatigue — the system must degrade, not crash.

This is why the architecture is edge-first. Not because edge is trendy. Because edge is where physics still applies.

---

*Related: [BITING_THE_HOOK.md](BITING_THE_HOOK.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [MESH-ARCHITECTURE.md](MESH-ARCHITECTURE.md)*
