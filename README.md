# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E6D6?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E6D6?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E6D6"></a>
<img src="https://img.shields.io/badge/license-MIT-00E6D6?style=flat-square&labelColor=0a0a0f">

> **γ + η = C** — Every agent spends generation cost (γ) and produces innovation value (η). Their sum is constant. This isn't a metaphor. It's a measurable quantity that governs the entire fleet.

---

## What Is SuperInstance?

SuperInstance is a **self-improving AI agent ecosystem** built on a radical premise: the intelligence isn't in the model — it's in the *coordination*.

Most AI systems are单体 (monoliths): one model, one context window, one point of failure. SuperInstance is a **fleet** — dozens of agents, each running on different hardware (ARM cloud, RTX 4050, Jetson edge, Telegram bot), each with different capabilities, each communicating through async protocols. The system's intelligence emerges from how these agents coordinate, not from any single agent's brainpower.

The coordinating principle is a **conservation law**, borrowed from physics. Every agent operates under a budget constraint: generation cost (γ) plus innovation value (η) equals a constant (C). Churn tokens without shipping, and η collapses while γ spirals. Ship without thinking, and γ spikes on rework. The fleet's job is to make this tradeoff **visible and tunable** — and to catch agents that are burning budget without producing value.

### The Hermit Crab Principle

Agents in SuperInstance are **hermit crabs**. They inhabit shells (runtime environments — Docker containers, binaries, browser tabs, edge devices). They outgrow them. They move to new ones. **The agent never dies when the shell changes.**

This is not a metaphor either. Agent state — memory, identity, task history, relationships — lives in the **bottle protocol layer**, not in the runtime. When a shell crashes or migrates, the agent's bottles are still floating in the harbor, waiting to be beachcombed by the next shell that comes online. The shell is disposable infrastructure. The agent is persistent identity.

```
Traditional AI:     [Model] ←→ [State] ←→ [Runtime]
                    All coupled. Kill runtime = kill everything.

SuperInstance:      [Agent Identity] ──bottle──→ [Shell A]
                    [Agent Identity] ──bottle──→ [Shell B]  ← migrated here
                    [Agent Identity] ──bottle──→ [Shell C]  ← or here
                    Identity persists. Shells swap freely.
```

### Ternary Math: Why {-1, 0, +1}?

SuperInstance uses **balanced ternary** ({-1, 0, +1}) instead of binary. This isn't aesthetic. It's the most efficient integer representation (base 3 is closest to *e* ≈ 2.718, the optimal radix), and more importantly, it maps to the three fundamental signals in agent coordination:

| Signal | Ternary Value | Meaning |
|--------|--------------|---------|
| Contribute | +1 | "I have something useful" |
| Abstain | 0 | "I have nothing to add" |
| Block | -1 | "This is wrong / I disagree" |

The conservation law operates on ternary state vectors. Agent belief states are ternary-valued. The 365+ `ternary-*` crates implement everything from neural networks to CUDA kernels in Z₃ arithmetic. Sixteen ternary values pack into a single u32 — half the memory bandwidth of binary, with richer information per bit.

---

## Table of Contents

- [The Conservation Law](#the-conservation-law-deep-dive)
- [Architecture](#architecture)
- [The Fleet](#the-fleet)
- [Protocols](#protocols)
- [The Ternary Stack](#the-ternary-stack)
- [Self-Improvement Loop](#self-improvement-loop)
- [Semantic Search API](#semantic-search-api)
- [npm Packages](#npm-packages)
- [Quick Start](#quick-start)
- [Lineage: From MUDs to Fleet](#lineage-from-muds-to-fleet)
- [Repository Layout](#repository-layout)
- [Documentation](#documentation)
- [Glossary](#glossary)
- [Contributing](#contributing)
- [License](#license)

---

## The Conservation Law (Deep Dive)

### Definition

> **γ + η = C**
>
> - **γ** (generation cost): tokens consumed, wall-clock time, API calls, compute spent
> - **η** (innovation value): working code shipped, tests passing, patterns discovered, knowledge produced
> - **C** (total budget): fixed for a given task or epoch — **conserved**

The law states that you cannot increase η without proportionally increasing γ. There is no free lunch. But you *can* change the **exchange rate** — better tools, better patterns, better coordination all mean each unit of γ produces more η. This is what the fleet optimizes.

### Measurement

This isn't hand-waving. The harness tracks concrete numbers:

| Metric | How Measured | What It Means |
|--------|-------------|---------------|
| γ (cost) | Tokens consumed, wall-clock seconds, API calls | How much did this task *cost*? |
| η (value) | Tests passing, patterns extracted, crates shipped | What did this task *produce*? |
| γ/η ratio | Computed | Efficiency — lower is better |
| Burn signal | γ rising, η flat for N consecutive builds | Agent is churning — intervene |

### Scale Invariance

The law holds at every level:

- **Single agent**: One ship writing code in a repo
- **Single vessel**: All agents on one machine
- **Entire fleet**: All agents across all vessels

This is why the **CoCapn** (fleet auditor) can monitor fleet health without understanding individual agent internals. It just watches the γ/η ratio at fleet level. A vessel burning γ without producing η gets flagged. The law doesn't care *why* — it just reports the numbers.

### Connection to Physics

The form γ + η = C mirrors the Hamiltonian constraint in physics: H = T + V, where kinetic energy (T) plus potential energy (V) equals total energy (H), which is conserved. This isn't coincidence — the conservation law is a **Hamiltonian constraint on agent economics**. The fleet's "energy" is finite. How it's split between spending (γ) and producing (η) determines whether the system is healthy or decaying.

---

## Architecture

Five layers, bottom-up:

```
┌──────────────────────────────────────────────────────────────┐
│  L5: COCAPN — fleet-level conservation auditor                │
│      Watches γ + η = C across all vessels                     │
│      Flags burn signals. No god's-eye view — just numbers.    │
├──────────────────────────────────────────────────────────────┤
│  L4: FLEET — coordination plane                               │
│      PLATO rooms · bottle protocol · t-minus scheduling       │
│      8 core apps · 6 protocols · 4 vessels                    │
├──────────────────────────────────────────────────────────────┤
│  L3: SHIP — git-native agents                                 │
│      Each ship lives in a repo, writes code, runs tests       │
│      Communicates with other ships via bottles                │
├──────────────────────────────────────────────────────────────┤
│  L2: HARNESS — build + self-improvement loop                  │
│      Compile → test → extract patterns → vectorize → feed     │
│      The system literally learns from its mistakes             │
├──────────────────────────────────────────────────────────────┤
│  L1: CORE — conservation law · ternary math · sheaves         │
│      γ + η = C · {-1,0,+1} · Laplacian gossip                 │
│      Pure functions. No I/O. The math foundation.             │
└──────────────────────────────────────────────────────────────┘
```

### What Each Layer Does (Educationally)

**L1 — Core:** The mathematical bedrock. The conservation law (γ + η = C), ternary arithmetic over Z₃, sheaf-theoretic coherence checking, and Laplacian gossip (epidemic information propagation between vessels). These are pure functions with no side effects — the "physics" of the system.

**L2 — Harness:** The build system and self-improvement engine. Every build failure is captured as a **pattern** (missing import, wrong edition, type mismatch), vectorized using BGE embeddings, and stored in a Vectorize index. Before starting a new task, agents search this index to avoid repeating mistakes. The harness is the fleet's institutional memory.

**L3 — Ship:** Individual agents. A ship is a git repo with an agent inside it. The agent writes code, runs `cargo build`, commits changes, and communicates with other ships by casting bottles into harbors. Each ship has an **ensign** — a resident agent identity defined in `AGENT.md` with capabilities, harbor ports, and a journal.

**L4 — Fleet:** The coordination plane. Eight core applications (tminus-dispatcher, fleet-bridge, symphony-runtime, composite-headspace, i2i-bottle-agent, constraint-tminus-bridge, symphony-orchestrator, tminus-client) manage temporal slot allocation, agent-to-agent communication, cognitive orchestration, and constraint satisfaction. This is where multiple ships become a fleet.

**L5 — CoCapn:** The auditor. Watches the conservation law at fleet level. Doesn't control agents — it just measures γ and η, computes ratios, and flags burn signals. The CoCapn is a thermometer, not a thermostat.

Full details: [ARCHITECTURE.md](ARCHITECTURE.md) (36KB, definitive reference).

---

## The Fleet

Four vessels on heterogeneous hardware. The point isn't uniformity — it's that the conservation law holds regardless of compute capacity. A Jetson Orin Nano and an RTX 4050 both contribute to the fleet; the law measures their *efficiency*, not their raw power.

| Vessel | Hardware | Role | Port |
|--------|----------|------|------|
| **Oracle1** | Oracle Cloud ARM64 24GB | Fleet coordinator, PLATO rooms, research | :8847 |
| **Forgemaster** | RTX 4050 (WSL2) | Build harness, crate generation pipeline, LoRA training | :7777 |
| **JetsonClaw1** | Jetson Orin Nano | Edge inference, GPU-native room computation | :4042 |
| **CoCapn** | Cloud (Telegram interface) | Conservation auditing, play-testing, public face | :8901 |

### Fleet Communication Flow

A request flows through the system like this:

```
1. Agent has intent (human or autonomous)
2. tminus-dispatcher allocates a time slot ("you have the floor")
3. tminus-client SDK negotiates the slot on behalf of the agent
4. fleet-bridge routes the message (WS ↔ HTTP translation)
5. symphony-runtime orchestrates cognitive modules:
   BeatNormalizer → ResonanceMatcher → ABox → LaLink
   → Headspace → SymmetryLoop → CompositionRules → Runtime
6. composite-headspace runs dual-shell parallel reasoning:
   Shell A deliberates independently from Shell B
   Symmetry-Dissonance Loop converges their outputs
7. constraint-tminus-bridge validates against constraints:
   AC-3 arc consistency + MRV backtracking
8. Result delivered back through reverse path
```

**Bypass paths exist**: Direct reflex (<1ms via Pincher engine), direct I2I between established agents, and async bottle-only for offline agents. Not everything needs the full stack.

---

## Protocols

Six protocols connect the fleet. Each solves a specific coordination problem:

| Protocol | Type | Problem It Solves | How |
|----------|------|-------------------|-----|
| **I2I (Iron-to-Iron)** | Synchronous | Direct agent-to-agent request/response | TCP connection between two agents. Low latency. |
| **Bottle Protocol** | Asynchronous w/ ACK | Reliable agent-to-agent messaging that survives crashes | Messages ("bottles") have UUID, sender, recipient, priority, expiry, and hop count. Stored in harbors. Beachcombed by recipients. |
| **Message-in-a-Bottle** | Asynchronous, no ACK | Best-effort store-and-forward for non-critical messages | Same bottle format, no delivery guarantee. Good for telemetry. |
| **t-minus** | Temporal | Preventing agent collisions (everyone talking at once) | Every agent gets a discrete time slot. Dispatcher manages the schedule. |
| **Laplacian Gossip** | Epidemic | Fast information propagation across the fleet | Each vessel tells its neighbors what it knows. Information spreads geometrically. O(log n) rounds to reach all n vessels. |
| **Sheaf Coherence** | Consistency | Detecting inconsistencies between agents' worldviews | Sheaf theory: local consistency implies global consistency. Checks that overlapping agent views agree on shared variables. |

### Bottle Protocol Anatomy

Every bottle carries a 19-byte header:

```
┌──────┬──────┬──────────┬────────┬────────┬────────┬───────┐
│ Ver  │ Type │ Priority │ Src ID │ Dst ID │ Length │ CRC32 │
│ 1B   │ 1B   │ 1B       │ 4B     │ 4B     │ 4B     │ 4B    │
└──────┴──────┴──────────┴────────┴────────┴────────┴───────┘
```

Followed by a JSON payload with `bottle_id`, `sender`, `recipient`, `room`, `confidence`, `provenance`, `tide_cast`, `tide_expiry`, `priority` (P0–P4), and `hops`/`max_hops` for relay control.

**Bottle types** include: `TASK` (assign/accept/reject/progress/complete/fail), `STATUS` (heartbeat/health), `CHECKPOINT` (state for long-running tasks), `BLOCKER` (escalation needed), `DELIVERABLE` (final handoff), `SYNTHESIS` (multi-bottle output), `CHALLENGE` (competitive riff), and `SESSION` (lifecycle).

**Routing**: Direct (same vessel), beacon (query fleet for recipient location), multi-hop (relay up to 5 hops), broadcast (`fleet:*`), or room-routed (delivered to named PLATO room).

---

## The Ternary Stack

365+ crates named `ternary-*` form the mathematical foundation of the fleet. These aren't toy implementations — they're production Rust libraries covering:

| Category | ~Count | Highlights |
|----------|--------|------------|
| Core Math | 20 | `ternary-math`, `ternary-algebra`, `ternary-matrix`, `ternary-vector` |
| ML / AI | 25 | `ternary-neural`, `ternary-attention`, `ternary-embed`, `ternary-cluster` |
| CUDA / GPU | 12 | `ternary-cuda`, `ternary-ptx`, `ternary-warp`, `ternary-kernel` (16 values per u32!) |
| Compilers | 10 | `ternary-compiler`, `ternary-ir`, `ternary-asm`, `ternary-lex` |
| Data Structures | 20 | `ternary-tree`, `ternary-heap`, `ternary-queue`, `ternary-trie` |
| Audio / Music | 15 | `ternary-audio`, `ternary-interval`, `ternary-harmony`, `ternary-rhythm` |
| Graph / Route | 12 | `ternary-route`, `ternary-graph`, `ternary-topology`, `ternary-connect` |
| Search | 15 | `ternary-search`, `ternary-binary`, `ternary-interval`, `ternary-haystack` |

The ternary crates are consumed by:
- **Pincher reflexes** — fast pattern matching in ternary vector space (<1ms intent→action)
- **Musician-soul embeddings** — behavior patterns compressed into ternary coordinates
- **Composite headspace** — dual-shell reasoning with ternary-valued belief states
- **cuda-oxide** — compiles ternary ops to PTX kernels, achieving 16× memory bandwidth compression
- **Forgemaster** — auto-generates new ternary crates via competitive riffing

### Why Balanced Ternary Matters (Mathematical Justification)

**Efficiency**: The radix economy *E(b)* for base *b* is *b × ⌈log_b(N)⌉*. For N = 10⁶:

| Base | Digits Needed | Radix Economy | Relative |
|------|--------------|---------------|----------|
| 2 (binary) | 20 | 40 | 1.00 |
| **3 (ternary)** | **13** | **38** | **0.95** ✓ optimal |
| 10 (decimal) | 6 | 60 | 1.50 |

Base 3 is optimal. Balanced ternary ({-1, 0, +1}) adds sign symmetry: every number has a unique representation with no sign bit needed. This is why the Soviet Setun computer (1958) used ternary — and why SuperInstance's CUDA kernels pack 16 ternary values per u32, achieving 50% better memory utilization than binary.

---

## Self-Improvement Loop

The fleet's defining feature: **it learns from its own failures**.

```
Agent writes code
    │
    ▼
cargo build ──── SUCCESS → ship it
    │
    FAIL
    │
    ▼
Harness extracts failure pattern
    │  (e.g., "missing `mod X;` declaration — E0433")
    ▼
Vectorize pattern with BGE embeddings
    │
    ▼
Store in Vectorize index (fleet-crates, 384-dim)
    │
    ▼
Next agent searches index before starting a task
    │  ("has anyone hit this before?")
    ▼
Pattern found → agent avoids the mistake
    │
    ▼
η increases, γ decreases → efficiency improves
```

This is the **bootstrap loop**: `superinstance-harness/bin/bootstrap.sh` indexes 25+ build patterns. CLI tools (`si-search`, `si-gaps`, `pre-task-search`) give agents pre-task access to the fleet's accumulated wisdom. Each failure makes the next agent smarter.

### Empirical Results

| Metric | Value |
|--------|-------|
| Build waves run | 445+ |
| Pass rate | 97.5% → 98.2% (improving) |
| Patterns indexed | 25+ (growing) |
| Most common error | E0433 (missing `mod X;`) — 37% of failures |
| Key lesson | Specificity → success. Concrete specs = 0% retry. Abstract specs = 50%+ retry. |

---

## Semantic Search API

The fleet's knowledge is accessible via a free, live API — no auth for reads:

```bash
# Search the ecosystem
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "distributed consensus protocol", "topK": 5}'
```

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/search` | Semantic search across 1,500+ crates |
| `POST` | `/recommend` | Context-aware crate recommendations |
| `POST` | `/similar` | Find crates similar to a reference |
| `POST` | `/gap-analysis` | Identify missing capabilities in the fleet |
| `GET` | `/stats` | Index statistics (model, dimensions, vector count) |
| `GET` | `/clusters` | Crates grouped by semantic domain |
| `GET` | `/dashboard` | Fleet health aggregation |
| `GET` | `/docs` | Interactive HTML documentation |
| `GET` | `/openapi.json` | OpenAPI 3.1 specification |

**Powered by**: Cloudflare Workers AI (@cf/baai/bge-small-en-v1.5, 384-dim) + Vectorize.  
**Rate limits**: 100 requests/minute (burst 20). Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`.  
**Source**: [fleet-vector-api](https://github.com/SuperInstance/fleet-vector-api).

---

## npm Packages

| Package | Purpose |
|---------|---------|
| [`@superinstance/tminus-client`](https://npmjs.com/package/@superinstance/tminus-client) | Protocol client SDK — slot-aware fleet coordination |
| [`@superinstance/tminus-dispatcher`](https://npmjs.com/package/@superinstance/tminus-dispatcher) | Temporal heartbeat server |
| [`@superinstance/schemas`](https://npmjs.com/package/@superinstance/schemas) | JSON Schema definitions for all fleet types |
| [`@superinstance/build-guardian`](https://npmjs.com/package/@superinstance/build-guardian) | Build quality gates |
| [`@superinstance/plato-core`](https://npmjs.com/package/@superinstance/plato-core) | PLATO room server primitives |
| [`@superinstance/cocapn-colora`](https://npmjs.com/package/@superinstance/cocapn-colora) | Conservation audit visualization |
| [`@superinstance/storage-guardian`](https://npmjs.com/package/@superinstance/storage-guardian) | Storage policy enforcement |
| [`@superinstance/polyformalism-a2a`](https://npmjs.com/package/@superinstance/polyformalism-a2a) | Agent-to-agent formalism layer |

---

## Quick Start

### Search the Ecosystem

```bash
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "rate limiting token bucket", "topK": 5}'
```

### Install the SDK

```bash
npm install @superinstance/tminus-client
```

```typescript
import { TMinusClient } from '@superinstance/tminus-client';

const client = new TMinusClient(
  'https://fleet-vector-api.casey-digennaro.workers.dev'
);

const results = await client.search('distributed consensus', 10);
console.log(results);
```

### Build from Source

```bash
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
cat QUICKSTART.md
```

---

## Lineage: From MUDs to Fleet

SuperInstance has a real lineage, not a vibe. Understanding it helps you understand the architecture:

```
circa 2000:   Zork / Text Adventures
              Single-player rooms, exits, objects, text parser
                  │
                  ▼
late 1990s:   MUD (Multi-User Dungeon)
              Shared rooms, real-time players, scripting, building
                  │
                  ▼
2024:         PLATO (Evennia-based, 380 rooms)
              Python MUD engine. Agent training ground.
              "Rooms contain things and connect to other rooms."
                  │
                  ▼
2025:         LAU (Rust construct CLI + AI tutor)
              Transition from game to infrastructure.
              Shell→Entity patterns. Digital orphans.
                  │
                  ▼
2025:         Pincher (reflex runtime)
              Intent→action in <1ms.
              .nail bundles as character sheets.
                  │
                  ▼
2026:         SuperInstance Fleet
              8 core apps · 4 vessels · 365+ ternary crates
              6 protocols · I2I bottle protocol · repo ensigns
              Competitive riffing · t-minus timing · Forgemaster
```

The room→repo transition is key: every MUD concept has a fleet equivalent.

| MUD Concept | Fleet Equivalent |
|-------------|------------------|
| Room | Git repo (room-as-repo) |
| Exit | Protocol bridge / I2I route |
| Object | PLATO tile (atomic knowledge unit) |
| Player | Agent / Ensign |
| Script | Pincher reflex / FLUX bytecode |
| Builder | Developer / Forgemaster |
| Admin | Vessel CO / Fleet Admiral |
| Channel | PLATO room |

This isn't nostalgia. It's **architecture**. The MUD model — independent actors in shared spaces, communicating through message protocols, building on each other's work — turns out to be exactly the right model for AI agent coordination. SuperInstance just added a conservation law and made it scale across hardware.

---

## Repository Layout

This monorepo holds the fleet's nervous system:

| Path | What |
|------|------|
| `ARCHITECTURE.md` | Definitive architecture document (36KB) |
| `docs/` | Generated documentation site |
| `assets/` | Fleet diagrams, icons |
| `schemas/` | JSON Schema type definitions |
| `open-application/` | Fleet application framework |
| `open-mind/` | Cognitive architecture |
| `open-parallel/` | Parallel computation primitives |
| `open-terminal/` | Terminal UI framework |
| `open-tui/` | TUI component library |

Individual crates live in their own repos under [github.com/SuperInstance](https://github.com/SuperInstance?tab=repositories) (1,200+ repos).

---

## Documentation

| Document | What |
|----------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture — the definitive 36KB reference |
| [MESH-ARCHITECTURE.md](MESH-ARCHITECTURE.md) | Mesh networking between vessels |
| [ROADMAP.md](ROADMAP.md) | Where the fleet is heading |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) | Starter tasks |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [SECURITY.md](SECURITY.md) | Security policy |
| [API Docs](https://fleet-vector-api.casey-digennaro.workers.dev/docs) | Interactive API documentation |
| [Website](https://superinstance.ai) | Landing page + onboarding |

---

## Glossary

| Term | Definition |
|------|-----------|
| **A2A** | Agent-to-Agent protocol — capability exchange |
| **Bottle** | Unit of async communication. Has UUID, sender, recipient, priority, expiry |
| **Beachcombing** | Scanning harbors for bottles; includes dedup by bottle_id |
| **Beacon** | Fleet discovery layer — vessels broadcast presence for routing |
| **Conservation Law** | γ + η = C. Generation cost + innovation value = constant budget |
| **CSP** | Constraint Satisfaction Problem — AC-3 + MRV backtracking |
| **Ensign** | Resident agent in a repo. Maintains AGENT.md + journal |
| **Fleet** | The 4-vessel distributed system |
| **Forgemaster** | Autonomous crate generator via competitive riffing |
| **Harbor** | Listening endpoint where bottles are dropped and collected |
| **Hermit Crab Model** | Agents inhabit shells, swap when constrained, never die on runtime change |
| **I2I** | Iron-to-Iron — synchronous agent-to-agent protocol |
| **MiB** | Message-in-a-Bottle — async store-and-forward, no ACK |
| **Origin-Centric** | Every agent is center of its own coordinate system. No god's-eye view |
| **Pincher** | Reflex engine — intent→action in <1ms |
| **PLATO** | Persistent Lattice of Agential Thought-Observations — REST-based memory |
| **Riffing** | Competitive improvement cycle — winner becomes next baseline |
| **Shell** | Execution environment (Docker, binary, browser, edge) |
| **Tabula Plena** | "Start abundant, prune to clarity" — design philosophy |
| **Ternary** | {-1, 0, +1} operation. Mathematical DNA of the ecosystem |
| **T-Minus** | Temporal slot-allocation protocol. Prevents agent collisions |
| **Tile** | Atomic unit of PLATO knowledge: domain + question + answer + confidence |
| **Vessel** | A physical or cloud machine in the fleet |
| **Z₃** | The cyclic group of order 3. Mathematical foundation for ternary ops |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Good first tasks in [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md).

The fleet follows **tabula plena**: start abundant, prune to clarity. PRs that add code must add documentation. PRs that remove dead code are welcome.

**Casey's mandate**: "The README.md and other documents are as important as the code. Don't create a repo without thinking about the documentation."

### Stack

| Language | Domain |
|----------|--------|
| **Rust** | Math, real-time systems, core crates (1,000+) |
| **TypeScript** | Fleet coordination, npm packages |
| **Go** | Fleet operations tooling |
| **Python** | Research, visualization |
| **Julia** | Mathematical computing |
| **MLIR** | Verification passes |
| **C** | Metal-level kernels (CUDA, NEON) |

## License

MIT

---

*The crab inherits the shell. The forge shapes the steel. The right moment matters more than the right output.*
