# Beta Test Report — baton

**Tool:** crush (v0.76.0) with zai/glm-5.2
**Repo:** SuperInstance/baton
**Date:** 2026-07-12

## Test Results

✅ **All 30 tests passed**

## Issues Found (11 total)

### Top Concerns

1. **Validator mutates input lessons in place** (`validator.py:54-93`) — re-validation compounds confidence decay and corrupts persisted briefs
2. **Empty-context temporal lessons wrongly classified ACTIVE** — inflates survival rate
3. **No-op test assertion** (`test_baton.py:354`: `assert "90%" in output or "90%" in output`) — tautological assertion
4. **CI masks all failures with `|| true`** and references a missing `requirements.txt`
5. **`_infer_type` heuristic keys don't match fixture data** — version-specific lessons get classified timeless

### Additional Issues

6. LineageNode type referenced in README doesn't exist in codebase
7. examples.md uses `expiry` instead of `expiry_date` (field name mismatch)
8. No bytecode length check before header unpacking
9. bool sum issue in validator
10. Confidence bar edge case not handled
11. Missing requirements.txt referenced in CI

## Approach Notes

Crush (using zai/glm-5.2 model) systematically explored the repo, read all source files, ran tests, verified specific issues, and wrote a comprehensive 229-line BETA_TEST.md. The tool was thorough in checking edge cases and cross-referencing documentation with code.
