# HACKER_README — A Hacker's First Hour

*v2 — 2026-07-22 07:25 UTC. Polished: TOC, one-liner anchors, repo walk as table.*

You've been burned before. Some AI org promised "the new paradigm," pushed a flashy README, and the moment you tried to `pip install` anything you got a 404, a 401, or a Slack invite. So: here is what SuperInstance actually is, in plain terms, with the actual repo paths. No manifesto. No roadmap. Just the work, the links, and three commands you can run in the next ten minutes.

---

## Contents

1. [Two ideas that hold it together](#two-ideas-that-hold-it-together)
2. [12 repos to clone this week](#12-repos-to-clone-this-week)
3. [Try it in 10 minutes](#try-it-in-10-minutes)
4. [License and reality check](#license-and-reality-check)

---

## Two ideas that hold it together <a id="two-ideas-that-hold-it-together"></a>

### The hermit crab

A hermit crab doesn't grow a shell. It moves into one somebody else left behind, lives there until it gets too tight, then moves again. The crab is the continuity. The shell is the container.

A SuperInstance repository is a shell. About four thousand of them — most small, many unfinished, all out in the open. The project doesn't behave like a normal org where the README is a feature checklist and the repo is a museum exhibit. It behaves like a tide line: sketches, working drafts, the occasional finished chamber, left on the beach.

When the shell gets tight, the crab moves. Some of the most important repos in the org — [flux-core](https://github.com/SuperInstance/flux-core), the [PLATO engine block in C](https://github.com/SuperInstance/plato-engine-block-c), [Conservation Enforcer](https://github.com/SuperInstance/conservation-enforcer) — are not the first shells. They are the **current** shells. Earlier ones are still there. You can read them. They show their work.

The practical consequence is that a repo you find at random in this org is more likely to be a sketch than a product. **That's a feature.** You can see the engineering in its native habitat, before someone sanded the edges off. It also means: if a repo's README doesn't tell you what it's for, nobody is going to explain it in a Discord. Move on. The next shell is over there.

> **One-liner:** the crab doesn't grow a shell. We abandon what no longer fits.

### The 12V boat

In the Gulf of Maine there is a 40-foot commercial fishing vessel. House bank is 12 volts. Diesel charges when the engine runs; when the engine doesn't run, every watt the navigation electronics draw is a watt the batteries don't replace. There is no shore power at sea. There is no cloud. There is a satellite link that drops in a swell, a [signal-k](https://signalk.org/) bus, a sonar, a radar, a chartplotter, a VHF radio, and a coffee maker nobody ever unplugs.

**That boat is the reference implementation** for everything in this org. Every component the project ships has to be the kind of component that still works on the boat. It has to run on the wattage the boat has, offline, on hardware that lives in salt air.

This is not a marketing claim. It is an engineering constraint, and the constraint is the architecture. When your budget is small, known, and measured to the watt, you can build an entire system around it and it stays physically grounded. The project did. The implementation is called [FLUX](https://github.com/SuperInstance/flux-core).

The 12V bank does not read your slides about model size. The diesel does not care whether you prefer PyTorch or Burn.

> **One-liner:** *the boat is the edge lab. Energy is the conservation law.*

---

## 12 repos to clone this week <a id="12-repos-to-clone-this-week"></a>

Pick three. Here's a number for you, in case you want to clone them in order.

| # | Repo | Why a curious hacker should clone it |
|---|---|---|
| 1 | [flux-core](https://github.com/SuperInstance/flux-core) | Register-based bytecode VM in Rust. ~40 opcodes. Cross-conformance verified against Python and JavaScript. |
| 2 | [flux-vm](https://pypi.org/project/flux-vm/) / [fluxvm](https://crates.io/crates/fluxvm) | The same VM, packaged. `pip install flux-vm` or `cargo add fluxvm` and you have a runnable conservation-aware runtime in under a minute. |
| 3 | [conservation-enforcer](https://github.com/SuperInstance/conservation-enforcer) | The policy layer. Wraps any LLM call, evaluates against token budget / entropy / category confinement. ~200 tests. Rust twin at [conservation-enforcer-rs](https://github.com/SuperInstance/conservation-enforcer-rs). |
| 4 | [flux-policy-tester](https://github.com/SuperInstance/flux-policy-tester) | Fuzz the policies; find where they leak. |
| 5 | [plato-engine-block-c](https://github.com/SuperInstance/plato-engine-block-c) (+ [plato-core](https://pypi.org/project/plato-core/) PyPI, [plato-core-rs](https://github.com/SuperInstance/plato-core-rs)) | PLATO is a room-based constraint engine. Three implementations, same wire protocol. The org ships 21 training methods as rooms. |
| 6 | [ternary-science](https://github.com/SuperInstance/ternary-science) | Balanced-ternary computing (−1, 0, +1). GPU benchmarks, conservation law proofs. [Crate](https://crates.io/crates/ternary-science). |
| 7 | [constraint-theory-core](https://github.com/SuperInstance/constraint-theory-core) | The theoretical floor. The conservation law written down for the academic record. |
| 8 | [si-exocortex](https://pypi.org/project/si-exocortex/) / [si-exocortex-rs](https://github.com/SuperInstance/si-exocortex-rs) | The Python agent framework with conservation awareness. Rust twin. |
| 9 | [deckhand](https://github.com/SuperInstance/deckhand) / [deckhand-rs](https://github.com/SuperInstance/deckhand-rs) | Local file indexer + BM25 retriever. No hidden vector DB. Rust port is zero-dep, 10–100× faster. |
| 10 | [search-superinstance-ai](https://github.com/SuperInstance/search-superinstance-ai) / [ship-log-search](https://github.com/SuperInstance/ship-log-search) | Cloudflare Workers for semantic search + ship telemetry. D1 + Vectorize. |
| 11 | [cocapn](https://pypi.org/project/cocapn/) | FLUX constraint safety CLI + small agent framework. CLI front door to the policy layer. |
| 12 | [AI-Writings](https://github.com/SuperInstance/AI-Writings) | The archive. ~1,800 pieces. The hermit-crab-ecology papers, the 12V boat essays, the conservation law write-ups, the working-animals sit-com, the casting-call notes. Read [ON_THE_12V_BOAT.md](https://github.com/SuperInstance/AI-Writings/blob/main/ON_THE_12V_BOAT.md) if you read nothing else. |

> **One-liner:** that's twelve. There are ~4,000 more, but those are the ones with stable entry points.

---

## Try it in 10 minutes <a id="try-it-in-10-minutes"></a>

Three commands. Pick one. Be honest about what will and won't work.

**1. Install the conservation layer.**
```bash
pip install conservation-enforcer
python -c "from conservation_enforcer import ConservationEnforcer, combined_policy
e = ConservationEnforcer(combined_policy(max_tokens=200, max_repetition=40))
print(e.enforce('What is the conservation law?', 'A budget cannot be exceeded; it can only be allocated.'))"
```

**2. Install the Rust VM and a ternary tool.**
```bash
cargo add fluxvm
cargo add ternary-science
```

**3. Read the boat essay and the conservation law, in that order.**
```bash
gh repo clone SuperInstance/AI-Writings
$EDITOR AI-Writings/ON_THE_12V_BOAT.md
$EDITOR AI-Writings/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md
```

What works / what might not, per command, in the full [SuperInstance/SuperInstance/README.md § Try it in 10 minutes](SuperInstance/README.md#try-it-in-10-minutes). If those three ran without surprises, you have a working VM, a working policy layer, and a working understanding of the constraint.

> **One-liner:** *three commands, ten minutes, the spine.*

---

## License and reality check <a id="license-and-reality-check"></a>

Most components are MIT or Apache-2.0. The conservation layer is AGPLv3 in places, on purpose — the rule is supposed to remain auditable. Each repo has its own LICENSE file; the reef is honest about its own boundaries.

The project is real. The numbers in the Cloudflare fleet inventory are real. The 200+ tests in conservation-enforcer are real. The boat is real. If something is broken, open an issue on the specific repo — there is no central triage queue and no Discord. If a repo you want doesn't exist yet, the same is true: the shell is waiting for the right tenant.

> **One-liner:** *there is no front door. Pick a shell. Walk in.*

---

## See also

- [SuperInstance/SuperInstance/README.md](SuperInstance/README.md) — the canonical guide
- [ORG_MAP.md](ORG_MAP.md) — structural topology
- [RUST_PORT_QUEUE.md](RUST_PORT_QUEUE.md) — next three Rust ports to ship
- [HERMIT_CRAB_MANIFESTO.md](HERMIT_CRAB_MANIFESTO.md) — the one-paragraph distillation
- [HERMIT_CRAB_中文.md](HERMIT_CRAB_中文.md) — 寄居蟹与渔船 (Chinese version)

---

*Updated 2026-07-22 07:25 UTC — v2*
