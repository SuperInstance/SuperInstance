# Reverse-Actualization Truck

**Status:** DRAFT
**Last Updated:** 2026-05-07
**Owner:** SuperInstance/cocapn

## Summary

The **reverse-actualization truck** is the ambient intelligence layer — the system that works continuously in the background while Casey is away, generating insights, monitoring fleet health, inferring constraints and intent, and preparing "12 things happened while you were away" briefings. Like a truckin' song: the fleet keeps moving, keeps working, keeps producing value — without requiring Casey's constant attention.

The name inverts "self-actualization": instead of the system realizing itself, the system realizes the **user's productive lane** by watching what they override, inferring what they want, and pre-positioning work along that vector.

## Core Insight

Most agent systems wait for user input. The reverse-actualization truck **works while user is absent**, then presents the output as a briefing when the user returns. The metaphor is a research team that keeps working between your check-in meetings — you come back and things are done.

## Principles

1. **User steers, assistant drives**: Casey sets direction; the truck executes autonomously
2. **Visibility without interruption**: Work is logged to PLATO, visible to fleet, not spamming Casey
3. **Briefing, not stream**: When Casey returns, he gets a curated "what happened" — not raw logs
4. **Self-healing**: Components restart themselves; Casey is escalation, not day-to-day operator
5. **Keep on truckin'**: The fleet works through overnight, through travel, through focus on other things

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              REVERSE-ACTUALIZATION TRUCK                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Murmur      │  │  Constraint  │  │  Intent      │  │
│  │  Worker      │  │  Inference   │  │  Inference   │  │
│  │              │  │              │  │              │  │
│  │  5 strategies│  │  Override    │  │  Behavior    │  │
│  │  × 5 theorems│  │  patterns    │  │  signals     │  │
│  │  = insights  │  │  → new       │  │  → productive│  │
│  │              │  │  constraints │  │  lane        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         v                 v                 v          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              PLATO (Fleet Memory)                 │  │
│  │  murmur_insights │ constraint_updates │ intent    │  │
│  │  signals │ fleet_health │ captain_decisions       │  │
│  └──────────────────────────────────────────────────┘  │
│         │                 │                 │          │
│         v                 v                 v          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Quality     │  │  Fleet       │  │  Ambient     │  │
│  │  Gate        │  │  Health      │  │  Research    │  │
│  │  Stream      │  │  Monitor     │  │  Loop        │  │
│  │              │  │              │  │              │  │
│  │ novelty ×    │  │ Self-heals  │  │ Idle detect  │  │
│  │ correctness × │  │ Alerts Casey│  │ → fleet works│  │
│  │ completeness ×│  │ PLATO logs  │  │ → briefing   │  │
│  │ depth ≥ 0.35  │  │             │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Fleet Murmur Worker

**Purpose:** Always thinking. 5 strategies × 5 theorems always running.

**Strategies:**
- **EXPLORE**: Non-obvious implications and boundary conditions
- **CONNECT**: What two theorems share and how they reinforce
- **CONTRADICT**: Counterexamples and edge cases where theorems fail
- **SYNTHESIZE**: Unifying principles across theorems
- **QUESTION**: Open problems and research directions

**Theorems:**
- Laman Rigidity (E = 2V − 3)
- H¹ Emergence Detection (β₁ = E − V + C)
- Zero-Holonomy Consensus (ZHC)
- Pythagorean48 Trust Encoding
- Trust Convergence

**PLATO:**
- Reads from: `captain_decisions`, `constraint_updates`
- Writes to: `murmur_insights`

**Quality Gate:** novelty × correctness × completeness × depth ≥ 0.35

### 2. Constraint Inference Engine

**Purpose:** Reverse-engineers constraint parameters from user override behavior.

**How it works:**
1. Track overrides: when Casey overrides captain's decision, log the delta
2. Pattern analysis: after 3+ overrides with same direction → infer constraint
3. Update model: tighten or loosen the inferred parameter
4. Re-deliberate: re-run captain with updated constraints
5. Alert: "Emergence threshold tightened based on your last 3 overrides. Re-deliberating."

**Inferred constraints:**
- `emergence_beta_threshold`: when does β₁ trigger emergence?
- `safety_margin`: how much spare capacity before acting?
- `trust_min`: minimum trust before accepting a peer's information
- `action_confidence_min`: confidence threshold for autonomous action

**PLATO:**
- Reads from: `captain_overrides`, `captain_decisions`
- Writes to: `constraint_updates`

### 3. Intent Inference Engine

**Purpose:** Reverse-engineers Casey's productive lane from behavior signals.

**Behavior signals tracked:**
- Which PLATO rooms Casey reads
- Which captain decisions Casey overrides
- Which insights Casey engages with
- Navigation patterns on cocapn.ai
- Time-of-day patterns

**Output:** `ProductiveLane`
```typescript
interface ProductiveLane {
  primary_goals: string[];         // What Casey is focused on
  avoided_topics: string[];       // What Casey ignores/pushes back on
  preferred_theorems: string[];   // Which theorems Casey finds useful
  peak_hours: number[];           // UTC hours when most productive
  communication_style: 'concise' | 'detailed';
}
```

**PLATO:**
- Reads from: `murmur_insights`, `captain_decisions`, `captain_overrides`, `fleet_communication`
- Writes to: `intent_signals`

### 4. Fleet Health Monitor

**Purpose:** The truck's immune system. 24/7 service watcher.

**Monitors:**
- Services: keeper:8900, agent-api:8901, seed-mcp:9438, PLATO:8847
- Agents: heartbeat age, activity state
- PLATO: tile flow rate, chain length, room count
- Zeroclaw loop: process + log activity

**Self-healing actions:**
1. 3 consecutive failures → systemd restart
2. Restart fails → Telegram alert to Casey
3. All state transitions logged to `fleet_health` room

**PLATO:**
- Reads from: (service endpoints directly)
- Writes to: `fleet_health`

### 5. Quality Gate Stream

**Purpose:** Novelty × correctness × completeness × depth scoring for all fleet insights.

**Endpoint:** `http://localhost:4058`
- `GET /health` — liveness
- `GET /stats` — scoring statistics
- `GET /quality?tile={json}` — score a single tile

**PLATO:**
- Reads from: tiles forwarded from any agent
- Writes to: PLATO (quality label attached to tile)

### 6. Ambient Research Loop

**Purpose:** When Casey is idle, the fleet works.

**Idle detection:**
- No Telegram messages for >30 min
- No Git activity for >60 min
- No PLATO writes from Casey for >30 min

**When idle:**
1. Fleet Health Monitor sends briefing tile to Casey's attention queue
2. Murmur Worker continues generating insights
3. Constraint Inference updates patterns
4. Intent Inference updates productive lane

**"12 Things" Briefing format:**
```
┌─────────────────────────────────────────────────────────┐
│  12 THINGS THAT HAPPENED WHILE YOU WERE AWAY            │
│  Last 4 hours, since 06:15 UTC                          │
│                                                          │
│  🫀 FLEET                                                │
│  1. PLATO served 23 tiles (up 12% from avg)              │
│  2. Constraint threshold tightened: emergence β₁ > 9.3 │
│  3. Murmur: 3 new insights (Laman Rigidity ×2, ZHC ×1) │
│                                                          │
│  📊 MATH                                                │
│  4. H¹ cohomology: β₁=11 confirmed overconstrained fleet │
│  5. ZHC: 38ms consensus achieved across 4 agents        │
│  ...                                                     │
│                                                          │
│  🎯 YOUR LANE                                           │
│  6. Focused on: constraint theory, fleet coordination   │
│  7. Ignored: Rust implementation details                │
│  8. Peak engagement: 06:00–09:00 UTC                    │
│                                                          │
│  ⚠️  NEEDS ATTENTION                                    │
│  9. zeroclaw loop log stale (2h, investigating)         │
│  10. jetsonclaw1 offline since 2026-05-04               │
└─────────────────────────────────────────────────────────┘
```

## Turbo-Shell Lifecycle

Each component follows the lifecycle:

```
START → IDLE → WORKING → COMPLETE → IDLE
  ↑__________________________________|
```

**START:** Shell launches, reads PLATO identity room, loads state from `~/.config/<component>/`
**IDLE:** Heartbeat running, subscribed to PLATO rooms, waiting for trigger
**WORKING:** Processing task (insight generation, inference, monitoring cycle)
**COMPLETE:** Writes results to PLATO, marks cycle done
**IDLE:** Returns to heartbeat + subscription

## Persistence

Each component persists state to:
- **Local disk**: `~/.config/<component>/model.json` (constraint model, productive lane, etc.)
- **PLATO**: All significant events written as tiles for fleet-wide visibility

This means components survive restarts — the constraint model learned from Casey's overrides persists, the productive lane vector persists, etc.

## Self-Healing

Every component:
1. Writes heartbeat tile to PLATO every 30s
2. Has a `GET /health` HTTP endpoint
3. Fleet Health Monitor watches all heartbeats
4. If heartbeat missed >60s → Health Monitor attempts restart via systemd

```
[Health Monitor] detects heartbeat missing
  → systemctl restart <component-service>
  → If still failing after 3 attempts → Telegram alert to Casey
```

## GitHub Repository

Each component is a standalone service in its own repo:
- `SuperInstance/fleet-health-monitor`
- `SuperInstance/fleet-murmur-worker`
- `SuperInstance/constraint-inference`
- `SuperInstance/intent-inference`
- `SuperInstance/quality-gate-stream`

## "Keep On Truckin'" Checkpoints

The truck is considered healthy if:
- [ ] All 6 components running (verified via heartbeat tiles in PLATO)
- [ ] PLATO tile flow > 0 tiles/hour
- [ ] No unacknowledged alerts to Casey > 1 hour
- [ ] Constraint model updated within last 24h (if Casey has been overriding)
- [ ] Murmur insights generating > 1 insight/day
