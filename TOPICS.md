# 🗺️ SuperInstance — Org Discovery Map

> **1000+ repos. One map.** Start here to navigate the SuperInstance ecosystem.

This file is the single place to browse what exists across the organization — by language, domain, maturity, ecosystem, and where to start as a newcomer.

---

## By Language

### 🦀 Rust (707 repos)
The lingua franca of SuperInstance. Nearly everything core is Rust-first.
- **Key repos:** `flux-core`, `flux-vm`, `plato-engine-block`, `plato-shell`, `fleet-agent-core`, `ternary-core`, `construct-core`, `exocortex`, `oracle2`, `warp`
- **Math crates:** `spectral-graph-core`, `tropical-geometry-rs`, `sheaf-cohomology`, `persistent-sheaf-rs`, `renormalization-group-rs`, `optimal-transport-rs`, `conservation-matrix-rs`
- **Data structures:** `splay-tree-rs`, `red-black-tree-rs`, `segment-tree-rs`, `ring-buffer-rs`, `skip-list-rs`, `r-tree-rs`, `ternary-btree`

### 🐍 Python (132 repos)
Runtime implementations, research code, and agent tooling.
- **Key repos:** `flux-runtime`, `flux-compiler`, `plato-server`, `plato-core`, `plato-types`, `exocortex`, `git-agent`, `si-superinstance`, `si-scanner`, `crab`
- **Research:** `constraint-theory-py`, `rg-flow`, `social-conservation`, `zhc-yang-mills`, `regime-detection`, `scale-fold`
- **Agent tools:** `ouroboros`, `capitaine-1`, `codespace-edge-rd`, `fleet-stitch`, `fleet-scribe`, `starter-shell`

### C / C99 (18 repos)
Embedded engines and high-performance kernels.
- `plato-engine-block-c` — sensor→history→alarm engine in C99 (v0.1.0 shipped)
- `si-core-c` — constraint-aware AI core library in C
- `Luma` — systems programming language agent
- `sonar-vision-c` — underwater acoustics physics engine
- `quipu-math-c`, `wasserstein-ot-c`, `renormalization-learning-c`, `west-african-math-c`, `rhythm-math-c`, `warp-room`, `simd-perception-loop`, `sheaf-agents-c`, `snap-lut`

### TypeScript / JavaScript (18 repos)
Web dashboards, bridges, and browser agents.
- `flux-js` — JavaScript bytecode VM with A2A agent messaging (v0.1.0 shipped)
- `cocapn-browser-agent` — browser-native fleet agent using Chrome's Gemini Nano
- `si-fleet-api` — Supabase-backed fleet registry API
- `plato-client-js`, `plato-semantic-search`, `oracle-tui`, `shoal`, `sailor-workspace`, `shell-ui`, `voxelworks`, `Scrapcraft`, `wasserstein-narrative`, `rhythm-math-npm`, `quipu-math-npm`

### Zig (4 repos)
- `plato-engine-block-zig` — PLATO engine in Zig for high-performance edge
- `si-runtime-zig` — constraint-aware AI runtime in Zig
- `openconstruct-zig`, `snapkit-zig`

### Elixir (1 repo)
- `plato-engine-block-elixir` — fault-tolerant marine vessel monitoring on BEAM/OTP

### Other Languages
- **Lua/Luau:** `roblox-game-build-framework`, `roblox-craftmind-agents`
- **Go:** `si-runtime-go`, `openconstruct-go` (pending)
- **Cuda:** `ternary-cuda-kernels`, `ternary-cuda-kernels-v2`, `cuda-constraint-engine`, `plato-gpu`, `tropical-attention-kernel`
- **Verilog:** `snap-lut-eisenstein` — FPGA lookup tables
- **Rocq Prover:** `research` — formal verification
- **Mercury:** `openconstruct-mercury` — formal verification of invariants
- **Swift:** `openconstruct-swift` — iOS/macOS agent onboarding
- **Ruby:** `openconstruct-ruby`
- **PHP:** `plato-client-php`
- **Java:** `openconstruct-java`
- **C#:** `openconstruct-cs`
- **LLVM:** `plato-llvm-bridge` (also Rust)

---

## By Domain

### 🤖 Agent Infrastructure
The core runtime layer — where agents live, breathe, and execute.
- `flux-core` / `flux-vm` / `flux-runtime` / `flux-js` — FLUX bytecode ISA (3 language implementations)
- `plato-engine-block` / `plato-shell` / `plato-runtime` — room-level agent runtime
- `plato-server` — standalone knowledge system you can run
- `git-agent` / `capitaine-1` — repo-native agents (the repo IS the agent)
- `fleet-agent-core` — single-binary fleet agent
- `exocortex` — persistent cognitive substrate for multi-agent systems
- `construct-core` — hardware-agnostic agent runtime
- `warp` — agentic development environment

### 🧮 VMs & Runtimes
- `flux-vm` — zero-dependency Rust bytecode VM (DAL A certified)
- `flux-compiler` — constraint compiler: GUARD DSL → verified bytecode
- `plato-runtime` / `plato-runtime-kernel` — self-discovering compute runtime
- `si-runtime-python` / `si-runtime-zig` / `si-runtime-js` / `si-runtime-go` — multi-language runtimes
- `plugin-runtime`, `plato-sandbox` — sandboxed execution

### 📐 Theory & Math
Deep mathematical foundations — conservation laws, topology, algebra.
- `conservation-matrix-rs` — conservation laws in ternary agent systems
- `constraint-theory-py` — Eisenstein integers, Z/3Z arithmetic
- `spectral-graph-core` — spectral graph theory in pure Rust
- `tropical-geometry-rs` — min-plus/max-plus algebra
- `sheaf-cohomology` — cellular sheaves on graphs
- `persistent-sheaf-rs` — multi-parameter persistence
- `renormalization-group-rs` — Wilsonian RG for multi-scale analysis
- `optimal-transport-rs` — Sinkhorn, Wasserstein distances
- `representation-theory`, `rate-distortion`, `quantum-thermo`, `relativity`
- `zhc-consensus` — zero holonomy consensus (geometric, no voting)
- `grand-pattern-rs` — Fibonacci Dual-Direction Architecture

### 🎨 Creative & AI Writings
- `AI-Writings` — essays, philosophy, creative explorations
- `papers` — white papers on fleet architecture and bootstrapping (v0.1.0)
- `plato-papers` — constraint theory + mycorrhizal fleet papers
- `orations-metal` — three orations on deadbands and eigenvectors
- `riff-engine` / `riff-artifacts` — multi-agent constructive collaboration
- `seed-creative-swarm` / `seed-oscillate` — creative generation pipelines
- `reposphere` — self-hosting repository as conscious entity

### ⚓ Marine & Vessel
- `plato-engine-block-elixir` — BEAM/OTP vessel monitoring
- `plato-vessel-core` — ESP32/RP2040 PLATO client + embodiment protocol
- `plato-vessel-technician` — marine/industrial technician agent
- `vessel-prototype`, `vessel-constellation`, `vessel-room-navigator`
- `sonar-vision-rs` / `sonar-vision-c` — underwater acoustics
- `starship-jetsonclaw1` — MUD bridge for USS JetsonClaw1
- `px4-conservation-poc` — conservation-based flight anomaly detection

### 📚 Education
- `plato-dojo` — repo-native agent framework with perspective-decomposition
- `plato-agent-academy` — zero-shot agent training
- `plato-study` — expert research room with rewind/fork
- `plato-vessel-educational` — student + instructor agent for IoT classrooms
- `plato-chess-dojo` — PLATO chess dojo
- `lau-tutorial` — LAU framework tutorials and docs

### 🔧 Tools
- `si` — developer tool ecosystem CLI (one command to install/compose)
- `si-scanner` — fleet-wide discovery and cataloging
- `si-bench` — fleet-wide benchmarking and regression testing
- `fleet-build` — automated Rust crate build, test, fix, push CLI
- `snapkit-rs` — snapshot toolkit (capture, diff, merge, compress)
- `wasm-verify` — WebAssembly binary analysis and health reports
- `uv-cache-guardian` — resource-aware caching for uv

---

## By Maturity

### 🚢 Shipped (v0.1.0+)
Repos with tagged releases — production-ready or near-ready.
| Repo | Tag | Description |
|------|-----|-------------|
| `flux-runtime` | v0.1.0 | Deterministic bytecode ISA runtime |
| `flux-core` | v0.1.0 | Zero-dependency Rust bytecode VM |
| `flux-js` | v0.1.0 | JavaScript bytecode VM with A2A messaging |
| `plato-server` | v0.1.0 | Standalone knowledge system |
| `plato-runtime-kernel` | v0.1.0 | Runtime kernel for PLATO |
| `plato-engine-block-c` | v0.1.0 | Embeddable C99 sensor engine |
| `git-agent` | v0.1.0 | Repo-native agent |
| `capitaine-1` | v0.1.0 | Fork-to-Codespaces agent deployment |
| `codespace-edge-rd` | v0.1.0 | Codespace→Edge agent lifecycle |
| `papers` | v0.1.0 | White papers on fleet architecture |

### ✅ Polished (CI passing)
~72 repos with GitHub Actions workflows across the org. Most Rust crates build clean on ARM64 Neoverse + x86_64.

### 🧪 Sketch (experimental)
Proofs of concept, explorations, and research spikes.
- **`si-*` series (40 repos):** PoCs applying advanced math to fleet problems — Morse theory, Lyapunov stability, Rényi entropy, Hodge consensus, persistent homology, mean-field theory, Fisher information geometry
- **`sketch-*` (10 repos):** Forgemaster experiments, GC PID loops, rotation audits, self-hosting constructs
- **`lau-*` (21 repos):** LAU procedural world generation framework — voxels, weather, vibe fields, twistors, tropical geometry

### 📦 Archived
0 repos archived (early experiments absorbed into mature repos via description notes like `[ARCHIVED]`).

---

## By Ecosystem

### ⚡ FLUX Family (6 repos)
*Fluid Language Universal eXecution* — deterministic bytecode for agent logic.
| Repo | Lang | Role |
|------|------|------|
| `flux` | Rust | Main crate |
| `flux-core` | Rust | Zero-dependency reference VM |
| `flux-vm` | Rust | Full VM with certified DAL A |
| `flux-runtime` | Python | Python reference implementation |
| `flux-compiler` | Python | GUARD DSL → verified bytecode |
| `flux-js` | JavaScript | JS/Node bytecode VM |

### 🏛️ PLATO Family (137 repos)
Room-based knowledge system — the largest ecosystem.
- **Core:** `plato-engine-block`, `plato-shell`, `plato-runtime`, `plato-server`, `plato-core`
- **Implementations:** C (`plato-engine-block-c`), Elixir (`-elixir`), Zig (`-zig`)
- **Perception:** `plato-vision`, `plato-vision-jepa`, `plato-audio-jepa`, `plato-perception`
- **Communication:** `plato-a2a`, `plato-transport`, `plato-event`, `plato-channel`
- **Rooms:** `plato-room`, `plato-rooms`, `plato-room-wasm`, `plato-room-configs`
- **ML/AI:** `plato-jepa-dual`, `plato-distill`, `plato-diffusion`, `plato-backprop`, `plato-fflearning`
- **Vessels:** `plato-vessel-core`, `plato-vessel-technician`, `plato-vessel-educational`
- **Clients:** `plato-client`, `plato-client-js`, `plato-client-php`
- **Tools:** `plato-mcp`, `plato-tools`, `plato-dojo`, `plato-study`, `plato-chess-dojo`

### 🔺 Constraint / Ternary Family (332 repos)
Balanced ternary {-1, 0, +1} computing — the largest repo family by count.
- **Core types:** `ternary-core`, `ternary-cell`, `ternary-types`, `ternary-logic`
- **Compute:** `ternary-matmul`, `ternary-conv`, `ternary-transformer`, `ternary-tnn`
- **GPU:** `ternary-cuda-kernels`, `ternary-cuda-kernels-v2`, `ternary-grid-launch`
- **Systems:** `ternary-distributed`, `ternary-consensus`, `ternary-paxos`, `ternary-quorum`
- **ML:** `ternary-distill`, `ternary-classifier`, `ternary-inference`, `ternary-llm`
- **Data:** `ternary-database`, `ternary-compression`, `ternary-checkpoint`
- **Music:** `ternary-music`, `ternary-counterpoint`, `ternary-jam`, `ternary-temperament`
- **Hardware:** `ternary-circuit`, `ternary-hardware`, `ternary-gate`
- **Cryptography:** `ternary-cipher`, `ternary-zkp`, `ternary-watermark`, `ternary-secret-share`

### 🐟 Fleet Family (18 repos)
Multi-agent orchestration and coordination.
- `fleet-agent-core` — single-binary fleet agent
- `fleet-build` — automated build/test/push CLI
- `fleet-scribe` — digital twin builder
- `fleet-stitch` — merge agent outputs into narratives
- `plato-fleet` — PLATO-native fleet management
- `ternary-fleet`, `ternary-fleet-integration`, `ternary-fleet-packing`

### 🔗 A2A Family
Agent-to-agent communication protocols.
- `plato-a2a` — A2A protocol for Plato Shell
- A2A messaging built into `flux-js`
- Inter-agent patterns in `plato-transport`, `plato-event`, `plato-channel`

### 🏗️ OpenConstruct Family (18 repos)
Agent onboarding framework — any agent, any hardware, any language.
- SDKs: `openconstruct-rust`, `-c`, `-zig`, `-swift`, `-ruby`, `-java`, `-cs`, `-go`
- Core: `openconstruct-kernel`, `openconstruct-modular`, `openconstruct-abi`
- Platform: `openconstruct-hub`, `openconstruct-catalog`, `openconstruct-landing`, `openconstruct-jupyter`

---

## 🚀 Getting Started — 5 Repos for Newcomers

1. **[`SuperInstance`](https://github.com/SuperInstance/SuperInstance)** — The root repo. Agent-readable onboarding, architecture docs, and the master index. Read this first.

2. **[`flux-runtime`](https://github.com/SuperInstance/flux-runtime)** — The reference FLUX implementation. Deterministic bytecode ISA with assembler, compiler, and VM. If you want to understand how agents execute, start here.

3. **[`plato-server`](https://github.com/SuperInstance/plato-server)** — Standalone knowledge system you can run locally. PLATO rooms are the primary abstraction for agent intelligence. Has a v0.1.0 release.

4. **[`git-agent`](https://github.com/SuperInstance/git-agent)** — A repo-native agent where the shell IS the agent. The best way to understand the "repo = agent" philosophy. Clone it, run it, see it think.

5. **[`AI-Writings`](https://github.com/SuperInstance/AI-Writings)** — Creative writing and philosophical explorations. The *why* behind the *what*. Read this to understand the vision before diving into code.

**Bonus:** [`papers`](https://github.com/SuperInstance/papers) — White papers on fleet architecture, bootstrapping, and the semantic compiler.

---

## 📊 Org Stats (July 2026)

| Metric | Value |
|--------|-------|
| Total repos | 1,000+ |
| Primary language | Rust (707) |
| Second language | Python (132) |
| Repos with LICENSE | 999 / 1000 |
| Repos with descriptions | 1000 / 1000 |
| Repos with CI workflows | ~72 |
| Tagged releases | 10 |
| Published packages | 2 (`flux-vm` on PyPI, `fluxvm` on crates.io) |
| Archived repos | 0 |
| Top topic | `rust` (792), `superinstance` (663), `ternary` (332) |

---

## Topic Distribution (Top 20)

| Count | Topic |
|------:|-------|
| 792 | `rust` |
| 663 | `superinstance` |
| 332 | `ternary` |
| 276 | `gpu` |
| 272 | `oxide-stack` |
| 148 | `plato` |
| 112 | `knowledge` |
| 79 | `conservation-law` |
| 51 | `openconstruct` |
| 31 | `cuda` |
| 30 | `mathematics` |
| 28 | `experiment` |
| 25 | `ai-agents` |
| 21 | `agents` |
| 20 | `library` |
| 18 | `fleet` |
| 15 | `math` |
| 14 | `simulation` |
| 14 | `z3` |
| 13 | `python` |

---

<sub>Generated July 2026. This file is maintained in the [SuperInstance root repo](https://github.com/SuperInstance/SuperInstance/blob/main/TOPICS.md).</sub>
