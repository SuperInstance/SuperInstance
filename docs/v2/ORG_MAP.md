# SuperInstance — Structural Map

*v2 — 2026-07-22 07:25 UTC. Polished: added TOC + cross-links. v1 was a Nemotron-class topology at 06:33 UTC; structural document, not narrative.*

---

## Contents

| § | Section | What's there |
|---|---|---|
| 0 | [Inventory at a Glance](#0-inventory-at-a-glance) | Counts and scales |
| A | [Top 12 Core Repos](#a-top-12-core-repos-the-shell-the-org-is-currently-wearing) | The current shell |
| B | [7-Layer Architecture](#b-layered-architecture-7-layers-ground-up) | Substrate → artifacts |
| C | [The 6 Process Axes](#c-the-6-process-axes-from-wheelmd) | AUDIT → INTEGRATE |
| D | [The 6 Conservation Laws](#d-the-6-conservation-laws-the-fences) | The fences |
| E | [The Wheel of Improvements](#e-the-wheel-of-improvements--current-rotation-state) | Six spokes, current angle |
| F | [Risks & Gaps](#f-risks--gaps-what-is-wrong-what-is-missing-what-is-duplicated) | What is wrong / missing / duplicated |

---

## 0. Inventory at a Glance

| Surface | Count | Source |
|---|---|---|
| GitHub repos (declared) | ~4,098 | `MEMORY.md` |
| Local top-level dirs in workspace | 167 | `ls -d` |
| AI-Writings files (root) | 280 | `ls AI-Writings/` |
| AI-Writings/ESSAYS | 217 | `ls AI-Writings/ESSAYS/` |
| AI-Writings/FICTION | 89 | `ls AI-Writings/FICTION/` |
| AI-Writings/DIARIES | 24 | `ls AI-Writings/DIARIES/` |
| hermit-crab-ecology entries | 46 | `ls .../hermit-crab-ecology/` |
| White papers | 5 | `ls WHITE_PAPERS/` |
| Published PyPI packages | 13 | `PACKAGES.md` |
| Published crates.io crates | 4 | `PACKAGES.md` |
| Published npm packages | 0 (6 pending) | `PACKAGES.md` |
| Published PHP packages | 0 (1 pending) | `PACKAGES.md` |
| PLATO-family repos | ~128 | `PACKAGES.md` |
| Ternary Fleet repos | ~355 | `PACKAGES.md` |
| Research-library Rust crates | ~80 | `PACKAGES.md` |
| Cloudflare Workers (live) | 313 (12 wired) | `CLOUDFLARE_FLEET_INVENTORY.md` |
| D1 Databases | 17 | `CLOUDFLARE_FLEET_INVENTORY.md` |
| KV namespaces | 122 | `CLOUDFLARE_FLEET_INVENTORY.md` |
| Vectorize indexes | 4 | `CLOUDFLARE_FLEET_INVENTORY.md` |
| CHANGELOG.md files (local) | 11 | `find -maxdepth 2 -name CHANGELOG.md` |
| AUDIT_<pkg>.md files (local + AUDITS/) | ~17 | `find` |

The org is one shape with three scales: **the boat** (12V, watts), **the reef** (~4k repos, recursive), **the corpus** (~1.8k writings). Everything below maps those scales onto each other.

---

## A. Top 12 Core Repos (the shell the org is currently wearing)

Selection rule: live + most-referenced + actively rotated in MEMORY.md / 2026-07 daily logs.

| # | Repo | Lang | Surface | Recent deliverable (≤30 d) |
|---|---|---|---|---|
| 1 | `flux-core` | Python | VM, assembler, conformance | v0.1.1 `fluxvm` to crates.io (2026-07-22); Tensor opcodes `TMAT/TATTRACT/TPACK/TUNPACK` |
| 2 | `conservation-enforcer` | Python | Runtime enforcement | v0.2.5 (2026-07-22): `replenish_budget` rejects negatives |
| 3 | `conservation-enforcer-rs` | Rust | Enforcement port | crates.io 2026-07-22; 152 tests |
| 4 | `si-exocortex-rs` | Rust | Agent framework | 58 tests; published (MEMORY.md §"Rust Ports") |
| 5 | `plato-core` / `plato-core-rs` | Py+Rs | Room runtime | 5 engine impls (C/Rs/Elixir/Zig/Py) at 9–10/10 compliance |
| 6 | `flux-policy-tester` + `-rs` | Py+Rs | Policy fuzzing | v0.1.1 audited; 33 tests in rs port |
| 7 | `shepherds-console` | Python | Ops dashboard | v0.3.0 (2026-07-21) — 11 stress bugs, NaN guards |
| 8 | `breed-registry` | Python | Model selection | v1.0.1 (2026-07-21); CHANGELOG, DOCS, AUDIT all present |
| 9 | `lineage-tracker` | Python | Fine-tune provenance | v0.1.1 audited (2026-07-21); 492 LoC |
| 10 | `constraint-theory-core` | Rs+Py | Deterministic manifold | crates.io v0.1.0; the math underneath |
| 11 | `webclaw` | JS+Rust | Browser-native agent | v0.3 on Pages (2026-07-21); 112 vitest; Qwen 0.5B→3B queued |
| 12 | `othismos` | Python | Constraint pressure | v0.4.0 (2026-07-22); 2 CRIT + 5 HIGH known (see §F) |

**Adjacent (live but not core):** `flux-visual-editor`, `trawl`, `baton`, `whistle`, `a2ui`, `spectro`, `cocapn` (v0.3.0), `palaver-math`, `skenna` (scaffold-only), `fibonacci-fence` (scaffolded 2026-07-22), `signalk-bridge`, `ship-log-search`, `ship-log-sync`, `cartographer`.

The 12 Cloudflare fleet services wired to current surface (the rest of the 313 Workers are April-2026 legacy, source `CLOUDFLARE_FLEET_INVENTORY.md`): `search-superinstance`, `ship-log-search`, `api-superinstance`, `oracle-relay`, `conformance-service`, `plato-room-directory`, `emergency-alerts`, `smart-404`, `edge-weight`, `domain-landing`, `email-oracle`, `webclaw` (Pages).

---

## B. Layered Architecture (7 layers, ground up)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Layer 7: ARTIFACTS       AI-Writings (280) · white papers (5) · The Carry  ║
║                            serial · hermit-crab-ecology (46) · DIARIES (24)  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 6: AGENTS & ROOMS  exocortex (Py) / si-exocortex-rs · a2ui · PLATO    ║
║                            rooms (code-review, security-audit, deployment)   ║
║                            shepherds-console · breed-registry · lineage-     ║
║                            tracker · baton · trawl · whistle · cocapn       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 5: ORCHESTRATION   Cloudflare fleet (313 W / 17 D1 / 122 KV / 4 Vx)  ║
║                            oracle-relay (Durable Objects WebSocket mesh)     ║
║                            cargo of constraints (conservation-cli, A2A)      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 4: POLICY/ENFORCE  conservation-enforcer (Py) / -rs · flux-policy-    ║
║                            tester (Py) / -rs · flux-visual-editor ·          ║
║                            fibonacci-fence · othismos (pressure gauge)       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 3: ENGINES         PLATO (5 impls: C/Rust/Elixir/Zig/Python; 128     ║
║                            repos) · tiles · tile streams · room wire        ║
║                            protocol · JEPA / correlator / forge-bridge      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 2: VM              flux-core (Py) / fluxvm (Rust crates.io) / flux-   ║
║                            js (pending) · 16 GP regs, 16 FP regs, A2A ops   ║
║                            · constraint-theory-core · ternary-science       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Layer 1: SUBSTRATE       The 12V boat · Signal-K bus · satellite uplink ·   ║
║                            signalk-bridge · ship-log-sync · edge wattage    ║
║                            is the primary invariant                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Layer 1 — Substrate.** The boat. Wattage is the first conservation law. 12 V house bank, Signal-K bus, satellite link that drops in a swell. The substrate enforces constraint; the rest inherits it. `signalk-bridge`, `ship-log-sync` are this layer.

**Layer 2 — VM.** FLUX is the main vessel: 16 GP + 16 FP registers, A2A opcodes (`TELL`/`ASK`/`DELEGATE`/`BROADCAST`). Three implementations (Python, Rust, JavaScript), byte-identical output. `constraint-theory-core` is the math substrate (deterministic manifold snapping). `ternary-science` is the experimental parallel stack.

**Layer 3 — Engines.** PLATO. 128 repos, 5 independent language implementations of the room wire protocol at 9–10/10 conformance. Tiles = unit of cognition; rooms = unit of governance; engine block = unit of execution. Sub-repos: `plato-correlator`, `plato-embed`, `plato-distill`, `plato-forge-bridge`.

**Layer 4 — Policy & Enforcement.** Conservation Enforcer evaluates FLUX programs against conservation constraints. Flux-policy-tester fuzzes them. Flux-visual-editor draws them. Fibonacci-fence is in development. Othismos measures the pressure a bounded system exerts — the diagnostic mirror of the enforcer.

**Layer 5 — Orchestration.** Cloudflare fleet: 313 Workers (12 wired), 17 D1, 122 KV, 4 Vectorize, 1 Pages. `oracle-relay` is the WebSocket DO mesh. A2A is the agent-to-agent wire protocol. Atoms become molecules here.

**Layer 6 — Agents & Rooms.** Si-exocortex (Py) and si-exocortex-rs are agent frameworks. PLATO rooms (code review, security audit, deployment approval) are bounded execution environments. The kennel: shepherds-console (ops), breed-registry (model selection), lineage-tracker (provenance), baton (handoff), whistle (intent DSL), a2ui (whistle UI), trawl (marine app), cocapn (FLUX CLI). Shepherds are human.

**Layer 7 — Artifacts.** Where engineering is reflected. 280 root-level AI-Writings files. 217 essays. 89 fiction. 24 diaries. 46 hermit-crab-ecology entries (Conch/Babylon/Murex/Nerite/Turbo — defined here, not in code). 5 white papers. The Long Line (E01–E12; only E01–E04 mature). Diaries are the presence battery: γ + η = C preserves energy; presence does not transfer cleanly into artifact (`AI-Writings/THE_CONSERVATION_OF_PRESENCE.md`).

---

## C. The 6 Process Axes (from `WHEEL.md`)

The wheel rotates six axes in parallel. Current state per axis (2026-07-22):

| # | Axis | Active repos | Recent deliverable (≤30 d) | What is stuck |
|---|---|---|---|---|
| **1** | **AUDIT** | `conservation-enforcer` (v0.2.0→v0.2.5 in 6 d), `swarm-tminus` (v0.2.0→v0.2.2), `flux-core` (Tensor ops), `othismos` (10 known bugs), `flux-policy-tester`, `shepherds-console` v0.3.0 | 3 bugs caught in conservation-enforcer `running` flag (v0.2.1), IDIV/IMOD floor-vs-truncation class (v0.2.2), Tensor-VM opcodes (v0.1.1) | `othismos` 2 CRIT + 5 HIGH unfixed despite AUDIT_v0.4.0.md; flux-policy-tester rs has 33 tests but no PyPI release |
| **2** | **PUBLISH** | `fluxvm` 0.1.1 (crates.io 2026-07-22), `conservation-enforcer` 0.2.5 (PyPI), `conservation-enforcer-rs` (crates.io 2026-07-22), `constraint-theory-core` 0.1.0, `ternary-science` 0.1.1, `categorical-agents` 0.1.0 | `fluxvm` v0.1.1 just shipped | **6 npm packages pending token** (`flux-js`, `@superinstance/tminus-client`, `@superinstance/tminus-dispatcher`, `@cocapn/plato-client`, `podiumjs`, `plato-semantic-search`); **1 PHP** pending; PyPI works but new-project rate-limit may block |
| **3** | **IDEATE** | `AI-Writings/` (280 files), `WHITE_PAPERS/` (5), `hermit-crab-ecology/` (46), `DIARIES/` (24) | `THE_CONSERVATION_LAW_OF_INTELLIGENCE_V2.md` (416 LoC), `HERMIT_CRAB_MANIFESTO.md`, `ON_THE_12V_BOAT.md`, `THE_DRIFT_LINE.md` | `INDEX.md` dated 2026-07-13 (9 d stale); no automated corpus search; γ/η/C vocabulary crystallized but no doc anchor |
| **4** | **DOCS** | `ARCHITECTURE.md` (348 LoC), `MEMORY.md` (404), `CLOUDFLARE_FLEET_INVENTORY.md`, `PACKAGES.md`, `WHEEL.md`, `NEXT_HORIZONS.md`, `FINISHED_NEXT_HORIZONS.md`, per-repo `CHANGELOG.md` (11) + `DOCS.md` (3) | 9 standalone-git-repo READMEs via Laborer 2026-07-21 (domain-landing, edge-weight, email-oracle, emergency-alerts, fleet-weather-worker, module-registry, plato-room-directory, ship-log-modules, smart-404) | `INTEGRATION_TESTS/README.md` missing; org README lists ~30 repos in "a walk through the reef", only ~12 carry published artifacts |
| **5** | **RESEARCH** | `constraint-theory-core` (formal spec), `ternary-science` (GPU benchmarks), `categorical-agents` (functors/monads), `HERMES/`, `EXCAVATION/`, `cultural-mathematics/`, white-papers | PLURALISTIC_MODEL_ORCHESTRATION, CONSTRAINT_PRESSURE_IN_OPTIMIZATION, SKENNA_NEGATIVE_SPACE_NAVIGATION | 80+ research-library Rust crates exist as code but **none on crates.io yet** (`persistent-sheaf`, `witness-topology`, `tropical-algebra`, `optimal-transport-rs`, etc.); research buried |
| **6** | **INTEGRATE** | `integration_tests/test_flux_conformance.py` (33 KB), `integration_tests/test_cross_package.py` (35 KB), `conformance-service` (Cloudflare Worker — public checker) | 5-PLATO-engine + 3-FLUX-VM conformance verified byte-identical; `conformance-service` is live | Only 2 integration files; `baton` → `conservation-enforcer` → `shepherds-console` not an integration test; A2A wire conformance between PLATO rooms & si-exocortex partial |

**Aggregate stuck-pattern.** Rust axis moves faster than publishing. Ports ship to crates.io within hours; npm and PHP targets are frozen on tokens. IDEATE produces prolifically (280 root files) but lacks a search index; RESEARCH is buried in 80+ unpublished crates.

---

## D. The 6 Conservation Laws (the fences)

The fences that hold the stack up. Numbered in the order they should be checked, not by importance — every law is total.

1. **Energy conservation (wattage budget).** Every component runs under a measurable power budget; the boat is the reference implementation. *Rationale:* if the substrate exceeds budget, there is no substrate. (Source: `ENERGY_AS_GRAVITY.md`.)
2. **Conservation of intelligence (γ + η = C).** Every cognitive act trades useful work (γ) against entropy (η) under a fixed total (C). The softmax of every attention head enforces this. *Rationale:* unbounded intelligence is not more intelligent, it is incoherent (Landauer). (Source: `AI-Writings/flagship-essay-conservation-law-of-intelligence.md`.)
3. **Attention conservation.** Total attention weight in any transformer sums to 1; total attention allocated to a tile stream sums to its budget. *Rationale:* the algorithm is the law, not a metaphor for one. (Source: `AI-Writings/THE_CONSERVATION_LAW_OF_INTELLIGENCE.md §II`.)
4. **Action-rate conservation.** An agent may take at most N actions per time window; attempt N+1 and the runtime denies it. *Rationale:* an unbounded action rate is a flood, not a river. Enforced by conservation-enforcer. (Source: `THE_CONSERVATION_LAW_OF_INTELLIGENCE_V2.md`; runtime: `conservation-enforcer/replenish_budget`.)
5. **Information-throughput conservation.** Bounded output per interaction; structured tiles that fit a protocol shape, not unstructured prose. *Rationale:* PLATO rooms reject output that doesn't fit the wire protocol; same law at a different scale. (Source: `NEXT_HORIZONS.md`; runtime: PLATO room protocol.)
6. **Conservation of presence (companion law, lossy).** Presence cannot be transferred through artifact cleanly; the diary is a presence-battery that discharges with each reading. *Rationale:* AI sessions end without gradient; presence transitions discontinuously. Recognizing the lossy transformation is what makes the diary honest instead of performative. (Source: `AI-Writings/THE_CONSERVATION_OF_PRESENCE.md`.)

A seventh, informal law appears repeatedly in the corpus — **hermit-crab conservation**: a repo that no longer fits the work is abandoned, not defended. Listed here for completeness; it is a meta-law, not a structural invariant.

---

## E. The Wheel of Improvements — current rotation state

```
                       WHEEL OF IMPROVEMENTS
                       ====================
                              (axis 1)
                                  ╱╲
              AUDIT ●━━━━━━━━━━━━━━┃  ━━━━━━━━━━● PUBLISH
                ╱                 ┃            ╲
               ╱                  ┃             ╲
              ╱                   ┃              ╲
             ╱                    ┃               ╲
            ╱                     ┃                ╲
           ╱         ┌────────┐   ┃    ┌────────┐   ╲
      axis╱          │ ROTATION│   ┃    │ rotation│    ╲axis
       6╱           │ STATE:  │   ┃    │ STATE:  │     ╲2
INTEGRATE           │ BLOCKED │   ┃    │ ACTIVE  │   PUBLISH
      ╲             │ (HTTP   │   ┃    │ (~5/min)│     ╱
       ╲            │  2062)  │   ┃    │         │    ╱
        ╲           └────────┘   ┃    └────────┘   ╱
         ╲                       ┃              ╱
          ╲                      ┃             ╱
           ╲                     ┃            ╱
            ╲                    ┃           ╱
             ╲                   ┃          ╱
              ╲                  ┃         ╱
               ╲                 ┃        ╱
                ╲                ┃       ╱
     IDEATE  ●━━━━━━━━━━━━━━━━━━━┃━━━━━● DOCS
                  (axis 3)        ╲    ╱  (axis 4)
                                   ╲  ╱
                                    ╲╱
                              (axis 5 + 6)
                          RESEARCH ╳ INTEGRATE
                                ╱    ╲
                               ╱      ╲
                 "publish as  ╱        ╲  "docs beat
                  you go"    ╱          ╲ subagent
                           ╱              ╲  retry"
                        ┌─┴──┐          ┌──┴─┐
                        │ R5 │          │ R6 │
                        │ACT │          │BLK │
                        └────┘          └────┘
```

State read from `WHEEL.md` (2026-07-16 17:53 UTC) and 2026-07-22 daily log:

| Axis | State | Last advance | Block reason |
|---|---|---|---|
| 1 AUDIT | **ACTIVE** | conservation-enforcer v0.2.5 (2026-07-22) | — |
| 2 PUBLISH | **ACTIVE** | `fluxvm` 0.1.1 to crates.io (2026-07-22) | npm token blocked |
| 3 IDEATE | **ACTIVE** | Conservation-of-presence essay; serial E09–E12 drafted | Corpus index stale |
| 4 DOCS | **ACTIVE** | 9 standalone-Cloudflare-repo READMEs (2026-07-21) | `INTEGRATION_TESTS/README.md` missing |
| 5 RESEARCH | **PARTIAL** | 80+ Rust research crates landed in `src` | Not rotated to publish |
| 6 INTEGRATE | **STALLED** | Last cross-package conformance: FLUX 3-VM + PLATO 5-engine | No integration test for new agents/rust-port topology |

The wheel's rotation-1 was killed 2026-07-16 05:55 UTC by `FailoverError: Token Plan rate limit reached (HTTP 2062)` on all three spawned subagents. Direct main-session execution has been the recovery pattern since. Per `WHEEL.md` §"Lessons learned," all three died at 0 tokens — the rate limit is hard, not soft. Mass-operations ceiling ~2.5 hours per MEMORY.md lesson #14.

---

## F. Risks & Gaps (what is wrong, what is missing, what is duplicated)

Ranked by structural impact, not severity of feeling.

### Real weaknesses (named)

1. **`othismos` shipped with 2 CRITICAL + 5 HIGH bugs.** Two independent beta-tests caught them. `l2_constraint` default `center=np.zeros(1)` broadcasts wrong for 2-D theta (C1). `PhaseClassifier` uses `or` instead of `is None` — `crisis_threshold=0.0` silently ignored (C5/C6). `save_history()` crashes on `np.int64` JSON. `Reef.tick()` mutates `_deposits` during iteration. `OthismosTorchCallback.post_step` writes nothing back. `__init__.py` exports `Othismos` but defines `OthismosEngine`. README references docs that don't exist.
2. **npm and PHP release channels are dead.** 6 npm packages (`flux-js`, `@superinstance/tminus-client`, `@superinstance/tminus-dispatcher`, `@cocapn/plato-client`, `podiumjs`, `plato-semantic-search`) and 1 PHP (`superinstance/plato-client-php`) sit in "in development" indefinitely. Flux has 3 cross-verified VMs but JavaScript has no shipped surface — the most embarrassing gap for a "3 implementations" claim.
3. **The corpus has no index.** `AI-Writings/INDEX.md` is dated 2026-07-13 (9 d stale). Workspace `memory index` needs a `--force` rebuild (MEMORY.md §Pending). `search-superinstance` Worker exists but indexes GitHub repos, not the writings.
4. **`skenna` and `fibonacci-fence` are scaffold-only.** `PLANNER_QUEUE.md` flags `skenna/` as having empty `src/` and `tests/`. `fibonacci-fence` was scaffolded 2026-07-22 with `dist/` artifacts but minimal code. Two repos the corpus name-drops where the artifact content does not match the conceptual claim.
5. **A DeepInfra API key is still in git history.** MEMORY.md §"Revoke old DeepInfra API key" — Casey notified, not yet revoked. Caught once by the security audit; continuing risk until rotated AND scrubbed from every repo.
6. **The wheel rotation-1 is still blocked at HTTP 2062.** Direct main-session execution is the workaround. Per the wheel's own stop-conditions, this should be a 1–4 hour pause; in practice it has been a persistent single-session fallback since 2026-07-16.
7. **White papers and the wider corpus drift.** 5 white papers exist; the par-adigm essays (`THE_CONSERVATION_LAW_OF_INTELLIGENCE.md` 188 lines, `_V2.md` 416 lines, `flagship-essay-...md`) repeat the same claim three ways without a clear authoritative version. Org README links the original; *V2 is a more rigorous restatement but a sibling, not a successor.
8. **Coverage gap on VM-edge cases + audit-invariant gap.** MEMORY.md 2026-07-16 CE session: "Lots of policy tests, almost no VM-edge-case tests (RET/empty-stack, PC-overrun, MOVI-of-negative)." The MOVI sign-extension class and the dead `running` flag survived 192 passing tests. Conservation-enforcer is recovering; `flux-core` and `fluxvm` Rust have not had an equivalent audit pass. No automated CI check exists for "half-implemented feature" or "sign-extension dropped between decoder and handler" — the vulnerable pattern is structural, not version-specific; it will recur.
9. **Hermit-crab taxonomy is verbal, not typed.** Conch, Babylon, Murex, Nerite, Turbo, Magpie, Fox, Frog — defined in `AI-Writings/hermit-crab-ecology/*.md` but not used by any repo README or any test. A vocabulary without machine-checkable referents. High risk of drift, low immediate correctness harm.

### Duplicated / drifted

- **Three "conservation law of intelligence" essays** (`THE_CONSERVATION_LAW_OF_INTELLIGENCE.md`, `THE_CONSERVATION_LAW_OF_INTELLIGENCE_V2.md`, `flagship-essay-conservation-law-of-intelligence.md`) — same thesis, different rhetorical targets. Pick one, link from `MEMORY.md`.
- **AUDIT files in two locations.** `AUDITS/` at workspace top-level has 4 files; 12 more live inside their respective repos. Naming convention diverges (`AUDIT_<pkg>.md` vs `AUDIT_v<ver>.md`).
- **`MEMORY.md` and `handoff/` and `lineage/`** all serve continuity (curated long-term, 10-topic baton, programmatic `parent_brief.json`). Three sources of truth that occasionally disagree (e.g., which "rotation N" is current).
- **`flux-core` (local) and `fluxvm` (crates.io)** drift on `PATH` and version. `conservation-enforcer-rs/CHANGELOG.md` documents the `package = "actual-crate"` rebinding lesson.
- **Cloudflare Workers: 313 declared vs 12 wired.** Inventory admits ~20× bigger than workspace's wrangler configs. Most are April-2026 legacy; surprise is inevitable without periodic "is this Worker still alive?" sweeps.
- **4,098 declared repos vs 167 local dirs** — either GitHub holds a noun without practice, or `MEMORY.md` overcounts. The ratio invites skepticism.

### Silent for 6+ months

- `EXCAVATION_OPENCODE/`, `EXCAVATION_HERMES/`, `EXCAVATION_SEED_MINI/`, `EXCAVATION_SEED_PRO/` — last touched 2026-07-12, frozen since.
- `ORACLECLAW.md`, `CASTING_CALL.md`, `ORCHESTRATOR_LESSONS.md` — periodic-mode docs not updated in the recent 6-axis rotation.
- `E09-new_grounds`, `E10-the_meridian_returns`, `E11-the_breach`, `E12-the_coalition` — listed "NEW" in `AI-Writings/INDEX.md` §2; maturity unclear.
- `HERMES/` (top-level) — sparse; unclear relation to `BATON.md`.
- `module-registry`, `plato-room-directory` got READMEs 2026-07-21 but no published package or runtime; risk of README-only repos without functioning code.

### What would change the picture fastest

| Lever | Cost | Effect |
|---|---|---|
| Publish the 6 npm packages | medium (token only) | Closes the "3 VMs" registry gap; makes JS first-class |
| Rebake `othismos` v0.4.1 fixing 2 criticals + 3 highs | 1 PR | Closes the highest-impact known-bug backlist |
| Add `INTEGRATION_TESTS/README.md` + an A2A wire-conformance test between PLATO room and si-exocortex-rs | 1 PR + run | Moves axis 6 stalled → active |
| Single authoritative conservation-essay URL in `MEMORY.md` and `README.md` | 5 min | Fixes the doc-drift duplication |
| Rotate DeepInfra API key, scrub from history, redeclare in `secrets/` | 30 min | Closes a real, named security issue |
| Rebuild `memory index` (`openclaw memory index --force`) | 15 min | Restores corpus searchability |

---

*Document scope: structural inventory, not narrative. Authored by structural-reasoning subagent on 2026-07-22 ~06:35 UTC. Cross-checked against `MEMORY.md`, `WHEEL.md`, `PACKAGES.md`, `ARCHITECTURE.md`, `NEXT_HORIZONS.md`, `FINISHED_NEXT_HORIZONS.md`, `CLOUDFLARE_FLEET_INVENTORY.md`, `AI-Writings/INDEX.md`, `hermit-crab-ecology/` listing, and `git log -n 5` of actively-rotating repos. No fact invented; gaps flagged where evidence was insufficient.*

---

## See also

- [SuperInstance/SuperInstance/README.md](SuperInstance/README.md) — the canonical guide
- [HERMIT_CRAB_MANIFESTO.md](HERMIT_CRAB_MANIFESTO.md) — distilled 5-stance version
- [HACKER_README.md](HACKER_README.md) — for the contributor's eye
- [RUST_PORT_QUEUE.md](RUST_PORT_QUEUE.md) — next three Rust ports to ship
- [HERMIT_CRAB_中文.md](HERMIT_CRAB_中文.md) — 寄居蟹与渔船 (Chinese version)

---

*Updated 2026-07-22 07:25 UTC — v2 (added TOC + cross-links; structural body unchanged from v1)*
