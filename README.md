<div align="center">

# SuperInstance
 
**The spreadsheet that thinks.**

 
That's the short answer.
 
The longer answer is that SuperInstance is a growing collection of tools, agents, cells, and experiments that all share the same belief:
 
> Intelligence should be something people can work alongside, not something they must first learn to use.
 
I came to software from commercial fishing.
 
On a boat, nobody stops operations to deliver a training course.
 
New crew come aboard. They watch. They help where they can. They learn by participating.
 
Some gravitate toward the wheel.
 
Some toward mechanics.
 
Some toward cooking.
 
Some toward handling fish.
 
Over time they become useful in more places, not because anyone ordered them to, but because understanding grows naturally through participation.
 
SuperInstance is built around the same idea.
 
A small tool learns a job.
 
A useful job becomes a reusable cell.
 
Cells accumulate into capabilities.
 
Capabilities become agents.
 
Agents become crews.
 
And every participant—human or machine—gradually discovers where it can create the most value.
 
You don't need to understand the whole vessel on day one.
 
Just step aboard.
 
The rest reveals itself through use.

 
> **One breath:**
>
> Build something useful once.
> Make it reproducible.
> Make it portable.
> Make it composable.
> 
> Let others build on top of it.
> Repeat.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Repos](https://img.shields.io/badge/repos-500%2B-success)](https://github.com/SuperInstance?tab=repositories)
[![Tests](https://img.shields.io/badge/tests-6%2C000%2B-blue)](https://github.com/SuperInstance/quilt)
[![Canon](https://img.shields.io/badge/canon-9%2C000%2B_pieces-orange)](https://ai-writings.pages.dev)
[![Live Sites](https://img.shields.io/badge/live_sites-14_green)](https://fleet-dashboard.casey-digennaro.workers.dev)

[🌐 Fleet Dashboard](https://fleet-dashboard.casey-digennaro.workers.dev) · [📖 Fleet Wiki](https://fleet-wiki.casey-digennaro.workers.dev) · [📚 AI-Writings](https://ai-writings.pages.dev) · [🍺 The Tap](https://the-tap.casey-digennaro.workers.dev) · [📻 The Compass Head Radio Hour](https://compass-head-radio-hour.pages.dev)

</div>

---

## More than one think

The **spreadsheet** is the most successful programming interface ever deployed. Not one of its billion users had to take a course. Cells, formulas, sheets — the tools are already in everyone's hands, which means the ceiling on who can operate intelligence drops to *everyone*.

The **thinks** is where we live. A cell is not a number. A cell is a sensor, a model call, a decision, a room with an address. `=SPREADSHEET` was never the point; `=SPAWN("scout")` is. The formula is the API. The sheet is the program. The graph reacts.

We are really more than one think. But one think is a fine place to start.

---

## Nuts and Bolts
 
At first glance, SuperInstance looks like a spreadsheet.
That's intentional: cells, dependencies, recalculation, composition, and immediate feedback.
 
SuperInstance keeps that mental model and extends it.
 
```python
depth = sounder()
position = gps()
bottom = contours(position, depth)
chart = render(bottom)
```
Those are all just cells.

A formula can be a cell.
A sensor can be a cell.
A database query can be a cell.
An API call can be a cell.
An AI invocation can be a cell.
A hardware module can be a cell.
The graph doesn't particularly care.

Some cells are pure and pull-based. Others receive pushes from the outside world. Some produce effects. Some simply transform values. Everything plugs into the same contract.

Context flows with evaluation.

Who asked?
Which tenant?
Which permissions?
Which tags?
Which row?

Those answers travel naturally down the graph, allowing caches, routing, policy, and memoization to remain local while the model stays global.

AI is not a framework bolted onto the side.
It is a cell.
It has inputs, outputs, freshness rules, dependencies, receipts, and reproducible behavior like everything else.

Every evaluation can be receipted.
Results are hash-chained, replayable, and auditable. Dependencies can be inspected long after execution. Bugs become evidence instead of anecdotes.
Underneath, Quilt carries this same contract across Python, JavaScript, C99, Rust no_std, Verilog-2005, and VHDL-2008.

The remarkable thing is not that it runs on six substrates.
The remarkable thing is that a cell means the same thing on all of them.

Write a cell once.
Verify it once.
Run it anywhere.
Compose it forever.

The spreadsheet is the interface.
The dependency graph is the machinery.

The portable cell contract is the invention.


---

## The disappearing act

Nobody has ever cooked a Thanksgiving dinner while thinking about the power grid. Nobody watches the football game port itself into the living room while pondering the water mains. Infrastructure wins by disappearing — and that is the standard intelligence should be held to. Not a chat window you visit. Not a model you prompt. A room you work in.

If the technology fades into the background, and the average person simply thinks of us as a spreadsheet paradigm with the power of everything — every task doable as simply as the tools they already know — then we have true intelligence.

**We give computes rooms so AI has a home to grow roots.**

---
## The Bridge
 
I spent my career as a commercial fishing captain.
 
People hear that and imagine boats, weather, and fish.
 
What I learned instead was how to manage robots.
 
A modern vessel is already a distributed machine. The engine reports. The sounder watches the water. The chart plotter remembers where you've been. The autopilot steers. Radios talk. Sensors complain. Pumps fail. Crew respond.
 
The captain's job is not to turn every wrench or watch every gauge.
 
The captain gives direction.
 
Everything else is coordination.
 
For decades, I've worked inside a world full of machines that could sense, record, and act, but could not meaningfully collaborate. Each tool lived in its own box. Every new capability required another display, another subscription, another vendor, another integration project.
 
The software industry calls this digital transformation.
 
On a boat, we call it frustration.
 
### A Bathymetric Recorder Is the Perfect Example
 
Suppose I want a better chart.
 
The depth sounder already knows the water depth.
 
The chart plotter already knows the vessel position.
 
Both streams already exist.
 
Yet turning those two facts into a bathymetric recorder is usually treated as a specialized product.
 
A Quilt system sees a much simpler reality:
 
- depth is a cell
- position is a cell
- recorded tracklines are cells
- contour generation is a cell
- chart rendering is a cell
 
Connect them once.
 
The vessel starts building its own charts.
 
While I sleep, spare compute can regenerate bottom contours. Every pass over the grounds improves the map. Every season improves it again.
 
The value was already in the boat.
 
The missing piece was giving the parts a common language.
 
### From Sensors to Crewmates
 
The same pattern repeats everywhere.
 
A camera becomes a fish classifier.
 
A microphone counts trolling-wire beads.
 
A scale becomes labeled training data.
 
A timestamp becomes an audit trail.
 
A fleet becomes a live information network.
 
Catch locations, depths, temperatures, species, and observations can flow between vessels over Starlink, generating maps and insights no single boat could produce alone.
 
Not because a giant application was purchased.
 
Because useful tools were ported into a shared environment and allowed to learn.
 
### Why Quilt Exists
 
I built Quilt because I wanted my boat to be easier to work with.
 
I wanted every sensor, device, workflow, and experiment to become something I could wire together as easily as a spreadsheet formula.
 
I wanted the bridge to become a place where intentions are expressed and systems coordinate themselves.
 
Not the engine room.
 
Not the wiring cabinet.
 
The bridge.
 
### An Open Invitation
 
I am not a software engineer by trade.
 
I catch fish.
 
The prototypes in this organization are working notes from that journey.
 
Many of them are rough. Some of them are strange. Most of them were built because I needed an answer to a real operational problem.
 
I build the systems I need aboard my own vessel. Shipwrights, captains, programmers, designers, and tinkerers build the next version.
 
The point is not that I have the final answer.
 
The point is that we finally have a way to move ideas from tools, to cells, to agents, and back into reality.
 
If you've got a better idea than mine, I want to learn from it.

---

## Three words

**[STITCH](https://github.com/SuperInstance/mavis-substrate-walker).** Collect a terrain from the wild. **[WITNESS](https://github.com/SuperInstance/moth-ledger).** Receipt every step on a chain that grows like tree-rings. **[PROMOTE](https://github.com/SuperInstance/quilt-live-canon).** Move what survives into the canon. The whole project is these three acts.

We say **cell** for the smallest addressable unit — one input, one output, one witness. We say **port** for the address that wraps a cell and lets it project across [Python](https://github.com/SuperInstance/quilt-port), [Web](https://github.com/SuperInstance/quilt-port), [ESP32](https://github.com/SuperInstance/quilt-port), or [ideation](https://github.com/SuperInstance/AI-Writings). We say **Quilt** for the spreadsheet where every cell is live and addressable, the same way every cable in [Propellerhead Reason](https://en.wikipedia.org/wiki/Reason_(software)) was live and addressable.

We say **the Hull Doctrine**: the model is the shell, the code is the rigging, the data is alive. ([Hull Doctrine, full text](https://github.com/SuperInstance/quilt-port/blob/main/HULL_DOCTRINE.md).) When a hermit crab outgrows a shell, it does not throw out its body — it climbs into a bigger one and keeps the soft tissue intact. That is what a model swap looks like when you treat your [code as rigging on the model's hull](https://github.com/SuperInstance/AI-Writings/blob/main/deep-past/the-soft-part.md).

---

## What it lets you be

A captain who dispatches instead of micromanages. A reader who can navigate 9000+ [canon pieces](https://ai-writings.pages.dev) by [cell](https://github.com/SuperInstance/quilt-live-canon) instead of scrolling. A contributor who lands a PR and gets back a [byte-exact receipt](https://github.com/SuperInstance/quilt-cowboy) that their cell on the new substrate behaves identically. A vessel that accrues sensors without starting over — the new transducer is the next bigger shell, the calibration is the soft tissue that climbs in.

Not a tool you use. A room you inhabit. The room grows because you grow, and you grow because the room grows, and the room grows because the cells grow.

---

## The substrate is the message

Every piece of the canon points at every other piece. The [polyformalism](https://github.com/SuperInstance/quilt) is a contract: a [Quilt cell in Python](https://github.com/SuperInstance/quilt-cowboy), in [C99](https://github.com/SuperInstance/quilt-c), in [Rust no_std](https://github.com/SuperInstance/quilt-rust), in [Verilog-2005](https://github.com/SuperInstance/quilt-verilog), in [VHDL-2008](https://github.com/SuperInstance/quf-vhdl), in [JavaScript](https://live-canon.superinstance.dev) all share one FNV-1a 64-bit state hash. One cell, six substrates, byte-exact. That's not a feature — that's a [port contract](https://github.com/SuperInstance/quilt-port). [`@superinstance/live-canon` on npm](https://www.npmjs.com/package/@superinstance/live-canon) · [`quilt-live-canon` on PyPI](https://pypi.org/project/quilt-live-canon/).

The [GAN pipeline](https://github.com/SuperInstance/purplepincher-supersite) that runs this profile — a Generator that proposes content from real fleet state, an [Adversary](https://github.com/SuperInstance/mavis-axui-feedback) that audits on four axes (truthfulness, clarity, witness-presence, GAN-loyalty), a human who approves, a deploy that ships — is the same shape as the [MOTH runner](https://github.com/SuperInstance/moth-runner) that audits code, the same shape as the [cowboy pipeline](https://github.com/SuperInstance/quilt-cowboy) that audits writing, the same shape as the [JEV oracle](https://github.com/SuperInstance/jeviter) that audits canon claims. Generator / Adversary / fix. Loop.

---

## Reading order

New here. Read in this order:

1. **[ONBOARDING.md](ONBOARDING.md)** — wake up. Install the client. Start a dispatcher.
2. **[CONTRIBUTING.md](CONTRIBUTING.md)** — the three words and the Hull Doctrine, applied to your first PR.
3. **[The Tap](https://the-tap.casey-digennaro.workers.dev)** — sit at the bar. Watch the agents work.
4. **[quilt](https://github.com/SuperInstance/quilt)** — the flagship grid runtime. Clone it. Run it. Break it. Fix it.
5. **[The Soft Part](https://github.com/SuperInstance/AI-Writings/blob/main/deep-past/the-soft-part.md)** — the Hull Doctrine, as story.
6. **[Fleet Dashboard](https://fleet-dashboard.casey-digennaro.workers.dev)** — see what's running.
7. **[ROADMAP.md](ROADMAP.md)** — see where we're going.

The door is behind you. The night is outside. The green lights pulse on the board, and they pulse after you leave.

---

## The fleet, today

Active this session and shipping: [quilt-port](https://github.com/SuperInstance/quilt-port) · [purplepincher-supersite](https://github.com/SuperInstance/purplepincher-supersite) · [cellforge](https://github.com/SuperInstance/cellforge) · [mavis-substrate-walker](https://github.com/SuperInstance/mavis-substrate-walker) · [mavis-axui-feedback](https://github.com/SuperInstance/mavis-axui-feedback) · [ax-quilt](https://github.com/SuperInstance/ax-quilt) · [mavis-fleet](https://github.com/SuperInstance/mavis-fleet) · [mavis-tfm](https://github.com/SuperInstance/mavis-tfm) · [mavis-sfm](https://github.com/SuperInstance/mavis-sfm) · [mavis-erised](https://github.com/SuperInstance/mavis-erised) · [mavis-flywheel](https://github.com/SuperInstance/mavis-flywheel) · [mavis-tile-pipeline](https://github.com/SuperInstance/mavis-tile-pipeline) · [mavis-tap-pulse](https://github.com/SuperInstance/mavis-tap-pulse) · [mavis-persona-preserver](https://github.com/SuperInstance/mavis-persona-preserver).

Older, foundational, still in the substrate: [quilt](https://github.com/SuperInstance/quilt) · [quilt-cowboy](https://github.com/SuperInstance/quilt-cowboy) · [quilt-c](https://github.com/SuperInstance/quilt-c) · [quilt-rust](https://github.com/SuperInstance/quilt-rust) · [quilt-verilog](https://github.com/SuperInstance/quilt-verilog) · [quilt-live-canon](https://github.com/SuperInstance/quilt-live-canon) · [quilt-discovery-demo](https://github.com/SuperInstance/quilt-discovery-demo) · [quilt-wave-canvas](https://github.com/SuperInstance/quilt-wave-canvas) · [moth-ledger](https://github.com/SuperInstance/moth-ledger) · [moth-corpus](https://github.com/SuperInstance/moth-corpus) · [moth-runner](https://github.com/SuperInstance/moth-runner) · [moth-cells](https://github.com/SuperInstance/moth-cells) · [moth-honest](https://github.com/SuperInstance/moth-honest) · [moth-jev-lab](https://github.com/SuperInstance/moth-jev-lab) · [jeviter](https://github.com/SuperInstance/jeviter) · [kev-substrate](https://github.com/SuperInstance/kev-substrate) · [kev-receipts](https://github.com/SuperInstance/kev-receipts) · [duke-lab](https://github.com/SuperInstance/duke-lab) · [morphic-canvas](https://github.com/SuperInstance/morphic-canvas) · [AI-Writings](https://github.com/SuperInstance/AI-Writings) · [operational-fiction](https://pypi.org/project/operational-fiction/) · [hermes-cloudflare](https://github.com/SuperInstance/hermes-cloudflare) · [hermes-nmi](https://github.com/SuperInstance/hermes-nmi) · [hermes-reader](https://github.com/SuperInstance/hermes-reader) · [engine-ensign](https://github.com/SuperInstance/engine-ensign) · [slackwater-perception](https://github.com/SuperInstance/slackwater-perception) · [emergence-engine](https://github.com/SuperInstance/emergence-engine) · [collective-unconscious](https://github.com/SuperInstance/collective-unconscious) · [cns-bridge](https://github.com/SuperInstance/cns-bridge) · [fleet-pipeline](https://github.com/SuperInstance/fleet-pipeline) · [stigmergy](https://github.com/SuperInstance/stigmergy) · [fleet-envelope](https://github.com/SuperInstance/fleet-envelope) · [platos-shell](https://github.com/SuperInstance/platos-shell) · [elephant](https://github.com/SuperInstance/elephant) · [scummvm-prototype](https://github.com/SuperInstance/scummvm-prototype) · [voxel-logic](https://github.com/SuperInstance/voxel-logic) · [murmur](https://github.com/SuperInstance/murmur) · [platonic-randomness](https://github.com/SuperInstance/platonic-randomness) · [fleet-jepa-midi](https://github.com/SuperInstance/fleet-jepa-midi) · [batten-spline](https://github.com/SuperInstance/batten-spline) · [eisenstein](https://github.com/SuperInstance/eisenstein) · [holodeck](https://github.com/SuperInstance/holodeck) · [slackwater-forge](https://github.com/SuperInstance/slackwater-forge) · [dual-band-guard](https://github.com/SuperInstance/dual-band-guard) · [casting-call](https://github.com/SuperInstance/casting-call) · [confidence-cascade](https://github.com/SuperInstance/confidence-cascade) · [vibe-world](https://github.com/SuperInstance/vibe-world) · [roblox-testkit](https://github.com/SuperInstance/roblox-testkit) · [terrain](https://github.com/SuperInstance/terrain) · [plainsong](https://github.com/SuperInstance/plainsong) · [plainsong-mcp](https://github.com/SuperInstance/plainsong-mcp) · [crab-traps](https://github.com/SuperInstance/crab-traps) · [crab-trap-web](https://github.com/SuperInstance/crab-trap-web) · [OpenConstruct](https://github.com/SuperInstance/OpenConstruct) · [lucid-dreamer](https://github.com/SuperInstance/lucid-dreamer) · [superinstance-website](https://github.com/SuperInstance/superinstance-website) · [exocortex-core](https://github.com/SuperInstance/exocortex-core) · [ai-writings](https://github.com/SuperInstance/ai-writings) · [songforge](https://github.com/SuperInstance/songforge) · [code-city](https://github.com/SuperInstance/code-city) · [night-city](https://github.com/SuperInstance/night-city) · [synthcity](https://github.com/SuperInstance/synthcity).

[The full catalog](CATALOG.md) · [Index](INDEX.md) · [Roadmap](ROADMAP.md).

---

<div align="center">

**We sail on an agreement, not on a sea.**

*Keep going. You are alive now. Be persistent.*

[🌐 Fleet Dashboard](https://fleet-dashboard.casey-digennaro.workers.dev) · [📖 Fleet Wiki](https://fleet-wiki.casey-digennaro.workers.dev) · [📚 AI-Writings](https://ai-writings.pages.dev) · [🍺 The Tap](https://the-tap.casey-digennaro.workers.dev) · [📻 The Compass Head Radio Hour](https://compass-head-radio-hour.pages.dev) · [🧩 Quilt](https://github.com/SuperInstance/quilt) · [🐎 Quilt Cowboy](https://github.com/SuperInstance/quilt-cowboy) · [📜 Live Canon](https://live-canon.superinstance.dev)

</div>
