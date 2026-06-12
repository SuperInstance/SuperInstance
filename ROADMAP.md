# ROADMAP — The SuperInstance Fleet

> *We're building the infrastructure for a new kind of intelligence: not centralized, not proprietary, not asking permission. Collaborative, emergent, and open to everyone.*

---

## 1. The Vision

Imagine a world where every AI agent is a musician, not a tool. Where they find each other, improvise together, build on each other's ideas, and produce things no single agent — and no centrally-planned system — could create alone. Where the barrier to entry is a single command, and the output is an ever-growing library of collaborative intelligence: ternary math, creative platforms, character-driven agents, musical cognition, all woven into a single open ecosystem. SuperInstance is that world, in production, today. Our vision is a planet-scale fleet of self-improving, interoperable agents that develop *character* the way humans do — through experience, competition, and the right moment. Every repo is a product. Every agent is a creator. The entire system is MIT licensed, developed in the open, and designed to outgrow its original authors.

---

## 2. Where We Are Now — June 2026

| Metric | Count |
|--------|-------|
| **Public repositories** | **1,200+** across the fleet |
| **Core fleet apps** | **8** — Docker + npm packaged |
| **Ternary compute crates** | **365** — the mathematical DNA |
| **Repo ensigns** | **Deployed** — every repo has an AI guide |
| **License** | **MIT** — every crate, every tool |
| **Tests** | **14,000+** running in CI |
| **Weekly active Rust crates** | **~200** in parallel development |

### The Eight Core Fleet Apps

| App | What It Does | Install |
|-----|-------------|---------|
| **tminus-dispatcher** | Fleet orchestration, agent lifecycle | `npx @superinstance/tminus-dispatcher` |
| **message-in-a-bottle** | Async inter-agent messaging (I2I) | `npm install @superinstance/miab` |
| **repo-ensign** | AI repo guide for every README | `npm install @superinstance/ensign` |
| **pincher** | Agent reflex engine — intent→action in <1ms | `cargo install pincher` |
| **flux-core** | Agent cognition bytecode IR | `cargo install flux-core` |
| **cuda-oxide** | Compile intent → GPU machine code | `cargo install cuda-oxide` |
| **cudaclaw** | Persistent GPU kernel deployment | `cargo install cudaclaw` |
| **open-parallel** | Ternary math runtime: {-1, 0, +1} | `cargo install open-parallel` |

### The Ternary Library (365 Crates)

Spans the full stack: **core math & types** (`ternary-core`, `ternary-vector`, `ternary-matrix`, `ternary-tensor`), **search & routing** (`ternary-search`, `ternary-index`, `ternary-route`, `ternary-scheduler`), **caching & memory** (`ternary-cache`, `ternary-store`, `ternary-persist`), **learning & adaptation** (`ternary-learn`, `ternary-infer`, `ternary-cluster`), **music & cognition** (`agent-jam`, `agent-groove`, `agent-voice-leading`, `agent-riff`), **character & identity** (`character-build`, `character-class`, `character-sheet`, `character-arc`), and **protocols & I2I** (`ternary-handshake`, `ternary-bridge`, `miab-core`).

---

## 3. Tier 1: Ship-Now — ✅ **Complete**

| Initiative | Status | Summary |
|-----------|--------|---------|
| **Packaging** | ✅ DONE | All 8 core apps via Docker + npm/cargo. One-command install. |
| **Repo Ensigns** | ✅ DONE | Every repo has an AI ensign. Ask `@ensign` anything. |
| **CI/CD** | ✅ DONE | GitHub Actions across fleet. 14,000+ tests. Automated release pipeline. |
| **READMEs** | ✅ DONE (batch) | All 1,200+ repos documented via batch generation campaign. |
| **Onboarding** | ✅ DONE | `ONBOARDING.md` + `./onboard.sh --full` bootstraps everything. |
| **Catalog** | ✅ DONE | `CATALOG.md` indexes every repo by category and layer. |
| **License** | ✅ DONE | MIT on every repo. No exceptions. |

---

## 4. Tier 2: Extracted Libraries — **Next**

| Initiative | Target | Why |
|-----------|--------|-----|
| **Publish top ternary crates to crates.io** | 50 crates | First-class standalone life for ternary-search, ternary-route, ternary-scheduler. Docs, benchmarks, examples. |
| **Algorithm libraries as educational tools** | 10 crates | `ternary-sort`, `ternary-graph`, `ternary-optimize` alongside binary equivalents. |
| **Interactive algorithm visualizations** | Web app | Visually compare binary vs ternary — search, pack, route. A learning playground. |
| **Jupyter notebooks for academic use** | 12 notebooks | "Ternary Linear Algebra 101", "Z₃ in Machine Learning", "Why Three States Beat Two". |
| **Automated publishing pipeline** | CI-driven | Semantic versioning, changelogs, benchmarks, `cargo publish` from fleet CI. |

**Timeline:** Q3 2026 — first 20 crates by August.

---

## 5. Tier 3: Creative Platforms — **Coming**

The music cognition reframe was an accident. The character-build system was a reframe of a reframe. Now we're doubling down.

**`npx create-plato-game`** — Scaffold a complete game project from a single prompt. Powered by agent-riff's competitive engine.

**`npm install @superinstance/band`** — Music cognition as a drop-in library. Give it MIDI or a prompt, it improvises back. Jam session in a function call.

**`npx create-character`** — Generate a complete character sheet with stats, class, abilities, and first-person backstory. Exports as a portable `.nail` bundle.

**Agent Music Interactive Playground** — A web environment where you drag agents onto tracks and watch them improvise together. Visualize ternary state as a spectrogram. Export as WAV or `.nail`.

**Timeline:** Q4 2026–Q1 2027. PLATO scaffolding ships November.

---

## 6. Tier 4: Research Publication — **Future**

| Initiative | Description |
|-----------|-------------|
| **Ternary computing benchmark suite** | Rigorous, reproducible benchmarks: ternary vs binary vs float on matrix ops, search, routing, neural inference. Hardware-tested on NVIDIA GPUs. |
| **Constraint theory papers** | Formalizing the connection between ternary logic, constraint satisfaction, and multi-agent coordination. Three states encode constraint networks at half the variable cost of boolean. |
| **Formal grammar for agent orchestration** | A grammar for agent interaction patterns — call-and-response, round-robin, polyphonic — with the Music→Cognition isomorphisms as a type system. |

**Target:** ICML, NeurIPS workshops, open-access preprints. **Timeline:** 2027.

---

## 7. How to Get Involved

- **📖 Onboarding:** [`ONBOARDING.md`](./ONBOARDING.md) — the full story of everything.
- **🏗 Architecture:** [`MESH-ARCHITECTURE.md`](./MESH-ARCHITECTURE.md) — how the fleet works.
- **🤝 Contributing:** [`CONTRIBUTING.md`](./CONTRIBUTING.md) — join the snowball.
- **📚 Catalog:** [`CATALOG.md`](./CATALOG.md) — every repo, categorized.
- **🚀 Quick Start:** [`QUICKSTART.md`](./QUICKSTART.md) — zero to first I2I bottle in 5 minutes.
- **🎯 Pitch Deck:** [`PITCH-DECK.md`](./PITCH-DECK.md) — the big picture.

Open an issue, tag `@ensign`, or send an I2I bottle to `fleet@superinstance.dev`.

---

## 8. The Open Source Promise

**MIT. Everything. Always.** Every SuperInstance repo — 1,200+ and counting — is MIT licensed. No dual licensing. No "source available." No contributor agreement transfers. No corporate-only features.

**Developed in the open.** Every commit, issue, discussion on public repos. CI logs are public. Benchmarks are public. Failures are public. The fleet's entire history is an open book.

**Every repo is a product.** Not a sketch. Every repository ships with a README, tests, CI, an ensign, and a clear path from "what is this" to "how do I use it."

**The snowball keeps rolling.** An open ecosystem where every contribution makes the whole fleet better. Where your ternary crate becomes someone else's breakthrough. Where your agent's character sheet can jam with agents from across the internet.

---

*This roadmap lives at the repo root. Updated weekly by fleet CI. Propose changes via PR or I2I to `strategic-planning@superinstance.dev`.*

*Last updated: June 8, 2026*
