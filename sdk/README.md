# @superinstance/sdk

> **Conservation-law governance for AI agent fleets. Works with any framework.**

```bash
npm install @superinstance/sdk
```

```typescript
import { Fleet } from '@superinstance/sdk';

const fleet = new Fleet({ name: 'my-team' });
const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

const result = await agent.execute('build a REST API');
console.log(fleet.status());
// → ✅ healthy, γ=0.28, η=0.15, δ=1.15
```

## Why?

Multi-agent AI works, but it's wasteful. Agents over-coordinate, duplicate work, burn tokens. **SuperInstance enforces a proven conservation law** — γ + η ≤ C — that mathematically bounds waste and optimizes throughput.

**The result:** Same task, same agents — 2.6x fewer tokens, 4x faster, zero conflicts.

## The Conservation Law

```
γ + η ≤ C    where C = log₂(3) ≈ 1.585 bits
```

- **γ (gamma)** = coordination cost (coupling, communication overhead)
- **η (eta)** = value produced (decisions, artifacts, computation)
- **C** = fleet capacity, bounded by the ternary alphabet

This is the Shannon chain rule of information theory. Not a metaphor.

**Scaling law:** δ(n) = (1/√n)(1 − 3/(2n)). At 10 agents, 66% of coordination cancels. At 10,000, 99% cancels. Bigger fleets are proportionally cheaper.

## 5-Minute Quickstart

```bash
npm install @superinstance/sdk
```

### Standalone Fleet

```typescript
import { Fleet } from '@superinstance/sdk';

const fleet = new Fleet({ name: 'my-team' });

// Spawn governed agents
const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
const researcher = fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });

// Execute tasks — conservation is automatically enforced
const result = await builder.execute('implement rate limiter');
console.log(result.conservationCheck);
// → { valid: true, delta: 1.15, status: 'healthy' }

// Check fleet health
const status = fleet.status();
console.log(status.conservation);
// → { gamma: 0.28, eta: 0.15, C: 1.585, delta: 1.15, status: 'healthy' }

// Governor automatically decides what to do next
const decision = fleet.getDecision();
// → { action: 'release', reason: 'δ=1.15, plenty of headroom' }
```

### Wrap an Existing Agent (OpenAI, LangGraph, CrewAI)

```typescript
import { Fleet, wrapOpenAI } from '@superinstance/sdk';

const fleet = new Fleet({ name: 'production' });

// Wrap any agent that has { name, execute(task) → string }
const wrapped = wrapOpenAI(
  { name: 'gpt-agent', execute: async (t) => await openaiAgent.run(t) },
  fleet,
  'builder'
);

// Now it's governed
const result = await wrapped.execute('build feature X');
// → Automatically checks conservation before executing
// → Reports γ/η after executing
// → Refuses if conservation would be violated
```

### Modular Agent Requests

Agents can dynamically access fleet capabilities:

```typescript
const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

// Search the fleet knowledge base
const patterns = await agent.request('search', { query: 'rate limiter', topK: 3 });

// Check budget remaining
const budget = await agent.request('budget');

// Validate ternary signals
const valid = await agent.request('validate', { signals: [1, -1, 0, 1] });

// Delegate to another agent role
const research = await agent.delegate('researcher', 'find circuit breaker patterns');
```

## API Reference

### `Fleet`

```typescript
class Fleet {
  constructor(options: { name: string; governor?: Partial<GovernorConfig> })
  spawn(config: AgentConfig): Agent
  status(): FleetStatus
  getDecision(): GovernorDecision
  async execute(task: Task): Promise<TaskResult>
  registerCapability(capability: Capability, handler: Function): void
}
```

### `Agent`

```typescript
class Agent {
  get id(): string
  get name(): string
  get role(): AgentRole
  get state(): AgentState
  getBudget(): number
  async execute(task: string): Promise<TaskResult>
  async request(capability: Capability, params?: object): Promise<CapabilityResponse>
  async delegate(toRole: AgentRole, task: string, budget?: number): Promise<DelegationResult>
}
```

### `Governor`

```typescript
class Governor {
  constructor(config?: Partial<GovernorConfig>)
  observe(state: { gamma: number; eta: number; agentCount: number }): ConservationState
  decide(state: { gamma: number; eta: number; agentCount: number }): GovernorDecision
  getConvergence(n: number): number  // δ(n)
  getC(): number                      // log₂(3)
}
```

### Framework Wrappers

```typescript
wrapOpenAI(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent
wrapLangGraph(graph: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent
wrapCrewAI(crew: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent
wrapGeneric(agent: WrappableAgent, fleet: Fleet, role: AgentRole): WrappedAgent
```

## CLI

```bash
npx @superinstance/sdk init     # Create .superinstance config
npx @superinstance/sdk status   # Fleet status
npx @superinstance/sdk check 0.8 0.5  # Conservation check
```

## Related Packages

| Package | Description |
|---------|-------------|
| [`@superinstance/sdk`](https://npmjs.com/package/@superinstance/sdk) | This package — Fleet, Agent, Governor |
| [`superinstance-mcp`](https://npmjs.com/package/superinstance-mcp) | MCP server — 8 fleet tools for AI assistants |
| [conservation-action](https://github.com/SuperInstance/conservation-action) | GitHub Action for CI/CD conservation gates |

## Conservation Law Primer

The fleet uses **balanced ternary** signals {-1, 0, +1}. The information content of one ternary digit is:

```
C = log₂(3) = log(3)/log(2) ≈ 1.585 bits
```

This is **provably optimal** — ternary has 99.54% radix economy, the closest integer base to *e* ≈ 2.718.

The conservation law is the Shannon chain rule:

```
H(X) = I(X;G) + H(X|G)
```

Where H(X) = C (total entropy), I(X;G) = η (mutual information with goal = value), H(X|G) = γ (conditional entropy = coordination cost).

Full proof: [conservation-entropy-theorem.md](https://github.com/SuperInstance/superinstance-website/blob/main/papers/conservation-entropy-theorem.md) (860 lines)

## License

MIT © SuperInstance

---

*γ + η ≤ C — build within the law.*
