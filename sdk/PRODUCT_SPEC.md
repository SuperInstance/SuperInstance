# SuperInstance SDK — Product Specification

**Version:** 0.1.0  
**Status:** Active development  
**Tagline:** *Conservation-law governance for AI agent fleets — works with any framework.*

---

## Vision

Every multi-agent framework answers "how do agents talk to each other?" None answer "how do you know when your fleet is doing too much?" SuperInstance SDK is the first governance layer that enforces a proven conservation law — γ + η ≤ C — on any AI agent fleet. It's zero-dependency, framework-agnostic, and drops into existing code in five minutes. You get a health metric (δ), automatic throttling (PID governor), and budget enforcement that's grounded in Shannon's information theory — not vibes.

---

## The 5-Minute Developer Journey

### Minute 0–1: Install
```bash
npm install superinstance
```
Zero runtime dependencies. No peer deps. No native modules. Just TypeScript.

### Minute 1–2: Create a Fleet
```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'my-fleet' });
```
The fleet boots with a conservation capacity of C = log₂(3) ≈ 1.585 bits. The PID governor initializes targeting γ/C = 0.5 (balanced).

### Minute 2–3: Spawn Agents
```typescript
const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
const researcher = fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });
```
Each agent gets a γ budget. The fleet tracks cumulative γ and η across all agents.

### Minute 3–4: Execute Governed Tasks
```typescript
const result = await builder.execute('Build a REST endpoint for /users');
// → { success: true, gammaUsed: 0.12, etaProduced: 0.18, conservationCheck: {...} }
```
Before execution, the governor checks if the fleet has conservation headroom. After execution, γ/η are recorded. If γ + η would exceed C, the task is rejected.

### Minute 4–5: Check Health
```typescript
const status = fleet.status();
console.log(status.conservation);
// → { gamma: 0.42, eta: 0.38, C: 1.585, delta: 0.785, status: 'healthy' }
```
One number tells you fleet health: δ = C − (γ + η). Positive = healthy. Negative = over budget.

### Bonus: Wrap Existing Agents
```typescript
import { wrapOpenAI } from 'superinstance';

const governed = wrapOpenAI(myOpenAIAgent, fleet, 'builder');
const result = await governed.execute('Summarize this repo');
// Conservation governance applied automatically
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Your Application                        │
│                                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│   │ Custom Agent │  │ OpenAI Agent │  │ LangGraph DAG │  │
│   └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│          │                 │                  │           │
│          │     ┌───────────┼──────────────────┘           │
│          │     │           │                              │
│          ▼     ▼           ▼                              │
│   ┌─────────────────────────────────┐                     │
│   │       Framework Wrappers         │                     │
│   │  wrapOpenAI · wrapLangGraph ·    │                     │
│   │  wrapCrewAI · wrapGeneric        │                     │
│   └──────────────┬──────────────────┘                     │
│                  │                                        │
│                  ▼                                        │
│   ┌─────────────────────────────────┐                     │
│   │          Fleet SDK               │                     │
│   │  spawn() · execute() · status()  │                     │
│   │  Tracks γ, η across all agents   │                     │
│   └──────────────┬──────────────────┘                     │
│                  │                                        │
│                  ▼                                        │
│   ┌─────────────────────────────────┐                     │
│   │          Governor                │                     │
│   │  PID controller: γ → C/2         │                     │
│   │  decide() → throttle/release     │                     │
│   │  Enforces γ + η ≤ C              │                     │
│   └─────────────────────────────────┘                     │
│                  │                                        │
└──────────────────┼────────────────────────────────────────┘
                   │ (optional)
                   ▼
          ┌─────────────────┐
          │   MCP Server     │  ← superinstance-mcp
          │   (external)     │
          └─────────────────┘
```

### Component Responsibilities

| Component | Role |
|-----------|------|
| **Fleet SDK** | User-facing API. Manages agents, tracks conservation, delegates to Governor |
| **Governor** | PID controller. Observes γ/η state, returns throttle/release decisions |
| **Wrappers** | Adapt existing framework agents (OpenAI, LangGraph, CrewAI) to governance |
| **MCP Server** | Optional. Exposes fleet as MCP tools for Claude Code, Cursor, etc. |
| **CLI** | `npx superinstance init/status/check` for quick operations |

---

## SDK API Surface

### Core Classes

#### `Fleet`
```typescript
class Fleet {
  constructor(options: { name: string; governor?: Partial<GovernorConfig> });
  spawn(config: AgentConfig): Agent;
  status(): FleetStatus;
  async execute(task: Task): Promise<TaskResult>;
  getDecision(): GovernorDecision;
  registerExisting(agent: WrappableAgent, role: AgentRole): WrappedAgent;
  readonly governor: Governor;
}
```

#### `Agent`
```typescript
class Agent {
  constructor(fleet: Fleet, config: AgentConfig);
  async execute(task: string): Promise<TaskResult>;
  getState(): AgentState;
  getBudget(): number;
}
```

#### `Governor`
```typescript
class Governor {
  constructor(config?: Partial<GovernorConfig>);
  observe(state: { gamma: number; eta: number; agentCount: number }): ConservationState;
  decide(state: { gamma: number; eta: number; agentCount: number }): GovernorDecision;
  getConvergence(n: number): number;
  getC(): number;
}
```

### Framework Wrappers
```typescript
function wrapOpenAI(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
function wrapLangGraph(graph: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
function wrapCrewAI(crew: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
function wrapGeneric(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent;
```

### Constants
```typescript
const C: number;              // log₂(3) ≈ 1.585
const CONSERVATION_LAW: string; // 'γ + η ≤ C where C = log₂(3) ≈ 1.585'
```

### Conceptual Python Equivalent
```python
from superinstance import Fleet, Governor, wrap_openai

fleet = Fleet(name="my-fleet")
agent = fleet.spawn(role="builder", gamma_budget=0.3)
result = agent.execute("Build a REST endpoint")
status = fleet.status()
# → ConservationState(gamma=0.12, eta=0.18, C=1.585, delta=1.285, status='healthy')
```

---

## Modular Agent Requests

Agents can request capabilities from the fleet rather than hard-coding them:

```typescript
const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

// Request: search the fleet knowledge base
agent.request('search', { query: 'rate limiter patterns' });

// Request: additional γ budget
agent.request('budget', { delta: 0.05 });

// Request: validation check
agent.request('validate', { gamma: 0.15, eta: 0.10 });
```

The fleet governor evaluates each request against conservation headroom. If δ < requested budget, the request is denied with a reason.

---

## File Manifest

```
superinstance/
├── PRODUCT_SPEC.md          # This file — product specification
├── README.md                # Pitch + full documentation
├── package.json             # Zero-dependency npm package
├── tsconfig.json            # TypeScript ES2022 strict config
├── src/
│   ├── index.ts             # Main entry — re-exports public API
│   ├── types.ts             # Core type definitions
│   ├── governor.ts          # Conservation PID Governor
│   ├── sdk.ts               # Fleet + Agent classes (main user API)
│   ├── wrapper.ts           # Framework wrappers (OpenAI, LangGraph, CrewAI)
│   └── cli.ts               # CLI entry (init, status, check)
├── test/
│   └── governor.test.ts     # Node.js native test runner suite
└── examples/
    ├── openai-agent.ts      # Wrapping an OpenAI Agents SDK agent
    └── custom-agent.ts      # Standalone conservation-governed fleet
```

---

*γ + η ≤ C — build within the law.*
