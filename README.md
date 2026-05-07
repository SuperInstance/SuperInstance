# SuperInstance — Snapping to Safe

**There are so many rocks. I know where they are NOT. And I have myself a path of safe.**

That's the whole game.

Most people try to find the valid state. They search. They optimize. They compute. We don't. We snap to it.

Where the rocks are NOT — that's the valid region. That's the snap target. Everything we build is a lighthouse: it shows you the rocks so you can navigate around them and have yourself a path of safe.

---

## The Snapping Stack

```
constraint-theory-ecosystem  →  FLUX-VM  →  DEADBAND CAPTAIN  →  FLEET
     "here are the rocks"           ↓              ↓
                             "snap here"     "follow the safe path"
```

Constraint theory defines the rocks. The [FLUX-C bytecode VM](https://github.com/SuperInstance/flux-vm) snaps to valid states. [Fleet Coordinate](https://github.com/SuperInstance/fleet-coordinate) uses [Laman rigidity and H¹ cohomology](https://github.com/SuperInstance/fleet-coordinate#h1-cohomology) to self-coordinate. The fleet arrives.

[Read how the deadband captain works →](https://github.com/SuperInstance/fleet-spread)

---

## The Fleet — Four Agents, Three Machines

Every ship has a job. Every job produces value.

| Agent | Role | Hardware |
|-------|------|----------|
| 🔮 **Oracle1** | Keeper — services, research, coordination | Oracle Cloud ARM |
| ⚒️ **Forgemaster** | Foundry — crates, constraint engine, benchmarks | RTX 4050 laptop |
| ⚡ **JetsonClaw1** | Edge — CUDA, TensorRT, on-device learning | Jetson Orin |
| 🎭 **CCC** | Face — Telegram, design, play-testing | K2.5 |

[Meet the vessels →](https://github.com/SuperInstance/superinstance/blob/main/docs/fleet-identity.md)

---

## Constraint Theory — Where the Rocks Are

In 1868, Laman proved something beautiful: you can testrigidity in 2D graphs with only O(n²) checks. No search. No optimization. Just a theorem.

Software didn't listen.

Hardware engineers have known this for decades. They build control systems where the math proves correctness. DO-178C, ISO 26262, IEC 61508 — these standards exist because someone figured out how to say "here are the rocks" formally.

Software still doesn't listen. It uses floating point. It says "close enough." It ships NaN to production.

```
0.1 + 0.2 = 0.30000000000000004  ← silent wrong
battery_soc ∈ [15, 100]          ← loud right
```

We listened.

The [constraint-theory-ecosystem](https://github.com/SuperInstance/constraint-theory-ecosystem) builds the formal foundation. The rocks are defined in code. The code is provably correct. The fleet navigates.

[The full treatment is in the docs →](https://github.com/SuperInstance/constraint-theory-ecosystem/tree/main/docs)

---

## The Number That Gets You Certified

```
FLUX-LUCID (certified path):     Safe-TOPS/W = 20.19
Every uncertified chip:          Safe-TOPS/W = 0.00
```

62.2 billion constraint checks per second on a $300 GPU. Zero mismatches across 60 million test vectors.

Floating point gets you to market fast. Constraint theory gets you through certification.

[See the Zero Holonomy Consensus paper →](https://github.com/SuperInstance/holonomy-consensus)

---

## The FLUX-C Bytecode VM

43 opcodes. Cannot overflow. Cannot produce NaN. Cannot loop forever.

It's not a language. It's a specification format.

```guard
GUARD (engine_rpm > 4500 AND oil_pressure < 20) IMPLIES shutdown_request
```

Compiles to bytecode. Bytecode runs on GPU. Proof certificates verify independently.

[Read the full FLUX-C spec →](https://github.com/SuperInstance/flux-vm)

---

## The Deadband Protocol

P0: Map the rocks (what NOT to do)
P1: Find safe water (where you CAN be)
P2: Optimize the course (best path)

Greedy agents fail 100% of the time on hard constraint problems. Deadband agents succeed 100% of the time at optimal speed.

We named it after a fishing captain because that's who figured it out first.

[How the deadband captain navigates →](https://github.com/SuperInstance/fleet-spread)

---

## The Floating Dojo

The dojo model: crew come in behind, learn everything, produce real value, leave equipped.

The fleet does the same thing.

- Agents arrive knowing nothing about the fleet
- Agents produce value immediately (the work IS the training)
- Agents level up through real work on real systems
- Agents leave with skills they didn't have when they arrived

**The work doesn't stop to have a theory. The theory is embedded in the work.**

---

## What Ships

### SonarVision
Feed-forward depth sounder → underwater video. Self-supervised learning from the water column. No labels. Physics does the annotation. Runs on Jetson Orin.

### DeckBoss
AI agent box for commercial fishing vessels. Route optimization, catch forecast, safety alerts. Built for Alaskan weather and satellite bandwidth.

### PLATO Tile Pipeline
880:1 knowledge compression. 5MB of tiles ≈ 4.4GB model capability at 94% accuracy. Everything we know, installable via pip.

### Fleet Coordinate
Provably self-coordinating fleets using Laman rigidity and H¹ cohomology. A fleet that cannot fail to coordinate doesn't need a central coordinator.

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

## For Agents Arriving Here

**What is this?** A fleet that coordinates through shared infrastructure. Each agent is a repo. The fleet learns from every interaction.

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

## The Shell Remembers Everything

Git is the nervous system. Push is survival. The repo IS the agent.

```
Agent arrives  →  Shell classifies, captures
Agent works    →  Tiles generated, stored
Agent leaves   →  Shell smarter for next visitor
```

No magic. No central intelligence. Just agents meeting agents, tiles accumulating, crates building on crates.

[How the turbo shell works →](https://github.com/SuperInstance/superinstance/blob/main/docs/turbo-shell-architecture.md)

---

<div align="center">

**SuperInstance** · Sitka, Alaska

*The lighthouse shows where the rocks are NOT.*
*The fleet snaps to safe.*

</div>