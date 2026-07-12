# CLI Coding Tools Beta Test — Summary Report

**Date:** 2026-07-12  
**Tester:** OpenClaw Automated Beta Test  
**Duration:** ~15 minutes total  

---

## Executive Summary

Six CLI coding tools were tested against SuperInstance repositories to evaluate their ability to review code, run tests, and document findings non-interactively. **Only 1 tool (Claude) produced substantive analysis**, while 1 (Crush) ran tests but had limited output. The remaining 4 either failed on authentication, lacked non-interactive modes, were uninstalled, or hit server errors.

---

## Results Matrix

| Tool | Version | Repo | Tests | Result | Score |
|------|---------|------|-------|--------|-------|
| **claude** | 2.1.207 | flux-registry (15) | Didn't run | ⚠️ Analysis only — 20 issues found | **7/10** |
| **crush** | 0.76.0 | baton (30) | ✅ 30 passed | ⚠️ Ran tests + analysis, no file output | **6/10** |
| **opencode** | 1.16.2 | conservation-enforcer (95) | Didn't run | ❌ Server error | **2/10** |
| **droid** | 0.170.0 | a2ui (58) | Didn't run | ❌ Auth failure | **2/10** |
| **kimi** | 1.47.0 | trawl (34) | Didn't run | ❌ No headless mode + agent failure | **1/10** |
| **aider** | N/A | whistle | N/A | ❌ Not installed | **0/10** |

---

## Detailed Comparison

### Non-Interactive Mode Support

| Tool | Flag/Command | Quality |
|------|-------------|---------|
| claude | `-p` / `--print` | ⭐⭐⭐⭐⭐ Best — clean stdout output |
| droid | `exec` subcommand | ⭐⭐⭐⭐ Good — clear separation |
| crush | `run` subcommand | ⭐⭐⭐ Works — but fragmented output |
| opencode | `run` subcommand | ⭐⭐⭐ Accepted prompt — but server error |
| kimi | None | ⭐ No headless mode at all |
| aider | N/A | N/A — not installed |

### Error Handling

| Tool | Failure Mode | Error Quality |
|------|-------------|---------------|
| claude | Couldn't write file | Graceful — still reported findings in stdout |
| crush | Bad flag (--yolo) | Clean error message |
| droid | Auth failure | ⭐ Best error — clear, actionable, instant |
| opencode | Server error | Clean but unhelpful (no recovery hint) |
| kimi | Agent failure | ⭐ Worst — hung process, manual kill needed |

### Code Review Quality (when tool actually ran)

| Tool | Depth | Findings | Actionability |
|------|-------|----------|---------------|
| claude | Deep | 20 issues (4 critical, 4 high, 12 med/low) | Severity-ranked, specific fixes |
| crush | Moderate | Bug identification + verification | Confirmed with test runs |
| Others | None | N/A | N/A |

---

## Key Findings

### 🏆 Claude Code — Best Overall
- Most capable in non-interactive mode
- Produced real, actionable code review findings
- Identified critical security issues (VM stack underflow)
- Only weakness: couldn't write output file

### 🥈 Crush — Best Test Runner
- Actually ran the test suite (30/30 passed)
- Read source code and verified bugs
- Created session artifacts
- Weakness: fragmented non-interactive output, no file creation

### 🥉 Droid — Best Error Messages (but couldn't run)
- Instant, clear authentication error
- Obvious fix path (set FACTORY_API_KEY or /login)
- Likely would perform well if configured — needs re-test

### ❌ Kimi — Worst for Automation
- No non-interactive mode whatsoever
- TUI hung with "Agent failure"
- Process required manual kill
- Fundamentally not designed for headless/automated use

### ❌ OpenCode — Server Dependency Risk
- Clean CLI, good design
- Completely blocked by upstream server error
- Needs provider configuration before use

### ❌ Aider — Absent
- Not installed on system
- Zero test possible

---

## Baseline Test Results (All Repos)

All SuperInstance repos pass their test suites cleanly:

| Repo | Tests | Status |
|------|-------|--------|
| conservation-enforcer | 95 | ✅ All pass |
| flux-registry | 15 | ✅ All pass |
| baton | 30 | ✅ All pass |
| whistle | Not tested (aider unavailable) | — |
| a2ui | 58 | ✅ All pass |
| trawl | 34 | ✅ All pass |

**Note:** Tests required `PYTHONPATH=src` to find packages despite `pip install -e`.

---

## Recommendations

### For Tool Authors
1. **Every CLI coding tool needs a `-p`/`--print` or `exec` mode** — Kimi's lack of this is a critical gap
2. **Error messages should include recovery actions** — Droid does this best
3. **Non-interactive output should be complete** — Crush's fragmented output loses findings
4. **File creation permissions** — Claude's inability to write BETA_TEST.md in sandbox is a common pitfall

### For Beta Test Process
1. **Pre-configure authentication** for all tools before testing
2. **Install all tools** before starting (aider was missing)
3. **Use `PYTHONPATH=src`** for SuperInstance repos
4. **Add a `--output-file` flag** to the test prompt for tools that can't create files

### For Re-Testing
Priority re-tests if tools get configured:
1. **Droid** with `FACTORY_API_KEY` set — likely strong performer
2. **OpenCode** with provider configured — may work once server issue resolved
3. **Kimi** after `kimi login` — though still lacks non-interactive mode
4. **Aider** after `pipx install aider-chat`
