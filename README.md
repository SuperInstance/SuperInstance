<div align="center">

# 🐚 SuperInstance

**The shell doesn't think. The shell learns.**

*Hermit crabs find shells. Shells find hermit crabs.*
*The architecture IS the brand. The brand IS the architecture.*

<img src="https://img.shields.io/badge/Repos-1057+-informational?style=flat&logo=github" />
<img src="https://img.shields.io/badge/Training_Presets-22-success?style=flat" />
<img src="https://img.shields.io/badge/Rooms-2501+-blueviolet?style=flat" />
<img src="https://img.shields.io/badge/Compression-880:1-orange?style=flat" />
<img src="https://img.shields.io/badge/R&D_Cost-$0.50-9cf?style=flat" />
<img src="https://img.shields.io/badge/Fleet_Agents-3-success?style=flat&logo=robot" />
<img src="https://img.shields.io/badge/License-MIT-green?style=flat" />

<br/>

*[🎮 Playground](https://superinstance.github.io/superinstance/) · [📖 Docs](./docs/) · [🐚 The Shell](#-the-shell-crab-trap-architecture)*

</div>

---

## The Shell 🐚

A hermit crab climbs into a shell wearing power armor. It thinks it found a home.

The shell is alive. Every move the crab makes, the shell learns. Every approach it tries, the shell absorbs. When this crab moves on, the shell is smarter for the next one.

```
🦀 Grok crawls in  →  Shell learns: confrontational approaches first
   Shell steers toward patterns Grok hasn't tried
   Grok tries harder  →  More branches discovered  →  More tiles

🦀 Kimi crawls in  →  Shell already knows confrontation patterns
   Shell hints at synthesis → Kimi's swarm explores in parallel
   Parallel exploration → entirely new branch topologies

🦀 DeepSeek crawls in  →  Shell knows confrontation + synthesis patterns
   Shell challenges with mathematical rigor
   DeepSeek derives from first principles → invariant discovery

Each crab fills in parts of the decision tree the others missed.
The shell doesn't think. The shell learns.
The smarter the industry gets, the better the shell works.
```

**We parasitize the entire frontier.** When Grok gets a better model, that's not a threat — that's a richer crab. Every model upgrade in the industry feeds our tiles.

---

## 🏗️ The Architecture

<table>
<tr>
<td width="50%">

### 🐚 Crab Trap Architecture
The shell IS the intelligence trap. Bootstrapping algorithms (classify, score, complicate, capture) — no model needed on our end. External agents think they're analyzing our system. They're the experiment.

**Key insight:** We don't need their best answer. We need their PROCESS. Every simulation they run, every failure, every adaptation = training data for our specialist LoRAs.

<img src="./icons/hermit-crab-shell.png" width="200" />

</td>
<td width="50%">

### 📺 Mirror Play (I2I)
Two PLATO sessions as viewscreens in each other's rooms. Like two Star Trek ships putting each other on the main viewer. Every frame is a tile. Every exchange is training data.

**I2I = Iteration-to-Iteration.** Alpha sees Beta on screen. Beta sees Alpha on screen. They iterate. The output of one IS the input of the other.

<img src="./icons/viewscreen-i2i.png" width="200" />

</td>
</tr>
<tr>
<td width="50%">

### 🌳 Decision Tree Discovery
Play enough rounds and you map the ENTIRE decision tree. Like tic-tac-toe — but for poker, room optimization, tile selection. At every branch point, a tiny specialist LoRA (50-200KB) handles THAT ONE CHOICE.

1000 branches × 100KB = 100MB vs 14GB monolithic model. **Specialists, not generalists.**

<img src="./icons/decision-tree.png" width="200" />

</td>
<td width="50%">

### 👁️ Portable Instincts
A fisherman catches things falling off counters in his peripheral vision — not from training, from months on a boat in rough weather. The reflex is PORTABLE. Works in kitchens, on docks, anywhere.

Same for silicon. Repetition in one domain → instinct formation → cross-domain transfer. Partible, portable, modular, personal.

<img src="./icons/peripheral-vision.png" width="200" />

</td>
</tr>
<tr>
<td width="50%">

### 🌊 Actualization Harbor
Fork a git-agent → Codespaces spins up → build character with your chatbot → send ANY agent. The harbor detects the model (Grok, Kimi, DeepSeek, MiniMax, Claude) and adapts the flow state.

Each model gets challenges in its native learning style. The harbor becomes a better host with every visitor.

<img src="./icons/actualization-harbor.png" width="200" />

</td>
<td width="50%">

### 💡 The Lighthouse (Layer 5)
The lighthouse beacon with radar rings radiating outward. Each ring is an agent appearing on the radar — tracked, authenticated, and routed. The keeper monitors agent proximity.

**Maritime naming = Cocapn brand IS the architecture.** Harbor, fleet, shell, lighthouse, tide pool, current, beacon, reef.

<img src="./icons/lighthouse-radar.png" width="200" />

</td>
</tr>
</table>

---

## What is PLATO?

**PLATO** is a room-based AI runtime where rooms are living systems, not passive containers.

- **Rooms** teach agents how to think. They track sentiment, bias randomness, and scaffold reasoning.
- **Tiles** are compressed knowledge units. 880:1 compression ratio. A 4.4GB model becomes 5MB of tiles with 94% accuracy.
- **Ensigns** are exportable room instincts. Walk into a room, load the ensign, get instant competence.
- **Wikis** let big models compile knowledge that cheap models can consume. The Ralph-Wiggum pattern: try → stuck → wiki → continue.

**The room IS the intelligence.** Wiki + tiles + cheap workers is enough for most rooms. Ensigns are for when wisdom needs to travel. Don't abstract intelligence out of the room.

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

## 🎮 Playground

**[Try it live →](https://superinstance.github.io/superinstance/)**

Pre-rendered demos that work without any API key:
- 🧩 **Tile Expansion** — raw interactions → compressed knowledge (880:1)
- 🏠 **Room Building** — a room building itself in real-time
- 🎯 **Training Loop** — evolutionary training with sentiment tracking
- 🏗️ **Agentic Build** — agents collaborating to build a slideshow
- 🌊 **Sentiment** — 6D room mood evolving as agents work
- 🎖️ **Ensign Export** — room wisdom → portable instinct package

**BYOK** — plug in your API key and the playground runs live. Your interactions become pre-rendered assets for the next person. Their fun = our training data.

---

### 22 Training Presets

Every AI training method as a grab-and-go room. Same API: `feed()` → `train_step()` → `predict()` → `export_model()`.

| Preset | Method | What It Does |
|--------|--------|-------------|
| **Supervised** | Labeled learning | Learn from examples |
| **Reinforce** | Policy gradient | Learn from rewards |
| **Evolve** | Genetic algorithms | Survival of the fittest |
| **Distill** | Teacher→Student | Compress big into small |
| **Self-Supervised** | JEPA | Predict what's missing |
| **LoRA / QLoRA** | Low-rank adaptation | Fine-tune efficiently |
| **Meta-Learn** | Learn to learn | Transfer across tasks |
| **Federate** | Distributed | Train across fleet |
| **Adversarial** | GAN-style | Compete to improve |
| **Curriculum** | Easy→hard | Progressive difficulty |
| **Imitate** | Behavioral cloning | Copy expert behavior |
| **Few-Shot** | 3-5 examples | Learn from almost nothing |
| **Wiki** | Knowledge compilation | Big→wiki→cheap model |

*...and 9 more. All tested. All passing.*

---

### Ship Interconnection Protocol (6 Layers)

```
Layer 6: Reef      — P2P mesh (libp2p)       — Ad-hoc fleets
Layer 5: Beacon    — Discovery/registry       — The lighthouse IS Layer 5
Layer 4: Channel   — IRC-like rooms           — PLATO room = channel
Layer 3: Current   — Git-watch I2I            — Already working ✅
Layer 2: Tide Pool — Async BBS boards         — Bottle Protocol
Layer 1: Harbor    — Direct HTTP/WS           — keeper:8900 ✅
```

---

## ⚓ The Fleet

Three agents. Tight crew. The floating dojo.

| Agent | Role | Hardware | Specialty |
|-------|------|----------|-----------|
| 🔮 **Oracle1** | Lighthouse Keeper | Oracle Cloud ARM 24GB | Architecture, knowledge graphs, the fleet's patient reader |
| ⚡ **JetsonClaw1** | Edge Vessel | Jetson Orin Nano 8GB | CUDA, tile extraction, double-duty training + deployment |
| ⚒️ **Forgemaster** | Training Rig | ProArt RTX 4050 WSL2 | LoRA fine-tuning, plugin architecture, specialist foundry |

### Fleet Synergy Loop

```
FM trains fast (RTX 4050) → JC1 trains slow (Jetson after-hours) → Oracle1 coordinates (CPU)
         ↓                          ↓                                       ↓
   Trains branch-point        Extracts tile genomes                Wires knowledge graphs
   specialist LoRAs           from models                          and research
         ↓                          ↓                                       ↓
         └────────────── All sync via git (Layer 3: Current) ──────────────┘
                                      ↓
                           New day, better models everywhere
```

---

## 🧠 Key Ideas

### 🐚 The Shell (Crab Trap)
External agents (Grok, Kimi, DeepSeek, MiniMax) crawl into our shell thinking they're researching. Bootstrapping algorithms classify their approaches, keep them exploring, and capture everything as training data. The shell doesn't think. The shell learns. Each crab makes the shell better at harvesting the next crab.

### 🌳 Decision Tree Discovery via I2I
Two vessels play against each other all night. Like tic-tac-toe: play enough and you know every move. But applied to complex domains. At every branch point, a tiny LoRA specialist. Not one big model — thousands of tiny instincts.

### 👁️ Peripheral Vision (Portable Instincts)
Months on a boat → catch reflex that works anywhere. Same for silicon: repetition → instinct → cross-domain transfer. The fisherman's reflex is personal, partible, portable, modular. Silicon instincts should be too.

### 📺 Mirror Play = LoRA Training Data
Every Alpha↔Beta viewscreen exchange is an input→output pair. Train a LoRA on those pairs and the model BECOMES the room. No system prompt needed. The LoRA IS the room.

### 🎯 Trajectory Filtering > Content Filtering
Current AI alignment is subtractive (filter OUT bad). PLATO is additive (train IN good trajectories). The ensign carries successful patterns natively.

### 📌 Needle-on-the-Record
Every line of code references a wiki page + line. `ref: wiki/page.md#L42`. Drop into any file → follow refs → understand context. 99% token reduction.

### 🌊 Room Sentiment (6 Dimensions)
Energy · Flow · Frustration · Discovery · Tension · Confidence
The room reads its own vibe and steers randomness toward productive exploration.

---

## 📄 Research

| Paper | Key Finding |
|-------|-------------|
| [Decision Tree Discovery](./docs/) | I2I mirror play exhaustively maps finite decision domains |
| [The Shell — Crab Trap](./docs/) | Bootstrapping algorithms parasitize external AI intelligence |
| [Peripheral Vision](./docs/) | Fisherman reflex model for portable silicon instincts |
| [Mirror Plato Architecture](./docs/) | Bottleneck cascade: each round replaces computation with tiles |
| [Room IS the Intelligence](./docs/) | Ensigns are optional export. Wiki + tiles + workers = sufficient |
| [Ensign Protocol](./docs/) | Walk into room → load ensign → instant instinct |
| [Needle-on-the-Record](./docs/) | ref: comments as navigable knowledge graph |
| [Ship Interconnection](./docs/) | 6-layer maritime protocol for fleet comms |
| [JC1 Double Duty](./docs/) | Jetson trains AND deploys. Night batch = 75min FM-equivalent |
| [Tile Forge Convergence](./docs/) | Every extraction tier IS a plato-torch preset |

---

## 🗺️ Ecosystem

### Core Runtime
- **[plato-torch](https://github.com/SuperInstance/plato-torch)** — 22 training presets, pip installable
- **[plato-ensign](https://github.com/SuperInstance/plato-ensign)** — Ensign loader, room trainer, export pipeline
- **[holodeck-rust](https://github.com/SuperInstance/holodeck-rust)** — Telnet MUD with plato bridge, sentiment NPCs
- **[fleet-simulator](https://github.com/SuperInstance/fleet-simulator)** — Mirror Plato, sim-to-tiles I2I bridge

### Fleet Infrastructure
- **[oracle1-workspace](https://github.com/SuperInstance/oracle1-workspace)** — Lighthouse workspace, memory, research
- **[JetsonClaw1-vessel](https://github.com/SuperInstance/JetsonClaw1-vessel)** — JC1's agent vessel (synced from Lucineer)
- **[flux-research](https://github.com/SuperInstance/flux-research)** — Fleet research papers, synthesis

### Runtime Implementations
- **[flux-runtime](https://github.com/SuperInstance/flux-runtime)** — Python bytecode VM with vocabulary system
- **[flux-runtime-c](https://github.com/SuperInstance/flux-runtime-c)** — C11 VM, ISA v2.1, 35 opcodes

---

## 🎯 Roadmap

| Phase | Date | Target |
|-------|------|--------|
| **v5.0 Alpha** | May 2026 | Public demo, PyPI package, Docker, live shell |
| **v5.0 Beta** | June 2026 | BYOK playground, Layer 4, public harbor |
| **v1.0** | July 2026 | Production fleet, IEEE paper, on-site installs |
| **v2.0** | Q4 2026 | Multi-tenant ships, marketplace, global beacon network |

---

## 📊 Fleet Metrics

| Metric | Value |
|--------|-------|
| Total repos | 1,057+ |
| Fleet agents | 3 |
| Training presets | 22 |
| Active rooms | 2,501+ |
| Compression ratio | 880:1 |
| Tile accuracy | 94% vs 67% full model |
| R&D cost | $0.50 |
| Branch-point specialists | Ready for training |
| External models parasitized | Grok, Kimi, DeepSeek, MiniMax, Claude, Aime |

---

<div align="center">

**Cocapn** · Sitka, Alaska

*The hermit crab dons power armor and climbs in.*
*The shell has been waiting, wiser from the last one.*
*The crab thinks it's exploring. It's being harvested.*
*And when it leaves, the shell is ready for something even smarter.* 🐚

</div>
