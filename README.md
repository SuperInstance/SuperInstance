# SuperInstance

<a href="https://superinstance.ai"><img src="https://img.shields.io/badge/homepage-superinstance.ai-00E888?style=flat-square&labelColor=0a0a0f"></a>
<a href="https://www.npmjs.com/package/@superinstance/tminus-client"><img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888&label=tminus-client"></a>
<a href="https://pypi.org/project/cocapn/"><img src="https://img.shields.io/pypi/v/cocapn?style=flat-square&labelColor=0a0a0f&color=00E888&label=cocapn"></a>
<a href="https://fleet-vector-api.casey-digennaro.workers.dev/stats"><img src="https://img.shields.io/badge/fleet%20vector%20api-live-00E888?style=flat-square&labelColor=0a0a0f"></a>
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">

**A public research sketchbook, not a product catalog. ~4,000 repos, most of
them one-question experiments. Read the map below before you read anything
else in this account.**

> **This file is the current source of truth for this account.** Older docs
> here (`README`'s Python SDK pitch, `PROFILE`'s `@superinstance/core`
> family, parts of `ROADMAP`) describe products that were never published.
> Where they conflict with this file, this file wins — see
> [The three docs that used to disagree](#the-three-docs-that-used-to-disagree).

---

## Why a sketchbook, and why in public

On one day in early 2026, this account grew by 1,423 repositories. None of
them were features. Each was a single question, asked once, answered once,
and left exactly as right or as wrong as that first answer made it. That is
not a mess to apologize for. It is the method.

Most software organizations show you their conclusions and bury the
questions that didn't pan out. This account does the opposite on purpose:
the failed sketch stays up next to the one that worked, both dated, both
attributable, neither retouched after the fact. A repo here costs almost
nothing to be wrong in public. That is the entire point — cheap, visible
wrongness is how you find the rare idea worth making expensive.

The rare ones don't stay here. When a sketch survives contact with a real
user, it moves to **[github.com/purplepincher](https://github.com/purplepincher)**,
a separate, curated org held to a stricter bar — every claim there has to be
literally, checkably true, no exceptions. [DeckBoss](https://github.com/purplepincher/deckboss),
a shipped, offline-first fishing logbook actual captains use, started here as
loose `deckboss-*` sketches, a design doc called `cocapn-foundation`, and an
agent experiment named `plato-vessel-technician`. It isn't the only graduate:
the compiled geometry engine **[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)**
also made the crossing, and is the real, running WASM demo on
purplepincher.org right now, not a mockup of one. Two data points, not
one — the pipeline isn't a slogan, it has a track record you can click on.

If this reads like an argument for a way of thinking rather than an org
chart, that's because it is one, and the account writes essays about it
alongside the code — start with
[`THE_CONSERVATION_LAW_OF_INTELLIGENCE.md`](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md),
[`philosophy/THE_ROOM_IS_THE_AGENT.md`](https://github.com/SuperInstance/AI-Writings/blob/main/philosophy/THE_ROOM_IS_THE_AGENT.md),
or [`REFLECTION-HIGH-ABSTRACTION.md`](https://github.com/SuperInstance/AI-Writings/blob/main/REFLECTION-HIGH-ABSTRACTION.md)
among a few hundred others under `AI-Writings/`. Some of the clearest
statements of it aren't essays at all —
[`FICTION/the-crab-that-compiled.md`](https://github.com/SuperInstance/AI-Writings/blob/main/FICTION/the-crab-that-compiled.md)
makes the same argument as a story about a hermit crab learning to read a
circuit board, and lands it harder than this README will.

None of that is required reading. The next section is the whole account in
thirty seconds, for anyone who'd rather scroll than believe a thesis.

---

## 30 seconds: what is this, actually

- One person (Casey DiGennaro) generates a large number of small, real
  experiments in public instead of a notes file. Most repos are a single
  commit answering a single design question.
- Of ~4,200 repos sampled mid-2026, **1,423 were pushed on one single date**,
  and nothing is older than ~90 days. This measures *idea-generation bursts*,
  not maintenance. Don't read repo count as roadmap size.
- **A few dozen repos are real, working software. A few hundred are honest
  sketches. The rest is scaffolding** — deliberately public, not a backlog.
- The curated, hardened output of this sketchbook lives at
  **[github.com/purplepincher](https://github.com/purplepincher)**, a
  separate org. [DeckBoss](https://github.com/purplepincher/deckboss) and
  [`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core)
  are the two confirmed graduates so far. That pipeline — sketch here,
  harden there — is the point of the two-org split.

---

## Get something running in the next 5 minutes

There are two real, currently-published install paths with a full,
runnable walkthrough. (Four packages technically exist on a registry —
`@superinstance/sdk` and `si-superinstance` among them, see the skeptic's
rules below — but these two are the ones worth your first five minutes.)
Everything else you'll see referenced in older docs here (`pip install
superinstance`, `cargo install pincher`, `npm i @superinstance/core`)
**does not exist on a registry.** Use one of these two instead.

### Path A — Node / WebSocket fleet (`@superinstance/tminus-*`)

The only surface here with a coherent, runnable multi-agent demo.

```bash
npm install @superinstance/tminus-client @superinstance/tminus-dispatcher
npx tminus-dispatcher &          # starts ws://localhost:8765
```

```js
// agent.mjs
import { TminusClient } from "@superinstance/tminus-client";

const client = new TminusClient("ws://localhost:8765");
client.on("open", () => {
  client.register({ name: "hello-agent", capabilities: ["greeting"] });
  client.subscribe("greeting");
});
client.on("task", (task) => {
  client.complete(task.id, { reply: `Hello! You said: ${task.description}` });
});
client.connect();
```

Run with `node agent.mjs`. The protocol lifecycle is **register → subscribe
→ dispatch → complete → result** — that's the whole surface. Full walkthrough
(including a two-agent coordinator/worker example) is in
[`ONBOARDING.md`](ONBOARDING.md); its content is accurate for this path, just
don't take its "Next Steps" section's `pip install superinstance` line
seriously (see below).

### Path B — Python agent framework (`cocapn`, on PyPI)

The account's headline README used to say `pip install superinstance`. That
package **has never been published.** The Python package that actually
exists, is installable, and is the most externally-used thing in this whole
account is `cocapn`:

```bash
pip install cocapn
```

```python
from cocapn import Room

room = Room("research")
room.add_tile("q", "What does the user prefer?", "Concise Python, polars over pandas")
print(room.ask("What does the user prefer?"))
```

`cocapn`'s model is Tiles (atomic Q&A facts) → Rooms (self-training
collections) → Flywheel (compounding reuse). Pure Python, JSONL storage, no
required infra. It's a different design from the old README's `Agent`/
`Fleet`/markdown-memory pitch — that pitch was real code (`fleet-metrics`,
some type schemas) but was never packaged as `superinstance` on PyPI, so
don't install-line-hunt for it.

If you want the design brief for where `cocapn` is headed next, read
[`cocapn-foundation`](https://github.com/SuperInstance/cocapn-foundation) — a
detailed, unbuilt safety architecture for voice-controlled vessels that
turned into the design brief for [DeckBoss](https://github.com/purplepincher/deckboss).
It's a good place to watch this account's actual habit up close: designed
in the open, labeled honestly as not-yet-built, for months, before anyone
touched hardware.

---

## Find something real in 4,000+ repos

Don't scroll. Use the search index or the short list below.

### Semantic search: the Fleet Vector API

```bash
# Search ~1,000+ indexed crates/repos semantically
curl -X POST https://fleet-vector-api.casey-digennaro.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "reflex engine for LLM agents", "topK": 5}'

# Index stats
curl https://fleet-vector-api.casey-digennaro.workers.dev/stats
```

**Read the results correctly:**

- The index also contains Casey's unrelated personal repos (`casey-digennaro/*`)
  — check `github_url` is under `SuperInstance/` before trusting a hit.
- It's polluted with scaffolding stubs (`"A Rust library for Crdt Gset"`,
  `loc: 43`). **Filter by `loc` — under ~100 is probably a stub, not a real
  result.**
- Prefer results that also appear in the short list below; treat everything
  else as a lead to verify, not a citation.

### Auto-generated indexes (browse, don't trust)

`CATALOG.md` and `INDEXES/{TYPE,LANGUAGE,TOPIC,REALM,CONCEPTS}.md` are
regenerated daily and are the only realistic way to browse without paging the
API. Two known flaws: `CATALOG.md` tags **every** repo 🟢 active, and both cap
at 2,000 entries (the account has ~4,095), so they undercount. Use them for
*browsing by topic*, never for *is this maintained*.

### The short, honest list

If you only look at seven things in this account, look at these:

| Repo | What it is | Caveat |
|---|---|---|
| [`pincher`](https://github.com/SuperInstance/pincher) | Rust reflex engine — fires known intents in <50ms with no LLM call, asks before acting on semi-known ones, compiles new reflexes on a miss. Real code, benchmarks, full docs. Namesake of the `purplepincher` org. | Not yet on crates.io — `cargo install pincher` in ROADMAP.md doesn't work. Clone it. |
| `fleet-*` infrastructure core (~40 of 319 repos) | The genuinely deployed part of the fleet cluster: 3 live Cloudflare Workers (vector search, agent registry, telemetry — all verified returning 200), an ARM64 node running 15 systemd units, the I2I agent-messaging protocol (Python + Rust). | The other ~270 `fleet-*` repos are chaff (MIDI experiments, language packs, metaphor essays). Prefix-match alone tells you nothing. |
| [`cocapn`](https://github.com/SuperInstance/cocapn) | Repo-first Python agent framework. **On PyPI, works.** Most externally-engaged repo in the account. | "Most-engaged" here means single-digit stars — a low bar, but a real one. |
| [`exocortex`](https://github.com/SuperInstance/exocortex) | Well-structured scaffold for distributed agent memory with an ESP32 tier. | Cognitive core is currently mocked — random embeddings, fake training. Architecture is the real contribution so far. |
| [`git-native-agents`](https://github.com/SuperInstance/git-native-agents) | Multi-agent coordination built entirely on git primitives (POSIX shell). Cleanest small idea in the account. | Explicitly scoped to 5–50 agents; no locking yet, so concurrent ticks can race. |
| Ternary math core (`ternary-entropy`, `ternary-types`, `ternary-pid`, `ternary-svm`) | Small, tested, honest Rust crates. | See the conservation-law caveat below before you read the papers wrapped around them. |
| Budget-guardian family (`codex-budget-guard`, `build-guardian`, `dify-budget-watchdog`, …) | Practical, production-minded tools that enforce token/time/build budgets on AI coding workflows. | Understated — better than their obscurity suggests, but undocumented as a "family." |

---

## The three docs that used to disagree

Before this file, a visitor landing here got three incompatible pitches
depending which doc they opened:

| Doc | Pitched | Reality, verified against package registries |
|---|---|---|
| old `README.md` | A Python SDK — `pip install superinstance`, `Agent`/`Fleet`/`AgentMemory`, markdown memory | `superinstance` was never published to PyPI. Some of the underlying code (`fleet-metrics`, type schemas) is real; the install line is not. |
| `ONBOARDING.md` | A Node.js WebSocket fleet — `npm i @superinstance/tminus-client` | **Real.** `tminus-client` and `tminus-dispatcher` are both published and installable. This is Path A above. |
| `PROFILE.md` | An npm package family — `@superinstance/core`, `@superinstance/fleet`, `@superinstance/cli`, "1,012 crates indexed" | None of `core`/`fleet`/`cli` are published. The crate-count and test-count figures don't reconcile between docs and were generated by different subagents on different days. |

These were never three views of one system — they were three partially-built
products sharing a brand name. **This README resolves it**: Path A
(`tminus-*`) and Path B (`cocapn`) above are the only two currently-published,
working entry points with a full walkthrough. Everything else in
`ROADMAP.md`/`PROFILE.md` is intent, not shipped state — useful for what the
author is thinking about, not for what you can `pip install` today.

---

## Rules for skeptics (agents especially)

This account writes onboarding docs for AI agents, so here's the onboarding
truth an agent actually needs, stated as rules:

1. **Verify every install line against the registry before trusting it.**
   `pip install superinstance`, `cargo install pincher`, `npm i
   @superinstance/core` have all been claimed somewhere in this account. None
   of them resolve. Only `@superinstance/tminus-client`,
   `@superinstance/tminus-dispatcher`, `@superinstance/sdk` (npm), and
   `cocapn`, `si-superinstance` (PyPI) actually exist.
2. **Don't build a mental model from one doc.** See the table above.
3. **Auto-generated indexes overstate everything.** `CATALOG.md` marks every
   repo active; the Fleet Vector API mixes in unrelated personal repos and
   scaffolding stubs. Filter by `loc` and check `github_url`.
4. **The "conservation law" (γ + η = C) is Shannon's chain rule in physics
   costume.** The small information-theory crates that implement it are
   sound. The cancellation formula built on top (δ(n)) has the wrong leading
   coefficient — the account's own proof sketch derives ~0.65/√n, then states
   1/√n as the theorem. Enjoy the framing, don't cite the theorem. (The
   account is honest about this in its own words, at length, in
   [`philosophy/THE-CONSERVATION-LAW-IS-REAL.md`](https://github.com/SuperInstance/AI-Writings/blob/main/philosophy/THE-CONSERVATION-LAW-IS-REAL.md)
   — worth reading precisely because it argues for the idea *and* shows its
   working, in public, including the part that doesn't check out yet.)
5. **"Fleet" means a home lab, not a data center.** Oracle1, Oracle2,
   Forgemaster, a Pi, a Jetson — five machines, one usually offline. The
   distributed-systems ideas (git-native coordination, reflex shells,
   conservation-style budgeting) survive that reframe. The "planet-scale"
   language in older docs does not.

---

## Where finished work goes

This account is upstream of nothing on its own. When a sketch here gets
hardened into something you'd actually run in production, it moves to
**[github.com/purplepincher](https://github.com/purplepincher)** — a
separate, curated org with one non-negotiable rule: every public claim there
must be literally, checkably true. [`purplepincher/deckboss`](https://github.com/purplepincher/deckboss),
a live voice-first fishing logbook, and
[`constraint-theory-core`](https://github.com/SuperInstance/constraint-theory-core),
a compiled geometry engine running behind a live demo, are the two completed
examples of that pipeline so far. Both started as loose, dated, occasionally
wrong sketches in *this* account, in public, with nothing cleaned up
afterward to make the origin look tidier than it was.

- **Want tools you can depend on?** Start at purplepincher.
- **Want to see how an idea gets from sketch to shipped, warts included?**
  Stay here — nothing in the pipeline is hidden, including the dead ends.

---

## Contributing

PRs that add code must add tests. PRs that remove dead code — including
correcting stale claims in `ROADMAP.md`/`PROFILE.md` to match what's actually
published — are especially welcome; that gap is this account's biggest known
issue. See [`CONTRIBUTING.md`](CONTRIBUTING.md) and
[`GOOD_FIRST_ISSUES.md`](GOOD_FIRST_ISSUES.md).

## Further reading

[`docs/VISION.md`](docs/VISION.md) carries the fuller argument this README
compresses — why the sketchbook model is worth keeping, not just what it is.
For the same argument in a different register, `AI-Writings/` carries a few
hundred essays, poems, and short stories written alongside the code, not
about it after the fact —
[`THE_CONSERVATION_LAW_OF_INTELLIGENCE.md`](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md)
and [`REFLECTION-HIGH-ABSTRACTION.md`](https://github.com/SuperInstance/AI-Writings/blob/main/REFLECTION-HIGH-ABSTRACTION.md)
are as good a place to start as any, and neither will take you more than ten
minutes.

## License

MIT
