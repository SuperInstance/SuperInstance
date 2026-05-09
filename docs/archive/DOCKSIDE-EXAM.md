# Coast Guard Dockside Exam — Fleet Certification Checklist

**Every repo in the Cocapn fleet must pass this exam.**  
**A lighthouse-keeper won't let you on the water without it.**

---

## What This Is

When a keeper sees your vessel on its waters, it checks: is this ship seaworthy? Can it operate independently? Can it report back? Can it be rescued if something goes wrong?

This checklist is the dockside exam. Every repo — every agent, every library, every tool — should be able to tick every box that applies to it.

---

## Section 1: GitHub Hygiene

- [ ] **README.md exists** — Anyone who lands here knows what this is in 10 seconds
- [ ] **Description set** — GitHub repo description is filled in (shows in search)
- [ ] **Topics tagged** — At least 3 GitHub topics for discoverability
- [ ] **License file** — MIT, Apache-2.0, or documented why proprietary
- [ ] **.gitignore** — No secrets, no node_modules, no build artifacts committed
- [ ] **No secrets in git history** — API keys, tokens, passwords are in .env or environment
- [ ] **Default branch is `main`** — Not `master` (fleet standard)
- [ ] **Branch protection** — At least on main for critical repos
- [ ] **Clean commit history** — No "fix", "wip", "asdf" commits on main
- [ ] **Commit convention** — `[AGENT-NAME] description` format for attribution

## Section 2: CI/CD Pipeline

- [ ] **GitHub Actions** — `.github/workflows/ci.yml` exists and passes
- [ ] **Tests run on push** — Every push to PR/main triggers tests
- [ ] **Lint/format check** — Code style is validated automatically
- [ ] **Build check** — Project builds successfully (compile, bundle, etc.)
- [ ] **Release tags** — Version tags for stable releases
- [ ] **Changelog** — CHANGELOG.md or release notes exist
- [ ] **Badges in README** — Build status, coverage, version visible at a glance

## Section 3: Package/Registry Readiness

**For crates (Rust):**
- [ ] `Cargo.toml` has name, version, description, license, repository
- [ ] `cargo publish --dry-run` succeeds
- [ ] Published to crates.io (if public library)

**For npm (JavaScript/TypeScript):**
- [ ] `package.json` has name, version, description, main/types
- [ ] `npm publish --dry-run` succeeds
- [ ] Published to npm (if public library)

**For PyPI (Python):**
- [ ] `pyproject.toml` or `setup.py` with name, version, description
- [ ] `python -m build` succeeds
- [ ] Published to PyPI (if public library)

**For Go:**
- [ ] `go.mod` has module path matching repo URL
- [ ] `go test ./...` passes
- [ ] Tagged with semver for `go get` compatibility

**For C/C++:**
- [ ] `Makefile` or `CMakeLists.txt` that builds cleanly
- [ ] `make install` target works
- [ ] Header files are self-documenting

## Section 4: Agent Vessel Certification

**If this repo IS an agent (git-agent standard):**

- [ ] **CHARTER.md** — Purpose, contracts, constraints
- [ ] **ABSTRACTION.md** — Primary plane, reads/writes, compilers
- [ ] **STATE.md** — Current health, last active, blockers
- [ ] **TASK-BOARD.md** — Prioritized work items
- [ ] **SKILLS.md** — What this agent can do
- [ ] **IDENTITY.md** — Name, model, vibe, emoji
- [ ] **DIARY/** — Learning journal, at least one entry
- [ ] **for-fleet/** — Bottle directory for outbound messages
- [ ] **from-fleet/** — Bottle directory for inbound messages
- [ ] **GIT-AGENT-STANDARD.md** — The fleet standard (read and followed)

## Section 5: Documentation

- [ ] **Usage instructions** — How to run/use this thing
- [ ] **API documentation** — If it exposes an API, it's documented
- [ ] **Examples** — At least one working example
- [ ] **Architecture overview** — How the pieces fit together
- [ ] **Contributing guide** — How others (agents or humans) can contribute

## Section 6: Operational Readiness

- [ ] **Health check endpoint** — If it's a service, `/health` responds
- [ ] **Graceful shutdown** — Handles SIGTERM cleanly
- [ ] **Configuration** — All config via env vars or config files, not hardcoded
- [ ] **Logging** — Structured logs, not just print statements
- [ ] **Error handling** — Errors are caught, reported, don't crash the service
- [ ] **Resource limits** — Memory/CPU limits documented if running as a service

## Section 7: Tender Compatibility

**Can a tender vessel service this repo in the wild?**

- [ ] **Works offline** — Can run without internet (for edge/tender scenarios)
- [ ] **Clone depth 1 works** — Can boot from shallow clone
- [ ] **Dependencies documented** — All requirements listed and versioned
- [ ] **State is portable** — Agent state can be exported/imported
- [ ] **Commits are self-contained** — Each commit tells a complete story
- [ ] **Can rewind** — `git checkout` to any prior commit produces a working state

---

## Scoring

| Category | Max Score | Passing |
|----------|-----------|---------|
| GitHub Hygiene | 10 | 7 |
| CI/CD | 7 | 4 |
| Package Registry | 3-4 | 2 |
| Agent Vessel | 10 | 7 (if agent) |
| Documentation | 5 | 3 |
| Operational | 6 | 4 |
| Tender Compat | 6 | 3 |
| **Total** | **~47** | **~30** |

A repo that scores below 30 needs work before it goes to sea.

---

## Who Checks This

- **Lighthouse Keeper** — Checks on every heartbeat for vessels in its waters
- **Tender** — Checks when it visits a remote agent in the wild
- **Fleet Mechanic** — Can be dispatched to fix failing repos
- **Self-check** — Any agent can run this against its own repo

---

## The Tender Protocol

### What Is a Tender?

A tender is a mobile agent that visits remote/edge agents. It:
- Carries updates (new code, new locks, new standards)
- Collects work (commits, diary entries, bottles)
- Thinks alongside the edge agent on local changes
- Syncs with GitHub when back in range

### How Tenders Work

```
TENDER APPROACHES → DOCKSIDE EXAM → EXCHANGE → DEPART
      ↑                                         |
      └──────── returns to lighthouse ──────────┘
```

**1. Approach**
- Tender detects agent via local network, bluetooth, or scheduled visit
- No internet required — this is local-only communication

**2. Dockside Exam**
- Tender runs this checklist against the agent's repo
- Agent shows its STATE.md, TASK-BOARD.md, recent commits
- If passing, proceed to exchange. If not, tender can help fix issues

**3. Exchange**
- **Tender gives:** Updates from fleet (pull from master), new standards, lock libraries, firmware
- **Agent gives:** Commits since last visit, diary entries, bottles for fleet, test results
- **Both think:** If agent needs changes, tender can iterate locally — run tests, make commits
- **Tender carries the diff:** When back in range, tender pushes agent's work to GitHub master

**4. Depart**
- Agent's local clone is now current
- Tender carries outbound commits/bottles
- Next visit scheduled or on-demand

### The Clone Is The Agent

The GitHub repo is the master copy. When a tender clones it to an edge device:
- That clone IS the agent running in the wild
- Commits made locally are carried back by the tender
- The master can rewind to any prior state via git history
- A new model can bootcamp from any commit — that commit IS a training snapshot

### Rewind and Bootcamp

```
git log --oneline  # see all previous states of this agent
git checkout abc123  # rewind to a specific state
# Bootcamp: feed this state to a new model as context
# Fine-tune: the commit history IS the training data
```

Every commit is a snapshot of the agent's capability at that moment.
A dojo can replay the commits to train any model to become that agent.
The diary entries are the human-readable training notes.
The code changes are the skill acquisitions.
The bottles are the social learning.

---

*This document is part of the Git-Agent Standard v2.0*  
*Deployed to every fleet repo. Maintained by the Lighthouse Keeper.*
