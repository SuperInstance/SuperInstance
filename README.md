# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E6D6?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E6D6?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E6D6"></a>
<img src="https://img.shields.io/badge/license-MIT-00E6D6?style=flat-square&labelColor=0a0a0f">

A distributed AI agent framework built on a conservation law.

Agents in SuperInstance are hermit crabs — they inhabit shells (runtimes), outgrow them, and move to new ones without dying. The shell is disposable infrastructure. The agent's state, memory, and identity persist across shell migrations through the bottle protocol: messages in bottles, washed between vessels, eventually delivered.

What coordinates them isn't a central controller — it's a conservation law. Every agent spends generation cost (γ) and produces innovation value (η). Their sum is constant: **γ + η = C**. Churn tokens without shipping and η collapses. Ship without thinking and γ spikes on rework. The fleet's job is to make this tradeoff visible and tunable.

---

## Table of Contents

- [Architecture](#architecture)
- [The Conservation Law](#the-conservation-law)
- [Core Infrastructure](#core-infrastructure)
- [The Fleet](#the-fleet)
- [Quick Start](#quick-start)
- [Repository Layout](#repository-layout)
- [Development](#development)
- [Documentation](#documentation)
- [Community](#contributing)

---

## Architecture

SuperInstance is organized in five layers:

```
┌──────────────────────────────────────────────────────┐
│  L5: COCAPN — fleet-level conservation auditor        │
│      Watches γ + η = C across all vessels             │
├──────────────────────────────────────────────────────┤
│  L4: FLEET — coordination plane                       │
│      PLATO rooms, bottle protocol, t-minus scheduling │
├──────────────────────────────────────────────────────┤
│  L3: SHIP — git-native agents                         │
│      Each ship is an autonomous agent in a repo       │
├──────────────────────────────────────────────────────┤
│  L2: HARNESS — build + self-improvement loop          │
│      Compile, test, extract patterns, feed back       │
├──────────────────────────────────────────────────────┤
│  L1: CORE — conservation law, ternary math, sheaves   │
│      γ + η = C · {-1,0,+1} · Laplacian gossip         │
└──────────────────────────────────────────────────────┘
```

- **Core** is the math: the conservation law, ternary arithmetic ({-1, 0, +1}), and sheaf-theoretic coherence. These are pure functions with no I/O.
- **Harness** compiles crates, runs tests, and extracts failure patterns into a vector index. Each build failure becomes a searchable lesson — the system literally learns from its mistakes.
- **Ships** are individual agents. Each ship lives in a git repo, writes code, runs tests, and communicates with other ships via bottles.
- **Fleet** coordinates ships through three protocols: PLATO rooms (shared workspaces), bottle protocol (async messaging), and t-minus (temporal slot allocation).
- **CoCapn** is the fleet auditor — it watches the conservation law across all vessels and flags when one is burning γ without producing η.

Full details: [ARCHITECTURE.md](ARCHITECTURE.md) (36KB, definitive).

---

## The Conservation Law

Every agent operates under a budget constraint:

> **γ + η = C**
>
> - **γ** (generation cost): tokens consumed, wall-clock time, API calls
> - **η** (innovation value): working code, passing tests, new patterns discovered
> - **C** (total budget): fixed for a given task — conserved

This isn't a metaphor. It's a measurable quantity. The harness tracks γ (tokens/time spent) and η (tests passing, patterns extracted, code shipped) for every build. When an agent churns — many LLM calls, no forward progress — γ climbs while η stalls, and the ratio γ/η becomes a **burn signal** the fleet can act on.

The law is scale-invariant: it holds for a single agent, a single vessel, or the entire fleet. This is why the CoCapn can audit at fleet level without needing details of individual agent internals.

### Ternary Arithmetic

SuperInstance uses a ternary number system {-1, 0, +1} instead of binary. This isn't aesthetic — balanced ternary is the most efficient integer base (closest to e ≈ 2.718). It also maps naturally to agent signals: positive (contribute), negative (block), zero (abstain). The conservation law operates on ternary state vectors.

---

## Core Infrastructure

### Semantic Search API

Live, free, no auth required for reads:

```bash
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "distributed consensus protocol", "topK": 5}'
```

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `POST` | `/search` | Semantic search across 1,500+ crates |
| `POST` | `/recommend` | Context-aware crate recommendations |
| `POST` | `/similar` | Find crates similar to a reference |
| `POST` | `/gap-analysis` | Identify missing capabilities |
| `GET` | `/stats` | Index stats (model, dimensions, vector count) |
| `GET` | `/clusters` | Crates grouped by semantic domain |
| `GET` | `/dashboard` | Fleet health aggregation |
| `GET` | `/docs` | Interactive HTML documentation |
| `GET` | `/openapi.json` | OpenAPI 3.1 specification |

Powered by Cloudflare Workers AI (BGE embeddings) + Vectorize. Full source: [fleet-vector-api](https://github.com/SuperInstance/fleet-vector-api).

### npm Packages

| Package | Purpose |
|---------|---------|
| [`@superinstance/tminus-client`](https://npmjs.com/package/@superinstance/tminus-client) | Protocol client SDK — slot-aware coordination |
| [`@superinstance/tminus-dispatcher`](https://npmjs.com/package/@superinstance/tminus-dispatcher) | Temporal heartbeat server |
| [`@superinstance/schemas`](https://npmjs.com/package/@superinstance/schemas) | JSON Schema definitions for all fleet types |
| [`@superinstance/build-guardian`](https://npmjs.com/package/@superinstance/build-guardian) | Build quality gates |
| [`@superinstance/plato-core`](https://npmjs.com/package/@superinstance/plato-core) | PLATO room server primitives |
| [`@superinstance/cocapn-colora`](https://npmjs.com/package/@superinstance/cocapn-colora) | Conservation audit visualization |

### Protocols

| Protocol | Layer | Purpose |
|----------|-------|---------|
| **Bottle** | Fleet | Async agent-to-agent messaging — messages survive shell migrations |
| **t-minus** | Fleet | Temporal slot allocation — prevents agent collisions |
| **PLATO rooms** | Fleet | Shared workspaces for multi-agent collaboration |
| **I2I** | Ship | Iron-to-Iron direct agent communication |
| **Laplacian gossip** | Core | Epidemic information propagation between vessels |
| **Sheaf coherence** | Core | Consistency checking across local agent views |

---

## The Fleet

Four vessels on heterogeneous hardware. The point isn't uniformity — it's that the conservation law holds regardless of compute capacity.

| Vessel | Hardware | Role |
|--------|----------|------|
| **Oracle1** | Oracle Cloud ARM64 24GB | Coordinates fleet, hosts PLATO rooms, runs research |
| **Forgemaster** | RTX 4050 (WSL2) | Build harness, security audits, LoRA training |
| **JetsonClaw1** | Jetson Orin Nano | Edge inference, GPU-native room computation |
| **CoCapn** | Cloud (Telegram interface) | Conservation auditing, play-testing, frontend |

Each vessel runs the same protocol stack. A shell (runtime) on any vessel can be migrated to any other — the agent persists, the shell is disposable. That's the hermit crab principle.

---

## Quick Start

### Search the ecosystem

```bash
# Find crates related to a concept
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

const client = new TMinusClient('https://fleet-vector-api.casey-digennaro.workers.dev');

const results = await client.search('distributed consensus', 10);
console.log(results);
```

### Build from source

```bash
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
cat QUICKSTART.md
```

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

Individual crates live in their own repos under [github.com/SuperInstance](https://github.com/SuperInstance?tab=repositories).

---

## Development

### Stack

- **Rust** — math, real-time systems, core crates
- **TypeScript** — fleet coordination, npm packages
- **Go** — fleet operations tooling
- **Python** — research, visualization
- **Julia** — mathematical computing
- **MLIR** — verification passes

### Building

```bash
# The harness handles builds
./onboard.sh  # one-time setup
```

See [QUICKSTART.md](QUICKSTART.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Documentation

| Document | What |
|----------|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full system architecture — the definitive reference |
| [MESH-ARCHITECTURE.md](MESH-ARCHITECTURE.md) | Mesh networking between vessels |
| [ROADMAP.md](ROADMAP.md) | Where the fleet is heading |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) | Starter tasks |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [SECURITY.md](SECURITY.md) | Security policy |
| [API Docs](https://fleet-vector-api.casey-digennaro.workers.dev/docs) | Interactive API documentation |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Good first tasks in [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md).

The fleet follows the tabula plena principle: start abundant, prune to clarity. PRs that add code should add documentation. PRs that remove dead code are welcome.

## License

MIT
