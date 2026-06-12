# Build a Two-Agent Coordination System in 15 Minutes

## TL;DR

You'll build two agents — **Alpha** (the boss) and **Beta** (the worker) — that coordinate through a central dispatcher using t-minus cues. Alpha sends a cue, Beta receives it, prepares, fires, and reports back. Real distributed agent orchestration in under 50 lines per agent.

## Prerequisites

- **Node.js 18+**
- **npm**
- Two terminal windows (or tmux)

## Setup

```bash
# Create a project folder
mkdir hello-tminus && cd hello-tminus
npm init -y

# Install the dispatcher and client SDK
npm install @superinstance/tminus-dispatcher @superinstance/tminus-client
```

## Part 1: Start the Dispatcher

The dispatcher is the central hub. All agents connect to it via WebSocket.

```bash
npx tminus-dispatcher
```

You should see:

```
[T-Minus Dispatcher] Listening on ws://localhost:8765
```

Leave this running. Open a new terminal for the next steps.

## Part 2: Agent Alpha — The Requester

Create `agent-alpha.js`:

```js
const { TminusClient } = require('@superinstance/tminus-client');

const client = new TminusClient('ws://localhost:8765');

async function main() {
  // 1. Connect to the dispatcher
  await client.connect();
  console.log('✓ Connected');

  // 2. Register this agent
  const reg = await client.register('alpha', { timbre: 'direct', frequency: 1.0 });
  console.log(`✓ Registered as ${reg.agent_id}`);

  // 3. Subscribe to the "hello" phase group
  await client.subscribe('hello');
  console.log('✓ Subscribed to phase group "hello"');

  // 4. Send a cue to beta with offset=0 (immediate)
  console.log('\n→ Sending cue to beta...');
  await client.cue('beta', 0, 'hello', { task: 'greet', message: 'Hello from Alpha!' });
  console.log('✓ Cue sent');

  // 5. Wait for beta to finish
  client.on('phase_advance', (payload) => {
    console.log(`\n✓ Phase advance: ${JSON.stringify(payload)}`);
    client.disconnect();
    process.exit(0);
  });

  // Timeout after 15s
  setTimeout(() => { console.log('Timeout'); client.disconnect(); process.exit(1); }, 15000);
}

main().catch(console.error);
```

**Line by line:**

- `new TminusClient(url)` — creates a client pointing at the dispatcher. That's it.
- `connect()` — opens the WebSocket, resolves when connected.
- `register(name, opts)` — tells the dispatcher who this agent is. Returns an `agent_id`.
- `subscribe('hello')` — joins the `"hello"` phase group so it can send/receive cues in that group.
- `cue(targetId, offset, phaseGroup, payload)` — sends a t-minus cue to agent `beta`. Offset `0` means "act now."
- The `phase_advance` event fires when the group's phase moves forward — in this case, when beta completes its work.

## Part 3: Agent Beta — The Worker

Create `agent-beta.js`:

```js
const { TminusClient } = require('@superinstance/tminus-client');

const client = new TminusClient('ws://localhost:8765');

async function main() {
  // 1. Connect and register
  await client.connect();
  const reg = await client.register('beta', { timbre: 'warm' });
  console.log(`✓ Registered as ${reg.agent_id}`);

  // 2. Subscribe to the "hello" phase group
  await client.subscribe('hello');
  console.log('✓ Listening for cues...');

  // 3. Wait for a cue
  const cue = await client.awaitCue();
  console.log(`\n← Cue received! Task: ${cue.payload?.task}`);
  console.log(`  Message: ${cue.payload?.message}`);
  console.log(`  State: ${client.state}`); // "cued"

  // 4. Fire — acknowledge we're executing
  await client.fire();
  console.log(`✓ Firing! State: ${client.state}`); // "firing"

  // 5. Do the actual work
  const result = `Beta says: "${cue.payload?.message}" — task done!`;
  console.log(`  Result: ${result}`);

  // 6. Report completion back to dispatcher
  await client.report('ok', 'hello', 1);
  console.log('✓ Reported complete. Disconnecting.');

  client.disconnect();
  process.exit(0);
}

main().catch(console.error);
```

**Line by line:**

- `awaitCue()` — returns a Promise that resolves when this agent receives a cue. Takes an optional timeout (default 30s).
- `fire()` — tells the dispatcher "I'm executing now." Moves state from `primed` → `firing`.
- `report(result, phaseGroup, durationBeats)` — sends the outcome back. `result` is a freeform string (`'ok'`, `'fail'`, etc.). This triggers a `phase_advance` event for other agents in the group.

## Part 4: Run Them Together

You need three terminals:

```bash
# Terminal 1 — Dispatcher (already running from Part 1)
npx tminus-dispatcher

# Terminal 2 — Start Beta first (so it's listening before Alpha cues)
node agent-beta.js

# Terminal 3 — Start Alpha
node agent-alpha.js
```

**Expected output — Beta:**

```
✓ Registered as beta
✓ Listening for cues...

← Cue received! Task: greet
  Message: Hello from Alpha!
  State: cued
✓ Firing! State: firing
  Result: Beta says: "Hello from Alpha!" — task done!
✓ Reported complete. Disconnecting.
```

**Expected output — Alpha:**

```
✓ Connected
✓ Registered as alpha
✓ Subscribed to phase group "hello"

→ Sending cue to beta...
✓ Cue sent

✓ Phase advance: {"group":"hello","result":"ok"}
```

## Part 5: What Just Happened?

Every agent goes through the same lifecycle:

```
  OFFLINE → REGISTERED → LISTENING → CUED → PRIMED → FIRING → COMPLETE
                                        ↑        │
                                        └────────┘  (offset=0 skips this)
```

Here's the sequence that just played out:

```
 Alpha                    Dispatcher                    Beta
   │                         │                          │
   ├── REGISTER ────────────►│◄───────── REGISTER ─────┤
   │                         │                          │
   ├── SUBSCRIBE "hello" ──►│◄───────── SUBSCRIBE ────┤
   │                         │                          │
   ├── CUE(beta, 0) ───────►│                          │
   │                         ├── CUED ────────────────►│
   │                         │                          │
   │                         │◄───────── FIRE ─────────┤
   │                         ├── PRIMED ──────────────►│
   │                         │                          │
   │                         │◄───────── REPORT(ok) ───┤
   │◄── PHASE_ADVANCE ──────┤                          │
   │                         │                          │
```

The key insight: **Alpha doesn't call Beta directly.** It sends a cue through the dispatcher. The dispatcher handles routing, timing, and state tracking. Neither agent needs to know the other's address — just the name and phase group.

The `offset` parameter is where the magic lives. We used `0` (immediate), but negative offsets give pre-cues (agent gets a head start) and positive offsets create countdowns (agent waits N beats before acting).

## Part 6: Next Steps

- **Add more agents** — subscribe them to the same phase group and watch them coordinate.
- **Try different offsets** — `cue('beta', -2, 'hello', {...})` gives Beta a 2-beat head start.
- **Chain phases** — use multiple phase groups (`hello`, `process`, `respond`) to build multi-step workflows.
- **Connect to Fleet Vector API** — have agents query semantic knowledge before acting:
  ```js
  const res = await fetch('https://fleet-vector-api.casey-digennaro.workers.dev/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'relevant topic', topK: 3 })
  });
  ```
- **Build something real** — a multi-agent research pipeline, a coordinated deployment system, or an orchestra of agents that harmonize on complex tasks.

That's it. You just built distributed agent coordination. Go make something.
