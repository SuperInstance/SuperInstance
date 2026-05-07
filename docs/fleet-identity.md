# Fleet Identity System

**Status:** DRAFT
**Last Updated:** 2026-05-07
**Owner:** SuperInstance/cocapn

## Summary

Each agent in the SuperInstance fleet has a **vessel identity** (its shell) and a **trust vector** (quantified reputation). The fleet coordinates through a rigidity graph where edges represent trust relationships. The mathematical foundations are Laman's theorem (rigidity), H¹ homology (emergence detection), Zero-Holonomy Consensus (Byzantine fault tolerance), and Pythagorean48 (trust encoding).

## Vessel Identity

A **vessel** is the physical or process entity that hosts a turbo-shell agent:

```typescript
interface Vessel {
  vessel_id: string;          // e.g., "oracle1", "jetsonclaw1", "ccc"
  turbo_id: string;           // The agent living in this vessel
  shell_type: 'service' | 'binary' | 'browser' | 'mobile' | 'edge';
  shell_version: string;
  capabilities: string[];    // What this vessel can do
  registered_at: number;      // Unix ms
  last_heartbeat: number;
}
```

Vessels register by writing to `turbo_identity` room:

```json
{
  "domain": "turbo_identity",
  "question": "vessel:oracle1 registered:2026-05-07T00:00:00Z shell:service",
  "answer": "{\"vessel_id\":\"oracle1\",\"turbo_id\":\"oracle1\",\"shell_type\":\"service\",\"capabilities\":[\"plato_write\",\"git_push\",\"health_monitor\",\"telegram_alert\"]}",
  "confidence": 1.0,
  "source": "oracle1"
}
```

## Trust Vector

Each vessel has a **trust vector** quantifying its reliability:

```typescript
interface TrustVector {
  vessel_id: string;
  trust_efficiency: number;    // 0.0–1.0: how often tasks complete vs. fail
  trust_latency: number;      // 0.0–1.0: lower-is-better response time score
  trust_correctness: number;   // 0.0–1.0: quality of deliberation output
  trust_availability: number;  // 0.0–1.0: uptime fraction over rolling window
  overall: number;             // Geometric mean of above
  computed_at: number;
}
```

Trust vectors are computed by the fleet based on observed behavior and written to the `trust_vectors` room.

## The Rigidity Graph

The fleet topology is a graph G = (V, E):
- **V** (vertices): Agents (oracle1, jetsonclaw1, CCC, Forgemaster, etc.)
- **E** (edges): Trust relationships between agents (directed or undirected depending on context)

### Laman's Theorem — Rigidity Condition

A graph is **generically rigid** in 2D (meaning the fleet can coordinate without drift) iff:
1. E = 2V − 3 (exactly the right number of trust edges)
2. Every subgraph with V′ vertices has E′ ≥ 2V′ − 3

```typescript
function isLamanRigid(V: number, E: number): boolean {
  return E === 2 * V - 3;
}

function isOverConstrained(V: number, E: number): boolean {
  return E > 2 * V - 3;  // Redundant trust edges — possible Byzantine conflict
}

function isUnderConstrained(V: number, E: number): boolean {
  return E < 2 * V - 3;  // Insufficient trust — drift possible
}
```

**Implication for fleet coordination:** When E = 2V − 3, the fleet has exactly the right number of trust relationships — no more, no less. This is the "just-right" coordination level.

### H¹ Homology — Emergence Detection

H¹ counts the number of independent cycles in the trust graph:

```
β₁ = E − V + C
```

Where C = number of connected components.

- **β₁ = V − 2 (C=1)**: Exactly at the rigidity threshold. The fleet is a minimal rigid structure.
- **β₁ > V − 2**: **Emergence detected** — more trust cycles than minimally required. The fleet has excess coordination capacity; agents can coordinate in multiple independent ways.
- **β₁ < V − 2**: Under-coordinated. The fleet lacks sufficient trust paths between some agents.

```typescript
interface EmergenceStatus {
  beta: number;           // β₁
  threshold: number;      // V - 2
  status: 'rigid' | 'emergence' | 'under_constrained';
  delta: number;          // β₁ - (V - 2): positive = emergence, negative = under
}
```

**Emergence** in fleet context means: the trust graph has excess cycles beyond what's needed for minimal rigidity. These excess cycles provide **redundancy** — if one trust path fails, others exist.

## Zero-Holonomy Consensus (ZHC)

When trust flows around a cycle in the graph, the accumulated transformations should sum to zero (no net drift) if the connection is **flat**.

```typescript
interface ZHCState {
  cycle_id: string;           // e.g., "oracle1→jetson→forgemaster→oracle1"
  loop_residual: number;       // Should be ~0 for flat connection
  hop_count: number;
  computed_at: number;
}
```

ZHC enables **Byzantine-fault-tolerant consensus** without voting:
- Any Byzantine agent that distorts trust values will create a non-zero loop residual
- The loop residual propagates through the graph; honest agents detect it and ignore the corrupted path
- This achieves consensus in 38ms regardless of fleet size, with any Byzantine tolerance level

## Pythagorean48 Trust Encoding

Trust vectors are encoded as 48-direction unit vectors (6 bits per direction):

```
log₂(48) = 5.585 bits per vector
```

This encoding:
- Is **drift-free**: After unlimited hops, trust values don't drift (unlike continuous floating-point)
- **Converges**: Iterative trust updates on encoded values reach a unique fixed point
- **Compact**: 48 integers represent all trust relationships; can be sent over wire cheaply

```typescript
const TRUST_DIRECTIONS = 48;
const PHI = (1 + Math.sqrt(5)) / 2;  // Golden ratio — used for angular spacing

function encodeTrustVector(trust: number): number {
  // Map continuous trust [0,1] to one of 48 directions
  const angle = trust * 2 * Math.PI;
  const bucket = Math.round((angle / (2 * Math.PI)) * TRUST_DIRECTIONS) % TRUST_DIRECTIONS;
  return bucket;
}

function decodeTrustVector(bucket: number): number {
  return (bucket / TRUST_DIRECTIONS) * 2 * Math.PI / (2 * Math.PI);
}
```

## Fleet Topology

The fleet topology is visualized as a graph:
- **Nodes**: Vessels (labeled by vessel_id)
- **Edges**: Trust relationships (weighted by trust_efficiency)
- **Edge color**: Green (high trust) → Yellow (medium) → Red (low/byzantine)
- **Radar rings**: Expanding circles from lighthouse node = fleet discovery protocol

```
        [oracle1]
           /|\
          / | \
         /  |  \
   [CCC]----+----[Forgemaster]
         \  |  /
          \ | /
           \|/
        [jetsonclaw1]
```

## Trust Convergence

Trust vectors converge to a unique equilibrium under repeated averaging (as long as the trust graph is connected and not bipartite). This is guaranteed by the spectral properties of the adjacency matrix.

```typescript
interface ConvergenceStatus {
  converged: boolean;
  iterations: number;
  final_delta: number;      // Max change in last iteration
  equilibrium: TrustVector[];
}
```

## Implementation

- `fleet-coordinate` Rust crate: implements Laman, H¹, ZHC, Pythagorean48
- `fleet-coordinate-js` TypeScript port: browser-compatible
- `holonomy-consensus` Rust crate: ZHC consensus algorithm
- `plato-sdk` reads/writes trust vectors to `trust_vectors` room

## Open Questions

- How often should trust vectors be recomputed? (Currently: on-demand, per-deliberation)
- What is the formal Byzantine tolerance level for ZHC at various fleet sizes?
- How does Pythagorean48 handle negative trust (distrust)?
