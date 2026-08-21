# SuperInstance README Quality Audit
**Date:** 2026-05-17
**Auditor:** Repo README Analysis Agent
**Scope:** SuperInstance org, all repos with READMEs

---

## Summary

- **1,646 repos scanned** (992 originals, 654 forks)
- **98.4% have descriptions** — excellent coverage
- **~10% are Excellent** (full quickstart, API docs, examples)
- **~50% are Good** (clear purpose, basic usage)
- **~25% are Minimal** (7-10 lines, no code)
- **~15% are Missing** (404 README)

---

## The 5 Most Important Repos — Deep Reads

### 1. mud-engine ⭐⭐⭐
**What it does:** GPU-accelerated MUD for agent script backtesting

**README verdict:** Outstanding. Full DSL reference, GPU scaling table by hardware (Jetson→A100), evolution loop walkthrough, multi-language impl list, build guides. Nothing missing.

**Missing for new dev:** Nothing. This is the gold standard.

---

### 2. constraint-theory-core ⭐⭐⭐
**What it does:** Rust library — snap 2D vectors to exact Pythagorean rational points

**README verdict:** Outstanding. `cargo add` install, benchmarks, architecture tree, honest limitations section, research citations, ecosystem map, contributing guide. Model open-source README.

**Missing for new dev:** Nothing. Published on crates.io with CI.

---

### 3. cocapn ⭐⭐
**What it does:** Main fleet agent repo

**README verdict:** Good architectural overview but **no quick-start or setup instructions**. You'd understand what it does but couldn't run it from the README alone.

**Missing for new dev:** Setup instructions, dependencies, how to run locally.

---

### 4. plato-sdk ⭐⭐⭐
**What it does:** Python SDK, `pip install plato-sdk`

**README verdict:** Excellent. Complete API ref, 12+ code examples, TileBuilder cheat sheet, armor/skill tables, agent system docs. Ship-ready.

**Missing for new dev:** Nothing. Best production-ready doc in the org.

---

### 5. plato-server ⭐⭐⭐
**What it does:** Docker-based knowledge system

**README verdict:** Excellent. Mermaid architecture diagrams, Docker commands, BYOK provider table, full API ref, "magic prompt" for AI exploration.

**Missing for new dev:** Nothing.

---

## Quality Spread by Tier

| Tier | Share | Examples |
|------|-------|---------|
| **Excellent** | ~10% | mud-engine, constraint-theory-core, plato-sdk, plato-server, plato-tile-spec |
| **Good** | ~50% | cocapn, cuda-trust, tide-pool, bootstrap-spark, bottle-protocol |
| **Minimal** | ~25% | captain (7 lines), cuda-reflex (2 lines), cacapn (10 lines) |
| **Missing** | ~15% | dmlog-ai, plato-ng, bandit-learner, autoMate, crewmate |

---

## Notable Problems

### Cryptic Repo Names
- `CCC`, `AIR`, `ds4`, `cappuccino`, `claudesclaude`, `cacapn` (typo of cocapn?)
- `cudaclaw` vs `cudaclaw-1` — duplicate or different?

### Template Explosion
~50+ `{domain}log-ai` repos (activelog, booklog, codelog, dmlog, etc.) — template-generated, many empty or one-line.

### Likely Duplicates
- `cacapn` / `cocapn` — same project, one is a typo fork?
- `constraint-theory-py` / `constraint-theory-python` — same?
- `deckboss-ai` / `deckboss-1` / `deckboss-agent` — three versions?

### Inconsistent Branching
Some repos use `master`, some use `main`. No standard.

### Fork Cleanup Needed
654 of 1,646 repos are forks from Lucineer. Many appear abandoned.

---

## Bottom Line

| Category | Repo | Why |
|----------|------|-----|
| **Best to contribute** | constraint-theory-core | Rust, zero deps, 184 tests, CI, crates.io, arXiv paper |
| **Best to use** | plato-sdk | PyPI, complete API, agent system, clear docs |
| **Most wasted** | cacapn | 10-line README, likely typo fork of cocapn |
| **Needs work** | cocapn | Good overview but no getting-started path |
| **Gold standard** | mud-engine | Best README in the org |

---

## Priority Fix List

1. **Archive `cacapn`** — typo fork, wastes namespace
2. **Add setup instructions to `cocapn`** — biggest gap in top repos
3. **Add skeleton READMEs to 9 repos** with zero documentation
4. **Standardize branch naming** — pick `main` everywhere
5. **Audit 50+ log-ai repos** — consolidate or archive empties
6. **Resolve duplicate names** — cacapn/cocapn, cudaclaw/cudaclaw-1, deckboss-*

---

*Next audit should focus on: are the log-ai repos all generated from the same template? Can they be consolidated?*