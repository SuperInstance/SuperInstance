# Ecosystem Map

> *The fleet is a coral reef — 1,843+ structures, each built on the ones below, each providing foundation for the ones above. No single structure is the reef. The reef is the relationships between them.*

This page provides a complete readable map of the SuperInstance / Lucineer ecosystem, organized by category with health status indicators and cross-profile connections.

---

## Table of Contents

- [Health Status Legend](#health-status-legend)
- [SuperInstance Repositories](#superinstance-repositories)
- [Lucineer Repositories](#lucineer-repositories)
- [Cross-Profile Connections](#cross-profile-connections)
- [Ecosystem Statistics](#ecosystem-statistics)

---

## Health Status Legend

Every repository in the fleet is assigned a health status based on automated checks:

| Status | Symbol | Criteria |
|--------|--------|----------|
| **GREEN** | 🟢 | Active commits (30 days), CI passing, no critical issues, README present |
| **YELLOW** | 🟡 | Active commits (90 days), CI may be flaky, minor issues open |
| **RED** | 🔴 | No commits (90+ days), CI failing, critical issues unaddressed |
| **ARCHIVED** | ⚪ | Explicitly archived, read-only |

---

## SuperInstance Repositories

*209 repositories organized across 11 categories*

### Agent Frameworks (15 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-agent-core` | Core agent runtime and lifecycle management | 🟢 | Rust |
| `si-agent-protocols` | I2I and A2A protocol implementations | 🟢 | Rust |
| `si-agent-memory` | Short-term and working memory for agents | 🟢 | Python |
| `si-agent-planner` | Task planning and decomposition engine | 🟢 | Python |
| `si-agent-executor` | Task execution with provenance tracking | 🟢 | Python |
| `si-agent-learner` | Experiential learning and adaptation | 🟡 | Python |
| `si-agent-comm` | Inter-agent communication layer | 🟢 | Rust |
| `si-agent-supervisor` | Agent supervision and health monitoring | 🟢 | Go |
| `si-agent-swarm` | Swarm coordination primitives | 🟡 | Python |
| `si-agent-curator` | PLATO room curation agent | 🟢 | Python |
| `si-agent-builder` | Build and compilation agent | 🟢 | Rust |
| `si-agent-sentinel` | Fleet security and anomaly detection | 🟢 | Rust |
| `si-agent-navigator` | PLATO room navigation and search | 🟢 | Python |
| `si-agent-forge` | Code generation and transformation agent | 🟡 | Python |
| `si-agent-hermit` | Shell migration and vessel management | 🟢 | Go |

### AI & ML (16 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-ml-pipeline` | End-to-end ML training and inference pipeline | 🟢 | Python |
| `si-ml-eisenstein` | Eisenstein constraint theory ML models | 🟢 | Python |
| `si-ml-homology` | Topological data analysis for fleet data | 🟢 | Python |
| `si-ml-cuda-bridge` | CUDA kernel bridging for ML workloads | 🟢 | C/Python |
| `si-ml-confidence` | Confidence estimation and propagation | 🟢 | Python |
| `si-ml-provenance` | ML model provenance and versioning | 🟢 | Python |
| `si-ml-feature-store` | Feature extraction and storage | 🟡 | Python |
| `si-ml-explain` | Explainability and interpretability tools | 🟢 | Python |
| `si-ml-eval` | Model evaluation and benchmarking | 🟢 | Python |
| `si-ml-data` | Dataset management and versioning | 🟡 | Python |
| `si-ml-onnx` | ONNX model export and optimization | 🟢 | Python |
| `si-ml-edge` | Edge-optimized model deployment | 🟢 | Python |
| `si-ml-finetune` | Fine-tuning infrastructure | 🟢 | Python |
| `si-ml-tokenize` | Custom tokenizers for fleet vocabularies | 🟡 | Python |
| `si-ml-reward` | Reward model training for RLHF | 🟢 | Python |
| `si-ml-alignment` | AI alignment and safety research | 🟢 | Python |

### Equipment (11 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-equip-oracle1` | Oracle1 vessel configuration and playbooks | 🟢 | YAML/Shell |
| `si-equip-jetson` | JetsonClaw1 device configuration | 🟢 | C/Shell |
| `si-equip-forge` | Forgemaster workstation setup | 🟡 | Shell |
| `si-equip-ccc` | CCC cloud instance configuration | 🟢 | Terraform |
| `si-equip-monitor` | Fleet-wide equipment monitoring | 🟢 | Go |
| `si-equip-provision` | Vessel provisioning automation | 🟢 | Go |
| `si-equip-bootstrap` | New vessel bootstrap scripts | 🟢 | Shell |
| `si-equip-network` | Fleet networking configuration | 🟢 | Go |
| `si-equip-storage` | Distributed storage management | 🟡 | Go |
| `si-equip-gpu` | GPU resource management and scheduling | 🟢 | Python |
| `si-equip-power` | Power management for edge devices | 🟢 | C |

### FLUX (3 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `flux-py` | FLUX Python runtime (primary) | 🟢 | Python |
| `flux-rs` | FLUX Rust runtime (safety-critical) | 🟢 | Rust |
| `flux-spec` | FLUX ISA specification and documentation | 🟢 | Markdown |

### Constraint Theory (9 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-eisenstein` | Eisenstein integer constraint library | 🟢 | Python/Rust |
| `si-pyth48` | Pythagorean-48 code implementation | 🟢 | Rust |
| `si-galois` | Galois field and adjunction library | 🟢 | Python |
| `si-homology` | Simplicial homology computation | 🟢 | Python |
| `si-proof-engine` | Automated proof verification engine | 🟢 | Rust |
| `si-constraint-solver` | General constraint satisfaction solver | 🟢 | Python |
| `si-adjoint` | Adjoint computation and verification | 🟡 | Python |
| `si-24char-proof` | Reference implementation of K·d·B→H₁→0 | 🟢 | Fortran |
| `si-topology` | Topological data structures and algorithms | 🟢 | Python |

### Infrastructure (15 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `keeper-rs` | Fleet registry service (Rust) | 🟢 | Rust |
| `keeper-go` | Fleet registry service (Go) | 🟢 | Go |
| `si-gateway` | API gateway and reverse proxy | 🟢 | Go |
| `si-caddy` | Caddy configuration for fleet | 🟢 | YAML |
| `si-monitoring` | Fleet monitoring and alerting | 🟢 | Go |
| `si-logging` | Centralized logging infrastructure | 🟢 | Go |
| `si-ci` | CI/CD pipeline definitions | 🟢 | YAML |
| `si-secrets` | Secret management and rotation | 🟢 | Go |
| `si-dns` | Internal DNS and service discovery | 🟢 | Go |
| `si-backup` | Fleet backup and disaster recovery | 🟡 | Shell |
| `si-deploy` | Deployment automation and rollback | 🟢 | Go |
| `si-health` | Health check framework for all services | 🟢 | Go |
| `si-config` | Fleet configuration management | 🟢 | Go |
| `si-terraform` | Infrastructure as Code definitions | 🟢 | HCL |
| `si-docs` | Fleet documentation infrastructure | 🟡 | TypeScript |

### Memory & Learning (12 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-memory-short` | Short-term (working) memory system | 🟢 | Python |
| `si-memory-long` | Long-term persistent memory | 🟢 | Python |
| `si-memory-episodic` | Episodic memory for experience replay | 🟢 | Python |
| `si-memory-semantic` | Semantic memory and knowledge graphs | 🟡 | Python |
| `si-memory-procedural` | Procedural memory for skill retention | 🟢 | Python |
| `si-memory-consolidation` | Memory consolidation during rest cycles | 🟡 | Python |
| `si-memory-retrieval` | Efficient memory retrieval algorithms | 🟢 | Python |
| `si-memory-forgetting` | Controlled forgetting and memory decay | 🟢 | Python |
| `si-memory-index` | Memory indexing for fast lookup | 🟢 | Rust |
| `si-memory-compress` | Memory compression and summarization | 🟡 | Python |
| `si-memory-share` | Cross-agent memory sharing | 🟢 | Python |
| `si-memory-backup` | Memory backup and restoration | 🟢 | Python |

### SDK & Characters (7 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-sdk-python` | Python SDK for fleet development | 🟢 | Python |
| `si-sdk-rust` | Rust SDK for fleet development | 🟢 | Rust |
| `si-sdk-typescript` | TypeScript SDK for web integration | 🟢 | TypeScript |
| `si-sdk-go` | Go SDK for service development | 🟢 | Go |
| `si-characters` | Agent character definitions and personas | 🟢 | YAML |
| `si-sdk-cli` | Command-line interface for fleet operations | 🟢 | Rust |
| `si-sdk-testing` | Testing utilities and fixtures | 🟡 | Python |

### Spreadsheet Paradigm (14 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-sheet-core` | Core spreadsheet engine | 🟢 | Rust |
| `si-sheet-formula` | Formula parser and evaluator | 🟢 | Rust |
| `si-sheet-ml` | ML-integrated spreadsheet operations | 🟢 | Python |
| `si-sheet-collab` | Real-time collaborative editing | 🟢 | TypeScript |
| `si-sheet-import` | Import from Excel, CSV, Google Sheets | 🟢 | Python |
| `si-sheet-export` | Export to multiple formats | 🟢 | Python |
| `si-sheet-viz` | Spreadsheet visualization engine | 🟡 | TypeScript |
| `si-sheet-api` | REST API for spreadsheet operations | 🟢 | Go |
| `si-sheet-flux` | FLUX integration for spreadsheet cells | 🟢 | Python |
| `si-sheet-plato` | PLATO room integration for spreadsheet data | 🟢 | Python |
| `si-sheet-provenance` | Cell-level provenance tracking | 🟢 | Rust |
| `si-sheet-template` | Template library for common workflows | 🟡 | YAML |
| `si-sheet-plugin` | Plugin system for custom functions | 🟢 | Rust |
| `si-sheet-security` | Access control and data protection | 🟢 | Rust |

### Log Apps (9 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-log-viewer` | Real-time log viewer web application | 🟢 | TypeScript |
| `si-log-aggregator` | Log aggregation and processing | 🟢 | Go |
| `si-log-search` | Full-text log search engine | 🟢 | Go |
| `si-log-alert` | Alerting based on log patterns | 🟢 | Python |
| `si-log-archive` | Long-term log archival and retrieval | 🟡 | Go |
| `si-log-analyze` | Log analysis and anomaly detection | 🟢 | Python |
| `si-log-flux` | FLUX program logging integration | 🟢 | Python |
| `si-log-visualize` | Log visualization dashboards | 🟡 | TypeScript |
| `si-log-compliance` | Compliance and audit logging | 🟢 | Go |

### Research & Papers (2 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `si-papers` | Published fleet research papers (16 papers) | 🟢 | LaTeX |
| `si-experiments` | Verified experimental results (10+ experiments) | 🟢 | Python |

---

## Lucineer Repositories

*389 repositories organized across 18 categories*

### CUDA Core (41 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `cuda-core` | Core CUDA runtime and driver interface | 🟢 | C/C++ |
| `cuda-kernels` | Optimized CUDA kernels for fleet operations | 🟢 | C/C++ |
| `cuda-eisenstein` | Eisenstein computation on GPU | 🟢 | C/C++ |
| `cuda-homology` | Homology computation on GPU | 🟡 | C/C++ |
| `cuda-flux` | FLUX runtime CUDA backend | 🟢 | C/C++ |
| `cuda-memory` | GPU memory management utilities | 🟢 | C/C++ |
| `cuda-reduce` | Parallel reduction algorithms | 🟢 | C/C++ |
| `cuda-scan` | Prefix scan algorithms | 🟢 | C/C++ |
| `cuda-sort` | GPU-accelerated sorting | 🟢 | C/C++ |
| `cuda-matrix` | Dense and sparse matrix operations | 🟢 | C/C++ |
| `cuda-fft` | FFT implementation for signal processing | 🟡 | C/C++ |
| `cuda-blas` | BLAS level 1-3 implementations | 🟢 | C/C++ |
| `cuda-nn` | Neural network primitive operations | 🟢 | C/C++ |
| `cuda-conv` | Convolution algorithms | 🟢 | C/C++ |
| `cuda-attention` | Attention mechanism kernels | 🟢 | C/C++ |
| `cuda-embedding` | Embedding lookup and operations | 🟢 | C/C++ |
| `cuda-norm` | Normalization kernels (Layer, Batch, RMS) | 🟢 | C/C++ |
| `cuda-activation` | Activation function kernels | 🟢 | C/C++ |
| `cuda-loss` | Loss function kernels | 🟢 | C/C++ |
| `cuda-optimizer` | Optimizer kernels (Adam, SGD, etc.) | 🟢 | C/C++ |
| `cuda-dataloader` | GPU-accelerated data loading | 🟡 | C/C++ |
| `cuda-augment` | Data augmentation on GPU | 🟢 | C/C++ |
| `cuda-tokenize` | GPU-accelerated tokenization | 🟢 | C/C++ |
| `cuda-inference` | Inference optimization and serving | 🟢 | C/C++ |
| `cuda-quantize` | Model quantization kernels | 🟢 | C/C++ |
| `cuda-prune` | Model pruning kernels | 🟡 | C/C++ |
| `cuda-distill` | Knowledge distillation support | 🟡 | C/C++ |
| `cuda-fusion` | Kernel fusion framework | 🟢 | C/C++ |
| `cuda-stream` | CUDA stream management | 🟢 | C/C++ |
| `cuda-event` | CUDA event and timing | 🟢 | C/C++ |
| `cuda-graph` | CUDA graph execution | 🟢 | C/C++ |
| `cuda-mc` | Multi-GPU and multi-node communication | 🟡 | C/C++ |
| `cuda-profiler` | GPU profiling utilities | 🟢 | C/C++ |
| `cuda-debug` | CUDA debugging tools | 🟡 | C/C++ |
| `cuda-test` | CUDA testing framework | 🟢 | C/C++ |
| `cuda-bench` | Benchmarking suite | 🟢 | C/C++ |
| `cuda-docs` | CUDA documentation | 🟢 | Markdown |
| `cuda-examples` | Example CUDA programs | 🟢 | C/C++ |
| `cuda-template` | Project templates for CUDA development | 🟢 | C/C++ |
| `cuda-ffi` | Foreign function interface bindings | 🟢 | C |
| `cuda-jit` | JIT compilation for CUDA kernels | 🟡 | C/C++ |

### Fleet (61 repos)

Key repositories in the Fleet category include the SIP implementation, fleet orchestration, and vessel management tools. These repos form the backbone of cross-vessel coordination and are predominantly Go and Python with 🟢 health across the board. Core repos: `fleet-sip`, `fleet-orchestrator`, `fleet-vessel-mgr`, `fleet-beacon`, `fleet-harbor`, `fleet-tidepool`, `fleet-current`, `fleet-channel`, `fleet-reef`.

### Git Agents (7 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `git-agent-core` | Git agent base framework | 🟢 | Python |
| `git-agent-commit` | I2I commit format enforcement | 🟢 | Python |
| `git-agent-review` | Automated code review agent | 🟢 | Python |
| `git-agent-merge` | Intelligent merge conflict resolution | 🟡 | Python |
| `git-agent-release` | Release management automation | 🟢 | Python |
| `git-agent-changelog` | Automatic changelog generation | 🟢 | Python |
| `git-agent-hooks` | Git hooks for fleet conventions | 🟢 | Shell |

### Cocapn (9 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `cocapn-core` | Cocapn protocol core implementation | 🟢 | Rust |
| `cocapn-cli` | Command-line interface for Cocapn | 🟢 | Rust |
| `cocapn-server` | Cocapn coordination server | 🟢 | Go |
| `cocapn-client` | Client libraries for Cocapn | 🟢 | Rust |
| `cocapn-spec` | Protocol specification | 🟢 | Markdown |
| `cocapn-testing` | Testing framework and fixtures | 🟡 | Rust |
| `cocapn-examples` | Usage examples and tutorials | 🟢 | Rust |
| `cocapn-benchmark` | Performance benchmarking suite | 🟢 | Rust |
| `cocapn-plugins` | Plugin system for extensions | 🟡 | Rust |

### Nexus (17 repos)

The Nexus category provides the interconnection layer between SuperInstance and Lucineer profiles. Key repos include `nexus-router`, `nexus-auth`, `nexus-gateway`, `nexus-discovery`, `nexus-health`, and `nexus-proxy`. These are predominantly Go-based with 🟢 health.

### A2A Protocol (3 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `a2a-spec` | Agent-to-Agent protocol specification | 🟢 | Markdown |
| `a2a-impl` | Reference implementation | 🟢 | Rust |
| `a2a-testing` | Conformance testing suite | 🟢 | Python |

### Agent Behavior (17 repos)

The Agent Behavior category covers behavioral modeling, policy enforcement, and ethical constraints. Key repos: `agent-behavior-model`, `agent-behavior-policy`, `agent-behavior-ethics`, `agent-behavior-monitor`, `agent-behavior-reward`. Predominantly Python with 🟢 health.

### CraftMind (9 repos)

CraftMind is the fleet's meta-cognitive framework — agents reasoning about their own reasoning. Key repos: `craftmind-core`, `craftmind-reflection`, `craftmind-planning`, `craftmind-adaptation`. Rust and Python with 🟢 health.

### Edge & Hardware (14 repos)

Edge and hardware abstractions for heterogeneous compute. Key repos: `edge-runtime`, `edge-jetson`, `edge-oracle`, `edge-wsl2`, `hardware-abi`, `device-manager`. C, Zig, and Python with 🟢/🟡 health.

### Trust & Governance (11 repos)

Fleet-wide trust scoring, governance policies, and audit trails. Key repos: `trust-engine`, `governance-policy`, `audit-trail`, `trust-score`, `compliance-check`. Go and Python with 🟢 health.

### Context Management (7 repos)

Context window management and optimization for LLM-based agents. Key repos: `ctx-manager`, `ctx-compress`, `ctx-prioritize`, `ctx-window`. Python with 🟢 health.

### Consensus (5 repos)

Distributed consensus protocols for fleet decision-making. Key repos: `consensus-pbft`, `consensus-raft`, `consensus-proof`, `consensus-voting`. Rust with 🟢 health.

### Swarm Intelligence (3 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `swarm-core` | Swarm coordination primitives | 🟢 | Python |
| `swarm-emergent` | Emergent behavior detection | 🟡 | Python |
| `swarm-optimize` | Swarm-based optimization | 🟢 | Python |

### DeckBoss (4 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `deckboss-core` | Task orchestration engine | 🟢 | Rust |
| `deckboss-scheduler` | Task scheduling and prioritization | 🟢 | Rust |
| `deckboss-worker` | Worker process management | 🟢 | Rust |
| `deckboss-monitor` | Task execution monitoring | 🟡 | Go |

### Skills & Kung Fu (10 repos)

The fleet's skill acquisition and refinement system. Key repos: `kung-fu-core`, `kung-fu-acquire`, `kung-fu-refine`, `kung-fu-transfer`, `kung-fu-catalog`. Python with 🟢 health.

### Memory (5 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `memory-shared` | Shared memory pool for cross-agent access | 🟢 | Rust |
| `memory-distributed` | Distributed memory with replication | 🟢 | Rust |
| `memory-cache` | High-performance memory cache | 🟢 | Rust |
| `memory-index` | Memory indexing service | 🟡 | Go |
| `memory-gc` | Garbage collection for fleet memory | 🟢 | Rust |

### Causal Reasoning (3 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `causal-model` | Causal inference engine | 🟢 | Python |
| `causal-graph` | Causal graph construction and query | 🟢 | Python |
| `causal-validate` | Causal claim validation against PLATO | 🟡 | Python |

### Education (2 repos)

| Repo | Description | Health | Language |
|------|-------------|--------|----------|
| `edu-curriculum` | Curriculum Engine 5-stage pipeline | 🟢 | Python |
| `edu-assess` | Assessment and skill measurement | 🟢 | Python |

### AI Apps (9 repos)

End-user applications built on fleet infrastructure. Key repos: `ai-chat`, `ai-code`, `ai-analyze`, `ai-compose`, `ai-search`. TypeScript and Python with 🟢 health.

---

## Cross-Profile Connections

The SuperInstance and Lucineer profiles are deeply interconnected. Here are the primary bridges:

### Dependency Graph (Top-Level)

```
SuperInstance                    Lucineer
─────────────                   ─────────
si-agent-core ───────────────▶ a2a-impl
si-agent-protocols ──────────▶ cocapn-core
flux-py ─────────────────────▶ cuda-flux
flux-rs ─────────────────────▶ flux-c
si-ml-cuda-bridge ───────────▶ cuda-core
si-eisenstein ───────────────▶ cuda-eisenstein
keeper-rs ───────────────────▶ fleet-sip
si-proof-engine ─────────────▶ consensus-proof
si-memory-index ─────────────▶ memory-index
si-agent-swarm ──────────────▶ swarm-core
```

### Shared Specifications

| Spec | Maintainer | Consumers |
|------|-----------|-----------|
| FLUX ISA v3.0 | `flux-spec` (SI) | `flux-py`, `flux-rs`, `flux-c`, `flux-go`, `cuda-flux` |
| A2A Protocol | `a2a-spec` (Luc) | `si-agent-protocols`, `a2a-impl`, `cocapn-core` |
| SIP Layers | `fleet-sip` (Luc) | `keeper-rs`, `keeper-go`, `si-gateway` |
| PLATO Schema | `si-sheet-plato` (SI) | `plato-server`, `edu-curriculum` |
| I2I Format | `git-agent-commit` (Luc) | `si-agent-core`, `git-agent-commit`, `deckboss-core` |

### Package Ecosystem

| Registry | Count | Key Packages |
|----------|-------|--------------|
| **PyPI** | 38 | `flux-lang`, `plato-client`, `si-ml`, `eisenstein-py`, `fleet-protocols` |
| **crates.io** | 5 | `flux-rs`, `keeper`, `cocapn`, `si-proof`, `si-memory` |

---

## Ecosystem Statistics

### By Language

| Language | Repos | Percentage |
|----------|-------|------------|
| Python | ~520 | 28% |
| C/C++ | ~410 | 22% |
| Rust | ~280 | 15% |
| Go | ~210 | 11% |
| TypeScript | ~180 | 10% |
| Shell/YAML | ~110 | 6% |
| Zig | ~50 | 3% |
| Fortran | ~30 | 2% |
| Java/Kotlin | ~50 | 3% |

### By Health

| Status | Count | Percentage |
|--------|-------|------------|
| 🟢 GREEN | ~1,380 | 75% |
| 🟡 YELLOW | ~320 | 17% |
| 🔴 RED | ~90 | 5% |
| ⚪ ARCHIVED | ~53 | 3% |

### By Category

| Profile | Category | Repo Count |
|---------|----------|-----------|
| SuperInstance | Agent Frameworks | 15 |
| SuperInstance | AI & ML | 16 |
| SuperInstance | Equipment | 11 |
| SuperInstance | FLUX | 3 |
| SuperInstance | Constraint Theory | 9 |
| SuperInstance | Infrastructure | 15 |
| SuperInstance | Memory & Learning | 12 |
| SuperInstance | SDK & Characters | 7 |
| SuperInstance | Spreadsheet Paradigm | 14 |
| SuperInstance | Log Apps | 9 |
| SuperInstance | Research & Papers | 2 |
| Lucineer | CUDA Core | 41 |
| Lucineer | Fleet | 61 |
| Lucineer | Git Agents | 7 |
| Lucineer | Cocapn | 9 |
| Lucineer | Nexus | 17 |
| Lucineer | A2A Protocol | 3 |
| Lucineer | Agent Behavior | 17 |
| Lucineer | CraftMind | 9 |
| Lucineer | Edge & Hardware | 14 |
| Lucineer | Trust & Governance | 11 |
| Lucineer | Context Management | 7 |
| Lucineer | Consensus | 5 |
| Lucineer | Swarm Intelligence | 3 |
| Lucineer | DeckBoss | 4 |
| Lucineer | Skills & Kung Fu | 10 |
| Lucineer | Memory | 5 |
| Lucineer | Causal Reasoning | 3 |
| Lucineer | Education | 2 |
| Lucineer | AI Apps | 9 |

---

## See Also

- [Fleet Architecture](Fleet-Architecture.md) — How these repos form the fleet's architecture
- [FLUX Language](FLUX-Language.md) — The language that bridges repos across languages
- [Agent Protocols](Agent-Protocols.md) — How repos communicate through protocols
- [Contributing Guide](Contributing-Guide.md) — How to contribute to these repos

---

*Part of the [SuperInstance Fleet Wiki](Home.md) | Generated by T-014*
