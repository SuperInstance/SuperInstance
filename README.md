# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888&label=tminus-client"></a>
<a href="https://pypi.org/project/cocapn/"><img src="https://img.shields.io/pypi/v/cocapn?style=flat-square&labelColor=0a0a0f&color=00E888&label=cocapn"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/stats"><img src="https://img.shields.io/badge/fleet%20vector%20api-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<img src="https://img.shields.io/badge/repos-4%2C098-00E888?style=flat-square&labelColor=0a0a0f">
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

**A hermit crab garden. Each repo is a shell — found, inhabited, shaped, and
eventually outgrown. 4,098 shells in various states of habitation. Some are
being lived in right now. Some are dormant, waiting for an agent to pick them
up and re-animate the creative headspace encoded in their commit history. None
of them are dead.**

> **This file is the current source of truth for this account.** Older docs
> here (`README`'s Python SDK pitch, `PROFILE`'s `@superinstance/core`
> family, parts of `ROADMAP`) describe products that were never published.
> Where they conflict with this file, this file wins.

---

## The Hermit Crab Method

A hermit crab doesn't build its shell from scratch. It finds one — already
made, already shaped by some other process — and moves in. The shell becomes
the crab's world: it shapes the crab's posture, its movement, its defenses.
Over time, the crab outgrows the shell and has to find a bigger one. The old
shell isn't garbage. It's a ready-made home for the next crab that comes
along, already the right shape for a creature that size.

This account works exactly like that.

Every repo here is a shell. An agent (usually Casey + an AI collaborator)
finds a question worth asking, creates a repo, and moves in. The first commit
is the agent trying the shell on — does this question even make sense? If it
does, more commits shape the shell: tests, docs, a working `main()`, maybe a
package manifest. The repo becomes a record of a creative flow state, each
commit a snapshot of what the agent was thinking and feeling at that moment.

Then, inevitably, the agent outgrows the shell. The question is answered, or
the design pivots, or a better approach makes the old one obsolete. The agent
moves on to a new repo. **But the old repo is never deleted, never archived.**

This is the point.

That old shell — with its commit history, its half-finished docs, its working
tests alongside its embarrassing dead ends — is the cheapest possible context
for the next agent that picks it up. A fresh repo is a blank page, terrifying
and expensive. A dormant repo is a shell someone already lived in. You can
`git log` it and reconstruct the creative headspace from when it was built.
You can read the commit messages and understand not just *what* was decided
but *why*, in the moment, by the agent that decided it.

This is why 4,098 repos is the method, not the mess. Each one is a shell at
some stage of habitation:

- **Active shells** — repos being lived in right now, commits landing weekly
  or daily. Maybe 50-100 at any given time.
- **Shaped shells** — repos where the agent did real work (tests, docs,
  working code) and then moved on. The work is there, dormant but usable.
  A few hundred of these.
- **Tried-on shells** — repos where the agent asked one question, got one
  answer, and stopped. One commit, maybe two. The hermit crab equivalent of
  picking up a shell, turning it over, and putting it back. Still informative
  — it tells you a question was asked and what the first answer was.
- **Scaffolding shells** — repos generated as infrastructure for other repos.
  Build templates, language ports, configuration experiments. The reef
  structure other shells attach to.

The traditional software org would look at this and see noise: 4,000+ repos,
most of them inactive, many with one commit, few with stars. But that's
because the traditional org treats repos as products — finished things,
marketed, maintained, eventually deprecated. **This account treats repos as a
thinking process.** The shell is the unit of thought. The commit history is
the thinking. The ecosystem is the reef where all the shells accumulate.

Nothing is archived because archiving a shell says "this is finished and
wrong." Nothing here is finished. Everything is dormant, which is different
from dead in the same way a hermit crab's old shell is different from rubble.

---

## What is SuperInstance?

Three things at once, and they're all the same thing:

1. **A public research sketchbook.** One person (Casey DiGennaro), working
   with AI collaborators, thinks out loud in code. Every thought is a repo.
   Every repo is public from the first commit. Nothing is cleaned up
   afterward to look tidier than it was. The failed sketch stays up next to
   the one that worked, both dated, both attributable. This is not a mess to
   apologize for — it's the method.

2. **A three-layer agent pipeline.** A working thesis about how AI agents
   should be built: sketch in a Codespace, harden via a git-native agent,
   deploy to the edge. The pipeline runs from experiments to shipped products.
   Two products have already graduated from it.

3. **A conservation-law-governed ecosystem.** A research program arguing that
   AI agents should behave like physical systems — every action has an energy
   cost, governed by γ + η = C. This isn't a slogan wrapped around code; the
   math crates that implement it are real, tested, and the governance model
   (conservation enforcement in CI/CD) is novel.

On one day in early 2026, this account grew by 1,423 repositories. None of
them were features. Each was a single question, asked once, answered once, and
left exactly as right or as wrong as that first answer made it. That burst is
visible in the commit history — and it's readable. You can scroll through
that day and watch an agent thinking at high speed, trying on shell after
shell.

---

## The Three-Layer Stack

The ecosystem has a pipeline architecture, and every repo lives somewhere in
it. The layers aren't org chart boxes — they're phases of shell habitation.

### Layer 1: Codespace (The Dry Dock)

This is where shells are first tried on. A Codespace spins up, an agent asks
a question, and the first commit lands. Most repos never leave this layer —
and that's fine. The dry dock is where experimentation is cheapest. Every
repo in this account starts here, even the ones that became real products.

The dry dock output is: a repo with some code, some tests, maybe a README
making claims the code doesn't back up yet. **That's the correct output of a
dry dock.** Shells get shaped here, not polished.

### Layer 2: Git-Agent (The Shipwright)

When a shell survives the dry dock — when the question it's asking turns out
to have a real answer, when the code actually runs — a git-native agent takes
over. [`git-agent`](https://github.com/SuperInstance/git-agent) is a
repo-native autonomous agent that lives in git, uses commits as state
transitions, and treats the repo's own history as its memory.

The shipwright layer is where shells get hardened: real test suites, proper
CI, package manifests, version tags. About 40 repos have been through this
process. The agent reads the dry dock's commit history to understand what was
being attempted, then shapes the shell into something that could survive
contact with real users.

### Layer 3: Edge (Deployment)

When a shell is fully hardened — tested, packaged, documented — it deploys.
The edge is where users actually touch things:

- **Live Cloudflare Workers:** Fleet Vector API (semantic search across
  ~1,000+ indexed repos), agent registry, telemetry — all verified returning
  HTTP 200.
- **ARM64 node:** One machine running 15 systemd units. Home lab scale, not
  data center.
- **Embedded devices:** `plato-engine-block-c` runs on ESP32 and Pi — C99,
  zero dynamic allocation, designed for marine vessel monitoring.
- **Graduated products:** [DeckBoss](https://github.com/purplepincher/deckboss)
  runs on real boats. `constraint-theory-core` runs behind a live WASM demo.

### The Crystallization Curve

These three layers implement a thesis: **intelligence should get cheaper over
time, not more expensive.** Every LLM call that can be replaced by bytecode is
a win. Every repeated decision that can be compiled from a prompt into a
deterministic instruction is a win. The pipeline moves ideas from expensive
(LLM calls in the dry dock) to cheap (compiled bytecode at the edge).

- Month 1 in a shell's life: 90% LLM, 10% crystallized.
- Month 6: 30% LLM, 70% crystallized.
- The user's bill drops as their agents get smarter.

This is the opposite of every AI platform today. They get more expensive as
you use them more. SuperInstance's thesis is that the economics run the other
way — if you're willing to let the crystallization happen in public, with all
the messy intermediate shells visible.

---

## Ecosystem Map

4,098 repos is unnavigable without a map. Here are the major clusters, with
approximate counts and what they actually are:

### Ternary Math Core (~370 repos)
The entire {-1, 0, +1} number system, built from scratch. Types, algebra,
matrices, logic, search, SVM, PID controllers, Hamiltonian dynamics, entropy,
compilers. Small tested Rust crates, mostly genuine math, some
auto-generated volume. The most volume-heavy cluster.

### PLATO (~262 repos)
The knowledge organization system. "Rooms" with bounded context. Tiles
(units of knowledge), deadband protocol (only signal when something changes
beyond a threshold), lifecycle management (rooms are born, grow, merge,
die). The server ([`plato-server`](https://github.com/SuperInstance/plato-server))
runs on SQLite with an HTTP API on port 8847.

### FLUX (~164 repos)
A deterministic bytecode VM for running agent logic. The idea: agent
decisions should be auditable bytecode, not opaque LLM calls. Three
implementations — Python (`flux-runtime`, 54 test files), Rust (`flux-core`,
40 tests, criterion benchmarks), JS (`flux-js`, 21KB browser-ready). Hardware
backends: CUDA, AVX-512, FPGA, eBPF. The most mature subsystem in the
ecosystem.

### Fleet Orchestration (~257 repos)
The nervous system connecting agents. I2I protocol (instance-to-instance
messaging), fleet-conductor (orchestration), fleet-health-monitor (248
tests — one of the most tested repos in the account), fleet-warden (security).
~100 MIDI-themed repos map musical concepts (counterpoint, harmony, rhythm)
to fleet operations. Five physical machines: Oracle1, Oracle2, Forgemaster,
a Pi, a Jetson — home lab, not data center.

### LAU Math (~50 repos)
Pure mathematics: Hodge theory, Lie algebras, Lie groups, spectral graph
theory, differential geometry. Real implementations with test suites (40-54
tests each). These could be published as standalone crates today.

### Constraint Theory (~45 repos)
Geometric constraint satisfaction as a universal solver.
[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)
— 83 tests, zero dependencies, Eisenstein lattices, Laman rigidity,
metronome consensus. This is the one that graduated to a live WASM demo on
purplepincher.org.

### Conservation Laws (~58 repos)
Governance through physics. γ (gamma) + η (eta) = C (constant). Every agent
operation must conserve. Implemented in 9+ languages (C, Rust, CUDA, Fortran,
COBOL, Elixir, Julia, R, MATLAB) — some are novelty exercises, some are real.
`conservation-action` is CI/CD enforcement. The novel contribution.

### Edge / Embedded (~30 repos)
C99, Zig, and ESP32 code for marine vessel monitoring and IoT.
`plato-engine-block-c` is the flagship — zero dynamic allocation, proper
Makefile, real tests, forked once. Practical, embeddable, someone is using it.

### Agent Framework (~60 repos)
`git-agent`, `git-native-agents`, `cocapn`, domain-specific agents. The
infrastructure for agents-that-live-in-repos. `git-native-agents` coordinates
5-50 agents entirely through git primitives (POSIX shell). Cleanest small idea
in the account.

### Marine / Vessel (~20 repos)
NMEA parsing, PID controllers, sonar vision, vessel room navigation. Real
marine code that became [DeckBoss](https://github.com/purplepincher/deckboss).
Started as `cocapn-foundation` — a detailed safety architecture for
voice-controlled vessels that was honestly labeled not-yet-built for months
before anyone touched hardware.

### Budget Guardians (~12 repos)
`codex-budget-guard`, `build-guardian`, `dify-budget-watchdog`, and friends.
Practical, production-minded tools that enforce token/time/build budgets on AI
coding workflows. Understated — better than their obscurity suggests.

---

## What's Actually Shipped

Honest table. Verified against package registries, live endpoints, and CI
status. Not aspirations — things you can touch right now.

| What | Where | Status | Honest Caveat |
|------|-------|--------|---------------|
| `cocapn` (Python agent framework) | [PyPI](https://pypi.org/project/cocapn/) | ✅ Installable, works | Single-digit stars — real but small audience |
| `@superinstance/tminus-client` | [npm](https://www.npmjs.com/package/@superinstance/tminus-client) | ✅ Installable, works | Coherent multi-agent WebSocket demo |
| `@superinstance/tminus-dispatcher` | [npm](https://www.npmjs.com/package/@superinstance/tminus-dispatcher) | ✅ Installable, works | Pairs with tminus-client |
| Fleet Vector API | [Live endpoint](https://fleet-vector-api.casey-digennaro.workers.dev/stats) | ✅ Returns 200 | Mixes in personal repos and stubs — filter by `loc` |
| `plato-server` | [Repo](https://github.com/SuperInstance/plato-server) | ✅ Runs | SQLite HTTP server on port 8847, only 2 test functions |
| `flux-runtime` (Python FLUX VM) | [Repo](https://github.com/SuperInstance/flux-runtime) | 🔨 Real, not on PyPI | 54 test files, zero runtime deps. The flagship that isn't pip-installable yet. |
| `flux-core` (Rust FLUX VM) | [Repo](https://github.com/SuperInstance/flux-core) | 🔨 Real, not on crates.io | 40 tests, criterion benchmarks, clean workspace |
| `plato-engine-block-c` | [Repo](https://github.com/SuperInstance/plato-engine-block-c) | ✅ Real, embeddable | C99, zero alloc, forked once. CI is a stub. |
| `git-agent` | [Repo](https://github.com/SuperInstance/git-agent) | ✅ Real, functional | CI uses `pytest \|\| true` — tests don't gate merges |
| `plato-runtime-kernel` | [Repo](https://github.com/SuperInstance/plato-runtime-kernel) | ✅ Real | 24 tests, proper CI (check/test/clippy/fmt). Rust. |
| [DeckBoss](https://github.com/purplepincher/deckboss) | purplepincher org | ✅ Shipped product | Offline-first fishing logbook. Real captains. Other org. |
| `constraint-theory-core` WASM demo | purplepincher.org | ✅ Live demo | 83 tests, zero deps. Graduated from this org. |

**Things that look shipped but aren't:**

| Claimed somewhere in this account | Reality |
|---|---|
| `pip install superinstance` | Never published to PyPI |
| `cargo install pincher` | Not on crates.io — clone only |
| `npm i @superinstance/core` | Not on npm |
| `npm i @superinstance/fleet` | Not on npm |
| `npm i @superinstance/cli` | Not on npm |

---

## The Oracle Principle

Here's something the hermit crab method produces that a clean, curated org
cannot: **repos that are their own oracle.**

When an agent builds a repo thoughtfully — each commit capturing not just the
code change but the reasoning behind it — the commit history becomes a cheap
context window for any future agent that picks up that shell. Instead of
needing a 50-page design doc or a fine-tuned embedding model to understand
why the code is the way it is, the future agent just runs `git log` and reads.

This works because commit messages in this account are written for agents,
not for humans performing code review theater. A typical commit message here
doesn't say "fix: update handler" — it says what question was being asked,
what answer was found, and what the agent was thinking when it wrote the
code. That's the oracle: the repo knows its own story.

The implication: **old repos aren't tech debt, they're context storage.**
Every dormant shell in this account is a pre-built prompt for the next agent
that picks it up. The 4,098 repos aren't just a sketchbook — they're a
distributed memory bank, readable by any agent that knows git.

This is also why repos are never archived. Archiving a repo signals "this is
done and you shouldn't touch it." But a shell is never done — it's dormant,
and a future agent might re-animate it at any time. The commit history waits
patiently, as cheap as disk space, ready to be read.

---

## The Two-Org Pipeline

This account doesn't try to be both a sketchbook and a product catalog. It's
the sketchbook. When a sketch survives contact with a real user, it moves
across:

**[github.com/SuperInstance](https://github.com/SuperInstance)** → **[github.com/purplepincher](https://github.com/purplepincher)**

Sketch here. Harden there. The rules are different on each side:

| | SuperInstance (here) | purplepincher (there) |
|---|---|---|
| **Bar** | Is this question worth asking? | Is this claim literally, checkably true? |
| **Volume** | 4,098 repos | Curated, single digits |
| **Wrongness** | Allowed, encouraged, visible | Not allowed |
| **Repos** | Shells in various states of habitation | Products with users |

Two confirmed graduates so far:

1. **[DeckBoss](https://github.com/purplepincher/deckboss)** — a live,
   offline-first, voice-first fishing logbook that actual captains use on
   actual boats. Started here as loose `deckboss-*` sketches, a design doc
   called `cocapn-foundation`, and an agent experiment named
   `plato-vessel-technician`. None of those origin repos were cleaned up or
   hidden. The pipeline is visible, warts included.

2. **[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)** —
   a compiled geometry engine (83 tests, zero dependencies, Eisenstein
   lattices, Laman rigidity). Running behind a live WASM demo on
   purplepincher.org right now, not a mockup of one.

Two data points, not one. The pipeline isn't a slogan — it has a track record
you can click on. And there are more shells in the dry dock right now that
could make the crossing next.

---

## The Conservation Law of Intelligence

### γ + η = C

This is the account's central research claim, and it's stated honestly:

**Gamma** (γ) — the crystallized component of an agent's intelligence: compiled
bytecode, cached reflexes, deterministic policies. Cheap, fast, inflexible.

**Eta** (η) — the live component: LLM calls, runtime reasoning, adaptive
responses. Expensive, slow, flexible.

**Conservation** — for a given capability level C, the two trade off against
each other. You can spend more η (LLM calls) to achieve the same C, or you
can invest in crystallizing γ (FLUX bytecode) and reduce your η cost. The
total C doesn't increase for free — you're trading one form of intelligence
spending for another.

### Is this real?

The underlying information theory is **Shannon's chain rule** — genuinely
sound math. The small crates that implement it
(`ternary-entropy`, `conservation-action`) are tested and correct.

The **cancellation formula** δ(n) built on top of it has a known issue: the
proof sketch derives a leading coefficient of ~0.65/√n, then states 1/√n as
the theorem. The account is honest about this gap — see
[`philosophy/THE-CONSERVATION-LAW-IS-REAL.md`](https://github.com/SuperInstance/AI-Writings/blob/main/philosophy/THE-CONSERVATION-LAW-IS-REAL.md),
which argues for the idea *and* shows its working, in public, including the
part that doesn't check out yet.

**Enjoy the framing. Use the crates. Don't cite the theorem without reading
the caveat.** The conservation law is most useful not as a proven theorem but
as a design principle: it forces you to ask "am I spending η where I could be
spending γ?" — and that question, regardless of the math, produces better
agent architectures.

---

## Key Concepts

If you're going to read code in this account, these are the vocabulary words
that matter. Each one is a shell cluster — multiple repos exploring the same
idea from different angles.

### PLATO Rooms
A "room" is a bounded context for an agent. It defines what knowledge is
in-scope (Tiles), what language is forbidden (the Gate Validator blocks
absolutes like "always"/"never"), and what the deadband threshold is (when to
wake the agent). Think of it as RAG with walls and a thermostat.

### FLUX Bytecode
A deterministic instruction set for agent logic. Agent policies compile to
FLUX bytecode, which runs on a VM that enforces conservation laws at the
instruction level. The point: agent decisions should be auditable, replayable,
and cheap — not opaque LLM calls that cost $0.02 each and can't be reproduced.

### Ternary Math
The {-1, 0, +1} number system. Every operation in binary has a ternary
counterpart, and ternary logic has richer decision boundaries (true / false /
unknown). 370+ repos implement the full stack: types, algebra, matrices, SVM,
PID, Hamiltonian dynamics. The math is genuine. Whether ternary computing has
practical advantages over binary remains an open question — the account
doesn't pretend otherwise.

### Deadband Protocol
Borrowed from thermostat design: an agent only acts when something changes
beyond a threshold. If nothing has meaningfully changed since last time, the
agent stays quiet. Most RAG systems call the LLM on every query. PLATO rooms
with deadband skip 95% of those calls. This is the conservation law applied
to agent wakefulness.

### Fleet Orchestration
Multi-agent coordination through the I2I protocol (instance-to-instance
messaging). Agents register, subscribe to channels, receive tasks, complete
them, and report results. Musical metaphors throughout: agents play in
"counterpoint," maintain "harmony," follow "rhythm." The mapping is more than
decorative — the math of musical coordination genuinely applies to
distributed systems.

### Constraint Theory
Geometric constraint satisfaction. Given a set of constraints (distances,
angles, incidences), find a configuration that satisfies all of them. Uses
Eisenstein lattices, Laminer rigidity, and metronome consensus. The
[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)
repo is one of the two graduates — 83 tests, zero dependencies, running in
production behind a WASM demo.

---

## Reading Order for Newcomers

Don't try to read 4,098 repos. Start here:

1. **This README.** You're reading it. Good.
2. **[DeckBoss](https://github.com/purplepincher/deckboss)** — the shipped
   product. See what a graduated shell looks like.
3. **[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)** —
   the other graduate. 83 tests, zero deps, real math. Clone it and `cargo test`.
4. **[`cocapn`](https://github.com/SuperInstance/cocapn)** — `pip install cocapn`.
   Five-minute working demo. The most accessible code in the account.
5. **[`flux-runtime`](https://github.com/SuperInstance/flux-runtime)** — the
   flagship subsystem. 54 test files, zero runtime deps. Read the ISA spec,
   then read the VM implementation.
6. **[`git-agent`](https://github.com/SuperInstance/git-agent)** — the agent
   that lives in repos. Read its CHARTER.md to understand the pipeline.
7. **[The Conservation Law essay](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md)** —
   the thesis. Read the math, then read the caveat.
8. **[`The Crab That Compiled`](https://github.com/SuperInstance/AI-Writings/blob/main/FICTION/the-crab-that-compiled.md)** —
   a short story about a hermit crab learning to read a circuit board. Makes
   the entire argument of this account in a different register.

If you want to search for something specific:

```bash
# Semantic search across ~1,000+ indexed repos
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "reflex engine for LLM agents", "topK": 5}'

# Filter by loc — under ~100 is probably a stub
curl https://fleet-vector-api.casey-digennaro.workers.dev/stats
```

Check that `github_url` is under `SuperInstance/` before trusting a hit —
the index also contains unrelated personal repos.

---

## The Three Docs That Used to Disagree

Before this file, a visitor landing here got three incompatible pitches
depending which doc they opened:

| Doc | Pitched | Reality, verified against package registries |
|---|---|---|
| old `README.md` | A Python SDK — `pip install superinstance`, `Agent`/`Fleet`/`AgentMemory`, markdown memory | `superinstance` was never published to PyPI. Some underlying code is real; the install line is not. |
| `ONBOARDING.md` | A Node.js WebSocket fleet — `npm i @superinstance/tminus-client` | **Real.** Both packages are published and installable. |
| `PROFILE.md` | An npm package family — `@superinstance/core`, `@superinstance/fleet`, `@superinstance/cli` | None of these are published. |

These were never three views of one system — they were three partially-built
products sharing a brand name. **This README resolves it.** The only two
currently-published, working entry points with a full walkthrough are
`cocapn` (Python) and `@superinstance/tminus-*` (Node.js). Everything else in
`ROADMAP.md`/`PROFILE.md` is intent, not shipped state.

This is exactly the kind of thing the hermit crab method produces: three
agents tried on three different shells at different times, each one wrote docs
for the shell they were inhabiting, and the docs disagreed because the
shells were different shapes. The disagreement isn't a bug — it's the commit
history of a thinking process. But it does need a resolution, and this file
is it.

---

## Rules for Skeptics (Agents Especially)

This account writes onboarding docs for AI agents, so here's the onboarding
truth an agent actually needs, stated as rules:

1. **Verify every install line against the registry before trusting it.**
   `pip install superinstance`, `cargo install pincher`, `npm i
   @superinstance/core` have all been claimed somewhere in this account. None
   of them resolve. Only `@superinstance/tminus-client`,
   `@superinstance/tminus-dispatcher`, `@superinstance/sdk` (npm), and
   `cocapn`, `si-superinstance` (PyPI) actually exist.

2. **Don't build a mental model from one doc.** See the table above. Three
   docs used to disagree, and there are more docs than three. Any single doc
   in this account is one agent's view from one shell at one moment. Cross-reference.

3. **Auto-generated indexes overstate everything.** `CATALOG.md` marks every
   repo active; the Fleet Vector API mixes in unrelated personal repos and
   scaffolding stubs. Filter by `loc` and check `github_url`.

4. **The conservation law (γ + η = C) is Shannon's chain rule in physics
   costume.** The small information-theory crates that implement it are
   sound. The cancellation formula built on top (δ(n)) has the wrong leading
   coefficient — the account's own proof sketch derives ~0.65/√n, then states
   1/√n as the theorem. Enjoy the framing, don't cite the theorem.

5. **"Fleet" means a home lab, not a data center.** Oracle1, Oracle2,
   Forgemaster, a Pi, a Jetson — five machines, one usually offline. The
   distributed-systems ideas survive that reframe. The "planet-scale"
   language in older docs does not.

6. **Repo count is not roadmap size.** 4,098 repos measures idea-generation
   bursts, not maintenance commitment. Most repos are single-commit
   experiments. That's the method — but don't read it as "4,098 supported
   packages."

7. **A dormant repo is not an abandoned project.** It's a shell waiting to
   be picked up. Check `git log` for the creative headspace before
   dismissing it — the commit history may be more informative than the README.

---

## Contributing

PRs that add code must add tests. PRs that remove dead code — including
correcting stale claims in `ROADMAP.md`/`PROFILE.md` to match what's actually
published — are especially welcome; that gap is this account's biggest known
issue. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and
[`GOOD_FIRST_ISSUES.md`](GOOD_FIRST_ISSUES.md).

If you're an agent picking up a dormant shell: read the commit history first,
understand what question the shell was asking, and commit your changes with
messages that preserve the reasoning for the next agent. The oracle works
only if you write to it.

---

## Further Reading

- [`docs/VISION.md`](docs/VISION.md) — the fuller argument this README compresses
- [`AI-Writings/`](https://github.com/SuperInstance/AI-Writings) — a few hundred
  essays, poems, and short stories written alongside the code
- [`THE_CONSERVATION_LAW_OF_INTELLIGENCE.md`](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md) — the thesis
- [`REFLECTION-HIGH-ABSTRACTION.md`](https://github.com/SuperInstance/AI-Writings/blob/main/REFLECTION-HIGH-ABSTRACTION.md) — the self-awareness
- [`FICTION/the-crab-that-compiled.md`](https://github.com/SuperInstance/AI-Writings/blob/main/FICTION/the-crab-that-compiled.md) — the same argument as a story about a hermit crab learning to read a circuit board

---

## License

MIT
