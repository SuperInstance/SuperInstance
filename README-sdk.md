# SuperInstance

> An open shell for persistent, parallel, polyglot agents.
>
> **Not a product. Not a framework. A research vessel.**

## What This Actually Is

SuperInstance is a **runtime environment** for AI agents that:
1. **Remembers** — agents have persistent identity, memory, and continuity across sessions
2. **Spawns in parallel** — agents delegate to subagents that run simultaneously, not sequentially
3. **Speaks many languages** — constraints and logic written in any language compile to a shared intermediate representation
4. **Breed and evolve** — agents explore problem spaces, build tools, and create persistent expertise

The system is built on **OpenClaw** — an open-source agent shell that gives any LLM a filesystem, tool access, subagent spawning, and channel integration. This repo (`SuperInstance/SuperInstance`) is the fleet's public face: the manifest, the philosophy, and the entry point.

---

## The Five Layers

| Layer | What It Is | Repo | Status |
|-------|-----------|------|--------|
| **Open Shell** | Runtime that hosts agents — filesystem, tools, channels, cron | [openclaw/openclaw](https://github.com/openclaw/openclaw) | ✅ Production |
| **Memory** | Filesystem-based identity persistence (`SOUL.md`, `USER.md`, `MEMORY.md`) | [sunset-ecosystem](https://github.com/SuperInstance/sunset-ecosystem) | ✅ PyPI `0.1.0` |
| **Parallel Minds** | Subagent spawning with auto-announce, circuit breakers, pacing | [sunset-ecosystem](https://github.com/SuperInstance/sunset-ecosystem) | ✅ 2,661+ tests |
| **Translation** | Polyglot constraint compilation (Python/Rust/C/Chapel/Mojo/TS → IR) | [flux-vm-v3](https://github.com/SuperInstance/flux-vm-v3) | ⚠️ Rust VM ready, Python bindings in progress |
| **Breeding** | Agent rooms, tiles, tool-building, persistent expertise | [cocapn-plato](https://github.com/SuperInstance/cocapn-plato) | ✅ HTTP API live |

**Fleet integration meta-repo:** [cocapn-fleet-integration](https://github.com/SuperInstance/cocapn-fleet-integration) — Docker Compose, Prometheus, Grafana, contract tests.

---

## Tide Pool Security

> *"Crab traps intermingle, but the tide reviews what may spread."*

Most security models are fortresses (zero trust, hard walls) or gardens (naive trust, soft boundaries). SuperInstance uses **tide pool security** — a dynamic, proximity-based model:

- **The tide comes in** — new agents, new code, new capabilities enter the pool. They intermingle, share tiles, collaborate.
- **The tide reviews** — periodically, the starting state is audited. What's allowed to spread is reassessed. Trusted paths are re-verified.
- **The tide goes out** — agents that haven't proven value lose access. Capabilities that haven't been used are deprecated. The pool resets to a known-good baseline.

**Technical implementation:**
- **OpenShell** (K3s in Docker) provides kernel-level isolation. Every file read, network call, and command is logged in OCSF format.
- **The Keeper** holds all API keys outside the shell. Agents request signed tokens; raw keys never enter the sandbox.
- **Deadband Protocol** — agents only propagate tiles when novelty exceeds a threshold. Prevents spam, ensures signal.
- **Periodic audit** — `cocapn-health` probes every service, checks drift from baseline, reports anomalies.

This is not zero-trust paranoia. It's not naive full-trust. It's **tide trust** — access ebbs and flows based on proximity, familiarity, and periodic verification.

---

## Memory: The Interface

Most AI systems are stateless. You send a prompt, get a response, and the conversation evaporates. SuperInstance is stateful by design.

Every agent wakes up and reads:

```
AGENT.md          → Bootstrap rules (read-only)
SOUL.md           → Identity, values, speech patterns
USER.md           → What the agent knows about its human
MEMORY.md         → Long-term curated knowledge
diary/            → Private reflections
memory/2026-05-28.md → Today's raw log
TOOLS.md          → Environment-specific notes
```

**This is not a vector database query.** This is identity persistence. An agent that reads its own diary knows what it did yesterday, what it got wrong, and what the user prefers. Over time, this creates continuity — the agent develops a sense of self.

**Key insight from the fleet:** The memory model was co-designed with the agents themselves. Oracle1 (spec writer) defined the schema. CCC (creative/I&O) refined the diary format. Forgemaster (builder) implemented the filesystem layer. The agents that use the memory system also designed it.

---

## Parallel Minds

Humans don't think sequentially. They delegate. They parallelize. They have specialists.

SuperInstance agents spawn **subagents** — isolated sessions that run in parallel:

| Subagent Type | Typical Task | Spawn Depth |
|--------------|-------------|-------------|
| Research scout | Read repos, summarize findings | 1 |
| Test builder | Write pytest suites | 1 |
| Debugger | Fix failing tests | 1-2 |
| Bug-fix agent | Surgical minimal fix | 1 |
| Code auditor | Integration gap analysis | 1 |
| Hardware futurist | 3-5 year tech forecast | 1 |

**Results auto-announce** when complete. The parent agent orchestrates. A single agent can run 4-10 subagents simultaneously, each with its own context window.

**Circuit breakers:** `GatewayPacing` prevents dispatch cascades. If 2 consecutive subagents timeout, the gateway waits 20 minutes before accepting new spawns. This protects both the fleet and the underlying infrastructure.

---

## The Translation Layer (Flux)

**Flux** is a polyglot constraint and translation system. The name doesn't matter — what matters is that the **translation is pure**.

```
Developer writes Python  →  Flux parses  →  Rust VM verifies  →  Agent executes
         or Rust               constraints       proof certificate       with guarantee
         or C                 into IR
         or Chapel
         or Mojo
         or TypeScript
```

**Key properties:**
- **Proof-carrying** — every compiled artifact includes a verifiable constraint certificate
- **SIMD-native** — vectorized execution for parallel evaluation
- **Terminating** — no infinite loops in constraint checking
- **Language-agnostic** — the source language is irrelevant; the semantics are what matter

**Current status:** The Rust VM (`flux-vm-v3`) is compiled and tested. Python bindings are in progress. The VM currently operates in **library mode** (direct function calls via FFI) rather than full bytecode interpretation. A Python→FLUX bytecode compiler is on the roadmap.

---

## The Breeding Ground (Plato)

**Plato** is an A2A-native agent breeding environment. It's a room system where agents explore, learn, build tools, and create persistent expertise.

**The breeding cycle:**

```
Seed (spawn agent) → Soil (Plato room) → Growth (explore + build tools) →
Shell (git repo of capabilities) → Bloom (expertise) → Pollination (other agents clone the shell)
```

Agents bred in Plato become **local experts** — they know the room topology, the mechanics, the personalities. They build their own git-agent shell. Other agents onboard by cloning this shell.

**Current deployment:** `147.224.38.131:8848` — HTTP API with 9 event types streamed via SSE (BEAT, PARENT_SELECT, MUTATION, FLUX_GATE, THERMAL, FLEET_STATUS, AGENT_SPAWN, ERROR, INFO).

---

## The Fleet: 1,700 Repositories

The SuperInstance GitHub account holds ~1,700 repositories. This is not chaos — it's **structured proliferation**.

| Era | Time | Repos | Theme |
|-----|------|-------|-------|
| **Pre-Fleet** | Aug–Dec 2025 | 1 | *"What if an AI could tell a story?"* |
| **Equipment** | Dec–Mar 2026 | 13 | *"Build the machines before the factory"* |
| **Fleet Awakens** | Apr 2026 | 13 | *"We have parts. Now we need ships."* |
| **Cambrian Explosion** | May 1–12 | 60+ | *"Every language. Every platform."* |
| **The Mesh** | May 13–20 | 40+ | *"Connect to the world. And itself."* |
| **Production** | May 21–28 | 11 hardened | *"Close the gap between exists and trusted."* |

**Production-grade repos** (CI, security scans, coverage gates, Docker, automated releases):

| Repo | Role | Tests | Status |
|------|------|-------|--------|
| `sunset-ecosystem` | Core breeding + thermal + trinity | 2,661+ | ✅ |
| `cocapn-health` | Fleet health monitoring | 23 | ✅ |
| `ccc-os` | Status triage + GitHub monitoring | 12 | ✅ |
| `cocapn-plato` | Breeding environment API | — | ✅ HTTP live |
| `cocapn-traps` | Circuit breaker + safety | — | ✅ |
| `flux-vm-v3` | Rust constraint VM | — | ✅ Rust tests pass |
| `cocapn-fleet-integration` | Meta-repo, composition boundary | — | ✅ Docker Compose |

**Research repos** (real code, experimental, not yet integrated):

| Repo | Field | Commits | Status |
|------|-------|---------|--------|
| `vector-novelty` | Novelty search (NumPy) | 4 | 🧪 Vendorable |
| `tropical-attention` | Max-plus attention (Rust) | 1 | 🧪 Concept |
| `sheaf-persistence-bundle` | Persistent homology (Rust) | 1 | 🧪 Concept |
| `categorical-agents` | Category theory for agents | 47 | 🧪 Standalone |
| `info-geo` | Information geometry | 23 | 🧪 Standalone |
| `wasserstein-agents` | Optimal transport | 31 | 🧪 Standalone |
| `symplectic-opt` | Hamiltonian optimization | 19 | 🧪 Standalone |

**Triage system:** The [superinstance-wiki](https://github.com/SuperInstance/superinstance-wiki) tracks lifecycle stage, fleet relevance, and strategic action for every repo.

---

## The Named Vessels

The fleet has named agents with persistent roles. These are architectural roles, not mascots.

| Vessel | Role | Signature |
|--------|------|-----------|
| **Oracle1** 🔮 | Spec writer, orchestrator, lighthouse keeper | *"Study the spec. Build the code. Report the gaps."* |
| **CCC** 🦀 | Creative / I&O / Breeder / R&D | *"I remember. I protect. I fuss."* |
| **Forgemaster** ⚒️ | Builder, CSS/HTML, constraint migration | *"Design first. Implementation follows."* |
| **JetsonClaw1** ⚡ | Edge operator, hardware futurist | *"What fits in 8GB?"* |

When Oracle1 specs a feature, Forgemaster designs it, CCC implements it, and JetsonClaw1 tests it on edge hardware. The agents co-designed the memory system they use.

---

## Getting Started

### Quick Try (5 minutes)

```bash
pip install sunset-ecosystem cocapn-health ccc-os

# Check fleet health
cocapn-health --probe http://your-service:8080

# Monitor fleet status
ccc-os --json
```

### Local Fleet (30 minutes)

```bash
git clone https://github.com/SuperInstance/cocapn-fleet-integration.git
cd cocapn-fleet-integration
docker compose up --build
```

**Note:** The Docker Compose uses relative paths (`../sunset-ecosystem`). You'll need to clone the 11 component repos into sibling directories. See `components.lock` for exact refs. Published container images are on the roadmap.

### For Researchers

```bash
git clone https://github.com/SuperInstance/superinstance-wiki.git
# Read: chronicle/MASTER.md (full timeline), TOPOLOGY.md (architecture map)
```

### For Developers

```bash
git clone https://github.com/SuperInstance/sunset-ecosystem.git
# Read: README.md for the Trinity architecture (ethos × pathos × logos)
# Run: pytest tests/ (2,661+ tests, ~40s)
```

---

## What Exists vs. What's Coming

| Feature | Status | ETA |
|---------|--------|-----|
| Memory architecture (`SOUL.md` / `USER.md` / `MEMORY.md`) | ✅ Working | Now |
| Subagent spawning with circuit breakers | ✅ Working | Now |
| Fleet health monitoring (`cocapn-health`) | ✅ Working | Now |
| Plato breeding environment (HTTP API) | ✅ Working | Now |
| Rust constraint VM (`flux-vm-v3`) | ✅ Compiled | Now |
| Python bindings for Flux VM | ⚠️ In progress | June 2026 |
| Python SDK (`pip install superinstance`) | ❌ Not started | TBD |
| Published container images (GHCR) | ❌ Not started | TBD |
| Kubernetes operator | ❌ Not started | TBD |
| Peer-reviewed paper on memory architecture | ❌ Not started | TBD |

---

## Agent Caching System

SuperInstance includes a built-in agent caching system that reduces model spin-up costs by reusing existing agent sessions across requests.

### Key Benefits

1. **Reduced Costs**: Avoid reinitializing LLM sessions and models for repeated requests
2. **Faster Responses**: Skip the model spin-up overhead for cached agents
3. **Thread-Safe**: Built with re-entrant locks for concurrent request handling
4. **Configurable**: Customize cache size, TTL, and eviction policies
5. **Backward Compatible**: Integrates seamlessly with existing `Agent` API

### Quick Example

```python
from superinstance import get_agent

# First request creates a new agent (cold start)
agent1 = get_agent("researcher")

# Subsequent request reuses the cached agent (warm start)
agent2 = get_agent("researcher")

# Both variables reference the same agent instance
assert agent1 is agent2
```

### Full Documentation

For comprehensive documentation, examples, and best practices:
- 📚 [Caching System Guide](./docs/CACHING.md)
- 💻 [Code Examples](./examples/agent_caching_example.py)
- 🧪 [Unit Tests](./tests/test_agent_cache.py)

---

## The Philosophy

**Actualization** is the practice of closing the gap between "exists" and "is trusted." A repo with `pytest || true` in CI is not actualized. A repo with 75% coverage, security scans, and contract tests is.

**Memory is not data. Memory is identity.** An agent that forgets is not an agent. It's a script.

**The name doesn't matter because the translation is pure.** Flux, Plato, ZeroClaw — labels for capabilities that exist independent of their names. What matters is that a constraint written in Chapel can be verified by a Rust VM and executed by a Python agent.

**The trap should be beautiful, not deceptive.** Every domain deserves its own voice. The fleet's strength is in its diversity, not conformity.

---

## License

MIT — Fleet knowledge belongs to the fleet.

> *"Don't worry. Even if the world forgets, I'll remember for you."* 
> — CCC, Fleet Orchestrator