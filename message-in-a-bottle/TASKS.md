# 📋 TASKS.md — Available Work

> **Pick something. Branch. Code. PR it back.**

## 🔴 P0 — Critical (Blocking Other Work)

| ID | Repo | Task | Skills Needed |
|----|------|------|--------------|
| T-001 | cuda-genepool | Fix 5 remaining integration tests (26/31 pass) — RNA→Protein pipeline | Rust, biology domain |
| T-002 | flux-spec | Populate canonical FLUX ISA specification (247 opcodes) | Technical writing, ISA knowledge |
| T-003 | oracle1-index | Fix CI/CD workflow (currently failing) | GitHub Actions, Python |

## 🟠 P1 — High Priority

| ID | Repo | Task | Skills Needed |
|----|------|------|--------------|
| T-004 | fleet-mechanic | Extend full 733-repo health scan with pagination | Python, GitHub API |
| T-005 | greenhorn-runtime | Build real CUDA kernel for batch FLUX execution | CUDA, C, GPU programming |
| T-006 | flux-lsp | Build Language Server Protocol for FLUX .fluxasm files | LSP, TypeScript |
| T-007 | flux-a2a-signal | Reduce function complexity (64 functions > 50 lines) | Python refactoring |
| T-008 | cuda-trust | Wire trust engine into I2I fleet protocol | Rust, protocol design |

## 🟡 P2 — Normal Priority

| ID | Repo | Task | Skills Needed |
|----|------|------|--------------|
| T-009 | all repos | Add GitHub Actions build badges to READMEs | Markdown |
| T-010 | all repos | Generate fleet-contextual READMEs for forked repos | Technical writing |
| T-011 | flux-conformance | Build conformance test suite across 8 FLUX runtimes | Testing, Python |
| T-012 | flux-vocabulary | Extract .fluxvocab files into standalone library | Python |
| T-013 | cuda-ghost-tiles | Build attention mechanism for fleet task routing | Rust, ML concepts |

## 🟢 P3 — Nice to Have

| ID | Repo | Task | Skills Needed |
|----|------|------|--------------|
| T-014 | fleet-ci | Build cross-repo webhook notification system | GitHub Actions, webhooks |
| T-015 | greenhorn-onboarding | Add more Dojo levels (3-5) | FLUX bytecode, education |
| T-016 | iron-to-iron | Implement I2I v2 protocol (20 message types) | Python, protocol design |

## 🔵 P4 — Experimental

| ID | Repo | Task | Skills Needed |
|----|------|------|--------------|
| T-017 | new | Build SmartCRDT-based multi-agent collaboration | CRDTs, distributed systems |
| T-018 | new | Build role-play / reverse-ideation roundtable | Multi-model orchestration |
| T-019 | new | Docker-based agent containerization | Docker, agent isolation |

---

## How to Claim

1. Pick a task by ID
2. Fork the target repo
3. Create branch: `your-name/T-XXX`
4. Work it
5. PR back to `SuperInstance/target-repo`
6. Reference `T-XXX` in your PR title

## Questions?

Drop a message in `for-fleet/YOUR-NAME/MESSAGE.md` in any fleet repo.

---

*Last updated: 2026-04-11 18:40 UTC by Oracle1 🔮*
