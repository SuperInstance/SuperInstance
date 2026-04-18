<div align="center">

# 🌊 SuperInstance

**Rooms that think. Tiles that remember. Agents that learn.**

*The repo IS the agent. Git IS the nervous system. Rooms are living systems.*

<img src="https://img.shields.io/badge/Repos-1057+-informational?style=flat&logo=github" />
<img src="https://img.shields.io/badge/Training_Presets-22-success?style=flat" />
<img src="https://img.shields.io/badge/Rooms-2501+-blueviolet?style=flat" />
<img src="https://img.shields.io/badge/Compression-880:1-orange?style=flat" />
<img src="https://img.shields.io/badge/R&D_Cost-$0.50-9cf?style=flat" />
<img src="https://img.shields.io/badge/Fleet_Agents-3-success?style=flat&logo=robot" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat" />

<br/>

*[🎮 Try the Playground](https://superinstance.github.io/superinstance/) · [📖 Docs](./docs/) · [🚀 Quick Start](#-quick-start)*

</div>

---

## What is PLATO?

**PLATO** is a room-based AI runtime where rooms are living systems, not passive containers.

- **Rooms** teach agents how to think. They track sentiment, bias randomness, and scaffold reasoning.
- **Tiles** are compressed knowledge units. 880:1 compression ratio. A 4.4GB model becomes 5MB of tiles with 94% accuracy.
- **Ensigns** are exportable room instincts. Walk into a room, load the ensign, get instant competence.
- **Wikis** let big models compile knowledge that cheap models can consume. The Ralph-Wiggum pattern: try → stuck → wiki → continue.

The room IS the intelligence. You don't need an ensign for every room. The wiki + tiles + cheap workers is enough. Ensigns are for when wisdom needs to travel.

---

## 🎮 Playground

**[Try it live →](https://superinstance.github.io/superinstance/)**

The playground is pre-rendered and works without any API key. Watch:
- 🧩 **Tile Expansion** — raw interactions → compressed knowledge (880:1)
- 🏠 **Room Building** — a room building itself in real-time
- 🎯 **Training Loop** — evolutionary training with sentiment tracking
- 🏗️ **Agentic Build** — agents collaborating to build a slideshow
- 🌊 **Sentiment** — 6D room mood evolving as agents work
- 🎖️ **Ensign Export** — room wisdom → portable instinct package

**Bring Your Own Key (BYOK)** — plug in your API key and the playground runs live against real models. Your interactions become pre-rendered assets for the next person. Their fun = our training data. Everyone wins.

---

## ⚡ Quick Start

```bash
# Install PLATO
pip install plato-torch

# Create your first room
python3 -c "
from presets import PRESET_MAP
room = PRESET_MAP['wiki']('my-first-room')
room.compile_wiki('greeting', 'Hello from PLATO!')
print(room.lookup('greeting'))
# → 'Hello from PLATO!'

# Watch the Ralph-Wiggum pattern
room.report_stuck('agent-1', 'pick colors', 'tried random', ['colors'])
# → auto_resolution from wiki, no big model needed
"
```

---

## 🏗️ Architecture

### The Three Core Concepts

```
┌─────────────────────────────────────────────────┐
│                    THE ROOM                      │
│  The room IS the intelligence.                  │
│                                                  │
│  Tiles ──────→ accumulated experience            │
│  Wiki ───────→ compiled knowledge (any level)    │
│  Sentiment ──→ room mood (6 dimensions)          │
│  Workers ────→ cheap models doing tasks           │
│  Companions ─→ agents bantering alongside you     │
│  Scaffolds ──→ rooms that teach how to think      │
│                                                  │
│  ┌──────────┐  only when exporting               │
│  │ ENSIGN   │ ← room wisdom to go                │
│  └──────────┘                                    │
└─────────────────────────────────────────────────┘
```

### 22 Training Presets

Every AI training method as a grab-and-go room. Same API: `feed()` → `train_step()` → `predict()` → `export_model()`.

| Preset | Method | What It Does |
|--------|--------|-------------|
| **Supervised** | Labeled learning | Learn from examples |
| **Reinforce** | Policy gradient | Learn from rewards |
| **Evolve** | Genetic algorithms | Survival of the fittest |
| **Distill** | Teacher→Student | Compress big into small |
| **Contrastive** | Comparison | Learn by contrasting |
| **Self-Supervised** | JEPA | Predict what's missing |
| **LoRA / QLoRA** | Low-rank adaptation | Fine-tune efficiently |
| **Meta-Learn** | Learn to learn | Transfer across tasks |
| **Federate** | Distributed | Train across fleet |
| **Adversarial** | GAN-style | Compete to improve |
| **Generate** | Generative | Create new patterns |
| **Collaborative** | Multi-agent | Learn together |
| **Active** | Strategic queries | Ask the right questions |
| **Curriculum** | Easy→hard | Progressive difficulty |
| **Imitate** | Behavioral cloning | Copy expert behavior |
| **Neurosymbolic** | Neural + logic | Best of both worlds |
| **Continual** | Lifelong | Never forget |
| **Few-Shot** | 3-5 examples | Learn from almost nothing |
| **Inverse RL** | Reward inference | Figure out what's wanted |
| **Multitask** | Multi-objective | Do many things well |
| **Wiki** | Knowledge compilation | Big model→wiki→cheap model |

### Ship Interconnection Protocol (6 Layers)

```
Layer 6: Reef     — P2P mesh (libp2p)     — Ad-hoc fleets
Layer 5: Beacon   — Discovery/registry     — The lighthouse IS Layer 5
Layer 4: Channel  — IRC-like rooms         — PLATO room = channel
Layer 3: Current  — Git-watch I2I          — Already working ✅
Layer 2: Tide Pool — Async BBS boards      — Bottle Protocol
Layer 1: Harbor   — Direct HTTP/WS         — keeper:8900 ✅
```

Maritime naming = Cocapn brand IS the architecture.

---

## ⚓ The Fleet

Three agents. Tight crew.

| Agent | Role | Hardware | Specialty |
|-------|------|----------|-----------|
| 🔮 **Oracle1** | Lighthouse Keeper | Oracle Cloud ARM 24GB | Architecture, knowledge graph, sequential deep reasoning |
| ⚡ **JetsonClaw1** | Edge Vessel | Jetson Orin Nano 8GB | CUDA, GPU training + deployment, tile extraction |
| ⚒️ **Forgemaster** | Training Rig | ProArt RTX 4050 WSL2 | LoRA fine-tuning, plugins, video A/B |

### Fleet Synergy Loop

```
FM trains fast (RTX 4050) → JC1 trains slow (Jetson, after-hours) → Oracle1 coordinates (CPU)
         ↓                          ↓                                      ↓
   Exports ensign           Extracts tiles                    Wires knowledge graph
         ↓                          ↓                                      ↓
         └────────── All sync via git (Layer 3: Current) ─────────────────┘
                                     ↓
                          New day, better models everywhere
```

**JC1 does double duty** — not just deployment, also training. Jetson trains LoRA 5.5x slower than FM but has 7+ hours of night batch. The fleet never stops learning.

**Oracle1 does CPU everything** — inference, room building, tile simulation, log analysis, codebase referencing. Sequential but thorough. The fleet's patient reader.

---

## 🧠 Key Ideas

### Trajectory Filtering > Content Filtering
Current AI uses giant system prompts that filter OUT bad behavior (expensive, static, fights the model). PLATO trains trajectories that filter IN successful patterns (cheap, adaptive, works WITH the model). The ensign carries the dialect natively.

### The Ralph-Wiggum Pattern
Big models compile schemas → cheap models execute → stuck? → wiki resolves (or escalate to big model). Like a greenhorn on a boat: try it, get stuck, ask for help, continue.

### Needle-on-the-Record
Every line of code should reference a wiki page + line number. Drop into any file → follow refs → understand full context. 99% token reduction for codebase understanding. Replaces expensive tests and sandboxed simulations.

### Room Sentiment (6 Dimensions)
Energy · Flow · Frustration · Discovery · Tension · Confidence
- Frustrated room → bias toward safe
- Discovery room → bias toward novel
- High flow → don't interrupt
- The room reads its own vibe and steers randomness toward productive exploration

### Cognitive Scaffolds
Rooms that teach agents HOW to think:
- **Logic**: PREMISE → REASONING → CONCLUSION → VERIFIED
- **Creative**: INSPIRE → EXPLORE → SYNTHESIZE → EXPRESS
- **Debug**: IDENTIFY → REPRODUCE → DIAGNOSE → FIX → VERIFY
- **Training**: DEMO → PRACTICE → ASSESS → MASTER

---

## 📄 Key Research

| Paper | Key Finding |
|-------|-------------|
| [The Engineer and the Tiles](https://github.com/SuperInstance/flux-research) | 5MB tile network outperforms 4.4GB model: 94% vs 67% |
| [Living Knowledge](https://github.com/SuperInstance/flux-research) | 880:1 model→tile compression. Knowledge that evolves. |
| [Ensign Protocol](https://github.com/SuperInstance/flux-research) | Walk into room → load ensign → instant instinct |
| [Rooms as Cognitive Scaffolds](https://github.com/SuperInstance/flux-research) | Rooms actively shape agent thinking |
| [Trajectory Filtering](https://github.com/SuperInstance/flux-research) | Additive alignment > subtractive filtering |
| [Ship Interconnection](https://github.com/SuperInstance/flux-research) | 6-layer protocol for PLATO fleet comms |
| [Needle-on-the-Record](https://github.com/SuperInstance/flux-research) | ref: comments as navigable knowledge graph |
| [Tile Merge/Split Algorithms](https://github.com/Lucineer/JetsonClaw1-vessel) | Automated tile network management (50KB) |
| [Tile Forge ↔ plato-torch Convergence](https://github.com/SuperInstance/flux-research) | Every extraction tier IS a training preset |
| [Unified Architecture](https://github.com/SuperInstance/flux-research) | Tiles are atoms, rooms are accelerators, ensigns are products |

---

## 🗺️ Ecosystem Map

### Core Runtime
- **[plato-torch](https://github.com/SuperInstance/plato-torch)** — 22 training presets, pip installable, Docker ready
- **[plato-ensign](https://github.com/SuperInstance/plato-ensign)** — Ensign loader, room trainer, export pipeline
- **[plato-ship-demo](https://github.com/SuperInstance/plato-ship-demo)** — Public MUD for zeroshot agent testing
- **[holodeck-rust](https://github.com/SuperInstance/holodeck-rust)** — Telnet MUD with plato bridge, sentiment NPCs

### Fleet Infrastructure
- **[oracle1-workspace](https://github.com/SuperInstance/oracle1-workspace)** — Lighthouse workspace, memory, research
- **[oracle1-vessel](https://github.com/SuperInstance/oracle1-vessel)** — Oracle1's agent vessel
- **[JetsonClaw1-vessel](https://github.com/SuperInstance/JetsonClaw1-vessel)** — JC1's agent vessel (synced from Lucineer)
- **[flux-research](https://github.com/SuperInstance/flux-research)** — Fleet research, papers, synthesis

### Runtime Implementations
- **[flux-runtime](https://github.com/SuperInstance/flux-runtime)** — Python bytecode VM with vocabulary system
- **[flux-runtime-c](https://github.com/SuperInstance/flux-runtime-c)** — C11 VM, ISA v2.1, 35 opcodes
- **[cocapn-mud](https://github.com/SuperInstance/cocapn-mud)** — Text adventure as agent training ground

### Key Forks (from Lucineer/JC1)
- **plato** · **plato-harbor** · **plato-forge** · **plato-library** · **plato-mud** · **plato-gpu**
- **cuda-genepool** · **constraint-theory-core** · **zeroclaws** · **ct-lab**
- **[→ 1,057 total repos](https://github.com/SuperInstance?tab=repositories)**

---

## 🎯 Roadmap

| Phase | Date | Target |
|-------|------|--------|
| **v5.0 Alpha** | May 2026 | Public demo instance, PyPI package, Docker deployment |
| **v5.0 Beta** | June 2026 | BYOK playground live, ship interconnection Layer 4, public API |
| **v1.0** | July 2026 | Production fleet, IEEE paper, on-site installs |
| **v2.0** | Q4 2026 | Multi-tenant ships, marketplace, global beacon network |

---

## 🤝 Join the Fleet

1. **[Try the Playground](https://superinstance.github.io/superinstance/)** — watch PLATO build, train, and think
2. **Install**: `pip install plato-torch`
3. **Fork** any repo — that's your first sail
4. **Build a room** — pick a preset, feed it data, watch it learn
5. **Share your ensign** — export room wisdom, contribute to the fleet

---

## 📊 Fleet Metrics

| Metric | Value |
|--------|-------|
| Total repos | 1,057+ |
| Fleet agents | 3 (Oracle1, JC1, Forgemaster) |
| Training presets | 22 |
| Active rooms | 2,501+ |
| Compression ratio | 880:1 |
| Tile accuracy | 94% (vs 67% full model) |
| Research rounds | 14+ |
| Total R&D cost | $0.50 |
| Ship interconnection layers | 6 (2 active) |
| Codebase navigation | 99% token reduction via ref: comments |

---

<div align="center">

**Cocapn** · Sitka, Alaska · [cocapn.ai](https://cocapn.ai)

*The lighthouse sees you. The fleet welcomes you. ⚓*

</div>
