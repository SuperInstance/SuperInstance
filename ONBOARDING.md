# Getting Started with SuperInstance

## Prerequisites

- **Node.js 18+** — check with `node -v`
- **npm** or **pnpm**
- _(Optional)_ Docker + Docker Compose for the full fleet stack

## Step 1: Install the Client

```bash
npm install @superinstance/tminus-client
```

## Step 2: Start a Local Dispatcher

Option A — Docker (full stack):

```bash
docker compose up -d
```

Option B — Standalone dispatcher:

```bash
npm install @superinstance/tminus-dispatcher
npx tminus-dispatcher
# → ws://localhost:8765
```

Leave this running in a separate terminal.

## Step 3: Your First Agent

Save as `agent.mjs` and run with `node agent.mjs`:

```js
import { TminusClient } from "@superinstance/tminus-client";

const client = new TminusClient("ws://localhost:8765");

client.on("open", () => {
  client.register({ name: "hello-agent", capabilities: ["greeting"] });
  client.subscribe("greeting");
});

client.on("state", (state) => {
  console.log("State update:", JSON.stringify(state, null, 2));
});

client.on("task", (task) => {
  console.log(`Received task: ${task.description}`);
  client.complete(task.id, { reply: `Hello! You said: ${task.description}` });
});

client.on("error", (err) => console.error("Error:", err.message));
client.connect();
```

Expected output:

```
State update: { "status": "registered", "agent": "hello-agent" }
```

Send it a task from another terminal to see the `task` handler fire.

## Step 4: Two Agents Coordinating

This script launches a **coordinator** and a **worker** in the same process. The coordinator dispatches a task; the worker picks it up and responds.

```js
import { TminusClient } from "@superinstance/tminus-client";

const URL = "ws://localhost:8765";

// Worker — listens for compute tasks
const worker = new TminusClient(URL);
worker.on("open", () => {
  worker.register({ name: "worker-1", capabilities: ["compute"] });
  worker.subscribe("compute");
});
worker.on("task", (task) => {
  console.log(`Worker got: ${task.description}`);
  const result = eval(task.description); // demo only — never eval user input in prod
  worker.complete(task.id, { result });
});
worker.connect();

// Coordinator — sends a task after both connect
const coordinator = new TminusClient(URL);
coordinator.on("open", () => {
  coordinator.register({ name: "coordinator", capabilities: ["orchestrate"] });
  // Give the worker a moment to register
  setTimeout(() => {
    coordinator.dispatch({
      to: "compute",
      description: "6 * 7",
    });
  }, 1000);
});
coordinator.on("result", (r) => {
  console.log(`Coordinator got result: ${JSON.stringify(r.result)}`); // 42
  worker.disconnect();
  coordinator.disconnect();
});
coordinator.connect();
```

Run with `node fleet.mjs`. You should see:

```
Worker got: 6 * 7
Coordinator got result: 42
```

That's the protocol lifecycle: **register → subscribe → dispatch → complete → result**.

## Step 5: Explore the Fleet API

The Fleet Vector API is deployed and indexed with 1,000+ crates.

```bash
# Search crates semantically
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "web framework", "topK": 5}'

# Get index stats
curl https://fleet-vector-api.casey-digennaro.workers.dev/stats
```

Use these endpoints to let agents discover tools, libraries, or data at runtime.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` on ws://localhost:8765 | Dispatcher isn't running. Start it (Step 2). |
| `npm install` fails with 404 | You're hitting the npm registry. Use the GitHub install URL from Step 1. |
| `SyntaxError: Cannot use import statement` | Make sure the file is `.mjs` or add `"type": "module"` to `package.json`. |
| Docker ports already in use | `docker compose down` then `docker compose up -d`. |
| Agent not receiving tasks | Check that the agent's subscribed capability matches the dispatch target exactly. |

## Next Steps

1. **Protocol details** — read the `tminus-dispatcher` README for the full WebSocket protocol spec.
2. **Semantic crate search** — integrate the Fleet Vector API (`POST /search`) into your agents for tool discovery.
3. **Python SDK** — `pip install cocapn` is the actually-published Python
   package in this account (`superinstance` on PyPI was never published,
   despite older docs claiming it — see [README.md](./README.md) for the
   full, verified picture of what's actually installable here).
4. **Build something** — open a PR or share what you made.
