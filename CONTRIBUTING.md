# Contributing to SuperInstance

Welcome to **SuperInstance** — an open-source ecosystem for bounded, conservation-governed AI agents. We're building infrastructure where intelligence gets *cheaper* over time, not more expensive. Every contribution moves the crystallization curve forward.

Whether you're fixing a typo, implementing a new FLUX opcode, adding ternary math crates, or building PLATO rooms — you belong here. This guide will help you find your footing.

---

## Table of Contents

- [Finding Your Way Around](#finding-your-way-around)
- [Pick Your Language](#pick-your-language)
- [Fork, Clone, Build](#fork-clone-build)
- [Running Tests](#running-tests)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [The Living Repo Philosophy](#the-living-repo-philosophy)
- [Communication](#communication)
- [Areas Where We Need Help](#areas-where-we-need-help)

---

## Finding Your Way Around

SuperInstance is large — thousands of repos organized into ecosystems. Start here:

| Document | What it covers |
|----------|---------------|
| [PACKAGES.md](./PACKAGES.md) | Every installable package across PyPI, crates.io, and npm — start here to find something to work on |
| [CATALOG.md](./CATALOG.md) | All repos indexed by category and layer |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | The definitive ecosystem reference — three pillars (FLUX, PLATO, Constraint Theory), roadmap, and cross-repo relationships |
| [ROADMAP.md](./ROADMAP.md) | Fleet-wide roadmap with tiers, timelines, and ship-now initiatives |
| [GOOD_FIRST_ISSUES.md](./GOOD_FIRST_ISSUES.md) | Concrete, scoped tasks that can be done in under 2 hours |
| [TOPICS.md](./TOPICS.md) | Repos grouped by topic area |

### Browse the org

- **[All repositories](https://github.com/orgs/SuperInstance/repositories)** — filter by language or topic
- **[GitHub Topics](https://github.com/topics/superinstance)** — repos tagged `superinstance`
- **[Good first issues](https://github.com/issues?q=org%3ASuperInstance+label%3A%22good+first+issue%22+is%3Aopen)** across all repos

### The three pillars

Understanding these will help you find where you fit:

1. **FLUX** — A deterministic bytecode VM for agent logic. Same bytecode, same result, every node. Implementations in Python (2,037 tests), Rust (51 tests), JS, C, Zig, Go, Java, WASM, and CUDA.
2. **PLATO** — A room-level agent runtime with bounded context and deadband wakefulness. Agents only act when something meaningfully changes. Implementations in C99, Rust (`no_std`), Elixir/OTP, and Zig.
3. **Constraint Theory** — The mathematical governance layer. The conservation law γ + η = C enforces a fixed capability budget. Core crate in Rust (262 tests), companion in Python (167 tests).

---

## Pick Your Language

Different parts of the ecosystem use different languages. Pick what you know, or use this as an excuse to learn something new:

| Language | Where it lives | What you'd work on |
|----------|---------------|-------------------|
| **Python** | flux-runtime, plato-server, plato-core, plato-torch, exocortex, cocapn, git-agent, constraint-theory-py | FLUX runtime (2,037 tests), PLATO server, self-training rooms, agent frameworks |
| **Rust** | flux-core, constraint-theory-core, plato-engine, capitaine-1, ternary-* crates (365+) | FLUX VM, constraint math, PLATO engines, ternary compute library |
| **JavaScript / TypeScript** | tminus-client, tminus-dispatcher, flux-js | Multi-agent WebSocket client, fleet orchestration, FLUX in JS |
| **C99** | PLATO room implementations | Minimal PLATO rooms (~15KB binary), embedded targets |
| **Elixir / OTP** | PLATO room implementations | BEAM-supervised rooms, fault-tolerant agent runtimes |
| **Zig** | PLATO room implementations | Zero-allocation rooms, systems-level PLATO |
| **Go** | deckboss (graduated product) | Real-world fishing logbook app |

**Don't see your language?** FLUX and PLATO are both spec-based — you can implement either in any language. See [Adding New Implementations](#adding-new-implementations) below.

---

## Fork, Clone, Build

### 1. Fork and clone

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
- `sketch/` — experimental work (we love these — see [Living Repo Philosophy](#the-living-repo-philosophy))
- `test/` — test improvements

### 3. Set up your environment

Each repo has its own setup. Check the repo's README for specifics. General patterns:

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

---

## Running Tests

All PRs must pass CI. Run tests locally before pushing:

### Python repos (pytest)

```bash
pytest                          # full suite
pytest tests/test_specific.py   # single file
pytest -x                       # stop on first failure
pytest -k "test_name"           # filter by name
```

Most Python repos use `pytest` with `pytest-cov` for coverage. Some (like `plato-torch`) have 20+ test methods per module.

### Rust repos (cargo test)

```bash
cargo test                      # all tests (unit + integration + doc tests)
cargo test --lib                # library unit tests only
cargo test --test '*'           # integration tests only
cargo test --doc                # doc tests
cargo bench                     # run benchmarks (if criterion is set up)
```

Rust repos like `constraint-theory-core` use `#[cfg(test)]` module tests, `tests/` directory for integration tests, and doc-tests. 262 tests is typical for a core crate.

### JavaScript repos

```bash
npm test                        # check package.json scripts
npm run test:watch              # if available
```

### C / Zig / Elixir

```bash
make test           # C repos typically have a test target
zig build test      # Zig
mix test            # Elixir
```

### CI

Each repo has GitHub Actions workflows in `.github/workflows/`. The CI matrix typically covers:
- **Python:** 3.10, 3.11, 3.12 on ubuntu-latest
- **Rust:** stable (and nightly for benches) on ubuntu-latest
- **Node:** 18, 20 on ubuntu-latest

---

## Making Changes

- **Match existing patterns.** Look at surrounding code and follow the same style. Consistency beats perfection.
- **Run the formatter** before committing:
  - Python: `ruff format .` or `black .` (check the repo's `pyproject.toml`)
  - Rust: `cargo fmt`
  - JS: `npm run format` or `prettier .`
- **Write tests** for new behavior. See [Testing Requirements](#testing-requirements) below.
- **Comments explain *why*, not *what.*** The code already says what happens.
- **Keep functions focused.** If it does three things, it's three functions.
- **Update documentation** if you change an API, add a feature, or alter behavior.

---

## Submitting a Pull Request

### 1. Commit your changes

Write clear commit messages:

```
feat: add Format G opcode support to flux-core assembler
fix: handle empty memory dir in Agent.ask() fallback
test: add edge cases for stop-word stripping in cocapn
docs: clarify PLATO wire protocol versioning
```

### 2. Push and open a PR

```bash
git push -u origin feat/my-improvement
gh pr create --title "feat: short description" --body "What changed and why"
```

### 3. PR template

Your PR should include:
- **What changed** — a summary of the changes
- **Why** — the motivation or issue being addressed
- **Testing** — how you tested (which tests you ran, any new tests added)
- **Related issues** — `Closes #123` or `Relates to #456`

### 4. Review process

- A maintainer will review your PR. This is a conversation, not an exam.
- CI must pass on all supported versions/languages.
- Address feedback by pushing to the same branch (don't close and reopen).
- Once approved, a maintainer will squash-merge your PR.

---

## Code Style

**The golden rule: match the file you're editing.** Don't reformat code you're not touching.

| Language | Formatter | Linter | Notes |
|----------|-----------|--------|-------|
| Python | `ruff format` or `black` | `ruff check` | `pyproject.toml` configures line length, rules |
| Rust | `cargo fmt` | `cargo clippy` | Deny warnings in CI on core crates |
| JavaScript | `prettier` | `eslint` | Check `package.json` for config |
| C | `clang-format` | — | Each C repo ships a `.clang-format` |
| Zig | `zig fmt` | — | Built into the compiler |
| Elixir | `mix format` | `mix credo` | — |

Don't argue with the formatter. It wins.

---

## Testing Requirements

- **All PRs must pass CI.** No exceptions for core crates (`flux-core`, `constraint-theory-core`, `plato-core`).
- **New behavior needs test coverage.** If you add a feature, add tests for it.
- **Bug fixes should include a regression test** that would have caught the bug.
- **Aim for the project's existing coverage level.** Core crates are typically 90%+.
- **Test names should be descriptive.** `test_flux_vm_add_with_overflow_returns_error` is great. `test1` is not.

### Test patterns by ecosystem

**Python (pytest):**
```python
class TestFluxVMExecution:
    def test_add_registers(self):
        vm = FluxVM()
        vm.set_register(0, 42)
        vm.set_register(1, 8)
        vm.execute(bytes([OP_ADD, 0, 1, 0]))
        assert vm.get_register(0) == 50
```

**Rust:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn manifold_snap_returns_exact_pythagorean() {
        let result = snap_to_manifold(3.0, 4.0);
        assert_eq!(result.triple, (3, 4, 5));
    }
}
```

**JavaScript:**
```javascript
describe('FluxVM', () => {
  test('ADD stores sum in destination register', () => {
    const vm = new FluxVM();
    vm.setRegister(0, 42);
    vm.setRegister(1, 8);
    vm.execute(new Uint8Array([OP_ADD, 0, 1, 0]));
    expect(vm.getRegister(0)).toBe(50);
  });
});
```

---

## The Living Repo Philosophy

SuperInstance repos are **living repos**. This is core to how we work:

- 📝 **Sketches are welcome.** Not everything needs to be polished to merge. Rough drafts, exploratory code, and work-in-progress are all valid contributions. Open a draft PR and iterate.
- 🌱 **Growth over gates.** We'd rather merge a rough idea and iterate than reject good thinking. Don't let perfectionism stop you from contributing.
- 🔄 **Iterate in the open.** PRs are conversations, not exams. Ask questions, show work, learn together. We review to help, not to gatekeep.
- ⚡ **Ship and refine.** Breaking changes are fine with a major version bump. Don't let fear of imperfection block progress.
- 🧪 **Tests are the safety net.** Because we move fast, tests matter. They let us be bold without being reckless.

**If you're not sure whether your contribution is "ready":** open a draft PR. We'll help you figure it out. A sketch in a draft PR is always better than nothing.

---

## Adding New Implementations

FLUX and PLATO are spec-based — you can implement either in any language.

### FLUX implementations

1. **Read the spec:** [FLUX Bytecode Spec v1.0](https://github.com/SuperInstance/AI-Writings/blob/main/FLUX_BYTECODE_SPEC.md)
2. **Follow the bytecode format exactly.** Opcodes, encoding, and semantics are frozen.
3. **Implement the conformance test suite.** Every FLUX implementation must pass the shared test suite — byte-identical output and register state.
4. **Name it `flux-<lang>`.** Place it under the SuperInstance org.
5. **Register it** in [PACKAGES.md](./PACKAGES.md) and the implementation matrix in [ARCHITECTURE.md](./ARCHITECTURE.md).

### PLATO implementations

1. **Read the spec:** [PLATO Wire Protocol v0.1](https://github.com/SuperInstance/AI-Writings/blob/main/PLATO_WIRE_PROTOCOL.md)
2. **Implement the room protocol:** lifecycle hooks, message routing, state transitions.
3. **Follow the room contract.** Entry, exit, perception, and action APIs must match. Welcome JSON must include `protocol_version`.
4. **Name it `plato-<lang>`.** Place it under the SuperInstance org.
5. **Register it** in [PACKAGES.md](./PACKAGES.md) and the implementation matrix.

### Ternary library crates

The ternary library (365+ crates) covers core math, search, routing, caching, learning, music cognition, character systems, and protocols. To add a new crate:

1. **Check [CATALOG.md](./CATALOG.md)** for existing coverage — don't duplicate.
2. **Follow `cargo` conventions.** Each crate is standalone with minimal dependencies.
3. **Ship with tests.** The convention is 10+ tests minimum for a new crate.
4. **Register it** in PACKAGES.md under the Rust section.

---

## Communication

Everything happens on GitHub. No Slack, no Discord, no hidden channels.

| Channel | Use for |
|---------|---------|
| **[GitHub Discussions](https://github.com/SuperInstance/SuperInstance/discussions)** | Questions, ideas, design conversations, show-and-tell |
| **[GitHub Issues](https://github.com/SuperInstance/SuperInstance/issues)** | Bug reports, feature requests, tracking work |
| **PR comments** | Code-specific discussion |
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
