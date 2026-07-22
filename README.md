# SuperInstance — Canonical Guide

*v2 — 2026-07-22 07:25 UTC. More organised, sharper prose, image link verified.*

![AI Sonar Analysis — a small model reading sonar off the Gulf of Maine](https://github.com/SuperInstance/.github/raw/main/profile/sonar-ai-poc.jpg)

> **A fishing boat, a hermit crab, and a small model reading sonar at three in the morning. That is the org.**

---

## Contents

1. [What this is](#what-this-is)
2. [The two motifs](#the-two-motifs)
3. [The conservation law](#the-conservation-law)
4. [The 7-layer architecture](#the-7-layer-architecture)
5. [Top 12 repos to clone today](#top-12-repos-to-clone-today)
6. [The wheel of improvements](#the-wheel-of-improvements)
7. [Try it in 10 minutes](#try-it-in-10-minutes)
8. [Where to go from here](#where-to-go-from-here)
9. [License](#license)

---

## What this is

SuperInstance is a polyglot software ecosystem. About four thousand public repositories, two conservation laws in physical form, one register-based virtual machine, one family of constraint engines, one fleet of Cloudflare Workers, and about eighteen hundred pieces of writing that explain why any of it exists.

Everything in the org sits on **two motifs** and **one conservation law**:

| | What it is | One-liner |
|---|---|---|
| **Motif 1 — biological** | The [hermit crab](#motif-1-the-hermit-crab) | Every repo is a shell. Abandon what no longer fits. |
| **Motif 2 — physical** | The [12V fishing boat](#motif-2-the-12v-fishing-boat) | Edge-first. Wattage is the architecture. |
| **Law — γ + η = C** | [The conservation law](#the-conservation-law) | Useful work + entropy = fixed budget. Enforced by bytecode. |

---

## The two motifs

### Motif 1 — The hermit crab

A hermit crab is born soft. It looks around for a shell somebody else left behind, walks in, and gets on with being alive. As it grows, the shell gets tight. The crab doesn't try to expand the shell. **It moves.**

A SuperInstance repository is a shell. Some are tiny — a hundred lines of Rust proving a math idea. Some are large — [FLUX Core](https://github.com/SuperInstance/flux-core), a register-based VM with three implementations and a conformance suite. Most are not finished. **Most are not meant to be finished.** They are shells the crab walked through on the way to the next one.

When a repo no longer fits, we abandon it and leave it on the beach for someone else. The oracle is the GitHub graph, not the README. The README is the tide line.

![Hermit crab, half-size from `media/hermit-crab/half-size/`](media/hermit-crab/half-size/hermit-crab-diagram.jpg) · ![Hermit crab illustration, half-size](media/hermit-crab/half-size/hermit-crab-illustration.jpg)

> **One-liner:** *a hermit crab finds its shell; we abandon what no longer fits.*

### Motif 2 — The 12V fishing boat

In the Gulf of Maine there is a forty-something-foot commercial fishing vessel. House bank is 12 volts. Diesel charges when the engine runs. When the engine doesn't run, every watt is a watt the batteries don't replace. There is no shore power at sea. There is no cloud. There is a satellite link that drops in a swell, a [signal-k](https://signalk.org/) bus, and a coffee maker nobody ever unplugs.

**This boat is the reference implementation.**

Every component the org ships has to be the kind of component that still works on the boat. It has to run on the wattage the boat has, offline, on hardware that lives in salt air. When the radar paints a contact at three miles and closing, the inference has to finish before the contact becomes two.

The 12V bank does not read your slides about model size. The diesel does not care whether you prefer PyTorch or Burn. **Constraint creates precision. The constraint is the architecture.**

> **One-liner:** *the boat is the edge lab; energy is the conservation law.*

---

## The conservation law

One equation governs every intelligent system that has ever existed, from a bacterium swimming up a sugar gradient to a chatbot writing this README:

> **γ + η = C**

- **γ** is useful cognitive work.
- **η** is entropy — the noise, the uncertainty, the wasted compute, the thermal exhaust of thinking.
- **C** is the budget. **Fixed. Measurable. Cannot be exceeded. Can only be allocated.**

You can prove this three ways — Noether symmetry in physics, Friston's free-energy principle in neuroscience, Landauer erasure in thermodynamics — and arrive at the same equation. Softmax, the function at the heart of every transformer, is itself a strict conservation rule: it sums to one. The temperature parameter is the dial that tunes the γ/η balance. **Conservation is what physics leaves behind when you ask the model to behave.**

When C is small, known, and measured to the watt, you can build a system around the equation and it stays physically grounded. **We did. The implementation is called [FLUX](https://github.com/SuperInstance/flux-core).** Programs in FLUX cannot exceed their budget, because the bytecode does not contain an opcode that would let them. The dog cannot leave the pasture because the fence has no gate.

Sitting on top of FLUX is the policy layer. [Conservation Enforcer](https://github.com/SuperInstance/conservation-enforcer) evaluates FLUX programs and runtime outputs against conservation constraints — token budgets, entropy ceilings, category confinement. The rule is the rule. The rule is not a guideline. Rust twin: [conservation-enforcer-rs](https://github.com/SuperInstance/conservation-enforcer-rs).

> **One-liner:** *constraint creates precision; abundance creates slop.*

---

## The 7-layer architecture

The org is one shape at three scales: **the boat** (12V, watts), **the reef** (~4k repos), **the corpus** (~1.8k writings). The seven layers, ground up:

| # | Layer | What lives there | Anchors |
|---|---|---|---|
| **1** | **Substrate** | The 12V boat. Signal-K bus. The wattage budget is the primary invariant. | [signalk-bridge](https://github.com/SuperInstance/signalk-bridge) · [ship-log-sync](https://github.com/SuperInstance/ship-log-sync) |
| **2** | **VM** | FLUX. Register-based bytecode. 16 GP + 16 FP regs. A2A opcodes. | [flux-core](https://github.com/SuperInstance/flux-core) · [fluxvm](https://crates.io/crates/fluxvm) · [ternary-science](https://github.com/SuperInstance/ternary-science) |
| **3** | **Engines** | PLATO family. 5 implementations (C, Rust, Elixir, Zig, Python) at 9–10/10 conformance. | [plato-engine-block-c](https://github.com/SuperInstance/plato-engine-block-c) · [plato-core](https://pypi.org/project/plato-core/) · [plato-core-rs](https://github.com/SuperInstance/plato-core-rs) |
| **4** | **Policy / Enforce** | Conservation laws as architecture, not as policy. | [conservation-enforcer](https://github.com/SuperInstance/conservation-enforcer) · [flux-policy-tester](https://github.com/SuperInstance/flux-policy-tester) · [othismos](https://github.com/SuperInstance/othismos) |
| **5** | **Orchestration** | Cloudflare fleet (313 Workers / 17 D1 / 122 KV / 4 Vectorize / 1 Pages). Oracle relay. | [oracle-relay](https://github.com/SuperInstance/oracle-relay) · [search-superinstance-ai](https://github.com/SuperInstance/search-superinstance-ai) · [ship-log-search](https://github.com/SuperInstance/ship-log-search) |
| **6** | **Agents & Rooms** | Working animals, not employees. PLATO rooms. The kennel. | [si-exocortex-rs](https://github.com/SuperInstance/si-exocortex-rs) · [shepherds-console](https://github.com/SuperInstance/shepherds-console) · [breed-registry](https://github.com/SuperInstance/breed-registry) |
| **7** | **Artifacts** | The corpus. The 1,800 essays. The hermit-crab ecology. The drift line. | [AI-Writings](https://github.com/SuperInstance/AI-Writings) · [HERMIT_CRAB_MANIFESTO](../HERMIT_CRAB_MANIFESTO.md) · [ORG_MAP](../ORG_MAP.md) |

> **One-liner:** *the boat is the substrate; the VM runs on it; engines enforce the law; rooms use it; the kennel works in it; the corpus explains it.*

---

## Top 12 repos to clone today

A practical guide for a curious developer who wants to start running code in 30 minutes. Pick three.

| # | Repo | Language | What it is | Install / read |
|---|---|---|---|---|
| 1 | [flux-core](https://github.com/SuperInstance/flux-core) | Py / Rust / JS | Register-based bytecode VM. 16 GP + 16 FP regs. A2A opcodes. Three implementations verified byte-identical. | `pip install flux-vm` or `cargo add fluxvm` |
| 2 | [conservation-enforcer](https://github.com/SuperInstance/conservation-enforcer) | Python | Policy layer for LLM outputs. Token budget, entropy ceiling, category confinement. ~200 tests. | `pip install conservation-enforcer` |
| 3 | [conservation-enforcer-rs](https://github.com/SuperInstance/conservation-enforcer-rs) | Rust | Rust port of the policy layer. Same API, no GIL, deterministic latency. | `cargo add conservation-enforcer-rs` |
| 4 | [plato-engine-block-c](https://github.com/SuperInstance/plato-engine-block-c) | C / Rust / Elixir / Zig / Py | The constraint engine. Bare metal. Zero alloc. 9–10/10 conformance across implementations. | [plato-core on PyPI](https://pypi.org/project/plato-core/) |
| 5 | [flux-policy-tester](https://github.com/SuperInstance/flux-policy-tester) | Python + Rust | Fuzz the policies. Find where they leak. | `cargo add flux-policy-tester` |
| 6 | [si-exocortex-rs](https://github.com/SuperInstance/si-exocortex-rs) | Rust | Agent framework with conservation awareness. Wires PLATO + FLUX + Conservation Enforcer. | [Python twin on PyPI](https://pypi.org/project/si-exocortex/) |
| 7 | [shepherds-console](https://github.com/SuperInstance/shepherds-console) | Python | Ops dashboard. "Where are the dogs." | `pip install shepherds-console` |
| 8 | [breed-registry](https://github.com/SuperInstance/breed-registry) | Python | Model selection. Which bloodline for which job. | `pip install breed-registry` |
| 9 | [lineage-tracker](https://github.com/SuperInstance/lineage-tracker) | Python | Fine-tune provenance. Which dog came from which. | `pip install lineage-tracker` |
| 10 | [search-superinstance-ai](https://github.com/SuperInstance/search-superinstance-ai) | Cloudflare | Semantic search across all 4,098 repos. Workers + Vectorize. | [Live worker](https://search-superinstance.casey-digennaro.workers.dev/) |
| 11 | [ship-log-search](https://github.com/SuperInstance/ship-log-search) | Cloudflare | The boat's logbook. D1 + Vectorize + Pages frontend. | [Live worker](https://ship-log-search.pages.dev/) |
| 12 | [AI-Writings](https://github.com/SuperInstance/AI-Writings) | Markdown | The 1,800 essays. The *reasons*. Start with [ON_THE_12V_BOAT.md](https://github.com/SuperInstance/AI-Writings/blob/main/ON_THE_12V_BOAT.md). | `gh repo clone SuperInstance/AI-Writings` |

> **One-liner:** *clone 3, run one, read one, you've got the spine.*

---

## The wheel of improvements

The org rotates six axes in parallel. The wheel never returns to the same angle; every rotation produces a different artifact.

| Axis | What rotates | Anchor repo | Recent deliverable |
|---|---|---|---|
| **AUDIT** | Real bugs in shipped packages | [conservation-enforcer](https://github.com/SuperInstance/conservation-enforcer) | IDIV/IMOD fix v0.2.2 · running-flag fix v0.2.1 |
| **PUBLISH** | Built-but-unpublished crates and packages | [fluxvm](https://crates.io/crates/fluxvm) | v0.1.1 to crates.io · 4 Rust crates published |
| **IDEATE** | Paradigm essays in [AI-Writings](https://github.com/SuperInstance/AI-Writings) | [HERMIT_CRAB_MANIFESTO](../HERMIT_CRAB_MANIFESTO.md) | Conservation-of-presence · serial E09–E12 drafted |
| **DOCS** | Missing READMEs, AUDITs, CHANGELOGs | [constraint-theory-core](https://github.com/SuperInstance/constraint-theory-core) | 9 Cloudflare-repo READMEs (2026-07-21) |
| **RESEARCH** | Research-library crates → publish | [ternary-science](https://github.com/SuperInstance/ternary-science) | 80+ Rust research crates in repo |
| **INTEGRATE** | Cross-package conformance tests | [conformance-service](https://github.com/SuperInstance/conformance-service) | 5-PLATO + 3-FLUX byte-identical verified |

> **One-liner:** *build it, prove it, ship it, write it down, ground it in physics, run them all together.*

---

## Try it in 10 minutes

Three commands. Honest about what works and what doesn't.

**1. Install the conservation layer (Python).**
```bash
pip install conservation-enforcer
python -c "from conservation_enforcer import ConservationEnforcer; print(ConservationEnforcer().enforce('hi', 'hello world').allowed)"
```
Works on Python 3.10+. Outputs `True`.

**2. Install the VM and a ternary tool (Rust).**
```bash
cargo add fluxvm
cargo add ternary-science
```
Both crates are on [crates.io](https://crates.io). Both have `--example` binaries. `ternary-science` GPU benchmarks need CUDA; the CPU path works anywhere.

**3. Read the boat essay.**
```bash
gh repo clone SuperInstance/AI-Writings
$EDITOR AI-Writings/ON_THE_12V_BOAT.md
```
Plain text, ~3,500 words. Tells you the *why*.

> **One-liner:** *if those three work, you've got the spine; the rest is in the reef.*

---

## Where to go from here

| If you are a… | Front door |
|---|---|
| **Python developer** | `pip install flux-vm` is the front door. VM, assembler, conservation, PLATO rooms all installable. |
| **Rust developer** | `cargo add fluxvm` and `cargo add conservation-enforcer-rs`. Rust twins are the long-term direction. |
| **Systems person building for the edge** | [EDGE_FIRST_ARCHITECTURE.md](https://github.com/SuperInstance/constraint-theory-core/blob/main/EDGE_FIRST_ARCHITECTURE.md) is the floor. Then PLATO engines in C, Rust, Elixir. |
| **Reader, not a coder** | [ON_THE_12V_BOAT.md](https://github.com/SuperInstance/AI-Writings/blob/main/ON_THE_12V_BOAT.md) is the front door. Then [THE_CONSERVATION_LAW_OF_INTELLIGENCE.md](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md). |
| **Captain of a 12V boat** | Welcome. You are the reference implementation. Everything is downstream of you. |

> **One-liner:** *there is no front door; pick one shell and walk in.*

---

### Companion docs in this org

- [HERMIT_CRAB_MANIFESTO.md](../HERMIT_CRAB_MANIFESTO.md) — the one-paragraph distillation
- [HACKER_README.md](../HACKER_README.md) — for the contributor's eye
- [ORG_MAP.md](../ORG_MAP.md) — structural topology + surfaced risks
- [RUST_PORT_QUEUE.md](../RUST_PORT_QUEUE.md) — next three Rust ports to ship
- [HERMIT_CRAB_中文.md](../HERMIT_CRAB_中文.md) — 寄居蟹与渔船 (Chinese version)

---

## License

Most components are MIT or Apache-2.0. The conservation layer is sometimes AGPLv3 — the rule is supposed to remain auditable. Each repo has its own LICENSE; the reef is honest about its own boundaries.

---

*SuperInstance is a working-animal organization. We don't replace shepherds; we give them better dogs.*

*— Updated 2026-07-22 07:25 UTC*
