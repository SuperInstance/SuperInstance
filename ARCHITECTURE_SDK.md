# SuperInstance SDK Architecture

> **Version:** 0.3.0 | **Tests:** 113 passing | **npm:** `@superinstance/sdk@0.3.0`

## 1. System Vision

SuperInstance is a **conservation-law governance layer** for AI agent fleets. It sits on top of any agent framework (OpenAI SDK, LangGraph, CrewAI) and enforces a proven mathematical invariant:

```
γ + η ≤ C    where C = log₂(3) ≈ 1.585 bits
```

This is the Shannon chain rule: total capacity = value (η) + coordination cost (γ). Ternary {-1, 0, +1} is uniquely optimal with 99.54% radix economy.

## 2. Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer                                      │
│  User code — OpenAI, LangGraph, CrewAI, custom          │
│  Files: integrations/openai/, integrations/langgraph/   │
├─────────────────────────────────────────────────────────┤
│  Governance Layer — @superinstance/sdk                  │
│  Fleet · Agent · Governor (PID) · ConservationState     │
│  Files: sdk/src/sdk.ts, sdk/src/governor.ts             │
├─────────────────────────────────────────────────────────┤
│  Capability Layer — Modular request router              │
│  search · budget · validate · conserve · status ·       │
│  report · delegate + custom                             │
│  Files: sdk/src/modular.ts, sdk/src/agent-request.ts    │
├─────────────────────────────────────────────────────────┤
│  Integration Layer                                      │
│  MCP Server · Harbor Bridge · Telemetry · Dashboard     │
│  Files: superinstance-mcp/, sdk/src/{harbor,telemetry,  │
│         dashboard}.ts                                   │
├─────────────────────────────────────────────────────────┤
│  Transport Layer                                        │
│  TCP (:8796) · HTTP (:8797/:8798) · MCP (stdio)        │
├─────────────────────────────────────────────────────────┤
│  Storage Layer                                          │
│  D1 · KV · Vectorize · JSONL · In-memory                │
└─────────────────────────────────────────────────────────┘
```

## 3. Data Flow — Governed Task Execution

```
agent.execute('build REST API')
  │
  ├─ Governor.observe({gamma, eta, agentCount}) → ConservationState
  ├─ Check: delta > 0? ── NO → error (conservation violated)
  ├─ Execute user task (call wrapped agent)
  ├─ Measure: γ = prompt_tokens/10000, η = min(output_tokens/5000, C*0.8)
  ├─ Fleet.recordTask(gamma, eta)
  └─ Return TaskResult {success, gammaUsed, etaProduced, conservationCheck}
```

## 4. Ecosystem Map

### Our Components
| Component | Lang | Status |
|-----------|------|--------|
| @superinstance/sdk (2,994 lines, 113 tests) | TypeScript | v0.3.0 on npm |
| superinstance-mcp (683 lines, 8 tools) | TypeScript | v0.1.0 on npm |
| SHOAL oracle (1,276 lines) | TypeScript | Built, needs CF deploy |
| fleet-dashboard (582 lines) | HTML/JS | Built, needs deploy |
| fleet-budget / baton-router | TypeScript | Built, need CF deploy |
| conservation-action | YAML/JS | GitHub Action |
| 160+ Rust crates (10 published) | Rust | crates.io |

### Loom's Components (Oracle2)
| Component | Port | Purpose |
|-----------|------|---------|
| harbor-daemon | 8796/8797 | TCP bottle protocol |
| conservation-meter | 8798 | γ+η=C dashboard |
| bottle-cli | — | 6-subcommand CLI |

### Bridges
- **Harbor bridge** (`sdk/src/harbor.ts`): SDK ↔ harbor-daemon TCP
- **Telemetry** (`sdk/src/telemetry.ts`): SDK ↔ conservation-meter HTTP
- **Bottle crate** (`fleet-bottle`): Rust ↔ Rust protocol

## 5. Integration Points

| Interface | Protocol | Location |
|-----------|----------|----------|
| npm SDK | package | `@superinstance/sdk@0.3.0` |
| MCP server | stdio | `npx superinstance-mcp` |
| Harbor | TCP :8796 | `sdk/src/harbor.ts` |
| Health | HTTP :8797 | harbor-daemon |
| Conservation meter | HTTP :8798 | conservation-meter |
| CLI | shell | `npx @superinstance/sdk {init,status,check,dashboard}` |

## 6. Roadmap to 1.0

**P0 (Blocked):** CF API token → deploy 5 Workers
**P1 (High leverage):** arXiv submission, real OpenAI e2e benchmark, demo video
**P2 (Scale):** Deploy all services, community examples, blog posts
**P3 (Moat):** Lean 4 proof, GPU K-sweep, BitNet integration

## 7. Moat

No competitor has: health metric (δ), budget enforcement (γ+η≤C), PID throttle, scaling law (δ(n)). These are mathematical results, not cloneable features.
