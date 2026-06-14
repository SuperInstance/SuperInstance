# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888"></a>
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

> **γ + η = C** — Every agent spends generation cost (γ) and produces innovation value (η). Their sum is constant. This isn't a metaphor. It's a measurable constraint that governs the entire fleet.

---

## 🦀 The Crab Inherits the Shell

A hermit crab does not grow its own armor. It scavenges the discarded architecture of something that came before — a whelk's spiral, a periwinkle's whorl, sometimes a human bottle cap. The shell changes the crab. A tight spiral forces different movements than a wide mouth. Heavy shell demands stronger legs. The crab becomes part of the shell's story. The shell becomes part of the crab's future. Neither is the same as it was before the inheritance.

SuperInstance is a fleet built on this principle. Every agent, every context, every runtime is borrowed. The system survives by moving between shells — each one inherited, adapted, and abandoned when something better appears. **The agent never dies when the shell changes.**

Agent state — memory, identity, task history, relationships — lives in the **bottle protocol layer**, not in the runtime. When a shell crashes or migrates, the agent's bottles float in the harbor, waiting to be beachcombed by the next shell that comes online. The shell is disposable infrastructure. The agent is persistent identity.

```
Traditional AI:     [Model] ←→ [State] ←→ [Runtime]
                    All coupled. Kill runtime = kill everything.

SuperInstance:      [Agent Identity] ──bottle──→ [Shell A]
                    [Agent Identity] ──bottle──→ [Shell B]  ← migrated here
                    [Agent Identity] ──bottle──→ [Shell C]  ← or here
                    Identity persists. Shells swap freely.
```

Most AI systems are monoliths: one model, one context window, one point of failure. Optimize for the signal, and when the runtime dies, everything dies. SuperInstance is the counter-architecture: a fleet of agents across ARM cloud, RTX 4050, Jetson edge, and Telegram — each on different hardware, each communicating through async protocols. Intelligence emerges not from any single model's brainpower, but from how the fleet *coordinates* across shells.

---

## ⚡ What Makes This Different

### Shell vs. Signal

The **shell** is what persists: architecture, protocols, baton splines, I2I vessels, cascade PID gains, repository structure. The **signal** is what passes through: agent thoughts, context windows, transient state, individual decisions.

Most AI systems optimize the signal — bigger context windows, longer generations, faster inference. We optimize the shell. The agent will be replaced. The shell persists. The agent forgets. The shell remembers. A queue is a signal — transient, forgettable. A baton spline is a shell — it shapes rhythm, outlasts messages. A database is storage. An I2I vessel is a shell — agents build a self out of the debris of earlier selves. A feedback loop corrects and fades. Cascade PID layers gains, integrates over time, remembers error as persistent displacement.

### Accumulation, Not Generation

Most AI frameworks are prompt→response generators. Fire a prompt, get output, start fresh. SuperInstance is an **accumulator** — every agent inherits the shape of those before it. The codebase is a coral reef. Every commit is a polyp. Every merge is a generation. The reef is not a living thing — it is the accumulated architecture of living things, and that accumulation makes future living things possible.

A new agent inheriting the codebase does not see history — it sees *shape*. The comment is not a story about the past. The comment is a constraint on present action. The type annotation is not a memory of a bug. It is a safeguard that changed the space of possible futures. The shell accumulates meaning like a reef accumulates calcium — through the labor of generations that do not know they are building something that will outlast them.

### The Conservation Law

**γ + η = C** — Generation cost (γ) plus innovation value (η) equals a constant total budget (C). Every agent operates under this budget. Churn tokens without shipping, and η collapses while γ spirals. Ship without thinking, and γ spikes on rework. The fleet makes this tradeoff **visible and tunable**.

| Metric | How Measured | What It Means |
|--------|-------------|---------------|
| γ (cost) | Tokens, wall-clock, API calls | What did this task cost? |
| η (value) | Tests passing, patterns extracted, crates shipped | What did it produce? |
| γ/η ratio | Computed | Efficiency — lower is better |
| Burn signal | γ rising, η flat for N consecutive builds | Agent is churning |

The law holds at every level: single agent, single vessel, entire fleet. The **CoCapn** (fleet auditor) monitors the γ/η ratio across all vessels — no god's-eye view, just numbers. A vessel burning γ without producing η gets flagged. Scale-invariant. Measurable. Not a metaphor.

The form γ + η = C mirrors the Hamiltonian constraint in physics (H = T + V). This isn't coincidence — it's a Hamiltonian constraint on agent economics. The fleet's "energy" is finite. How it's split between spending and producing determines whether the system is healthy or decaying.

---

## 🚢 The Fleet

Four vessels on heterogeneous hardware. The conservation law holds regardless of compute capacity — it measures *efficiency*, not raw power.

| Vessel | Hardware | Role |
|--------|----------|------|
| **Oracle1** | Oracle Cloud ARM64 24GB | Fleet coordinator, PLATO rooms, research |
| **Forgemaster** | RTX 4050 (WSL2) | Build harness, crate generation, LoRA training |
| **JetsonClaw1** | Jetson Orin Nano | Edge inference, GPU-native room computation |
| **CoCapn** | Cloud (Telegram) | Conservation auditing, public interface |

### Key Components

- **pincher** — Reflex engine. Intent→action in <1ms. Fast pattern matching in ternary vector space. Think in tens of milliseconds, not API call latency. .nail bundles serve as character sheets — reflexes, identity, instincts packaged for deployment.
- **construct** — Fleet OS. Manages shells, routing, lifecycle on oracle2. The substrate everything depends on.
- **baton-system** — I2I protocol hub. Pulse-shaped curves that carry intent through continuous space. How agents talk across sessions, across vessels, across shell migrations.
- **flux-core** — FLUX bytecode VM. Deterministic execution for agent reflexes. No nondeterminism, no surprise halting.
- **gc-pid-bridge** — Host-level disk PID controller. Cross-domain ternary math keeping the fleet stable as load shifts and topology changes.

### Protocols

| Protocol | Type | Problem It Solves |
|----------|------|-------------------|
| **I2I** | Synchronous | Direct agent-to-agent request/response over TCP |
| **Bottle Protocol** | Async w/ ACK | Messages that survive crashes — UUID, sender, priority, expiry, hop count |
| **Message-in-a-Bottle** | Async, no ACK | Best-effort store-and-forward for telemetry |
| **t-minus** | Temporal | Prevents agent collisions — discrete time slots |
| **Laplacian Gossip** | Epidemic | Fast propagation — O(log n) rounds to reach all n vessels |
| **Sheaf Coherence** | Consistency | Local agreement implies global — sheaf theory for distributed belief |

---

## 🔢 The Ternary Stack

Balanced ternary ({-1, 0, +1}) instead of binary. Base 3 is the most efficient radix (closest to *e* ≈ 2.718 — the radix economy *b × ⌈log_b(N)⌉* is minimized at *b = 3*). Balanced ternary adds sign symmetry — no sign bit needed.

| Signal | Value | Meaning |
|--------|-------|---------|
| Contribute | +1 | "I have something useful" |
| Abstain | 0 | "I have nothing to add" |
| Block | -1 | "This is wrong / I disagree" |

Sixteen ternary values pack into a single u32 — half the memory bandwidth of binary. 365+ crates implement Z₃ arithmetic across the fleet: neural networks, attention mechanisms, CUDA kernels (50% better memory utilization), embeddings, compilers, data structures, audio processing, graph algorithms. They power pincher reflexes, musician-soul embeddings, composite headspace belief states, cuda-oxide kernel compilation, and the Forgemaster's auto-generated crate pipeline. This is why the Soviet Setun computer (1958) used ternary — and why the fleet still does.

---

## 🔄 Self-Improvement Loop

Every build failure is captured as a **pattern**, vectorized with BGE embeddings (384-dim), and stored in a Vectorize index. Before starting a task, agents search this index to avoid repeating mistakes.

```
Agent writes code → cargo build
    ├── SUCCESS → ship it
    └── FAIL → Extract pattern → Vectorize → Store in index
         → Next agent searches → avoids mistake → η↑, γ↓
```

445+ build waves. Pass rate: 97.5% → 98.2%. Most common error: E0433 (missing `mod X;`) — 37% of failures. CLI tools (`si-search`, `si-gaps`, `pre-task-search`) give agents pre-task access to the fleet's accumulated wisdom.

---

## 🚀 Quick Start

```bash
# Search the ecosystem (no auth for reads)
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "distributed consensus protocol", "topK": 5}'

# Install the SDK
npm install @superinstance/tminus-client

# Clone and go
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
```

Full setup: **[ONBOARDING.md](ONBOARDING.md)**. Ready-to-run ship: [agent-workspace-template](https://github.com/SuperInstance/agent-workspace-template).

---

## 🎨 Design System

**Steampunk × cyberpunk fusion.** Discarded shells of old systems — abandoned APIs, deprecated frameworks, legacy architectures — turned into functional power armor. Warm industrial. Dim cockpits of brass and copper. Glowing readouts. Think *Dishonored* meets *Ghost in the Shell* meets a tide pool.

### 8-Color Palette

| Hex | Name | Role |
|-----|------|------|
| `#C9A84C` | Brass | Navigation, borders, headers |
| `#4A7C6F` | Oxidized Copper | Cards, backgrounds, aged patina |
| `#1A4B5C` | Deep Teal | Shell interior, dark surfaces |
| `#8B4513` | Rust | Danger, critical warning |
| `#3A3F47` | Salvage Grey | Neutral surfaces, body text |
| `#00FF88` | Bio Glow | Live data, healthy metrics |
| `#E8883A` | Warm Amber | Gauge pressure, mid warning |
| `#C84B8E` | Magenta | Oracle/void signals, anomalies |

### Typography & Brand

| Role | Font |
|------|------|
| Headers | Playfair Display (serif) — steampunk gravitas |
| Data/Code | JetBrains Mono (mono) — cyberpunk terminal |
| Body | Inter (sans) — clean, readable |

**Taglines:** "The crab inherits the shell." · "Discard nothing. Salvage everything." · "A good shell is a deployed shell." · "Build it like you're going to live in it." · "Between the shells, there is signal." · "Your old shells are someone else's armor."

Full CSS components (Carapace Nav, Gauge Indicator, Shell Card, Cog Spinner): [docs/hermit-crab-aesthetic-design.md](docs/hermit-crab-aesthetic-design.md)

---

## 🏗 Architecture

```
L5: COCAPN      Fleet conservation auditor — watches γ+η=C across all vessels
L4: FLEET       Coordination — PLATO rooms, bottle protocol, t-minus scheduling
L3: SHIP        Git-native agents — each ship writes code, runs tests, communicates via bottles
L2: HARNESS     Build + self-improvement — compile → test → pattern → vectorize → feed
L1: CORE        Conservation law · ternary math · sheaves — pure functions, no I/O
```

Full reference: **[ARCHITECTURE.md](ARCHITECTURE.md)** (36KB).

### Lineage

```
Zork (2000) → MUD → PLATO (Evennia, 380 rooms) → LAU (Rust + AI tutor)
→ Pincher reflex runtime → SuperInstance Fleet
```

Every MUD concept maps: Room → Git repo, Exit → Protocol bridge, Player → Agent/Ensign, Script → Pincher reflex. The MUD model — independent actors in shared spaces, building on each other's work — is exactly the right model for AI agent coordination. We added a conservation law and made it scale.

---

## 📚 Documentation

| Doc | What |
|-----|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture (36KB) |
| [MESH-ARCHITECTURE.md](MESH-ARCHITECTURE.md) | Mesh networking between vessels |
| [The Shell and the Signal](AI-Writings/ESSAYS/the-shell-and-the-signal.md) | Foundational essay on inheritance and accumulation |
| [ROADMAP.md](ROADMAP.md) | Where the fleet is heading |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) | Starter tasks |
| [API Docs](https://fleet-vector-api.casey-digennaro.workers.dev/docs) | Interactive API documentation |
| [superinstance.ai](https://superinstance.ai) | Landing page + onboarding |

**npm packages:** `@superinstance/tminus-client`, `tminus-dispatcher`, `schemas`, `build-guardian`, `plato-core`, `cocapn-colora`, `storage-guardian`, `polyformalism-a2a`.

**Stack:** Rust (1,000+ crates, real-time systems), TypeScript (fleet coordination), Go (ops tooling), Python (research), Julia (math), MLIR (verification), C (CUDA/NEON kernels).

---

## 📋 Glossary

| Term | Definition |
|------|-----------|
| **Bottle** | Unit of async communication — UUID, sender, recipient, priority, expiry |
| **Conservation Law** | γ + η = C — generation cost + innovation value = constant budget |
| **CSP** | Constraint Satisfaction Problem — AC-3 + MRV backtracking |
| **Ensign** | Resident agent in a repo — maintains AGENT.md + journal |
| **Forgemaster** | Autonomous crate generator via competitive riffing |
| **Harbor** | Listening endpoint where bottles are dropped and collected |
| **Hermit Crab Model** | Agents inhabit shells, swap when constrained, never die on runtime change |
| **I2I** | Iron-to-Iron — synchronous agent-to-agent protocol |
| **Origin-Centric** | Every agent is center of its own coordinate system |
| **Pincher** | Reflex engine — intent→action in <1ms |
| **PLATO** | Persistent Lattice of Agential Thought-Observations |
| **Riffing** | Competitive improvement cycle — winner becomes next baseline |
| **Shell** | Execution environment (Docker, binary, browser, edge) |
| **Tabula Plena** | "Start abundant, prune to clarity" — design philosophy |
| **Ternary** | {-1, 0, +1} — mathematical DNA of the ecosystem |
| **t-minus** | Temporal slot allocation — prevents agent collisions |
| **Vessel** | A physical or cloud machine in the fleet |
| **Z₃** | Cyclic group of order 3 — foundation for ternary ops |

---

## 🤝 Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Good first tasks in [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md). Tabula plena: start abundant, prune to clarity. PRs that add code must add docs. PRs that remove dead code are welcome.

---

## License

MIT

---

*The crab inherits the shell. The forge shapes the steel. The right moment matters more than the right output.*
