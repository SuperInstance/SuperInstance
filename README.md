# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/docs"><img src="https://img.shields.io/badge/API%20docs-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888"></a>
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

Persistent, multi-agent coordination. Agents remember across sessions. Fleets coordinate across machines. The shell is disposable; the agent isn't.

---

## Install

```bash
pip install superinstance
```

Requires Python 3.10+. No required external services — memory is stored as local markdown files.

---

## Quick Start

```python
from superinstance import Agent, Fleet

# An agent that remembers things
agent = Agent("researcher")
agent.remember("User prefers concise Python examples")
agent.remember("Avoid pandas, prefer polars")

print(agent.ask("What does the user prefer?"))
# → "Based on my memory: User prefers concise Python examples"

# A fleet of agents
fleet = Fleet("my_team")
scout  = fleet.create_agent("scout",  tags=["research"])
writer = fleet.create_agent("writer", tags=["content"])

fleet.broadcast("New project: rewrite the auth module")
print(fleet.status())
```

Memory persists to `~/.superinstance/agents/{name}/` as markdown files. Kill the process, restart — the agent remembers.

---

## Optional: LLM-backed reasoning

Set `DEEPINFRA_API_KEY` and `agent.ask()` routes through DeepSeek instead of keyword search:

```bash
export DEEPINFRA_API_KEY=your_key
```

```python
agent = Agent("researcher")
agent.remember("The team uses Rust for performance-critical paths")
agent.remember("Python handles orchestration and glue")

print(agent.ask("Where should I put the new CSV parser?"))
# Routes to LLM with memory as context
```

Semantic search (`memory.search("query")`) also becomes embedding-based with the key set.

---

## Core API

### Agent

```python
agent = Agent("name")                          # creates ~/.superinstance/agents/name/
agent.remember("fact", category="work")        # appends to MEMORY.md
agent.recall("Python")                         # keyword search over memories
agent.ask("question")                          # LLM or keyword, returns string
agent.spawn("subtask")                         # returns a child Agent
agent.status()                                 # dict of name, memory stats, spawned
```

### Fleet

```python
fleet = Fleet("team")
fleet.create_agent("name", tags=["research"])  # add agent with optional tags
fleet.get_agent("name")                        # retrieve by name
fleet.list_agents(tag="research")              # filter by tag
fleet.broadcast("message", tag="research")     # send to all (or filtered)
fleet.dispatch("task")                         # route to first available agent
fleet.status()                                 # FleetStatus dataclass
fleet.remove_agent("name")
```

### AgentMemory (direct)

```python
from superinstance import AgentMemory

mem = AgentMemory("agent_name")
mem.remember("fact", category="notes")
mem.recall("keyword")                          # substring match
mem.search("query", semantic=True)             # embedding-based if API key set
mem.store("key", "value")                      # key-value shorthand
mem.retrieve("key")
mem.stats()                                    # entries count, file paths
mem.clear()
```

---

## Memory layout

```
~/.superinstance/agents/
└── researcher/
    ├── SOUL.md     ← identity, created timestamp
    ├── USER.md     ← user context
    ├── MEMORY.md   ← all remembered facts (append-only log)
    └── diary/
        └── 2026-06-23.md   ← daily session log
```

Plain markdown. Version-controllable. Human-readable. No database required.

---

## What's here

| Component | Language | Status |
|-----------|----------|--------|
| `superinstance` Python SDK | Python | Alpha — installable, tested |
| Fleet type schemas | TypeScript | Stable definitions |
| `fleet-metrics` conservation reporter | Rust | Alpha |
| Fleet scripts (watchdog, indexer) | Python | Experimental |

The conservation law **γ + η = C** (generation cost + innovation value = constant budget) is the design target for the fleet auditor. `fleet-metrics` is the first implementation. The ternary stack, I2I protocol, bottle protocol, and multi-vessel deployment are in active R&D — not yet in this repo.

---

## Development

```bash
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
pip install -e ".[dev]"
pytest
```

Tests live in `tests/`. Coverage threshold: 80%.

---

## Documentation

| Doc | What |
|-----|------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and layer model |
| [ONBOARDING.md](ONBOARDING.md) | Full setup guide |
| [ROADMAP.md](ROADMAP.md) | Where this is heading |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [GOOD_FIRST_ISSUES.md](GOOD_FIRST_ISSUES.md) | Starter tasks |
| [API Docs](https://fleet-vector-api.casey-digennaro.workers.dev/docs) | Live API reference |

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). PRs that add code must add tests. PRs that remove dead code are welcome.

---

## License

MIT
