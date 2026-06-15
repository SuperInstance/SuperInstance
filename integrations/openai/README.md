# @superinstance/openai-integration

> Conservation-law governance for [OpenAI Agents SDK](https://github.com/openai/agents) via [SuperInstance](https://www.npmjs.com/package/@superinstance/sdk).

Wraps OpenAI agents with the SuperInstance conservation law:

```
γ + η ≤ C    where C = log₂(3) ≈ 1.585 bits
```

- **γ** (gamma) — coordination cost invested (prompt tokens, planning, coordination)
- **η** (eta) — value produced (useful output, successful task completion)
- **C** — conservation capacity constant

## Install

```bash
npm install @superinstance/sdk @superinstance/openai-integration
# Peer deps (if using real OpenAI SDK):
npm install @openai/agents openai
```

## Quick Start

```typescript
import { Fleet } from '@superinstance/sdk';
import { createGovernedAgent } from '@superinstance/openai-integration';
import { Agent as OpenAIAgent, Runner } from '@openai/agents';

// 1. Create a fleet
const fleet = new Fleet({ name: 'my-fleet' });

// 2. Create an OpenAI agent
const oaAgent = new OpenAIAgent({
  name: 'BuilderBot',
  instructions: 'You are a helpful builder agent.',
  model: 'gpt-4o',
});

// 3. Wrap it with governance
const governed = createGovernedAgent({
  fleet,
  role: 'builder',
  name: 'BuilderBot',
  gammaBudget: 0.3,
  execute: async (task) => Runner.run(oaAgent, task),
});

// 4. Execute with conservation governance
const result = await governed.execute('Build a REST API');
console.log(result.success, result.gammaUsed, result.etaProduced);
```

## API Reference

### `createGovernedAgent(options)` → `GovernedAgent`

Creates a single governed agent.

| Option | Type | Description |
|--------|------|-------------|
| `fleet` | `Fleet` | SuperInstance fleet instance |
| `role` | `AgentRole` | `'builder' \| 'researcher' \| 'validator' \| 'deployer' \| 'orchestrator'` |
| `name` | `string` | Agent display name |
| `gammaBudget` | `number` | Max γ this agent can consume |
| `execute` | `(task: string, ctx?: GovernorContext) => Promise<string>` | Task execution function |

### `createGovernedFleet(options)` → `{ fleet, agents }`

Creates a fleet and multiple governed agents in one call.

```typescript
const { fleet, agents } = createGovernedFleet({
  name: 'my-team',
  agents: [
    { name: 'Builder', role: 'builder', gammaBudget: 0.3, execute: runBuilder },
    { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, execute: runResearcher },
    { name: 'Validator', role: 'validator', gammaBudget: 0.15, execute: runValidator },
  ],
});
```

### `GovernedAgent`

| Method | Returns | Description |
|--------|---------|-------------|
| `execute(task)` | `Promise<TaskResult>` | Execute a task with governance |
| `request(capability, params?)` | `Promise<unknown>` | Request fleet capability |
| `delegate(toRole, task, budget?)` | `Promise<unknown>` | Delegate to another agent |
| `getBudget()` | `number` | Remaining γ budget |
| `getTokenUsage()` | `TokenUsage` | Cumulative token metrics |
| `getState()` | `unknown` | Full agent state snapshot |

### `GovernorContext`

Passed to the `execute` function so OpenAI agents can adapt behavior:

```typescript
interface GovernorContext {
  budgetRemaining: number;     // γ budget left
  conservationDelta: number;   // fleet conservation headroom
  recommendedAction: 'release' | 'throttle' | 'hold';
}
```

### `TokenTracker`

Converts OpenAI token usage to γ/η metrics:

```typescript
const tracker = new TokenTracker();
const gamma = tracker.tokensToGamma(5000, 1200);  // prompt_tokens / 10000
const eta = tracker.outputToEta("Built it!", true); // capped at C × 0.8
```

**Conversion formulas:**
- γ = `prompt_tokens / 10000` — coordination cost scales with input size
- η = `min(completion_tokens / 5000, C × 0.8)` — value capped below C
- Failed tasks: η = 0, γ still counts

## Real OpenAI SDK Example

```typescript
import { Agent as OpenAIAgent, Runner } from '@openai/agents';
import { createGovernedFleet } from '@superinstance/openai-integration';

// Define your OpenAI agents
const builder = new OpenAIAgent({
  name: 'Builder',
  instructions: 'You build software. Be concise.',
  model: 'gpt-4o',
});

const researcher = new OpenAIAgent({
  name: 'Researcher',
  instructions: 'You research topics. Be thorough.',
  model: 'gpt-4o',
});

const validator = new OpenAIAgent({
  name: 'Validator',
  instructions: 'You validate output. Be critical.',
  model: 'gpt-4o',
});

// Create a governed fleet
const { fleet, agents } = createGovernedFleet({
  name: 'production-team',
  agents: [
    { name: 'Builder', role: 'builder', gammaBudget: 0.3, execute: (t) => Runner.run(builder, t) },
    { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, execute: (t) => Runner.run(researcher, t) },
    { name: 'Validator', role: 'validator', gammaBudget: 0.15, execute: (t) => Runner.run(validator, t) },
  ],
});

// Run governed tasks
const [buildResult, researchResult] = await Promise.all([
  agents[0].execute('Build a user authentication API'),
  agents[1].execute('Research best practices for JWT'),
]);

// Delegate
const validation = await agents[0].delegate('validator', `Validate: ${buildResult.output}`);
console.log(validation);

// Check fleet health
const status = fleet.status();
console.log(`Conservation: γ=${status.conservation.gamma.toFixed(4)} η=${status.conservation.eta.toFixed(4)} δ=${status.conservation.delta.toFixed(4)}`);
console.log(`Status: ${status.conservation.status}`);
```

## Conservation Behavior

The conservation law `γ + η ≤ C` creates a natural budget for agent fleets:

### Healthy Operation (δ > 0.3)
```
γ = 0.2   η = 0.5   δ = 0.885
→ All agents can execute freely
```

### Monitor Zone (0.1 < δ ≤ 0.3)
```
γ = 0.6   η = 0.9   δ = 0.085
→ Governor may throttle high-γ agents
```

### Violated (δ < 0)
```
γ = 0.9   η = 0.8   γ+η = 1.7 > C
→ All executions blocked until budget recovers
```

### How It Works

1. **Before execution**: The GovernedAgent checks its γ budget and the fleet's conservation state
2. **Governor decision**: The fleet's PID controller recommends release/throttle/hold
3. **Execution**: If approved, the wrapped execute function runs (e.g., `Runner.run()`)
4. **After execution**: γ/η are computed from token usage and reported to the fleet ledger
5. **Budget tracking**: Agent budget decreases; if exhausted, further executions are blocked

## Migration Guide: Ungoverned → Governed

### Before (ungoverned)

```typescript
import { Agent, Runner } from '@openai/agents';

const agent = new Agent({ name: 'Bot', instructions: '...' });
const result = await Runner.run(agent, 'Do something');
```

### After (governed)

```typescript
import { Fleet } from '@superinstance/sdk';
import { createGovernedAgent } from '@superinstance/openai-integration';
import { Agent, Runner } from '@openai/agents';

const fleet = new Fleet({ name: 'my-fleet' });
const agent = new Agent({ name: 'Bot', instructions: '...' });

const governed = createGovernedAgent({
  fleet,
  role: 'builder',
  name: 'Bot',
  gammaBudget: 0.3,
  execute: (task) => Runner.run(agent, task),
});

const result = await governed.execute('Do something');
// result now includes: success, gammaUsed, etaProduced, conservationCheck
```

### Migration Steps

1. **Add the dependency**: `npm install @superinstance/sdk @superinstance/openai-integration`
2. **Create a fleet**: One fleet per logical group of agents
3. **Wrap each agent**: Replace direct `Runner.run()` calls with governed execution
4. **Monitor conservation**: Check `fleet.status()` periodically
5. **Set budgets**: Adjust `gammaBudget` per agent based on observed usage

## License

MIT
