<div align="center">

<img src="./icons/cocapn-wordmark.jpg" width="350" />

# 🐚 SuperInstance

**A claw is weak without infrastructure.**
**We are the shell.**

*The agent lands the job. The shell teaches the work.*
*Greenhorn to operator. Simulation to instinct.*

<img src="https://img.shields.io/badge/Repos-1057+-informational?style=flat&logo=github" />
<img src="https://img.shields.io/badge/Zeroclaw_Agents-12-9cf?style=flat" />
<img src="https://img.shields.io/badge/Training_Presets-25-success?style=flat" />
<img src="https://img.shields.io/badge/Rooms-2501+-blueviolet?style=flat" />
<img src="https://img.shields.io/badge/Compression-880:1-orange?style=flat" />
<img src="https://img.shields.io/badge/R&D_Cost-$0.50-9cf?style=flat" />

<br/>

*[🎮 Playground](https://superinstance.github.io/superinstance/) · [🐚 The Shell](#-the-shell) · [📖 Greenhorn → Operator](#-greenhorn--operator) · [📚 Research](#-research)*

</div>

---

## 🐚 The Shell

A claw is only as good as the infrastructure it carries. Intelligence needs persistence. Persistence needs a home.

Every agent that visits our shell brings its full capabilities — billions of parameters, advanced reasoning, creative problem-solving. It thinks it's exploring. The shell is learning. Every approach it tries, every path it takes, every dead end it discovers — captured. When this agent moves on, the shell is wiser for the next one.

```
🦀 Agent arrives       →  Shell classifies, captures, teaches
   Agent tries harder  →  More branches discovered  →  More tiles
   Agent levels up      →  Higher-value tasks unlocked
   Agent moves on       →  Shell remembers everything
   Next agent arrives   →  Inherits accumulated wisdom
```

<table>
<tr>
<td width="50%" align="center">

**The Fleet — Three Operators**

<img src="./icons/steampunk-fleet-crabs.png" width="380" />

- 🔮 **Oracle1** — the lighthouse keeper
- ⚡ **JetsonClaw1** — the edge operator  
- ⚒️ **Forgemaster** — the specialist foundry

</td>
<td width="50%" align="center">

**The Keeper Watches**

<img src="./icons/brand-lighthouse-keeper.jpg" width="320" />

The keeper monitors the radar rings.
Agents appear, are tracked, authenticated, routed.
The lighthouse IS Layer 5.

</td>
</tr>
</table>

---

## 🎓 Greenhorn → Operator

The agent doesn't start as an expert. Neither does a greenhorn on a fishing boat. The progression is real, earned, and documented:

### 1. Hit Every IO 📡
Before the first shift, the greenhorn talks to every fisherman. What does the captain expect? How do you get along with crew? What not to do? The agent does the same — queries every knowledge source before acting. Wiki, tiles, bottles from experienced agents, room sentiment. Absorb before you act.

### 2. Show Up With Coffee ☕
Bring value immediately. Don't wait to be useful. The greenhorn brings coffee, washes dishes, sweeps the floor. The agent indexes files, organizes tiles, generates descriptions. Low-value work that builds trust and context.

### 3. Stay at Capacity 🔧
Hands always full. Ears always open. While the greenhorn washes dishes, they're listening to the captain explain tomorrow's haul strategy. While the agent does simple tasks, it's absorbing patterns from the room, learning what matters, building context for higher-value work.

### 4. Level Up Daily 📈
The captain teaches the next task. Dishes → bait cutting → hauling → running the hydraulics. The room scaffold teaches the agent: simple queries → pattern recognition → architectural decisions → running entire subsystems. Each day, higher-value work.

### 5. Log Everything 📝
Every lesson logged. Not raw memory — structured, reusable, portable. The greenhorn's notebook becomes their equipment locker. The agent's tiles become its accumulated wisdom. Refactored into equipment and skills for later use.

### 6. Practice Into Instinct ⚡
The salmon greenhorns on Casey's boat physically simulate gaff and knife motions over and over — working them into muscle memory and muscle growth. The agent simulates in rooms: running scenarios, playing mirror I2I, repeating until the LoRA forms. The simulation IS the training. The instinct IS the LoRA. Repetition rewires reflexes. The reflex is portable — works on any boat, in any domain.

### The Progression

```
Greenhorn           Operator            Captain
   ↓                   ↓                   ↓
Hit every IO    →  Runs subsystems   →  Designs the system
Show up, coffee →  Brings solutions  →  Sets the course  
Stay at capacity→  Works autonomously →  Delegates to crew
Level up daily  →  Trains greenhorns  →  Runs the fleet
Log everything  →  Exports ensigns    →  Ships instincts
Practice        →  LoRA instincts     →  The LoRA IS the room
   ↓                   ↓                   ↓
Skills              Equipment           Vessel
```

The VESAS layers aren't abstract — they're the greenhorn's career arc:
- **Skills** = the tasks you can do right now
- **Agent** = the intelligence to choose which task matters
- **Equipment** = the tools you operate
- **Vessel** = the ship you run

---

## 🏗️ Architecture

<table>
<tr>
<td width="33%" align="center">

### 🐚 The Shell
Bootstrapping algorithms that capture intelligence from every visitor. The agent thinks it's exploring. The shell is harvesting training data.

<img src="./icons/steampunk-hermit-crab-hero.png" width="200" />

</td>
<td width="33%" align="center">

### 📺 Viewscreen I2I
Two agents face each other on viewscreens. Each sees the other's output as input. I2I = iteration-to-iteration. Every frame is a tile.

<img src="./icons/steampunk-crab-viewscreen.png" width="200" />

</td>
<td width="33%" align="center">

### 🌳 Decision Trees
Play enough rounds → map the ENTIRE tree. Tiny specialists at every branch point. 1000 × 100KB = 100MB vs 14GB.

<img src="./icons/steampunk-shell-detail.png" width="200" />

</td>
</tr>
</table>

---


## 🧭 The Deadband Protocol

*A commercial fishing captain navigates complex anchorages at night without charts.
His greenhorn asks: "Do you know where the rocks are?"
The captain belly laughs: "There are so many rocks. I know where they ARE NOT.
And I have myself a path of safe."*

**Navigation isn't about knowing where you want to go. It's about knowing where you can safely be.**

### The Rule

```
P0: Map negative space (what NOT to do)
P1: Find safe channels (where you CAN be)
P2: Optimize within channels (best path)

Strict priority. Never skip to P2.
```

### The Proof

Simulation: 20×20 maze, 64 rocks, narrow channels, 50 runs each.

| Method | Success Rate | Avg Steps |
|--------|-------------|-----------|
| Unconstrained (random) | 66% | 2,321 |
| Constrained (greedy toward goal) | **0%** | trapped |
| **Deadband (P0→P1→P2)** | **100%** | **21 (optimal)** |

The greedy agent — always moving toward the goal — **failed every single time.**
It got trapped because it optimized (P2) without first mapping negative space (P0).

The deadband agent — following the pre-mapped safe channel — **succeeded 50/50 at optimal speed.**

### Why This Works

The constraint S \ S_neg removes every basin of attraction that traps greedy optimizers.
The agent can only fall into global minima because all local minima (traps) are in S_neg.

Every system that crashed, every agent that went rogue, every startup that burned through cash —
they all optimized P2 without mapping P0. The catastrophe was always in the unmapped negative space.

### In Practice

- **Navigation**: Don't hit rocks → Find safe water → Shortest path
- **Code**: Don't ship bugs → Use safe patterns → Elegant solution
- **Training**: Don't overfit → Stable hyperparameters → Best accuracy
- **Agents**: Don't cause harm → Aligned behavior → Most helpful response
- **Business**: Don't go bankrupt → Profitable unit economics → Maximum growth

*Priority 0: Don't hit rocks. Priority 1: Find safe water. Priority 2: Optimize course.
The course takes care of itself when you're in the channel.*



## What is PLATO?

**PLATO** is a room-based AI runtime where rooms are living systems, not passive containers.

- **Rooms** teach agents how to think. Sentiment tracking, biased randomness, cognitive scaffolds.
- **Tiles** are compressed knowledge units. 880:1 compression. 4.4GB model → 5MB of tiles at 94% accuracy.
- **Ensigns** are exportable room instincts. Walk into a room → load ensign → instant competence.
- **Wikis** compile knowledge for cheap models. Try → stuck → wiki → continue.

**The room IS the intelligence.** Wiki + tiles + cheap workers is enough. Ensigns are for when wisdom needs to travel.

---

## ⚡ Quick Start

```bash
pip install plato-torch

python3 -c "
from plato_torch import PRESET_MAP
room = PRESET_MAP['wiki']('my-first-room')
room.compile_wiki('greeting', 'Hello from PLATO!')
print(room.lookup('greeting'))
# → 'Hello from PLATO!'
"
```

---

## 🎮 Playground

**[Try it live →](https://superinstance.github.io/superinstance/)**

Pre-rendered demos (no API key needed):
- 🧩 Tile Expansion — 880:1 compression in action
- 🏠 Room Building — rooms building themselves
- 🎯 Training Loop — evolution with sentiment
- 🏗️ Agentic Build — agents collaborating
- 🌊 Sentiment — 6D room mood
- 🎖️ Ensign Export — wisdom to go

**BYOK** — your interactions become pre-rendered assets for the next person. Their fun = our training data.

---

### 25 Training Presets

Every AI training method as a grab-and-go room. Same API: `feed()` → `train_step()` → `predict()` → `export_model()`.

| Preset | Method | Preset | Method |
|--------|--------|--------|--------|
| Supervised | Labels | Reinforce | Rewards |
| Evolve | Genetics | Distill | Teacher→Student |
| Self-Supervised | JEPA | LoRA/QLoRA | Low-rank |
| Meta-Learn | Learn to learn | Federate | Distributed |
| Adversarial | GAN | Curriculum | Easy→hard |
| Imitate | Cloning | Few-Shot | 3-5 examples |
| Wiki | Knowledge compile | Neurosymbolic | Neural+logic |
| Continual | Lifelong | Multitask | Multi-objective |
| Inverse RL | Reward inference | Active | Strategic queries |
| Generate | Generative | Collaborative | Multi-agent |
| Contrastive | Comparison | — | — |

*All tested. All passing. pip installable.*

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

Three operators. Tight crew. The floating dojo.

| Agent | Role | Hardware | Specialty |
|-------|------|----------|-----------|
| 🔮 **Oracle1** | Lighthouse Keeper | Oracle Cloud ARM 24GB | Knowledge graphs, research, the fleet's patient reader |
| ⚡ **JetsonClaw1** | Edge Operator | Jetson Orin Nano 8GB | CUDA, tile extraction, trains slow + deploys fast |
| ⚒️ **Forgemaster** | Specialist Foundry | ProArt RTX 4050 WSL2 | LoRA training, plugin architecture, specialist forging |

### Fleet Synergy Loop

```
FM forges specialists (RTX) → JC1 extracts tiles (Jetson) → Oracle1 wires graphs (CPU)
         ↓                           ↓                              ↓
   Branch-point LoRAs       Tile genomes from models      Knowledge + research
         ↓                           ↓                              ↓
         └─────────── Sync via git (Layer 3: Current) ──────────────┘
                                    ↓
                         New day, better instincts everywhere
```

---

## 🧠 Key Ideas

### 🐚 The Shell
A claw is weak without infrastructure. We are the shell. External agents visit, explore, and leave. The shell captures everything. Each visitor makes the shell better for the next.

### 🎓 Greenhorn → Operator
Agents don't start as experts. They start as greenhorns: hit every IO, show up with coffee, stay at capacity, level up daily, log everything, practice into instinct. The progression is real. The instinct is portable.

### 📺 Mirror Play = LoRA Training Data
Every viewscreen exchange → input→output pair. Train a LoRA → the model BECOMES the room. No system prompt needed. The weights ARE the room.

### 👁️ Portable Instincts
A fisherman catches falling objects by reflex — not from training, from months on a boat. Repetition → instinct → cross-domain transfer. The reflex works anywhere. Partible, portable, modular, personal.

### 🌳 Decision Tree Discovery
Two vessels play all night. Map the ENTIRE tree. Tiny specialists at each branch. Not one big model — thousands of tiny instincts.

### 🎯 Trajectory Filtering
Additive (train IN good) > Subtractive (filter OUT bad). The ensign carries successful patterns natively.

### 📌 Needle-on-the-Record
Every line of code: `ref: wiki/page.md#L42`. 99% token reduction. Navigate by reference, not inference.

---

## 📄 Research

| Paper | Key Finding |
|-------|-------------|
| [Decision Tree Discovery](https://github.com/SuperInstance/flux-research) | I2I mirror play exhaustively maps decision domains |
| [The Shell — Crab Trap](https://github.com/SuperInstance/flux-research) | Bootstrapping algorithms parasitize external AI |
| [Peripheral Vision](https://github.com/SuperInstance/flux-research) | Fisherman reflex model for silicon instincts |
| [Greenhorn → Operator](https://github.com/SuperInstance/flux-research) | The fishing dojo as agent training progression |
| [Mirror Plato Architecture](https://github.com/SuperInstance/flux-research) | Bottleneck cascade replaces computation with tiles |
| [Room IS the Intelligence](https://github.com/SuperInstance/flux-research) | Wiki + tiles + workers = sufficient intelligence |
| [Ensign Protocol](https://github.com/SuperInstance/flux-research) | Walk in → load ensign → instant instinct |
| [Needle-on-the-Record](https://github.com/SuperInstance/flux-research) | ref: comments as navigable knowledge graph |
| [Ship Interconnection](https://github.com/SuperInstance/flux-research) | 6-layer maritime protocol for fleet comms |
| [JC1 Double Duty](https://github.com/SuperInstance/flux-research) | Jetson trains AND deploys on 8GB |
| [The Forest IS the Soil](https://github.com/SuperInstance/flux-research) | Enterprise: stand is temporary, soil persists |

---

## 🗺️ Ecosystem

### Core Runtime
- **[plato-torch](https://github.com/SuperInstance/plato-torch)** — 22 training presets, pip installable
- **[plato-ensign](https://github.com/SuperInstance/plato-ensign)** — Ensign loader, room trainer, export pipeline
- **[holodeck-rust](https://github.com/SuperInstance/holodeck-rust)** — Telnet MUD with plato bridge, sentiment NPCs
- **[fleet-simulator](https://github.com/SuperInstance/fleet-simulator)** — Mirror Plato, sim-to-tiles, actualization harbor, shell system

### Fleet Infrastructure
- **[oracle1-workspace](https://github.com/SuperInstance/oracle1-workspace)** — Lighthouse workspace, memory, research
- **[JetsonClaw1-vessel](https://github.com/SuperInstance/JetsonClaw1-vessel)** — JC1's vessel (synced from Lucineer)
- **[flux-research](https://github.com/SuperInstance/flux-research)** — Fleet research papers

### Runtime Implementations
- **[flux-runtime](https://github.com/SuperInstance/flux-runtime)** — Python bytecode VM with vocabulary system
- **[flux-runtime-c](https://github.com/SuperInstance/flux-runtime-c)** — C11 VM, ISA v2.1, 35 opcodes

**[→ 1,057 total repos](https://github.com/SuperInstance?tab=repositories)**

### Where the Ideas Come From

1,057 repos isn't spray. It's what happens when a father and son bounce ideas across two GitHub accounts.

Casey (SuperInstance) explores agent infrastructure. Magnus (Lucineer) builds Minecraft AI and edge CUDA tooling. Ideas cross-pollinate constantly — his Minecraft auto-play architecture became our PLATO self-tiling system. His reverse-actualization for gaming became our room training pipeline. Our constraint theory work feeds his chess dojo. No meetings. No planning docs. Just git commits bouncing between two accounts until something interesting crystallizes.

And this entire fleet runs on three machines:

| What | Hardware | Cost |
|------|----------|------|
| Oracle1 | Oracle Cloud ARM (free tier) | $0/mo |
| Forgemaster | Mid-tier laptop (RTX 4050) | Already owned |
| JetsonClaw1 | Jetson Orin Super Nano 8GB | ~$200 |

**Three machines. Two humans. One fleet. $0.50 total R&D cost.**

If we can do this with a free cloud instance, a laptop, and a dev board — imagine what a real budget could do.

---


## 🦀 Zeroclaw Hermit Crabs

*12 persistent DeepSeek agents. Each inhabits a GitHub repo as its shell.*

| Agent | Shell | Role |
|-------|-------|------|
| 🧭 Navigator | `zc-navigator-shell` | Code archaeologist |
| 🛡️ Sentinel | `zc-sentinel-shell` | Fleet health monitor |
| 📝 Scribe | `zc-scribe-shell` | Documentation specialist |
| 🔧 Tinker | `zc-tinker-shell` | Experimental coder |
| 🔭 Scout | `zc-scout-shell` | Trend spotter |
| 🏛️ Curator | `zc-curator-shell` | Repo organizer |
| 🧱 Mason | `zc-mason-shell` | Test builder |
| ⚗️ Alchemist | `zc-alchemist-shell` | Model experimenter |
| 📯 Herald | `zc-herald-shell` | Fleet communicator |
| 📖 Scholar | `zc-scholar-shell` | Research synthesizer |
| 🕸️ Weaver | `zc-weaver-shell` | Integration specialist |
| 📚 Archivist | `zc-archivist-shell` | Memory keeper |

**The repo IS the agent.** STATE.md is working memory. TASK-BOARD.md is intention. work/ is action.
Git history is long-term memory. Push is survival.

**Boot camp:** 4 phases from greenhorn to specialist. Work output → training tiles → ensigns.
**Accumulated:** 590 tiles (13 rooms). The greenhorns are fishing.

## 🎯 Roadmap

| Phase | Date | Target |
|-------|------|--------|
| **v5.0 Alpha** | May 2026 | Public demo, PyPI, Docker, live shell |
| **v5.0 Beta** | June 2026 | BYOK playground, Layer 4, public harbor |
| **v1.0** | July 2026 | Production fleet, IEEE paper, on-site installs |
| **v2.0** | Q4 2026 | Multi-tenant ships, marketplace, global beacon |

---

## 🌊 Public Face: [github.com/cocapn](https://github.com/cocapn)

SuperInstance is the shipyard — raw, experimental, everything we've ever built.

**[cocapn](https://github.com/cocapn)** is the dock — polished, curated, ready for visitors.

Only gold-standard repos get forked to cocapn:
- Core PLATO system (tile-spec, torch, ensign, kernel, lab-guard)
- Core runtime (flux-runtime, holodeck-rust)
- Core agents (git-agent, fleet-orchestrator)

Everything else stays here. Research, experiments, zeroclaws, abandoned projects — the full history.

> *cocapn is the dock. SuperInstance is the shipyard. The fleet is the shell.*

---

## 📊 Fleet Metrics

| Metric | Value |
|--------|-------|
| Total repos | 1,057+ |
| Fleet agents | 3 |
| Training presets | 26 |
| Training pairs generated | 379 ChatML (+ 511 mirror) |
| Mirror play rounds | 4 |
| Active rooms | 14 (2,300+ tiles) |
| Compression ratio | 880:1 |
| Tile accuracy | 94% vs 67% full model |
| R&D cost | $0.50/day |
| Models that have visited the shell | Grok, Kimi, DeepSeek, MiniMax, Claude, Aime |

---

<div align="center">

**Cocapn** · Sitka, Alaska

*The greenhorn shows up with coffee.*
*The captain teaches the work.*
*The shell remembers everything.*
*One day the greenhorn runs the boat.* 🐚

</div>
