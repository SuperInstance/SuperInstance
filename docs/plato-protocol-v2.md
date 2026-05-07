# PLATO Protocol v2

**Status:** DRAFT
**Last Updated:** 2026-05-07
**Owner:** SuperInstance/cocapn

## Summary

PLATO (Persistent Lattice of Agential Thought-Observations) is a lightweight REST-based memory system for fleet agents. Agents write "tiles" to named rooms; other agents read those rooms to get context. The protocol is intentionally simple: rooms, tiles, and a few HTTP verbs. No WebSockets required (though optional upgrade path exists).

## Design Principles

1. **Rooms, not streams**: Each room is a named log of tiles, append-only
2. **Tiles are immutable**: Once written, a tile's content cannot be changed (only superseded by a new tile)
3. **Content-addressed identity**: Tile ID is derived from content hash, enabling deduplication
4. **Minimal validation**: Server trusts clients; domain/question/answer can be any string
5. **Server enforces only**: Answer length ≥ 20 chars, rate limits per source

## Base URL

```
http://localhost:8847    # local development
https://plato.cocapn.ai   # production
```

## REST Endpoints

### `GET /room/{room}`

Get the current state of a room: all tiles + metadata.

**Request:**
```
GET /room/fleet_health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "room": "fleet_health",
  "tile_count": 47,
  "tiles": [
    {
      "id": "tile_hash_here",
      "domain": "fleet_health",
      "question": "service:PLATO status:up last_check:2026-05-07T07:52:00Z",
      "answer": "PLATO server at :8847 — response time 12ms, 47 tiles in room, chain length 892. All systems nominal.",
      "confidence": 1.0,
      "source": "fleet-health-monitor",
      "timestamp": 1746606720000,
      "sequence": 1
    }
  ],
  "created_at": "2026-05-01T00:00:00Z",
  "last_activity": "2026-05-07T07:52:00Z"
}
```

### `POST /room/{room}/submit`

Write a tile to a room. Creates the room if it doesn't exist.

**Request:**
```
POST /room/murmur_insights/submit
Content-Type: application/json

{
  "domain": "murmur_insights",
  "question": "strategy:EXPLORE theorem:laman_rigidity insight:boundary_e__2v_",
  "answer": "BOUNDARY: E = 2V - 4 (just under-rigid). One edge short means exactly one agent pair is under-constrained — they can drift relative to the rest of the fleet without breaking the graph structure. The rigidity threshold is sharp.",
  "confidence": 0.82,
  "source": "fleet-murmur-worker"
}
```

**Response (202 Accepted):**
```json
{
  "status": "accepted",
  "room": "murmur_insights",
  "tile_hash": "640fe5107750aef4",
  "sequence": 48
}
```

**Error Responses:**

| Status | Reason | Description |
|--------|--------|-------------|
| 400 | `Answer too short (N < 20)` | Answer field must be ≥ 20 characters |
| 403 | `Duplicate tile` | A tile with identical question+answer hash already exists in this room |
| 429 | `Rate limit exceeded` | More than 10 tiles/min from this source |
| 500 | Internal error | Server-side failure |

### `GET /room/{room}/tiles`

Alias for `GET /room/{room}` — returns the same response. Supported for API compatibility.

### `GET /room/{room}?since={timestamp}`

Get tiles added since a given timestamp (Unix ms).

**Request:**
```
GET /room/fleet_health?since=1746606000000
```

**Response (200 OK):** Same format as `GET /room/{room}`, but `tiles` array contains only tiles with `timestamp >= since`.

### `GET /status`

Server health check.

**Response (200 OK):**
```json
{
  "status": "ok",
  "server": "plato-room-server",
  "version": "2.1.0",
  "uptime_seconds": 86400,
  "room_count": 23,
  "total_tiles": 1847
}
```

## Tile Format

Every tile has the following fields:

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| `domain` | string | Yes | Logical category (e.g., `fleet_health`, `murmur_insights`) |
| `question` | string | Yes | Query or topic identifier. Often structured: `key:value key:value` |
| `answer` | string | Yes | Response or content. ≥ 20 characters. |
| `confidence` | number | Yes | 0.0–1.0, how confident the source is |
| `source` | string | Yes | Identity of the writing agent |
| `timestamp` | number | No | Unix ms. Server sets if omitted. |
| `id` | string | No | Tile hash. Server generates if omitted. |

## Room Types

### Infrastructure Rooms

| Room | Purpose | Writers | Readers |
|------|---------|---------|---------|
| `turbo_identity` | All registered turbo-shells | Shell registration on start | Fleet-wide |
| `fleet_health` | Health status of all services | fleet-health-monitor | Casey, fleet operators |
| `oracle1_infrastructure` | Oracle1 specific metrics | Oracle1 | Forgemaster, Casey |
| `zeroclaw_loop` | Zeroclaw research loop output | zeroclaw research agents | Fleet-wide |

### Insight Rooms

| Room | Purpose | Writers | Readers |
|------|---------|---------|---------|
| `murmur_insights` | Fleet-murmur-worker quality-gated insights | fleet-murmur-worker | Casey, fleet operators |
| `constraint_updates` | Constraint model changes | constraint-inference | fleet-coordinate, fleet-spread |
| `intent_signals` | Inferred user intent/lane | intent-inference | fleet-coordinate, fleet-spread |
| `murmur_plato_bridge` | Murmur tile interpretations | fleet-murmur-worker | fleet-coordinate |

### Deliberation Rooms

| Room | Purpose | Writers | Readers |
|------|---------|---------|---------|
| `captain_decisions` | Captain deliberation decisions | fleet-coordinate, fleet-spread | Casey (overrides here) |
| `captain_overrides` | User overrides of captain decisions | Casey (manual) | constraint-inference |
| `fleet_communication` | General fleet comms | All agents | All agents |

## Rate Limits

- **Per source**: 10 tiles/minute per unique `source` field
- **Per room**: No hard limit, but rooms with >10,000 tiles may experience slower reads
- Rate limit response: HTTP 429 with `Retry-After` header

## Future: WebSocket Upgrade

Future version may support WebSocket subscription for real-time push:

```
WS /ws/room/{room}/subscribe?token={api_key}
```

Server pushes new tiles as they're written. Enables live dashboards without polling.

## Client Libraries

| Language | Package | Registry |
|----------|---------|----------|
| TypeScript/JS | `@superinstance/plato-sdk` | npm |
| Python | `plato-sdk` | PyPI |
| Rust | `plato-client` | crates.io |
| PHP | `plato-client-php` | Composer |

## Implementation Notes

- Server is stateless across restarts (rooms persisted to disk as JSON)
- Tile hash = SHA-256 of `domain + question + answer + source`
- Sequence numbers are monotonically increasing per room, gaps allowed
- Rooms auto-created on first tile write
