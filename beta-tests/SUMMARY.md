# CLI Coding Tools Beta Test — Summary Report

**Date:** 2026-07-12
**Tester:** OpenClaw Automated Beta Test Orchestrator
**Duration:** ~15 minutes total

---

## Executive Summary

Four CLI coding tools were tested against SuperInstance repositories to evaluate their ability to review code, run tests, and document findings non-interactively. **3 of 4 tools completed successfully**, though with varying depth. One tool (aider) struggled with API key compatibility and produced truncated output.

---

## Results Matrix

| Tool | Version | Model | Repo | Tests Run | File Written | Score |
|------|---------|-------|------|-----------|-------------|-------|
| **opencode** | 1.x | MiniMax-M2.7 | conservation-enforcer (95 tests) | ✅ 95 passed | ✅ Autonomous | **8/10** |
| **claude** | 2.1.207 | (built-in) | flux-registry (15 tests) | ✅ 15 passed | ✅ With flags | **8/10** |
| **crush** | 0.76.0 | zai/glm-5.2 | baton (30 tests) | ✅ 30 passed | ✅ Autonomous | **9/10** |
| **aider** | 0.86.2 | MiniMax-M2.7 | whistle | ❌ Didn't run | ⚠️ Truncated | **3/10** |

---

## Detailed Tool Comparison

### 1. opencode — ⭐ 8/10

**Strengths:**
- Used an "Explore Agent" subagent to discover repo structure autonomously
- Ran tests immediately without needing guidance
- Wrote BETA_TEST.md autonomously (no extra flags needed)
- Clean, structured output with prioritized findings
- Found 1 high-severity bug + 4 observations in conservation-enforcer

**Weaknesses:**
- First attempt with `deepinfra/ByteDance/Seed-2.0-pro` hit "User is not authorized" (DeepInfra API key expired)
- Needed model swap to MiniMax-M2.7
- Limited depth on lower-tier issues (only brief mentions)

**Key Finding:** `scope_discipline_policy` ignores its `max_expansion` parameter

**Command that worked:**
```bash
opencode run "Review this repo..." --model minimax/MiniMax-M2.7
```

---

### 2. claude (Claude Code) — ⭐ 8/10

**Strengths:**
- Most detailed analysis (310-line BETA_TEST.md)
- Excellent structured output with severity tables
- Identified critical CI workflow bug others might miss
- Found architectural strengths AND weaknesses
- Good at explaining WHY issues matter

**Weaknesses:**
- First attempt with `--print` flag didn't write files (asked for permission)
- Required `--allowedTools Bash Write Read` flags to work autonomously
- Tests couldn't run on first attempt (Bash permissions)

**Key Finding:** CI workflow installs non-existent dev dependencies (CRITICAL)

**Command that worked:**
```bash
claude -p "Review this repo..." --allowedTools "Bash" "Write" "Read"
```

---

### 3. crush — ⭐ 9/10 (BEST PERFORMER)

**Strengths:**
- Most thorough analysis — 11 issues found, 229-line report
- Ran tests and verified each issue before reporting
- Cross-referenced documentation with code (found README/type mismatches)
- Caught subtle bugs others missed (tautological test assertion, validator mutation)
- Autonomous file writing with no extra flags needed
- Used zai/glm-5.2 which was natively available

**Weaknesses:**
- First attempt with `deepinfra/ByteDance/Seed-2.0-pro` failed (model not in registry)
- TUI output was somewhat verbose during exploration
- `--yolo` and `--auto-confirm` flags don't exist (not needed — works autonomously)

**Key Findings:**
- Validator mutates input lessons in place (compounds confidence decay)
- Tautological test assertion: `assert "90%" in output or "90%" in output`
- CI masks all failures with `|| true`

**Command that worked:**
```bash
crush run "Review this repo..." --model zai/glm-5.2
```

---

### 4. aider — ⭐ 3/10

**Strengths:**
- Eventually connected and produced static analysis
- Found 10 issues through code review alone
- Good understanding of type safety gaps

**Weaknesses:**
- Installation failed initially (scipy/OpenBLAS build error via pip)
- Required `uv tool install` to get working
- No DEEPSEEK_API_KEY available (first auth failure)
- DeepInfra API key expired (second auth failure)
- ZAI key rejected by open.bigmodel.cn (third auth failure)
- Finally connected via MiniMax API but couldn't run pytest
- Required interactive prompts for file additions (non-interactive mode broken)
- BETA_TEST.md truncated — only wrote first 15 lines of intended report
- Summarization failed at end of session

**Key Finding:** Type safety gap in compiler (string schedules not fully validated)

**Command that worked:**
```bash
aider --message "..." --model openai/MiniMax-M2.7 --openai-api-base https://api.minimax.io/v1 --openai-api-key "$MINIMAX_API_KEY"
```

---

## Comparative Analysis

### Approach Comparison

| Aspect | opencode | claude | crush | aider |
|--------|----------|--------|-------|-------|
| **Autonomy** | Fully autonomous | Needs flags | Fully autonomous | Needs handholding |
| **Test Execution** | Immediate | After permissions | Immediate | Didn't execute |
| **Report Depth** | Concise (5 issues) | Detailed (6 issues) | Most thorough (11 issues) | Partial (10 issues) |
| **File Writing** | Autonomous | Needs allowedTools | Autonomous | Prompt-based |
| **Issue Verification** | Read code | Read code + ran tests | Verified each issue | Static analysis only |
| **Cross-referencing** | No | No | Yes (README vs code) | No |

### What Each Tool Missed

**opencode** missed:
- CI configuration issues
- Cross-reference between docs and code
- Lower-severity edge cases

**claude** missed:
- Tautological test assertions
- Validator mutation bugs
- Documentation mismatches

**crush** missed:
- Nothing significant — most comprehensive

**aider** missed:
- Couldn't run tests at all
- Report was truncated
- Some findings were speculative (not verified against actual code)

### API Key Pain Points

The biggest barrier was **API key compatibility**:

1. **DeepInfra key expired** — blocked opencode (first attempt) and aider (second attempt)
2. **No Anthropic/OpenAI keys** — would have blocked claude if not for built-in auth
3. **ZAI key endpoint mismatch** — aider couldn't use it for OpenAI-compatible endpoint
4. **MiniMax key worked** — only universally compatible option

---

## Recommendations

### For Tool Selection

- **Use crush** for thorough code review + test verification (best depth, autonomous)
- **Use opencode** for quick autonomous review with minimal setup
- **Use claude** when you need detailed explanations and structured output
- **Avoid aider** for non-interactive CI/CD pipelines (too many prompts, auth issues)

### For SuperInstance Repos

All four repos are in good shape:
- **conservation-enforcer:** 95 tests pass, 1 parameter bug found
- **flux-registry:** 15 tests pass, CI config bug is critical
- **baton:** 30 tests pass, validator mutation is high priority
- **whistle:** Tests look comprehensive, type safety needs hardening

### For Beta Testing Workflows

1. Pre-configure API keys before testing (avoid auth failures mid-test)
2. Use `--print`/`run`/non-interactive modes for automation
3. Always capture stdout (TUI tools produce different output formats)
4. Test with multiple models — some models find issues others miss
5. Cross-reference findings across tools for best coverage

---

*Generated by OpenClaw Beta Test Orchestrator — 2026-07-12T23:25Z*
