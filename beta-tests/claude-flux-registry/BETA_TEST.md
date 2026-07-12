# Beta Test Report — flux-registry

**Tool:** claude (Claude Code v2.1.207)
**Repo:** SuperInstance/flux-registry
**Date:** 2026-07-12

## Test Results

✅ **All 15 unit tests pass successfully**

CLI functionality verified:
- Remote registry listing fetches 4 policies
- Policy execution produces correct outputs

## Issues Found

| Severity | Issue | Location |
|----------|-------|----------|
| **CRITICAL** | CI workflow installs non-existent dev dependencies | `.github/workflows/ci.yml` |
| **MEDIUM** | No `__main__.py` module for direct execution | `src/flux_registry/` |
| **MEDIUM** | Network errors lack user-friendly context | `src/flux_registry/store.py` |
| **LOW** | Integer division (`//`) may surprise users | `src/flux_registry/cli.py:201` |
| **LOW** | Inconsistent type annotations | `src/flux_registry/store.py` |
| **LOW** | `.gitignore` missing common exclusions | `.gitignore` |

## Key Details

### CRITICAL: CI Workflow Bug
The CI workflow tries to install dev dependencies that don't exist in `pyproject.toml`, causing CI to fail on every push.

### Strengths
- Clean architecture with separation between storage (store.py) and execution (cli.py)
- Well-documented with comprehensive docstrings
- Complete FLUX VM implementation with 46 opcodes
- Clever serverless registry design using static JSON on GitHub
- Cross-language support (Python + Rust)

## Registry Contents
4 policies available: deadband-controller, budget-tracker, rate-limiter, security-scanner

## Recommendation
The project is **functionally sound** and ready for use, but the **CI workflow bug** should be fixed before merging PRs.

## Approach Notes

Claude initially ran in `--print` mode and produced analysis but couldn't write files. On retry with `--allowedTools Bash Write Read`, it successfully ran tests, analyzed code, and wrote a comprehensive 310-line BETA_TEST.md.
