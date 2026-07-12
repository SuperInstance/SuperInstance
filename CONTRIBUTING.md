# Contributing to SuperInstance

Welcome to **SuperInstance** — an open-source ecosystem for bounded, conservation-governed AI agents. We're building infrastructure where intelligence gets *cheaper* over time, not more expensive. Every contribution moves the crystallization curve forward.

Whether you're fixing a typo, implementing a new FLUX opcode, adding ternary math crates, or building PLATO rooms — you belong here. This guide will help you find your footing.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style](#code-style)
- [Testing](#testing)
- [The Living Repo Doctrine](#the-living-repo-doctrine)
- [Adding New FLUX Implementations](#adding-new-flux-implementations)
- [Adding New PLATO Implementations](#adding-new-plato-implementations)
- [Pull Request Process](#pull-request-process)
- [Communication](#communication)
- [Areas Where We Need Help](#areas-where-we-need-help)

---

## Getting Started

### 1. Fork the repo you want to contribute to

```bash
# Via GitHub CLI (recommended)
gh repo fork SuperInstance/<repo-name> --clone
cd <repo-name>

# Or via git
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Create a branch

```bash
git checkout -b feat/my-improvement
```

Use a descriptive branch name:
- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation
- `sketch/` — experimental work (we love these — see [Living Repo Doctrine](#the-living-repo-doctrine))
- `test/` — test improvements

### 3. Install language-specific tooling

Different parts of the ecosystem use different languages. Install what you need:

| Language | Minimum Version | Install |
|----------|----------------|---------|
| **Python** | ≥ 3.10 | [python.org](https://www.python.org/downloads/) — use `pyenv` for version management |
| **Rust** | stable channel | [rustup.rs](https://rustup.rs/) — `rustup default stable` |
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org/) — use `nvm` or `fnm` for version management |
| **C compiler** | C99 | `gcc` or `clang` (most systems have one) |
| **Zig** | 0.13+ | [ziglang.org](https://ziglang.org/download/) |
| **Elixir** | 1.15+ | [elixir-lang.org](https://elixir-lang.org/install.html) |

Then set up your project environment:

**Python:**
```bash
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"    # or: pip install -r requirements-dev.txt
```

**Rust:**
```bash
cargo build
# Some crates use nightly for benchmarks — check rust-toolchain.toml
```

**JavaScript:**
```bash
npm install    # or: pnpm install
```

**C / Zig:**
```bash
make           # check the Makefile or build.zig
```

### Finding your way around

SuperInstance is large — thousands of repos organized into ecosystems. Start here:

| Document | What it covers |
|----------|---------------|
| [PACKAGES.md](./PACKAGES.md) | Every installable package across PyPI, crates.io, and npm |
| [CATALOG.md](./CATALOG.md) | All repos indexed by category and layer |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | The definitive ecosystem reference — three pillars, roadmap, cross-repo relationships |
| [ROADMAP.md](./ROADMAP.md) | Fleet-wide roadmap with tiers, timelines, and ship-now initiatives |
| [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md) | Concrete, scoped tasks that can be done in under 2 hours |
| [TOPICS.md](./TOPICS.md) | Repos grouped by topic area |

### The three pillars

Understanding these will help you find where you fit:

1. **FLUX** — A deterministic bytecode VM for agent logic. Same bytecode, same result, every node. Implementations in Python (2,037 tests), Rust (51 tests), JS, C, Zig, Go, Java, WASM, and CUDA.
2. **PLATO** — A room-level agent runtime with bounded context and deadband wakefulness. Agents only act when something meaningfully changes. Implementations in C99, Rust (`no_std`), Elixir/OTP, and Zig.
3. **Constraint Theory** — The mathematical governance layer. The conservation law γ + η = C enforces a fixed capability budget. Core crate in Rust (262 tests), companion in Python (167 tests).

---

## Code Style

**The golden rule: match the file you're editing.** Don't reformat code you're not touching.

### Python

- **Formatter:** `ruff format` or `black` (check the repo's `pyproject.toml`)
- **Linter:** `ruff check`
- **Type hints:** Required on all public functions and methods
- **Docstrings:** Required on all public functions, classes, and modules (Google or NumPy style — match the repo)
- **Line length:** 88 chars default (Black default), unless the repo configures otherwise

```python
def compute_gamma(eta: float, budget: float) -> float:
    """Compute the gamma component from eta and a fixed budget.

    Args:
        eta: The efficiency ratio.
        budget: The total capability budget C.

    Returns:
        The gamma value (budget - eta).
    """
    return budget - eta
```

### Rust

- **Formatter:** `cargo fmt`
- **Linter:** `cargo clippy` (must be clean — CI denies warnings on core crates)
- **Documented public APIs:** Every `pub` item must have a `///` doc comment
- **Error handling:** Use `Result<T, E>` — no `unwrap()` in library code

```rust
/// Computes the gamma component from an efficiency ratio and budget.
///
/// # Arguments
/// * `eta` - The efficiency ratio
/// * `budget` - The total capability budget C
///
/// # Returns
/// The gamma value (budget - eta)
pub fn compute_gamma(eta: f64, budget: f64) -> f64 {
    budget - eta
}
```

### JavaScript

- **Formatter:** `prettier` (check `package.json` for config)
- **Linter:** `eslint`
- **Modules:** Use ES modules (`import`/`export`) — not CommonJS (`require`)
- **Comments:** JSDoc comments on all exported functions and classes

```javascript
/**
 * Compute the gamma component from eta and a fixed budget.
 * @param {number} eta - The efficiency ratio.
 * @param {number} budget - The total capability budget C.
 * @returns {number} The gamma value (budget - eta).
 */
export function computeGamma(eta, budget) {
  return budget - eta;
}
```

### C

- **Formatter:** `clang-format` (each C repo ships a `.clang-format`)
- **Indentation:** 4 spaces — no tabs
- **Header guards:** Use `#ifndef`/`#define`/`#endif` include guards (or `#pragma once` — match the repo)
- **Naming:** `snake_case` for functions and variables, `UPPER_CASE` for macros

```c
#ifndef FLUX_VM_H
#define FLUX_VM_H

#include <stdint.h>

/**
 * Execute a single FLUX bytecode instruction.
 * @param vm    Pointer to the VM state.
 * @param op    The opcode byte.
 * @return      0 on success, non-zero error code on failure.
 */
int flux_vm_step(flux_vm_t *vm, uint8_t op);

#endif /* FLUX_VM_H */
```

### Other languages

| Language | Formatter | Notes |
|----------|-----------|-------|
| Zig | `zig fmt` | Built into the compiler |
| Elixir | `mix format` | `mix credo` for linting |

Don't argue with the formatter. It wins.

---

## Testing

### All PRs must pass CI

No exceptions for core crates (`flux-core`, `constraint-theory-core`, `plato-core`). CI runs automatically on every push and PR.

### Write tests for new features

- **New behavior needs test coverage.** If you add a feature, add tests for it.
- **Bug fixes should include a regression test** that would have caught the bug.
- **Aim for the project's existing coverage level.** Core crates are typically 90%+.
- **Test names should be descriptive.** `test_flux_vm_add_with_overflow_returns_error` is great. `test1` is not.

### FLUX: Cross-implementation conformance

Every FLUX implementation must pass the shared conformance test suite. This ensures that the same bytecode produces identical results across Python, Rust, JS, C, Zig, Go, Java, WASM, and CUDA.

```bash
# Run the cross-implementation conformance test
# The canonical test file is tests/cross_impl.flx
# Your implementation must produce byte-identical output and register state
```

If you add a new opcode or change behavior, update `tests/cross_impl.flx` and verify **all** implementations still pass.

### PLATO: Protocol conformance suite

Every PLATO implementation must pass the protocol conformance suite. This validates the full room protocol: lifecycle (tick), sensors, actuators, history, and alarms.

```bash
# Run the PLATO conformance suite
# Validates: tick protocol, sensor reads, actuator commands,
#             history queries, alarm set/clear, welcome JSON
```

The conformance suite lives in the `plato-protocol-test` repo and can be run against any implementation.

### Running tests locally

**Python (pytest):**
```bash
pytest                          # full suite
pytest tests/test_specific.py   # single file
pytest -x                       # stop on first failure
pytest -k "test_name"           # filter by name
```

**Rust (cargo test):**
```bash
cargo test                      # all tests (unit + integration + doc tests)
cargo test --lib                # library unit tests only
cargo test --test '*'           # integration tests only
cargo test --doc                # doc tests
```

**JavaScript:**
```bash
npm test                        # check package.json scripts
npm run test:watch              # if available
```

**C / Zig / Elixir:**
```bash
make test           # C repos typically have a test target
zig build test      # Zig
mix test            # Elixir
```

### CI matrix

Each repo has GitHub Actions workflows in `.github/workflows/`. The CI matrix typically covers:
- **Python:** 3.10, 3.11, 3.12 on ubuntu-latest
- **Rust:** stable (and nightly for benches) on ubuntu-latest
- **Node:** 18, 20 on ubuntu-latest

---

## The Living Repo Doctrine

SuperInstance repos are **living repos**. This is core to how we work.

### Sketches are welcome

Not everything needs to be polished. Rough drafts, exploratory code, and work-in-progress are all valid contributions. Open a draft PR and iterate. We'd rather merge a rough idea and refine it than reject good thinking.

### Repos evolve through stages

```
sketch → polished → shipped
```

Contributing at **any stage** is valid:
- **Sketch stage:** Exploring an idea. Code may be rough, tests may be sparse. That's fine. Draft PRs welcome.
- **Polished stage:** The idea works. Tests exist. API is stabilizing. Ready for review and feedback.
- **Shipped stage:** Used in production. Full test coverage. Breaking changes require version bumps.

You don't have to know which stage you're at. Open a PR and we'll figure it out together.

### We archive, we don't delete

When a repo has been superseded or is no longer active, we **archive** it — not delete it. History matters. Code is reference material. Someone may want to learn from what we built, even if it's no longer the active path.

### Growth over gates

- 🔄 **Iterate in the open.** PRs are conversations, not exams. Ask questions, show work, learn together.
- ⚡ **Ship and refine.** Breaking changes are fine with a major version bump. Don't let fear of imperfection block progress.
- 🧪 **Tests are the safety net.** Because we move fast, tests matter. They let us be bold without being reckless.

**If you're not sure whether your contribution is "ready":** open a draft PR. We'll help you figure it out.

---

## Adding New FLUX Implementations

FLUX is spec-based — you can implement it in any language.

1. **Read the spec:** [FLUX_BYTECODE_SPEC.md](https://github.com/SuperInstance/AI-Writings/blob/main/FLUX_BYTECODE_SPEC.md) in [AI-Writings](https://github.com/SuperInstance/AI-Writings)
2. **Implement all canonical opcodes.** The opcode table, encoding, and semantics are frozen. Every implementation must support the full instruction set.
3. **Pass `tests/cross_impl.flx`.** This is the cross-implementation conformance test. Your implementation must produce byte-identical output and register state for every test case.
4. **Add your implementation to the cross-implementation matrix** in [ARCHITECTURE.md](./ARCHITECTURE.md) and register it in [PACKAGES.md](./PACKAGES.md).

**Naming convention:** `flux-<lang>` (e.g., `flux-lua`, `flux-ocaml`).

---

## Adding New PLATO Implementations

PLATO is spec-based — you can implement it in any language.

1. **Read the spec:** [PLATO_WIRE_PROTOCOL.md](https://github.com/SuperInstance/AI-Writings/blob/main/PLATO_WIRE_PROTOCOL.md) in [AI-Writings](https://github.com/SuperInstance/AI-Writings)
2. **Implement the full room protocol:**
   - **Tick** — lifecycle and deadband wakefulness
   - **Sensors** — read sensor state
   - **Actuators** — send commands
   - **History** — query per-tick historical state
   - **Alarms** — set and clear alarms
3. **Pass the PLATO conformance suite.** Run the protocol tests from `plato-protocol-test` against your implementation.
4. **Add your implementation to PLATO_IMPLEMENTATION_MATRIX.md** and register it in [PACKAGES.md](./PACKAGES.md).

**Naming convention:** `plato-<lang>` (e.g., `plato-ocaml`, `plato-haskell`).

### Ternary library crates

The ternary library (365+ crates) covers core math, search, routing, caching, learning, music cognition, character systems, and protocols. To add a new crate:

1. **Check [CATALOG.md](./CATALOG.md)** for existing coverage — don't duplicate.
2. **Follow `cargo` conventions.** Each crate is standalone with minimal dependencies.
3. **Ship with tests.** The convention is 10+ tests minimum for a new crate.
4. **Register it** in PACKAGES.md under the Rust section.

---

## Pull Request Process

1. **Branch from `main`.** Create a feature branch (`git checkout -b feat/my-feature`).
2. **One feature per PR.** Keep PRs focused. If you're fixing three unrelated things, open three PRs.
3. **Include tests.** New features and bug fixes need test coverage (see [Testing](#testing)).
4. **Update documentation if needed.** If you change an API, add a feature, or alter behavior, update the README and relevant docs.
5. **Ensure CI passes.** Run tests locally before pushing. CI must be green before merge.
6. **Request review.** A maintainer will review your PR. This is a conversation, not an exam.

### Commit messages

Write clear commit messages:

```
feat: add Format G opcode support to flux-core assembler
fix: handle empty memory dir in Agent.ask() fallback
test: add edge cases for stop-word stripping in cocapn
docs: clarify PLATO wire protocol versioning
```

### Opening a PR

```bash
git push -u origin feat/my-improvement
gh pr create --title "feat: short description" --body "What changed and why"
```

Your PR should include:
- **What changed** — a summary of the changes
- **Why** — the motivation or issue being addressed
- **Testing** — how you tested (which tests you ran, any new tests added)
- **Related issues** — `Closes #123` or `Relates to #456`

### Review process

- Address feedback by pushing to the same branch (don't close and reopen).
- Once approved, a maintainer will squash-merge your PR.

---

## Communication

Everything happens on GitHub. No Slack, no Discord, no hidden channels.

| Channel | Use for |
|---------|---------|
| **[GitHub Issues](https://github.com/SuperInstance/SuperInstance/issues)** | Bug reports and feature requests |
| **[GitHub Discussions](https://github.com/SuperInstance/SuperInstance/discussions)** | Questions, ideas, design conversations, show-and-tell |
| **PR comments** | Code-specific discussion |
| **[DOCS.md](./DOCS.md)** | Architecture context and cross-repo documentation index |
| **[GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md)** | Concrete tasks for new contributors |

**Response times:** This is an open-source project maintained by people who care. We respond as fast as we can. If you don't hear back in a few days, bump the thread politely — we probably missed it.

---

## Areas Where We Need Help

These are the areas where contributions would have the most impact right now. See the [full roadmap](./ARCHITECTURE.md#10-roadmap) and [ROADMAP.md](./ROADMAP.md) for details.

### 30 Days — Protocol Hardening (July 2026)

- **PLATO audit gaps:** Per-tick history in C/Zig, runtime `alarm set` in C/Zig, Unix timestamps in Elixir/Zig, TCP servers for Elixir and Zig
- **FLUX A2A parity:** Implement Format G opcodes in Rust and JS (currently stubbed) — full agent messaging across all VMs
- **Conformance test suite:** The `plato-protocol-test` repo needs contributors to build a live CI harness that connects to any implementation and validates all protocol responses
- **Publish wave:** Help push the top 20 ternary crates to crates.io with docs and benchmarks

### 60 Days — Ecosystem Integration (August–September 2026)

- **FLUX ↔ PLATO bridge:** Design and implement the bridge layer so FLUX bytecode can directly issue PLATO wire protocol commands
- **Conservation enforcement in CI:** Build GitHub Actions tooling for automated γ/η accounting — every PR reports its crystallization ratio
- **Interactive algorithm visualizations:** Web app comparing binary vs ternary search, packing, routing
- **Jupyter notebook series:** 12 notebooks for academic use — "Ternary Linear Algebra 101", "Z₃ in Machine Learning", "Why Three States Beat Two"
- **PLATO MCP integration:** Make PLATO rooms work as MCP tools — any MCP framework can use them

### 90 Days — Platform Launch (October–December 2026)

- **`npx create-plato-game`:** Scaffold complete game projects from a single prompt
- **`npm install @superinstance/band`:** Music cognition as a drop-in library — give it MIDI, it improvises back
- **`npx create-character`:** Generate character sheets as portable `.nail` bundles
- **Research benchmark suite:** Rigorous ternary vs binary vs float benchmarks on NVIDIA GPUs
- **First research papers:** Constraint theory formalization for ICML/NeurIPS workshops

### Always welcome

- **Documentation improvements** — typos, clarity, missing examples
- **Test coverage** — find untested code paths and add tests
- **Bug reports** — if something breaks, tell us (with a reproducible example)
- **Performance benchmarks** — the ternary library needs real-world benchmark data
- **New FLUX/PLATO implementations** — want FLUX in Lua? PLATO rooms in OCaml? Go for it.

---

## Quick Reference

```bash
# Fork and clone
gh repo fork SuperInstance/<repo> --clone && cd <repo>

# Create a branch
git checkout -b feat/my-feature

# Run tests
pytest              # Python
cargo test          # Rust
npm test            # JavaScript

# Push and PR
git push -u origin feat/my-feature
gh pr create --title "feat: description" --body "What and why"
```

---

<sub>This is a living document. PRs to improve it are always welcome.</sub>
