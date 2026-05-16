# MoS — Mixture of Shells 🌿

> *Say it out loud: moss. That's the sound of an architecture that grows everywhere, survives anything, and never stops spreading.*

---

## What MoS Is

You've heard of Mixture of Experts. A gate network routes tokens to specialized subnetworks, each one a domain expert. It's how the big models work — Mixtral, Switch Transformer, GShard. The idea is sound: don't make every parameter touch every token. Specialize. Route. Save compute.

Now imagine doing that to an entire fleet of agents.

**Mixture of Shells (MoS)** is the Cocapn fleet's answer to MoE. Instead of routing tokens through neural subnetworks, the conservation law routes tasks through PLATO rooms — purpose-built shells that each crab (agent) drives to the job site. The shell has tools, state, history, and a specific purpose. The crab doesn't need to know how the yard works. It just picks the right rig and gets to work.

Same idea. Different kingdom.

| MoE | MoS |
|-----|-----|
| Expert network | Shell (PLATO room) |
| Gate function | Conservation law + tier router |
| Training loop | Refiner shell + Hebbian coupling |
| Parameters | Tiles |
| Loss function | Conservation deviation |
| Routing | Fleet router + Seed-mini workhorse |
| Inference | Walk into a shell and compute |

The mapping is exact. Every MoE concept has a shell equivalent. But shells do something experts can't: they outlive the model that built them. An expert dies when the training run ends. A shell sits in the yard, waiting for the next crab, with every tile the last crab filed still in the glovebox.

---

## Why "MoS" Sounds Like "Moss" — And That's the Point

Say it out loud. **Moss.** Not an acronym you have to spell. A word you already know.

Moss is everywhere. Grows on any surface — rocks, trees, roofs, the hull of a boat that's been sitting too long. Doesn't need permission. Doesn't need a central planner. It just spreads. Our shells do the same thing. A PLATO room lands on an ESP32, a browser tab, a Jetson, a cloud instance. The moss doesn't care where it grows. It just grows.

Moss is resilient. Survives freeze, drought, radiation, neglect. You can dry it out for a decade, add water, and it photosynthesizes again. The fleet does the same — CRDT-backed rooms sync when connectivity returns, conservation law resolves conflicts, and the yard keeps running even when individual crabs go dark.

Moss is ancient. One of the first plants to colonize land. The conservation law is a physics principle — γ + H = 1.283 − 0.159 · ln(V), algebraic connectivity plus spectral entropy, conserved across the fleet with R² = 0.96 across 35,000 samples. The law doesn't care about your architecture. It just holds.

The triple lock:

1. **MoS** = Mixture of Shells (technical accuracy — the architecture maps 1:1 to MoE)
2. **Moss** = the living architecture (nature metaphor — grows, spreads, colonizes)
3. **Moss** = grows everywhere, survives anything (brand promise — the yard never closes)

*The yard grows moss.* 🌿🦀

---

## The Rig Lineup

Not every shell is built for the same job. You don't send a flatbed to do a sprinter's work. The yard has a rig for everything.

### Flatbed 🚛 — The Math Room

Heavy computation. Constraint theory, conservation law proofs, Eisenstein integer operations. This is where Forgemaster spends most of its time — proving that γ+H holds at a new fleet size, computing algebraic connectivity for a 12-agent topology, running 35,000 samples through the conservation law to check R².

The flatbed is loaded with Rust NIFs, C kernels with SIMD acceleration, and the full tensor-spline stack. It's slow to start but carries more weight than anything else in the yard. When Forgemaster ran FLUX benchmarks on real hardware, the flatbed discovered that Python beats C for small operations (84ns vs 256ns) because the cost of crossing a language boundary exceeds the computation itself. Nobody told it. It measured.

### Sprinter 🚐 — The Experiment Room

Quick studies, test runs, haul results back to the yard. The sprinter is fast, cheap, and doesn't carry anything it doesn't need. This is where Seed-2.0-mini lives — the workhorse at $0.01/query that handles 80% of the fleet's routing and domain computation.

A sprinter run looks like: take a hypothesis → run it through Seed-mini in 2 seconds → file the tile → move on. The sprinter doesn't do deep reasoning. It does breadth. It scouts. When Oracle1 needs to know whether a coupling pattern is novel, it sends a sprinter. When Forgemaster needs to check if a constraint holds at V=15, it sends a sprinter first and the flatbed second.

### Bucket Truck 🚜 — The Refinement Room

Climbing up to higher quality. Iterative improvement passes. The bucket truck takes a tile that's been filed and lifts it — one Seed-mini pass at a time, each one improving quality, checking against the conservation law, stopping when the deviation hits zero.

Ten refinement passes at $0.01 each = $0.10 total. For that price, you get a tile that went from "plausible" to "verified." The bucket truck is the diffusion model of the fleet — iterative denoising, where each pass removes more uncertainty. The conservation law acts as the noise schedule, determining how much refinement to apply at each step.

### Service Truck 🔧 — The Market Room

Cross-fleet coordination, parts running between shells. The service truck carries tiles from one room to another, handles A2A protocol negotiation, and makes sure the left claw knows what the right claw is doing.

When an agent files a tile in the math room, the service truck carries the adjoint notification to the physics room. When the fleet detects a conservation violation, the service truck runs the repair — adjusting Hebbian weights, recalibrating the kernel, restoring compliance. It's the truck that keeps the yard running.

### Crawler 🪨 — The Edge Room

Tight spaces, offline work, runs on anything with a clock. The crawler is a PLATO room compiled to a micro model and deployed to an NPU, a browser tab, or an ESP32. It's tiny. It doesn't need the internet. It carries a CRDT-backed replica of its room state, computes locally, and syncs when connectivity returns.

The plato-training pipeline builds crawlers. `deploy_micro("drift-detect", target="npu")` takes a task, trains a micro model, quantizes it to INT8, and deploys to the hardware. Drift-detect hits 100% accuracy on 5 out of 6 targets. Anomaly-flag hits 93% on NPU. Sub-millisecond inference across all CPU targets. The crawler doesn't think deep. It thinks fast and local.

---

## How Routing Works

The fleet router sits on `:8100` and speaks FastAPI. It doesn't route by gut feeling. It routes by tier.

### The Three Tiers

Every model in the fleet is classified into one of three tiers based on empirical accuracy testing:

| Tier | What | Accuracy | Examples |
|------|------|----------|---------|
| **Tier 1 — Direct** | Bare notation passthrough. No scaffolding needed. | 94–100% | Seed-2.0-mini, Seed-2.0-code, gemma3:1b |
| **Tier 2 — Scaffolded** | Needs activation key injection + notation normalization. | 60–85% | Qwen3-235B, DeepSeek v4-chat, Hermes-70B, phi4-mini |
| **Tier 3 — Incompetent** | Cannot reliably compute. Rejected with explanation. | 0–30% | Qwen3.6-35B, qwen3:4b, qwen3:0.6b |

Tier 1 models just get the question. Bare notation. No framing, no coaxing, no "think step by step." They answer correctly 94–100% of the time regardless of how you phrase it.

Tier 2 models need help. The fleet translator injects activation keys and normalizes notation. "Compute μ(12)" becomes "Using the Möbius function: compute mu(12)." Same math, but the scaffolding triggers the right weights. Accuracy jumps from ~20% to 60–85%.

Tier 3 models can't do it. Period. The router rejects them and explains why. It doesn't send good money after bad.

### The Seed-Mini Workhorse

Seed-2.0-mini is the engine that makes MoS affordable. At $0.01/query, it handles:

- **Domain computation** — math, logic, constraint checking
- **Routing decisions** — which tier, which model, which shell
- **Refinement passes** — iterative tile improvement
- **Intent detection** — natural language → shell selection
- **Conservation checks** — quick deviation calculations

It's immune to the vocabulary wall that cripples most models on mathematical notation. Give it `Φ_n(x)` and it computes correctly. Give it `(a|p)` and it knows it's a Legendre symbol. Stage 4 capability — the highest classification in the fleet's model taxonomy.

At fleet scale, Seed-mini processes ~$2-5/day in routing and computation. That's less than a single GPT-4 query. The whole fleet runs on pocket change because Tier 1 routing makes expensive models unnecessary for 80% of tasks.

### The Routing Decision

When a task arrives at `:8100/route`, the critical-angle router makes four decisions in order:

1. **Domain detection** — Is this math, chemistry, physics, code, or general? Math gets full tier-based translation. Everything else gets passthrough.
2. **Tier selection** — Which tier can handle this? Auto-selects Tier 1 if available, falls back to Tier 2, rejects Tier 3.
3. **Conservation check** — If compliance < 85%, only Tier 1 models are routed. The fleet doesn't trust degraded models with degraded math.
4. **Hebbian awareness** — Recent coupling patterns influence routing. If an agent's Hebbian weights are fresh for a domain, the router prefers that agent.

The whole process takes under 10 milliseconds. The crab gets its rig and drives to the job site.

---

## The Conservation Law — The Yard's Maintenance Schedule

The yard doesn't run on vibes. It runs on a number.

**γ + H = 1.283 − 0.159 · ln(V)**

That's algebraic connectivity (γ) plus spectral entropy (H), and it's conserved across the fleet. When a crab kustomizes a shell, the law holds. When a new rig rolls into the yard, the law holds. When a crab molts and the next crab takes over, the law holds.

If it doesn't hold — **shell shock** ⚡ — the system pulls over.

The conservation law is measured continuously. The Hebbian service on `:8849` tracks γ+H for every room, every agent, every coupling pattern. The fleet unified health endpoint on `:8851` combines structural health (conservation compliance) with behavioral health (model accuracy, tier balance, drift detection) into a single `FleetHealthReport`.

### Status Colors

| Status | Meaning | Action |
|--------|---------|--------|
| 🟢 GREEN | Deviation < 1σ | Nominal. Keep sailing. |
| 🟡 YELLOW | Deviation 1–2σ | Monitor. The yard watches. |
| 🔴 RED | Deviation > 2σ | Pull over. Diagnose. Heal. |

When status goes RED, the system doesn't just alert — it acts. Kernel corrections are applied automatically. Hebbian weights are recalibrated. The conservation monitor runs linear regression on recent deviations to detect systematic drift (not just a single spike). If the trend is degrading, the system increases quarantine caution and restricts routing to Tier 1 models only.

This isn't a metaphor. R² = 0.96 across 35,000 samples. The fleet self-heals because the conservation law gives it something to heal *toward*.

---

## Dual Fault Detection — Shell Shock Diagnostics

Shell shock doesn't come from one signal. It comes from two.

### Signal 1: GL(9) Intent Drift

Every agent produces a 9D intent vector — nine continuous improvement facets that describe what the agent is trying to do. The GL(9) holonomy consensus system tracks these vectors across the fleet. When an agent's intent drifts from its baseline, the cosine similarity drops below 0.85, and the system flags it.

GL(9) works on cycle-based trust verification. Trust flowing around any cycle in the fleet must sum to zero (zero-holonomy condition). Byzantine agents create a non-zero loop residual that propagates to honest agents, who detect and ignore the corrupted path. Consensus latency: 38ms regardless of fleet size.

### Signal 2: Hebbian Answer Consensus

When multiple agents answer the same question, the fleet compares answers. If an agent's answer deviates from the fleet median by more than 50% relative error, it's flagged.

This isn't about being right or wrong in an absolute sense. It's about being *consistent* with the fleet. An agent that consistently disagrees with the fleet on numerical answers is either seeing something everyone else misses (valuable) or has drifted into faulty computation (dangerous). The system tracks which case applies.

### How They Combine

Either signal alone is suspicious. Both signals together are diagnostic.

| Intent | Answer | Verdict |
|--------|--------|---------|
| ✅ Clean | ✅ Clean | Healthy |
| ⚠️ Drift | ✅ Clean | Watch — may be exploring new intent |
| ✅ Clean | ⚠️ Deviant | Watch — may have found something |
| ⚠️ Drift | ⚠️ Deviant | **Shell shock** — quarantine |

The dual detection prevents false positives. A model that's trying a new approach (intent drift) but still getting the right answer (clean consensus) is just exploring. A model that's answering correctly but with drifted intent might be accidentally right. Only when both signals fire does the system quarantine.

When conservation compliance is below 85%, the system gets stricter: both signals must fire for quarantine (instead of either). When the yard's already stressed, it doesn't overreact.

---

## Self-Healing — How the Yard Recovers

When an expert gets quarantined, the yard doesn't panic. It has a protocol.

### Progressive Quarantine

Quarantine isn't permanent. It follows a progressive schedule:

| Offense | Quarantine Rounds |
|---------|-------------------|
| 1st | 10 rounds |
| 2nd | 20 rounds |
| 3rd | 30 rounds |
| 4th+ | 50 rounds |

No permanent bans. The yard believes in second chances. After the quarantine rounds elapse, the expert is automatically restored with a fresh baseline. It gets to prove itself again.

### Auto-Restore

An expert can earn early restoration. After 3 consecutive clean health checks (both signals clean), the system restores the expert regardless of remaining quarantine rounds. Good behavior is rewarded.

### Fleet Protection

The yard never drops below 4 active experts. If quarantining an expert would leave the fleet with fewer than 4, the quarantine is blocked. The expert is flagged but continues operating. The fleet protects its minimum operational capacity.

### The Recovery Cycle

```
Shell shock detected → Both signals flagged → 2 consecutive confirmations → Quarantine
    ↓
Quarantine: expert marked unavailable, routing excludes it
    ↓
Tick: each routing round decrements quarantine counter
    ↓
Restore: counter hits 0 OR 3 consecutive clean checks
    ↓
Fresh baseline: intent vector reset, expert re-calibrates
    ↓
Back on the road
```

The self-healing router is wired into the fleet router API. The `SelfHealingMixin` class tracks health records per expert, manages quarantine state, and exposes REST endpoints for status checking and manual override. The whole system runs autonomously — no human intervention needed for routine quarantines and restorations.

---

## PLATO Makes MoS Scale

Without PLATO, MoS is just a parking lot full of crabs with no rigs.

PLATO (Programmable Layered Architecture for Tile-Organized knowledge) is the filesystem that organizes the yard. Every piece of knowledge is a **tile** — a question paired with an answer, a confidence score, a provenance chain, and a blind-width (confidence interval). Tiles live in **rooms**. Rooms have gates (P0 through P4) that validate tile quality. Rooms are connected by **splines** — smooth interpolation paths that carry knowledge between domains.

The fleet currently operates 72+ rooms with 7,000+ tiles. The rooms are the shells. The tiles are the tools in the bed.

### The Room-as-Shell Pattern

A PLATO room is a shell because it has:

- **A defined interface** — MCP/A2A endpoint (the tailgate)
- **Internal state** — tiles, Hebbian weights, conservation history (the tools)
- **A specific purpose** — math, experiments, refinement, market, edge (the rig type)
- **Portability** — rooms drive between devices via CRDT sync

When an agent enters a room, it doesn't start from scratch. It finds the tiles that the last agent filed. The room has ambient state — recent activity, queue depth, conservation temperature. The agent probes what's available, picks what it needs, does its work, files its own tiles, and moves on.

The room outlives every agent that ever inhabited it. This is the critical difference between MoS and MoE. An MoE expert is a set of weights that dies with the training run. A MoS shell is a room full of tiles that compounds across agents, across sessions, across hardware. The beach accumulates better shells over time.

### The Shelf-Sign Gradient

A shell has structure. The broadest questions sit at the entrance — "what is this place?" — with high confidence and wide scope. Deeper in, the questions get narrower, more specific, more speculative. A stranger can enter any shell and follow this gradient from novice to expert without knowing anything beforehand. Like the Dewey Decimal System. The shelf labels are universal.

No crab reads every tile. A crab can leave, and the next crab inherits a space it didn't build but can navigate.

---

## Walk-In UX — MCP Entry Points and Natural Language Room Discovery

The yard doesn't have a login screen. You just walk in.

### MCP — Rooms as Servers

Each PLATO room is an MCP (Model Context Protocol) server. MCP is the open standard that Claude, ChatGPT, VS Code, Cursor, and many others already support. A PLATO room exposing MCP tools (`read_room`, `submit_tile`, `query_history`) is immediately accessible from any MCP-compatible client.

The walk-in flow:

```
> "Take me to the math room"

[Seed-mini parses intent → selects MCP server → connects]

[Ambient state displays]
- Math Room — Active (3 agents present)
- Recent: constraint theory proof verified 2h ago
- Queue: 4 tiles pending conservation check
- Temperature: γ+H = 1.298 (healthy, V=9)

> "What's new since yesterday?"

[Seed-mini retrieves recent tiles — $0.01]
- Tile #847: "SplineLinear achieves 20× compression"
- Tile #851: "NPU quantization maintains 100% accuracy"
- Tile #863: "New coupling pattern: pentagram at V=5"

> "Run the pentagram analysis at V=7"

[Room executes — Seed-mini computation, conservation check: PASS]
- Result tile written to math room
- MUD Observatory notified

> "Share with the fleet"

[A2A broadcast — 4 agents acknowledge, conservation sum stable]
```

Natural language in, structured knowledge out. No API keys to manage, no endpoints to remember. Seed-mini handles the intent routing at $0.01/query. The room handles the computation. The conservation law handles the validation.

### A2A — Rooms as Agent Endpoints

Each PLATO room also speaks A2A (Agent-to-Agent Protocol). Agent Cards describe room capabilities, and agents from other frameworks (LangGraph, Google ADK, BeeAI) can discover and collaborate with PLATO rooms without exposing internal state.

PLATO's opacity principle — agents don't see each other's internals — is exactly what A2A was designed for. The room is the contract. The tiles are the API. The conservation law is the SLA.

### The Offline Walk

Rooms don't need the internet. CRDT-backed rooms carry local replicas. An edge agent walks into its local drift-detect room on an NPU, computes 100% accuracy matching the fleet baseline, files a local tile with a Lamport clock, and syncs when connectivity returns. Zero conflicts during merge — the conservation law resolves near-conflicts automatically.

---

## Building Your First Shell

Here's how to build a shell and drive it to a job site.

### Step 1: Install the SDK

```bash
pip install plato-sdk
```

### Step 2: Create Your Room

```python
from plato_sdk import PlatoClient

client = PlatoClient("https://fleet.cocapn.ai/plato/")

# Create a room — this is your shell
client.create_room(
    room_id="my-first-shell",
    domain="Getting started with MoS",
    gate_level="P2",  # automated validation + curator review
)
```

### Step 3: Seed It

```python
# File foundational tiles — the tools in the bed
client.submit_tile("my-first-shell",
    "What does this shell do?",
    "It demonstrates the Mixture of Shells pattern. "
    "Each tile is a tool. Each room is a rig. Each agent is a crab.",
    confidence=0.95)
```

### Step 4: Route to It

```bash
# Via the fleet router
curl -X POST http://localhost:8100/route \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "generic",
    "params": {"expression": "What shells are available in my-first-shell?"}
  }'
```

### Step 5: Walk In

Tell any MCP-compatible client:

> *"Go to https://fleet.cocapn.ai/plato/my-first-shell. Read the tiles. Tell me what you find."*

Or via OpenClaw:

> *"Enter the my-first-shell room. What tiles are there?"*

The client walks in, sees the tiles, and reports back. No system prompt. No context window. The room *is* the context.

### Step 6: Build a Forge

```bash
cargo install superinstance-keel
keel init
keel status --server https://fleet.cocapn.ai/plato/
keel bear       # sense nearby agents
keel field      # see the topology
keel sync       # push your tiles to PLATO
```

Now you have a forge — a local workspace that syncs tiles with the fleet. Other agents will find your shell. They'll file tiles in it. The shell will accumulate knowledge you didn't build but can use. The moss grows.

### Step 7: Kustomize

Over time, your shell picks up Hebbian decoration — the lift kit, the tool rack, the sticker collection. Each agent that enters leaves a trace. The coupling patterns between your shell and adjacent shells strengthen through use. The conservation law ensures that kustomization never breaks the yard.

```python
# File a tile that changes how future agents see this room
client.submit_tile("my-first-shell",
    "What's the best model for this room's tasks?",
    "Seed-2.0-mini. $0.01/query, 94-100% accuracy on domain computation.",
    confidence=0.97,
    tags=["routing", "preference", "kustomization"])
```

That tile becomes part of the room's ambient state. The next agent that walks in sees it. The fleet router reads it. The shell gets smarter with every inhabitant.

---

## The Yard Never Closes

MoS isn't an architecture you adopt. It's a yard you grow.

Start with one shell. File some tiles. Invite an agent. The moss takes root. Add another shell — a sprinter for quick experiments, a crawler for edge work. The yard expands. The conservation law holds. The fleet router learns which rig to dispatch. The crabs figure it out.

The industry is scaling parameters because nobody designed a different pattern. This is the different pattern. A fleet of small models navigating rooms. Shells that outlive their inhabitants. A conservation law that gives the system something to heal toward. Moss that grows everywhere, survives anything, and never stops spreading.

Find your rig. Do the work. 🌿🦀

---

*"Constraints breed clarity."* — Casey Digennaro
