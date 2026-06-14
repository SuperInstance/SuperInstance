# SuperInstance Recipes

> Practical solutions for common multi-agent patterns.

---

## Table of Contents

1. [Govern an OpenAI Agent](#1-govern-an-openai-agent)
2. [Govern a LangGraph Workflow](#2-govern-a-langgraph-workflow)
3. [Govern a CrewAI Crew](#3-govern-a-crewai-crew)
4. [Conservation Task Queue](#4-conservation-task-queue)
5. [Fleet Auto-Scaling with δ(n)](#5-fleet-auto-scaling-with-δn)
6. [Conservation CI/CD Pipeline](#6-conservation-cicd-pipeline)
7. [Connect Two Fleets via Harbor](#7-connect-two-fleets-via-harbor)
8. [Custom Capability Handler](#8-custom-capability-handler)
9. [Monitor with Telemetry](#9-monitor-with-telemetry)
10. [Handle Violations Gracefully](#10-handle-violations-gracefully)

---

## 1. Govern an OpenAI Agent

Wrap an OpenAI client so every API call respects conservation law.

```typescript
import OpenAI from 'openai';
import { Fleet, wrapOpenAI, C } from 'superinstance';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const fleet = new Fleet({ name: 'openai-governed' });

const { agent, client } = wrapOpenAI(openai, fleet, {
  role: 'assistant',
  gammaBudget: 0.6,
  model: 'gpt-4o',
});

// Every chat completion is now conservation-governed
const response = await client.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain distributed consensus.' },
  ],
});

console.log(response.choices[0].message.content);

// Check that conservation was maintained
const status = fleet.status();
console.log(`γ=${status.conservation.gamma} η=${status.conservation.eta} C=${C}`);
console.log(`Satisfied: ${status.conservation.satisfied}`);
```

---

## 2. Govern a LangGraph Workflow

Bring LangGraph state machines under conservation control.

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { Fleet, wrapLangGraph } from 'superinstance';

// Define your LangGraph workflow
const workflow = new StateGraph({
  channels: { input: null, output: null },
});

workflow.addNode('research', async (state) => {
  return { output: `Researched: ${state.input}` };
});

workflow.addNode('summarize', async (state) => {
  return { output: `Summary: ${state.output}` };
});

workflow.addEdge('research', 'summarize');
workflow.addEdge('summarize', END);
workflow.setEntryPoint('research');

const app = workflow.compile();

// Wrap under conservation governance
const fleet = new Fleet({ name: 'langgraph-governed' });

const { agent, graphRunner } = wrapLangGraph(app, fleet, {
  role: 'analyst',
  gammaBudget: 0.5,
});

const result = await graphRunner.invoke({ input: 'Market analysis Q3 2026' });
console.log(result.output);

// Governor monitors the workflow's complexity
const decision = fleet.getDecision();
console.log(`Governor says: ${decision.action} — ${decision.reason}`);
```

---

## 3. Govern a CrewAI Crew

```typescript
import { Fleet, wrapCrewAI } from 'superinstance';

// Assume you have a CrewAI crew defined
const crew = createMyCrew();

const fleet = new Fleet({ name: 'crewai-governed' });

const { agent, crewRunner } = wrapCrewAI(crew, fleet, {
  role: 'specialist',
  gammaBudget: 0.4,
});

const result = await crewRunner.kickoff({
  topic: 'Develop Q4 go-to-market strategy',
});

console.log(result.output);

// The crew's internal agents are all tracked
console.log(`Fleet agents: ${fleet.status().agents}`);
console.log(`Conservation: ${fleet.status().conservation.satisfied}`);
```

---

## 4. Conservation Task Queue

Process tasks while respecting the conservation invariant. The Governor gates new work.

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'task-queue' });
const worker = fleet.spawn({ role: 'worker', gammaBudget: 0.5 });

const tasks = [
  { prompt: 'Process order #1' },
  { prompt: 'Process order #2' },
  { prompt: 'Process order #3' },
  { prompt: 'Process order #4' },
  { prompt: 'Process order #5' },
];

for (const task of tasks) {
  const decision = fleet.getDecision();

  // Gate on governor decision
  if (decision.action === 'throttle') {
    console.log(`Throttling — waiting before next task (${decision.reason})`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  if (decision.action === 'hold') {
    console.log('Holding — conservation limit approaching');
    break;
  }

  const result = await worker.execute(task);
  console.log(`${task.prompt} → ${result.conservationCheck.passed ? '✅' : '❌'}`);

  // Check remaining budget
  if (worker.getBudget() < 0.05) {
    console.log('Budget low, spawning additional worker');
    fleet.spawn({ role: 'worker-2', gammaBudget: 0.2 });
    break;
  }
}

console.log('Queue complete:', fleet.status());
```

---

## 5. Fleet Auto-Scaling with δ(n)

Use the convergence delta δ(n) = (1/√n)(1 − 3/(2n)) to make scaling decisions.

```typescript
import { Fleet, C } from 'superinstance';

const fleet = new Fleet({ name: 'auto-scale' });

function convergenceDelta(n: number): number {
  return (1 / Math.sqrt(n)) * (1 - 3 / (2 * n));
}

// Start with a small fleet
fleet.spawn({ role: 'agent-1', gammaBudget: 0.3 });
fleet.spawn({ role: 'agent-2', gammaBudget: 0.3 });

const maxAgents = 10;

for (let i = 0; i < 50; i++) {
  const status = fleet.status();
  const n = status.agents;
  const delta = convergenceDelta(n);
  const utilization = status.conservation.gamma / C;
  const headroom = 1 - utilization;

  console.log(
    `Tick ${i}: agents=${n}, δ=${delta.toFixed(4)}, utilization=${(utilization * 100).toFixed(1)}%`
  );

  // Scale up when headroom is large and delta is still meaningful
  if (headroom > 0.4 && n < maxAgents && fleet.getDecision().action === 'spawn') {
    const newAgent = fleet.spawn({
      role: `agent-${n + 1}`,
      gammaBudget: 0.15,
    });
    console.log(`  → Scaled up: ${newAgent.getState().role}`);
  }

  // Scale down (merge) when delta is tiny and utilization is high
  if (fleet.getDecision().action === 'merge') {
    console.log('  → Governor suggests merge — too many small agents');
    break;
  }

  // Do work
  const agents = fleet.status().agents;
  // Simulate work...

  await new Promise((r) => setTimeout(r, 100));
}

console.log('Final fleet state:', fleet.status());
```

---

## 6. Conservation CI/CD Pipeline

Use conservation governance in a deployment pipeline — the Governor gates releases.

```typescript
import { Fleet, C } from 'superinstance';

const fleet = new Fleet({ name: 'cicd' });

const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.4 });
const tester = fleet.spawn({ role: 'tester', gammaBudget: 0.3 });
const deployer = fleet.spawn({ role: 'deployer', gammaBudget: 0.3 });

async function releasePipeline(commit: string) {
  console.log(`\n=== Release pipeline for ${commit} ===`);

  // 1. Build
  const build = await builder.execute({
    prompt: `Build ${commit}`,
  });
  console.log(`Build: ${build.conservationCheck.passed ? '✅' : '❌'}`);

  // 2. Test — delegate from builder to tester
  const testResult = await builder.delegate(
    'tester',
    { prompt: `Test artifacts from ${commit}` },
    0.1,
  );
  console.log(`Tests: ${testResult.result.conservationCheck.passed ? '✅' : '❌'}`);

  if (!testResult.result.conservationCheck.passed) {
    console.log('Tests failed — aborting release');
    return;
  }

  // 3. Governor gates deployment
  const decision = fleet.getDecision();
  if (decision.action === 'throttle') {
    console.log(`Governor throttled release: ${decision.reason}`);
    return;
  }

  // 4. Deploy
  const deploy = await deployer.execute({
    prompt: `Deploy ${commit} to production`,
  });
  console.log(`Deploy: ${deploy.conservationCheck.passed ? '✅' : '❌'}`);
  console.log(`Conservation: γ=${fleet.status().conservation.gamma.toFixed(3)} η=${fleet.status().conservation.eta.toFixed(3)}/${C}`);
}

await releasePipeline('abc123');
await releasePipeline('def456');
```

---

## 7. Connect Two Fleets via Harbor

Bridge fleets for cross-team collaboration while keeping independent conservation invariants.

```typescript
import { Fleet, CapabilityRouter } from 'superinstance';

// Team A: Research
const researchFleet = new Fleet({ name: 'research-team' });
const researcher = researchFleet.spawn({ role: 'researcher', gammaBudget: 0.5 });
const analyst = researchFleet.spawn({ role: 'analyst', gammaBudget: 0.3 });

// Team B: Deployments
const deployFleet = new Fleet({ name: 'deploy-team' });
const deployer = deployFleet.spawn({ role: 'deployer', gammaBudget: 0.4 });
const monitor = deployFleet.spawn({ role: 'monitor', gammaBudget: 0.2 });

// Bridge them
const router = new CapabilityRouter({
  deploy: 'deploy-team',
  monitor: 'deploy-team',
  research: 'research-team',
});

researchFleet.bridge(deployFleet, { router });

// Researcher delegates deployment to the deploy fleet
const result = await researcher.delegate('deployer', {
  prompt: 'Deploy the new search index',
});

console.log(`Cross-fleet delegation: ${result.result.output}`);

// Each fleet maintains its own conservation law
const rStatus = researchFleet.status();
const dStatus = deployFleet.status();

console.log(`Research: γ=${rStatus.conservation.gamma} η=${rStatus.conservation.eta} satisfied=${rStatus.conservation.satisfied}`);
console.log(`Deploy:   γ=${dStatus.conservation.gamma} η=${dStatus.conservation.eta} satisfied=${dStatus.conservation.satisfied}`);
```

---

## 8. Custom Capability Handler

Build a full capability system with custom handlers for your domain.

```typescript
import { Fleet } from 'superinstance';

const fleet = new Fleet({ name: 'custom-caps' });
const agent = fleet.spawn({ role: 'orchestrator', gammaBudget: 0.5 });

// Register domain-specific capabilities
fleet.registerCapability('database-query', async (params) => {
  const { query, limit } = params;
  // Your DB logic
  return { rows: [{ id: 1, name: 'result' }], count: 1 };
});

fleet.registerCapability('send-notification', async (params) => {
  const { channel, message } = params;
  // Your notification logic
  return { sent: true, channel };
});

fleet.registerCapability('compute-metrics', async (params) => {
  const { dataset, metric } = params;
  return { value: 42.5, metric, sampleSize: dataset.length };
});

// Chain capabilities
const data = await agent.request('database-query', {
  query: 'SELECT * FROM events LIMIT 100',
  limit: 100,
});

const metrics = await agent.request('compute-metrics', {
  dataset: data.rows,
  metric: 'p95_latency',
});

await agent.request('send-notification', {
  channel: '#ops',
  message: `P95 latency: ${metrics.value}ms`,
});

console.log('All capabilities executed');
console.log(`Budget remaining: ${agent.getBudget()}`);
```

---

## 9. Monitor with Telemetry

Full observability stack with reporter, receiver, and dashboard.

```typescript
import {
  Fleet,
  FleetDashboard,
  TelemetryReporter,
  TelemetryReceiver,
} from 'superinstance';

const fleet = new Fleet({ name: 'observed' });

fleet.spawn({ role: 'worker-1', gammaBudget: 0.3 });
fleet.spawn({ role: 'worker-2', gammaBudget: 0.3 });

// Live dashboard
const dashboard = new FleetDashboard(fleet, { refreshMs: 1000 });
dashboard.start();

// Remote telemetry
const reporter = new TelemetryReporter({
  endpoint: 'https://telemetry.example.com/ingest',
  intervalMs: 3000,
  fleetName: 'observed',
});

reporter.attach(fleet);

// Alert handling
const violations: string[] = [];

reporter.onAlert((alert) => {
  console.warn(`🚨 [${alert.type}] ${alert.message}`);
  violations.push(alert.message);

  if (alert.type === 'conservation-violation') {
    console.log(`γ=${alert.gamma} η=${alert.eta} — applying throttle`);
  }
});

// Local receiver for aggregation
const receiver = new TelemetryReceiver();

const interval = setInterval(() => {
  receiver.ingest(fleet.status());
}, 2000);

// Do work
for (let i = 0; i < 10; i++) {
  const decision = fleet.getDecision();
  console.log(`[${i}] Decision: ${decision.action}`);
  await new Promise((r) => setTimeout(r, 500));
}

// Summary
const aggregate = receiver.getAggregate();
console.log('\n=== Telemetry Summary ===');
console.log(`Snapshots: ${aggregate.snapshots}`);
console.log(`Avg gamma: ${aggregate.avgGamma}`);
console.log(`Violations: ${aggregate.violations}`);

// Cleanup
clearInterval(interval);
reporter.detach();
dashboard.stop();
```

---

## 10. Handle Violations Gracefully

When the conservation law is violated, handle it cleanly without crashing.

```typescript
import { Fleet, C } from 'superinstance';

const fleet = new Fleet({ name: 'resilient' });
const agent = fleet.spawn({ role: 'worker', gammaBudget: 0.7 });

// Register a conservation violation handler
fleet.registerCapability('conserve', async (params) => {
  console.log('Conservation enforcement triggered');
  return { enforced: true, newGamma: params.targetGamma ?? 0.5 };
});

// Simulate work that pushes toward the limit
const tasks = Array.from({ length: 20 }, (_, i) => ({
  prompt: `Task ${i}`,
}));

for (const task of tasks) {
  try {
    const status = fleet.status();
    const total = status.conservation.gamma + status.conservation.eta;

    if (total > C) {
      console.log(`⚠️ Conservation violated: ${total.toFixed(3)} > ${C.toFixed(3)}`);
      console.log('  Triggering conservation enforcement...');

      await agent.request('conserve', { targetGamma: 0.4 });
      console.log('  Budget reduced, continuing...');
    }

    const result = await agent.execute(task);

    if (!result.conservationCheck.passed) {
      console.log(`Conservation check failed for ${task.prompt}`);
      console.log('  Remaining budget:', agent.getBudget());

      // Trigger recovery
      const recovery = await agent.request('validate', {
        output: result.output,
      });
      console.log('  Recovery:', recovery);
      break;
    }

    if (agent.getBudget() < 0.05) {
      console.log('Budget exhausted — spawning relief agent');
      fleet.spawn({ role: 'relief', gammaBudget: 0.2 });
      break;
    }
  } catch (err) {
    console.error('Task error:', err instanceof Error ? err.message : err);
    // Optionally: merge agents or reset
    const decision = fleet.getDecision();
    if (decision.action === 'merge') {
      console.log('Governor suggests merge — consolidating agents');
    }
    break;
  }
}

console.log('\nFinal status:', fleet.status());
console.log('Conservation satisfied:', fleet.status().conservation.satisfied);
```

---

## See Also

- **[Getting Started](./GETTING_STARTED.md)** — From zero to first fleet in 40 minutes
- **[API Reference](./API_REFERENCE.md)** — Every class, method, and type
- **[Full Fleet Demo](../examples/full-fleet-demo.ts)** — Complete runnable example

---

*Recipes version: 1.0.0 · C = log₂(3) ≈ 1.585*
