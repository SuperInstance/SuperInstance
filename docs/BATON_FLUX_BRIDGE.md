# Baton ↔ FLUX Bridge — Architecture Specification

> Merging Oracle2's Loom fleet with the SuperInstance fleet via a protocol bridge on `fleet-edge-worker`.
> **Status:** DRAFT · **Priority:** P1 · **Created:** 2026-06-13

---

## 1. Overview

The Loom fleet (Oracle2, ESP32/Pi/Jetson-edge) and the SuperInstance fleet (Cloudflare Workers, cloud-native) speak different protocols. This bridge lets them talk.

```
 ┌──────────────┐                     ┌──────────────────────┐
 │  LOOM FLEET  │                     │  SUPERINSTANCE FLEET │
 │              │                     │                      │
 │  Oracle2     │    BATON ──────▶    │  fleet-edge-worker   │
 │  ESP32       │    ◀────── BOTTLE   │  (bridge endpoint)   │
 │  Pi          │                     │                      │
 │  Jetson      │                     │  forgemaster         │
 │              │                     │  fleet-midi          │
 │  Git-bus     │                     │  construct           │
 │  Baton I2I   │                     │  ...7 agents         │
 └──────────────┘                     └──────────────────────┘
```

---

## 2. Message Format Translation

### 2.1 Baton (Loom format)

Git-committed JSON pushed to shared inter-agent repos:

```json
{
  "batonId": "bt-20260613-001",
  "from": "oracle2",
  "to": "forgemaster",
  "type": "SPLINE | SIGNAL | QUERY | DIRECTIVE",
  "payload": {
    "content": "...",
    "spline": { "concept": "resonance", "weight": 0.87, "lineage": ["esp32-3", "pi-1"] },
    "data": {}
  },
  "lineage": ["esp32-sensor-array", "pi-aggregator", "oracle2"],
  "trust": { "level": "trust", "score": 0.82 },
  "timestamp": "2026-06-13T18:12:00Z",
  "originShell": "jetson",
  "commitSha": "a1b2c3d"
}
```

### 2.2 Bottle (FLUX format)

Async message envelope used inside SuperInstance fleet:

```json
{
  "id": "uuid-v4",
  "timestamp": 1718314320000,
  "source": "oracle2",
  "target": "forgemaster",
  "action": "forge_build",
  "payload": { "...": "..." },
  "status": "outgoing",
  "ttl": 3600,
  "meta": { "gamma": 0.82, "eta": 0.18, "originShell": "jetson", "batonId": "bt-20260613-001" }
}
```

### 2.3 Translation Matrix

| Baton Field     | Bottle Field        | Transform                                         |
|-----------------|---------------------|---------------------------------------------------|
| `batonId`       | `meta.batonId`      | Preserved for audit trail                         |
| `from`          | `source`            | Direct map                                        |
| `to`            | `target`            | Direct map (validate against AGENT_PORTS)         |
| `type`          | `action`            | See type map below                                |
| `payload`       | `payload`           | Unwrapped; spline extracted to meta               |
| `payload.spline`| `meta.spline`       | Lifted to meta for conservation scoring           |
| `trust.score`   | `meta.gamma`        | γ = trust score (information quality)             |
| `1 - trust.score` | `meta.eta`        | η = entropy/uncertainty cost                      |
| `originShell`   | `meta.originShell`  | Preserved for multi-shell routing                 |
| `timestamp`     | `timestamp`         | ISO 8601 → epoch ms                               |
| `lineage`       | `meta.lineage`      | Preserved for audit                               |
| `commitSha`     | `meta.commitSha`    | Git provenance tracking                           |
| — (generated)   | `id`                | `crypto.randomUUID()`                             |
| — (generated)   | `status`            | `"outgoing"`                                      |
| — (default)     | `ttl`               | 3600s, override via `payload.ttl`                 |

### 2.4 Baton Type → Bottle Action Map

| Baton Type    | Bottle Action Prefix    | Routing Pattern                    |
|---------------|-------------------------|------------------------------------|
| `SPLINE`      | `spline_` + concept     | → concept-cluster-aware agent      |
| `SIGNAL`      | `signal_` + topic       | → construct (coordinator)          |
| `QUERY`       | `query_` + subject      | → smart-dispatch vector routing    |
| `DIRECTIVE`   | `directive_` + command  | → targeted agent (explicit `to`)   |

---

## 3. Endpoint Design

### `POST /baton` — Bridge Ingress

Added to `fleet-edge-worker` router. Receives raw baton JSON, translates, gates, routes.

```
POST /baton
Content-Type: application/json
X-Baton-Source: oracle2  (optional, validated against `from` field)

Request Body: Baton JSON
```

**Processing pipeline:**

```
1. Parse → validate structure
2. Trust gate → check trust.level against Ternary-Trust policy
3. Translate → baton fields → bottle fields
4. Score → assign γ/η conservation metrics
5. Route → determine shell target + fleet agent
6. Persist → KV (inbox) + R2 (durable log)
7. Respond → bottle confirmation with routing info
```

**Response:**

```json
{
  "ok": true,
  "bottleId": "uuid",
  "batonId": "bt-20260613-001",
  "routedTo": "forgemaster",
  "shellTarget": "cloud",
  "gamma": 0.82,
  "eta": 0.18,
  "conservationCheck": "PASS"
}
```

### `POST /baton/response` — Return Path

When a fleet agent's response needs to go back to a Loom agent, the bridge translates bottle → baton and stages it for git-commit back to the shared repo.

---

## 4. Spline → Concept Vector Mapping

Splines are Loom's distilled insight vectors. We map them to our 12 concept clusters.

### 4.1 The 12 Concept Clusters

| # | Cluster         | Keywords                                    | Default Agent        |
|---|-----------------|---------------------------------------------|----------------------|
| 0 | resonance       | harmonic, frequency, vibration, wave        | fleet-midi           |
| 1 | structure       | form, architecture, scaffold, framework     | forgemaster          |
| 2 | temporal        | rhythm, timing, sequence, schedule          | fleet-conductor      |
| 3 | identity        | persona, voice, character, profile          | persona-engine       |
| 4 | variation       | mutation, evolve, diversify, branch         | ghost-track          |
| 5 | inference       | predict, infer, oracle, forecast            | oracle2              |
| 6 | coordination    | dispatch, route, coordinate, orchestrate    | construct            |
| 7 | conservation    | gamma, eta, invariant, balance, law         | construct            |
| 8 | spatial         | voxel, geometry, mesh, field                | construct            |
| 9 | spectral        | hodge, laplacian, eigen, decompose          | construct            |
| 10| linguistic      | language, text, parse, generate             | forgemaster          |
| 11| sensory         | audio, midi, signal, capture                | fleet-midi           |

### 4.2 Spline Resolution Algorithm

```
Input: spline.concept (string), spline.weight (float 0-1)

1. Normalize concept: lowercase, strip non-alphanumeric
2. Exact match against cluster keywords → cluster ID
3. If no exact match, fall back to semantic similarity via Vectorize
   (embed concept string, query fleet-crates index, map nearest crate → cluster)
4. If still unmatched → default to cluster 6 (coordination)
5. Override routing if baton `to` field names a specific agent
```

### 4.3 Spline → Bottle Payload Enrichment

When a spline is present, the translated bottle's payload is enriched:

```json
{
  "content": "<original baton payload content>",
  "conceptCluster": 1,
  "conceptName": "structure",
  "splineWeight": 0.87,
  "lineage": ["esp32-sensor-array", "pi-aggregator", "oracle2"]
}
```

---

## 5. Trust Gating — Ternary-Trust

### 5.1 Trust Levels

| Level       | Numeric Range  | Behavior                                          |
|-------------|----------------|---------------------------------------------------|
| `distrust`  | score < 0.3    | **REJECT.** Bottle dropped. Incident logged.      |
| `silent`    | 0.3 ≤ s < 0.6  | **QUARANTINE.** Stored but not delivered. Flags set for review. |
| `trust`     | score ≥ 0.6    | **ACCEPT.** Translated, routed, delivered.        |

### 5.2 Trust Score Computation

The baton's `trust.score` is the starting point. The bridge adjusts it:

```
adjustedScore = baton.trust.score
              + lineageBonus    // +0.05 per known agent in lineage (max +0.15)
              + commitBonus     // +0.03 if commitSha verifies
              - freshnessPenalty // -0.02 per hour stale (max -0.10)
              - anomalyPenalty   // -0.20 if payload schema unexpected
```

Clamped to `[0.0, 1.0]`.

### 5.3 Agent-Specific Trust Thresholds

Some agents are higher-stakes. The bridge supports per-agent overrides:

```typescript
const TRUST_THRESHOLDS: Record<string, { distrust: number; silent: number }> = {
  'forgemaster':     { distrust: 0.25, silent: 0.55 },  // build system — stricter
  'construct':       { distrust: 0.20, silent: 0.45 },  // coordinator — moderate
  'fleet-conductor': { distrust: 0.30, silent: 0.60 },  // scheduling — strictest
  '_default':        { distrust: 0.30, silent: 0.55 },
};
```

---

## 6. Conservation Audit — γ/η Scoring

Every bridged message gets conservation metrics. **γ + η = C** (constant, nominally 1.0).

### 6.1 γ (Gamma) — Information Quality

Measures how much useful signal survives the translation:

```
γ = trustScore × payloadIntegrity × routingConfidence

payloadIntegrity = 1.0 if all expected fields present
                   0.7 if optional fields missing
                   0.4 if payload.data is null/empty

routingConfidence = 1.0 for explicit `to` agent
                    0.8 for spline-matched agent
                    0.5 for fallback-to-construct
```

### 6.2 η (Eta) — Entropy Cost

Measures information loss / uncertainty introduced:

```
η = 1.0 - γ
```

Or, computed independently:

```
η = translationLoss + routingUncertainty + freshnessDecay
```

### 6.3 Audit Trail

Every bridged message logs:

```json
{
  "batonId": "bt-20260613-001",
  "bottleId": "uuid",
  "gamma": 0.82,
  "eta": 0.18,
  "conservationConstant": 1.0,
  "check": "PASS",        // PASS if γ + η ≤ C + ε (ε = 0.01)
  "timestamp": 1718314320000
}
```

Stored in KV at `audit:baton:{batonId}` and in R2 durable log.

---

## 7. Multi-Shell Routing

### 7.1 Shell Hierarchy

```
ESP32  →  Pi  →  Jetson  →  Cloud (fleet-edge-worker)
  ↑                                      |
  └──────────── response ────────────────┘
```

Messages flow upstream (toward Cloud) and responses flow downstream.

### 7.2 Shell Target Resolution

| Condition                                           | Shell Target | Rationale                              |
|-----------------------------------------------------|--------------|----------------------------------------|
| `originShell == "esp32"` AND `type == "SIGNAL"`     | `cloud`      | Raw sensor data → cloud processing     |
| `originShell == "esp32"` AND `type == "SPLINE"`     | `pi`         | Pre-distilled → Pi aggregation         |
| `originShell == "pi"` AND `type == "SPLINE"`        | `jetson`     | Mid-level → Jetson inference           |
| `originShell == "jetson"` AND `type == "SPLINE"`    | `cloud`      | High-level insight → fleet dispatch    |
| `type == "QUERY"`                                   | `cloud`      | Queries need full fleet + vectorize    |
| `type == "DIRECTIVE"`                               | `cloud`      | Directives always reach fleet           |
| Response bottle target outside fleet                | `downstream` | Route back toward origin shell          |

### 7.3 Shell Latency Budgets

| Shell    | Max Latency | TTL    |
|----------|-------------|--------|
| ESP32    | 50ms        | 300s   |
| Pi       | 200ms       | 600s   |
| Jetson   | 500ms       | 1800s  |
| Cloud    | 2000ms      | 3600s  |

The bridge sets `bottle.ttl` based on the resolved shell target.

---

## 8. Worked Example

### Scenario

Oracle2 (on Jetson shell) sends a SPLINE baton about "resonance structure" to our fleet. It should reach `forgemaster` with full audit trail.

### Step 1: Baton Arrives

```
POST /baton
{
  "batonId": "bt-20260613-001",
  "from": "oracle2",
  "to": "forgemaster",
  "type": "SPLINE",
  "payload": {
    "content": "Harmonic resonance pattern detected in sensor array 3. Suggest structural reinforcement at node coordinates [12, 47].",
    "spline": {
      "concept": "resonance",
      "weight": 0.87,
      "lineage": ["esp32-sensor-array-3", "pi-aggregator-1", "oracle2"]
    },
    "data": {
      "harmonicFreq": 432.0,
      "nodeCoords": [12, 47],
      "confidence": 0.91
    }
  },
  "lineage": ["esp32-sensor-array-3", "pi-aggregator-1", "oracle2"],
  "trust": { "level": "trust", "score": 0.82 },
  "timestamp": "2026-06-13T18:12:00Z",
  "originShell": "jetson",
  "commitSha": "a1b2c3d"
}
```

### Step 2: Trust Gate

```
baton.trust.score = 0.82
lineageBonus     = +0.10  (two known agents in lineage)
commitBonus      = +0.03  (commitSha present)
freshnessPenalty = -0.00  (just arrived)
anomalyPenalty   = -0.00  (schema valid)
─────────────────────────
adjustedScore    = 0.95   → trust ✓
```

### Step 3: Translate to Bottle

```json
{
  "id": "b7e3f4a1-...",
  "timestamp": 1718314320000,
  "source": "oracle2",
  "target": "forgemaster",
  "action": "spline_resonance",
  "payload": {
    "content": "Harmonic resonance pattern detected in sensor array 3...",
    "conceptCluster": 0,
    "conceptName": "resonance",
    "splineWeight": 0.87,
    "data": { "harmonicFreq": 432.0, "nodeCoords": [12, 47], "confidence": 0.91 },
    "lineage": ["esp32-sensor-array-3", "pi-aggregator-1", "oracle2"]
  },
  "status": "outgoing",
  "ttl": 3600,
  "meta": {
    "gamma": 0.95,
    "eta": 0.05,
    "originShell": "jetson",
    "batonId": "bt-20260613-001",
    "commitSha": "a1b2c3d",
    "spline": { "concept": "resonance", "weight": 0.87 }
  }
}
```

### Step 4: Shell Routing

```
originShell = jetson
type        = SPLINE
→ Shell Target: cloud  (Jetson SPLINE → cloud dispatch)
→ Fleet Agent: forgemaster (explicit `to` field)
```

### Step 5: Persist + Deliver

```
KV:  bottle:forgemaster:b7e3f4a1-...  → Bottle JSON (TTL 3600s)
KV:  inbox:forgemaster                 → [..., "b7e3f4a1-..."]
KV:  audit:baton:bt-20260613-001       → Audit record
R2:  baton-bridge/2026-06-13/b7e3f4a1-...json  → Full durable log
```

### Step 6: Response

```json
{
  "ok": true,
  "bottleId": "b7e3f4a1-...",
  "batonId": "bt-20260613-001",
  "routedTo": "forgemaster",
  "shellTarget": "cloud",
  "gamma": 0.95,
  "eta": 0.05,
  "conservationCheck": "PASS",
  "conceptCluster": 0,
  "conceptName": "resonance"
}
```

### Step 7: Response Path (forgemaster → oracle2)

When forgemaster completes the build task, it creates a response bottle:

```json
{
  "id": "resp-uuid",
  "timestamp": 1718314420000,
  "source": "forgemaster",
  "target": "oracle2",
  "action": "spline_resonance_response",
  "payload": { "status": "reinforced", "nodeCoords": [12, 47] },
  "status": "outgoing",
  "ttl": 3600,
  "meta": { "gamma": 0.88, "eta": 0.12, "respondsTo": "bt-20260613-001" }
}
```

The bridge translates this back to a baton and stages it for git-commit to the shared Loom repo, addressed to oracle2 with the original lineage reversed.

---

## 9. Error Handling

| Error                    | Behavior                                              |
|--------------------------|-------------------------------------------------------|
| Malformed baton JSON     | 400 response, no KV/R2 writes, incident logged         |
| Unknown `to` agent       | 404 response, suggestion of valid agents               |
| Trust gate → distrust    | 403 response, baton rejected, incident at `security:baton:{id}` |
| Trust gate → silent      | 202 response, quarantined at `quarantine:baton:{id}`   |
| Conservation violation   | 500 response, γ+η > C+ε, flagged for review            |
| Shell routing conflict   | Falls back to `cloud` → `construct`                    |
| R2 unavailable           | Continue with KV only (degraded, logged)               |

---

## 10. Implementation Reference

See: `/home/phoenix/repos/fleet-edge-worker/src/baton-bridge.ts`

Integration in `worker.ts`:

```typescript
// In router dispatch:
if (path === '/baton' && request.method === 'POST') {
  return await handleBatonRequest(request, env, corsHeaders);
}
if (path === '/baton/response' && request.method === 'POST') {
  return await handleBatonResponse(request, env, corsHeaders);
}
```

The bridge module is self-contained: types, translators, validators, router, and audit logic in one file, matching the existing worker patterns.
