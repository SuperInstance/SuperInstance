# RUST PORT QUEUE

*v2 — 2026-07-22 07:25 UTC. Polished: added "Monday-morning checklist" per candidate + ROI ladder.*

This is the queue of PyPI packages still pending a Rust port. **Top 3** are scored and unblocked; the rest are prioritized below.

---

## Contents

1. [What's already shipped](#whats-already-shipped)
2. [Top 3 — ship this quarter](#top-3)
3. [Backlog (score ≤ 4)](#backlog)
4. [ROI ladder](#roi-ladder)
5. [See also](#see-also)

---

## What's already shipped <a id="whats-already-shipped"></a>

12 Rust crates live on crates.io. The 4 most recent:

- `fluxvm` 0.1.1 — register-based bytecode VM ([crates.io](https://crates.io/crates/fluxvm))
- `conservation-enforcer-rs` 0.1.0 — policy layer for LLM outputs ([crates.io](https://crates.io/crates/conservation-enforcer-rs))
- `si-exocortex-rs` 0.1.0 — conservation-aware agent framework
- `flux-policy-tester` 0.1.1 — fuzz the policies

Plus 6 standalone crates: `ternary-science`, `categorical-agents`, `constraint-theory-core`, `plato-runtime-kernel`, `plato-cli`, `construct-core`.

> **One-liner:** *12 crates shipped. 6 PyPI packages left to port. 3 of them matter.*

---

## Top 3 — ship this quarter <a id="top-3"></a>

### 1. cocapn — score 9

**Why:** The fleet-coordination CLI. 4,704 LOC of async-heavy code (asyncio task queues, SSE streaming, batch tile processing, FastAPI server). Textbook Rust territory — zero-cost async, deterministic latency, memory efficiency.

**Approach:**
- `tokio` + `async-channel` for task queues
- `axum` for the SSE endpoint
- `serde_json` + buffered file I/O for JSONL
- `axum` with typed routes for the HTTP API

**Reuses:**
- `plato-runtime-kernel` — PLATO tile/tensor types
- `construct-core` — agent runtime trait system
- `fluxvm` — policy-execution endpoints can invoke the FLUX VM
- `serde` / `serde_json` — universal

**Estimate:** ~2,500–3,500 Rust LOC, ~8–12 hours for 0.1.0

**Risks:** Pydantic-style validation is more ergonomic in Python; `serde` is fast but verbose for nested validation. SSE streaming in `axum` requires careful backpressure handling.

**Monday-morning checklist:**
- [ ] `grep -rn "asyncio" cocapn/src` — enumerate async touchpoints
- [ ] Map FastAPI routes to `axum` handlers
- [ ] Audit pydantic models → `serde` derives
- [ ] Write integration tests against the existing Python implementation
- [ ] Verify the SSE endpoint backpressure (pause request, drop slow consumer)

### 2. palaver-math — score 8

**Why:** Pure math, hot loops. Zero dependencies. Smallest effort-per-value.

**Approach:**
- `ndarray` or hand-rolled iterator loops
- `Box<Vec<Child>>` for dialogue tree
- Union-find for coalition detection
- Consider `no_std`-compatible if possible

**Reuses:** none needed. Optionally `nalgebra` for vector ops.

**Estimate:** ~600–900 Rust LOC, ~2–3 hours for 0.1.0

**Risks:** none significant. The `compute_center` loop is trivially vectorizable by LLVM.

**Monday-morning checklist:**
- [ ] `wc -l palaver_math/**/*.py`
- [ ] Identify the `compute_center` hot loop
- [ ] Mirror the BFS tree traversal
- [ ] Add property tests for consensus convergence
- [ ] Verify against the Python reference output

### 3. plato-core — score 7

**Why:** Strategic. Every PLATO Python package depends on its types (`TrainingTile`, `LamportClock`, lifecycle enums, `AdapterConfig`). Porting it creates a native Rust type foundation for **all** downstream PLATO Rust ports. Currently zero Python dependencies (pure types) — port is straightforward.

**Approach:**
- Enums → `#[derive(Serialize, Deserialize)]` enums
- Dataclasses → `struct` with `serde`
- `LamportClock` → simple struct with `tick()` / `merge()` methods
- `MeshRegistry` → `OnceLock<HashMap>` or `LazyLock` singleton
- Entry-point discovery → Cargo feature flags + explicit registration

**Reuses:**
- `serde` / `serde_json` — cross-language tile serialization
- `plato-runtime-kernel` — higher-level room/tensor integration

**Estimate:** ~500–700 Rust LOC, ~2–3 hours for 0.1.0

**Risks:** Python's `dataclass` defaults and the `from_dict` dynamic constructor need careful Rust equivalents. Lamport clock merge semantics must match exactly.

**Monday-morning checklist:**
- [ ] Read `plato-core/plato_core/types.py` line by line
- [ ] Build Rust equivalents of `TrainingTile`, `LamportClock`, `AdapterConfig`
- [ ] Define JSON schema for cross-language tile serialization
- [ ] Verify roundtrip with golden tests

> **One-liner:** *palaver-math (cheap win) → plato-core (unlocks everything else) → cocapn (crown jewel).*

---

## Backlog (score ≤ 4) <a id="backlog"></a>

| Package | Score | LOC | Note |
|---|---:|---:|---|
| `plato-torch` | 4 | 6,646 | PyTorch is Python-first by design. **Skip.** |
| `plato-meta-tiles` | 3 | 433 | Tiny HTTP wrapper. Only worth it if `plato-core` + `cocapn` done first. |
| `plato-fflearning` | 3 | 423 | Low payoff. Algorithmic; Python is fine. |
| `plato-attention-tracker` | 3 | 319 | Tiny. Only as part of larger PLATO Rust push. |
| `plato-config` | 1 | 74 | Too small to port. |
| `plato-papers` | 1 | 187 | Trivial citation manager. Keep in Python. |

---

## ROI ladder <a id="roi-ladder"></a>

```
palaver-math (2–3 hrs) ─▶ plato-core (2–3 hrs) ─▶ cocapn (8–12 hrs)
```

After that, the rest is not worth porting independently. The next honest batch is the **PLATO Rust push** (depends on `plato-core` landing first).

---

## See also <a id="see-also"></a>

- [SuperInstance/SuperInstance/README.md](SuperInstance/README.md) — canonical guide, with the **Top 12 repos** table listing what's already shipped
- [ORG_MAP.md](ORG_MAP.md) — full stack topology, surfaced risks
- [HERMIT_CRAB_MANIFESTO.md](HERMIT_CRAB_MANIFESTO.md) — *abandon what no longer fits* applies to backlog too
- [PACKAGES.md](PACKAGES.md) — full taxonomy of 13 PyPI packages + emerging crates

---

*Updated 2026-07-22 07:25 UTC — v2*
