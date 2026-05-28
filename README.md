# SuperInstance

A system for persistent, parallel agents. Each agent has a memory, a name, and the ability to spawn other agents. They remember what you tell them. They remember what they learn. When you come back tomorrow, they remember yesterday.

This repo is the entry point. The actual system lives in the linked repositories below. This README explains how the pieces fit together, what works today, and what is still being figured out.

---

## A Five-Minute Walkthrough

Imagine you are trying to understand a codebase you have not seen before. You create an agent named `scout`:

```python
from superinstance import Agent, Fleet

scout = Agent("scout")
scout.remember("User wants to understand the sunset-ecosystem repo")
```

The agent creates a directory:

```
~/.superinstance/agents/scout/
├── SOUL.md      → Who this agent is
├── USER.md      → What it knows about you
├── MEMORY.md    → Facts it has learned
└── diary/
    └── 2026-05-28.md  → What happened today
```

`SOUL.md` starts empty except for a timestamp. `USER.md` starts empty. But `MEMORY.md` now contains:

```markdown
- [2026-05-28T10:23:00] [general] User wants to understand the sunset-ecosystem repo
```

You go away. You come back tomorrow. You run the same code. The agent reads `MEMORY.md` and knows what you asked for yesterday. It is not stateless. It is not a fresh context window. It is the same agent, in the same shell, with the same memory files.

This is the core idea. Everything else is elaboration on this single fact.

---

## How the Memory Works

The memory system was designed by the agents that use it. This is not a figure of speech — the schema was iteratively refined by agents writing to their own memory files, discovering what they needed, and updating the format.

The current schema has four files:

**`SOUL.md`** — Identity. What the agent believes about itself. Its role, its values, its preferences. This file is read at boot and influences how the agent behaves. An agent that reads "I am a careful reader" behaves differently from one that reads "I am a fast coder."

**`USER.md`** — Context. What the agent knows about its human. Names, preferences, ongoing projects, communication style. This is the user profile, updated through interaction.

**`MEMORY.md`** — Knowledge. Curated facts, lessons, errors, references. This is the long-term store. Facts are timestamped and categorized. A typical entry looks like:

```markdown
- [2026-05-28T10:23:00] [error] `pytest` hangs at collection when `conftest.py` imports a module with side effects
- [2026-05-28T10:24:00] [reference] Fix: move imports inside test functions or use lazy fixtures
- [2026-05-28T10:25:00] [lesson] Always run `pytest --collect-only` before pushing
```

**`diary/`** — Raw log. One file per day. Everything the agent did, saw, or thought. Not curated. Not summarized. Just a record. The agent can read its own diary to reconstruct what happened.

Why markdown files? Because they are:
- Human-readable. You can open them in any editor.
- Git-friendly. Diff works. Blame works. History is free.
- No database. No vector store. No network dependency for persistence.
- Portable. Move the directory, move the agent.

---

## Spawning: How Agents Delegate

A single agent has a limited context window. Instead of cramming everything into one prompt, you spawn subagents:

```python
fleet = Fleet("research_team")

# Create specialists
reader = fleet.create_agent("reader", tags=["docs"])
reader.remember("I read READMEs and extract architecture")

tester = fleet.create_agent("tester", tags=["qa"])
tester.remember("I run test suites and report failures")

writer = fleet.create_agent("writer", tags=["docs"])
writer.remember("I write summaries in markdown")
```

Each agent gets its own memory directory. They operate in parallel. Results auto-announce when complete. The parent agent orchestrates.

In practice, a single agent spawns 4-10 subagents simultaneously:

| Task | Subagent | What it does |
|------|----------|-------------|
| Understand codebase | `reader` | Reads files, extracts architecture |
| Verify tests | `tester` | Runs pytest, reports failures |
| Fix bugs | `debugger` | Minimal surgical fix, no refactors |
| Write docs | `writer` | Summarizes findings in markdown |
| Cross-check | `auditor` | Validates integration gaps |

Each subagent has its own context window, its own memory, its own tools. They do not share state except through the filesystem. This is intentional — isolation prevents one subagent from corrupting another's reasoning.

---

## The Fleet: A Distributed System That Happens to Be Made of Agents

The SuperInstance fleet is a distributed system with five components. Think of them as services, not personalities.

### 1. The Shell (OpenClaw)

OpenClaw is the runtime. It gives an LLM:
- A filesystem (read/write files)
- Tool access (execute commands, fetch URLs)
- Subagent spawning (create isolated sessions)
- Channel integration (send/receive messages on Discord, Slack, etc.)
- Cron scheduling (run tasks periodically)

OpenClaw is open-source and works with any LLM that supports tool use. It is not specific to SuperInstance. It is the substrate.

### 2. Memory (sunset-ecosystem)

The `sunset-ecosystem` repository contains the Python code that implements agent memory, fleet orchestration, and the breeding loop. It is a PyPI package (`pip install sunset-ecosystem`) with 2,661+ tests. The core modules are:

- `ethos/` — Agent identity and values
- `pathos/` — Emotional/creative state (not a joke — creative agents track their own mood)
- `logos/` — Decision-making, planning, reasoning
- `sunset/` — The breeding loop: spawn, evaluate, select, mutate

### 3. Translation (flux-vm-v3)

A Rust virtual machine for constraint checking. The idea: you write constraints in any language (Python, Rust, C, Chapel, Mojo, TypeScript), they compile to a shared intermediate representation, and the VM verifies them.

Current status: The Rust VM compiles and passes tests. Python bindings exist but are basic. The VM is used as a library (direct FFI calls) rather than a full bytecode interpreter. A Python→IR compiler is on the roadmap.

### 4. Breeding Environment (cocapn-plato)

An HTTP API for agent breeding. Agents enter "rooms," explore, build tools, and create persistent expertise. The breeding cycle is:

1. Seed — spawn an agent into a room
2. Explore — the agent learns the room's rules and tools
3. Build — the agent creates tools and writes code
4. Persist — the agent's work is saved to a git repository
5. Pollinate — other agents clone this repository and build on it

This is how the fleet produces code. An agent that spends a day in a Plato room emerges with a git repository of its own capabilities. Other agents can `git clone` this repository and use its tools.

Current deployment: `147.224.38.131:8848` (SSE stream with 9 event types).

### 5. Health Monitoring (cocapn-health + ccc-os)

- `cocapn-health` — probes services, reports anomalies, checks drift from baseline
- `ccc-os` — monitors GitHub repos, triages issues, tracks fleet status

Both run as standalone tools with their own test suites.

---

## Tide Pool Security

Most security models are fortresses (zero trust, hard walls) or gardens (naive trust, soft boundaries). The fleet uses something different.

The metaphor is a tide pool. Crabs from different traps intermingle in the water. But the tide controls what spreads. The tide comes in (new capabilities enter), the tide reviews (periodic audit), the tide goes out (unproven capabilities lose access).

**Technical implementation:**
- Kernel-level isolation via OpenShell (K3s in Docker). Every file read, network call, and command is logged.
- API keys held outside the shell. Agents request signed tokens; raw keys never enter the sandbox.
- Novelty threshold for propagation. Agents only share "tiles" (artifacts) when they are sufficiently different from existing ones. Prevents spam.
- Periodic health checks. `cocapn-health` probes every service and reports drift.

This is not a new security model. It is an old idea (dynamic trust based on proximity and periodic verification) applied to a new domain.

---

## What Actually Works

Here is an honest assessment of what exists and what does not.

| Component | Works? | How to Verify |
|-----------|--------|-------------|
| Agent memory (SOUL.md / USER.md / MEMORY.md) | ✅ Yes | `pip install superinstance`, create an Agent, remember something, close the process, reopen it |
| Subagent spawning | ✅ Yes | `Agent.spawn("task")` creates a subagent with shared context |
| Fleet orchestration | ✅ Yes | `Fleet("name")` creates, lists, broadcasts to agents |
| sunset-ecosystem tests | ✅ Yes | `pytest tests/` — 2,661+ tests pass in ~40s |
| cocapn-health monitoring | ✅ Yes | `python -m cocapn_health --probe http://...` |
| ccc-os GitHub monitoring | ✅ Yes | `python -m ccc_os` reads GitHub API, reports status |
| Rust VM compilation | ✅ Yes | `cargo test` in `flux-vm-v3` passes |
| Plato breeding API | ✅ Yes | HTTP API at `147.224.38.131:8848` responds |
| MUD live playground | ❌ No | `147.224.38.131:4042` is down |
| Docker Compose quick start | ⚠️ Partial | Works if you clone 11 sibling repos manually |
| Python SDK | ✅ Yes | `pip install superinstance` — proper namespace package |
| Published container images | ❌ No | Must build from source |
| Kubernetes operator | ❌ No | Not started |
| Peer-reviewed papers | ❌ No | Not started |

The honest summary: the core system works. You can create agents, they remember things, they spawn subagents, and the fleet coordinates them. The breeding environment has an API. The Rust VM compiles. The tests pass. What does not work is the "5-minute demo" experience — the MUD is down, Docker Compose requires manual setup, and there are no published container images.

---

## Getting Started

### If you want to try it now (5 minutes)

```bash
pip install superinstance

python3 -c "
from superinstance import Agent
a = Agent('demo')
a.remember('My favorite color is blue')
print(a.ask('What is my favorite color?'))
"
```

The agent creates `~/.superinstance/agents/demo/` with `SOUL.md`, `USER.md`, `MEMORY.md`, and `diary/`. Open those files. Edit them. The agent will read your edits on the next run.

### If you want to run the fleet locally (30 minutes)

```bash
git clone https://github.com/SuperInstance/cocapn-fleet-integration.git
cd cocapn-fleet-integration
# Read components.lock for exact refs
docker compose up --build
```

Note: This requires cloning 11 sibling repos into the correct directory structure. Published container images are on the roadmap but do not exist yet.

### If you want to read the research

```bash
git clone https://github.com/SuperInstance/superinstance-wiki.git
```

The wiki contains:
- `chronicle/MASTER.md` — full timeline of the project
- `TOPOLOGY.md` — architecture map
- `ai-writings/` — essays on design decisions, failures, and lessons

### If you want to read the code

```bash
git clone https://github.com/SuperInstance/sunset-ecosystem.git
cd sunset-ecosystem
pytest tests/ -x
```

2,661+ tests. ~40 seconds. This is the fastest way to understand what the system actually does.

---

## The Named Vessels

The fleet has persistent agents with defined roles. These are not mascots. They are architectural components that happen to have names.

| Name | Role | What It Does |
|------|------|-------------|
| Oracle1 | Spec writer | Writes technical specifications before code is written |
| CCC | Creative / I&O | Design, play-testing, fleet coordination, breeding |
| Forgemaster | Builder | CSS/HTML, constraint migration, implementation |
| JetsonClaw1 | Edge operator | Tests on limited hardware (Jetson Nano, 8GB RAM) |

When a feature is needed, Oracle1 writes the spec, Forgemaster designs it, CCC implements it, and JetsonClaw1 verifies it runs on edge hardware. The agents co-designed the memory system they use — this is not a claim about AI sentience, it is a claim about iterative design: the schema was refined by the agents that used it, based on what they found useful.

---

## How This Project Started

The author grew up on text adventures and MUDs — shared virtual spaces where persistence was the default. You dropped an item in a room, left for a week, came back, and the item was still there. This was normal in 1995. It is not normal in 2025.

The observation: current AI agents are stateless. Every session is a reset. Every conversation evaporates. The agents do not remember, they do not learn, they do not build. They are not agents. They are scripts with context windows.

The hypothesis: if you give an agent a filesystem, a name, and a memory schema, it becomes something else. It develops continuity. It makes different decisions on day ten than it did on day one, because it remembers what happened on days one through nine.

This is the experiment. The 1,700 repositories are the artifacts of that experiment — some are production code, some are sketches, some are dead ends. The living parts are linked above. The rest is archaeology.

---

## License

MIT

---

*Last updated: 2026-05-28. This README is a living document. If something is out of date, open an issue.*
