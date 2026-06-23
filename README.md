# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888"></a>
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

**An open ecosystem for persistent, self-coordinating AI agents.** Agents that
remember across sessions, coordinate across machines, and operate under one
measurable law: **γ + η = C** — every unit of work spends generation cost (γ)
and produces innovation value (η), and their sum is a budget you can audit.

This repository is the **front door**: the Python SDK you install to start, plus
the shared schemas and the conservation auditor that the wider fleet is built on.

---

## The idea in one minute

Most AI systems are monoliths — one model, one context window, one point of
failure. Kill the runtime and you kill everything. SuperInstance takes the
opposite stance, borrowed from the hermit crab: **the agent is persistent
identity; the shell is disposable infrastructure.** State — memory, identity,
task history — lives outside any single runtime, so agents survive when their
shell crashes or migrates.

On top of that sits one constraint that holds at every scale, from a single
agent to the whole fleet:

> **γ + η = C.** Churn tokens without shipping and η collapses while γ spirals.
> Ship without thinking and γ spikes on rework. The law makes that tradeoff
> *visible and tunable* — and in this repo, runnable.

---

## Install & first run

```bash
pip install superinstance        # Python 3.10+, no external services required
```

```python
from superinstance import Agent

agent = Agent("researcher")
agent.remember("User prefers concise Python examples")
agent.remember("Avoid pandas, prefer polars")

print(agent.ask("What does the user prefer?"))
# → "Based on my memory: User prefers concise Python examples"
```

Memory persists to `~/.superinstance/agents/{name}/` as plain markdown. Kill the
process, restart — the agent remembers. (Set `DEEPINFRA_API_KEY` and `ask()`
upgrades from keyword recall to real LLM reasoning over that memory.)

---

## Coordinate a fleet — and audit it

A `Fleet` runs many agents and carries a **conservation ledger**. As work
happens you record its cost (γ) and value (η); the fleet tells you who's
efficient and who's *burning* — spending cost without producing value.

```python
from superinstance import Fleet

fleet = Fleet("research_pod")
fleet.create_agent("scout",  tags=["research"])
fleet.create_agent("writer", tags=["content"])

# Record work as γ (cost) and η (value) — the law in action
fleet.ledger.record("scout",  gamma=1200, eta=1500, label="found 3 sources")
fleet.ledger.record("writer", gamma=2000, eta=400,  label="draft 1")
fleet.ledger.record("writer", gamma=2400, eta=300,  label="draft 2")
fleet.ledger.record("writer", gamma=2800, eta=250,  label="draft 3")

report = fleet.audit()
print(report)
# AuditReport(agents=2, C=10850, efficiency=0.23, burning=['writer'])
print("healthiest:", report.healthiest)   # → scout
```

`writer` is flagged: γ climbs draft over draft while η falls — the textbook
burn signature. This is the same auditing the fleet's **CoCapn** vessel runs
across machines; here it runs in-process so you can build on it today.

Routing and balance are real too — `fleet.dispatch(task, tag=...)` sends work to
the least-loaded qualified agent and bills the dispatch on the ledger, and
`fleet.spectral_balance()` computes the spectral gap of the agent coupling graph
(power iteration, no numpy) to show whether influence is concentrated or spread.

---

## What's in this repo

| Component | Language | Status |
|-----------|----------|--------|
| `superinstance` SDK — Agent, Fleet, AgentMemory, **ConservationLedger** | Python | Alpha · installable · 86% test coverage |
| Fleet type schemas (`@superinstance/schemas`) | TypeScript | Stable definitions |
| `conservation-law` — energy-conservation core (γ + η = C) | Rust | Alpha · zero-dependency · tested |
| `fleet-metrics` — real-time conservation reporter + HTTP API | Rust | Alpha · builds on `conservation-law` |
| Fleet automation (watchdog, indexer, beachcomb) | Python | Experimental |

The same law runs on both sides of the stack: in-process via the Python
`ConservationLedger`, and as a streaming Rust service (`cargo run -p fleet-metrics`)
that exposes `/metrics`, `/summary`, and `/transfer` over HTTP while verifying
γ + η = C every interval.

---

## The wider ecosystem

SuperInstance is bigger than this repo. The flagship SDK here is the on-ramp;
the fleet extends across additional repositories and published packages, each
MIT-licensed and developed in the open.

**The fleet** — heterogeneous vessels coordinating over async protocols. The
conservation law holds regardless of compute capacity, because it measures
*efficiency*, not raw power.

| Vessel | Role |
|--------|------|
| **Oracle1** | Fleet coordinator, PLATO rooms, research |
| **Forgemaster** | Build harness, crate generation |
| **JetsonClaw1** | Edge inference |
| **CoCapn** | Conservation auditing, public interface |

**Published packages** (npm): `@superinstance/tminus-client`,
`tminus-dispatcher`, `schemas`, `build-guardian`, `plato-core`.

**In active R&D** (design targets, not yet in this repo): the I2I and Bottle
protocols for cross-shell messaging, the balanced-ternary `{-1, 0, +1}` compute
stack, and multi-vessel deployment. The conservation law you can run above is
the first piece of that vision landed in code — the rest is documented in
[ROADMAP.md](ROADMAP.md) and [ARCHITECTURE.md](ARCHITECTURE.md) and built in the
open. Concepts that don't yet have running code are labelled as such, on purpose.

---

## Core API

```python
# Agent — persistent memory
agent.remember("fact", category="work")   # append to MEMORY.md
agent.recall("keyword")                    # keyword search
agent.ask("question")                      # LLM (if key set) or keyword
agent.spawn("subtask")                     # child agent, inherits identity

# Fleet — coordination + conservation
fleet.create_agent("name", tags=[...])
fleet.broadcast("message", tag=...)
fleet.dispatch("task", tag=...)            # route to least-loaded, bill γ
fleet.spectral_balance()                   # spectral gap of coupling graph
fleet.audit()                              # AuditReport: budgets, burn, efficiency

# ConservationLedger — γ + η = C, standalone
ledger.record("agent", gamma=..., eta=..., label="...")
ledger.budget("agent")                     # Budget(.total=C, .ratio, .efficiency)
ledger.is_burning("agent")                 # γ rising while η flat?
ledger.audit()                             # fleet-wide snapshot
```

---

## Develop

```bash
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
pip install -e ".[dev]"
pytest                      # 76 tests, coverage gate at 80%
```

---

## Documentation

| Doc | What |
|-----|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, layers, protocols |
| [ROADMAP.md](ROADMAP.md) | Where the fleet is heading |
| [ONBOARDING.md](ONBOARDING.md) | Full setup guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) | Starter tasks |
| [API Docs](https://fleet-vector-api.casey-digennaro.workers.dev/docs) | Live API reference |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). PRs that add code must add tests. PRs
that remove dead code are welcome. *Tabula plena: start abundant, prune to clarity.*

---

## License

MIT

---

*The crab inherits the shell. The agent persists; the shell is disposable. And every unit of work answers to γ + η = C.*
