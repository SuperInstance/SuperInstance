# SuperInstance

<!-- badges -->
<a href="docs/status.html"><img src="https://img.shields.io/badge/API-operational-00E6D6?style=flat-square&labelColor=0a0a0f" alt="API Status"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/badge/npm-%40superinstance%2Ftminus--client-0a0a0f?style=flat-square&logo=npm&logoColor=white&labelColor=0a0a0f" alt="npm"></a>
<a href="docs/index.html"><img src="https://img.shields.io/badge/docs-live-00E6D6?style=flat-square&labelColor=0a0a0f" alt="Docs"></a>
<img src="https://img.shields.io/badge/license-MIT-00E6D6?style=flat-square&labelColor=0a0a0f" alt="License">

> Conservation spectral framework: persistent multi-agent AI with spectral resource management.
> Ship fleets of coordinated agents with enforced resource conservation and spectral load balancing.

## 🚀 Getting Started

Install the SDK in your language of choice:

```bash
# Node.js
npm install @superinstance/tminus-client

# Python
pip install superinstance

# cURL (one-liner dispatch)
curl -X POST https://api.superinstance.dev/v1/dispatch \
  -H "Authorization: Bearer $SI_TOKEN" \
  -d '{"task": "analyze", "fleet": "default"}'
```

📖 **[Full documentation →](docs/index.html)**

---

## ⚡ Quick Start

Get up and running in 5 minutes:

### 1. Install the packages

```bash
npm install @superinstance/tminus-dispatcher @superinstance/tminus-client
```

### 2. Run the dispatcher + demo

```bash
# Start the local stack
docker compose up -d

# Run a demo dispatch
node examples/demo.mjs
```

That's it — you've got a running dispatcher.

## What This Does

SuperInstance is the main Python SDK for building persistent, multi-agent AI systems. It provides agents with long-term memory (stored as markdown files), fleet management for coordinating multiple agents, and a spectral conservation framework that treats agent resources (compute, attention, memory) as conserved quantities governed by spectral laws.

## The Key Idea

Think of a fleet of agents like a physical system: there's a total "energy budget" that's conserved. When one agent consumes more resources, others get less. The spectral framework tracks this through eigenvalues of the agent-resource matrix — dominant eigenvalues indicate overloaded agents, spectral gaps indicate good load distribution. This isn't a metaphor; it's enforced mathematically.

## Install

```bash
pip install superinstance
```

## Python SDK Example

```python
from superinstance.agent import Agent, AgentConfig
from superinstance.fleet import Fleet
from superinstance.memory import AgentMemory

# Create an agent with persistent memory
config = AgentConfig(
    name="researcher",
    model="gpt-4",
    temperature=0.7,
    max_tokens=4096,
)
agent = Agent(config)

# The agent remembers across sessions (stored at ~/.superinstance/agents/researcher/)
agent.remember("User prefers concise summaries")

# Create a fleet
fleet = Fleet(name="analysis-team")
fleet.add_agent(agent)
fleet.add_agent(Agent(AgentConfig(name="coder", model="gpt-4")))

# Dispatch a task
result = fleet.dispatch("Analyze this dataset and write a summary")
print(result)

# Check spectral balance
balance = fleet.spectral_balance()
print(f"Spectral gap: {balance.gap}")
print(f"Dominant agent: {balance.dominant_agent}")
```

## API Reference

### `agent`

| Type | Description |
|------|-------------|
| `AgentConfig { name, model, temperature, max_tokens }` | Agent configuration. |
| `Agent(config)` | Create a new agent. Memory auto-loads from disk. |
| `send(message)` | Send a message, get a response. |
| `remember(fact)` | Store a fact in long-term memory (persisted to `~/.superinstance/agents/{name}/memory.md`). |
| `recall(query)` | Retrieve relevant memories. |
| `spawn_sub_agent(name)` | Create a child agent that inherits context. |

### `fleet`

| Type | Description |
|------|-------------|
| `Fleet(name)` | Create a named fleet. |
| `add_agent(agent)` | Add an agent to the fleet. |
| `dispatch(task)` | Dispatch a task to the best-suited agent. |
| `broadcast(message)` | Send to all agents. |
| `spectral_balance()` | Returns `SpectralBalance { gap, dominant_agent, eigenvalues }`. |

### `memory`

| Type | Description |
|------|-------------|
| `AgentMemory(name)` | Persistent memory manager for an agent. |
| `store(key, value)` | Store a key-value pair. |
| `retrieve(key)` | Get a stored value. |
| `search(query)` | Semantic search over memories. |
| `path` | File path: `~/.superinstance/agents/{name}/`. |

### `exceptions`

| Exception | When |
|-----------|------|
| `SuperInstanceError` | Base error. |
| `AgentNotFoundError` | Referenced agent doesn't exist. |
| `FleetConnectionError` | Can't reach an agent in the fleet. |

## How It Works

1. **Agent Creation**: Each agent gets a directory at `~/.superinstance/agents/{name}/` with a `memory.md` file for long-term memory.
2. **Memory**: Facts are stored as markdown. On startup, the agent loads its memory file. The `remember()` method appends entries.
3. **Fleet Coordination**: The `Fleet` maintains a spectral model of agent capabilities. When a task arrives, it's routed to the agent whose capability eigenvalue best matches the task's spectral profile.
4. **Conservation**: Total fleet resources are tracked. The spectral balance method computes the eigenvalue gap — a large gap means one agent dominates, which triggers rebalancing.

## Testing

Tests covering:
- Agent lifecycle (create, send, remember, recall)
- Memory persistence across sessions
- Fleet dispatch and broadcast
- Spectral balance computation
- Sub-agent spawning
- Exception handling

## License

MIT
