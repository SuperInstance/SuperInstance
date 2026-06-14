# SuperInstance SDK — API Reference

> Complete reference for every class, method, type, and constant.

---

## Table of Contents

- [Constants](#constants)
- [Fleet](#fleet)
- [Agent](#agent)
- [Governor](#governor)
- [FleetDashboard](#fleetdashboard)
- [TelemetryReporter](#telemetryreporter)
- [TelemetryReceiver](#telemetryreceiver)
- [Wrappers](#wrappers)
- [CapabilityRouter](#capabilityrouter)
- [Types](#types)

---

## Constants

### `C`

The conservation constant. Maximum information complexity of a fleet.

```typescript
import { C } from 'superinstance';
```

| Property | Value |
|----------|-------|
| Type | `number` |
| Value | `log₂(3) ≈ 1.584962500721156` |
| Readonly | Yes |

The conservation law states: **γ + η ≤ C**, where γ is the total agent budget and η is fleet entropy.

```typescript
console.log(C); // 1.584962500721156
```

### Convergence Delta: δ(n)

The convergence function is defined as:

```
δ(n) = (1 / √n) × (1 − 3 / (2n))
```

Where `n` is the number of agents. As `n → ∞`, δ(n) → 0, meaning larger fleets converge toward the theoretical conservation limit.

---

## Fleet

The top-level container for a governed collection of agents.

### Constructor

```typescript
new Fleet(options: { name: string; governor?: Governor })
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Fleet identifier |
| `governor` | `Governor` | No | Custom governor. A default Governor is created if omitted. |

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'production' });
```

---

### `fleet.spawn(options)`

Creates a new agent within the fleet.

```typescript
fleet.spawn(options: {
  name?: string;
  role: string;
  gammaBudget: number;
}): Agent
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | No | Agent name (defaults to auto-generated) |
| `role` | `string` | Yes | Agent role identifier (e.g. `"researcher"`) |
| `gammaBudget` | `number` | Yes | Budget allocation. Must satisfy γ + η ≤ C. |

**Returns:** `Agent`

**Conservation:** The fleet's Governor verifies that adding this agent's γ won't violate the conservation law. If it would, an error is thrown.

```typescript
const agent = fleet.spawn({ role: 'analyst', gammaBudget: 0.5 });
```

---

### `fleet.status()`

Returns the current fleet status including conservation metrics.

```typescript
fleet.status(): FleetStatus
```

**Returns:** `FleetStatus`

```typescript
const status = fleet.status();
// {
//   name: 'production',
//   conservation: { gamma: 0.9, eta: 0.3, C: 1.585, satisfied: true },
//   agents: 3,
//   convergenceDelta: 0.0203,
// }
```

---

### `fleet.getDecision()`

Returns the Governor's current decision about what the fleet should do.

```typescript
fleet.getDecision(): GovernorDecision
```

**Returns:** `GovernorDecision`

```typescript
const decision = fleet.getDecision();
// { action: 'release', reason: 'conservation stable', gamma: 0.9, eta: 0.3 }
```

Possible `action` values:

| Action | Meaning |
|--------|---------|
| `release` | Fleet is healthy; allow spawns and delegations |
| `throttle` | Approaching C limit; reduce activity |
| `spawn` | Capacity available for new agents |
| `merge` | Too many small agents; consolidate |
| `hold` | Maintain current state |

---

### `fleet.registerCapability(capability, handler)`

Registers a custom capability handler on the fleet.

```typescript
fleet.registerCapability(
  capability: string,
  handler: (params: Record<string, any>) => Promise<CapabilityResponse>
): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capability` | `string` | Yes | Capability name (e.g. `"search"`, `"translate"`) |
| `handler` | `(params) => Promise<CapabilityResponse>` | Yes | Async handler for this capability |

```typescript
fleet.registerCapability('summarize', async (params) => {
  return { summary: params.text.slice(0, 100) };
});
```

**Note:** Built-in capabilities (`search`, `budget`, `validate`, etc.) can be overridden by registering a handler with the same name.

---

### `fleet.registerExisting(agent, role)`

Wraps an external agent and registers it in the fleet.

```typescript
fleet.registerExisting(
  agent: ExternalAgent,
  role: string
): Agent
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agent` | `ExternalAgent` | Yes | Any object implementing the agent interface |
| `role` | `string` | Yes | Role for the wrapped agent |

**Returns:** `Agent` — A SuperInstance agent wrapping the external one.

```typescript
const wrapped = fleet.registerExisting(myOpenAIAgent, 'assistant');
await wrapped.execute({ prompt: 'Hello' });
```

---

### `fleet.bridge(otherFleet, options?)`

Connects this fleet to another fleet for cross-fleet delegation.

```typescript
fleet.bridge(
  otherFleet: Fleet,
  options?: { router?: CapabilityRouter }
): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `otherFleet` | `Fleet` | Yes | The fleet to bridge to |
| `router` | `CapabilityRouter` | No | Custom capability routing for bridged fleets |

```typescript
researchFleet.bridge(deployFleet);
```

---

## Agent

An individual agent within a fleet, executing tasks and managing budget.

### `agent.execute(task)`

Executes a task and returns the result with a conservation check.

```typescript
agent.execute(task: { prompt: string; context?: Record<string, any> }): Promise<TaskResult>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `task.prompt` | `string` | Yes | The task prompt |
| `task.context` | `Record<string, any>` | No | Additional context data |

**Returns:** `Promise<TaskResult>`

```typescript
const result = await agent.execute({
  prompt: 'Summarize this article.',
  context: { article: '...' },
});
console.log(result.output);
console.log(result.conservationCheck); // { passed: true, gamma: 0.48, eta: 0.02 }
```

**Conservation:** Each `execute` call consumes a small amount of γ. If the agent's budget is exhausted, a conservation violation is reported.

---

### `agent.request(capability, params?)`

Requests a capability through the fleet's routing system.

```typescript
agent.request(
  capability: string,
  params?: Record<string, any>
): Promise<CapabilityResponse>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `capability` | `string` | Yes | Capability name |
| `params` | `Record<string, any>` | No | Parameters for the capability |

**Returns:** `Promise<CapabilityResponse>`

```typescript
const result = await agent.request('search', { query: 'quantum computing', topK: 5 });
```

---

### `agent.delegate(toRole, task, budget?)`

Delegates a task to another agent in the fleet by role.

```typescript
agent.delegate(
  toRole: string,
  task: { prompt: string; context?: Record<string, any> },
  budget?: number
): Promise<DelegationResult>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `toRole` | `string` | Yes | Role of the target agent |
| `task` | `{ prompt, context? }` | Yes | Task to delegate |
| `budget` | `number` | No | Budget to transfer for this delegation |

**Returns:** `Promise<DelegationResult>`

```typescript
const result = await agent.delegate('writer', { prompt: 'Write a report.' }, 0.1);
console.log(result.result.output);
console.log(`Budget used: ${result.budgetUsed}`);
```

**Conservation:** If `budget` is provided, it's transferred from the delegating agent to the target. If omitted, the target agent uses its own budget.

---

### `agent.getBudget()`

Returns the agent's remaining gamma budget.

```typescript
agent.getBudget(): number
```

**Returns:** `number`

```typescript
const remaining = agent.getBudget(); // 0.42
```

---

### `agent.getState()`

Returns the full agent state.

```typescript
agent.getState(): AgentState
```

**Returns:** `AgentState`

```typescript
const state = agent.getState();
// {
//   role: 'researcher',
//   gammaBudget: 0.5,
//   remainingBudget: 0.42,
//   tasksCompleted: 3,
//   delegations: 1,
//   status: 'active',
// }
```

---

## Governor

Monitors fleet conservation and makes decisions about scaling.

### Constructor

```typescript
new Governor(config?: {
  maxGamma?: number;
  maxEta?: number;
  throttleThreshold?: number;
  mergeThreshold?: number;
})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `maxGamma` | `number` | `C` | Maximum total γ |
| `maxEta` | `number` | `C` | Maximum η before violation |
| `throttleThreshold` | `number` | `0.85` | Fraction of C that triggers throttle |
| `mergeThreshold` | `number` | `0.5` | Fraction of C below which merge is suggested |

```typescript
import { Governor } from 'superinstance';

const governor = new Governor({
  throttleThreshold: 0.9,
  mergeThreshold: 0.4,
});

const fleet = new Fleet({ name: 'governed', governor });
```

---

### `governor.observe(snapshot)`

Observes the fleet's current state and returns a conservation assessment.

```typescript
governor.observe(snapshot: {
  gamma: number;
  eta: number;
  agentCount: number;
}): ConservationState
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `gamma` | `number` | Yes | Total fleet γ |
| `eta` | `number` | Yes | Fleet entropy |
| `agentCount` | `number` | Yes | Number of active agents |

**Returns:** `ConservationState`

```typescript
const state = governor.observe({ gamma: 0.9, eta: 0.3, agentCount: 3 });
// {
//   satisfied: true,
//   gamma: 0.9,
//   eta: 0.3,
//   total: 1.2,
//   C: 1.585,
//   headroom: 0.385,
//   delta: 0.0203,
// }
```

---

### `governor.decide()`

Returns a decision about what the fleet should do.

```typescript
governor.decide(): GovernorDecision
```

**Returns:** `GovernorDecision`

```typescript
const decision = governor.decide();
// { action: 'release', reason: 'conservation stable', gamma: 0.9, eta: 0.3 }
```

---

## FleetDashboard

Real-time terminal/HTML dashboard for fleet monitoring.

### Constructor

```typescript
new FleetDashboard(fleet: Fleet, options?: { refreshMs?: number })
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `fleet` | `Fleet` | — | The fleet to monitor |
| `refreshMs` | `number` | `2000` | Refresh interval in milliseconds |

```typescript
const dashboard = new FleetDashboard(fleet, { refreshMs: 1000 });
```

---

### `dashboard.start()`

Starts the dashboard display.

```typescript
dashboard.start(): void
```

### `dashboard.stop()`

Stops the dashboard display.

```typescript
dashboard.stop(): void
```

```typescript
dashboard.start();
// ... do work ...
dashboard.stop();
```

---

## TelemetryReporter

Reports fleet telemetry to a remote endpoint at regular intervals.

### Constructor

```typescript
new TelemetryReporter(options: {
  endpoint: string;
  intervalMs: number;
  fleetName: string;
})
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint` | `string` | Yes | HTTP endpoint for telemetry data |
| `intervalMs` | `number` | Yes | Reporting interval in milliseconds |
| `fleetName` | `string` | Yes | Fleet name for identification |

```typescript
const reporter = new TelemetryReporter({
  endpoint: 'https://telemetry.example.com/ingest',
  intervalMs: 5000,
  fleetName: 'production',
});
```

---

### `reporter.attach(fleet)`

Attaches the reporter to a fleet to begin monitoring.

```typescript
reporter.attach(fleet: Fleet): void
```

### `reporter.detach()`

Detaches from the current fleet.

```typescript
reporter.detach(): void
```

### `reporter.onAlert(callback)`

Registers a callback for conservation alerts.

```typescript
reporter.onAlert(callback: (alert: TelemetryAlert) => void): void
```

```typescript
reporter.attach(fleet);

reporter.onAlert((alert) => {
  console.warn(`[${alert.type}] ${alert.message}`);
});
```

---

## TelemetryReceiver

Collects and aggregates telemetry snapshots.

### Constructor

```typescript
new TelemetryReceiver()
```

---

### `receiver.ingest(snapshot)`

Ingests a fleet status snapshot.

```typescript
receiver.ingest(snapshot: FleetStatus): void
```

```typescript
receiver.ingest(fleet.status());
```

---

### `receiver.getAggregate()`

Returns aggregated telemetry statistics.

```typescript
receiver.getAggregate(): TelemetryAggregate
```

**Returns:** `TelemetryAggregate`

```typescript
const agg = receiver.getAggregate();
// {
//   totalAgents: 5,
//   avgGamma: 0.45,
//   violations: 0,
//   uptime: 3600,
//   snapshots: 120,
// }
```

---

## Wrappers

### `wrapOpenAI(client, fleet, options)`

Wraps an OpenAI client to enforce conservation governance.

```typescript
wrapOpenAI(
  client: OpenAI,
  fleet: Fleet,
  options: { role: string; gammaBudget: number; model?: string }
): { agent: Agent; client: WrappedOpenAIClient }
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `client` | `OpenAI` | Yes | OpenAI client instance |
| `fleet` | `Fleet` | Yes | Fleet to attach to |
| `options.role` | `string` | Yes | Agent role |
| `options.gammaBudget` | `number` | Yes | Budget allocation |
| `options.model` | `string` | No | Default model |

**Returns:** `{ agent: Agent; client: WrappedOpenAIClient }`

```typescript
const { agent, client } = wrapOpenAI(new OpenAI(), fleet, {
  role: 'assistant',
  gammaBudget: 0.5,
  model: 'gpt-4o',
});
```

---

### `wrapLangGraph(app, fleet, options)`

Wraps a LangGraph application.

```typescript
wrapLangGraph(
  app: LangGraphApp,
  fleet: Fleet,
  options: { role: string; gammaBudget: number }
): { agent: Agent; graphRunner: WrappedGraphRunner }
```

---

### `wrapCrewAI(crew, fleet, options)`

Wraps a CrewAI crew.

```typescript
wrapCrewAI(
  crew: CrewAICrew,
  fleet: Fleet,
  options: { role: string; gammaBudget: number }
): { agent: Agent; crewRunner: WrappedCrewRunner }
```

---

### `wrapGeneric(executeFn, fleet, options)`

Wraps any async function as a governed agent.

```typescript
wrapGeneric(
  executeFn: (task: Task) => Promise<any>,
  fleet: Fleet,
  options: { role: string; gammaBudget: number }
): Agent
```

```typescript
const agent = wrapGeneric(
  async (task) => myCustomLogic(task.prompt),
  fleet,
  { role: 'custom', gammaBudget: 0.3 }
);
```

---

## CapabilityRouter

Routes capability requests across bridged fleets.

### Constructor

```typescript
new CapabilityRouter(routing: Record<string, string>)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `routing` | `Record<string, string>` | Yes | Map of capability → fleet name |

```typescript
const router = new CapabilityRouter({
  search: 'knowledge-fleet',
  deploy: 'infra-fleet',
  translate: 'language-fleet',
});
```

---

## Types

### `FleetStatus`

```typescript
interface FleetStatus {
  name: string;
  conservation: {
    gamma: number;
    eta: number;
    C: number;
    satisfied: boolean;
  };
  agents: number;
  convergenceDelta: number;
}
```

### `TaskResult`

```typescript
interface TaskResult {
  output: string;
  conservationCheck: {
    passed: boolean;
    gamma: number;
    eta: number;
    remaining: number;
  };
  metadata?: Record<string, any>;
}
```

### `GovernorDecision`

```typescript
interface GovernorDecision {
  action: 'release' | 'throttle' | 'spawn' | 'merge' | 'hold';
  reason: string;
  gamma: number;
  eta: number;
}
```

### `ConservationState`

```typescript
interface ConservationState {
  satisfied: boolean;
  gamma: number;
  eta: number;
  total: number;
  C: number;
  headroom: number;
  delta: number;
}
```

### `AgentState`

```typescript
interface AgentState {
  role: string;
  gammaBudget: number;
  remainingBudget: number;
  tasksCompleted: number;
  delegations: number;
  status: 'active' | 'idle' | 'exhausted' | 'error';
}
```

### `DelegationResult`

```typescript
interface DelegationResult {
  result: TaskResult;
  budgetUsed: number;
  fromRole: string;
  toRole: string;
}
```

### `CapabilityResponse`

```typescript
interface CapabilityResponse {
  [key: string]: any;
}
```

### `TelemetryAlert`

```typescript
interface TelemetryAlert {
  type: 'conservation-violation' | 'budget-exhausted' | 'eta-spike' | 'agent-error';
  message: string;
  gamma?: number;
  eta?: number;
  agentRole?: string;
  timestamp: number;
}
```

### `TelemetryAggregate`

```typescript
interface TelemetryAggregate {
  totalAgents: number;
  avgGamma: number;
  violations: number;
  uptime: number;
  snapshots: number;
}
```

---

## Conservation Law Reference

### Core Invariant

```
γ + η ≤ C
```

| Symbol | Meaning | Formula |
|--------|---------|---------|
| **γ** (gamma) | Total agent budget | Σ of all agents' gammaBudget |
| **η** (eta) | Fleet entropy | Computed from agent interactions |
| **C** | Conservation constant | log₂(3) ≈ 1.585 |
| **δ(n)** | Convergence delta | (1/√n)(1 − 3/(2n)) |

As fleet size `n` increases, δ(n) → 0, meaning larger fleets converge toward the theoretical limit. The Governor uses δ(n) to decide when to merge or throttle.

---

*API Version: 1.0.0 · Conservation constant C = log₂(3) ≈ 1.585*
