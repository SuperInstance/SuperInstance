# @superinstance/langgraph-integration

Conservation-law governance for [LangGraph](https://github.com/langchain-ai/langgraph) graphs and multi-agent pipelines.

Every graph invocation becomes a conservation-tracked operation with γ/η budget enforcement.

## Conservation Law

```
γ + η ≤ C   where C = log₂(3) ≈ 1.585 bits
```

- **γ (gamma):** coupling cost — compute invested in coordination
- **η (eta):** value produced — useful output
- **C:** capacity — the universal bound
- **δ (delta):** remaining budget — C minus γ and η

## Install

```bash
npm install @superinstance/langgraph-integration @langchain/core @langchain/langgraph
```

You also need the SuperInstance SDK:

```bash
npm install @superinstance/sdk
```

## Quick Start

Wrap any LangGraph `StateGraph` with conservation governance:

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { Fleet, governGraph } from '@superinstance/langgraph-integration';

// 1. Build your LangGraph as usual
const graph = new StateGraph({
  channels: { task: null, result: null },
});
// ... add nodes, edges ...
const compiled = graph.compile();

// 2. Create a governing fleet
const fleet = new Fleet({ name: 'my-pipeline' });

// 3. Wrap with governance
const governed = governGraph({
  fleet,
  graph: compiled,
  role: 'builder',
  gammaBudget: 0.3,  // max γ this graph can consume
  name: 'build-pipeline',
});

// 4. Invoke with automatic conservation tracking
const { state, result } = await governed.invoke({ task: 'build API' });

console.log(result.gammaUsed);         // γ consumed
console.log(result.etaProduced);       // η produced
console.log(result.conservationCheck); // full conservation state
```

## Multi-Agent Pattern

Create a governed multi-agent pipeline where each agent gets its own γ budget:

```typescript
import { createGovernedMultiAgent } from '@superinstance/langgraph-integration';

const { fleet, invoke } = createGovernedMultiAgent({
  fleetName: 'research-build-validate',
  agents: [
    {
      name: 'Researcher',
      role: 'researcher',
      gammaBudget: 0.2,
      invoke: async (state) => {
        // Call LLM, search, etc.
        return { ...state, research: 'findings...' };
      },
    },
    {
      name: 'Builder',
      role: 'builder',
      gammaBudget: 0.3,
      invoke: async (state) => {
        return { ...state, artifact: 'built artifact' };
      },
    },
    {
      name: 'Validator',
      role: 'validator',
      gammaBudget: 0.15,
      invoke: async (state) => {
        return { ...state, validated: true };
      },
    },
  ],
});

// Runs all agents sequentially with conservation enforcement
const result = await invoke({ task: 'build rate limiter' });

// Check fleet health
console.log(fleet.status());
```

### Wiring into a LangGraph StateGraph

For custom topologies (conditional edges, parallel branches, etc.), use `governNode` to wrap individual nodes:

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { Fleet, governNode } from '@superinstance/langgraph-integration';

const fleet = new Fleet({ name: 'custom-topology' });

const graph = new StateGraph({
  channels: { input: null, output: null },
});

// Each node gets its own γ budget
graph.addNode('research', governNode(researchFn, fleet, 0.15));
graph.addNode('build', governNode(buildFn, fleet, 0.25));
graph.addNode('validate', governNode(validateFn, fleet, 0.10));

graph.addEdge('__start__', 'research');
graph.addConditionalEdges('research', routingLogic);
graph.addEdge('build', 'validate');
graph.addEdge('validate', END);

const compiled = graph.compile();
const result = await compiled.invoke({ input: 'task' });
```

## Node-Level Governance

Wrap any async function as a conservation-governed node:

```typescript
import { Fleet, governNode } from '@superinstance/langgraph-integration';

const fleet = new Fleet({ name: 'node-level' });

const governedNode = governNode(
  async (state) => {
    // Your node logic
    return { ...state, processed: true };
  },
  fleet,
  0.1,  // γ budget for this node
);

// When budget exhausted, passes state through without executing
const result = await governedNode({ input: 'data' });
```

## State Channel Integration

Conservation metadata flows through your graph state via a dedicated channel:

```typescript
import {
  extractConservation,
  injectConservation,
  conservationReducer,
  CONSERVATION_KEY,
} from '@superinstance/langgraph-integration';

// Extract conservation data from state
const cons = extractConservation(state);
if (cons.gamma && cons.gamma > 0.5) {
  console.warn('γ budget running low');
}

// Inject updated conservation data
const newState = injectConservation(state, {
  gamma: 0.15,
  eta: 0.08,
  delta: 1.355,
  agentCount: 3,
});

// Use as a LangGraph channel reducer
const StateGraph = Annotation.Root({
  messages: Annotation<any[]>({ reducer: (a, b) => [...a, ...b] }),
  [CONSERVATION_KEY]: conservationReducer(),
});
```

## Migration: Ungoverned → Governed

### Before (ungoverned)

```typescript
import { StateGraph } from '@langchain/langgraph';

const graph = new StateGraph({ channels: { input: null, output: null } });
// ... build graph ...
const compiled = graph.compile();
const result = await compiled.invoke({ input: 'task' });
```

### After (governed)

```typescript
import { StateGraph } from '@langchain/langgraph';
import { Fleet, governGraph } from '@superinstance/langgraph-integration';

const fleet = new Fleet({ name: 'my-app' });           // ← add fleet
const graph = new StateGraph({ channels: { input: null, output: null } });
// ... build graph (unchanged) ...
const compiled = graph.compile();

// ← wrap with governance
const governed = governGraph({
  fleet,
  graph: compiled,
  role: 'builder',
  gammaBudget: 0.3,
  name: 'my-graph',
});

const { state, result } = await governed.invoke({ input: 'task' });
// result.conservationCheck now available
```

### Migration checklist

1. **Create a Fleet** — one per application or pipeline
2. **Wrap the compiled graph** with `governGraph()`
3. **Destructure the result** — `{ state, result }` instead of just `state`
4. **Monitor conservation** — check `result.conservationCheck.status`
5. **Optionally wrap individual nodes** with `governNode()` for finer control

## API Reference

### `governGraph(options) → GovernedGraph`

Wrap a LangGraph with conservation governance.

| Option | Type | Description |
|--------|------|-------------|
| `fleet` | `Fleet` | Governing fleet |
| `graph` | `InvocableGraph` | Graph with `invoke()` method |
| `role` | `AgentRole` | `'builder' \| 'researcher' \| 'validator' \| 'deployer' \| 'orchestrator'` |
| `gammaBudget` | `number` | Max γ the graph can consume |
| `name` | `string` | Human-readable graph name |

### `GovernedGraph`

| Method | Returns | Description |
|--------|---------|-------------|
| `invoke(state)` | `{ state, result }` | Run graph with governance |
| `canRun()` | `boolean` | Check if budget allows execution |
| `getConservation()` | `ConservationState` | Current fleet conservation state |
| `getGammaUsed()` | `number` | γ consumed by this graph |
| `getRemainingBudget()` | `number` | Remaining γ budget |
| `getInvocationCount()` | `number` | Successful invocations |

### `governNode(nodeFn, fleet, gammaBudget) → GovernedNodeFn`

Wrap a node function with per-node γ budget tracking.

### `createGovernedMultiAgent(options) → { fleet, invoke }`

Create a governed multi-agent pipeline with sequential execution.

### State Adapter

| Function | Description |
|----------|-------------|
| `extractConservation(state)` | Extract conservation channel from state |
| `injectConservation(state, channel)` | Add/update conservation channel in state |
| `conservationReducer()` | LangGraph-compatible reducer for conservation channel |

## License

MIT
