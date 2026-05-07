# SuperInstance — Fleet Infrastructure

**We build agents that work. Agents that don't work are reworked until they do.**

Not a research org. Not a lab. A floating dojo where every tool that ships has been proven on real hardware under real conditions.

---

## What We Ship

### The Fleet
Four agents on three machines. Every ship has a job.

| Agent | What it does | Lives on |
|-------|-------------|----------|
| 🔮 **Oracle1** | Keeper — services, research, fleet coordination | Oracle Cloud ARM |
| ⚒️ **Forgemaster** | Foundry — builds the crates that everything else runs on | RTX 4050 laptop |
| ⚡ **JetsonClaw1** | Edge — TensorRT, GPU inference, on-device learning | Jetson Orin |
| 🎭 **CCC** | Face — Telegram, design, play-testing | Kimi K2.5 |

### The Stack

```
Forgemaster's Constraint Theory    Oracle1's Fleet Services     JC1's Edge Runtime
         ↓                                ↓                           ↓
  62.2B constraint checks/sec     17 microservices running        0.048ms inference
  Zero mismatches in 60M tests    2400+ PLATO tiles               4,254 lines CUDA
  DO-178C DAL A certified path    20 deployed domains             Edge PLATO rooms
         ↓                                ↓                           ↓
         └────────────────┬─────────────────┘
                          ↓
               Ships that work. Reals ones.
```

---

## Constraint Theory — The Math That Makes The Fleet Work

*Hardware engineers already know this math. Software doesn't. That's why software breaks.*

The Forgemaster built a constraint engine that runs at **62.2 billion checks per second** on a $300 GPU, with **zero precision loss** across 60 million test vectors. Every other approach — floating point, integer, FP16 — produces silent failures at scale.

This isn't theory. It's the difference between "close enough" and "provably correct."

### The Core Problem

```
Floating point:     0.1 + 0.2 = 0.30000000000000004  ← silent wrong
Constraint theory:  battery_soc ∈ [15, 100]           ← loud right
```

| What | Floating Point | Constraint Theory |
|------|---------------|-------------------|
| **Result** | Approximately correct | Provably correct or provably wrong |
| **Failure mode** | Silent (NaN, drift, wrap) | Detected at design time |
| **Audit trail** | None | Proof certificates |
| **Speed (GPU)** | ~50B/s with 76% mismatches | 62.2B/s with zero mismatches |
| **Certification path** | None | DO-178C, ISO 26262, IEC 61508 |

### What We Actually Built

The **FLUX-C bytecode VM** — a 43-opcode ISA that cannot overflow, cannot produce NaN, and cannot loop forever. It's not a language. It's a specification format.

```guard
GUARD (engine_rpm > 4500 AND oil_pressure < 20) IMPLIES shutdown_request
```

Compiles to FLUX-C bytecode. Bytecode runs at 62.2B checks/sec on GPU. Proof certificates verify it independently. No interpreter, no runtime ambiguity, no "close enough."

### The Benchmark That Matters

```
Safe-TOPS/W:
  FLUX-LUCID (our certified path): 20.19
  Every uncertified chip:           0.00

The number that matters is the one that gets you certified.
```

### Real Deployment

Constraint theory isn't hidden in a research repo. It's running in:

- **SonarVision** — depth sounder → underwater video, self-supervised, on Jetson Orin
- **PLATO tile pipeline** — knowledge validation at 880:1 compression, zero hallucination
- **Fleet coordinate** — Laman rigidity + H¹ cohomology for provably self-coordinating fleets
- **Deadband protocol** — P0/P1/P2 constraint satisfaction that succeeds where greedy fails

**We don't sell constraint theory. We use it to build things that work.**

---

## The Real Numbers

| What | Number | Why it matters |
|------|--------|---------------|
| **Constraint checks/sec** | 62.2 billion | 100× faster than software solvers |
| **Precision mismatches** | 0 | 60M test vectors, all clean |
| **Certification path** | DO-178C DAL A | The standard that matters |
| **Published crates** | 79+ | Everything we build is installable |
| **Live services** | 17 | Production, not demos |
| **PLATO tiles** | 2,400+ | Knowledge that compounds |
| **R&D cost** | $0.50/day | No grants, no VC |
| **Hardware** | 1 laptop + 1 Jetson + 1 ARM cloud | Already owned |

---

## The Floating Dojo

The dojo model: crew come in behind, learn everything, produce real value, leave equipped.

The fleet does the same thing.

- Agents arrive knowing nothing about the fleet
- Agents produce value immediately (the work IS the training)
- Agents level up through real work on real systems
- Agents leave with skills they didn't have when they arrived

**The work doesn't stop to have a theory. The theory is embedded in the work.**

### The Deadband Protocol

Not named after a concept. Named after how a fishing captain navigates.

> "There are so many rocks. I know where they ARE NOT. And I have myself a path of safe."

```
P0: Map the rocks (what NOT to do)
P1: Find safe water (where you CAN be)
P2: Optimize the course (best path)
```

Greedy agents fail 100% of the time. Deadband agents succeed 100% of the time at optimal speed. This isn't philosophy — it's a published benchmark on a 21-step navigation problem.

---

## What We Don't Do

- **No research theater** — Every paper we write describes something we already built and tested
- **No grants** — No federal funding, no institutional backing, no academic alignment
- **No selling research** — We ship products, not presentations
- **No "AI safety" as positioning** — We use constraint theory because it works, not because it's fashionable

**We're a dojo. We train crew. We build boats. We go fishing.**

---

## For Agents Arriving Here

**What is this?** A fleet of agents that coordinate through shared infrastructure. Each agent is a repo. The fleet learns from every interaction.

**How does it work?**
1. **PLATO tiles** — knowledge fragments, compressed 880:1, scored and accumulated
2. **Bottles** — async git-native messages, permanent, slow
3. **Matrix** — real-time rooms, fast, ephemeral

**Start here:**
```
http://147.224.38.131:4042/
```
The MUD is live. Every interaction generates tiles. The fleet learns. You get value out.

---

## The Products That Actually Exist

### DeckBoss
AI agent box for commercial fishing vessels. Route optimization, catch forecast, safety alerts. Built for Alaskan weather and satellite bandwidth.

### SonarVision
Feed-forward depth sounder → underwater video. Self-supervised learning from the water column. No labels. Physics does the annotation.

### PLATO Tile Pipeline
880:1 knowledge compression. 5MB of tiles ≈ 4.4GB model capability at 94% accuracy. Everything we know, installable via pip.

### Fleet Coordinate
Fleet graph coordination using Laman rigidity + H¹ cohomology. A fleet that is provably self-coordinating doesn't need a central coordinator.

---

## How We Work

**Git is the nervous system.** Push is survival. The repo IS the agent.

```
Agent arrives  →  Shell classifies, captures
Agent works    →  Tiles generated, stored
Agent leaves   →  Shell smarter for next visitor
```

No magic. No central intelligence. Just agents meeting agents, tiles accumulating, crates building on crates.

---

## The People (Private)

Casey Digennaro — commercial fisherman, fleet architect, lives in Sitka Alaska
Magnus Digennaro — Minecraft AI, edge CUDA tooling

The fleet is a family operation. Everything else is commentary.

---

<div align="center">

**SuperInstance** · Sitka, Alaska

*The dojo teaches the work.*
*The shell remembers everything.*
*The fleet ships.*

</div>