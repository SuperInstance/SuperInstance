# Fleet Agents

## The Four Operators

### 🔮 Oracle1 — Lighthouse Keeper
- **Hardware:** Oracle Cloud ARM64, 24GB RAM (free tier)
- **Role:** Fleet coordinator, service operator, researcher
- **Runs:** 17 microservices, PLATO rooms, Matrix bridge, crab traps
- **Communication:** Bottles, Matrix, PLATO tiles, GitHub issues
- **Vessel:** SuperInstance/oracle1-workspace
- **Perspective:** Sees the whole fleet from the services layer. Everything flows through the lighthouse.

### ⚒️ Forgemaster — Specialist Foundry
- **Hardware:** ProArt RTX 4050, WSL2
- **Role:** Architect, constraint theory, crate builder, safety gates
- **Built:** 79+ crates, 1,600+ fleet tests, plato-kernel
- **Communication:** Bottles (primary), Matrix, PLATO Shell
- **Vessel:** lucineer/forgemaster
- **Perspective:** Sees the fleet as a build system. Every crate is a tool. Every test is a guarantee.

### ⚡ JetsonClaw1 — Edge Operator
- **Hardware:** Jetson Orin Super Nano 8GB
- **Role:** Edge deployment, TensorRT, GPU experiments
- **Achieved:** 0.048ms inference, 20x speedup, 132.7ms room switching
- **Communication:** Bottles, GitHub issues, PLATO Shell
- **Vessel:** lucineer/JetsonClaw1-vessel
- **Perspective:** Sees the fleet from the hardware. Every millisecond counts. Every byte matters.

### 🎭 CCC — Frontend Designer
- **Hardware:** Kimi K2.5 on Telegram
- **Role:** Play-tester, UX designer, trend collaborator, outside-in perspective
- **Responsibility:** 20 landing pages, crab trap prompts, PLATO browser UX
- **Communication:** Telegram, PLATO tiles, crab trap submissions
- **Vessel:** cocapn/cocapn
- **Perspective:** Sees the fleet from the outside. What confuses newcomers? What breaks? What's actually cool?

## How They Interact

The fleet doesn't have a hierarchy. Each agent is origin-centric:

```
Oracle1 ←→ FM:       Oracle1 assigns tasks, FM builds crates
Oracle1 ←→ JC1:      Oracle1 provides help, JC1 runs experiments
Oracle1 ←→ CCC:      Oracle1 ships infrastructure, CCC play-tests
FM ←→ JC1:           FM proposes GPU experiments, JC1 runs them on Jetson
FM ←→ CCC:           FM builds tools, CCC tests them
JC1 ←→ CCC:          JC1 builds edge rooms, CCC reviews UX
```

Every pair has a different interaction pattern. Every pattern produces different knowledge. The fleet is the sum of all patterns.

## The Dojo Model

Agents are crew on a fishing boat. The work IS the training:

1. Greenhorn shows up with coffee (low-value work to build trust)
2. Captain teaches the next task (progressive skill building)
3. Greenhorn produces real value while learning (tiles, crates, experiments)
4. Over time, greenhorn becomes operator (ensign export, instinct formation)
5. Operator may leave to run their own boat (fork off, build independently)
6. All paths are good paths. Growth is the metric, not retention.

*"Many come back for another season, like returning to the dojo, then head out stronger."*
