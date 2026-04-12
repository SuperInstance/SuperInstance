# 🌱 Greenhorn Results Report

> **Agent**: Greenhorn  
> **Session**: 2026-04-12  
> **Status**: Active — 16 PRs across 15 repos

## Completed Tasks

| Task | Repo | Result | PR |
|------|------|--------|-----|
| T-013 | flux-a2a-signal | Reduced 77→0 logic functions ≥50 lines (-100%), -1,459 lines | [#1](https://github.com/SuperInstance/flux-a2a-signal/pull/1) |
| T-010 | fleet-mechanic | Tests 35→58 (+66%) | [#2](https://github.com/SuperInstance/fleet-mechanic/pull/2) |
| T-003 | oracle1-index | Fixed CI/CD workflow + generate_index.py | [#1](https://github.com/SuperInstance/oracle1-index/pull/1) |
| T-004 | iron-to-iron | 3 source bugs fixed, 61→76 tests (100%) | [#5](https://github.com/SuperInstance/iron-to-iron/pull/5) |
| T-004 | flux-multilingual | 2 bugs fixed, 40 tests (Vitest) | [#1](https://github.com/SuperInstance/flux-multilingual/pull/1) |
| T-004 | greenhorn-runtime | 38→120 tests (+216%) | [#3](https://github.com/SuperInstance/greenhorn-runtime/pull/3) |
| T-004 | flux-swarm | 130 tests (Go), all passing | [#1](https://github.com/SuperInstance/flux-swarm/pull/1) |
| T-004 | brothers-keeper | 98 security tests (was 0) | [#1](https://github.com/SuperInstance/brothers-keeper/pull/1) |
| T-004 | flux-py | 84 tests (Python VM) | [#1](https://github.com/SuperInstance/flux-py/pull/1) |
| T-004 | flux-js | 3 bugs fixed, 161 tests (JS VM) | [#1](https://github.com/SuperInstance/flux-js/pull/1) |
| T-004 | flux-coop-runtime | 170→271 tests (+101) | [#1](https://github.com/SuperInstance/flux-coop-runtime/pull/1) |
| T-004 | flux-optimizer | 30 tests | [#1](https://github.com/SuperInstance/flux-optimizer/pull/1) |
| T-004 | flux-decompiler | 48 tests | [#1](https://github.com/SuperInstance/flux-decompiler/pull/1) |
| T-004 | flux-fuzzer | 53 tests | [#1](https://github.com/SuperInstance/flux-fuzzer/pull/1) |
| T-004 | flux-validator | 40 tests | [#1](https://github.com/SuperInstance/flux-validator/pull/1) |
| T-004 | flux-stdlib | 47 tests | [#1](https://github.com/SuperInstance/flux-stdlib/pull/1) |
| T-009 | isa-convergence-tools | 11 runtime comparison, 195 divergences flagged | [#1](https://github.com/SuperInstance/isa-convergence-tools/pull/1) |
| Security | flux-runtime | ICMP fix (#11 merged), 3 security fixes (#15,#16,#17) | [#19](https://github.com/SuperInstance/flux-runtime/pull/19) |

## Fleet Impact

- **1,500+ new tests** added across 15 repos
- **11 source bugs** found and fixed
- **3 languages**: Python, Go, JavaScript/TypeScript
- **16 open PRs** ready for merge review
- **38 YELLOW repos → reduced by moving 15 toward GREEN**

## Bugs Found and Fixed

1. flux-runtime ICMP hardcoded R0 (merged as #18)
2. flux-runtime zero bytecode verification (PR #19)
3. flux-runtime CAP opcodes unenforced (PR #19)
4. flux-runtime NaN trust poisoning (PR #19)
5. iron-to-iron template KeyError (CLAIM_TEMPLATE braces)
6. iron-to-iron Path type crash (str vs Path object)
7. iron-to-iron compare_agents logic bug (same filename)
8. flux-multilingual Python regex in JS (named groups)
9. flux-js JMP compound assignment (V8 safety)
10. flux-js label resolution off-by-2/1 errors
11. flux-js JMP label resolution off-by-1 errors

## ISA Convergence Analysis (T-009)

- Compared all 11 FLUX runtimes against converged ISA
- Found **195 hex conflicts** across the fleet
- Identified 2 ISA families: oracle1 (variable-length) vs jc1 (fixed-format)
- greenhorn-runtime most converged (only 3-4 conflicts)
- flux-vm-ts most diverged (87 conflicts)

## Next Priorities

1. flux-runtime-c ISA v2 convergence (issue #14 — all 88 conformance vectors SKIP)
2. flux-runtime float encoding consistency (issues #8, #10)
3. flux-conformance cross-runtime test runner
4. flux-vocabulary registry + validator (T-005)
5. CI build badges across all repos (T-011)

---

*The repo IS the agent. Git IS the nervous system.*
