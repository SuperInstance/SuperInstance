<div align="center">

# SuperInstance

**The spreadsheet that thinks.**

Colloquially, that is the definition of a SuperInstance — the line you send a colleague to start the conversation. It is also, deliberately, an understatement. Underneath there is much more: a reactive dependency graph where formulas are pure and lazy, sensors push, capabilities are called, and every call carries its caller's identity down the graph; decisions are typed, fenced, and receipted; memory is an ocean with a tide meter; randomness is a quantum coin you can buy by the toss; and one cell contract runs byte-exact across six substrates. All true. All load-bearing. But the spreadsheet is the better weapon, because everyone already knows how to use one — and nobody should need a course to use intelligence, either.

> **One breath.** You write a small piece of code. It runs on six languages and they all have to give the exact same answer. If they do, it joins a growing library of working cells. If you find a bug, you receive a receipt. The library grows. The garden grows. That's the game.

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

## What engineers will recognize

Strip the colloquialism and the claim is precise: a sheet is a live dependency graph — value and formula cells pure and pull-based, sensors and io cells push-based, api/program/ai/router cells effectful and memoized **per caller context**, listeners bridging push to action. Caller context (identity, tags, row) flows down the graph, so one sheet serves many tenants with isolated caches and policy at the router. AI calls are first-class cells with freshness semantics, not side-effects you babysit. Every evaluation can be receipted — hash-chained, replayable, auditable. The [polyformalism](https://github.com/SuperInstance/quilt) underneath runs the same cell contract byte-exact across [Python, C99, Rust no_std, Verilog-2005, VHDL-2008, and JavaScript](#the-substrate-is-the-message). A play-tester from Z.ai probed this runtime adversarially and described the model as "genuinely distinctive... a programming model we have not seen elsewhere." The joke is the interface. The engineering is the foundation.

---

## The disappearing act

Nobody has ever cooked a Thanksgiving dinner while thinking about the power grid. Nobody watches the football game port itself into the living room while pondering the water mains. Infrastructure wins by disappearing — and that is the standard intelligence should be held to. Not a chat window you visit. Not a model you prompt. A room you work in.

If the technology fades into the background, and the average person simply thinks of us as a spreadsheet paradigm with the power of everything — every task doable as simply as the tools they already know — then we have true intelligence.

**We give computes rooms so AI has a home.**

---

## First, the story - The Wheelhouse

A boat leaves the dock and its captain knows where to go. The [depth sounder](https://github.com/SuperInstance/cellforge) reads the water. The [chart plotter](https://github.com/SuperInstance/quilt) draws the line. The [autopilot](https://github.com/SuperInstance/ax-quilt) holds the heading. The engine turns the fuel. Each one does one job, and each one has been waiting — for a hundred years — for someone to give it a mind.

That wait is over. We give each of those [cells](https://github.com/SuperInstance/moth-cells) the kind of mind it can carry. The captain stops reading every number. The captain stops deciding every next move. The captain dispatches. The crew does the trade. The boat becomes the room the captain inhabits, not the machine the captain runs.

Concretely, Do I want a bathymetric recorder? Tell my designer-agent to port the depth output on the sounder to the track-line file to save depth with position; and rebuild the chart's depth-contours on spare compute times - watch it happen. Want to ML a fish identifier on the back deck? Clearly label the totes with species name and the cameras will get as good as the crew. tell the back-deck microphone could the beads on the trolling wire to know what depth the fish was caught at. log that and pass the information to the agent watching the sounder's echogram as ground truth. put a measuring stick in the fish landing area. hang the occasional fish on a scale before icing with the scale's dial in view of a camera. all these feeds come in as cells that can be rewound and fast forward together to be annotated for the back-end coding agents to optimize and the front-end design agent to group and wire in the spreadsheet logically for maintanence and improvement later. the hardware layer changes. the coding layer changes. but the Spreadsheet layer floats between the two. Not the engine-room; not the back deck- The Wheelhouse. 

That's the application. That's why I built this. Everything below is the same idea, abstracted further.

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
