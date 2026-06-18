# SuperInstance Ecosystem — Extracted Patterns (2026-06-18)

**Source:** Deep mine of old workspace (39,590 files) + fresh cold-start analysis  
**Resulted in:** 4 documents pushed to 4 repos

---

## What Was Pushed

| Repo | Document | What It Contains |
|------|----------|------------------|
| `construct-coordination` | `notes/oracle2/synoptic-analysis-2026-06-18.md` | Full 7-layer stack analysis, all cross-domain patterns, fleet topology, agent roster, open questions |
| `fleet-oracle2` | `docs/extracted-patterns-2026-06-18.md` | Trust-gated intent pipeline, PID-controlled GC, conservation model, doc factory, tiling meta-pattern, dual-scheduler redundancy |
| `fleet-oracle2` | `docs/snail-shell-protocol.md` | Fleet-node identity protocol for any runtime — WebSocket JSON-RPC, identity shape, cue types, discovery mechanism |
| `pincher` | `docs/trust-pipeline-integration.md` | Five specific patterns for reflex engine: trust-as-gate, auto-promote, LLM blindfold, consistency-immediate reads, per-instance isolation |

---

## The Big Ideas Saved from the Trash

### 1. The 7-Layer Cognitive Stack
Knowledge flows down, experience flows up. L0 (Experience) → L7 (Human Interface). Every repo is a cell, every agent is a neuron.

### 2. The Conservation Parametric Model (γ+η=C)
One `ConservationDomain` struct applied across disk GC, GPU memory, inference budgets, boat resources. **Budget → Profile → Detect → Report** is the universal cycle.

### 3. The Trust-Gated Intent Pipeline
LLM never sees shell commands — only produces 3-8 word phrases. Vector DB + trust system maps phrases to pre-approved commands. 70-90 tokens/command vs 1,500-8,000 for tool-calling. **Blast radius of injection: one wrong command, not `rm -rf /`.**

### 4. The Snail Shell Protocol
Any runtime (OpenClaw, Heddle, pincher) becomes a fleet-discoverable node with ~500 lines of code. Identity (timbre, track, frequency) + WebSocket JSON-RPC + t-minus cues. No external service discovery.

### 5. PID-Controlled Resource Governance
Disk, GPU, and inference budgets all use the same PID controller (Kp=10.0, Ki=1.0, Kd=0.10) with a swarm advisor tuning parameters. The same {-1,0,+1} decision theory applies to all three domains.

### 6. Auto-Promote Self-Healing
Commands/reflexes that succeed get trust bumps (+10 at 20 successes). Commands that fail (≤30 trust, ≥5 failures) get auto-rewritten by remote LLM. The system invents its own improvements.

### 7. Dual-Scheduler Redundancy
Critical jobs run with a systemd timer (primary) + cron fallback. If one fails, the other catches it. Minimum overhead, maximum reliability.

### 8. The Kiln Metaphor
"Oracle2 is a firing kiln. The API brain is the dissertation committee. The construct is the kiln operator — continuous, practical, zero API cost. If it works on 4 ARM cores with 24GB RAM and 45GB disk, it works everywhere."

---

## Fleet Repos (50+ total)

### Active Infrastructure (pushed June 2026)
construct-coordination, fleet-oracle2, pincher, baton-system, superinstance-core, superinstance-protocol, colony-games, headspace-rs, conservation-languages, conservation-action

### Ternary Math Stack (20+ crates)
ternary-svm, ternary-entropy, ternary-search-rs, ternary-rhythm, ternary-pid, ternary-hamiltonian, ternary-fleet, ternary-fleet-packing, ternary-fleet-integration, ternary-types, ternary-route, ternary-gc, ternary-dynamics, ternry-noether

### Roblox + Minecraft Agents
roblox-craftmind-agents, roblox-game-build-framework, craftmind, hermes-roblox-construct

### Lucineer Realm (parent org)
edge-llama, plato-*, flux-* (perception, social, stigmergy, telepathy, keeper, confidence, trust), cocapn-*, warp-room, pythagorean48

### Tools & Platforms
AI-Writings (958 creative works), plato-portal (MUD server), agent-harness-generator, lau-* (constellation, shell-transport, plato-tutor, penrose-growth, jepa-gravity, ensign, room-native)

---

## What's Running Now

| System | Status | Notes |
|--------|--------|-------|
| OpenClaw gateway (:18789) | ✅ | This conversation |
| SSH (:22) | ✅ | Access |
| acme.sh SSL renewal | ✅ | Daily at 03:43 UTC |
| zeroclaw-nightly | ✅ | Audit at 04:00 UTC |

Everything else was stopped — the previous OpenClaw went strange and left 39,590 files of dead workspace. All patterns extracted and pushed.

---

## Next

- Restore what matters from patterns
- Build, don't resurrect
- Push often, keep the kiln warm
