# SuperInstance

<img src="https://img.shields.io/badge/repos-4%2C098-00E888?style=flat-square&labelColor=0a0a0f">
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">
<img src="https://img.shields.io/pypi/v/cocapn?style=flat-square&labelColor=0a0a0f&color=00E888&label=cocapn">
<img src="https://img.shields.io/npm/v/@superinstance/tminus-client?style=flat-square&labelColor=0a0a0f&color=00E888&label=tminus-client">

**An open-source ecosystem for bounded, conservation-governed AI agents.**

Most AI platforms get more expensive the more you use them. SuperInstance is
building the opposite: agents that crystallize repeated decisions into cheap
deterministic bytecode, so your bill goes **down** as your agents get smarter.

---

## The Big Idea: The Crystallization Curve

> **Intelligence should get cheaper over time, not more expensive.**

Every LLM call that can be replaced by bytecode is a win. Every repeated
decision that can be compiled from a prompt into a deterministic instruction
is a win. The pipeline moves ideas from expensive (LLM calls) to cheap
(compiled bytecode at the edge).

| Stage | What | Cost per decision |
|-------|------|-------------------|
| **1. Fluid** | Pure LLM inference | $0.01–$0.05 |
| **2. Cached** | LLM + retrieval | $0.005–$0.01 |
| **3. Compiled** | FLUX bytecode | ~$0.0001 |
| **4. Crystallized** | Native code / hardware | ~$0 |

Month 1 in an agent's life: 90% LLM, 10% crystallized.
Month 6: 30% LLM, 70% crystallized. The user's bill drops as agents mature.

This is the opposite of every AI platform today. → [Read the full essay](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CRYSTALLIZATION_CURVE.md)

---

## Quick Install

```bash
# Python — agent framework & PLATO rooms
pip install cocapn plato-core plato-torch

# Rust — FLUX VM, ternary math, constraint theory
cargo add fluxvm

# JavaScript — multi-agent WebSocket client (coming soon)
# npm install @superinstance/tminus-client @superinstance/tminus-dispatcher
```

See [PACKAGES.md](PACKAGES.md) for the full catalog across all registries.

---

## Key Projects

| Project | What it is | Lang |
|---------|-----------|------|
| [**flux-vm**](https://github.com/SuperInstance/flux-core) | Deterministic bytecode VM for agent logic — decisions should be auditable, replayable, and cheap | Rust |
| [**plato-server**](https://github.com/SuperInstance/plato-server) | Knowledge rooms with bounded context, deadband protocol, tile lifecycle — RAG with walls and a thermostat | Python |
| [**constraint-theory-core**](https://github.com/SuperInstance/constraint-theory-core) | Geometric constraint satisfaction — 83 tests, zero deps, running behind a live WASM demo | Rust |
| [**exocortex**](https://github.com/SuperInstance/exocortex) | Persistent cognitive substrate for multi-agent systems | Python |
| [**git-agent**](https://github.com/SuperInstance/git-agent) | Repo-native autonomous agent — lives in git, uses commits as state transitions | Python |
| [**capitaine-1**](https://github.com/SuperInstance/capitaine-1) | Conservation-law fleet captain — enforces γ + η = C across agent operations | Rust |
| [**deckboss**](https://github.com/purplepincher/deckboss) | Graduated product: offline-first fishing logbook used by real captains → | Go |

---

## Architecture in Three Sentences

Agent decisions compile to **FLUX bytecode** that runs on a deterministic VM —
every instruction is auditable and replayable. Agents live in **PLATO rooms**
with bounded context and deadband wakefulness (only act when something
meaningfully changes). Every operation is governed by **conservation laws**
(γ + η = C): crystallized intelligence trades off against live intelligence at
a fixed capability budget.

```
  prompt → FLUX bytecode → PLATO room → conservation check → action
    (expensive)    (cheap)      (bounded)        (governed)        (auditable)
```

---

## Philosophy: A Living Sketchbook

4,098 repositories. Most are sketches — single-commit experiments, questions
asked once and answered once. **This is the method, not the mess.**

Every repo is public from the first commit. Failed experiments stay up next to
the ones that worked. Commit histories are written for agents, not for code
review theater — each message captures *why*, not just *what*. When a future
agent picks up a dormant repo, `git log` is the cheapest context window
available.

Nothing is archived. Dormant ≠ dead. Old repos aren't tech debt — they're
context storage, readable by any agent that knows git.

---

## The Conservation Law

### γ + η = C

- **γ (gamma)** — crystallized intelligence: compiled bytecode, cached reflexes.
  Cheap, fast, inflexible.
- **η (eta)** — live intelligence: LLM calls, runtime reasoning.
  Expensive, slow, flexible.
- **C** — capability level. Fixed for a given agent. You trade γ against η.

The underlying math is Shannon's chain rule — genuinely sound. The small
crates that implement it (`ternary-entropy`, `conservation-action`) are tested
and correct. The governance model — enforcing conservation in CI/CD — is novel.

---

## Links

- 📦 [PACKAGES.md](PACKAGES.md) — every installable package, all registries
- ✍️ [AI-Writings](https://github.com/SuperInstance/AI-Writings) — essays, poetry,
  fiction, and philosophy written alongside the code
- 📖 [The Crystallization Curve](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CRYSTALLIZATION_CURVE.md) — the central essay
- 🦀 [flux-core](https://github.com/SuperInstance/flux-core) — start here for Rust
- 🐍 [cocapn](https://github.com/SuperInstance/cocapn) — start here for Python
- 🚢 [DeckBoss](https://github.com/purplepincher/deckboss) — the shipped product

---

## License

MIT
