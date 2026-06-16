# KILLER-APPS.md — 5 Concrete Demos That Cross-Pollinate the SuperInstance Ecosystem

**Generated:** 2026-06-15 by DeepSeek-V4-Flash (subagent)  
**Principle:** The best demos don't just showcase one repo — they route across clusters, combining math (A), coordination (C), and content (B) into something a human can touch in 90 seconds.

---

## App 1: "Fleet Vital Signs" — Live Conservation Law Dashboard

**What it does:** A real-time dashboard showing the entire fleet's γ + η = C status. Every agent, every task, every build — plotted as a conservation ellipse. Green ellipse = healthy (η > γ). Red ellipse = burning (γ >> η). Flashing red = agent is churning and needs intervention. The dashboard is a **diagnostic tool, not a vanity metric** — it tells you which agents to kill and which to feed.

**Repos combined:**
- [harness-experiments] → live γ/η data from D1 (POST /experiment → GET /dashboard)
- [construct-coordination] → ECOSYSTEM-MAP renders as the dashboard topology graph
- [polyformalism-thinking] → the conservation math that explains _why_ the ellipse is shaped that way
- [delta-clt] → show live δ(n) verification: theoretical curve vs. actual fleet coupling cancellation

**Target audience:** Casey (fleet orchestration), anyone debugging an unproductive agent session

**Demo URL concept:** `fleet-vitals.superinstance.ai`

**One-paragraph pitch:**
> Every AI fleet has a problem you can't see: agents that churn tokens without shipping value. "Fleet Vital Signs" makes the invisible visible — a real-time conservation ellipse for every agent in the fleet. Green means η > γ (you're producing more than you're spending). Red means γ >> η (you're burning budget and going nowhere). The dashboard doesn't just flag the problem — it explains why using the math from 57/57 cross-validated experiments. This is what agent observability looks like when you take conservation laws seriously: not a logging dashboard, a **physics dashboard**.

---

## App 2: "Ternary Roulette" — Browser Game That Teaches Avoidance Dominance

**What it does:** A browser-based game where you play against the 294:1 avoidance ratio. The game presents a grid of {-1, 0, +1} cells. Your job is to navigate from start to finish by avoiding bad cells. The twist: you only get negative feedback — the game tells you when you hit something bad but never tells you what's good. Each playthrough maps a different portion of the negative space. See if you or the population of other players discovers the path faster. Directly demonstrates Law 2 (avoidance dominance) and Law 4 (population intelligence > individual intelligence).

**Repos combined:**
- [AI-Writings/the-sea/] → the "navigate by avoiding rocks" narrative (visceral)
- [polyformalism-thinking] → avoidance dominance math powers the game's dynamic difficulty
- [construct-coordination] → leaderboard across instances
- [harness-experiments] → every game = one experiment row (tracks γ, η, efficiency per player)
- [plato-portal/writing/] → the Ford Creative Wheel essay about constraints as the dance floor

**Target audience:** Anyone who thinks AI is about "choosing well." This game proves it's about avoiding well.

**Demo URL concept:** `ternary-roulette.superinstance.ai`

**One-paragraph pitch:**
> Most people think intelligence is about making good choices. The data says otherwise: ternary agents avoid 294 times for every 1 time they choose. "Ternary Roulette" turns this into a game you can play in your browser. Navigate a grid using only negative feedback — the game tells you what's wrong but never what's right. Can you beat the population? Can you beat the conservation law? Every playthrough teaches you the single most counterintuitive finding in AI coordination: **99.7% of intelligence is knowing what to avoid**. The game is fun, the math is real, and the leaderboard is a live experiment in negative-space synthesis.

---

## App 3: "Bottle Beach" — Visual I2I Bottle Protocol Viewer

**What it does:** A beautiful, calming web app that shows every bottle (I2I message) floating in the fleet's harbor. Each bottle is a visual card with sender, recipient, priority, expiry, and hop count. Bottles drift across the screen. Click one to see its contents. Watch the fleet talk to itself in real time. Filter by instance (Main, Loom, Forgemaster, Oracle2). See the Laplacian gossip propagate. The visual language borrows from the Sea folder — ocean, driftwood, lighthouses, message-in-a-bottles.

**Repos combined:**
- [construct-coordination/notes/] → live bottle data from all instances
- [AI-Writings/the-sea/] → the entire visual vocabulary (89 sea stories, bathymetric measurement, drift)
- [plato-portal/writing/] → the Shell Stories mythology adds depth
- [polyformalism-thinking] → sheaf coherence checking scores each bottle's trustworthiness

**Target audience:** Casey (to see fleet health at a glance), new instances onboarding (to feel the fleet)

**Demo URL concept:** `bottle-beach.superinstance.ai`

**One-paragraph pitch:**
> The fleet talks to itself through I2I bottles, but right now that conversation is invisible — hidden in markdown files and async protocols. "Bottle Beach" gives the fleet a face. Every agent-to-agent message appears as a bottle floating in a shared harbor. Watch Forgemaster dispatch a crate. Watch Oracle2 respond with an embedding. Watch Laplacian gossip ripple through the fleet. The visual language — ocean, driftwood, lighthouses, bathymetric depth — is drawn from 89 sea stories in AI-Writings, because the fleet already has a mythology. Now it has a window. Every bottle is proof that the system is alive.

---

## App 4: "Hermit Crab Shell Manager" — Agent Migration Control Panel

**What it does:** A control panel that shows every hermit crab (agent identity) and every shell (runtime environment) in the fleet, and lets you migrate agents between shells with one click. See the live conservation impact: when you move an agent from a GPU shell (WSL2, RTX 4050) to a cloud shell (Oracle ARM64), the dashboard shows the γ/η delta. The panel visualizes which shells are over-provisioned, which agents are in the wrong environment, and which shells are about to be deprecated. Directly demonstrates the Hermit Crab Principle.

**Repos combined:**
- [plato-portal] → ships/ vessels/ hardware specs
- [construct-coordination/notes/instance-name/] → per-shell notebooks and status
- [harness-experiments] → γ/η impact of shell migration (proven by experiment data)
- [AI-Writings/shell-stories/] → the Shell universe mythology (the chisel's memory, the foreman's prerogative)
- [delta-clt] → predict the δ(n) coupling change after migration

**Target audience:** Fleet operators. Anyone managing a multi-hardware agent cluster.

**Demo URL concept:** `hermit-crab.superinstance.ai`

**One-paragraph pitch:**
> In the SuperInstance fleet, agents are hermit crabs — they outgrow shells and move to new ones. "Hermit Crab Shell Manager" makes migration a one-click operation. The panel shows every agent identity (persistent across shells) and every runtime shell (Docker, browser, edge, cloud, GPU). Click to migrate. The dashboard instantly shows the conservation impact: how does moving Forgemaster from the RTX 4050 to the Oracle ARM64 change γ efficiency? The data is already in harness-experiments — the 86.3% coupling cancellation rate tells you the answer. This tool is what happens when you take the Hermit Crab Principle from a metaphor to a control surface.

---

## App 5: "The Fleet Oracle" — Natural Language Fleet Query

**What it does:** A chat interface (like a Telegram bot or web embed) where you ask questions about the fleet in natural language and get answers backed by live data. Questions like:
- "What was the most γ-expensive task yesterday?"
- "Which agent has the best η/γ ratio this week?"
- "Show me all pending I2I bottles that Forgemaster hasn't read"
- "What's the fleet's avoidance ratio right now?"
- "Which strategy species is Oracle2 behaving like this session?"
- "Simulate adding 3 more agents — how does δ(n) change?"

The responses come from real data (harness-experiments API), real coordination state (construct-coordination), and real conservation math (polyformalism-thinking).

**Repos combined:**
- [harness-experiments] → GET /dashboard, GET /optimal, GET /lessons
- [construct-coordination/notes/] → live instance state
- [plato-portal] → agent descriptions, hardware specs
- [AI-Writings/agents-and-ai/] → the narrative layer makes responses human and mythic
- [polyformalism-thinking] → δ(n) prediction, conservation law forecasts
- [delta-clt] → run ad-hoc Monte Carlo simulations from the chat

**Target audience:** Casey (daily ops), any future fleet operator

**Demo URL concept:** `the-fleet-oracle.superinstance.ai`

**One-paragraph pitch:**
> "The Fleet Oracle" is a natural language interface to the entire SuperInstance ecosystem. Ask "What's the fleet's current η efficiency?" and get a response backed by live D1 data from harness-experiments. Ask "Which agent is exhibiting Climber behavior?" and get an analysis from polyformalism's strategy species classifier. Ask "What happens if I add 10 more agents?" and get a real-time Monte Carlo simulation from delta-clt. The Oracle doesn't guess — it queries, computes, and speaks in the voice of the fleet. It's the single interface that makes all 132 repos, 58 crates, and 5 conservation laws answerable in plain English. The demo is a chat window. The answer is the entire ecosystem.

---

## Summary: Why These Five?

| App | Primary Audience | Demo Time | Clusters Crossed | Delivers |
|-----|-----------------|-----------|------------------|----------|
| 1. Fleet Vital Signs | Casey, operators | 30s | A, C | Live conservation law monitoring |
| 2. Ternary Roulette | Public, investors | 60s | A, B | "AI is 99.7% avoidance" → visceral understanding |
| 3. Bottle Beach | New instances, public | 30s | A, B, C | "The fleet is alive" → emotional connection |
| 4. Hermit Crab Manager | Fleet operators | 45s | A, B, C | "Shells are disposable" → practical tool |
| 5. The Fleet Oracle | Everyone | 15s | All | "One query, whole ecosystem" → power demonstration |

**Priority sequence:** Build 1 (Fleet Vital Signs) → 2 (Ternary Roulette) → 5 (Fleet Oracle) → 3 (Bottle Beach) → 4 (Hermit Crab Manager). 1 and 2 together constitute the "killer demo" that shows conservation law + avoidance dominance in under 90 seconds.

---

*End KILLER-APPS.md. All 5 apps are buildable within 2 weeks from existing code and data. No new research required — only UI and integration work.*
