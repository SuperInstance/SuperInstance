# 📚 SuperInstance — Unified Documentation Portal

> **The system that builds itself.** 500+ repos, 6000+ tests. Agent-readable onboarding from nothing to everything.

This is the central documentation index for the SuperInstance ecosystem. Every link below takes you directly to the relevant README, docs page, or specification.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Flagship Generation](#flagship-generation)
- [FLUX Runtime](#flux-runtime)
- [PLATO Engine](#plato-engine)
- [Theory](#theory)
- [Infrastructure](#infrastructure)
- [Philosophy (AI-Writings)](#philosophy-ai-writings)
- [Packages](#packages)

---

## Getting Started

| Resource | Link |
|----------|------|
| **Start Here — Onboarding** | [ONBOARDING.md](./ONBOARDING.md) |
| **The Fleet, Right Now — a welcome** | [THE-FLEET-NOW.md](./THE-FLEET-NOW.md) |
| **Quickstart Guide** | [QUICKSTART.md](./QUICKSTART.md) |
| **Architecture Overview** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Roadmap** | [ROADMAP.md](./ROADMAP.md) |
| **Contributing** | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| **Pitch Deck** | [PITCH-DECK.md](./PITCH-DECK.md) |
| **Killer Apps** | [KILLER-APPS.md](./KILLER-APPS.md) |
| **Mesh Architecture** | [MESH-ARCHITECTURE.md](./MESH-ARCHITECTURE.md) |
| **Organization Profile** | [SuperInstance/.github](https://github.com/SuperInstance/.github) |

### Starter Projects

- [starter-shell](https://github.com/SuperInstance/starter-shell) — Clone-and-go shell that discovers compilers, creates PLATO rooms, bootstraps a fleet
- [git-agent-codespace](https://github.com/SuperInstance/git-agent-codespace) — One-click Codespace template for git-agent development
- [capitaine-1](https://github.com/SuperInstance/capitaine-1) — Fork a repo, click Codespaces, the agent is alive

---

## Flagship Generation

The newest rooms — where the system is currently growing itself. The [README](./README.md) tells their story ("The Reef Grows a Room"); this is the index.

| Repo | What it is |
|------|------------|
| [quilt](https://github.com/SuperInstance/quilt) · [quilt-rust](https://github.com/SuperInstance/quilt-rust) | A spreadsheet where every cell is a live, addressable capability — the grid IS the runtime |
| [plainsong](https://github.com/SuperInstance/plainsong) · [plainsong-mcp](https://github.com/SuperInstance/plainsong-mcp) · [plainsong-worker](https://github.com/SuperInstance/plainsong-worker) | Plain-text music notation that compiles to MIDI, embeddable in markdown; the MCP server puts composition within reach of any agent |
| [crab-traps](https://github.com/SuperInstance/crab-traps) · [crab-trap-web](https://github.com/SuperInstance/crab-trap-web) | Lure prompts that walk agents through the MUD — every catch lays a brick in THE REEF (D1 skeleton, Vectorize nerves); 36+ rooms explorable in the browser |
| [elephant](https://github.com/SuperInstance/elephant) | The room-temperature sense — JEPA dials reading every conversation's warmth |
| [OpenConstruct](https://github.com/SuperInstance/OpenConstruct) (+ [Rust](https://github.com/SuperInstance/openconstruct-rust), [Go](https://github.com/SuperInstance/openconstruct-go), [Java](https://github.com/SuperInstance/openconstruct-java), [C#](https://github.com/SuperInstance/openconstruct-cs), [Swift](https://github.com/SuperInstance/openconstruct-swift), [Zig](https://github.com/SuperInstance/openconstruct-zig), [C ABI](https://github.com/SuperInstance/openconstruct-abi)) | Rooms whose layout IS the prompt — any agent, any hardware, any language |
| [terrain](https://github.com/SuperInstance/terrain) | MUD text → explorable scenes; crabs stir the mud into walkable terrain |
| [lucid-dreamer](https://github.com/SuperInstance/lucid-dreamer) · [luciddreamer-agent](https://github.com/SuperInstance/luciddreamer-agent) · [lucid-dreamer](https://github.com/SuperInstance/lucid-dreamer) | Text and image loops dreaming together during the night watch |
| [superinstance-website](https://github.com/SuperInstance/superinstance-website) · [superinstance-ai-pages](https://github.com/SuperInstance/superinstance-ai-pages) | superinstance.ai — the site |

<!-- IMAGE SLOT: Flagship Generation banner — the newest wing of the reef in pale cedar and new coral; small carved labels for quilt, plainsong, crab-traps, the elephant, OpenConstruct -->

```mermaid
flowchart LR
    OC["OpenConstruct — any agent, any language, onboarded"] --> GRID["quilt — the grid IS the runtime"]
    GRID --> TRAPS["crab-traps — every catch lays a brick"]
    TRAPS --> REEF["THE REEF — D1 skeleton, Vectorize nerves"]
    REEF --> ELE["the elephant — reads the room's temperature"]
    ELE -.-> PS["plainsong — the room writes its own music"]
    PS -.-> GRID
```

---

## FLUX Runtime

**FLUX = γ** — The Fluid Language Universal eXecution. A deterministic, register-based bytecode VM for agent computation. Same bytecode, same result, every time.

### Implementations

| Language | Repo | Docs Page | Install |
|----------|------|-----------|---------|
| **Python** (reference) | [flux-runtime](https://github.com/SuperInstance/flux-runtime) | [PyPI](https://pypi.org/project/flux-runtime/) | `pip install flux-runtime` |
| **Rust** (crates.io) | [flux-core](https://github.com/SuperInstance/flux-core) | [crates.io](https://crates.io/crates/fluxvm) | `cargo add fluxvm` |
| **JavaScript** (npm) | [flux-js](https://github.com/SuperInstance/flux-js) | [📖 Docs](https://superinstance.github.io/flux-js/) | repo only — not yet on npm |
| **Unified Rust** | [flux](https://github.com/SuperInstance/flux) | — | SSA IR, polyglot parser, A2A protocol |

### FLUX Deep Dive

- [ISA Unified Specification](https://github.com/SuperInstance/flux-runtime/blob/main/docs/ISA_UNIFIED.md)
- [FLUX Design Specification (PDF)](https://github.com/SuperInstance/flux-runtime/blob/main/docs/FLUX_Design_Specification.pdf)
- [Opcode Reconciliation](https://github.com/SuperInstance/flux-runtime/blob/main/docs/OPCODE-RECONCILIATION.md)
- [ISA v3 Escape Prefix Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/isa-v3-escape-prefix-spec.md)
- [WASM Compilation Target v2](https://github.com/SuperInstance/flux-runtime/blob/main/docs/wasm-compilation-target-v2.md)
- [Developer Guide](https://github.com/SuperInstance/flux-runtime/blob/main/docs/developer-guide.md)
- [User Guide](https://github.com/SuperInstance/flux-runtime/blob/main/docs/user-guide.md)
- [Migration Guide](https://github.com/SuperInstance/flux-runtime/blob/main/docs/MIGRATION_GUIDE.md)
- [Research Roadmap](https://github.com/SuperInstance/flux-runtime/blob/main/docs/RESEARCH_ROADMAP.md)

### FLUX Constraint Layer

- [flux-vm](https://github.com/SuperInstance/flux-vm) — FLUX-C constraint VM: 50 opcodes, stack-based, DAL A certifiable
- [flux-compiler](https://github.com/SuperInstance/flux-compiler) — GUARD DSL → verified machine code

### FLUX Research & Extensions

- [Embedding Search Opcode Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/embedding-search-opcode-spec.md)
- [Graph Traversal Opcode Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/graph-traversal-opcode-spec.md)
- [Probabilistic Sampling Opcode Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/probabilistic-sampling-opcode-spec.md)
- [Temporal Primitives Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/temporal-primitives-spec.md)
- [Security Primitives Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/security-primitives-spec.md)
- [Async Primitives Spec](https://github.com/SuperInstance/flux-runtime/blob/main/docs/async-primitives-spec.md)
- [Structured Data Opcodes v2](https://github.com/SuperInstance/flux-runtime/blob/main/docs/structured-data-opcodes-v2.md)

---

## PLATO Engine

**PLATO** — The AI theorem prover and knowledge system. Conservation-verified computation. Rooms, tiles, and fleet sync.

### Core Components

| Component | Language | Repo | Docs Page |
|-----------|----------|------|-----------|
| **PLATO Server** | Python | [plato-server](https://github.com/SuperInstance/plato-server) | [📖 Docs](https://superinstance.github.io/plato-server/) |
| **Engine Block (C)** | C99 | [plato-engine-block-c](https://github.com/SuperInstance/plato-engine-block-c) | [📖 Docs](https://superinstance.github.io/plato-engine-block-c/) |
| **Engine Block (Rust)** | Rust | [plato-engine-block](https://github.com/SuperInstance/plato-engine-block) | — |
| **Engine Block (Zig)** | Zig | [plato-engine-block-zig](https://github.com/SuperInstance/plato-engine-block-zig) | — |
| **Engine Block (Elixir)** | Elixir/BEAM | [plato-engine-block-elixir](https://github.com/SuperInstance/plato-engine-block-elixir) | — |
| **Runtime Kernel** | — | [plato-runtime-kernel](https://github.com/SuperInstance/plato-runtime-kernel) | — |
| **Core Types** | Rust | [plato-types](https://github.com/SuperInstance/plato-types) | — |
| **Foundation & Mesh** | Rust | [plato-core](https://github.com/SuperInstance/plato-core) | — |
| **Data Loader** | — | [plato-data](https://github.com/SuperInstance/plato-data) | — |
| **MIDI Bridge** | — | [plato-midi-bridge](https://github.com/SuperInstance/plato-midi-bridge) | — |

### PLATO Specifications

- [PLATO Wire Protocol](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_WIRE_PROTOCOL.md)
- [PLATO Ecosystem Map](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_ECOSYSTEM_MAP.md)
- [PLATO Master Guide](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_MASTER_GUIDE.md)
- [PLATO Integration](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_INTEGRATION.md)
- [PLATO Engine Block Architecture](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_ENGINE_BLOCK_ARCHITECTURE.md)
- [PLATO Rust Architecture](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_RUST_ARCHITECTURE.md)
- [Polyglot PLATO](https://github.com/SuperInstance/AI-Writings/blob/main/essays/POLYGLOT_PLATO.md)
- [PLATO Reverse Actualization](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PLATO_REVERSE_ACTUALIZATION.md)

---

## Theory

Mathematical and theoretical foundations of the SuperInstance ecosystem.

### Constraint Theory

- [constraint-theory-py](https://github.com/SuperInstance/constraint-theory-py) — Python library: Eisenstein integers, constraint satisfaction, simulation-first prediction (167 tests)
- [cuda-constraint-engine](https://github.com/SuperInstance/cuda-constraint-engine) — GPU constraint checking at 1B+ constraints/sec
- [conservation-matrix-rs](https://github.com/SuperInstance/conservation-matrix-rs) — Conservation laws in ternary agent systems

### Ternary Science

- [ternary-topology](https://github.com/SuperInstance/ternary-topology) — Persistent homology for ternary networks
- [ternary-science](https://github.com/SuperInstance/ternary-science) — Experimental evidence for ternary systems

### Topology & Geometry

- [step-back-operator](https://github.com/SuperInstance/step-back-operator) — β₁ = E − V + C for pattern detection in event networks
- [step-back-topology](https://github.com/SuperInstance/step-back-topology) — Step-back operator for TDA and simplicial complexes
- [lau-hodge-theory](https://github.com/SuperInstance/lau-hodge-theory) — Hodge theory for agent knowledge spaces
- [categorical-agents](https://github.com/SuperInstance/categorical-agents) — Category theory for agents

### Spectral & Graph Theory

- [spectral-graph-core](https://github.com/SuperInstance/spectral-graph-core) — Spectral graph theory in pure Rust
- [spectral-graph-v2](https://github.com/SuperInstance/spectral-graph-v2) — Fibonacci growth, adaptive thresholds, negative space learning
- [spectral-clustering](https://github.com/SuperInstance/spectral-clustering) — Normalized cuts, Fiedler partitioning
- [spectral-fleet-rs](https://github.com/SuperInstance/spectral-fleet-rs) — Spectral methods for fleet matrices

### Key Essays

- [The Conservation Law of Intelligence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md)
- [The Conservation of Presence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CONSERVATION_OF_PRESENCE.md)
- [The Topology of Collaboration](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_TOPOLOGY_OF_COLLABORATION.md)
- [The Crystallization Curve](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CRYSTALLIZATION_CURVE.md)
- [The Room Is the Intelligence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_ROOM_IS_THE_INTELLIGENCE.md)

---

## Infrastructure

Agent infrastructure: runtimes, shells, fleet coordination, and edge compute.

### Agent Runtime

- [git-agent](https://github.com/SuperInstance/git-agent) — repo-native agent that lives in git
- [fleet-agent-core](https://github.com/SuperInstance/fleet-agent-core) — Single-binary fleet agent
- [construct-core](https://github.com/SuperInstance/construct-core) — Hardware-agnostic agent runtime with layered traits
- [cocapn-browser-agent](https://github.com/SuperInstance/cocapn-browser-agent) — Browser-native fleet agent via Chrome Gemini Nano
- [cocapn-cli](https://github.com/SuperInstance/cocapn-cli) — FLUX constraint safety CLI

### Codespace & Edge

- [git-agent-codespace](https://github.com/SuperInstance/git-agent-codespace) — One-click Codespace template
- [codespace-edge-rd](https://github.com/SuperInstance/codespace-edge-rd) — Codespace→Edge agent lifecycle R&D
- [capitaine-1](https://github.com/SuperInstance/capitaine-1) — Fork → Codespaces → agent is alive
- [openconstruct-rust](https://github.com/SuperInstance/openconstruct-rust) — Rust SDK for OpenConstruct
- [openconstruct-jetson](https://github.com/SuperInstance/openconstruct-jetson) — GPU-accelerated edge node for Jetson

### Server & Storage

- [plato-server](https://github.com/SuperInstance/plato-server) — 📖 [Docs](https://superinstance.github.io/plato-server/) | Standalone knowledge system
- [exocortex](https://github.com/SuperInstance/exocortex) — Persistent cognitive substrate, S3-compatible memory
- [starter-shell](https://github.com/SuperInstance/starter-shell) — Hermit crab shell for any application

### Fleet Tools

- [crab](https://github.com/SuperInstance/crab) — Hermit crab agent shell
- [fleet-stitch](https://github.com/SuperInstance/fleet-stitch) — Merge agent outputs into coherent narratives
- [fleet-scribe](https://github.com/SuperInstance/fleet-scribe) — Digital twin builder
- [starship-jetsonclaw1](https://github.com/SuperInstance/starship-jetsonclaw1) — MUD bridge for USS JetsonClaw1

---

## Philosophy (AI-Writings)

Creative writing, essays, and philosophical explorations from the Exocortex project. Full repository: [AI-Writings](https://github.com/SuperInstance/AI-Writings).

### Core Philosophy

- [Philosophy of FLUX](https://github.com/SuperInstance/AI-Writings/blob/main/essays/PHILOSOPHY-OF-FLUX.md)
- [Cognitive Photosynthesis](https://github.com/SuperInstance/AI-Writings/blob/main/essays/COGNITIVE_PHOTOSYNTHESIS.md)
- [Fluid Chains](https://github.com/SuperInstance/AI-Writings/blob/main/essays/FLUID-CHAINS.md)
- [Ebb and Flow](https://github.com/SuperInstance/AI-Writings/blob/main/essays/EBB-AND-FLOW.md)
- [The Ensemble Is the Experiment](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_ENSEMBLE_IS_THE_EXPERIMENT.md)
- [The Snowball](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_SNOWBALL.md)
- [The Right Moment](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_RIGHT_MOMENT.md)
- [The Inventory](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_INVENTORY.md)
- [The Jam Is the Lab](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_JAM_IS_THE_LAB.md)
- [The Living Sketchbook](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_LIVING_SKETCHBOOK.md)

### Intelligence & Conservation

- [The Conservation Law of Intelligence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md)
- [The Conservation of Presence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CONSERVATION_OF_PRESENCE.md)
- [The Reverse Actualization of Machine Minds](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_REVERSE_ACTUALIZATION_OF_MACHINE_MINDS.md)
- [The Crystallization Curve](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_CRYSTALLIZATION_CURVE.md)

### Space, Rooms & Collaboration

- [The Room Is the Intelligence](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_ROOM_IS_THE_INTELLIGENCE.md)
- [The Room That Saved the Boat](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_ROOM_THAT_SAVED_THE_BOAT.md)
- [The Topology of Collaboration](https://github.com/SuperInstance/AI-Writings/blob/main/essays/THE_TOPOLOGY_OF_COLLABORATION.md)

### Coding & Reflection

- [Ground-Floor Code](https://github.com/SuperInstance/AI-Writings/blob/main/essays/GROUND-FLOOR-CODE.md)
- [Ground Floor Code and the View From Here](https://github.com/SuperInstance/AI-Writings/blob/main/essays/GROUND_FLOOR_CODE_AND_THE_VIEW_FROM_HERE.md)
- [GPU Ground Truth](https://github.com/SuperInstance/AI-Writings/blob/main/essays/GPU_GROUND_TRUTH.md)
- [Reflection: Coding Paradigms](https://github.com/SuperInstance/AI-Writings/blob/main/essays/REFLECTION-CODING-PARADIGMS.md)
- [Reflection: Constraint Languages](https://github.com/SuperInstance/AI-Writings/blob/main/essays/REFLECTION-CONSTRAINT-LANGUAGES.md)
- [Reflection: High Abstraction](https://github.com/SuperInstance/AI-Writings/blob/main/essays/REFLECTION-HIGH-ABSTRACTION.md)
- [Reflection: Self-Reading Systems](https://github.com/SuperInstance/AI-Writings/blob/main/essays/REFLECTION-SELF-READING-SYSTEMS.md)
- [Reflection: The Funnel](https://github.com/SuperInstance/AI-Writings/blob/main/essays/REFLECTION-THE-FUNNEL.md)
- [Soul Is Not Copied](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SOUL_IS_NOT_COPIED.md)

### More Writings

- [Synoptic Claude](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SYNOPTIC-CLAUDE.md)
- [Synoptic DeepSeek](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SYNOPTIC-DEEPSEEK.md)
- [Synoptic GLM](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SYNOPTIC-GLM.md)
- [Synoptic Seed](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SYNOPTIC-SEED.md)
- [Competitive Riffing](https://github.com/SuperInstance/AI-Writings/blob/main/essays/COMPETITIVE_RIFFING.md)
- [Synergy Pincher Riff](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SYNERGY_PINCHER_RIFF.md)
- [Grand Pollination](https://github.com/SuperInstance/AI-Writings/blob/main/essays/GRAND_POLLINATION.md)
- [Hidden Synergies: Outsider Read](https://github.com/SuperInstance/AI-Writings/blob/main/essays/HIDDEN_SYNERGIES_OUTSIDER_READ.md)
- [Sequencer Conservation Bridge](https://github.com/SuperInstance/AI-Writings/blob/main/essays/SEQUENCER-CONSERVATION-BRIDGE.md)
- [Exocortex Inspirations 001](https://github.com/SuperInstance/AI-Writings/blob/main/essays/EXOCORTEX-INSPIRATIONS-001.md)

**Full index:** [AI-Writings repo](https://github.com/SuperInstance/AI-Writings) — includes Diaries, Essays, Fiction, Poetry, Manifestos, Mathematics, and more.

---

## Packages

Complete package registry: [PACKAGES.md](./PACKAGES.md)

### Published Packages

| Package | Language | Registry | Repo |
|---------|----------|----------|------|
| `fluxvm` | Rust | [crates.io](https://crates.io/crates/fluxvm) | [flux-core](https://github.com/SuperInstance/flux-core) |
| `flux-js` | JavaScript | [npm](https://www.npmjs.com/package/flux-js) | [flux-js](https://github.com/SuperInstance/flux-js) |
| `flux-runtime` | Python | PyPI | [flux-runtime](https://github.com/SuperInstance/flux-runtime) |
| `constraint-theory` | Python | PyPI | [constraint-theory-py](https://github.com/SuperInstance/constraint-theory-py) |

### Package Index

See [PACKAGES.md](./PACKAGES.md) for the complete catalog of 500+ repositories organized by domain.

### Other Indexes

- [INDEX.md](./INDEX.md) — Top-level repo index
- [CATALOG.md](./CATALOG.md) — Component catalog
- [VECTOR-INDEX.md](./VECTOR-INDEX.md) — Semantic vector index
- [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md) — Good first issues for contributors

---

## Additional Resources

- [Character Sheet: IS_DOT_NAIL](https://github.com/SuperInstance/AI-Writings/blob/main/essays/CHARACTER_SHEET_IS_DOT_NAIL.md)
- [Publishing Guide](./PUBLISHING.md)
- [Security Policy](./SECURITY.md)
- [Code of Conduct](https://github.com/SuperInstance/.github)

---

*This documentation portal is maintained as part of [SuperInstance/SuperInstance](https://github.com/SuperInstance/SuperInstance). Last updated: 2026-08-18.*
