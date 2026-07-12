# SuperInstance

> AI agents governed by conservation laws, running on deterministic bytecode, interacting through room-level protocols. Not another framework — a physics for AI behavior.

<img src="https://img.shields.io/badge/repos-4%2C098-00E888?style=flat-square&labelColor=0a0a0f">
<img src="https://img.shields.io/badge/license-MIT-00E888?style=flat-square&labelColor=0a0a0f">
<img src="https://img.shields.io/pypi/v/flux-vm?style=flat-square&labelColor=0a0a0f&color=00E888&label=flux-vm">
<img src="https://img.shields.io/crates/v/fluxvm?style=flat-square&labelColor=0a0a0f&color=00E888&label=fluxvm">

---

## What We Build

### FLUX — Agent Bytecode

A register-based VM that runs agent logic as compiled bytecode. The same `.bin` file runs identically on Python, Rust, and JavaScript. Deterministic, auditable, fast.

A `.bin` file does not hallucinate. It does not drift. It does not decide to interpret your instructions differently. It executes — instruction by instruction — on any runtime that implements the VM spec.

```bash
pip install flux-vm
flux run deadband-controller --input temperature=72
```

Three independent VMs (Rust, Python, JS) cross-verify the same bytecode. 3,000+ tests confirm: if it runs on one, it runs on all.

### PLATO — Room Protocol

A wire protocol for room-level agent interaction. Sensors, actuators, alarms, history. Five implementations (C, Rust, Elixir, Zig, Python) all conforming to one spec.

The unit of governance in a building is not the thermostat — it is the room. PLATO rooms are this principle applied to AI: agents enter rooms, follow protocols, do work, and leave. An agent that steps out of line is not prompted to behave — it is removed from the room.

### Conservation Laws

**The thesis: intelligence is conserved.** It can be transformed but not created or destroyed. We build systems that enforce conservation bounds on AI behavior — not through prompts, but through compiled bytecode that physically cannot violate the constraint.

$$\gamma + \eta = C$$

- **γ (gamma)** — crystallized intelligence: compiled bytecode, cached reflexes. Cheap, fast, inflexible.
- **η (eta)** — live intelligence: LLM calls, runtime reasoning. Expensive, slow, flexible.
- **C** — capability level. Fixed for a given agent. You trade γ against η.

The underlying math is Shannon's chain rule. The enforcement is bytecode. The result: agent behavior that gets **cheaper over time**, not more expensive — repeated decisions crystallize from LLM calls into deterministic instructions.

---

## Quick Start

```bash
# Python (PyPI)
pip install flux-vm               # FLUX bytecode runtime
pip install conservation-enforcer  # Conservation law enforcement for LLMs
pip install flux-registry          # Pre-compiled agent policies
pip install plato-core             # PLATO foundation types & mesh registry
pip install si-exocortex           # Persistent cognitive substrate

# Rust (crates.io)
cargo add fluxvm                  # FLUX bytecode VM
cargo add ternary-science         # Experimental evidence for ternary intelligence
cargo add categorical-agents      # Category theory for agent composition
```

**Try the visual editor:** <https://superinstance.github.io/flux-visual-editor/>

---

## The Crystallization Curve

> Intelligence should get cheaper over time, not more expensive.

Every LLM call that can be replaced by bytecode is a win. Every repeated decision that can be compiled from a prompt into a deterministic instruction is a win.

| Stage | What | Cost per decision |
|-------|------|-------------------|
| **1. Fluid** | Pure LLM inference | $0.01–$0.05 |
| **2. Cached** | LLM + retrieval | $0.005–$0.01 |
| **3. Compiled** | FLUX bytecode | ~$0.0001 |
| **4. Crystallized** | Native code / hardware | ~$0 |

Month 1 in an agent's life: 90% LLM, 10% crystallized. Month 6: 30% LLM, 70% crystallized. The bill drops as agents mature. This is the opposite of every AI platform today.

→ [Read the full essay](https://github.com/SuperInstance/AI-Writings/blob/main/THE_CRYSTALLIZATION_CURVE.md)

---

## Architecture

```
  prompt → FLUX bytecode → PLATO room → conservation check → action
    (expensive)    (cheap)      (bounded)        (governed)        (auditable)
```

Agent decisions compile to **FLUX bytecode** that runs on a deterministic VM — every instruction is auditable and replayable. Agents live in **PLATO rooms** with bounded context and deadband wakefulness (only act when something meaningfully changes). Every operation is governed by **conservation laws** (γ + η = C): crystallized intelligence trades off against live intelligence at a fixed capability budget.

---

## Key Projects

| Project | What it is | Lang |
|---------|-----------|------|
| [**flux-core**](https://github.com/SuperInstance/flux-core) | Deterministic bytecode VM — decisions should be auditable, replayable, and cheap | Rust |
| [**flux-runtime**](https://github.com/SuperInstance/flux-runtime) | FLUX VM in Python — same bytecode, same behavior | Python |
| [**plato-server**](https://github.com/SuperInstance/plato-server) | Knowledge rooms with bounded context, deadband protocol, tile lifecycle | Python |
| [**constraint-theory-core**](https://github.com/SuperInstance/constraint-theory-core) | Geometric constraint satisfaction — 261 tests, zero deps, live WASM demo | Rust |
| [**exocortex**](https://github.com/SuperInstance/exocortex) | Persistent cognitive substrate for multi-agent systems | Python |
| [**git-agent**](https://github.com/SuperInstance/git-agent) | Repo-native autonomous agent — lives in git, uses commits as state transitions | Python |
| [**capitaine-1**](https://github.com/SuperInstance/capitaine-1) | Conservation-law fleet captain — enforces γ + η = C across agent operations | Rust |
| [**deckboss**](https://github.com/purplepincher/deckboss) | Graduated product: offline-first fishing logbook used by real captains | Go |

---

## Philosophy: A Living Sketchbook

4,098 repositories. Most are sketches — single-commit experiments, questions asked once and answered once. **This is the method, not the mess.**

Every repo is public from the first commit. Failed experiments stay up next to the ones that worked. Commit histories are written for agents, not for code review theater — each message captures *why*, not just *what*. When a future agent picks up a dormant repo, `git log` is the cheapest context window available.

Nothing is archived. Dormant ≠ dead.

---

## Explore

- 📦 [PACKAGES.md](PACKAGES.md) — All installable packages across PyPI, crates.io, npm
- 📚 [DOCS.md](DOCS.md) — Documentation portal
- 🗺 [NEXT_HORIZONS.md](NEXT_HORIZONS.md) — Strategy and direction
- 📝 [AI-Writings](https://github.com/SuperInstance/AI-Writings) — Essays, fiction, poetry, philosophy
- 🚀 [SHIPPING-LOG.md](SHIPPING-LOG.md) — What shipped and when

---

## Stats

4,098 repositories · 11 published packages · 3 FLUX VMs · 5 PLATO engines · 261+ constraint tests · 3,000+ tests total

---

## License

MIT. Everything. Always.
