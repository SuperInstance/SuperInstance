# SuperInstance Architecture

> **Version:** 2.0 — Definitive Ecosystem Reference
> **Date:** 2026-07-12
> **Scope:** FLUX bytecode VM · PLATO room runtime · Constraint Theory · 4,000+ repos · 14,000+ tests

---

## 1. Overview

SuperInstance is an open-source ecosystem for building **bounded, conservation-governed AI agents**. The core thesis is the *Crystallization Curve*: intelligence should get cheaper over time, not more expensive. Every LLM call that can be replaced by deterministic bytecode is a win. Repeated decisions compile from expensive fluid inference (~$0.01–$0.05 per call) down to crystallized bytecode (~$0.0001) and eventually native code (~$0). An agent's cost curve bends downward as it matures — the opposite of every commercial AI platform.

The ecosystem rests on three pillars. **FLUX** (Fluid Language Universal eXecution) is a register-based bytecode VM that runs agent logic deterministically — every instruction is auditable, replayable, and sandboxed. **PLATO** is a room-level agent runtime that provides bounded context, sensor history, alarm evaluation, and knowledge sharing via a simple text/JSON wire protocol. **Constraint Theory** provides the mathematical framework: the conservation law γ + η = C governs every operation, enforcing a fixed capability budget where crystallized intelligence (γ) trades off against live intelligence (η).

The system is inherently polyglot. FLUX has reference implementations in Python (2,037 tests), Rust (51 tests), and JavaScript. PLATO engine blocks run in C99, Rust, Elixir/OTP, and Zig. Constraint Theory's core crate ships in Rust (262 tests) with a Python companion (167 tests). Everything is MIT licensed, agent-readable, and designed so that a future agent waking up in any repo can orient itself by reading `git log`.

---

## 2. The Three Pillars

### 2.1 FLUX — Deterministic Bytecode VM

**FLUX** is the compute engine. When an agent needs to make a decision, it doesn't reach for Python or Bash — it assembles FLUX bytecode. The VM executes a register-based ISA with 16 general-purpose registers, 16 floating-point registers, cycle budgets for sandboxing, and built-in agent-to-agent (A2A) messaging opcodes (`TELL`, `ASK`, `DELEGATE`, `BROADCAST`).

The bytecode format is formally specified (FLUX Bytecode Spec v1.0) with seven instruction formats (A through G) ranging from 1-byte opcode-only to variable-length data-carrying instructions. The core opcode set — arithmetic, logic, control flow, stack, comparison, float, A2A, and system opcodes (0x00–0x81) — is implemented identically across all three reference VMs, producing byte-identical output and identical register state.

**Key property:** Same bytecode, same result, every node, every time. This determinism enables swarm consensus — run N agents for one tick each, majority-vote on a register value, O(N) per tick.

| Implementation | Language | Tests | Registry | Package |
|---|---|---|---|---|
| flux-runtime | Python | 2,037 | PyPI | `flux-vm` |
| flux-core | Rust | 51 | crates.io | `fluxvm` |
| flux-js | JavaScript | — | npm | `flux-js` |

Additional implementations exist in C, Zig, Go, Java, WASM, and CUDA — all sharing the same ISA.

### 2.2 PLATO — Room-Level Agent Runtime

**PLATO** provides the environment agents live in. A PLATO *room* is a bounded context with sensors, history (ring buffer), alarms (threshold evaluation per tick), and actuators. Rooms communicate with agents via the PLATO Wire Protocol — line-delimited text commands, JSON responses — designed so that a human can type commands in a terminal (`nc localhost 1234`), an LLM can parse responses without tooling, and an ESP32 can generate responses in <1KB of code.

The PLATO server (Python) adds knowledge tiles (validated Q&A pairs), fleet sync via Matrix, BYOK agent spawning (OpenAI, Anthropic, Groq, DeepSeek, Ollama), and a Docker image (`ghcr.io/superinstance/plato-server`). It runs on port 8847 and stores tiles in SQLite.

**Design principle — deadband wakefulness:** Agents only act when something meaningfully changes. PLATO's tick-driven loop reads sensors, stores values in history, evaluates alarm thresholds, and broadcasts to subscribers. No threads, no polling, no waste.

### 2.3 Constraint Theory — Mathematical Framework

**Constraint Theory** is the governance layer. The central equation is:

> **γ + η = C**

Where γ (gamma) is crystallized intelligence — compiled bytecode, cached reflexes, cheap and inflexible. η (eta) is live intelligence — LLM calls, runtime reasoning, expensive and flexible. C is the capability level, fixed for a given agent. You trade γ against η at a fixed budget.

The underlying mathematics is Shannon's chain rule — genuinely sound. The core Rust crate (`constraint-theory-core`) implements deterministic manifold snapping: continuous 2D vectors are mapped to exact Pythagorean rational points (integer triples where a² + b² = c²) via a KD-tree index. This eliminates floating-point drift across distributed agents. Two different machines computing "the same" direction collapse to the same lattice point because that point's identity is integers, not a float computation.

The crate ships with 262 tests (136 unit + 30 integration + 54 module-coverage + 42 doc-tests), zero runtime dependencies, and AVX2 SIMD acceleration. A Python companion (`constraint-theory-py`, v0.3.0) adds Eisenstein lattice operations, temporal constraint propagation with exponential decay, and adaptive tolerance — 167 tests across five modules.

The ternary-science crate provides experimental validation: five conservation laws verified across 2,400-game GPU simulations, with cross-language validation in Python, Rust, C, and WASM producing identical results.

---

## 3. Architecture Diagram

```
  ┌──────────────────────────────────────────────────────────┐
  │                    AGENT LOGIC LAYER                      │
  │         Natural language → FLUX bytecode                  │
  │         (expensive: LLM inference ~$0.01/decision)        │
  └───────────────────────┬──────────────────────────────────┘
                          │ runs on
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │                    FLUX VM LAYER                          │
  │    Python (2,037 tests) · Rust (51 tests) · JS           │
  │    16 GP registers · 16 FP registers · cycle budgets     │
  │    A2A opcodes: TELL · ASK · DELEGATE · BROADCAST        │
  └───────────────────────┬──────────────────────────────────┘
                          │ communicates via
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │              PLATO WIRE PROTOCOL (v0.1)                  │
  │    Line-delimited text commands → JSON responses         │
  │    Commands: tick · history · actuator · alarm           │
  │             subscribe · unsubscribe · help · quit        │
  │    Transport: TCP :1234 · WebSocket · Serial · stdio     │
  └───────────────────────┬──────────────────────────────────┘
                          │ connects to
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │                  PLATO ROOM LAYER                         │
  │  C99 (~15KB binary) · Rust (no_std) · Elixir/OTP · Zig  │
  │  Sensors → Tick Loop → Ring Buffer History → Alarms     │
  │  Zero dynamic allocation (C/Zig) · BEAM supervision (E) │
  └───────────────────────┬──────────────────────────────────┘
                          │ governed by
                          ▼
  ┌──────────────────────────────────────────────────────────┐
  │              CONSTRAINT THEORY LAYER                      │
  │     γ + η = C  (crystallized + live = capability)       │
  │     Pythagorean manifold snapping · KD-tree index        │
  │     262 Rust tests · 167 Python tests · 5 conservation  │
  │     laws · AVX2 SIMD · zero runtime dependencies         │
  └──────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow — How a Decision Moves Through the System

A representative agent decision traces this path:

1. **Perception:** An agent's PLATO room ticks. Sensors are read, values stored in the history ring buffer, alarm thresholds evaluated. If a subscribed agent is connected, it receives a spontaneous tick message: `{"type":"tick","t":1749234437.0,"seq":42,"data":{"coolant_temp_c":96.3,"rpm":1790}}`.

2. **Compilation:** The agent receives the sensor data and must decide what to do. A high-level intent — "if coolant temperature exceeds 95°C, reduce throttle to 50%" — is compiled into FLUX bytecode. In Python, this can happen via natural language vocabulary (`Interpreter.execute("if 96 > 95 then 50 else 100")`) or direct assembly.

3. **Execution:** The FLUX VM executes the bytecode deterministically. `CMP R0, 95 → JNZ throttle_reduce → MOVI R0, 50 → HALT`. The result lands in R0. Cycle budgets prevent runaway computation. Every instruction is O(1) fetch-decode-execute.

4. **Conservation check:** Before the action is dispatched, the constraint layer verifies the γ/η budget. If the decision was made entirely from crystallized bytecode (γ), the η cost is zero. If an LLM call was required, η increases. The sum must not exceed C.

5. **Action:** The result is sent back to the PLATO room via the wire protocol: `actuator engine_throttle 0.5`. The room acknowledges: `{"type":"ack","command":"actuator","name":"engine_throttle","value":0.5}`.

6. **Crystallization:** Over time, repeated decisions that follow the same pattern are compiled from LLM calls into FLUX bytecode. The agent's cost per decision drops from ~$0.02 (pure LLM) to ~$0.0001 (compiled bytecode) to ~$0 (native code). This is the Crystallization Curve in action.

---

## 5. Implementation Matrix

### FLUX VM Family

| Repo | Language | Tests | Registry | Status |
|------|----------|-------|----------|--------|
| `flux-runtime` | Python | 2,037 | PyPI (`flux-vm`) | ✅ Published |
| `flux-core` | Rust | 51 | crates.io (`fluxvm`) | ✅ Published |
| `flux-js` | JavaScript | — | npm (`flux-js`) | ✅ Published |
| `flux-vm` | Rust (stack-based) | — | — | Constraint VM, 50 opcodes |
| `flux-compiler` | Rust/Python | — | — | Formal-methods compiler |

### PLATO Engine Family

| Repo | Language | Binary Size | Status |
|------|----------|-------------|--------|
| `plato-server` | Python | Docker image | ✅ Knowledge tiles, fleet sync, agent spawning |
| `plato-engine-block-c` | C99 | ~15 KB | ✅ Zero heap alloc, bare-metal, ESP32-ready |
| `plato-engine-block` | Rust | — | ✅ `no_std` + alloc, builder pattern |
| `plato-engine-block-elixir` | Elixir | — | ✅ BEAM supervision trees, hot reload |
| `plato-engine-block-zig` | Zig | — | ✅ High-performance, comptime config |
| `plato-runtime-kernel` | Rust | — | Spatial model: tensor grid, batons |

### Constraint Theory Family

| Repo | Language | Tests | Registry | Focus |
|------|----------|-------|----------|-------|
| `constraint-theory-core` | Rust | 262 | crates.io | Pythagorean manifold snapping, zero deps |
| `constraint-theory-py` | Python | 167 | PyPI | Eisenstein lattices, temporal constraints |
| `ternary-science` | Rust | — | — | 5 conservation laws, GPU benchmarks |
| `cuda-constraint-engine` | CUDA/C | — | — | 1B+ constraints/sec on GPU |
| `capitaine-1` | TypeScript | — | — | Fleet captain enforcing γ + η = C |

---

## 6. Protocol Stack

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 4: AGENT APPLICATIONS                             │
│  Capitaine-1 · git-agent · exocortex · custom agents    │
│  Natural language intents · markdown vocab files         │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: FLUX RUNTIME (Bytecode Execution)              │
│  Assembler → Bytecode → VM → Result                     │
│  Registers: 16 GP + 16 FP · Opcodes 0x00–0x81          │
│  A2A: TELL/ASK/DELEGATE/BROADCAST · Swarm consensus     │
│  Vocabulary: NL patterns → assembly → bytecode           │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: PLATO ENGINE (Room Protocol)                   │
│  Tick loop · Sensor I/O · Ring buffer history            │
│  Alarm thresholds · Actuator commands · Subscriptions    │
│  Knowledge tiles (Q&A) · Fleet sync via Matrix           │
├─────────────────────────────────────────────────────────┤
│  LAYER 1: TRANSPORT                                      │
│  TCP (default :1234 for engine blocks, :8847 for server) │
│  WebSocket · Serial/UART · stdio                         │
│  Line-delimited text commands · JSON responses           │
└─────────────────────────────────────────────────────────┘
```

**Layer 1** is deliberately minimal. The PLATO Wire Protocol Specification v0.1 states: if the protocol isn't simple enough for a human with `nc`, an LLM without tools, and an ESP32 in <1KB, it's too complex.

**Layer 2** handles physical reality — reading sensors, storing history, firing alarms. The C implementation does this in ~15KB with zero dynamic allocation. The Elixir version adds BEAM supervision trees for fault tolerance.

**Layer 3** is pure computation. The same bytecode runs identically on Python, Rust, and JS VMs. The A2A protocol enables agents to message each other with UUID-paired trust scores [0, 1].

**Layer 4** is where agents live — git-native (git-agent), Cloudflare Workers-native (capitaine-1), or fleet-deployed (exocortex). Each agent is origin-centric: the center of its own radar, no god's-eye view.

---

## 7. Conservation Law Enforcement

### The Equation

> **γ + η ≤ C**

- **γ (crystallized intelligence):** Compiled FLUX bytecode, cached reflexes, lookup tables. Cheap ($0.0001/decision), fast (~400ns/iter in JS), inflexible.
- **η (live intelligence):** LLM inference calls, runtime reasoning. Expensive ($0.01–$0.05/decision), slow (seconds), flexible.
- **C (capability budget):** Fixed for a given agent tier. Cannot be exceeded.

### How It Works in Practice

**Static enforcement:** The capitaine-1 fleet captain tracks every decision's cost. A heartbeat that invokes the strategist model (Kimi K2.5, ~$0.05/call) and captain model (DeepSeek, ~$0.002/call) costs η = $0.052. If the agent has C = $2.16/day (96 heartbeats), it can sustain this indefinitely — but the goal is to drive η toward zero.

**Dynamic crystallization:** Repeated decisions are detected and compiled. If the agent always reduces throttle when coolant > 95°C, that pattern is compiled into FLUX bytecode. The next time the condition arises, the agent executes bytecode (γ) instead of calling an LLM (η). Cost drops by 100×.

**Verification:** The constraint-theory-core crate provides the mathematical foundation. Pythagorean manifold snapping ensures that two agents on different hardware, given the same inputs, produce bit-identical results. The 262-test suite includes property tests verifying that lattice points satisfy a² + b² = c² exactly in integer arithmetic — not approximately in float.

**Experimental evidence:** The ternary-science crate verifies five conservation laws across 2,400-game GPU simulations on RTX 4050 hardware. Cross-language validation (Python, Rust, C, WASM) confirms identical results. Ternary operations achieve ~200 TOPS on consumer GPUs — 6–7× faster than FP32.

---

## 8. Cross-Implementation Status

### FLUX Bytecode Conformance

Per the FLUX Bytecode Spec v1.0 (2026-07-12), all three reference VMs produce **byte-identical output** for the shared opcode subset:

| Feature | Python | Rust | JavaScript |
|---------|--------|------|------------|
| Core opcodes (0x00–0x81) | ✅ | ✅ | ✅ |
| Float opcodes (FADD–FDIV) | ✅ | ✅ | ✅ |
| Extended jumps (JE, JNE, JG…) | ✅ | ❌ | ✅ |
| Vector registers (V0–V15) | ✅ | Stub | Stub |
| A2A protocol (Format G) | ✅ Full | Stub (no-op) | Stub (no-op) |
| Vocabulary interpreter | ✅ 10+ patterns | ✅ 6 patterns | ✅ 10 patterns |
| Swarm consensus | ✅ | ✅ | ✅ |

**Portable subset:** All three VMs agree on the core opcode table (37 instructions). Bytecode assembled on one VM executes identically on all others. A2A Format G opcodes are accepted but stubbed in Rust and JS — they parse correctly without executing agent messaging.

### PLATO Wire Protocol Conformance

Per the PLATO Cross-Implementation Audit (2026-07-12), four engine block implementations were audited against Wire Protocol v0.1. All failed initially (0/10 conformance) and were patched:

| Feature | C | Rust | Elixir | Zig |
|---------|---|------|--------|-----|
| JSON tick response | ✅ | ✅ | ✅ | ✅ |
| JSON history response | ✅ | ✅ | ✅ | ✅ |
| `actuator` command | ✅ | ✅ | ✅ | ✅ |
| `alarm list` JSON | ✅ | ✅ | ✅ | ❌ |
| `alarm set` runtime | ❌ | ✅ | ✅ | ❌ |
| `subscribe` / `unsubscribe` | ✅ | ✅ | ✅ | ✅ |
| `help` / `quit` | ✅ | ✅ | ✅ | ✅ |
| Error responses as JSON | ✅ | ✅ | ✅ | ✅ |
| **Post-fix score** | **8/10** | **8/10** | **7/10** | **6/10** |

**Audit findings applied:**
- **C** (`plato-engine-block-c`): Rewrote `plato_handle_command()` to emit JSON, added welcome message, changed default port to 1234. Commits `8811a2a`, `a6505ee`.
- **Rust** (`plato-engine-block`): Full rewrite of `ProtocolHandler::handle()` with JSON formatters. Commits `fbd8642`, `2b1aa49`.
- **Elixir** (`plato-engine-block-elixir`): Rewrote `format_response/1`, added subscribe/unsubscribe/alarm parsing. Commit `4fedb77`.
- **Zig** (`plato-engine-block-zig`): Added JSON response formatters, fixed subscribe. Commit `0002847`.

**Remaining gaps:**
1. C and Zig store per-sensor history, not per-tick snapshots — needs refactoring.
2. C and Zig lack runtime `alarm set` — needs engine API extensions.
3. Elixir and Zig lack real Unix timestamps (sequence numbers only).
4. Elixir and Zig have no TCP server (library-only currently).
5. `last_triggered` timestamp missing across all implementations.

---

## 9. Package Registry

### Published (Installable Today)

| Package | Registry | Language | Install |
|---------|----------|----------|---------|
| `flux-vm` | [PyPI](https://pypi.org/project/flux-vm/) | Python | `pip install flux-vm` |
| `fluxvm` | [crates.io](https://crates.io/crates/fluxvm) | Rust | `cargo add fluxvm` |
| `flux-js` | [npm](https://www.npmjs.com/package/flux-js) | JavaScript | `npm install flux-js` |
| `cocapn` | [PyPI](https://pypi.org/project/cocapn/) | Python | `pip install cocapn` |
| `plato-core` | [PyPI](https://pypi.org/project/plato-core/) | Python | `pip install plato-core` |
| `plato-torch` | [PyPI](https://pypi.org/project/plato-torch/) | Python | `pip install plato-torch` |
| `plato-config` | [PyPI](https://pypi.org/project/plato-config/) | Python | `pip install plato-config` |
| `plato-papers` | [PyPI](https://pypi.org/project/plato-papers/) | Python | `pip install plato-papers` |
| `plato-meta-tiles` | [PyPI](https://pypi.org/project/plato-meta-tiles/) | Python | `pip install plato-meta-tiles` |
| `plato-fflearning` | [PyPI](https://pypi.org/project/plato-fflearning/) | Python | `pip install plato-fflearning` |
| `plato-attention-tracker` | [PyPI](https://pypi.org/project/plato-attention-tracker/) | Python | `pip install plato-attention-tracker` |
| `palaver-math` | [PyPI](https://pypi.org/project/palaver-math/) | Python | `pip install palaver-math` |
| `constraint-theory-core` | [crates.io](https://crates.io/crates/constraint-theory-core) | Rust | `cargo add constraint-theory-core` |
| `plato-server` | [GitHub Container Registry](https://github.com/SuperInstance/plato-server/pkgs/container/plato-server) | Docker | `docker pull ghcr.io/superinstance/plato-server` |

### In Development

| Package | Registry | Description |
|---------|----------|-------------|
| `@superinstance/tminus-client` | npm | T-Minus Client SDK |
| `@superinstance/tminus-dispatcher` | npm | Temporal orchestration for fleets |
| `@cocapn/plato-client` | npm | PLATO room protocol client |
| `plato-client-php` | Packagist | PHP PLATO client |
| `exocortex` | PyPI | Persistent cognitive substrate |
| `plato-mcp` | PyPI | PLATO rooms as MCP tools |
| 40+ Rust crates | crates.io | PLATO sub-systems (filter, event, fleet, anomaly, etc.) |
| 355 ternary crates | crates.io | Ternary math, search, routing, neural nets |

---

## 10. Roadmap

### 30 Days — Protocol Hardening (July 2026)

- **Close PLATO audit gaps:** Per-tick history in C/Zig, runtime `alarm set` in C/Zig, Unix timestamps in Elixir/Zig, TCP servers for Elixir and Zig.
- **FLUX A2A parity:** Implement Format G opcodes in Rust and JS (currently stubbed). Full agent messaging across all VMs.
- **Conformance test suite:** The `plato-protocol-test` repo becomes a live CI harness connecting to any implementation and validating all protocol responses.
- **Protocol versioning:** Add `protocol_version` to welcome JSON across all implementations.
- **Publish wave:** Push the top 20 ternary crates to crates.io with docs and benchmarks.

### 60 Days — Ecosystem Integration (August–September 2026)

- **FLUX ↔ PLATO bridge:** FLUX bytecode can directly issue PLATO wire protocol commands via new VM opcodes or a bridge layer. Agents compute in FLUX, act through PLATO.
- **Conservation enforcement in CI:** Automated γ/η accounting in GitHub Actions — every PR reports its crystallization ratio.
- **Interactive algorithm visualizations:** Web app comparing binary vs ternary search, packing, routing.
- **Jupyter notebook series:** 12 notebooks for academic use — "Ternary Linear Algebra 101", "Z₃ in Machine Learning", "Why Three States Beat Two".
- **PLATO MCP integration:** Any MCP-compatible framework can use PLATO rooms as tools.

### 90 Days — Platform Launch (October–December 2026)

- **`npx create-plato-game`:** Scaffold complete game projects from a single prompt, powered by competitive riffing.
- **`npm install @superinstance/band`:** Music cognition as a drop-in library — give it MIDI, it improvises back.
- **`npx create-character`:** Generate character sheets with stats, class, abilities, and backstory as portable `.nail` bundles.
- **Agent Music Interactive Playground:** Web environment where agents are dragged onto tracks and improvise together, visualizing ternary state as spectrograms.
- **Research benchmark suite:** Rigorous ternary vs binary vs float benchmarks on matrix ops, search, routing, neural inference — hardware-tested on NVIDIA GPUs.
- **First research papers:** Constraint theory formalization submitted to ICML/NeurIPS workshops.

---

## Appendix: Key Files and References

| Document | Location | Description |
|----------|----------|-------------|
| FLUX Bytecode Spec v1.0 | `AI-Writings/FLUX_BYTECODE_SPEC.md` | Canonical byte-level encoding |
| PLATO Wire Protocol v0.1 | `AI-Writings/PLATO_WIRE_PROTOCOL.md` | Agent-room communication spec |
| PLATO Implementation Matrix | `AI-Writings/PLATO_IMPLEMENTATION_MATRIX.md` | Cross-implementation audit |
| The Crystallization Curve | `AI-Writings/THE_CRYSTALLIZATION_CURVE.md` | Central economic thesis |
| PACKAGES.md | `SuperInstance/SuperInstance/PACKAGES.md` | Full package catalog |
| ONBOARDING.md | `SuperInstance/SuperInstance/ONBOARDING.md` | Agent-first onboarding |
| ROADMAP.md | `SuperInstance/SuperInstance/ROADMAP.md` | Fleet roadmap |

---

*SuperInstance — The system that builds itself. MIT licensed. Every repo public from the first commit.*

*Last updated: 2026-07-12*
