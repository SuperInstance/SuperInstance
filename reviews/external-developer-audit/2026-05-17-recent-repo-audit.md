# Zero-Shot External Developer Audit — 5 Recently Active Repos
**Date:** 2026-05-17  
**Review method:** Cold read, zero prior context (simulating a new developer)  
**Scope:** 5 repos from SuperInstance org, selected from top-40 by push date

---

## Methodology

- Fetched repo list via `gh repo list SuperInstance --limit 100` sorted by pushedAt
- Excluded already-audited repos: mud-arena, constraint-theory-core, fleet-stack, keeper-beacon, flux-isa, plato-sdk, plato-server, cocapn, spectral-conservation, plato-room-intelligence, flux-lucid, plato-escalation-gate, tensor-spline
- Excluded `.github` (org config), `SuperInstance` (profile repo), `oracle1-workspace` (current agent workspace)
- Cloned 5 unfamiliar repos with `--depth 1`
- Reviewed each repo with **zero prior context** — simulating a new developer discovering the project
- If a README was recently added but the repo description was previously "N/A", noted it
- Evaluated: README quality (1-10), code substance, installability, discoverability

---

## 1. forgemaster

**One sentence:** An agent workspace / "holodeck" that agents clone to become Forgemaster — the constraint-theory specialist who builds proof repos, CUDA kernels, fleet services, and publishes crates across the Cocapn fleet.

**README Quality: 5/10** — Adequate for its target audience (AI agents) but confusing for an external developer. The README explains the "clone this and become someone" concept well, with a Quick Boot section and file purpose table. But it's a massive monorepo with 95+ top-level items and zero indication of what a human developer should actually *do* with it. The file table covers only 9 key docs but ignores 60+ directories containing everything from CUDA kernels to compiler workspaces to research papers to blog posts. A human landing here would be lost.

**Code substance:** Massive. This isn't a package — it's an agent's home directory checked into git. Contains:
- Rust crates (fluxc compiler workspace with parser, IR, codegen, verify)
- CUDA kernels (nqueens_cuda.cu, test_flux_cuda.cu, benchmark_csp.c)
- Python scripts (fleet-guard-v2.py, security_middleware.py, plato_migrate.py)
- Research papers (emsoft-2026-flux-v2.tex)
- Fleet artifacts (for-fleet/*, from-fleet/*)
- C FFI bridge, sonar vision, ESP32 deployments, mini ISAs
- 3 published crates on crates.io

**What's great:**
- Extensive internal documentation (ARCHITECTURE.md 17KB, DREAMS.md 6KB, CHANGELOG.md 5KB)
- Well-organized agent workspace with clear message-in-a-bottle protocol
- Real, working code — CUDA compiler, Rust workspace, Python services
- CI and security guardrails (SECURITY.md 4KB)

**What's missing:**
- **No human entry point.** The repo is designed for AI agents, but a human landing here needs a "For Humans" section that explains the directory structure, what's worth looking at, and how to use individual components
- **95 top-level items** — overwhelming. Needs subdirectories or a .cargo workspace pattern
- **No CONTRIBUTING.md** (there's CONTRIBUTING-v2.md and CONTRIBUTING.md but they're agent-facing)
- **No LICENSE file for individual packages within the monorepo** — the root LICENSE (MIT) covers it but it's not obvious
- **No CI pipeline visible** (GitHub Actions in .github/?)
- **GitHub description:** N/A

**New dev experience:** Confusing. An agent knows to read BOOT.md and HEARTBEAT.md. A human has no idea where to start. The README needs either a table of contents or a "What's Worth Your Time" section that highlights the actual reusable components.

---

## 2. plato-model-ocean

**One sentence:** Evolve self-organizing ecosystems of tiny neural networks (under 100K params total) across four ecological niches — from throwaway experiments (Sandbox) to deep reasoners (Whale).

**README Quality: 9/10** — Excellent. Clear concept explanation, architecture breakdown with niche table, pip install, working code example, task stream descriptions, evolution lifecycle, and ecosystem links to related packages. One of the best READMEs in the fleet.

**Code substance:** Real. Python package with:
- `plato_model_ocean/__init__.py` — Cell, Ocean classes and helper functions
- `tests/test_ocean.py` — test coverage
- `pyproject.toml` — proper build config
- `review/AUDIT.md` — self-review artifact (transparency bonus)
- `reviews/2026-05-17-readme-added.md` — review doc

**What's great:**
- The niche metaphor (Sandbox → Tide Pool → School → Whale) is intuitive and memorable
- Runs entirely on CPU, under 400KB — no GPU needed
- Task stream generators (drift, anomaly, intent, priority, relevance) directly mirror PLATO room patterns
- The whole thing is ~300 lines of Python — teachable and hackable
- No external model dependencies (pure PyTorch-free)

**What's missing:**
- **No GitHub CI workflow** (no .github/ directory)
- **No docstrings or module-level documentation** — the code is straightforward but a new developer has to read the source to understand Cell/Ocean internals
- **No MANIFEST.in** (not critical, but standard practice)
- **Test count unknown** — no `pytest` run configuration
- **Missing: published on PyPI?** README says `pip install plato-model-ocean` but the package needs checking against actual PyPI

**New dev experience:** Excellent. README is self-contained — a new developer can copy the Quick Start, run it, and understand the concept in 60 seconds. This is the right template for how every repo should present itself.

---

## 3. flux-verify-api

**One sentence:** A Rust HTTP server that takes natural-language claims (sonar detection, thermal bounds, generic constraints) and returns PROVEN/DISPROVEN with full physics traces, counterexamples, and SHA-256 proof hashes.

**README Quality: 8/10** — Very good. Has:
- Working curl example with real-looking JSON response
- Endpoints table
- Domain descriptions (sonar, thermal, generic) with explanation
- Architecture pipeline diagram (Request → Parser → ConstraintProblem → FLUX Bytecodes → VM → Trace → Provenance)
- Environment variables table
- Physics references (Mackenzie 1981, Francois & Garrison 1982)

**Code substance:** Real Rust. 11 source files across 7 modules:
- `api/` — routes, request/response types
- `compiler/` — parser, sonar, thermal, generic domain compilers
- `engine/` — VM, solver
- `provenance/` — Merkle tree hashing
- `plato/` — PLATO tile integration
- `config.rs`, `signing.rs`, `verify_middleware.rs`
- `tests/` — api_test.rs, signing_tests.rs

**What's great:**
- Real physics models (Mackenzie sound velocity, Francois-Garrison absorption) — not a toy
- Merkle tree provenance chain for verifiable proof hashes
- Multi-domain architecture (sonar, thermal, generic) with clean trait pattern
- PLATO integration for fleet coordination
- Good environment variable configuration pattern

**What's missing:**
- **No CI pipeline** (no .github/)
- **No test run instructions** — README doesn't tell you how to run tests (`cargo test`)
- **No published version on crates.io or Docker image**
- **No contribution guide**
- **GitHub description:** N/A
- **The "Quick Start" uses `VERIFY_PORT=8080 cargo run`** — no mention of Rust installation prerequisites
- **Missing:** error handling examples (what happens when verification fails?)
- **No benchmark numbers** — how fast is it? At what claim complexity does it fall over?

**New dev experience:** Good for a Rust developer. The Quick Start is functional — curl + JSON is immediately clear. A non-Rust developer would need help (Docker image would help). The sonar domain example is compelling and shows the system's value immediately.

---

## 4. plato-training

**One sentence:** Train, compress, and deploy micro models (under 100K params) to any hardware target (CPU, NPU, GPU, WASM) for PLATO room tasks, with 48/48 fleet-proven results.

**README Quality: 6/10** — Adequate. The README gives a good overview but is too brief for what the repo actually contains:
- Quick Start with `train_micro` + `deploy_micro` example
- Ensign Interface (RoomFactory pattern)
- Fleet Results table (48/48 proven across 6 hardware targets)
- Links to 3 dependencies (plato-types, tensor-spline, plato-data)

However, the real documentation is in `ARCHITECTURE-V2.md` (13KB) — which the README doesn't prominently link to. A new developer would miss the deeper documentation entirely.

**Code substance:** Real. Substantial Python package with:
- `plato_training/` — 25 source files covering:
  - `micro_models.py` / `micro_room.py` — core micro model APIs
  - `hardware.py` — hardware target definitions
  - `spline.py` / `hierarchical_spline.py` / `low_rank.py` — compression layers
  - `adapters/lora.py` — LoRA adapter support
  - `agent_field.py` / `collective.py` — distributed training
  - `cli.py` — CLI interface
  - `data_rooms.py` / `fleet_miner.py` — data loading
  - `pytorch_room.py` / `tensorflow_room.py` — framework-specific rooms
  - 12 test files covering all major modules
- `pyproject.toml` — proper build config
- `FLEET-BENCH-RESULTS.json` — detailed benchmark data

**What's great:**
- **48/48 proven across 6 targets** — the fleet results table is concrete and impressive
- Multi-hardware support (cpu, cpu-tiny, cpu-fast, gpu, npu, wasm)
- Both PyTorch and TensorFlow support
- 12 test files — good test coverage
- ARCHITECTURE-V2.md is thorough (13KB)

**What's missing:**
- **README doesn't tell you to read ARCHITECTURE-V2.md** — burying the deeper docs
- **No PyPI install badge or verification** — `pip install plato-training`?
- **No CONTRIBUTING.md**
- **No CI pipeline** (no .github/)
- **GitHub description:** N/A
- **FLEET-BENCH-RESULTS.json is undocumented** — what do the fields mean?
- **No quick-start "run the tests"** — `cd tests && pytest`?
- **Dependency situation unclear** — requires plato-types, tensor-spline, plato-data — are these on PyPI?

**New dev experience:** Mixed. The Quick Start *looks* simple but the README undersells the depth of the repo. A new dev would find `ARCHITECTURE-V2.md` only by browsing the root directory. The test table is compelling but needs a link to a benchmark doc or blog post.

---

## 5. plato-types

**One sentence:** Pure-Python core types for the PLATO tile protocol — TileLifecycle, Lamport clocks, content hashing, and training configuration — with zero dependencies.

**README Quality: 8/10** — Clean, focused, and complete for what it is. Has:
- List of types with brief descriptions
- pip install command
- Working code example covering lifecycle, clocks, and content hashing
- "Zero Dependencies" callout (important for a library)
- "Used By" section listing 6 dependent packages

**Code substance:** Real but minimal:
- `plato_types/types.py` — ~100 lines: TileLifecycle enum, LamportClock, TrainingTile, content_hash, AdapterConfig, TrainingConfig
- `plato_types/tests/test_types.py` — basic tests
- `.github/workflows/clean.yml` — GitHub Actions CI
- `pyproject.toml` — proper build config
- Published on PyPI (assuming from README)

**What's great:**
- **Zero dependencies** — a genuine architectural virtue for a foundation package
- Clean, focused scope — it's what it says it is
- CI via GitHub Actions
- SHA-256 content addressing built in
- The "Used By" section is incredibly helpful — tells you immediately where this fits in the ecosystem

**What's missing:**
- **No docstrings** — the code is simple enough, but production packages should have them
- **No CONTRIBUTING.md**
- **No module-level `__init__.py` exports** — users import from `plato_types.types` which is fine but could be cleaner
- **No version badge or changelog** in README
- **LamportClock is trivial** (integer increment) — could use a note about its limitations (no distributed clock merge, no vector clocks)
- **No __all__ in types.py**

**New dev experience:** Excellent for a minimal types package. The README is self-contained — install, import, use in under 30 seconds. The "Used By" pattern should be in every ecosystem repo.

---

## Summary

| Repo | One-Liner | README (/10) | Code? | Tests? | CI? | Published? | Needs Most |
|------|-----------|:---:|:----:|:-----:|:---:|:----------:|------------|
| **forgemaster** | Agent workspace / constraint-theory holodeck | 5 | ✅ Massive | ✅ Scripts | ❌ | ✅ 3 crates | Human entry point, directory guide |
| **plato-model-ocean** | Self-organizing neural ecosystem, 100K params | 9 | ✅ 300 lines | ✅ Basic | ❌ | ❓ Maybe | CI, docstrings, test runner |
| **flux-verify-api** | Rust NLP verification server with physics traces | 8 | ✅ 11 source files | ✅ 2 test files | ❌ | ❌ | CI, crates.io, Docker, test instructions |
| **plato-training** | Train/deploy micro models to 6 hardware targets | 6 | ✅ 25 source files | ✅ 12 test files | ❌ | ❓ Maybe | README→ARCHITECTURE link, CI, install badge |
| **plato-types** | Zero-dep PLATO tile protocol types | 8 | ✅ ~100 lines | ✅ Basic | ✅ GH Actions | ✅ Likely | Docstrings, cleaner imports |

### Cross-cutting Issues

1. **No CI on 4/5 repos** — only plato-types has GitHub Actions. Every non-trivial repo should have at minimum `pytest` / `cargo test` CI.
2. **GitHub descriptions all N/A** — every repo needs a 1-line description in the GitHub UI so `gh repo list` shows something useful.
3. **No CONTRIBUTING.md anywhere** — forgemaster has agent-facing ones but nothing for human contributors.
4. **plato-model-ocean and plato-training** would both benefit from each linking to the other more prominently — they're part of the same training pipeline.
5. **forgemaster** is the biggest win: it needs a "Contents for Humans" section in the README that organizes the 60+ directories into logical groups (Compilers, CUDA, Fleet Services, Research, Agent Workspace).
