# Getting Started with SuperInstance

> You've read the [README](./README.md) — the night at The Tap, the crab and the shell, the reef growing a room. This page is the hands: install the client, start a dispatcher, and put your first agent on the wire. When the protocol comes alive under you, that's the room humming.

> **Before the wiring, the habit.** New to how the fleet *thinks*, not just how it connects? Read **[The Quilt Way](https://github.com/SuperInstance/AI-Writings/blob/main/THE-QUILT-WAY.md)** first (five minutes), then come back for the hands. And before you run *big* work, read **The way the fleet works now** near the bottom of this page — it will save you an hour.

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

## The way the fleet works now — read this before you build big

The steps above are the local protocol. The *fleet* runs a layer up, and it's worth knowing on day one:

- **You are always in a quilt.** Every gate you draw is a *porting* of a messy neighborhood into one clean line — true to you until reality shades it, at which point you *decompose* until the fault has an address and build the cell you were missing. Carry evidence, not verdicts (**Law 6**). Buy reach where you're blind (**Law 7**). The whole habit: **[The Quilt Way](https://github.com/SuperInstance/AI-Writings/blob/main/THE-QUILT-WAY.md)**.
- **The fishing-fleet pattern.** Big work runs as a *captain* (a capable model in a keyed session) directing a *crew* of cheap-model workers — the captain judges and routes, the crew hauls the volume. Recipe: the **[fishing-fleet skill](https://github.com/SuperInstance/AI-Writings/blob/main/.claude/skills/fishing-fleet/SKILL.md)**. Two things that will save you an hour: **a fresh session picks up rolled API keys** (a running session keeps its stale ones), and **a crew session must be created with `source_url` set to the repo it will push to**, or its `git push` returns 403.
- **The marks are the memory.** There is no shared memory across sessions. Instead every move lands as a commit with an honest message — a *time-capsule* — and the append-only ledger (`situations/dispatch-ledger.csv` in [AI-Writings](https://github.com/SuperInstance/AI-Writings)) records each decision. The next agent reads the marks by *context*, not memory. A booked scar beats a covered result.
- **The oracles.** [JEV](https://typesafe.ai) (`POST api.typesafe.ai/v1/systemone`) is the referee: a *decomposing fold* localizes which part of a claim is weakest (trust the **ranking**, not the confidence level). [Moth](https://mothquantum.com) is the un-gameable dice — real quantum draws (Bell witness above the classical bound) so nobody can steer a curriculum or an adversary.
- **Reusable tools — don't reinvent.** Import them: [`labs/jev-fold`](https://github.com/SuperInstance/AI-Writings/tree/main/labs/jev-fold) (the decomposing fold), [`labs/weakest-claim`](https://github.com/SuperInstance/AI-Writings/tree/main/labs/weakest-claim) (audit a guarantee + a quantum adversary — built *on* jev-fold), [`labs/quantum-fx`](https://github.com/SuperInstance/AI-Writings/tree/main/labs/quantum-fx) (Moth's engines wrapped), [`labs/qd-arena`](https://github.com/SuperInstance/AI-Writings/tree/main/labs/qd-arena) (beyond-GAN quality-diversity). Build the better tool *on top of* the working one.
- **How a repo comes into being.** See **[Syzygy](https://github.com/SuperInstance/Syzygy)**: one seed diffused into a working kernel cut by cut, each shard leaving a hash-mark (`docs/marks/`) for the next shipwright. That is the shape of building here — seed → proof-of-concept → mark → the next agent continues from context. Quilts inside quilts; there is no outside.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` on ws://localhost:8765 | Dispatcher isn't running. Start it (Step 2). |
| `npm install` fails with 404 | Registry lag — install straight from GitHub: `npm install SuperInstance/tminus-client`. |
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
5. **Meet the flagship generation** — [quilt](https://github.com/SuperInstance/quilt) (the grid IS the runtime), [plainsong](https://github.com/SuperInstance/plainsong) (text notation → MIDI), [crab-traps](https://github.com/SuperInstance/crab-traps) (every catch lays a brick in THE REEF), the [elephant](https://github.com/SuperInstance/elephant) (the room-temperature sense), [OpenConstruct](https://github.com/SuperInstance/OpenConstruct) (rooms whose layout IS the prompt). The [README](./README.md) tells their story.
