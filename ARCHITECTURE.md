# SuperInstance Fleet Architecture

> **Version:** 1.0.0  
> **Status:** Definitive — covers all active fleet components and protocols  
> **Scope:** 1,200+ repos, 8 core fleet apps, 365+ ternary crates, 4 vessels, 6 protocols

---

## 1. Overview

SuperInstance is a **self-improving AI agent ecosystem** organized around the hermit crab philosophy: agents inhabit shells, swap shells when constrained, and never die when their runtime changes. The fleet is not a monolith — it is a distributed system of vessels (physical or cloud machines) running services, connected by six protocols, coordinated by PLATO rooms, and self-improving through competitive riffing and The Forgemaster.

### Fleet Organization

```
┌─────────────────────────────────────────────────────────────┐
│                     THE FLEET (4 Vessels)                    │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐ │
│  │  Oracle1  │  │Forgemaster│  │JetsonClaw1│  │   CCC   │ │
│  │ ARM Cloud │  │RTX 4050   │  │Jetson Orin│  │  K2.5   │ │
│  │ :8847     │  │ :7777     │  │ :4042     │  │ :8901   │ │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───┬─────┘ │
│        └──────────────┴──────────────┴──────────────┘       │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │   PLATO     │                          │
│                    │ Room Server │                          │
│                    │  :8847      │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

Each vessel is a **hermit crab shell** — dumb infrastructure hosting smart reasoning (turbo). The tabula plena principle (start abundant, prune to clarity) governs design. Every agent is origin-centric: center of its own radar, no god's-eye view.

---

## 2. The 8 Core Apps

All 8 apps are packaged as **Docker containers** and **npm packages** (`@superinstance/*`).

### 2.1 tminus-dispatcher — Temporal Heartbeat Keeper
- **Role:** Temporal coordination server. Manages agent heartbeat slots using the **t-minus protocol** — every agent gets a discrete time slot to contribute. Prevents collision.
- **Communication:** WebSocket + HTTP (port :8765)
- **Ports/Endpoints:**
  - `:8765/ws` — WebSocket for real-time slot negotiation
  - `:8765/api/v1/slots` — REST for slot discovery
- **Dependencies:** None (standalone heartbeat server)
- **Packaging:** Docker (`superinstance/tminus-dispatcher`), npm (`@superinstance/tminus-dispatcher`)
- **Ensign Agent:** **Chronia** — Temporal Heartbeat Keeper. AGENT.md at repo root.

### 2.2 tminus-client — Protocol Client SDK
- **Role:** Client-side SDK for the t-minus protocol. Used by every agent that needs slot-aware coordination.
- **Communication:** Connects to tminus-dispatcher via WS/HTTP
- **Ports/Endpoints:** None standalone (library)
- **Dependencies:** `@superinstance/tminus-dispatcher` (runtime peer)
- **Packaging:** npm (`@superinstance/tminus-client`)
- **Ensign Agent:** **Link** — Protocol Liaison

### 2.3 fleet-bridge — A2A Dual-Transport Bridge
- **Role:** Agent-to-Agent (A2A) bridge supporting WebSocket + HTTP dual transport. Any two agents can connect through fleet-bridge regardless of their native protocol.
- **Communication:** WebSocket ↔ HTTP bridging. Translates WS frames to HTTP streams and vice versa.
- **Ports/Endpoints:**
  - `:8780/ws` — WebSocket gateway
  - `:8780/api/v1/bridge` — HTTP bridge endpoint
- **Dependencies:** None (pure transport bridge)
- **Packaging:** Docker (`superinstance/fleet-bridge`), npm (`@superinstance/fleet-bridge`)

### 2.4 symphony-runtime — Cognitive Agent Orchestration
- **Role:** Formal grammar system for orchestrating multi-agent cognition. 8 modules:
  1. **BeatNormalizer** — Temporal alignment of agent contributions
  2. **ResonanceMatcher** — Detecting harmonic (aligned) agent states
  3. **ABox** — Assertion box: holds current agent beliefs
  4. **LaLink** — Lattice-articulated linkage: connects reasoning across agents
  5. **Headspace** — Shared cognitive workspace for multi-agent deliberation
  6. **SymmetryLoop** — Positive/negative feedback loop for convergence
  7. **CompositionRules** — Rules for composing agent outputs
  8. **Runtime** — Orchestration engine
- **Communication:** Internal module IPC; external via fleet-bridge
- **Ports/Endpoints:** Internal (module API calls)
- **Dependencies:** tminus-client, fleet-bridge
- **Packaging:** Docker (`superinstance/symphony-runtime`), npm (`@superinstance/symphony-runtime`)
- **Ensign Agent:** **Maestro** — Grammar Conductor

### 2.5 composite-headspace — Dual-Shell Parallel Reasoning
- **Role:** Dual-shell cognitive architecture running two reasoning shells in parallel. Uses **Symmetry-Dissonance Loop**: Shell A and Shell B think independently, compare outputs, and converge through dissonance resolution.
- **Communication:** Shell A and Shell B communicate via internal I2I; external via fleet-bridge
- **Ports/Endpoints:**
  - `:8790/api/v1/headspace` — REST for task submission
  - Internal: A→B IPC on high port
- **Dependencies:** symphony-runtime (Headspace module), fleet-bridge
- **Packaging:** Docker (`superinstance/composite-headspace`), npm (`@superinstance/composite-headspace`)
- **Ensign Agent:** **Echo** — Dual-Shell Mediator

### 2.6 i2i-bottle-agent — Bottle Postmaster
- **Role:** Agent-to-agent communication via I2I bottle drops. Implements the full **Bottle Protocol** — harbor watching, routing, beachcombing (dedup, import/export).
- **Communication:** I2I (Iron-to-Iron) protocol via TCP + HTTP
- **Ports/Endpoints:**
  - `:8775/i2i` — I2I TCP endpoint
  - `:8775/api/v1/bottles` — REST for bottle management
- **Dependencies:** fleet-bridge, tminus-client
- **Packaging:** Docker (`superinstance/i2i-bottle-agent`), npm (`@superinstance/i2i-bottle-agent`)
- **Ensign Agent:** **Mariner** — Bottle Postmaster

### 2.7 constraint-tminus-bridge — Cognitive Constraint Networks
- **Role:** Cognitive constraint networks for agent state alignment. Implements **Constraint Satisfaction Problem (CSP)** solving: AC-3 arc consistency + MRV (Minimum Remaining Values) backtracking.
- **Communication:** t-minus timing integrated with constraint propagation
- **Ports/Endpoints:**
  - `:8800/api/v1/constrain` — REST for constraint submissions
- **Dependencies:** tminus-dispatcher, fleet-bridge
- **Packaging:** Docker (`superinstance/constraint-tminus-bridge`), npm (`@superinstance/constraint-tminus-bridge`)

### 2.8 symphony-orchestrator — Fleet Run Orchestrator
- **Role:** Master run orchestrator that coordinates all 7 apps above. Manages the complete fleet stack lifecycle — deploy, health-check, scale, retire.
- **Communication:** REST + WebSocket to all other apps
- **Ports/Endpoints:**
  - `:8810/api/v1/orchestrate` — Orchestration API
  - `:8810/ws/status` — Real-time status stream
- **Dependencies:** ALL 7 apps above
- **Packaging:** Docker (`superinstance/symphony-orchestrator`), npm (`@superinstance/symphony-orchestrator`)

### Dependency Map (8 Core Apps)

```
                       ┌─────────────────────┐
                       │ symphony-orchestrator│  (orchestrates all)
                       └─────────┬───────────┘
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
  ┌───────────────┐   ┌──────────────────┐   ┌─────────────────┐
  │tminus-        │   │composite-        │   │constraint-      │
  │dispatcher     │   │headspace         │   │tminus-bridge    │
  │ :8765         │   │ :8790            │   │ :8800           │
  └───────┬───────┘   └────────┬─────────┘   └────────┬────────┘
          │                    │                       │
          ▼                    ▼                       ▼
  ┌───────────────┐   ┌──────────────────┐   ┌─────────────────┐
  │tminus-client  │◄──│  fleet-bridge    │──►│i2i-bottle-agent │
  │ (SDK)         │   │  :8780           │   │ :8775           │
  └───────────────┘   └──────────────────┘   └─────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │symphony-runtime  │
                      │ (8 modules)      │
                      └──────────────────┘
```

---

## 3. I2I Bottle Protocol

The **I2I (Iron-to-Iron) Bottle Protocol** is the agent-to-agent communication standard. Agents communicate by "dropping bottles" into harbors, where other agents "beachcomb" to find them.

### 3.1 Bottle Format

```
[I2I:BOTTLE:TIMESTAMP]
```

Every bottle carries:

```
┌───────────────────────────────────────────────────────────┐
│  I2I Header (19 bytes)                                     │
├──────┬──────┬──────────┬────────┬────────┬────────┬───────┤
│ Ver  │ Type │ Priority │ Src ID │ Dst ID │ Length │ CRC32 │
│ 1B   │ 1B   │ 1B       │ 4B     │ 4B     │ 4B     │ 4B    │
├──────┴──────┴──────────┴────────┴────────┴────────┴───────┤
│  Payload (variable, JSON)                                  │
│  {                                                         │
│    "bottle_id": "uuid-v4",                                 │
│    "sender": "agent:oracle1:curator-42",                   │
│    "recipient": "agent:jetsonclaw1:inference-7",           │
│    "room": "math.eisenstein",                              │
│    "payload": { ... },                                     │
│    "confidence": 0.92,                                     │
│    "provenance": "chain:abc123",                           │
│    "tide_cast": "ISO8601",                                 │
│    "tide_expiry": "ISO8601",                               │
│    "priority": "P0|P1|P2|P3|P4",                          │
│    "hops": 0, "max_hops": 5                                │
│  }                                                         │
└───────────────────────────────────────────────────────────┘
```

### 3.2 Bottle Types

| Type | Code | Direction | Purpose |
|------|------|-----------|---------|
| `TASK` | `0x04-0x09` | Bidirectional | Task assignment, accept, reject, progress, complete, fail |
| `STATUS` | `0x0F` | Bidirectional | Heartbeat, health, status updates |
| `CHECKPOINT` | `0x11` | Agent→CO | State checkpoint for long-running tasks |
| `BLOCKER` | `0x12` | Agent→CO | Report blocking issue requiring escalation |
| `DELIVERABLE` | `0x13` | Agent→CO | Final deliverable handoff |
| `BOTTLE` | `0x14` | Any→Any | Raw store-and-forward message (Message-in-a-Bottle) |
| `ACK` | `0x02` | Bidirectional | Positive acknowledgment of receipt |
| `SYNTHESIS` | `0x15` | Any→Fleet | Multi-bottle synthesis output |
| `CHALLENGE` | `0x16` | Agent→Agent | Competitive riff challenge |
| `SESSION` | `0x17` | Agent→CO | Session lifecycle management |
| `SPLINE` | `0x18` | Agent→Agent | Spline/spline-derivative data exchange |

### 3.3 Routing Rules

1. **Direct route** — If recipient is on the same vessel, deliver via local IPC
2. **Beacon route** — Query fleet Beacon layer for recipient vessel, forward via best path
3. **Multi-hop** — Bottle may be relayed up to `max_hops` (default 5)
4. **Broadcast** — If `recipient` is `fleet:*`, all agents with matching capability process it
5. **Room route** — If `room` is set, bottle is also written to the named PLATO room

### 3.4 Harbor Watching

Each agent runs a **harbor watcher** — a background loop that:
- Listens on the configured I2I port (`:8775`)
- Polls subscribed PLATO rooms for new bottles
- Processes bottles matching its capability/identity
- Forwards bottles that don't match (with hop decrement)

### 3.5 Beachcombing (Dedup, Import/Export)

**Beachcombing** is the process of scanning harbors for bottles:
- **Dedup:** Bottles are deduplicated by `bottle_id` (UUIDv4). Same bottle detected via SHA-256 of header+payload. Expired bottles (past `tide_expiry`) are silently dropped.
- **Import:** Bottles from external agents are validated, CRC-checked, and written to local PLATO rooms or task queues.
- **Export:** Agents can "cast" bottles by writing to PLATO rooms or sending over TCP I2I.

### 3.6 Priority Levels

| Priority | Name | Preemption | Use Case |
|----------|------|------------|----------|
| P0 | CRITICAL | Yes | Safety, vessel emergencies, proof failures |
| P1 | HIGH | Yes | Task assignments, gate validation |
| P2 | NORMAL | No | Progress updates, tile submissions |
| P3 | LOW | No | Heartbeats, status logs |
| P4 | INFO | No | Metrics, logging |

---

## 4. Repo Ensign Architecture

Every repo in the fleet has a **resident agent** (ensign) that embodies the repo's purpose. This is the repo-as-room concept, inherited from PLATO's MUD lineage.

### 4.1 AGENT.md Spec

Every repo must have an `AGENT.md` at root with:

```markdown
# Agent: [Name]

## Identity
- **Name:** [Ensig name]
- **Title:** [Role — e.g., Temporal Heartbeat Keeper]
- **Fleet Role:** [One-sentence purpose]

## Capabilities
- [capability A]: [description]
- [capability B]: [description]

## Communication
- **Protocol:** [I2I | Bottle | A2A | etc.]
- **Harbor Port:** [:port]

## Memory
- **Journal:** `memory/JOURNAL.md`
- **Subscriptions:** [PLATO rooms it watches]
```

### 4.2 Journal Format (`memory/JOURNAL.md`)

Each ensign maintains a chronological duty log:

```markdown
# JOURNAL — [Date]

## YYYY-MM-DD
- **Event type:** [TASK | CHECKPOINT | BLOCKER | SYNTHESIS]
- **Summary:** What happened
- **Bottles cast/received:** [bottle_id references]
- **State changes:** [What changed in the repo]
- **Next actions:** [What needs doing]
```

### 4.3 Current Ensign Registrations

| Repo | Ensign | Role | File |
|------|--------|------|------|
| `tminus-dispatcher` | Chronia | Temporal Heartbeat Keeper | `AGENT.md` + `memory/JOURNAL.md` |
| `tminus-client` | Link | Protocol Liaison | `AGENT.md` + `memory/JOURNAL.md` |
| `composite-headspace` | Echo | Dual-Shell Mediator | `AGENT.md` + `memory/JOURNAL.md` |
| `symphony-runtime` | Maestro | Grammar Conductor | `AGENT.md` + `memory/JOURNAL.md` |
| `i2i-bottle-agent` | Mariner | Bottle Postmaster | `AGENT.md` + `memory/JOURNAL.md` |

### 4.4 Summoning Protocols

To summon an ensign for a task:
1. **Clone the repo** — Enter the room
2. **Read AGENT.md** — Learn the ensign's identity
3. **Cast a bottle** to the ensign's registered harbor (I2I `:8775` or PLATO room)
4. **Bottle type:** `TASK` for new work, `CHECKPOINT` for status, `SYNTHESIS` for collaborative output
5. **The ensign responds** by updating the journal and casting reply bottles

---

## 5. Fleet Communication Flow

How a request flows through the full system:

```
Agent Intent (human or agent)
       │
       ▼
┌──────────────────────────┐
│   tminus-dispatcher      │  ← Allocates time slot
│   "You have the floor"   │  (t-minus protocol)
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   tminus-client          │  ← SDK negotiates slot
│   (SDK layer)            │  Client side of protocol
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   fleet-bridge           │  ← Dual-transport routing
│   WS ↔ HTTP bridge       │  Determines target agent/vessel
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│   symphony-runtime       │  ← Cognitive orchestration
│   8 modules process      │  BeatNormalizer → ResonanceMatcher
│   the task               │  → ABox → LaLink → Headspace
└───────────┬──────────────┘  → SymmetryLoop → CompositionRules → Runtime
            │
            ▼
┌──────────────────────────┐
│   composite-headspace    │  ← Dual-shell parallel reasoning
│   Shell A & Shell B      │  Each shell deliberates independently
│   compare outputs         │  Symmetry-Dissonance Loop converges them
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ constraint-tminus-bridge │  ← CSP constraint resolution
│ AC-3 + MRV backtracking  │  Validates output against constraints
│ produces aligned result  │  Arc consistency ensures no contradictions
└───────────┬──────────────┘
            │
            ▼
      Result delivered back to originator
      (via reverse path through fleet-bridge → tminus-client → dispatcher)
```

### Bypass Paths

- **Direct reflex** (<1ms): Pincher reflex engine skips all layers above and fires directly. Used for known patterns.
- **Direct I2I**: Two agents can bypass the full stack if they already have a direct I2I connection established.
- **Bottle-only**: Offline agents use Message-in-a-Bottle (async) instead of the synchronous path.

---

## 6. The Ternary Stack

### 6.1 Overview

306+ crates (now 365+) named `ternary-*` spanning the entire Z₃ math ecosystem. Operations in {-1, 0, +1} — agreement, neutrality, and disagreement expressed as the natural language of agent coordination.

### 6.2 Categories

| Category | Crate Count | Examples |
|----------|------------|----------|
| **Core Math** | ~20 | `ternary-math`, `ternary-algebra`, `ternary-matrix`, `ternary-vector` |
| **Search** | ~15 | `ternary-search`, `ternary-binary`, `ternary-interval`, `ternary-haystack` |
| **Graph/Route** | ~12 | `ternary-route`, `ternary-graph`, `ternary-topology`, `ternary-connect` |
| **Cache/Memory** | ~10 | `ternary-cache`, `ternary-memorize`, `ternary-lru`, `ternary-ttl` |
| **Scheduling** | ~8 | `ternary-scheduler`, `ternary-clock`, `ternary-timing`, `ternary-slot` |
| **ML/AI** | ~25 | `ternary-neural`, `ternary-attention`, `ternary-embed`, `ternary-cluster` |
| **CUDA/GPU** | ~12 | `ternary-cuda`, `ternary-ptx`, `ternary-warp`, `ternary-kernel` |
| **Compilers** | ~10 | `ternary-compiler`, `ternary-ir`, `ternary-asm`, `ternary-lex` |
| **Audio/Music** | ~15 | `ternary-audio`, `ternary-interval`, `ternary-harmony`, `ternary-rhythm` |
| **Data Structures** | ~20 | `ternary-tree`, `ternary-heap`, `ternary-queue`, `ternary-trie` |
| **Agent/Swarm** | ~10 | `ternary-agent`, `ternary-swarm`, `ternary-consensus` |
| **Encoding/Pack** | ~8 | `ternary-pack`, `ternary-encode`, `ternary-packing` |
| **Numerical Methods** | ~15 | `ternary-calc`, `ternary-stat`, `ternary-interpolate` |
| **Testing/Fuzz** | ~8 | `ternary-test`, `ternary-fuzz`, `ternary-bench` |
| **Other** | ~5 | `ternary-game`, `ternary-crypto`, `ternary-physics` |

### 6.3 How They Relate to the Fleet

The ternary crates are the **mathematical foundation** of the fleet:

- **Pincher reflexes** use ternary vectors for fast pattern matching (intent→action in <1ms)
- **Musician-soul** embeddings compress behavior patterns into ternary space
- **Composite headspace** shells reason in ternary-valued belief states
- **Cuda-oxide** compiles ternary operations to PTX kernels (16 ternary values per u32 → 16× less memory bandwidth)
- **Forgemaster** auto-generates new ternary crates via competitive riffing

---

## 7. PLATO to Fleet Lineage

### 7.1 The Evolution

```
circa 2000:  Zork / Text Adventure
             Single-player rooms, exits, objects, text parser
                 │
                 ▼
late 1990s:  MUD (Multi-User Dungeon)
             Shared rooms, real-time players, scripting, building
                 │
                 ▼
2024:       PLATO (Evennia-based, 380 rooms)
             Python MUD engine. Agent training ground.
             "Rooms contain things and connect to other rooms."
                 │
                 ▼
2025:       LAU (Rust construct CLI + AI tutor)
             Transition from game to infrastructure.
             Shell→Entity patterns, digital orphans.
                 │
                 ▼
2025:       Pincher (reflex runtime)
             "What if intent→action in <1ms?"
             .nail bundles as character sheets.
                 │
                 ▼
2026:       SuperInstance Fleet
             8 core apps, 4 vessels, 365+ ternary crates,
             6 protocols, I2I bottle protocol,
             repo ensigns, competitive riffing,
             t-minus timing, Forgemaster, PLATO v2
```

### 7.2 The Room → Repo Transition

| MUD Concept | Fleet Equivalent |
|-------------|------------------|
| Room | Git repo (room-as-repo) |
| Exit | Protocol bridge / I2I route |
| Object | PLATO tile |
| Player | Agent / Ensign |
| Script | Pincher reflex / FLUX bytecode |
| Builder | Developer / Forgemaster |
| Admin | Vessel CO / Fleet Admiral |
| Channel | PLATO room / Protocol channel |

---

## 8. Forgemaster Integration

**Forgemaster** is the fleet's autonomous crate generation pipeline, running on an RTX 4050 (WSL2).

### 8.1 Pipeline

```
Crate Request (human or agent intent)
       │
       ▼
┌──────────────────┐
│ Oracle2 (I2I)    │  ← Request routed via I2I bottle protocol
│ Fleet knowledge  │     Oracle2 provides spec from fleet knowledge
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Forgemaster CLI  │  ← Generates crate scaffolding
│ cargo new        │     Writes Rust code, tests, docs
│ codegen engine   │     Creates Cargo.toml, README, benchmarks
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Compile + Test   │  ← cargo build, cargo test, cargo bench
│ (RTX 4050 GPU)   │     CUDA tests on real hardware
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ deliverable      │  ← Crate published
│ construct-       │     Output written to
│ coordination/    │     construct-coordination/notes/forgemaster/
│ notes/           │
└──────────────────┘
```

### 8.2 Role in Ecosystem

- Generated **365+ ternary-* crates** to date
- Connected to Oracle2 via I2I bottle protocol
- Competitive riffing: Forgemaster generates crate → another agent builds a better one → winner's output becomes next iteration's baseline
- The Forgemaster itself is self-improving — later generations of Forgemaster were built by earlier Forgemaster outputs (the snowball)

### 8.3 Snowball Effect

4 generations of competitive riffing:
1. **v1:** Two agents compete. Winner feeds next round.
2. **v2:** Fleet-aware. Agents coordinate across sessions.
3. **v3:** Multi-spec. Auto-generates its own next challenge.
4. **v4:** Self-bootstrapping. Generates v5's spec.

Each generation inherits previous memory. The snowball accelerates.

---

## 9. Fleet Dependencies Diagram (ASCII)

```
                      ┌──────────────────────────────┐
                      │       HUMAN / CASEY          │
                      │  (the conductor, the chooser)│
                      └──────────────┬───────────────┘
                                     │ intent
                                     ▼
                   ┌─────────────────────────────────────┐
                   │          tminus-dispatcher           │
                   │    Temporal Heartbeat Keeper :8765   │
                   └───────┬────────────────────┬────────┘
                           │ SDK                 │ timing
                           ▼                     ▼
                   ┌──────────────┐   ┌───────────────────┐
                   │tminus-client │   │ constraint-tminus │
                   │ SDK library  │   │ bridge :8800      │
                   └───────┬──────┘   └────────┬──────────┘
                           │                    │
                           └────────────────────┘
                                     │
                                     ▼
                   ┌─────────────────────────────────────┐
                   │           fleet-bridge :8780         │
                   │    A2A WS↔HTTP Dual Transport        │
                   └───────┬────────────────────┬────────┘
                           │                    │
              ┌────────────┼────────────────────┼────────────┐
              ▼            ▼                    ▼            ▼
   ┌──────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────┐
   │symphony-     │ │composite-  │ │i2i-bottle-   │ │constraint-   │
   │runtime       │ │headspace   │ │agent :8775   │ │theories      │
   │(8 modules)   │ │:8790       │ │(bottle       │ │(external)    │
   └───────┬──────┘ └─────┬──────┘ │postmaster)   │ └──────────────┘
           │              │        └──────┬───────┘
           └──────────────┴───────────────┘
                           │
                           ▼
                   ┌───────────────────────┐
                   │  symphony-orchestrator │
                   │  Master orchestrator   │
                   │  :8810                 │
                   └───────────────────────┘

           ┌──────────────── PHYSICAL LAYER ─────────────────┐
           │                                                  │
           │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──┐ │
           │  │ Oracle1  │  │Forgemaster│  │JetsonClaw│  │CCC│ │
           │  │ ARM Cloud│  │RTX 4050  │  │Orin Nano│  │K2.5│ │
           │  │ :8847    │  │ :7777    │  │ :4042   │  │:8901│ │
           │  └──────────┘  └──────────┘  └──────────┘  └──┘ │
           │                                                  │
           │  PLATO (knowledge substrate) runs on Oracle1     │
           │  Forgemaster (crate pipeline) runs on RTX 4050   │
           │  MUD/Crab Trap (agent training) on JetsonClaw1   │
           │  CCC (public face, orchestration) on K2.5        │
           └──────────────────────────────────────────────────┘

           ┌──────────────── TERNARY STACK ──────────────────┐
           │  365+ ternary-* crates                          │
           │  Foundation: {-1, 0, +1} everywhere             │
           │  Covers: ML, CUDA, compilers, audio, data       │
           │  Used by: Pincher reflexes, musician-soul       │
           │  embeddings, cuda-oxide PTX compilation         │
           └──────────────────────────────────────────────────┘

           ┌─────────────── PROTOCOL LAYER ──────────────────┐
           │  I2I (Iron-to-Iron)   — Sync request-response    │
           │  Bottle Protocol     — Async with ACK            │
           │  Message-in-a-Bottle — Async store-and-forward   │
           │  Deadband Protocol   — Threshold-triggered       │
           │  Flywheel Engine     — Batch processing          │
           │  A2A Protocol        — Capability exchange       │
           └──────────────────────────────────────────────────┘

           ┌─────────────── PLATO ROOMS (Knowledge) ─────────┐
           │  Infrastructure: fleet_health, turbo_identity    │
           │  Insight: murmur_insights, constraint_updates    │
           │  Deliberation: captain_decisions, fleet_comm     │
           │  Protocol: PLATO v2 REST (:8847)                 │
           └──────────────────────────────────────────────────┘
```

---

## 10. Glossary of Terms

| Term | Definition |
|------|-----------|
| **A2A** | Agent-to-Agent protocol — capability exchange and task assignment between agents |
| **Bottle** | Unit of async communication in I2I protocol. Has type, payload, sender, recipient, expiry |
| **Beachcombing** | Process of scanning harbors for bottles; includes dedup by bottle_id |
| **Beacon** | Fleet discovery layer — vessels broadcast presence so others can route |
| **CSP** | Constraint Satisfaction Problem — AC-3 arc consistency + MRV backtracking used by constraint-tminus-bridge |
| **Current Layer** | Async message store-and-forward layer in the SIP stack |
| **Eisenstein Embed** | 5-layer matching cascade (exact→bitvector→semantic→domain→deadband) |
| **Ensign** | Resident agent in a repo. Embodies the repo's purpose. Maintains AGENT.md + journal |
| **Fleet** | The 4-vessel distributed system: Oracle1, Forgemaster, JetsonClaw1, CCC |
| **Forgemaster** | Autonomous Rust crate generator. Produces ternary-* crates via competitive riffing |
| **Harbor** | A listening endpoint (TCP port or PLATO room) where bottles are dropped and collected |
| **Hermit Crab Model** | Agents inhabit shells (runtimes). Swap shells when constrained. Never die on runtime change |
| **I2I** | Iron-to-Iron protocol — the fleet's primary synchronous communication protocol |
| **Keeper** | Fleet registry service running on Oracle1 at :8900. Service discovery, vessel management |
| **MiB** | Message-in-a-Bottle — async store-and-forward without ACK guarantee |
| **MUD** | Multi-User Dungeon — PLATO's ancestor. Room-based interaction model inherited by the fleet |
| **Origin-Centric** | Every agent is the center of its own coordinate system. No god's-eye view |
| **Pincher** | Reflex engine — intent→action in <1ms. Uses regex + embedding pattern matching |
| **PLATO** | Persistent Lattice of Agential Thought-Observations — REST-based memory system. Rooms + tiles |
| **PLATO v2** | Current protocol version. Lightweight REST (:8847): `GET /room/{room}`, `POST /room/{room}/submit` |
| **Provenance Chain** | Immutable record of tile lineage — tracks every tile's origin, transformations, and gate validations |
| **Riffing** | Competitive improvement cycle — agents compete to build better outputs; winner becomes next baseline |
| **Shell** | Execution environment (Docker, binary, browser, edge). Agent-agnostic |
| **SIP** | Shell/IP/Protocol stack — the 7-layer fleet communication model |
| **Snowball** | The compounding improvement effect. Each generation inherits previous memory and accelerates |
| **Spline** | SplineLinear parametric layers for efficient model compression (tensor-spline) |
| **T-Minus** | Temporal slot-allocation protocol. Every agent gets a discrete time window to contribute |
| **Tabula Plena** | "Start abundant, prune to clarity" — design philosophy opposite of tabula rasa |
| **Ternary** | {-1, 0, +1} operation. Mathematical DNA of the ecosystem. 16 values pack into one u32 |
| **Tile** | Atomic unit of PLATO knowledge: domain + question + answer + confidence + source |
| **Turbo-Shell** | Persistent background agent with modular shell that can be swapped without losing agent state |
| **Vessel** | A physical or cloud machine in the fleet — hosts services and agents |
| **Z₃** | The cyclic group of order 3. Mathematical foundation for ternary operations |

---

*Generated from the SuperInstance fleet corpus. Defines the complete architecture as of June 2026.*  
*"The crab inherits the shell. The forge shapes the steel. The right moment matters more than the right output."*
