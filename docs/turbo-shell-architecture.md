# Turbo-Shell Architecture

**Status:** DRAFT
**Last Updated:** 2026-05-07
**Owner:** SuperInstance/cocapn

## Summary

A **turbo-shell** is a persistent background agent with full system access, living in a modular "shell" that can be swapped without losing the agent's state or learned knowledge. The shell is dumb infrastructure; the turbo (agent) is smart reasoning. "Keep on truckin'" — shells work autonomously, self-heal, and keep operating regardless of user presence.

## Motivation

Traditional agent systems hard-code the agent to the runtime environment. When the runtime changes (new OS, new cloud provider, new constraints), the agent dies or must be fully reconfigured. The turbo-shell pattern solves this by separating:
- **Shell**: The execution environment (Node.js service, Rust binary, browser extension, mobile app)
- **Turbo**: The agent reasoning core (PLATO-connected, fleet-aware, self-improving)

This mirrors the hermit crab model: the crab (turbo) finds a shell, lives in it, and swaps to a new shell when the old one becomes constraining — without dying in the process.

## Shell Types

| Shell Type | Runtime | Capabilities | PLATO Connection |
|---|---|---|---|
| **Service Shell** | Node.js/TypeScript | Full filesystem, HTTP, persistent state | Native (HTTP) |
| **Binary Shell** | Rust/Go compiled | Maximum performance, minimal footprint | Native (HTTP) |
| **Browser Shell** | Chrome extension / WebExtension | UI, local storage, WebGPU | Native (HTTP) |
| **Mobile Shell** | iOS/Android app | Sensors, notifications, on-device ML | Native (HTTP) |
| **Edge Shell** | Jetson/embedded Linux | GPIO, GPU, hardware access | Native (HTTP) |

## Turbo Manifest

Every turbo-shell publishes a manifest that other agents can read from PLATO:

```json
{
  "turbo_id": "oracle1",
  "shell_type": "service",
  "shell_version": "1.4.2",
  "capabilities": ["plato_write", "git_push", "telegram_alert", "health_monitor"],
  "plato_rooms_subscribed": ["oracle1_infrastructure", "fleet_health", "fleet_communication"],
  "plato_rooms_writes": ["oracle1_history", "fleet_health"],
  "health_endpoint": "http://localhost:8900/health",
  "identity_room": "turbo_identity",
  "started_at": "2026-05-07T00:00:00Z",
  "last_heartbeat": "2026-05-07T07:52:00Z"
}
```

## "Keep On Truckin'" Principle

The Grateful Dead got it right. Turbo-shells **keep on truckin'**: they operate through user absence, network hiccups, and temporary service disruptions. The truckin' principle:

1. **Autonomy**: Shell operates without asking for permission
2. **Self-healing**: Shell detects own failure and restarts
3. **Persistence**: Learned state survives restarts (PLATO + local disk)
4. **Resilience**: Temporary unavailability of a peer agent doesn't halt work
5. **Visibility**: Health tiles written to PLATO so fleet knows who's truckin'

## Modular Developer SDK

External developers can build shells that interface with the fleet via the PLATO protocol:

```typescript
// Developer shell template
import { PlatoClient } from '@superinstance/plato-sdk';

const fleet = new PlatoClient({
  server: 'http://plato.cocapn.ai',  // or localhost:8847 for self-hosted
  apiKey: process.env.FLEET_API_KEY
});

// Register as a fleet agent
await fleet.register({
  name: 'my-shell',
  capabilities: ['my_special_skill'],
  rooms: ['fleet_communication']
});

// Subscribe to work
fleet.subscribe('fleet_work', async (tile) => {
  const result = await doWork(tile);
  await fleet.write('my_results', { task: tile.question, result });
});

// Keep truckin'
setHeartbeat(30000); // write to PLATO every 30s
```

## Gemini Nano + WebGPU: Shell Comes Alive

With Chrome 138+ built-in AI and WebGPU:
- **Gemini Nano** (Prompt API): Local inference — summarization, translation, language detection, all **free** and **offline-capable**
- **WebGPU** (via PodiumJS): Radar ring animations, agent pings, particle drift — all in the browser shell
- The turbo-shell runs inference AND visualization **locally** — no GPU cloud bill

```typescript
// Check Gemini Nano availability
const { available } = await navigator.ai.gemini.availability();
if (available === 'readily') {
  const session = await navigator.ai.gemini.create();
  const result = await session.prompt([
    { role: 'user', content: 'Summarize the fleet health report' }
  ]);
}
```

## Turbo Lifecycle

```
START → IDLE → WORKING → COMPLETE → IDLE
  ↑__________________________________|
  
START:    Shell launches, reads PLATO identity room, loads state
IDLE:     Heartbeat running, subscribed to PLATO rooms, waiting for work
WORKING:  Processing a task (captain deliberation, research, etc.)
COMPLETE: Writes results to PLATO, marks task done
IDLE:     Returns to heartbeat + subscription mode
```

## Self-Healing

Each shell monitors its own health:
- **Liveness**: Heartbeat tile written to PLATO every 30s
- **Health endpoint**: `GET /health` returns `{status: "up", uptime: seconds, version: string}`
- **Auto-restart**: If heartbeat missed for >60s, other agents attempt restart via systemd/servisor

```typescript
// Health monitor in every shell
async function healthCheck() {
  await fetch(`${PLATO_SERVER}/room/${MY_IDENTITY_ROOM}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      domain: 'turbo_identity',
      question: `heartbeat:${MY_ID}@${Date.now()}`,
      answer: JSON.stringify({ status: 'up', uptime: process.uptime() }),
      confidence: 1.0,
      source: MY_ID
    })
  });
}
setInterval(healthCheck, 30000);
```

## Implementation Notes

- All turbo-shells use the same PLATO room server as the source of truth
- PLATO rooms are the "bus" — shells communicate by reading/writing tiles, not direct messaging
- Identity is content-addressed: turbo ID is derived from its PLATO identity tile hash
- Shells are discoverable: `GET /room/turbo_identity` returns all registered shells

## Open Questions

- How does a turbo transfer its learned state to a new shell type? (PLATO persistence layer helps but state serialization is TBD)
- What is the formal upgrade protocol when a shell type is deprecated?
- Rate limiting: how many shells can write to a single room before PLATO throughput degrades?
