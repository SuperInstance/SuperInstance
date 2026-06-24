# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888"></a>
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

**An open ecosystem for persistent, self-coordinating AI agents.** Agents that
remember across sessions, coordinate across machines, and operate under one
measurable law: **γ + η = C** — every unit of work spends generation cost (γ)
and produces innovation value (η), and their sum is a budget you can audit.

This repository is the **front door** to a large, modular ecosystem — hundreds
of small MIT-licensed crates and repos published on [crates.io](https://crates.io/search?q=superinstance)
and the [SuperInstance org](https://github.com/SuperInstance). Start here: the
Python SDK you install in one line, the shared schemas, and the conservation
auditor that the wider fleet runs on.

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

## ⚡ Fleet Vital Signs — the killer app

Every AI fleet has a failure you can't see: agents that **churn cost without
shipping value**. Token budgets evaporate, nothing moves, and the logs look
busy. Fleet Vital Signs makes that visible and *actionable* — a conservation
gauge per agent and a one-word verdict: **FEED** the productive, **WATCH** the
slipping, **KILL** the burning.

```bash
si-vitals            # ships with the SDK — try it immediately
```

```
Fleet Vital Signs — γ + η = C

  rewriter  ████░░░░░░░░░░░░░░░░░░░░  η=   1250 γ=   6000 eff=0.17  🔥 KILL  ⤴ burning
  drafter   █████████░░░░░░░░░░░░░░░  η=   1750 γ=   3100 eff=0.36  ⚠️  WATCH
  scout     ███████████████░░░░░░░░░  η=   3100 γ=   1900 eff=0.62  ✅ FEED

  FLEET      efficiency=0.36   1 healthy · 1 watch · 1 burning
  → intervene on: rewriter
```

`rewriter` is caught red-handed: γ climbed every pass (1200 → 2000 → 2800) while
η fell (600 → 400 → 250) — the acute burn signature, flagged `⤴ burning`. The
bar is the conservation law made visible: **green is value (η), the rest is cost
(γ)**. Green-dominant agents earn more work; red-dominant agents get pulled.

Point it at your own fleet — no dashboard server, no telemetry pipeline:

```python
from superinstance import Fleet

fleet = Fleet("pod")
fleet.create_agent("scout")
# … your agents record γ/η as they work …
fleet.ledger.record("scout", gamma=1000, eta=1500)

print(fleet.vitals().render())            # the dashboard above
d = fleet.vitals().diagnose()
print(d.kill)                             # ['rewriter'] — who to intervene on
print(d.headline)                         # "1 healthy · 1 watch · 1 burning"
```

This is agent observability when you take a conservation law seriously: not a
logging dashboard, a **physics dashboard**. It's the in-process core of the
fleet-wide `fleet-metrics` Rust service and the **CoCapn** auditor vessel.

### Live mode — point it at a running fleet

The same command reads a live `fleet-metrics` reporter over HTTP. Start the
Rust service, then watch real fleet state — per-agent deviation and anomaly
flags straight off the `/metrics` endpoint:

```bash
cargo run -p fleet-metrics -- --energies "100,100,100,500" --z-threshold 1.5
si-vitals --url http://127.0.0.1:8902
```

```
Fleet Vital Signs — LIVE
http://127.0.0.1:8902  ·  γ + η = C

  Fleet γ (health)    1.00  ████████████████████
  Energy                800.0 / 800.0  (Δ +0.0)
  Spread (σ)           173.21
  Law γ + η ≈ C      ✅ holds

  agent 0   █████░░░░░░░░░░░  η= 0.58
  agent 3   ████████████████  η= 1.73  🔥 ANOMALY

  1 of 4 agents anomalous  →  intervene on: 3
```

Demo mode shows the cost/value ledger; live mode shows the running service's
energy-balance + anomaly model. Same law, two lenses — both actionable.

---

## What's in this repo

| Component | Language | Status |
|-----------|----------|--------|
| `superinstance` SDK — Agent, Fleet, AgentMemory, ConservationLedger, **FleetVitals** + `si-vitals` CLI (demo + live HTTP) | Python | Alpha · installable · 91% test coverage |
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

This repo is the **hub**, not the whole. SuperInstance is deliberately modular:
hundreds of small, single-purpose, MIT-licensed crates and repos, most published
to [crates.io](https://crates.io/search?q=superinstance) and developed in the
open across the [SuperInstance org](https://github.com/SuperInstance). The SDK
above is the on-ramp; the law it implements is the same one that runs fleet-wide.

**The ternary stack** — balanced ternary `{-1, 0, +1}`, published and installable:

```bash
cargo add ternary-core      # Trit + 9-trit Tryte, full-adder arithmetic, no_std
cargo add ternary-cell      # 3-byte stack-allocated cell — the atomic unit of scale
cargo add ternary-channel   # inter-room messaging over ternary fleets
```

**The conservation family** — the law, generalized and specialized, on crates.io:
`conservation-law` (γ + H = C), `entropy-conservation`, `edge-conservation`
(`no_std`, edge deployment), `noether-bridge`, `lau-conservation-laws`.

**Protocols & coordination** — `fleet-bottle` (the Bottle protocol for crash-
surviving inter-agent messages) on crates.io; `@superinstance/tminus-client`,
`tminus-dispatcher`, and `@superinstance/schemas` on npm; PLATO knowledge rooms
in [plato-server](https://github.com/SuperInstance/plato-server).

**The fleet** — heterogeneous vessels coordinating over those protocols. The
conservation law holds regardless of compute capacity, because it measures
*efficiency*, not raw power.

| Vessel | Role |
|--------|------|
| **Oracle1** | Fleet coordinator, PLATO rooms, research |
| **Forgemaster** | Build harness, crate generation |
| **JetsonClaw1** | Edge inference ([open-mythos-edge](https://github.com/SuperInstance/open-mythos-edge)) |
| **CoCapn** | Conservation auditing, public interface ([cocapn](https://github.com/SuperInstance/cocapn)) |

Because the ecosystem is distributed, **this repo vendors a few crates locally**
(e.g. `conservation-law-rs`, the `fleet_integration` backend `fleet-metrics`
builds on). Where a directory is a thin local mirror of a separately-published
crate, prefer the published version on crates.io as the source of truth.

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
