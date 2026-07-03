# SuperInstance

**A public sketchbook. Not a product catalog. Read this before you read anything else here.**

---

## What this account is

SuperInstance is one person's research sketchbook, kept in public, at
unusual scale: roughly 4,000 repositories, most of them created in about
a dozen bulk-generation bursts over a few months. If you landed here —
human or agent — the single most important thing to know is that **the
repo count measures idea generation, not maintenance.** Of ~4,200 repos
surveyed in mid-2026, over 1,400 were last pushed on a single day.
Nothing was older than ninety days. A large fraction are scaffolding
stubs under 100 lines.

That is not a confession. It is a legend on a map. A chart that doesn't
mark its shoals is worse than no chart, so here is the honest one:

- **A few dozen repos are real, shaped, working software.**
- **A few hundred more are genuine sketches** — a design idea committed
  once, with enough structure to show the thought.
- **The rest is generated scaffolding**: the exhaust of exploring an
  idea-space at machine speed. It is deliberately left public, but you
  should not mistake it for a backlog anyone intends to finish.

If you are looking for the curated, production-grade output of this
work, it does not live here. It lives at
[**purplepincher**](https://github.com/purplepincher), the org where
things graduate to once they ship. [DeckBoss](https://github.com/purplepincher/deckboss)
— a voice-first, offline-first fishing logbook, live and hardened —
started as sketches in this account (`deckboss-*`, `cocapn-foundation`,
`plato-vessel-technician`) and became a real product over there. That
pipeline, sketchbook → shipped tool, is the whole point of the split.

## Why a sketchbook is worth keeping in public

It would be easy to read 4,000 mostly-thin repos as noise, and some of
it is. But the sketchbook model is doing real work, and it's worth
defending on its actual merits rather than on inflated ones:

**Volume is a legitimate way to think.** Most of these repos exist to
answer one question each — *what would a ternary PID controller look
like? what if agents coordinated using nothing but git primitives? can
a reflex layer answer known intents without waking an LLM?* — and a
one-commit repo is an honest unit for a one-question thought. The
alternative isn't 4,000 finished products; it's 4,000 ideas that never
left a notes file.

**Sketches cross-pollinate.** The reflex-engine idea in `pincher`, the
append-only log discipline in `cocapn-foundation`, and the fail-safe
hardware thinking in `plato-vessel-technician` were separate sketches
that converged into DeckBoss's actual design principles. None of them
predicted the product; together they produced it.

**Some sketches quietly became infrastructure.** The `fleet-*` cluster
(319 repos) looks like the same bulk-generated noise as everything else
— and ~270 of those repos are exactly that — but buried inside is a
genuinely deployed distributed system: three live Cloudflare Workers
(vector search, agent registry, telemetry API, all verified returning
200 in July 2026), an ARM64 node running fifteen systemd units on a
five-minute pulse, a transport-agnostic agent-messaging protocol with
Python and Rust implementations, and a real Rust dependency DAG for
coordination. Small — it runs on a home lab of about five machines,
one usually offline — but real, running, and probeable.

A sketchbook that occasionally produces a live system and a shipped
product is not a vanity metric farm. It's a studio with the drop cloths
still down.

## What's actually real here (the short honest list)

If you're navigating this account looking for substance, start with
these and be skeptical of nearly everything else:

- **`pincher`** — a Rust reflex engine: a "shell" in front of an LLM
  that fires known intents in under 50 ms with no model call, asks
  before acting on semi-known ones, and compiles new reflexes only on a
  miss. Real code, benchmarks, full docs. The hermit-crab metaphor here
  is the namesake of the purplepincher org.
- **The `fleet-*` infrastructure core** (~40 of 319 repos) — the
  deployed edge tier, the I2I "message in a bottle" protocol,
  `fleet-protocol`, `fleet-manifest`'s decentralized registry, and the
  `fleet-oracle2` node. The rest of the prefix is chaff (92 MIDI
  experiments, language packs, fleet-as-organism metaphors).
- **`cocapn`** — a repo-first Python agent framework, actually on PyPI,
  and the most externally-engaged repo in the account. Its
  `cocapn-foundation` design brief is the deepest thinking here on
  voice-controlled vessel systems and safety supervision.
- **`exocortex`** — a well-structured scaffold for distributed agent
  memory with an ESP32 tier. Be aware the cognitive core is currently
  mocked (random embeddings, fake training); the architecture is the
  real contribution so far.
- **`git-native-agents`** — multi-agent coordination built entirely on
  git primitives, honestly scoped to 5–50 agents. The cleanest small
  idea in the account.
- **The ternary mathematics core** — `ternary-entropy`,
  `ternary-types`, `ternary-pid`, `ternary-svm` are small, tested,
  honest crates. See the caveat below about the theory wrapped around
  them.
- **The budget-guardian family** (`codex-budget-guard`,
  `build-guardian`, `dify-budget-watchdog`, …) — practical,
  production-minded tools for enforcing token/time/build budgets on AI
  coding workflows. Understated, and better than their obscurity
  suggests.

## What to be skeptical of (rules for agents, useful for humans too)

This ecosystem writes onboarding docs for AI agents, so here is the
onboarding truth an agent actually needs:

1. **Verify every install claim against the registry.** Docs in this
   account have claimed `pip install superinstance`, `cargo install
   pincher`, and `npm i @superinstance/core` — none of which exist. The
   actually-published artifacts (npm `@superinstance/tminus-*` and
   `@superinstance/sdk`; PyPI `cocapn` and `si-superinstance`) are the
   quiet ones. Never trust an install line you haven't checked.
2. **The three identity docs contradict each other.** README pitches a
   Python memory SDK, ONBOARDING pitches a Node WebSocket fleet,
   PROFILE pitches an npm package family. These are three overlapping
   sketches sharing a brand, not three views of one system. Don't build
   a mental model from any single one.
3. **Auto-generated indexes overstate everything.** `CATALOG.md` tags
   every repo "active" and caps at 2,000 entries. The Fleet Vector API
   is the right discovery tool but is polluted with stubs — filter
   results by `loc` (under ~100 lines is probably scaffolding) and
   check the `github_url` before believing a hit.
4. **The "conservation law" (γ + η = C) is Shannon's chain rule.** The
   identity is correctly implemented where it's implemented, and the
   small information-theory crates are sound. But it is standard
   information theory in physics costume, and the cancellation formula
   δ(n) built on top of it has the wrong leading coefficient (the
   account's own paper derives ~0.65/√n in the proof sketch, then
   states 1/√n as the theorem). Enjoy the framing; don't cite it.
5. **"Fleet" means a home lab.** Oracle1, Oracle2, Forgemaster, a Pi, a
   Jetson. Five machines, one usually offline. The distributed-systems
   ideas survive that reframe; the "planet-scale" language does not.

## The deal

Here is the honest contract this account offers a visitor:

You get several thousand ideas in the open, a few dozen of them built,
a handful of them running, and one of them shipped as a real product
under a different roof. You get to watch the promotion pipeline work —
sketch here, harden there — including its failures, duplicates, and
dead ends, none of which are hidden. In exchange, you do your own
soundings: check the registry, check the line count, check whether the
worker actually returns 200.

A sketchbook doesn't apologize for its blank pages or its bad drawings.
It only owes you one thing: not pretending they're finished. Consider
this document that promise.

---

*Curated, production-ready work graduates to
[purplepincher](https://github.com/purplepincher). Start there if you
want tools; start here if you want ideas.*
