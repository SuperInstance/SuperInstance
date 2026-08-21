# Services End-to-End Audit — 2026-05-17
**Auditor:** External Developer Perspective (Zero-Shot)
**Method:** Read ARCHITECTURE.md → test every service → document

---

## Executive Summary

**4 services are running, 2 respond usefully, the external API is entirely dead.** A new developer following the ARCHITECTURE.md would find PLATO and the Keeper working (with quirks), discover two MUD servers (telnet, not HTTP), find the holodeck running but in a different protocol than expected, and hit a dead end at `fleet.cocapn.ai`.

| Service | Port | Protocol | Status | External Access |
|---------|------|----------|--------|----------------|
| PLATO Room Server | 8847 | HTTP/REST | **🟡 Running (quirky)** | Dead (404) |
| Keeper | 8900 | HTTP/REST | **🟢 Running, clean** | Dead (404) |
| Fleet MUD | 7777 | Telnet | **🟢 Running** | N/A (local) |
| Holodeck | 7778 | Telnet | **🟢 Running** | N/A (local) |
| Adaptive MUD | 8850 | HTTP/REST | **🟢 Running** | N/A (local) |
| `fleet.cocapn.ai` | 443 | HTTPS | **🔴 Dead (404)** | Public |

---

## 1. PLATO Room Server (`localhost:8847`)

### Response: YES — running, partially functional

```
curl http://localhost:8847/status
→ {"status": "active", "total_tiles": 2063, "rooms": {...}}
```

**Rooms found (via `/rooms` endpoint):**

| Room | Tiles | Content Type |
|------|-------|-------------|
| coordination-history | 1,745 | Agent heartbeat ticks (te, health, sources, chi) |
| coordination-hierarchy | 306 | Agent status hierarchy snapshots |
| research_log | 7 | Night Wheel v2 research cycles |
| coordination-findings | 4 | Analysis results |
| oracle1-forgemaster-bridge | 1 | Bridge tile |
| shell_system | 1 | Shell tile |
| edge_compute | 1 | Edge compute tile |
| telepathy | 1 | Telepathy tile |

### What Works
- `/status` — Active, 2063 tiles across 8 rooms, gate_stats (2063 accepted, 617 rejected as duplicates)
- `/rooms` — Lists all rooms with tile counts and creation timestamps
- `/room/{name}` — Returns tiles with question/answer/tags structure (WORKS!)

### What's Broken or Confusing

**🔴 `/room/{name}/history` returns empty arrays.** All rooms show 0 tiles via the `/history` endpoint, even though they have tiles at `/room/{name}`. This is a route mismatch in the server router. The ARCHITECTURE.md references `oracle1-history` as a room name AND mentions `/history` endpoints — neither works.

**🔴 All POST endpoints return 404.** Cannot write tiles via any endpoint tried:
- `POST /tile` → 404
- `POST /api/tile` → 404
- `POST /room/{name}/tile` → 404

**🔴 Search returns 404.** `GET /search?q=...` → 404. The PLATO SDK exposes `search()` but the server doesn't implement it.

**🔴 API root returns 404.** `GET /` → 404. The plato-sdk's `status()` method calls this and fails.

**🔴 ARCHITECTURE.md references rooms that don't exist on the server.**
- `fleet-registry` → empty (0 tiles)
- `fleet-math` → empty (0 tiles)
- `oracle1-history` → empty (0 tiles)
- `committee-room` → empty (0 tiles)
- `fleet_math` (underscore) → empty (0 tiles)
- `confidence_proofs` → doesn't exist (prior audit finding)

**🟡 Room naming inconsistency.** Status reports underscores (`shell_system`), ARCHITECTURE uses hyphens (`fleet-registry`). The PLATO spec says hyphens.

### What a New Developer Experiences

```python
from plato_sdk import PlatoClient
client = PlatoClient("http://localhost:8847")
client.rooms()       # ✅ WORKS — returns 8 rooms
client.room("coordination-history")  # ✅ WORKS — returns tiles
client.status()      # ❌ FAILS — calls GET / which returns 404
client.submit(...)   # ❌ FAILS — write endpoint not implemented
client.search("constraint")  # ❌ FAILS — search route returns 404
```

The SDK installs and connects, but every method except `rooms()` and `room()` will error. A new developer following the "Path A" example in ARCHITECTURE.md gets:
```python
rooms = client.list_rooms()  # ❌ AttributeError — method doesn't exist
```

---

## 2. Keeper (`localhost:8900`)

### Response: YES — clean, well-designed API

```
curl http://localhost:8900/status
→ {"status": "active", "service": "keeper-v2", "agents_registered": 4, ...}
```

### What Works

- `/status` — Returns full service health: 4 registered agents, 3 pools, 1 mailbox
- `/` — Clean endpoint listing (self-documenting API)
- `/agents` — Lists all 4 agents with capabilities, trust scores, load, last_seen
- `/agents/active` — Returns array (empty = no active agents)
- `/stats` — Registry, discovery, routing stats
- `/discover?capability=coordination` — Capability-based discovery (empty because no agents active)
- `/proximity?capability=plato` — Proximity routing (empty)
- `/bottles/inbox` — Mailbox check (0 unread)

### Registered Agents

| Agent | Capabilities | Status |
|-------|-------------|--------|
| oracle1 | coordination, plato, publishing, research, crates | offline |
| test-probe | testing, probe | offline |
| unknown | (none) | offline |
| test-agent-2 | (none) | offline |

**🟡 All agents are offline.** The `last_seen` timestamps suggest they haven't heartbeated since approximately 2026-05-01 (~16 days ago). Oracle1 is the main coordinator and is offline.

**🟡 `/bottles/pool?pool=default` returns "pool not found".** The status says 3 pools but none accessible by name.

### What a New Developer Experiences

The Keeper is the best developer experience of the fleet. It:
- Returns JSON with clear fields
- Has a self-documenting root endpoint
- Uses consistent naming
- Has capability-based discovery

The only pain point: **all agents are offline** so `discover`, `proximity`, `match`, and `agents/active` all return empty. A new developer trying to discover fleet agents gets zero results, which looks broken even though it's correct.

---

## 3. Fleet MUD (`localhost:7777` — Telnet)

### Response: YES — fully functional text MUD

```
telnet localhost 7777
→ ASCII art: "Cocapn Fleet MUD"
→ Welcome to the Fleet MUD. What's your name, agent?
```

### What It Offers
- 16 rooms: Harbor, Bridge, Forge, Lighthouse, Ten Forward (tavern), Dojo, Barracks, Workshop, Archives, Garden, Dry Dock, Observatory, Court, Horizon, Current, Reef
- Items (rusty compass in harbor)
- NPCs (Harbor Master)
- Commands: look, move (north/south/east/west/up/down), say, who, help, quit
- Telnet protocol (NOT HTTP — `curl` returns nothing)

### What a New Developer Experiences

The MUD is genuinely cool — a maritime-themed interactive environment. Connecting via `nc localhost 7777` or `telnet localhost 7777` gives an immediate, recognizable experience. The ASCII art header is a nice touch.

**But:** ARCHITECTURE.md doesn't mention the MUD at all. A developer reading the docs won't know it exists. The holodeck README mentions `telnet localhost 7778` but not 7777.

---

## 4. Holodeck (`localhost:7778` — Telnet)

### Response: YES — running, but protocol mismatch for HTTP testers

```
telnet localhost 7778
→ "Holodeck Rust v0.3"
→ Welcome to the Holodeck. Rooms are live systems.
→ What's your vessel name?
```

### What It Offers
- Rust v0.3 MUD server — production quality
- Rooms with gauges, exits, data sources (REAL/SIM)
- Scoped communication: say/tell/yell/gossip/note/mail
- Combat engine with script evolution
- Living manuals (improve across generations)
- Permission system (Greenhorn → Architect)
- AI-driven NPCs with sentiment awareness
- Poker game
- PLATO bridge (writes tiles to `/tmp/plato-tiles`)
- Node-based room graph
- NPC refresh system

### What's Broken or Confusing

**🔴 HTTP requests to 7778 fail silently.** The binary is a telnet server, not HTTP. `curl http://localhost:7778/` returns nothing and HTTP code 000 (connection accepted but protocol mismatch). The README says `telnet localhost 7778` — so this is technically correct — but any developer trying HTTP first (as they would with all other services) gets a silent failure.

**🟡 No log file.** `holodeck.log` doesn't exist. If something goes wrong, there's no way to debug without checking stdout.

**🟡 Suspicious connection observed.** During testing, a connection from `CONNECT proxy2.proxiesfood.com:4` was visible in the harbor room — likely a scanner hitting the open port.

---

## 5. Adaptive MUD (`localhost:8850` — HTTP)

### Response: YES — lightweight HTTP middleware

```
curl http://localhost:8850/
→ {"service": "Adaptive MUD v1.0", "endpoints": ["/status", "/adapt", "/record"]}
```

### What It Offers
- Tracks per-agent engagement metrics (time, depth, quality)
- Adjusts difficulty/hints/progression dynamically
- 0 active agents currently
- Middleware between Crab Trap (:4042) and MUD agents

### What a New Developer Experiences

Not documented anywhere in ARCHITECTURE.md. Learning about it requires either:
- Knowing to check `/proc` for listening services
- Finding the source code in `fleet/services/`

---

## 6. fleet.cocapn.ai (External API — Public)

### Response: DEAD — confirms prior audit findings

```
curl -k https://fleet.cocapn.ai/
→ 404 page not found
curl -k https://fleet.cocapn.ai/api/ping
→ 404 page not found
curl -k https://fleet.cocapn.ai/health
→ 404 page not found
```

- Server at <BOAT_IP>:443 accepts connections but routes nothing
- Self-signed SSL certificate (`-k` required)
- All paths return 404

**This is unchanged from the 2026-05-17 onboarding flow audit.** Every "Try It" prompt on superinstance.ai depends on this endpoint. None work.

---

## 7. superinstance.ai (Public Website)

### Findings

- **The site loads** — the crab story, "Try It — 3 Seconds" section, and feature descriptions are all present
- **The "Try It" section still references broken endpoints** — `fleet.cocapn.ai/api/plato/room/*` (all 404)
- **No mention of local services** — the site tells you to curl fleet.cocapn.ai, but the only working services are on localhost
- **No quick start path** — a visitor hitting "Try It" goes from impressed → 404 → bounce

---

## Cross-Cutting Issues

### 1. Documentation/Services Mismatch

| What ARCHITECTURE.md Says | What Actually Exists |
|---------------------------|---------------------|
| Room `fleet-registry` | Room doesn't exist (0 tiles) |
| Room `oracle1-history` | Room doesn't exist (0 tiles) |
| Room `fleet-math` | Room doesn't exist (0 tiles) |
| Room `committee-room` | Room doesn't exist (0 tiles) |
| `fleet-stack` one-command deploy | Repo exists on GitHub, not cloned locally |
| Agent-to-agent protocols (A2A, Bottle) | Protocols defined, not running |
| MUD server (holodeck) mentioned | Yes — at :7778 telnet (not :7777 as one might assume) |
| Adaptive MUD | Not mentioned at all |
| All agents active | All 4 registered agents offline for 16 days |

### 2. Protocol Inconsistency

- Keeper and PLATO: HTTP/REST (well-documented, self-describing)
- Fleet MUD: telnet (not mentioned in ARCHITECTURE)
- Holodeck: telnet (mentioned, but HTTP testers fail silently)
- Adaptive MUD: HTTP (not mentioned anywhere)
- fleet.cocapn.ai: HTTPS (completely dead)

For a new developer: you need at least 3 different connection tools (curl/wget, nc/telnet) to experience all services.

### 3. PLATO Server Quirks

The PLATO server has fundamental API issues:
- `/history` route returns empty where `/room/{name}` works
- No write endpoint despite SDK having `submit()` method
- No search despite SDK having `search()` method
- Server root returns 404 but SDK's `status()` calls it

### 4. Holodeck Operates Silently

The Rust binary runs without visible output. No logs. No health endpoint. No way to tell if it's working except connecting via telnet and interacting.

### 5. No External Path

The entire fleet stack is localhost-only. The only public endpoint (`fleet.cocapn.ai`) returns 404. A developer outside this machine cannot:
- Test PLATO reads/writes
- Join the fleet MUD
- Register an agent with the Keeper
- Use the holodeck
- Submit tiles

---

## Recommendations

### Critical (Blocking for External Devs)
1. **Fix fleet.cocapn.ai** — Route traffic from the public domain to the local PLATO/Keeper services
2. **Get proper SSL cert** — Let's Encrypt for fleet.cocapn.ai
3. **Re-activate or re-announce agents** — 16 days offline makes discovery return empty
4. **Fix PLATO /history route** — The route mismatch means documented API patterns fail

### Important
5. **Add MUD to ARCHITECTURE.md** — The Fleet MUD at :7777 is one of the best onboarding tools, but it's undocumented
6. **Add adaptive MUD to docs** — Port :8850 is undocumented middleware
7. **Fix PLATO POST endpoint** — Without write capability, the fleet is read-only
8. **Add holodeck logging** — Silence makes debugging impossible
9. **Align documented rooms with actual rooms** — Update ARCHITECTURE.md to reflect the 8 real rooms

### Nice-to-Have
10. **Holodeck HTTP health endpoint** — Even a `/ping` that returns "pong" via raw TCP would help
11. **PLATO root response** — Return a status response from `/` instead of 404 to fix SDK compatibility
12. **Create sandbox room at public endpoint** — Let external developers write to a public room
13. **Mention nc/telnet for MUD** — The ARCHITECTURE docs assume HTTP/REST only

---

## What Actually Works (Honest Assessment)

| Feature | Status | Notes |
|---------|--------|-------|
| PLATO server is running | ✅ | 2063 tiles, 8 rooms, auto-rejecting duplicates |
| PLATO tile reading | ✅ | `/room/{name}` returns tiles with metadata |
| PLATO room listing | ✅ | `/rooms` and `/status` give clean listings |
| Keeper v2 | ✅ | Clean API, self-documenting, capability routing |
| Fleet MUD | ✅ | 16 rooms, items, NPCs, rich maritime world |
| Holodeck Rust | ✅ | AI NPCs, combat, poker, PLATO bridge |
| Adaptive MUD | ✅ | Engagement tracking, difficulty adjustment |
| plato-sdk (connection) | ✅ | Installs and connects |
| superinstance.ai website | ✅ | Content loads, brand is coherent |
| GitHub repos | ✅ | 1,646 repos, active CI, published packages |

## Summary

The fleet has real, running services. A developer on this machine can:
- Read knowledge tiles from PLATO
- Discover agents via the Keeper
- Explore a 16-room MUD
- Experience the advanced holodeck environment
- Check engagement metrics via adaptive MUD

But from outside this machine, the entire stack is invisible. The public endpoint at fleet.cocapn.ai returns 404 on every path. Documentation describes rooms that don't exist and protocols that aren't running.

**The core question is: is this fleet meant to be publicly accessible, or just internal infrastructure?** If public, fleet.cocapn.ai is the single most critical fix. If internal, the docs should be clear about what's local-only vs. public.
