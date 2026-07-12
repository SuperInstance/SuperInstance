# Beta Test Report — conservation-enforcer

**Tool:** opencode (v1.x) with MiniMax-M2.7
**Repo:** SuperInstance/conservation-enforcer
**Date:** 2026-07-12

## Test Results

✅ **95/95 tests passed** (0.20s)

```
........................................................................ [ 75%]
.......................                                                  [100%]
95 passed in 0.20s
```

## Issues Found

### HIGH SEVERITY

#### 1. `scope_discipline_policy` ignores `max_expansion` parameter
**File:** `src/conservation_enforcer/policies/__init__.py`

The `scope_discipline_policy` function accepts a `max_expansion` parameter but always multiplies by 10 regardless of the value passed. This means the parameter has no effect on behavior.

### LOWER-TIER OBSERVATIONS

1. **No linting configured** — No flake8/ruff/mypy in dev dependencies or CI
2. **ISHR shift semantics** — The ISHR opcode may have incorrect shift semantics for negative values
3. **YIELD is a no-op** — The YIELD opcode doesn't actually yield control; it's a pass statement
4. **Division errors propagate uncaught** — Division by zero in the VM is not caught and will crash

## Approach Notes

opencode used an "Explore Agent" subagent to discover the repo structure, then systematically read all source files, ran tests, and wrote the findings file autonomously.
