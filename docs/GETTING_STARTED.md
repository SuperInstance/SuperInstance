# Getting Started with SuperInstance

> **Time to first agent: 2 minutes.**  
> Conservation-governed multi-agent SDK for LLM applications.

The SuperInstance SDK enforces a fundamental physics-inspired conservation law across AI agent fleets, ensuring that complexity never outruns the budget allocated to it.

---

## Table of Contents

1. [Install (2 min)](#1-install)
2. [First Agent (5 min)](#2-first-agent)
3. [Multi-Agent Fleet (10 min)](#3-multi-agent-fleet)
4. [Wrapping Existing Agents (10 min)](#4-wrapping-existing-agents)
5. [Modular Capabilities (5 min)](#5-modular-capabilities)
6. [MCP Integration (5 min)](#6-mcp-integration)
7. [Harbor Bridge (5 min)](#7-harbor-bridge)
8. [Telemetry (5 min)](#8-telemetry)

---

## 1. Install

```bash
npm install superinstance
```

Verify the installation:

```typescript
import { Fleet, C } from 'superinstance';

console.log(`Conservation constant C = ${C}`); // 1.584962500721156
```

### Requirements

- Node.js 18+ (or any modern runtime: Bun, Deno, Cloudflare Workers)
- TypeScript recommended (the SDK ships full type definitions)
- An LLM provider if you're wrapping one (OpenAI, LangGraph, CrewAI, or your own)

### Quick install with all peer deps

```bash
npm install superinstance openai
# or
npm install superinstance @langchain/langgraph
```

---

## 2. First Agent

Spawn a single agent from a fleet and execute a task. Every agent operates within the fleet's conservation budget.

```typescript
import { Fleet } from 'superinstance';

// 1. Create a fleet — the top-level container
const fleet = new Fleet({ name: 'my-first-fleet' });

// 2. Spawn an agent with a role and a gamma budget
const agent = fleet.spawn({
  role: 'writer',
  gammaBudget: 0.5,
});

// 3. Execute a task
const result = await agent.execute({
  prompt: 'Write a haiku about distributed systems.',
});

console.log(result.output);
console.log(`Conservation check: ${result.conservationCheck.passed}`);
```

### What just happened?

- The **Fleet** manages the global conservation invariant: γ + η ≤ C
- **γ (gamma)** = total allocated agent budget; **η (eta)** = observed fleet entropy
- **C** = log₂(3) ≈ 1.585 — the maximum information complexity
- The agent's `execute()` returns a `TaskResult` that includes a conservation check

```typescript
// Check fleet status at any time
const status = fleet.status();
console.log(status);
// {
//   name: 'my-first-fleet',
//   conservation: { gamma: 0.5, eta: 0.02, C: 1.585, satisfied: true },
//   agents: 1,
//   convergenceDelta: 0.0203,
// }
```

---

## 3. Multi-Agent Fleet

Real power comes from multiple agents with specialized roles that can delegate to each other.

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'research-fleet' });

// Spawn specialized agents
const researcher = fleet.spawn({ role: 'researcher', gammaBudget: 0.6 });
const writer = fleet.spawn({ role: 'writer', gammaBudget: 0.4 });
const reviewer = fleet.spawn({ role: 'reviewer', gammaBudget: 0.3 });

// Researcher delegates writing to the writer
const researchResult = await researcher.execute({
  prompt: 'Find key facts about quantum computing.',
});

// Researcher delegates to writer with explicit budget
const delegation = await researcher.delegate(
  'writer',
  { prompt: `Write a summary based on: ${researchResult.output}` },
  0.15 // budget transferred for this delegation
);

console.log(delegation.result.output);

// Reviewer validates the output
const review = await reviewer.execute({
  prompt: `Review this for accuracy:\n\n${delegation.result.output}`,
});

console.log(review.output);
console.log(`Fleet conservation satisfied: ${fleet.status().conservation.satisfied}`);
```

### Understanding budgets

Every agent has a **gammaBudget** — its share of the fleet's total γ. When an agent delegates, it can transfer part of its budget. The Governor (see next sections) monitors whether the total γ + η stays within C.

```typescript
// Check individual agent budget
console.log(`Writer budget: ${writer.getBudget()}`);    // 0.4 (minus delegations)
console.log(`Writer state:`, writer.getState());        // full AgentState object
```

### Governor decisions

The fleet's Governor makes automatic decisions about the fleet:

```typescript
const decision = fleet.getDecision();
console.log(decision);
// { action: 'hold', reason: 'conservation stable', gamma: 0.9, eta: 0.3 }

// Possible actions:
// - 'release': fleet is healthy, allow new spawns
// - 'throttle': approaching C limit, reduce activity
// - 'spawn': capacity available for new agents
// - 'merge': too many small agents, consolidate
// - 'hold': maintain current state
```

---

## 4. Wrapping Existing Agents

You don't need to rewrite your agents. Use the wrappers to bring existing LLM applications under conservation governance.

### OpenAI

```typescript
import { Fleet, wrapOpenAI } from 'superinstance';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const fleet = new Fleet({ name: 'openai-fleet' });

// Wrap an OpenAI client — it now respects conservation law
const { agent, client } = wrapOpenAI(openai, fleet, {
  role: 'assistant',
  gammaBudget: 0.5,
  model: 'gpt-4o',
});

const response = await client.chat.completions.create({
  messages: [{ role: 'user', content: 'Explain CAP theorem.' }],
});

console.log(response.choices[0].message.content);
// Every call is automatically conservation-checked
```

### LangGraph

```typescript
import { Fleet, wrapLangGraph } from 'superinstance';

const fleet = new Fleet({ name: 'langgraph-fleet' });

const { agent, graphRunner } = wrapLangGraph(myLangGraphApp, fleet, {
  role: 'analyst',
  gammaBudget: 0.4,
});

// Use the wrapped runner exactly as before
const result = await graphRunner.invoke({ input: 'Analyze market trends.' });
```

### CrewAI

```typescript
import { Fleet, wrapCrewAI } from 'superinstance';

const fleet = new Fleet({ name: 'crewai-fleet' });

const { agent, crewRunner } = wrapCrewAI(myCrew, fleet, {
  role: 'specialist',
  gammaBudget: 0.35,
});

const result = await crewRunner.kickoff({ topic: 'Q3 strategy' });
```

### Register existing agents manually

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'mixed-fleet' });

// Register an agent you already have running
const wrappedAgent = fleet.registerExisting(myExternalAgent, 'translator');

// Now it participates in conservation governance
const result = await wrappedAgent.execute({ prompt: 'Translate: Hello' });
```

---

## 5. Modular Capabilities

Agents can request capabilities dynamically. The fleet routes capability requests to registered handlers.

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'capable-fleet' });
const agent = fleet.spawn({ role: 'worker', gammaBudget: 0.5 });

// Built-in capabilities work out of the box
const status = await agent.request('status');
console.log(status); // { role: 'worker', budget: 0.5, ... }

// Register a custom capability handler
fleet.registerCapability('translate', async (params) => {
  const { text, targetLang } = params;
  // Call your translation service here
  return { translated: `[${targetLang}] ${text}` };
});

// Agent requests the capability
const result = await agent.request('translate', {
  text: 'Hello, world',
  targetLang: 'ja',
});

console.log(result); // { translated: '[ja] Hello, world' }
```

### Built-in capabilities

| Capability   | Description                                  |
|-------------|----------------------------------------------|
| `search`    | Semantic search across the fleet's knowledge |
| `budget`    | Query agent's remaining budget               |
| `validate`  | Validate a result against conservation law   |
| `conserve`  | Trigger conservation enforcement             |
| `status`    | Get agent/fleet status                       |
| `report`    | Generate a telemetry report                  |
| `delegate`  | Delegate a task to another agent             |

```typescript
// Budget check
const budget = await agent.request('budget');
console.log(`Remaining: ${budget.remaining}`);

// Validation
const validation = await agent.request('validate', { output: someResult });
console.log(`Valid: ${validation.passed}, gamma: ${validation.gamma}`);
```

---

## 6. MCP Integration

SuperInstance integrates with the Model Context Protocol for tool sharing across agents.

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'mcp-fleet' });
const agent = fleet.spawn({ role: 'tool-user', gammaBudget: 0.4 });

// MCP tools are exposed as capabilities automatically
// when an MCP server is connected to the fleet
fleet.registerCapability('mcp:filesystem', async (params) => {
  // Your MCP tool handler
  const { path, action } = params;
  return { content: `Read ${path}` };
});

// Agent uses MCP tools through the standard capability interface
const fileContent = await agent.request('mcp:filesystem', {
  path: '/data/report.json',
  action: 'read',
});

console.log(fileContent.content);
```

### Using MCP with wrapped agents

```typescript
import { Fleet, wrapOpenAI } from 'superinstance';
import OpenAI from 'openai';

const fleet = new Fleet({ name: 'mcp-openai-fleet' });
const { client } = wrapOpenAI(new OpenAI(), fleet, {
  role: 'assistant',
  gammaBudget: 0.5,
});

// The wrapped client automatically routes tool calls through
// the fleet's capability system, respecting conservation budgets
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Search for recent papers on RAG.' }],
  tools: [{ type: 'function', function: { name: 'search', ... } }],
});
```

---

## 7. Harbor Bridge

Harbor Bridge connects multiple fleets, enabling cross-fleet delegation and capability sharing while maintaining conservation invariants for each fleet independently.

```typescript
import { Fleet } from 'superinstance';

// Create two fleets with different specializations
const researchFleet = new Fleet({ name: 'research' });
const deployFleet = new Fleet({ name: 'deploy' });

// Spawn agents in each fleet
const researcher = researchFleet.spawn({ role: 'researcher', gammaBudget: 0.5 });
const deployer = deployFleet.spawn({ role: 'deployer', gammaBudget: 0.4 });

// Bridge the fleets — enables cross-fleet delegation
researchFleet.bridge(deployFleet);

// Researcher can now delegate to the deploy fleet's agents
const result = await researcher.delegate('deployer', {
  prompt: 'Deploy the research findings to production.',
});

console.log(result.result.output);

// Each fleet maintains its own conservation invariant
console.log('Research fleet:', researchFleet.status().conservation);
console.log('Deploy fleet:', deployFleet.status().conservation);
```

### Harbor Bridge with custom routing

```typescript
// Bridge with a capability router for selective forwarding
import { Fleet, CapabilityRouter } from 'superinstance';

const router = new CapabilityRouter({
  translate: 'language-fleet',
  deploy: 'infra-fleet',
  search: 'knowledge-fleet',
});

const mainFleet = new Fleet({ name: 'main' });
mainFleet.bridge(languageFleet, { router });
mainFleet.bridge(infraFleet, { router });

// Agent requests are routed to the right fleet
const agent = mainFleet.spawn({ role: 'coordinator', gammaBudget: 0.5 });
const translation = await agent.request('translate', { text: 'Hello' });
```

---

## 8. Telemetry

Monitor your fleet in real time with built-in telemetry reporting and dashboards.

### Fleet Dashboard

```typescript
import { Fleet, FleetDashboard } from 'superinstance';

const fleet = new Fleet({ name: 'monitored-fleet' });
fleet.spawn({ role: 'worker-a', gammaBudget: 0.4 });
fleet.spawn({ role: 'worker-b', gammaBudget: 0.3 });

// Start the live dashboard
const dashboard = new FleetDashboard(fleet, { refreshMs: 1000 });
dashboard.start();

// ... agents do work ...

// Stop when done
dashboard.stop();
```

### Telemetry Reporter + Receiver

```typescript
import { Fleet, TelemetryReporter, TelemetryReceiver } from 'superinstance';

// Receiver side — collects snapshots
const receiver = new TelemetryReceiver();

// Reporter side — attaches to a fleet and sends data
const fleet = new Fleet({ name: 'telemetry-demo' });
fleet.spawn({ role: 'agent-1', gammaBudget: 0.5 });

const reporter = new TelemetryReporter({
  endpoint: 'https://telemetry.example.com/ingest',
  intervalMs: 5000,
  fleetName: 'telemetry-demo',
});

reporter.attach(fleet);

// Set up alerting
reporter.onAlert((alert) => {
  console.warn(`⚠️ ${alert.type}: ${alert.message}`);
  // { type: 'conservation-violation', message: 'γ + η exceeded C', gamma: 1.3, eta: 0.4 }
});

// On the receiver side, ingest and aggregate
const snapshot = fleet.status();
receiver.ingest(snapshot);

const aggregate = receiver.getAggregate();
console.log(aggregate);
// { totalAgents: 1, avgGamma: 0.5, violations: 0, uptime: 42 }

// Clean up
reporter.detach();
```

### What telemetry is captured

| Metric              | Description                                    |
|---------------------|------------------------------------------------|
| `gamma`             | Total budget utilization                        |
| `eta`               | Fleet entropy (complexity measure)              |
| `convergenceDelta`  | δ(n) — how close to theoretical convergence     |
| `agentCount`        | Number of active agents                         |
| `violations`        | Conservation law violations over time            |
| `delegations`       | Cross-agent delegation events                    |

---

## Next Steps

- **[API Reference](./API_REFERENCE.md)** — Every class, method, and type
- **[Recipes](./RECIPES.md)** — Practical solutions for common patterns
- **[Full Fleet Demo](../examples/full-fleet-demo.ts)** — Complete working example

---

## Getting Help

- **GitHub Issues:** [github.com/superinstance/sdk/issues](https://github.com/superinstance/sdk/issues)
- **Conservation Law:** γ + η ≤ C, where C = log₂(3) ≈ 1.585

*Conservation is not a constraint — it's a guarantee.*
