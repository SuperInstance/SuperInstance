# 🌊 SuperInstance

> **PLATO — Rooms that think. Tiles that remember. Agents that learn.**

SuperInstance is a micro-model ecosystem that distills LLM knowledge into deployable, verifiable, constraint-safe systems. We build rooms where agents think, tiles that carry verified knowledge, and the mathematical substrate that makes it all provably correct.

## What is PLATO?

PLATO is a **constraint-aware knowledge mesh**:

- **Rooms** — Shared spaces where agents deliberate, each with local context and observations of others
- **Tiles** — Units of verified knowledge, scored on novelty × correctness × completeness × depth
- **Officers** — Long-lived agents that maintain rooms and enforce conservation laws
- **Deadband** — Only propagate when change exceeds tolerance (no wasted computation)

The math is invisible. You just complete the room task.

## Ecosystem Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SuperInstance Ecosystem                  │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  Core Math   │  VM & Safety │   Training    │   Fleet Ops   │
├──────────────┼──────────────┼───────────────┼───────────────┤
│ constraint-  │  flux-vm-v3  │ plato-core    │  fleet-stack  │
│  substrate   │  (60 opcodes,│ tensor-spline │  (docker      │
│  (5 primitives│   JIT, proof │ (SplineLinear │   compose)    │
│   Rust/C/Py) │   certs)     │  compression) │               │
│              │              │               │  fleet-murmur │
│ constraint-  │ flux-verify- │ eisenstein-   │  (fleet       │
│  theory-core │  api (natural│ embed (5-layer│   services)   │
│  (unified    │  language    │  matching     │               │
│   theory)    │  verification│  cascade)     │  cocapn-cli   │
│              │  API)        │               │  (terminal    │
│ deadband-rs  │              │ triplet-miner │   aesthetic)  │
│  (fleet      │ flux-check-js│  (git-powered │               │
│   compress)  │  (TypeScript │  contrastive  │  cocapn-health│
│              │   checking)  │  learning)    │  (monitoring) │
│ holonomy-    │              │               │               │
│  consensus   │ flux-engine-c│ flux-lib-py   │  quality-gate-│
│  (GL(9) trust│  (C header)  │  (unified     │  stream       │
│   verify)    │              │   Python)     │  (tile        │
│              │              │               │   scoring)    │
│ fleet-math-c │              │ flux-genome-py│               │
│  (SIMD math) │              │  (gene expr)  │  swarm-rooms  │
│              │              │               │  (multi-agent │
│ superinstance│              │ flux-hyper-   │   simulation) │
│  -ffi (FFI/  │              │  bolic-py     │               │
│  WASM)       │              │  (Poincaré)   │               │
├──────────────┴──────────────┴───────────────┴───────────────┤
│                     Web & Visualization                      │
├──────────────────────────────────────────────────────────────┤
│  constraint-theory-web — 50 interactive math simulations      │
│  superinstance-wiki — Fleet knowledge base & catalog          │
├──────────────────────────────────────────────────────────────┤
│                     Audio & Creative                          │
├──────────────────────────────────────────────────────────────┤
│  constraint-audio • constraint-synth • counterpoint-engine    │
│  constraint-mux • jazz-voicing-engine • groove-analyzer       │
│  flux-tensor-midi • holonomy-harmony • constraint-dialect     │
└──────────────────────────────────────────────────────────────┘
```

## Core Repositories

### Math Foundation

| Repo | Language | Description |
|------|----------|-------------|
| [constraint-substrate](https://github.com/SuperInstance/constraint-substrate) | Rust, C, Python | 5 irreducible constraint primitives — lattice snap, funnel, holonomy, rigidity, consensus |
| [constraint-theory-core](https://github.com/SuperInstance/constraint-theory-core) | Rust | Unified geometric constraint theory — Eisenstein lattices, deadband funnels, Laman rigidity |
| [deadband-rs](https://github.com/SuperInstance/deadband-rs) | Rust | Deadband detection and compression — BMA, Fibonacci splines, Eisenstein snap |
| [holonomy-consensus](https://github.com/SuperInstance/holonomy-consensus) | Rust | GL(9) zero-holonomy consensus — cycle-based trust verification |
| [fleet-math-c](https://github.com/SuperInstance/fleet-math-c) | C | SIMD-accelerated constraint math — 64 bytes = 1 cache line = 1 constraint op |
| [superinstance-ffi](https://github.com/SuperInstance/superinstance-ffi) | C, WASM | Unified C FFI and WASM bindings for all math primitives |

### VM & Constraint Safety

| Repo | Language | Description |
|------|----------|-------------|
| [flux-vm-v3](https://github.com/SuperInstance/flux-vm-v3) | Rust | Proof-carrying, SIMD-native, terminating constraint VM — 60 opcodes, 179M checks/sec |
| [flux-verify-api](https://github.com/SuperInstance/flux-verify-api) | Rust | Natural language verification API — prove/disprove claims with physics traces |
| [flux-engine-c](https://github.com/SuperInstance/flux-engine-c) | C | Single-header constraint engine — 250M checks/sec, 10 industry presets |
| [flux-check-js](https://github.com/SuperInstance/flux-check-js) | TypeScript | Zero-dep constraint checking, fracture-coalesce, sediment layers |
| [flux-lib-py](https://github.com/SuperInstance/flux-lib-py) | Python | Unified constraint engine — 83 tests, 10 presets, thermodynamics |

### Training & Embedding

| Repo | Language | Description |
|------|----------|-------------|
| [plato-core](https://github.com/SuperInstance/plato-core) | Python | Base types + mesh registry for the PLATO knowledge system |
| [tensor-spline](https://github.com/SuperInstance/tensor-spline) | Python | SplineLinear neural compression — 16,384:1 ratio on 512×512 layers |
| [eisenstein-embed](https://github.com/SuperInstance/eisenstein-embed) | Python | 5-layer matching cascade — 71.2% hit rate, 653x smaller than Model2Vec |
| [triplet-miner](https://github.com/SuperInstance/triplet-miner) | Python | Mine (anchor, positive, negative) triplets from git history |
| [swarm-rooms](https://github.com/SuperInstance/swarm-rooms) | Python | GPU-accelerated multi-agent room simulation with CRDT merge |

### Fleet Operations

| Repo | Language | Description |
|------|----------|-------------|
| [fleet-stack](https://github.com/SuperInstance/fleet-stack) | Docker | One-command fleet deployment — `docker compose up -d` |
| [cocapn-cli](https://github.com/SuperInstance/cocapn-cli) | Rust | Fleet CLI theme — the Abyssal Terminal aesthetic |
| [cocapn-health](https://github.com/SuperInstance/cocapn-health) | Python | Fleet health monitoring — vessel status, heartbeat, observability |
| [quality-gate-stream](https://github.com/SuperInstance/quality-gate-stream) | Python | Tile quality scoring — novelty × correctness × completeness × depth |
| [forgemaster](https://github.com/SuperInstance/forgemaster) | Rust | Constraint-aware agentic compiler — assembles optimal components with proofs |

### Audio & Creative (Constraint Theory in Practice)

| Repo | Description |
|------|-------------|
| [constraint-synth](https://github.com/SuperInstance/constraint-synth) | Waveshape IS lattice geometry — constraint-theory synthesizer |
| [counterpoint-engine](https://github.com/SuperInstance/counterpoint-engine) | Species counterpoint as constraint satisfaction with tensor-MIDI output |
| [jazz-voicing-engine](https://github.com/SuperInstance/jazz-voicing-engine) | Jazz piano voicing, comping, and walking bass generation |
| [flux-tensor-midi](https://github.com/SuperInstance/flux-tensor-midi) | 4D tensor MIDI — 6 languages, Eisenstein snap, INT8 saturation |
| [groove-analyzer](https://github.com/SuperInstance/groove-analyzer) | Microtiming → deadband analysis — proves groove IS the deadband funnel |
| [holonomy-harmony](https://github.com/SuperInstance/holonomy-harmony) | Chord progression analysis via holonomy — detect modulations and violations |

### Web & Visualization

| Repo | Description |
|------|-------------|
| [constraint-theory-web](https://github.com/SuperInstance/constraint-theory-web) | 50 interactive simulations — click once, understand forever |
| [superinstance-wiki](https://github.com/SuperInstance/superinstance-wiki) | Fleet knowledge base — catalog, indexes, visual exploration |

## Key Results

| Result | Detail |
|--------|--------|
| **Eisenstein encoder** | 71.2% hit rate, 653× smaller than Model2Vec |
| **SplineLinear compression** | 16,384:1 ratio on 512×512 layers |
| **Bitvector matching** | 93.8% typo accuracy, zero ML dependencies |
| **ONNX inference** | 58,648 qps on CPU (700× faster than PyTorch) |
| **FLUX VM throughput** | 179M constraint checks/sec (Zen 5, JIT) |
| **C engine throughput** | 250M constraint checks/sec (single-header) |
| **Conservation law** | γ + H = 1.283 − 0.159 × log(V) ± ε |

## Quick Start

### Run the fleet locally

```bash
git clone https://github.com/SuperInstance/fleet-stack
cd fleet-stack
export DEEPINFRA_KEY=your-key
docker compose up -d
```

### Use constraint primitives

```bash
# Rust
cargo add constraint-theory-core

# Python
pip install plato-core tensor-spline

# C — single header
#include "flux_engine.h"
```

### Explore the math

Visit [constraint-theory-web](https://github.com/SuperInstance/constraint-theory-web) for 50 interactive simulations that make the math click.

## Conservation Law

The core invariant that governs the entire PLATO system:

> **γ + H = 1.283 − 0.159 × log(V) ± ε**

Where γ is the gate coefficient (agent skill coupling), H is Helmholtz free energy, V is fleet size, and ε is the coupling tolerance. Every tile in every room is checked against this law.

## Documentation

- [MESH-ARCHITECTURE.md](./MESH-ARCHITECTURE.md) — Full mesh specification
- [PITCH-DECK.md](./PITCH-DECK.md) — Project overview and vision
- [CATALOG.md](./CATALOG.md) — Complete repo catalog
- [INDEX.md](./INDEX.md) — Cross-referenced index

## License

Each repository has its own license (typically MIT or Apache-2.0). See individual repos for details.
