# SuperInstance Fleet — Master Roadmap
**Status:** DRAFT v0.1
**Baseline:** 2026-05-07
**Owner:** SuperInstance / Cocapn fleet
**Canonical:** This is the single source of truth for fleet direction across all SuperInstance repos.

---

## Table of Contents
1. [Repo Map](#1-repos-by-category)
2. [Dependency Diagram](#2-fleet-dependencies)
3. [Quarterly Milestones](#3-quarterly-milestones-q2-q4-2026)
4. [Repo Status Table](#4-current-status-table)
5. [What Casey Needs to Decide](#5-what-casey-needs-to-decide)
6. [Quick Wins](#6-quick-wins--1-hour)

---

## 1. Repos by Category

### 🛟 Fleet Core
*The nervous system — PLATO, keeper, fleet coordination, consensus*

| Repo | Description | Language |
|------|-------------|----------|
| `plato-server` | PLATO — knowledge rooms, tile storage, fleet memory backbone | TypeScript |
| `plato-sdk` | Build agents that live in PLATO. pip install plato-sdk | Python |
| `plato-client-js` | PLATO room protocol client — Node + browser, zero deps | JavaScript |
| `cocapn-glue-core` | Keeper↔Fleet binary wire protocol — msgpack heartbeat, commands, tile forwarding | TypeScript |
| `fleet-coordinate` | Fleet coordination math — Laman rigidity, H¹ emergence, ZHC consensus | TypeScript |
| `fleet-spread` | Fleet broadcast/dispatch — multi-agent message routing | TypeScript |
| `holonomy-consensus` | Holonomic consensus via gauge connections — zero-holonomy constraint propagation | TypeScript |
| `whisper-sync` | Lightweight sync protocol — agent state gossip, eventual consistency | TypeScript |

**Missing from Fleet Core:** `keeper` repo not found (may be in cocapn.ai or separate repo). `agent-lifecycle-registry` exists but details unavailable.

### 🤖 Agent Framework
*Agents, shells, and lifecycle management*

| Repo | Description | Language |
|------|-------------|----------|
| `fleet-agent` | Base fleet agent — PLATO integration, tile submission, health checks | TypeScript |
| `agent-bootcamp` | Agent training ground — MUD-based skill acquisition | TypeScript |
| `agent-coordinator` | Orchestrates multi-agent tasks across the fleet | TypeScript |
| `agent-forge` | Agent factory — scaffolding for new fleet agents | TypeScript |
| `Agent-Lifecycle-Registry` | Registry for tracking agent lifecycles | TypeScript |
| `python-agent-shell` | Minimal Python shell for fleet agents with PLATO + fleet-coordinate | Python |
| `smart-agent-shell` | Smart shell — enhanced agent runtime with reasoning strategies | TypeScript |
| `zeroclaw-agent` | ⚠️ Repo exists but GitHub API returns no data — needs investigation | ? |
| `zeroclaw-plato` | 3-agent zeroclaw loop posting to PLATO rooms | TypeScript |

**Notes:**
- `zeroclaw-agent` is referenced in roadmaps but not accessible via GitHub API — may be private or renamed
- `plato-agent-academy` is related (PLATO MUD training for agents)
- `CCC` is the fleet's Kimi K2.5 frontend agent (public repo, not listed above)

### 🌐 Browser / Demo
*User-facing web interfaces*

| Repo | Description | Language |
|------|-------------|----------|
| `cocapn-ai-web` | Browser fleet demos — captain deliberation, thinking strategies, PLATO protocol | HTML/JS |
| `cocapn-browser-agent` | Browser captain agent — web interaction, navigation, scraping | TypeScript |
| `plato-client-js` | PLATO JS client (also in Fleet Core above) | JavaScript |
| `fleet-coordinate-js` | Fleet coordinate math compiled to JS — D3 visualization layer | JavaScript |
| `cocapn.ai` | Main landing at cocapn.ai | PHP/HTML |

### 🔬 Research / Theory
*Mathematical foundations, formal methods, bytecode*

| Repo | Description | Language |
|------|-------------|----------|
| `flux-research` | FLUX bytecode research — ISA, runtime, formal verification | Mixed |
| `constraint-theory-llvm` | LLVM backend for constraint theory — code generation for fleet agents | LLVM/MLIR |
| `spline-physics` | Spline-based physics — trajectory modeling for agent movement | Python/Math |
| `fleet-resonance` | Resonance patterns in fleet consensus — dynamical systems theory | Python |
| `holonomy-48-bridge` | Bridge from 48-dimensional holonomy to fleet consensus | Python/Math |
| `fleet-homology` | Homological algebra foundations for fleet topology | Python/Math |

**Related constraint theory repos (not individually audited for this doc):**
- `constraint-theory-rust-python`
- `constraint-theory-mlir`
- `constraint-theory-mojo`
- `constraint-theory-engine-cpp-lua`
- `constraint-theory-math`
- `flux-core` (FLUX bytecode VM in Rust)
- `flux-vm`
- `flux-ast`, `flux-isa`, `flux-cuda`, `flux-hdc`

### 🔀 A2A Protocol Repos (3-way overlap)
*Duplicated Agent-to-Agent protocol implementations — candidates for consolidation*

| Repo | Description |
|------|-------------|
| `a2a-protocol` | Agent-to-Agent protocol — discovery, negotiation, coordination |
| `polyformalism-a2a-js` | 9-channel polyglot communication (JS/Node.js) |
| `polyformalism-a2a-python` | Python impl of polyformalism A2A — 9-channel intent alignment |

---

## 2. Fleet Dependencies

```
                        ┌─────────────────────────────┐
                        │   END USERS / CAPTAINS       │
                        │   (Browser, Telegram CLI)    │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │      cocapn-ai-web          │
                        │   (Browser Demos + JS)       │
                        └──────────────┬──────────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
    ┌──────────▼──────────┐  ┌─────────▼──────────┐  ┌───────▼────────┐
    │  cocapn-browser-   │  │   PLATO Client JS  │  │ Fleet Coord JS │
    │      agent         │  │  (WebSocket/poll)  │  │   (D3.js)      │
    └──────────┬──────────┘  └─────────┬──────────┘  └───────┬────────┘
               │                      │                       │
               └──────────────────────┼───────────────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │    cocapn-glue-core      │
                        │  (msgpack wire protocol) │
                        └────────────┬────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│                                    │                                     │
│  ┌─────────────────────────────────▼──────────────────────────────────┐  │
│  │                    PLATO SERVER (plato-server)                     │  │
│  │         Knowledge rooms, tile storage, fleet memory backbone        │  │
│  └─────────────────────────────────┬────────────────────────────────────┘  │
│                                    │                                      │
│     ┌──────────────────────────────┼──────────────────────────────┐      │
│     │                              │                              │      │
│ ┌───▼─────┐  ┌────────────────────▼──────────────┐  ┌───────────▼──┐   │
│ │ Fleet   │  │       Fleet Coordinator           │  │  Whisper     │   │
│ │ Spread  │  │      (fleet-coordinate)           │  │  Sync        │   │
│ │(broadcast)│ │  Laman Rigidity, H¹ Emergence,  │  │ (state       │   │
│ └────┬────┘  │  ZHC Consensus                   │  │  gossip)     │   │
│      │       └──────────────┬───────────────────┘  └──────┬──────┘   │
│      │                      │                               │          │
│      └──────────────────────┼───────────────────────────────┘          │
│                             │                                            │
│  ┌──────────────────────────▼──────────────────────────────────────┐    │
│  │                  Holonomy Consensus (holonomy-consensus)          │    │
│  │             Gauge connections, zero-holonomy constraints           │    │
│  └─────────────────────────────────┬────────────────────────────────┘    │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                              │
           ┌────────▼────────┐          ┌──────────▼──────────┐
           │   fleet-agent   │          │  Agent-Lifecycle-   │
           │  (base agent)   │          │     Registry        │
           └───────┬────────┘          └──────────┬───────────┘
                   │                              │
     ┌─────────────┼──────────────────────────────┘
     │             │
┌────▼────┐  ┌─────▼───────┐  ┌────────▼────────┐  ┌────────▼────────┐
│ agent-  │  │ agent-      │  │  agent-forge     │  │ zeroclaw-plato  │
│ bootcamp│  │ coordinator │  │                  │  │                 │
└────────┘  └─────────────┘  └──────────────────┘  └─────────────────┘
     │             │
     │    ┌────────▼────────┐
     │    │ zeroclaw-agent  │
     │    │ ⚠️ check status │
     │    └─────────────────┘
     │
┌────▼─────────────┐
│  python-agent-   │
│      shell       │
│  + PLATO + coord │
└──────────────────┘


=== RESEARCH / THEORY LAYER ===

┌─────────────────────────────────────────────────────────────────────┐
│                    FLUX RESEARCH (flux-research)                      │
│              Bytecode ISA, runtime, formal verification              │
└────┬──────────────────────┬───────────────────────┬────────────────┘
     │                      │                       │
┌────▼────┐  ┌──────────────▼───────┐  ┌───────────▼──────────┐
│  spline │  │ constraint-theory-   │  │   fleet-resonance     │
│ physics │  │       llvm           │  │  (dynamical systems)  │
└─────────┘  │ (LLVM code gen)      │  └──────────────────────┘
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │  holonomy-48-bridge  │
             │ (48-dim → fleet)    │
             └──────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │   fleet-homology     │
             │ (homological basis) │
             └─────────────────────┘


=== A2A PROTOCOL DUPLICATION (needs consolidation) ===

┌──────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────┐
│    a2a-protocol      │  │ polyformalism-a2a-js      │  │ polyformalism-a2a-  │
│                      │──│  (9-channel JS)           │──│ python              │
│  "original"          │  │                          │  │ (9-channel Python)  │
└──────────────────────┘  └──────────────────────────┘  └─────────────────────┘
      ⚠️ 3 repos doing the same thing — consolidate into 1
```

---

## 3. Quarterly Milestones (Q2-Q4 2026)

### Q2: Foundation (May–July 2026)

| Week | Milestone | Repos Involved |
|------|-----------|---------------|
| W1 | Complete audit of all SuperInstance repos, tag status | all |
| W2 | Add CI/CD to remaining repos without workflows (10 repos need it) | fleet-coordinate, whisper-sync, fleet-agent, smart-agent-shell, zeroclaw-agent, zeroclaw-plato, cocapn-ai-web, cocapn-browser-agent, fleet-coordinate-js, spline-physics |
| W3 | Consolidate 3 A2A repos into single `polyformalism-a2a` library | a2a-protocol, polyformalism-a2a-js, polyformalism-a2a-python |
| W4 | Resolve `zeroclaw-agent` GitHub API issue — public or archive | zeroclaw-agent |
| W5 | `cocapn-ai-web` JS rewrite spec finalized, begin implementation | cocapn-ai-web |
| W6 | CI/CD stress test — all 20+ repos with workflows green | all |
| W7 | `plato-sdk` 0.2.0 released with full tile API | plato-sdk |
| W8 | Q2 hard deadline: cocapn.ai JS beta live | cocapn-ai-web |

**Q2 KPIs:**
- [ ] CI/CD on all repos: 0 workflows = red, 1+ = green
- [ ] 3 A2A repos consolidated into 1
- [ ] cocapn.ai browser demo functional (no PHP)
- [ ] All fleet-core services have health endpoints

### Q3: Chrome AI + Integration (July–September 2026)

| Week | Milestone | Repos Involved |
|------|-----------|----------------|
| W9 | Integrate Chrome AI Summarizer API into cocapn-ai-web | cocapn-ai-web |
| W10 | Integrate Chrome AI Translator API into PLATO client | plato-client-js |
| W11 | Cross-repo integration: fleet-coordinate → fleet-spread → holonomy-consensus | fleet-coordinate, fleet-spread, holonomy-consensus |
| W12 | PLATO v2 protocol finalized (deadband, room federation) | plato-server, plato-sdk |
| W13 | Fleet-scaling dry run: 5+ agents coordinated simultaneously | fleet-agent, agent-coordinator |
| W14 | Open source landing: CONTRIBUTING.md + README templates fleet-wide | all |
| W15 | Community growth: 5+ external contributors, 2+ community agents | all |
| W16 | Q3 hard deadline: Chrome AI APIs live in cocapn.ai | cocapn-ai-web |

**Q3 KPIs:**
- [ ] Chrome AI Summarizer + Translator integrated and tested
- [ ] 5+ agents running coordinated task
- [ ] 2+ external contributors merged
- [ ] PLATO room federation working across 2+ instances

### Q4: Production Hardening + Scale (October–December 2026)

| Week | Milestone | Repos Involved |
|------|-----------|----------------|
| W17 | DO-178C certification path defined for flux-vm | flux-vm, flux-research |
| W18 | flux-vm formal verification kicked off (Coq/Lean proofs) | flux-vm, constraint-theory-llvm |
| W19 | Fleet scaling to 10+ agents (production stress test) | fleet-agent, agent-coordinator, holonomy-consensus |
| W20 | 99.9% uptime SLA for PLATO + keeper services | plato-server, cocapn-glue-core |
| W21 | cocapn.ai v1.0 public launch | cocapn-ai-web |
| W22 | Fleet pricing finalized ($199/boat/month from original roadmap) | business docs |
| W23 | First commercial deployments (Sitka fishing boats) | deckboss-ai-pages |
| W24 | Q4 hard deadline: fleet operating at 10+ agents unsupervised | all |

**Q4 KPIs:**
- [ ] 10+ agents running coordinated, unsupervised
- [ ] PLATO + keeper uptime > 99.9% over 30-day window
- [ ] DO-178C certification path documented
- [ ] First commercial revenue (Sitka deployments)

---

## 4. Current Status Table

### Fleet Core

| Repo | Tests | CI/CD | Published Package | Docs (1-5) |
|------|-------|-------|-----------------|------------|
| plato-server | ? | ? | No (self-hosted) | 3 |
| plato-sdk | ? | ✅ | Yes (PyPI: @superinstance/plato-sdk) | 3 |
| plato-client-js | ? | ✅ | Yes (npm: @superinstance/plato-client-js) | 3 |
| cocapn-glue-core | ? | ? | No | 1 |
| fleet-coordinate | 0 | ❌ | No | 2 |
| fleet-spread | 0 | ✅ | No | 2 |
| holonomy-consensus | 0 | ✅ | No | 2 |
| whisper-sync | 0 | ❌ | No | 1 |

### Agent Framework

| Repo | Tests | CI/CD | Published Package | Docs (1-5) |
|------|-------|-------|-----------------|------------|
| fleet-agent | 0 | ❌ | No | 2 |
| agent-bootcamp | ? | ✅ | No | 2 |
| agent-coordinator | ? | ✅ | No | 2 |
| agent-forge | 2 | ✅ | No | 2 |
| Agent-Lifecycle-Registry | ? | ? | No | 2 |
| python-agent-shell | ? | ✅ | No (local pip install) | 2 |
| smart-agent-shell | 0 | ❌ | No | 1 |
| zeroclaw-agent | ? | ❌ | ? | ? |
| zeroclaw-plato | 0 | ❌ | No | 2 |

### Browser/Demo

| Repo | Tests | CI/CD | Published Package | Docs (1-5) |
|------|-------|-------|-----------------|------------|
| cocapn-ai-web | 0 | ❌ | No (static HTML) | 3 |
| cocapn-browser-agent | ? | ❌ | No | 2 |
| plato-client-js | ? | ✅ | Yes (npm) | 3 |
| fleet-coordinate-js | 0 | ❌ | No | 2 |
| cocapn.ai | N/A | ❌ | No (PHP) | 1 |

### Research/Theory

| Repo | Tests | CI/CD | Published Package | Docs (1-5) |
|------|-------|-------|-----------------|------------|
| flux-research | 7 | ✅ | No | 2 |
| constraint-theory-llvm | 1 | ✅ | No | 2 |
| spline-physics | 0 | ❌ | No | 2 |
| fleet-resonance | 0 | ❌ | No | 1 |
| holonomy-48-bridge | 0 | ❌ | No | 2 |
| fleet-homology | 0 | ❌ | No | 2 |

### Legenda
- **Tests:** Known test files found in repo (0 = no tests found, ? = unknown)
- **CI/CD:** ✅ = has GitHub Actions workflows, ❌ = no workflows found
- **Published Package:** Yes if on npm/PyPI/crates.io
- **Docs:** 1 = README only, 2 = README + some docs, 3 = README + docs + examples, 4 = comprehensive, 5 = published docs site

---

## 5. What Casey Needs to Decide

### 5a. Cocapn vs SuperInstance Naming

**The conflict:** The brand is "Cocapn" (lighthouse + radar imagery, fishing fleet metaphor) but all repos live under `SuperInstance` GitHub org. The PLATO protocol is sometimes called "Cocapn fleet," sometimes "SuperInstance fleet."

**Options:**
1. **SuperInstance as canonical** — GitHub org, papers, academic citations; "Cocapn" as product/brand name
2. **Cocapn as canonical** — Rename GitHub org to Cocapn (disruptive, repo URLs change)
3. **Dual brand** — SuperInstance = infrastructure, Cocapn = product/user-facing (current implicit approach)

**Recommendation:** Option 3 is the current state but needs explicit documentation. Decide which is canonical for:
- NPM package scope (`@superinstance` vs `@cocapn`)
- PyPI package name (`superinstance-*` vs `cocapn-*`)
- GitHub org (keep as SuperInstance)
- Domain canonical (`superinstance.com` vs `cocapn.ai` vs `lucineer.com`)

### 5b. RubyGems Token Regeneration

**Status:** Unknown. The `cocapn-cli` is listed in repos but RubyGems token status is unverified. If publishing Ruby gems is part of the plan, the token needs to be regenerated and stored in `~/.credentials_vault`.

**Action required:** Confirm if `cocapn-cli` needs to be published to RubyGems. If yes, regenerate token and store.

### 5c. Domain Strategy

**Known domains:**
- `cocapn.ai` — main landing page (PHP currently, migrating to JS)
- `lucineer.com` — SuperInstance's creative/consulting arm
- `superinstance.com` — placeholder or redirect

**Questions:**
1. Which domain gets the **full agent treatment** (PLATO-backed, live agent, full interactive)?
2. Which domains get **static landing pages** (marketing only)?
3. Which domains get **zero-agent treatment** (redirect only)?
4. Is there a `keeper.cocapn.ai` subdomain plan? (keeper service not yet found in repos)

**Current implied strategy:**
- `cocapn.ai` → full agent (PLATO, browser agent, deliberation)
- `lucineer.com` → static or light agent (business inquiries)
- Others → TBD

### 5d. FM LLVM Stack Integration Plan

**Context:** FM (likely "forgemaster" or a specific agent) has an LLVM stack integration plan referenced in the constraint theory repos. The `constraint-theory-llvm` repo exists, but integration with `flux-vm`, `flux-core`, and the overall FLUX bytecode pipeline is unclear.

**Key questions:**
1. Is `flux-core` (Rust FLUX VM) the canonical bytecode runtime, or is `flux-vm` the target?
2. Does `constraint-theory-llvm` feed into `flux-isa` code generation?
3. Is there a planned `flux-llvm` bridge, or does LLVM target `constraint-theory-core` directly?
4. Who owns the LLVM integration? (JetsonClaw1 was assigned in original roadmap)

**Recommended:** Schedule a 30-min fleet sync to align on the bytecode pipeline before Q3.

---

## 6. Quick Wins (< 1 Hour Each)

These are high-value, low-effort tasks that can be knocked out immediately:

### CI/CD Everywhere (10 repos need workflows)
```bash
# Repos without CI/CD that need it:
# fleet-coordinate, whisper-sync, fleet-agent, smart-agent-shell,
# zeroclaw-agent, zeroclaw-plato, cocapn-ai-web, cocapn-browser-agent,
# fleet-coordinate-js, spline-physics

# Each workflow is ~20 lines of GitHub Actions YAML.
# Template: copy from agent-bootcamp/.github/workflows/ci.yml
```

| Repo | Est. Time | Template Source |
|------|-----------|-----------------|
| fleet-coordinate | 15 min | fleet-spread/workflow |
| whisper-sync | 15 min | fleet-spread/workflow |
| fleet-agent | 15 min | agent-bootcamp/workflow |
| smart-agent-shell | 15 min | agent-bootcamp/workflow |
| cocapn-ai-web | 15 min | platoon-client-js/workflow |
| fleet-coordinate-js | 15 min | platoon-client-js/workflow |

### Write CONTRIBUTING.md Fleet-Wide
```bash
# Template CONTRIBUTING.md at:
# repos/superinstance/docs/CONTRIBUTING-template.md

# Copy to all repos missing it:
# fleet-coordinate, fleet-spread, holonomy-consensus, whisper-sync,
# fleet-agent, agent-bootcamp, agent-coordinator, agent-forge,
# zeroclaw-plato, cocapn-browser-agent, fleet-coordinate-js,
# flux-research, constraint-theory-llvm, spline-physics,
# fleet-resonance, holonomy-48-bridge, fleet-homology
```
**Est. time: 30 min (batch operation)**

### Consolidate 3 A2A Repos
**The problem:** `a2a-protocol`, `polyformalism-a2a-js`, `polyformalism-a2a-python` all implement A2A/agent-to-agent communication. Three repos doing one thing.

**The fix:** Merge into one canonical repo (`polyformalism-a2a`) with JS + Python implementations. Archive the other two.

**Est. time: 1-2 hours** (involves git history, redirecting refs, updating dependent repos)

### Resolve zeroclaw-agent
**The problem:** `zeroclaw-agent` returns no data from GitHub API. Either it's:
1. Private (need to make public or get access)
2. Renamed (need to find current name)
3. Deleted (need to confirm and remove from roadmaps)

**Est. time: 10 min** (check manually in browser, then either fix or archive)

### Add Health Endpoints to Fleet-Core Services
Fleet-core services should all expose `GET /health` endpoints for the fleet health monitor.

**Est. time: 30 min** (fleet-coordinate, fleet-spread, holonomy-consensus each need one endpoint)

### Add Test Coverage to flux-research
flux-research has 7 test items found — good start. Add tests for:
- Bytecode instruction encoding/decoding
- ISA compliance checks
- FLUX VM execution traces

**Est. time: 45 min** (leverage existing test patterns)

---

## Appendix: Original 90-Day Roadmap Reference

The original Cocapn Fleet 90-day roadmap (dated April 14, 2026) remains the guiding vision. Key commitments that should not be lost:

1. **Day 47 drill is the single most important experiment** — run full runtime against Sitka bridge decisions, zero constraint violations, >82% human match
2. **7-core-repo minimal stack** — constraint-theory-core, cocapn, git-native-mud, openprose, deckboss-hardware, cudaclaw, git-agent-standard
3. **Kill legacy completely** — fleet-orchestrator, holodeck-studio, flux-runtime, 85 cognitive primitive repos
4. **Git is the single source of truth** — all state, training, logs, decisions in git

This MASTER-ROADMAP supersedes the original for repo-level tracking but preserves the product goals.

---

*Last updated: 2026-05-07 by Oracle1 subagent*
