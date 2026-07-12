# SuperInstance Packages

A unified reference for every installable package across the SuperInstance ecosystem.

> **Stats:** 1,000+ repositories · 355 ternary · 128 plato · across Rust, Python, JS, and PHP

---

## Python (PyPI)

Published and available on [PyPI](https://pypi.org).

| Package | Repo | Version | Description | Install |
|---------|------|---------|-------------|---------|
| ✅ [plato-core](https://pypi.org/project/plato-core/) | [plato-core](https://github.com/SuperInstance/plato-core) | `0.1.0` | Foundation types and mesh registry for the SuperInstance ecosystem | `pip install plato-core` |
| ✅ [plato-torch](https://pypi.org/project/plato-torch/) | [plato-torch](https://github.com/SuperInstance/plato-torch) | `0.5.0` | PLATO self-training rooms — 21 AI training methods as grab-and-go rooms | `pip install plato-torch` |
| ✅ [plato-config](https://pypi.org/project/plato-config/) | [plato-config](https://github.com/SuperInstance/plato-config) | `0.1.0` | PLATO configuration — agent identity, room settings, fleet parameters | `pip install plato-config` |
| ✅ [plato-papers](https://pypi.org/project/plato-papers/) | [plato-papers](https://github.com/SuperInstance/plato-papers) | `0.1.0` | Research paper management — citation tracking, bibliography, knowledge graph | `pip install plato-papers` |
| ✅ [plato-meta-tiles](https://pypi.org/project/plato-meta-tiles/) | [plato-meta-tiles](https://github.com/SuperInstance/plato-meta-tiles) | `0.1.0` | Meta-tiles for PLATO — tiles about tiles, enabling higher-order reasoning | `pip install plato-meta-tiles` |
| ✅ [plato-fflearning](https://pypi.org/project/plato-fflearning/) | [plato-fflearning](https://github.com/SuperInstance/plato-fflearning) | `0.1.0` | Forward-Forward learning for PLATO — replacing backprop with positive/negative passes | `pip install plato-fflearning` |
| ✅ [plato-attention-tracker](https://pypi.org/project/plato-attention-tracker/) | [plato-attention-tracker](https://github.com/SuperInstance/plato-attention-tracker) | `0.1.0` | Attention as a first-class resource in PLATO | `pip install plato-attention-tracker` |
| ✅ [palaver-math](https://pypi.org/project/palaver-math/) | [palaver-math-pypi](https://github.com/SuperInstance/palaver-math-pypi) | `0.1.0` | Consensus mathematics from West African dialogue traditions | `pip install palaver-math` |

### In Progress (not yet on PyPI)

| Package | Repo | Description |
|---------|------|-------------|
| 🚧 exocortex | [exocortex](https://github.com/SuperInstance/exocortex) | Persistent cognitive substrate for multi-agent systems |
| 🚧 plato-mcp | [plato-mcp](https://github.com/SuperInstance/plato-mcp) | PLATO rooms as MCP tools — any MCP framework can use PLATO |
| 🚧 plato-room-musician | [plato-room-musician](https://github.com/SuperInstance/plato-room-musician) | Turns PLATO room activity into music — every room is a musician |
| 🚧 plato-hdc-bridge | [plato-hdc-bridge](https://github.com/SuperInstance/plato-hdc-bridge) | PLATO + HDC integration — bake rooms to SRAM images for XOR-POPCNT matching |

---

## Rust (crates.io)

All Rust crates have `Cargo.toml` and are ready for `cargo add`, but **none are published to crates.io yet**.

### FLUX

| Crate | Repo | Description | Status |
|-------|------|-------------|--------|
| 🚧 `fluxvm` | [flux-core](https://github.com/SuperInstance/flux-core) | FLUX bytecode runtime — register-based VM with assembler, A2A protocol, vocabulary system | In development |

### PLATO (Rust)

| Crate | Repo | Description | Status |
|-------|------|-------------|--------|
| 🚧 `plato-engine` | [plato-engine](https://github.com/SuperInstance/plato-engine) | High-performance PLATO tile engine — Rust replacement for Python server core | In development |
| 🚧 `plato-a2a` | [plato-a2a](https://github.com/SuperInstance/plato-a2a) | Agent-to-Agent (A2A) wire protocol for OpenConstruct | In development |
| 🚧 `plato-cortex` | [plato-cortex](https://github.com/SuperInstance/plato-cortex) | Cross-database mapping layer for Dual-DB JEPA perception-prediction | In development |
| 🚧 `plato-correlator` | [plato-correlator](https://github.com/SuperInstance/plato-correlator) | Cross-sense fusion engine — fuses text shadows from multiple sense modules | In development |
| 🚧 `plato-embed` | [plato-embed](https://github.com/SuperInstance/plato-embed) | Embedding utilities for PLATO tile similarity, clustering, and JEPA | In development |
| 🚧 `plato-explain` | [plato-explain](https://github.com/SuperInstance/plato-explain) | Explainability for PLATO predictions — trace lineage through databases | In development |
| 🚧 `plato-event` | [plato-event](https://github.com/SuperInstance/plato-event) | Event bus for PLATO nervous system publish/subscribe routing | In development |
| 🚧 `plato-fleet` | [plato-fleet](https://github.com/SuperInstance/plato-fleet) | Fleet discovery and resource management for Plato multi-device AI system | In development |
| 🚧 `plato-filter` | [plato-filter](https://github.com/SuperInstance/plato-filter) | Digital signal processing filters for PLATO tile streams | In development |
| 🚧 `plato-downsample` | [plato-downsample](https://github.com/SuperInstance/plato-downsample) | Intelligent downsampling for PLATO tile streams with anomaly preservation | In development |
| 🚧 `plato-distill` | [plato-distill](https://github.com/SuperInstance/plato-distill) | Progressive knowledge distillation tracking for PLATO rooms | In development |
| 🚧 `plato-diffusion` | [plato-diffusion](https://github.com/SuperInstance/plato-diffusion) | Progressive distillation pipeline for PLATO room intelligence | In development |
| 🚧 `plato-correlate` | [plato-correlate](https://github.com/SuperInstance/plato-correlate) | Cross-correlation and dependency detection for PLATO tile streams | In development |
| 🚧 `plato-coordination` | [plato-coordination](https://github.com/SuperInstance/plato-coordination) | Cross-room fleet coordination for PLATO nervous system | In development |
| 🚧 `plato-contract` | [plato-contract](https://github.com/SuperInstance/plato-contract) | Inter-agent contract negotiation and verification system | In development |
| 🚧 `plato-conserve` | [plato-conserve](https://github.com/SuperInstance/plato-conserve) | Conservation law tracking for PLATO tile transformations | In development |
| 🚧 `plato-compress` | [plato-compress](https://github.com/SuperInstance/plato-compress) | Lossless and lossy compression for PLATO tile data | In development |
| 🚧 `plato-capability` | [plato-capability](https://github.com/SuperInstance/plato-capability) | Capability descriptors and negotiation for PLATO rooms and agents | In development |
| 🚧 `plato-backtest` | [plato-backtest](https://github.com/SuperInstance/plato-backtest) | Backtesting framework for PLATO signal chain configurations | In development |
| 🚧 `plato-backprop` | [plato-backprop](https://github.com/SuperInstance/plato-backprop) | Backpropagation-through-prompt tracking for PLATO nano models | In development |
| 🚧 `plato-autonomy` | [plato-autonomy](https://github.com/SuperInstance/plato-autonomy) | Autonomy metrics and reporting for PLATO rooms | In development |
| 🚧 `plato-audio-jepa` | [plato-audio-jepa](https://github.com/SuperInstance/plato-audio-jepa) | Audio JEPA for PLATO nervous system — room perception from microphones | In development |
| 🚧 `plato-anomaly` | [plato-anomaly](https://github.com/SuperInstance/plato-anomaly) | Anomaly detection methods for PLATO tile streams | In development |
| 🚧 `plato-alert` | [plato-alert](https://github.com/SuperInstance/plato-alert) | Alert management for PLATO — creation, routing, acknowledgment, escalation | In development |
| 🚧 `plato-forge-bridge` | [plato-forge-bridge](https://github.com/SuperInstance/plato-forge-bridge) | Bridge between ForgeFlux tile decomposition pipeline and Plato agent rooms | In development |

### Ternary Fleet (Rust)

Core libraries for balanced ternary {-1, 0, +1} compute across 355 repos.

| Crate | Repo | Description | Status |
|-------|------|-------------|--------|
| 🚧 `ternary-types` | [ternary-types](https://github.com/SuperInstance/ternary-types) | Central type hub — `Ternary`, `TritVector`, `TernaryMatrix`, packed encoding, Z₃ arithmetic | In development |
| 🚧 `ternary-tnn` | [ternary-tnn](https://github.com/SuperInstance/ternary-tnn) | Ternary Neural Network layers — INT2 scaling, LUT matmul, NEON acceleration, straight-through estimation | In development |
| 🚧 `ternary-watermark` | [ternary-watermark](https://github.com/SuperInstance/ternary-watermark) | Ternary watermarking for neural model provenance — survives quantization | In development |
| 🚧 `ternary-room` | [ternary-room](https://github.com/SuperInstance/ternary-room) | Recursive room-tensor architecture — every room is a cell, every cell is a room | In development |
| 🚧 `ternary-search-rs` | [ternary-search-rs](https://github.com/SuperInstance/ternary-search-rs) | High-performance ternary vector search server | In development |
| 🚧 `ternary-zkp` | [ternary-zkp](https://github.com/SuperInstance/ternary-zkp) | Zero-knowledge proofs over the ternary field GF(3) | In development |
| 🚧 `ternary-ring` | [ternary-ring](https://github.com/SuperInstance/ternary-ring) | Ring and field structures — Z/3Z arithmetic, polynomial rings, GF(3ⁿ) extensions | In development |
| 🚧 `ternary-quantum` | [ternary-quantum](https://github.com/SuperInstance/ternary-quantum) | Quantum-inspired computing — qutrits, ternary Pauli operators, QFT over Z/3Z | In development |
| 🚧 `ternary-sheaf` | [ternary-sheaf](https://github.com/SuperInstance/ternary-sheaf) | Sheaf theory and cohomology in ternary space — sections, restrictions, Čech complexes | In development |
| 🚧 `ternary-signals` | [ternary-signals](https://github.com/SuperInstance/ternary-signals) | Signal processing — Fourier analysis, spectral density, frequency detection | In development |
| 🚧 `ternary-streaming` | [ternary-streaming](https://github.com/SuperInstance/ternary-streaming) | Streaming processing — sliding windows, aggregation, pattern detection | In development |
| 🚧 `ternary-regex` | [ternary-regex](https://github.com/SuperInstance/ternary-regex) | Pattern matching on ternary sequences — NFA, DFA, wildcard, minimization | In development |
| 🚧 `ternary-voting` | [ternary-voting](https://github.com/SuperInstance/ternary-voting) | Voting and consensus mechanisms with ternary values | In development |
| 🚧 `ternary-quorum` | [ternary-quorum](https://github.com/SuperInstance/ternary-quorum) | Distributed decision making with ternary voting and configurable thresholds | In development |
| 🚧 `ternary-routing` | [ternary-routing](https://github.com/SuperInstance/ternary-routing) | Self-optimizing request routing with ternary feedback — converges without central config | In development |
| 🚧 `ternary-registry` | [ternary-registry](https://github.com/SuperInstance/ternary-registry) | Service registry for GPU fleet — health-based ternary scoring, CRDT sync | In development |
| 🚧 `ternary-sandbox` | [ternary-sandbox](https://github.com/SuperInstance/ternary-sandbox) | Safe sandbox for ternary agent experiments — configurable environments, repeatable seeds | In development |
| 🚧 `ternary-shipyard` | [ternary-shipyard](https://github.com/SuperInstance/ternary-shipyard) | Construction and assembly of complex agent systems from declarative blueprints | In development |
| 🚧 `ternary-reef` | [ternary-reef](https://github.com/SuperInstance/ternary-reef) | Coral reef ecosystem pattern for long-lived collective intelligence | In development |
| 🚧 `ternary-story` | [ternary-story](https://github.com/SuperInstance/ternary-story) | Ternary narrative engine — stories where every choice has three paths | In development |

<details>
<summary><b>Show all 355 ternary crates →</b></summary>

The full ternary fleet spans mathematics, physics, biology analogues, GPU computing, distributed systems, music theory, machine learning, and more. Browse all: [`gh repo list SuperInstance --limit 1000 --json name --jq '.[].name' | grep '^ternary-'`](https://github.com/orgs/SuperInstance/repositories?q=ternary-)

</details>

### Research Libraries (Rust)

| Crate | Repo | Description | Status |
|-------|------|-------------|--------|
| 🚧 `persistent-sheaf` | [persistent-sheaf](https://github.com/SuperInstance/persistent-sheaf) | Persistent sheaf cohomology, cellular sheaf Laplacians, multi-modal data fusion | In development |
| 🚧 `witness-topology` | [witness-topology](https://github.com/SuperInstance/witness-topology) | Topological data analysis for agent behavior verification using witness complexes | In development |
| 🚧 `witness-complex` | [witness-complex](https://github.com/SuperInstance/witness-complex) | Witness complex construction — random, maxmin, k-means++ landmark selection | In development |
| 🚧 `tropical-algebra` | [tropical-algebra](https://github.com/SuperInstance/tropical-algebra) | Tropical algebra (max-plus semiring) — spectral analysis, polynomial roots, ReLU equivalence | In development |
| 🚧 `tropical-geometry` | [tropical-geometry](https://github.com/SuperInstance/tropical-geometry) | Tropical geometry for neural network analysis — max-plus algebra, tropical polynomials | In development |
| 🚧 `tropical-attention` | [tropical-attention](https://github.com/SuperInstance/tropical-attention) | Tropical attention — max-plus softmax, tropical transformer layers | In development |
| 🚧 `tropical-neural` | [tropical-neural](https://github.com/SuperInstance/tropical-neural) | Tropical geometry for NN analysis — tropical polynomial division, piecewise-linear representation | In development |
| 🚧 `optimal-transport-rs` | [optimal-transport-rs](https://github.com/SuperInstance/optimal-transport-rs) | Optimal transport — Sinkhorn algorithm, Wasserstein distances, barycenters, JKO flows | In development |
| 🚧 `optimal-control` | [optimal-control](https://github.com/SuperInstance/optimal-control) | Optimal control theory — LQR, bang-bang, Hamilton-Jacobi-Bellman, Pontryagin's maximum principle | In development |
| 🚧 `particle-swarm` | [particle-swarm](https://github.com/SuperInstance/particle-swarm) | Particle swarm optimization — multiple topologies, inertia strategies, multi-objective | In development |
| 🚧 `pid-control` (as `robo-pid-control`) | [pid-control](https://github.com/SuperInstance/pid-control) | Research-grade PID controller — anti-windup, bumpless transfer, auto-tuning | In development |
| 🚧 `wavelet-core` | [wavelet-core](https://github.com/SuperInstance/wavelet-core) | Wavelet transforms — Haar, Daubechies D4, CWT, thresholding, denoising | In development |
| 🚧 `vector-clock-rs` | [vector-clock-rs](https://github.com/SuperInstance/vector-clock-rs) | Vector clocks — Lamport timestamps, conflict detection, causal ordering | In development |
| 🚧 `vector-clock` | [vector-clock](https://github.com/SuperInstance/vector-clock) | Vector clocks for causal ordering — happened-before, concurrency detection, merge | In development |
| 🚧 `treap-rs` | [treap-rs](https://github.com/SuperInstance/treap-rs) | Treap — random priorities, split/merge, union, intersection, order statistics | In development |
| 🚧 `young-tableau-rs` | [young-tableau-rs](https://github.com/SuperInstance/young-tableau-rs) | Young tableaux — Robinson-Schensted insertion, hook length formula, Schensted correspondence | In development |
| 🚧 `yoneda` | [yoneda](https://github.com/SuperInstance/yoneda) | Yoneda lemma and representable functors for agent systems | In development |
| 🚧 `penrose-lattice` | [penrose-lattice](https://github.com/SuperInstance/penrose-lattice) | Penrose tilings as spectral graphs — Fibonacci substitution, inflation/deflation symmetry | In development |
| 🚧 `partition-tolerance` | [partition-tolerance](https://github.com/SuperInstance/partition-tolerance) | Network partition simulation — detector, quorum checking, stale read detection, healing | In development |
| 🚧 `page-replace` | [page-replace](https://github.com/SuperInstance/page-replace) | Page replacement algorithms — FIFO, LRU, Clock, LFU with hit rate tracking | In development |
| 🚧 `packet-capture` | [packet-capture](https://github.com/SuperInstance/packet-capture) | Packet parsing — protocol dissection for TCP/UDP/ICMP headers | In development |
| 🚧 `transfer-entropy` | [transfer-entropy](https://github.com/SuperInstance/transfer-entropy) | Transfer entropy — detect information flow between time series with significance testing | In development |
| 🚧 `thermodynamics` | [thermodynamics](https://github.com/SuperInstance/thermodynamics) | Thermodynamics — ideal gas, Carnot cycle, entropy, thermodynamic potentials, heat engines | In development |
| 🚧 `thermal-equilibrium` | [thermal-equilibrium](https://github.com/SuperInstance/thermal-equilibrium) | Thermal metaphor for multi-agent load balancing | In development |
| 🚧 `texture-synth` | [texture-synth](https://github.com/SuperInstance/texture-synth) | Texture synthesis — Perlin noise, value noise, Worley noise, turbulence | In development |
| 🚧 `tiny-neural` | [tiny-neural](https://github.com/SuperInstance/tiny-neural) | Tiny neural network library — from-scratch tensors, layers, backprop, optimizers | In development |
| 🚧 `super-tiny-ecs` | [tiny-ecs](https://github.com/SuperInstance/tiny-ecs) | Minimal archetype-based ECS — zero external dependencies, zero unsafe, zero hot-path allocation | In development |
| 🚧 `tiny-agent-protocol` | [tiny-agent-protocol](https://github.com/SuperInstance/tiny-agent-protocol) | Minimal HTTP protocol for microcontrollers — 256-byte frames, plain text serialization | In development |
| 🚧 `token-stream` | [token-stream](https://github.com/SuperInstance/token-stream) | Lexical token stream — position tracking, lookahead, span management for compilers | In development |
| 🚧 `tonnetz-constraints` | [tonnetz-constraints](https://github.com/SuperInstance/tonnetz-constraints) | Constraint satisfaction through musical voice-leading — Eisenstein lattice IS the Tonnetz | In development |
| 🚧 `tick-engine` | [tick-engine](https://github.com/SuperInstance/tick-engine) | Temporal coordination — tick clock with BPM adaptation, swing, T-minus scheduling | In development |
| 🚧 `t-minus-rs` | [t-minus-rs](https://github.com/SuperInstance/t-minus-rs) | Countdown/timer primitives — scheduling, deadline propagation, backpressure | In development |
| 🚧 `topology-bench` | [topology-bench](https://github.com/SuperInstance/topology-bench) | CLI/library for benchmarking graph topologies | In development |
| 🚧 `topological-sort-agent` | [topological-sort-agent-rs](https://github.com/SuperInstance/topological-sort-agent-rs) | Advanced topological sorting — parallel, priority-aware, incremental algorithms | In development |
| 🚧 `topo-sonata-rs` | [topo-sonata-rs](https://github.com/SuperInstance/topo-sonata-rs) | Topological analysis of musical sonata form | In development |
| 🚧 `vibe-graph` | [vibe-graph](https://github.com/SuperInstance/vibe-graph) | Directed graph with vibe diffusion — core abstraction for the Grand Pattern | In development |
| 🚧 `vibe-core` | [vibe-core](https://github.com/SuperInstance/vibe-core) | Core primitives for the Grand Pattern's vibe system | In development |
| 🚧 `vessel-constellation` | [vessel-constellation](https://github.com/SuperInstance/vessel-constellation) | N-body gravitational simulation of a fleet of vessels and their orbiting repositories | In development |
| 🚧 `venue-personality` | [venue-personality](https://github.com/SuperInstance/venue-personality) | How venues develop personality over time — the character of a place | In development |
| 🚧 `neural-plato` | [neural-plato](https://github.com/SuperInstance/neural-plato) | Fortran + Rust hybrid — sparse memory, Tucker decomposition, Eisenstein snap, forgetting curves | In development |

---

## JavaScript (npm)

All JS packages have `package.json` and build configs but are **not yet published to npm**.

| Package | Repo | Description | Status |
|---------|------|-------------|--------|
| 🚧 `@cocapn/plato-client` | [plato-client-js](https://github.com/SuperInstance/plato-client-js) | PLATO room protocol client — Node + browser, zero dependencies | In development |
| 🚧 `podiumjs` | [podiumjs-rocks](https://github.com/SuperInstance/podiumjs-rocks) | WebGPU-based alternative to Curtains.js — interactive planes and post-processing | In development |
| 🚧 `plato-semantic-search` | [plato-semantic-search](https://github.com/SuperInstance/plato-semantic-search) | Semantic search client for PLATO | In development |

---

## PHP (Packagist)

| Package | Repo | Description | Status |
|---------|------|-------------|--------|
| 🚧 `superinstance/plato-client-php` | [plato-client-php](https://github.com/SuperInstance/plato-client-php) | PHP client library for PLATO room servers — submit tiles, query knowledge, manage rooms | In development |

---

## Legend

- ✅ **Published** — available on the registry, `pip install` / `cargo add` / `npm install` works now
- 🚧 **In development** — code exists in repo, not yet pushed to the registry

---

## Ecosystem Map

| System | Repos | Languages | Description |
|--------|-------|-----------|-------------|
| **PLATO** | 128 | Python, Rust, JS, PHP | Multi-sensor AI nervous system — tile streams, rooms, agent coordination |
| **Ternary Fleet** | 355 | Rust | Balanced ternary {-1, 0, +1} computing — from types to neural nets to quantum analogues |
| **FLUX** | 3+ | Rust | Bytecode VM for agent execution — Fluid Language Universal eXecution |
| **Research Libraries** | 80+ | Rust, Python, C | Standalone algorithms — topology, algebra, control theory, signal processing |
| **OpenConstruct** | 20+ | Multi | Modular building system across languages |

---

*Last updated: 2026-07-12 · Maintained by [SuperInstance](https://github.com/SuperInstance)*
