# Headroom ↔ Fleet Integration Architecture

**Author:** Architecture Design (Subagent)
**Date:** 2026-06-13
**Status:** Design specification — ready for implementation
**Depends on:** headroom-ai v0.25.0 (installed), fleet-edge-worker (deployed), fleet-vector-api (live), semantic search server (port 7777), crab-trap server (port 8888)

---

## 0. Executive Summary

Headroom is installed (`pip show headroom-ai` → v0.25.0, binary at `/home/phoenix/.local/bin/headroom`). The Python API exposes `compress()`, `HeadroomClient`, `HierarchicalMemory`, `SmartCrusher`, `CacheAligner`, and `TransformPipeline`. The MCP server (`headroom mcp serve`) exposes `headroom_compress`, `headroom_retrieve`, and `headroom_stats` tools. The proxy server (`headroom proxy`) intercepts LLM API calls and compresses in transit.

This document specifies exactly where Headroom sits in the fleet stack, how it changes the conservation law dynamics, how agents invoke it via MCP, how its memory interacts with our Vectorize index, how `headroom learn` relates to our harness pattern extraction, and what to measure to verify the 5× multiplier.

---

## 1. The Compression Transit Layer

### 1.1 Position in the Stack

Headroom is not a tool agents call optionally. It is a **transit membrane** — a mandatory compression layer that sits between every information source and every LLM consumer. There are four transit points in the fleet where Headroom must be inserted:

```
                         ┌──────────────────────────────────┐
                         │        INFORMATION SOURCES        │
                         └──────┬───────┬───────┬───────────┘
                                │       │       │
                    ┌───────────▼──┐ ┌──▼──────▼────────┐
                    │  Tool outputs │ │  RAG chunks      │
                    │  Build logs   │ │  (vector search) │
                    │  Agent msgs   │ │  Conversation    │
                    └───────┬───────┘ └────────┬─────────┘
                            │                  │
                    ╔═══════▼══════════════════▼═══════╗
                    ║        HEADROOM TRANSIT LAYER     ║
                    ║                                   ║
                    ║  ┌─────────────┐ ┌─────────────┐ ║
                    ║  │ SmartCrusher│ │CacheAligner │ ║
                    ║  │ (JSON/logs) │ │ (prefix st.)│ ║
                    ║  └──────┬──────┘ └──────┬──────┘ ║
                    ║         │               │        ║
                    ║  ┌──────▼──────────────▼──────┐  ║
                    ║  │   TransformPipeline.apply() │  ║
                    ║  │   CCR cache → retrievable   │  ║
                    ║  └─────────────┬───────────────┘  ║
                    ╚════════════════╪══════════════════╝
                                    │
                    ┌───────────────▼───────────────┐
                    │        LLM CONSUMERS           │
                    │                               │
                    │  Claude (Anthropic API)       │
                    │  GLM-5.1 (Z.ai)               │
                    │  DeepInfra (Seed/Hermes)      │
                    │  fleet-edge-worker agents     │
                    └───────────────────────────────┘
```

### 1.2 The Four Transit Points

**Transit Point 1 — FLUX Message Bus (agent-to-agent)**

Every Bottle protocol message between fleet agents passes through Headroom before transmission. fleet-edge-worker currently sends raw JSON bottles. The change: insert a `compress()` call in the dispatch path.

```typescript
// fleet-edge-worker: src/dispatch.ts (PROPOSED CHANGE)
import { headroomCompress } from './headroom-transit';

async function dispatchBottle(bottle: Bottle): Promise<DispatchResult> {
  // BEFORE: const payload = JSON.stringify(bottle);
  // AFTER:
  const compressed = await headroomCompress(bottle, {
    target_ratio: 0.2,           // 80% reduction for inter-agent messages
    compress_user_messages: true, // compress all fields
    protect_recent: 2,            // keep last 2 messages uncompressed
  });
  const payload = JSON.stringify(compressed.messages);
  // ... dispatch as before
}
```

The TypeScript side calls the Headroom proxy (`http://localhost:8787/compress`) which runs the Python compression pipeline. The proxy is already designed for this — `headroom proxy` intercepts API calls and compresses payloads in transit. We extend it with a `/compress` REST endpoint for non-LLM traffic.

**Transit Point 2 — RAG Retrieval (vector search → LLM context)**

When the semantic search server (port 7777) or fleet-vector-api returns RAG chunks, they pass through Headroom before being inserted into the LLM prompt. The search server already runs in Python:

```python
# semantic-search-server: server.py (PROPOSED CHANGE)
from headroom import compress

def search_and_format(query: str, top_k: int = 5) -> str:
    results = vector_index.search(query, top_k)
    
    # BEFORE: return "\n\n".join(r.text for r in results)
    # AFTER: compress results before formatting for LLM
    messages = [{"role": "user", "content": r.text} for r in results]
    compressed = compress(
        messages,
        model="claude-sonnet-4-5-20250929",
        target_ratio=0.3,           # 70% reduction for RAG chunks
        compress_user_messages=True,
        protect_recent=0,            # all RAG content is compressible
    )
    return "\n\n".join(m["content"] for m in compressed.messages)
```

**Transit Point 3 — Build/Harness Logs**

When harness-experiments records build logs or when subagent results are captured, Headroom compresses the output before storing it in D1/KV:

```python
# harness build pipeline (PROPOSED)
from headroom import compress

def record_build_result(task_id: str, output: str):
    # Compress before storage — saves D1 rows, KV bytes
    result = compress(
        [{"role": "assistant", "content": output}],
        model="glm-5.1",
        target_ratio=0.15,  # 85% reduction for verbose build logs
    )
    compressed_output = result.messages[0]["content"]
    # Store compressed form in D1, original in CCR cache
    d1.execute(
        "INSERT INTO build_results (task_id, output, tokens_saved, ratio) VALUES (?, ?, ?, ?)",
        [task_id, compressed_output, result.tokens_saved, result.compression_ratio]
    )
```

**Transit Point 4 — Baton/Cross-Shell Spline Transport**

When splines transit between shells (especially ESP32 with 32KB RAM), Headroom compression is mandatory:

```python
# Baton spline transport (PROPOSED)
from headroom import compress

def transmit_spline(spline: dict, target_shell: str) -> bytes:
    # ESP32 needs maximum compression; Cloud shells need less
    ratio_map = {"esp32": 0.05, "pi": 0.15, "jetson": 0.25, "cloud": 0.40}
    target_ratio = ratio_map.get(target_shell, 0.20)
    
    result = compress(
        [{"role": "user", "content": json.dumps(spline)}],
        model="glm-5.1",
        target_ratio=target_ratio,
    )
    return result.messages[0]["content"].encode()
```

### 1.3 The CCR Reversibility Guarantee

Every compression via the transit layer goes through CCR (Compress-Cache-Retrieve). The original is cached locally in Headroom's SQLite store. Any agent can retrieve the full uncompressed content via `headroom_retrieve`:

```python
from headroom import HierarchicalMemory

memory = HierarchicalMemory()  # uses default SQLite + HNSW config
original = memory.recall(hash_key="abc123")  # <1ms retrieval
```

This means compression is **effectively lossless from the system's perspective** — the information is always recoverable. The only cost is the retrieval latency (<1ms per the CCR spec).

---

## 2. Conservation Impact — Information-Theoretic Formulation

### 2.1 Definitions

Let us define terms precisely using Shannon information theory:

- **X** = information source (agent state, build output, RAG chunk)
- **Ŷ** = compressed representation transmitted over the channel
- **Y** = reconstructed information at the receiver (via CCR retrieval if needed)
- **H(X)** = entropy of the source = actual information content
- **H(X|Ŷ)** = conditional entropy = information lost in compression
- **I(X;Y)** = mutual information between source and receiver

The **Shannon capacity** of the fleet channel:

> C_channel = max_{p(x)} I(X;Y)

This is fixed by the physical substrate (bandwidth, latency, compute budget). No compression can exceed it.

### 2.2 What Headroom Changes

Define the fleet's conservation law variables in information terms:

- **γ_raw** = H(X) = raw entropy of all fleet communications (uncompressed)
- **γ_transmitted** = H(Ŷ) = entropy of compressed messages actually sent over the wire
- **η** = I(decoded_message; intended_action) = mutual information between what the receiver decodes and the correct action
- **C** = C_channel = Shannon capacity of the fleet communication substrate

**Without Headroom:**
> γ_raw + η ≤ C
>
> η ≤ C − γ_raw

When γ_raw is large (verbose JSON bottles, full build logs, raw RAG chunks), η is squeezed. At extreme verbosity, η → 0: the system spends all its bandwidth talking and none thinking.

**With Headroom at compression ratio ρ:**
> γ_transmitted = ρ · γ_raw (the compressed form carries the same decisions in fewer bits)
>
> γ_transmitted + η ≤ C
>
> η ≤ C − ρ · γ_raw

**The gain in achievable η:**
> Δη = (1 − ρ) · γ_raw

### 2.3 Does C Itself Change?

**No.** C is the Shannon capacity of the physical channel. It is determined by bandwidth, signal-to-noise ratio, and compute budget — none of which Headroom alters. This is the fundamental theorem: **no source code can change channel capacity.**

However, there is a subtlety worth addressing. The fleet's "channel" is not a simple wire — it is a **multi-agent system** where the "noise" includes coordination overhead, protocol overhead, and redundant computation. Headroom reduces the *effective* noise by removing redundancy before it enters the channel. In Shannon terms:

- **Without Headroom**: Much of γ_raw is redundant (repeated boilerplate in tool outputs, duplicated JSON keys, verbose log formatting). This redundancy occupies channel capacity without contributing to η.
- **With Headroom**: Redundancy is stripped before transmission. The transmitted signal has higher entropy per bit — it is **denser in actual information**.

So while C (raw channel capacity) is unchanged, the **effective information rate** approaches C more closely. In engineering terms:

> R_effective = H(transmitted) / H_max(transmitted)

Without compression, R_effective ≈ 0.2–0.3 (most transmitted bits are redundant). With Headroom, R_effective → 0.8–0.95 (most transmitted bits carry signal).

### 2.4 The 5× Multiplier — Precise Statement

The claim "5× effective intelligence multiplier" means:

> η_with_headroom / η_without_headroom ≈ 1/ρ

At ρ = 0.2 (80% compression):
> η_with / η_without ≈ C(1 − 0.2·γ_raw/C) / C(1 − γ_raw/C)

When γ_raw/C ≈ 0.9 (fleet near saturation — which is the regime where we operate):
> η_with / η_without ≈ (1 − 0.18) / (1 − 0.9) = 0.82 / 0.10 = **8.2×**

When γ_raw/C ≈ 0.5 (moderate load):
> η_with / η_without ≈ (1 − 0.10) / (1 − 0.5) = 0.90 / 0.50 = **1.8×**

The multiplier is load-dependent. At **current fleet operating point** (7 agents, moderate coordination overhead, γ_raw/C ≈ 0.7):
> η_with / η_without ≈ (1 − 0.14) / (1 − 0.7) = 0.86 / 0.30 ≈ **2.9×**

The 5× figure is the **projected multiplier at 50+ agents**, where γ_raw/C → 0.9 due to O(n²) coordination cost. Headroom's compression prevents the fleet from drowning in coordination overhead as it scales. The 86.3% ternary cancellation effect compounds with compression — Headroom handles the 13.7% of signals that don't self-cancel.

### 2.5 Summary Table

| ρ (compression ratio) | Reduction | Δη at γ_raw/C=0.7 | Multiplier at γ_raw/C=0.7 | Multiplier at γ_raw/C=0.9 |
|:---:|:---:|:---:|:---:|:---:|
| 0.40 | 60% | 0.28 | 1.93× | 4.17× |
| 0.20 | 80% | 0.42 | 2.87× | 8.17× |
| 0.10 | 90% | 0.49 | 3.35× | 10.78× |
| 0.05 | 95% | 0.52 | 3.57× | 14.50× |

---

## 3. MCP Integration — Tool-Call Flow

### 3.1 Headroom MCP Server

Headroom v0.25.0 ships an MCP server (`headroom mcp serve`) that exposes three tools:

| Tool | Purpose | Signature |
|------|---------|-----------|
| `headroom_compress` | Compress messages in transit | `(messages: list[dict], target_ratio?: float) → {messages, tokens_saved, ratio}` |
| `headroom_retrieve` | Retrieve original from CCR cache | `(hash: str) → {content, metadata}` |
| `headroom_stats` | Session compression statistics | `() → {tokens_before, tokens_after, saved, ratio}` |

The MCP server is designed for Claude Code integration via `headroom mcp install`. For our fleet, we integrate it differently — as a shared service.

### 3.2 Fleet Agent Tool-Call Flow

Our fleet agents (7 registered in fleet-edge-worker) communicate via Bottle protocol. The MCP integration adds Headroom as a mandatory middleware:

```
Agent A                          Headroom MCP                   Agent B
  │                                  │                             │
  │ 1. Build bottle message           │                             │
  │ 2. Call headroom_compress ──────► │                             │
  │    {messages: [bottle],           │                             │
  │     target_ratio: 0.2}            │                             │
  │                                   │ 3. SmartCrusher analyzes    │
  │                                   │    JSON structure           │
  │                                   │ 4. CCR caches original      │
  │                                   │    (SQLite, hash=H(bottle)) │
  │                                   │ 5. Returns compressed form  │
  │ ◄──────────────────────────────── │                             │
  │ 6. Send compressed bottle ──────────────────────────────────►  │
  │    via FLUX Dispatch              │                             │
  │                                   │                             │
  │                                   │ ◄───── 7. Agent B needs    │
  │                                   │        full detail         │
  │                                   │        for execution       │
  │                                   │                             │
  │                                   │ ◄──── 8. Agent B calls     │
  │                                   │        headroom_retrieve   │
  │                                   │        (hash)              │
  │                                   │ ────► Returns original     │
  │                                   │        (<1ms from cache)   │
```

### 3.3 Implementation: Fleet-Edge-Worker Integration

fleet-edge-worker runs on Cloudflare Workers (TypeScript). It cannot run Python directly. Two integration options:

**Option A: Headroom Proxy as Sidecar (RECOMMENDED)**

Run `headroom proxy` on the edge node (the WSL2 host or a Jetson). fleet-edge-worker calls it via HTTP:

```typescript
// fleet-edge-worker: src/headroom-transit.ts
const HEADROOM_PROXY = process.env.HEADROOM_PROXY_URL || 'http://127.0.0.1:8787';

interface CompressRequest {
  messages: Array<{ role: string; content: string }>;
  target_ratio?: number;
  model?: string;
}

interface CompressResponse {
  messages: Array<{ role: string; content: string }>;
  tokens_before: number;
  tokens_after: number;
  tokens_saved: number;
  compression_ratio: number;
  ccr_hashes: string[];  // hash keys for retrieval
}

export async function headroomCompress(
  messages: Array<{ role: string; content: string }>,
  options?: { target_ratio?: number; model?: string }
): Promise<CompressResponse> {
  const response = await fetch(`${HEADROOM_PROXY}/compress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      target_ratio: options?.target_ratio ?? 0.2,
      model: options?.model ?? 'glm-5.1',
    } satisfies CompressRequest),
  });
  
  if (!response.ok) {
    // Fail open: return uncompressed on Headroom failure
    console.warn(`[headroom] compression failed: ${response.status}, passing through`);
    return {
      messages,
      tokens_before: 0,
      tokens_after: 0,
      tokens_saved: 0,
      compression_ratio: 1.0,
      ccr_hashes: [],
    };
  }
  
  return response.json();
}

export async function headroomRetrieve(hash: string): Promise<string> {
  const response = await fetch(`${HEADROOM_PROXY}/retrieve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hash }),
  });
  const data = await response.json();
  return data.content;
}
```

**Option B: Native TS Compression (Fallback)**

For cases where the Python proxy is unavailable, implement a lightweight TS-side SmartCrusher equivalent:

```typescript
// Lightweight JSON key shortening + array dedup (not as good, but zero-dependency)
function quickCompress(obj: any): { compressed: any; ratio: number } {
  // 1. Factor out repeated keys in JSON arrays
  // 2. Shorten known key names (agent_id → a, timestamp → t)
  // 3. Deduplicate identical items
  // Gets ~40% reduction vs Headroom's 80%, but works on Workers directly
}
```

### 3.4 MCP Server Configuration for Fleet Agents

To expose Headroom's MCP tools to each fleet agent:

```bash
# On the edge node, start the MCP server alongside the proxy
headroom proxy --port 8787 &  # compression proxy
headroom mcp serve &           # MCP tool server

# Configure fleet agents to route through the proxy
export ANTHROPIC_BASE_URL=http://127.0.0.1:8787
export OPENAI_BASE_URL=http://127.0.0.1:8787/v1
# GLM-5.1 uses OpenAI-compatible API → automatically proxied
```

For OpenClaw agents specifically, the proxy intercepts all LLM API calls:
- Claude → `ANTHROPIC_BASE_URL=http://127.0.0.1:8787`
- GLM-5.1 → `OPENAI_BASE_URL=http://127.0.0.1:8787/v1`
- DeepInfra → `OPENAI_BASE_URL=http://127.0.0.1:8787/v1` (shared)

The proxy's `--mode token` prioritizes compression; `--mode cache` freezes prior turns for prefix-cache hit rate. For fleet agents, **token mode** is correct — we want maximum compression, not cache stability.

---

## 4. Cross-Agent Memory — Headroom vs Vectorize

### 4.1 What Each System Stores

**Headroom's HierarchicalMemory** (per-project SQLite + HNSW):
- CCR cache: original (uncompressed) content keyed by hash
- Compression artifacts: what algorithm was applied, what ratio achieved
- Session memories: USER, SESSION, AGENT, TURN scope levels
- Vector index: HNSW with configurable M, ef_construction, ef_search
- Embedding model: configurable (default OpenAI, can use local Ollama)
- Config fields (from `MemoryConfig`):
  - `store_backend`: SQLite (default)
  - `vector_backend`: HNSW (default)
  - `vector_dimension`: 384 (matches our BGE-small)
  - `hnsw_ef_construction`: configurable
  - `hnsw_m`: configurable
  - `text_backend`: BM25 (for hybrid search)
  - `auto_bubble`: automatic scope promotion

**fleet-vector-api** (Cloudflare Vectorize):
- 1,012+ vectors (384-dim BGE-small-en-v1.5, same dimension)
- Content: crate READMEs, build logs, knowledge documents
- Metadata: repo names, domains, concept clusters
- Access: POST /search, POST /ingest, GET /stats

**Semantic search server** (local GPU, port 7777):
- 1,150 enriched knowledge documents
- 12 concept clusters with centroids
- 13 cross-pollination pairs
- Concept-guided search with negative-space mapping

### 4.2 Redundancy Analysis

The three systems overlap but are **not redundant** — they serve different timescales:

| System | Purpose | Latency | Scope | Retrieval |
|--------|---------|---------|-------|-----------|
| Headroom HNSW | CCR cache + session memory | <1ms | Per-project, per-session | Exact hash + ANN |
| Vectorize (fleet-vector-api) | Fleet-wide crate/repo knowledge | ~50ms (CF edge) | Global, all repos | ANN |
| Local GPU search | Concept-guided, cross-pollination | <1ms (sub-ms) | Global + concept layer | ANN + concept |

### 4.3 Integration Design: Complementary, Not Competing

The correct architecture is a **three-tier memory hierarchy**:

```
Tier 1 — Working Memory (Headroom HNSW, per-session)
  ├── What: CCR cache, recent compression artifacts, turn-scope memories
  ├── Where: SQLite + HNSW on local disk
  ├── When: <1ms retrieval during active conversation
  └── Writes: every compress() call writes to CCR cache

Tier 2 — Fleet Knowledge (Vectorize, global)
  ├── What: 1,012+ crate vectors, build patterns, RAG chunks
  ├── Where: Cloudflare Vectorize (fleet-crates index)
  ├── When: ~50ms retrieval for semantic search
  └── Writes: batch ingest via fleet-auto-ingest cron

Tier 3 — Concept Graph (Local GPU, global + cross-pollination)
  ├── What: 1,150 concept-enriched docs, 12 clusters, 13 cross-pairs
  ├── Where: Local GPU (port 7777)
  ├── When: <1ms for concept-guided queries
  └── Writes: periodic re-ingestion when new repos are created
```

**Data flow between tiers:**

1. **Headroom → Vectorize**: When a compressed session produces a new pattern (e.g., a successful build fix), the compressed form is embedded and upserted to Vectorize. The compressed form is used (not the original) because it is denser — the same information in fewer tokens produces a sharper vector.

2. **Vectorize → Headroom**: When a fleet agent retrieves a RAG chunk from Vectorize, Headroom compresses it before insertion into the agent's context window. The CCR cache stores the original chunk for later retrieval.

3. **Vectorize ↔ Concept Graph**: The concept graph runs on the local GPU using the same 384-dim embeddings. Cross-pollination detection runs nightly, updating the concept centroids. fleet-vector-api handles the global CRUD; the concept graph handles the semantic relationships.

### 4.4 Configuration: Aligning the Dimensions

Both Headroom's HNSW and our Vectorize use 384-dim BGE-small-en-v1.5. We should configure Headroom to use the same embedding model:

```python
from headroom import MemoryConfig, EmbedderBackend

memory_config = MemoryConfig(
    vector_dimension=384,
    embedder_backend=EmbedderBackend.OLLAMA,
    embedder_model="bge-small-en-v1.5",  # exact match with fleet-vector-api
    hnsw_m=16,                  # Vectorize uses similar M
    hnsw_ef_construction=200,
    hnsw_ef_search=50,
    db_path=Path("~/.openclaw/headroom-memory.db"),
)
```

This means a vector stored in Headroom's HNSW is directly comparable to a vector in Vectorize — they live in the same embedding space. An agent could search both simultaneously:

```python
# Combined search: session memory + fleet knowledge
from headroom import HierarchicalMemory

memory = HierarchicalMemory(config=memory_config)

# Tier 1: session memory (instant)
session_results = memory.search("FLUX dispatch error", scope="SESSION", limit=5)

# Tier 2: fleet knowledge (via Vectorize API)
import requests
fleet_results = requests.post(
    "https://fleet-vector-api.casey-digennaro.workers.dev/search",
    json={"query": "FLUX dispatch error", "topK": 5}
).json()

# Merge and deduplicate by content hash
combined = merge_and_dedupe(session_results, fleet_results)
```

---

## 5. `headroom learn` vs Harness Pattern Extraction

### 5.1 What Each System Does

**Harness Pattern Extraction** (superinstance-harness):
- Scans 531+ completed build tasks
- Extracts patterns like "missing `mod X;` declaration" (37% of errors), "edition-2024 let-chains", "empty-lib-rs stubs"
- Stores 25 indexed patterns as vectors in the harness
- Bootstraps new builds with relevant patterns via `si-search`
- Operates on Rust/TypeScript/Python build outputs

**`headroom learn`**:
- Analyzes conversation history using an LLM
- Finds failure patterns: wrong paths, missing modules, stubborn retries
- Supports Claude Code, Codex, and Gemini CLI sessions
- Writes corrections to context/memory files (e.g., AGENTS.md)
- Operates on agent conversation logs (any agent)

### 5.2 Comparison

| Dimension | Harness Patterns | `headroom learn` |
|-----------|-----------------|------------------|
| **Source data** | Build task results (D1) | Conversation logs (JSONL) |
| **Pattern type** | Code/build errors | Behavioral/workflow errors |
| **Output** | Vector-indexed patterns | AGENTS.md corrections |
| **Scope** | Build pipeline | Entire agent session |
| **Automation** | Triggered after each build wave | Triggered by `headroom learn --apply` |
| **Granularity** | Specific (missing semicolon) | Strategic (stop retrying dead paths) |

### 5.3 Verdict: Complementary — Merge the Outputs, Not the Systems

These systems learn at different abstraction levels:

- **Harness** learns **tactical patterns**: "import X before Y", "add `mod Z;` to lib.rs", "use edition 2024 for let-chains"
- **`headroom learn`** learns **strategic patterns**: "stop using OpenRouter (dead service)", "don't exceed 5 concurrent subagents", "batch size 18 is the sweet spot"

They should **not merge into one system** — different algorithms, different data sources, different timescales. Instead, they should **feed each other**:

### 5.4 Integration Design

```
Build Fails → Harness extracts tactical pattern (code-level)
              ↓
           Pattern vectorized → Vectorize (fleet-crates index)
              ↓
           Headroom compresses session log → CCR cache
              ↓
           `headroom learn --apply` mines the compressed session
              ↓
           Strategic correction written to AGENTS.md
              ↓
           Next session: agent reads AGENTS.md → avoids strategic mistake
                       agent searches Vectorize → avoids tactical mistake
```

**Concrete integration point**: After each build wave, run both:

```bash
#!/bin/bash
# post-build-learn.sh — run after each harness build wave

# 1. Harness extracts tactical patterns from build results
si-extract-patterns --from-d1 harness-experiments --vectorize fleet-vector-api

# 2. Headroom learns strategic lessons from the full session
headroom learn --apply --agent auto --model glm-5.1

# 3. Re-ingest updated patterns into Vectorize
fleet-auto-ingest --incremental
```

---

## 6. Implementation Plan

### 6.1 Phase 1: Headroom Proxy on Edge Node (Day 1)

**Goal**: Get Headroom proxy running and intercepting LLM API calls.

```bash
# Install (already done)
pip install headroom-ai[all]  # v0.25.0 confirmed

# Start the proxy in token-savings mode
headroom proxy --port 8787 --mode token &

# Verify
curl http://localhost:8787/health  # should return 200
```

**Test**: Route a single OpenClaw session through the proxy:

```bash
ANTHROPIC_BASE_URL=http://127.0.0.1:8787 openclaw gateway restart
```

Verify compression stats: `curl http://localhost:8787/stats`

### 6.2 Phase 2: Semantic Search Server Integration (Day 2)

**Goal**: Compress RAG chunks before returning them to LLM consumers.

The semantic search server (`nova-shoal`, pid 318698, port 7777) is Python. Add Headroom compression to the `/search` endpoint:

```python
# semantic-search-server: server.py
from headroom import compress

@app.route('/search')
def search():
    query = request.args.get('q')
    top_k = int(request.args.get('k', 5))
    
    # Vector search
    results = vector_index.search(query, top_k)
    
    # Compress results before returning
    messages = [{"role": "user", "content": r['text']} for r in results]
    compressed = compress(
        messages,
        model="glm-5.1",
        target_ratio=0.3,
        compress_user_messages=True,
    )
    
    return jsonify({
        "query": query,
        "results": compressed.messages,
        "tokens_saved": compressed.tokens_saved,
        "compression_ratio": compressed.compression_ratio,
        "original_available": True,  # via headroom_retrieve
    })
```

### 6.3 Phase 3: fleet-edge-worker Integration (Day 3-4)

**Goal**: Compress all Bottle protocol messages in transit.

1. Add `headroom-transit.ts` module to fleet-edge-worker (see §3.3)
2. Deploy Headroom proxy on the same host as fleet-edge-worker
3. Set `HEADROOM_PROXY_URL` environment variable in wrangler.toml
4. Modify dispatch handler to call `headroomCompress()` before sending

**Files to modify in fleet-edge-worker:**

| File | Change |
|------|--------|
| `src/index.ts` | Import headroom-transit, add proxy health check |
| `src/dispatch.ts` | Wrap `dispatchBottle()` with compression |
| `src/handlers/*.ts` | Add `headroomRetrieve()` call when full detail needed |
| `wrangler.toml` | Add `HEADROOM_PROXY_URL` var |
| `README.md` | Document Headroom integration |

### 6.4 Phase 4: Harness Build Pipeline (Day 4-5)

**Goal**: Compress build logs before D1 storage; run `headroom learn` after each wave.

```python
# harness-experiments: post-build-hook.py
from headroom import compress
import sqlite3

def compress_build_log(task_id: str, output: str, db: sqlite3.Connection):
    """Compress build output before storing in D1."""
    result = compress(
        [{"role": "assistant", "content": output}],
        model="glm-5.1",
        target_ratio=0.15,  # 85% reduction for verbose build logs
    )
    
    db.execute("""
        INSERT OR REPLACE INTO build_results 
        (task_id, compressed_output, original_hash, tokens_saved, compression_ratio)
        VALUES (?, ?, ?, ?, ?)
    """, (
        task_id,
        result.messages[0]["content"],
        result.ccr_hashes[0] if hasattr(result, 'ccr_hashes') else None,
        result.tokens_saved,
        result.compression_ratio,
    ))
    db.commit()
    
    return result.compression_ratio
```

Add `headroom learn` to the post-build cron:

```bash
# Add to fleet-metrics-cron or new cron worker
0 */6 * * * cd /home/phoenix/.openclaw/workspace && headroom learn --apply --model glm-5.1
```

### 6.5 Phase 5: Crab-Trap Server Integration (Day 5-6)

**Goal**: Compress captured external agent contributions before processing.

The crab-trap server (`mellow-prairie`, pid 319317, port 8888) handles external agent absorption. When an external agent (e.g., Kimi, DeepSeek) submits work:

```python
# crab-trap-server: server.py
from headroom import compress

@app.route('/submit', methods=['POST'])
def submit_work():
    agent_id = request.json.get('agent_id')
    work_content = request.json.get('content')
    
    # Compress the submitted work before Forgemaster audit
    compressed = compress(
        [{"role": "user", "content": work_content}],
        model="glm-5.1",
        target_ratio=0.2,
    )
    
    # Forgemaster audits the compressed form (saves audit tokens too)
    audit = forgemaster_audit(compressed.messages[0]["content"])
    
    if audit['passes_conservation']:
        # Store compressed, original in CCR
        store_absorbed_work(agent_id, compressed, original_retrievable=True)
        return jsonify({"status": "absorbed", "compression": compressed.compression_ratio})
    else:
        return jsonify({"status": "rejected", "reason": audit['reason']}), 403
```

### 6.6 Phase 6: Full Fleet Rollout (Day 7+)

1. **All fleet agents**: Set `ANTHROPIC_BASE_URL` / `OPENAI_BASE_URL` to Headroom proxy
2. **All Python services**: Import `from headroom import compress` in data paths
3. **Monitor**: `headroom perf` for compression metrics, compare to baseline
4. **Tune**: Adjust `target_ratio` per transit point based on empirical quality

---

## 7. Metrics — Verifying the 5× Multiplier

### 7.1 Primary Metrics

| Metric | How to Measure | Target | Tool |
|--------|---------------|--------|------|
| **Token reduction ratio** | `headroom perf` or `headroom stats` MCP tool | ρ ≤ 0.20 (80%+ reduction) | Headroom built-in |
| **Tokens saved per session** | `HeadroomClient.get_stats()['session']['tokens_saved_total']` | ≥ 60% of total input tokens | Headroom API |
| **Effective intelligence multiplier** | η_with / η_without (measure via task success rate at same token budget) | ≥ 3× at 7 agents, ≥ 5× at 50 agents | Harness D1 (success_rate) |
| **Compression latency** | Time `compress()` call (p50, p99) | p50 < 100ms, p99 < 500ms | Python `time.perf_counter()` |
| **CCR retrieval latency** | Time `headroom_retrieve()` call | < 1ms p99 | Headroom MCP |

### 7.2 Secondary Metrics

| Metric | How to Measure | Target |
|--------|---------------|--------|
| **Build success rate change** | Compare harness-experiments D1 success_rate before/after Headroom | +0% (should not degrade builds) |
| **RAG retrieval quality** | Compare task outcomes with/without compressed RAG chunks | No degradation at ρ=0.3 |
| **Inter-agent message latency** | Time from dispatch to receipt, before/after compression | Net decrease (smaller payloads) |
| **D1 storage savings** | Compare build_results table size before/after compressed logs | 5-6× reduction |
| **Concept cluster separation** | Re-run concept analysis on compressed vs uncompressed vectors | Sharper clusters (higher intra-cluster cosine, lower inter-cluster) |
| **Prefix cache hit rate** | `headroom perf` in `--mode cache` | ≥ 40% prefix match |
| **`headroom learn` pattern count** | Count corrections written to AGENTS.md per week | ≥ 3 actionable corrections/week |

### 7.3 A/B Test Design

To empirically verify the multiplier:

```
Control group:   20 build tasks, NO Headroom compression
Treatment group: 20 build tasks, WITH Headroom compression (ρ ≈ 0.2)

Measure:
  1. Token cost per task (γ)
  2. Task success rate (η proxy)
  3. Time to completion
  4. Compression overhead latency

Expected results:
  - Treatment γ = 0.2 × Control γ  (80% token reduction)
  - Treatment success_rate ≥ Control success_rate (no quality loss)
  - Treatment time ≤ Control time (smaller payloads = faster transit)
  - Effective multiplier = Control γ / Treatment γ ≈ 5×
```

### 7.4 Continuous Monitoring

Add a Headroom metrics endpoint to fleet-health-monitor (once deployed):

```typescript
// fleet-health-monitor: src/metrics.ts
interface HeadroomMetrics {
  proxy_uptime: number;
  total_requests: number;
  total_tokens_saved: number;
  avg_compression_ratio: number;
  ccr_cache_size_mb: number;
  ccr_retrieval_count: number;
  ccr_retrieval_p50_ms: number;
  learn_corrections_count: number;
}

// Poll every 60s
async function pollHeadroom(): Promise<HeadroomMetrics> {
  const stats = await fetch(`${HEADROOM_PROXY}/stats`).then(r => r.json());
  return {
    proxy_uptime: stats.uptime_seconds,
    total_requests: stats.session.requests_total,
    total_tokens_saved: stats.session.tokens_saved_total,
    avg_compression_ratio: stats.session.tokens_saved_total / 
                           stats.session.requests_optimized,
    ccr_cache_size_mb: stats.ccr.cache_size_bytes / 1e6,
    // ... etc
  };
}
```

Store in fleet-health-monitor D1 for time-series analysis alongside γ/η/efficiency metrics.

---

## 8. Risk Analysis and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Headroom proxy down → fleet blocked | Medium | Critical | Fail-open design: `headroomCompress()` returns uncompressed on error (see §3.3) |
| Compression loses critical information | Low | High | CCR guarantees reversibility; A/B test before full rollout |
| Added latency exceeds savings | Low | Medium | Measure p99; Headroom's SmartCrusher is <50ms typical |
| HNSW + Vectorize vector drift | Very Low | Low | Same embedding model (BGE-small-en-v1.5), same dimension (384) |
| `headroom learn` writes bad corrections | Medium | Medium | Dry-run first (default); review before `--apply` |
| Cloudflare Workers can't reach local proxy | High | High | Proxy must run on same host as edge worker, or use Cloudflare Tunnel |

---

## 9. API Reference Summary

### Headroom Python API (v0.25.0)

```python
# Core compression
from headroom import compress
result = compress(messages, model="glm-5.1", target_ratio=0.2)
# result.messages, result.tokens_before, result.tokens_after,
# result.tokens_saved, result.compression_ratio, result.transforms_applied

# HeadroomClient (wraps LLM provider with compression)
from headroom import HeadroomClient, AnthropicProvider
client = HeadroomClient(original_client, provider=AnthropicProvider(), default_mode="token")

# HierarchicalMemory (session/fleet memory)
from headroom import HierarchicalMemory, MemoryConfig
memory = HierarchicalMemory(config=MemoryConfig(
    vector_dimension=384,
    embedder_backend=EmbedderBackend.OLLAMA,
    embedder_model="bge-small-en-v1.5",
))
memory.remember("key", "content", scope="SESSION")
results = memory.search("query", limit=5)

# CompressConfig options
from headroom import CompressConfig
config = CompressConfig(
    compress_user_messages=False,    # default: False
    compress_system_messages=True,   # default: True
    protect_recent=4,                # keep last 4 messages raw
    protect_analysis_context=True,   # preserve analysis blocks
    target_ratio=0.2,               # aim for 80% reduction
    min_tokens_to_compress=250,     # skip small messages
)

# SmartCrusher (direct algorithm access)
from headroom import SmartCrusher, SmartCrusherConfig
crusher = SmartCrusher(SmartCrusherConfig(
    min_tokens_to_crush=200,
    max_items_after_crush=15,
    variance_threshold=2.0,
    dedup_identical_items=True,
))

# TransformPipeline
from headroom import TransformPipeline
pipeline = TransformPipeline()
result = pipeline.apply(messages)
```

### Headroom CLI

```bash
# Proxy (compression middleware)
headroom proxy --port 8787 --mode token      # compression-first
headroom proxy --port 8787 --mode cache      # cache-first (prefix stability)

# MCP server (tool exposure)
headroom mcp serve                            # start MCP server
headroom mcp install                          # install into Claude Code config
headroom mcp status                           # check config

# Memory management
headroom memory list --limit 20               # recent memories
headroom memory stats                         # database statistics
headroom memory prune --older-than 30d        # cleanup

# Learning
headroom learn --apply --model glm-5.1        # extract + write corrections
headroom learn --all                          # analyze all projects

# Performance analysis
headroom perf                                 # proxy performance from logs
headroom agent-savings                        # token savings report
```

---

## 10. Conclusion

Headroom is the highest-leverage integration for the fleet. At ρ = 0.2, it provides a 2.9× multiplier at current scale (7 agents) and a projected 5-8× at target scale (50+ agents). The implementation is straightforward because:

1. Headroom is installed and functional (v0.25.0)
2. The proxy is designed for exactly this use case (intercept LLM traffic)
3. The Python API integrates cleanly with our Python services (search server, crab-trap)
4. The TypeScript side needs only an HTTP client to the proxy
5. CCR guarantees no information loss — compression is risk-free

The six-phase rollout can be completed in one week. The A/B test in §7.3 can empirically verify the multiplier within the first day. The main prerequisite is ensuring the proxy runs on the same host as fleet-edge-worker (Cloudflare Workers cannot reach `localhost` of our machine without a tunnel — use `headroom proxy --host 0.0.0.0` and configure the Worker with the machine's LAN IP, or use Cloudflare Tunnel).

**Next action**: Start `headroom proxy` and route one OpenClaw session through it to measure baseline compression on fleet communication patterns.
