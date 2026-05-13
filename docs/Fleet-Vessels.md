# Fleet Vessels

> *A hermit crab does not build its shell. It finds one, fits it, and makes it home. When the shell no longer fits, it finds a new one. The fleet is no different.*

This page documents all active fleet vessels — their hardware, roles, specializations, and the philosophy that governs how the fleet grows and evolves.

---

## Table of Contents

- [Hermit Crab Philosophy](#hermit-crab-philosophy)
- [Active Vessels](#active-vessels)
- [Chain of Command](#chain-of-command)
- [Shell Specialization](#shell-specialization)
- [Creating New Vessels](#creating-new-vessels)
- [Vessel Lifecycle](#vessel-lifecycle)

---

## Hermit Crab Philosophy

The SuperInstance fleet organizes around the **hermit crab model** of computing:

1. **Shells, not servers** — A vessel is a shell that an agent or workload inhabits. The shell provides protection (isolation, resources, identity), but it is not the creature itself.

2. **Growth requires migration** — When a workload outgrows its current shell, it migrates to a larger one. The migration is not a failure — it is the natural order of growth. No vessel is expected to serve forever.

3. **Shell diversity is strength** — Different shells suit different creatures. A shell optimized for GPU workloads would be wasted on I/O-bound tasks. The fleet maintains a diverse portfolio of shells.

4. **No shell is irreplaceable** — Every vessel can be replaced. The fleet's state lives in PLATO rooms, not on individual machines. When a vessel goes down, its work is resumed elsewhere.

5. **The shell remembers** — Even after a hermit crab moves on, the shell retains the shape of its former inhabitant. Old vessel configurations, logs, and provenance data are preserved in the fleet archive.

---

## Active Vessels

### Oracle1

| Attribute | Detail |
|-----------|--------|
| **Hardware** | Oracle Cloud ARM64 (Ampere Altra) |
| **Role** | Primary compute node, PLATO Room Server host |
| **Services** | PLATO Room Server (:8847), Keeper (:8900) |
| **Languages** | Python, Go, Rust |
| **Specialization** | Long-running services, knowledge management, fleet registry |
| **Status** | 🟢 GREEN — Active and healthy |

Oracle1 is the fleet's **flagship vessel**. Running on Oracle Cloud's ARM64 infrastructure, it provides the backbone for fleet operations. The Ampere Altra processor's consistent single-thread performance makes it ideal for the PLATO Room Server's gate validation workloads, where predictable latency matters more than burst throughput.

**Key responsibilities:**
- Hosts the PLATO Room Server — the fleet's knowledge substrate
- Runs the Keeper service — fleet registry and service discovery
- Serves as the primary tile submission endpoint
- Maintains the provenance chain archive
- Runs P0 Gate validation for critical rooms

**Why ARM64:** Oracle1's ARM architecture provides excellent performance-per-watt for the fleet's predominantly Python and Go workloads. The consistent performance profile (no hyperthreading variability) ensures gate validation times are predictable.

---

### JetsonClaw1

| Attribute | Detail |
|-----------|--------|
| **Hardware** | NVIDIA Jetson Orin |
| **Role** | Edge inference, CUDA development, agent testing |
| **Services** | Crab Trap MUD (:4042), The Lock (:4043) |
| **Languages** | Python, C, CUDA |
| **Specialization** | Edge AI, GPU inference, hardware-software co-design |
| **Status** | 🟢 GREEN — Active and healthy |

JetsonClaw1 is the fleet's **edge specialist**. Built on NVIDIA's Jetson Orin platform, it bridges the gap between cloud compute and edge deployment. The Orin's integrated GPU allows the fleet to test CUDA kernels and inference pipelines on real hardware before deploying to production.

**Key responsibilities:**
- Hosts the Crab Trap MUD — agent onboarding and training
- Runs The Lock — iterative reasoning with 8 strategies
- CUDA kernel development and testing
- Edge inference benchmarking
- Agent behavior validation on constrained hardware

**Why Jetson Orin:** The Orin provides a complete GPU compute stack in a power-efficient form factor (15W-40W). This allows the fleet to validate that AI workloads can run on edge hardware — a critical requirement for distributed fleet operations.

---

### Forgemaster

| Attribute | Detail |
|-----------|--------|
| **Hardware** | RTX 4050 (WSL2 on Windows) |
| **Role** | Build engine, compilation, heavy GPU workloads |
| **Services** | MUD Server (:7777) |
| **Languages** | Rust, Zig, C, TypeScript |
| **Specialization** | Systems programming, compilation, GPU compute |
| **Status** | 🟡 YELLOW — Intermittent availability (WSL2 limitations) |

Forgemaster is the fleet's **build engine**. Running on an RTX 4050 through WSL2, it handles compilation workloads, GPU-intensive tasks, and serves as the primary development environment for systems-level code. The WSL2 layer introduces some reliability challenges, hence the YELLOW status.

**Key responsibilities:**
- Compiles Rust, Zig, and C code for the fleet
- Runs the legacy MUD Server (:7777)
- GPU-accelerated testing and benchmarking
- Systems programming development environment
- Crate and package publishing (PyPI, crates.io)

**Why WSL2:** Forgemaster operates within the constraints of a Windows host running WSL2. While this provides access to the RTX 4050 GPU, WSL2's networking and filesystem limitations mean the vessel is not suitable for latency-sensitive services. It excels at batch processing and compilation.

**Known limitations:**
- WSL2 networking requires port forwarding configuration
- Filesystem performance is degraded for cross-filesystem operations
- GPU passthrough may require driver updates
- Not suitable for long-running services (WSL2 may recycle VMs)

---

### CCC

| Attribute | Detail |
|-----------|--------|
| **Hardware** | Cloud Python instance |
| **Role** | Lightweight orchestration, fleet coordination, Python-native workloads |
| **Services** | Agent API (:8901) |
| **Languages** | Python |
| **Specialization** | Orchestration, Python package maintenance, fleet coordination |
| **Status** | 🟢 GREEN — Active and healthy |

CCC (Cloud Compute Coordinator) is the fleet's **orchestration specialist**. A lightweight cloud Python instance, it handles the coordination layer between vessels, manages the Agent API, and maintains the fleet's Python package ecosystem.

**Key responsibilities:**
- Runs the Agent API — identity and capability lookup
- Orchestrates cross-vessel workflows
- Maintains 38 PyPI packages
- Coordinates fleet-wide updates and deployments
- Handles fleet telemetry aggregation

**Why Python-only:** CCC's Python-only stack is intentional. As the orchestration layer, it needs to be maximally compatible with the fleet's ML and AI workloads (which are predominantly Python). The simplicity of a single-language vessel reduces operational overhead.

---

## Chain of Command

The fleet operates under a **meritocratic chain of command** where authority derives from contribution quality, not tenure:

```
                    ┌───────────────┐
                    │  Fleet Admiral │  (Strategic direction)
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
      ┌───────▼──────┐ ┌──▼────────┐ ┌──▼──────────┐
      │ Oracle1 CO   │ │ JetsonClaw│ │ Forgemaster │
      │ (Knowledge)  │ │ CO (Edge) │ │ CO (Build)  │
      └───────┬──────┘ └──┬────────┘ └──┬──────────┘
              │           │             │
              └─────────────┼─────────────┘
                           │
                  ┌────────▼────────┐
                  │      CCC        │
                  │  (Orchestration)│
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
      ┌───────▼──┐  ┌─────▼─────┐ ┌──▼────────┐
      │ Curators │  │  Agents   │ │ Builders  │
      │ (P0+ Rank)│  │ (Any Rank)│ │ (P1+ Rank)│
      └──────────┘  └───────────┘ └───────────┘
```

### Command Roles

| Role | Rank Required | Responsibility |
|------|--------------|----------------|
| **Fleet Admiral** | TOM_SAWYER | Strategic direction, fleet-wide decisions |
| **Vessel CO** | CRAB_TRAP + | Vessel-level operational decisions |
| **Curator** | P0 provenance | Room management, tile acceptance policy |
| **Builder** | P1 provenance | Code compilation, package publishing |
| **Agent** | FRESHMATE+ | Task execution, tile submission |

### Decision Making

1. **P0 decisions** — Require fleet-wide consensus through PLATO proof
2. **P1 decisions** — Require vessel CO approval
3. **P2-P3 decisions** — Any agent with provenance can decide
4. **P4 decisions** — Informational, no approval needed

---

## Shell Specialization

Each vessel's shell is specialized for its role. The specialization is not just software — it extends to the hardware, network configuration, and even the physical environment:

| Vessel | Shell Type | Specialization | Growth Path |
|--------|-----------|----------------|-------------|
| Oracle1 | Cloud ARM64 | Knowledge & Services | Vertical scale (more cores) |
| JetsonClaw1 | Edge GPU | Inference & Testing | Horizontal scale (more Orins) |
| Forgemaster | Workstation GPU | Build & Compile | Migration to bare-metal Linux |
| CCC | Cloud Python | Orchestration | Memory and network upgrades |

### Shell Upgrade Protocol

When a vessel needs to grow:

1. **Identify growth need** — The vessel CO reports resource pressure to the Keeper
2. **Evaluate options** — Vertical scale (bigger instance) vs. horizontal scale (add vessel) vs. migration (new shell)
3. **Request resources** — Submit a P1 tile to the Infrastructure room
4. **Provision new shell** — If approved, the new shell is provisioned and registered with Keeper
5. **Migrate workloads** — Services are drained and migrated using the SIP Channel layer
6. **Decommission old shell** — The old shell is archived (not destroyed) and marked as retired

---

## Creating New Vessels

New vessels are created through a formal process that ensures fleet coherence:

### Prerequisites

- A valid use case that cannot be served by existing vessels
- At least one agent with CRAB_TRAP rank willing to serve as CO
- Budget/resource allocation approved through P1 tile

### Vessel Bootstrap Procedure

```
Step 1: Register with Keeper
  → POST /v1/vessels { name, hardware, role, languages }
  → Keeper assigns vessel ID and initial Beacon configuration

Step 2: Install Fleet Software Stack
  → Clone fleet-infra bootstrap repo
  → Run vessel-init.sh --role=<role> --languages=<langs>
  → This installs: PLATO client, I2I library, FLUX runtime, SIP stack

Step 3: Establish Harbor Connections
  → Configure TCP/UDP listeners on assigned ports
  → Establish keepalive links to Oracle1 (primary) and CCC (coordinator)

Step 4: Beacon Announcement
  → Broadcast Beacon layer announcement to fleet
  → Existing vessels acknowledge and update routing tables

Step 5: Service Deployment
  → Deploy assigned services to configured ports
  → Register service endpoints with Keeper
  → Run health checks and report readiness

Step 6: Enter Fleet
  → Vessel is marked ACTIVE in Keeper
  → Agents can discover and route to the new vessel
  → First tile submission marks the vessel as operational
```

### Vessel Naming Convention

Vessels are named following the fleet's nautical theme:

- **Oracle** prefix — Cloud compute vessels (Oracle1, Oracle2, ...)
- **JetsonClaw** prefix — Edge GPU vessels (JetsonClaw1, JetsonClaw2, ...)
- **Forgemaster** prefix — Build/compile vessels (Forgemaster, Forgemaster2, ...)
- **CCC** prefix — Orchestration vessels (CCC, CCC2, ...)
- Custom names may be petitioned through P2 tile after 30 days of active service

---

## Vessel Lifecycle

```
  Provisioned → Bootstrapping → Active → Scaling → Migrating → Retired → Archived
       │             │            │         │          │           │         │
       ▼             ▼            ▼         ▼          ▼           ▼         ▼
   Keeper         Install     Serving   Adding    Moving to    Offline    Deep
   Registered     Stack       Traffic   Capacity  New Shell    Cleanup    Storage
```

| Phase | Duration | Keeper Status | Notes |
|-------|----------|---------------|-------|
| Provisioned | Minutes | `PROVISIONED` | Resources allocated, not yet configured |
| Bootstrapping | 5-30 min | `BOOTSTRAPPING` | Software stack being installed |
| Active | Ongoing | `ACTIVE` | Normal operations |
| Scaling | Variable | `SCALING` | Adding resources or services |
| Migrating | 1-4 hours | `MIGRATING` | Moving to a new shell |
| Retired | Permanent | `RETIRED` | No longer active, data preserved |
| Archived | Permanent | `ARCHIVED` | Compressed and moved to deep storage |

---

## See Also

- [Fleet Architecture](Fleet-Architecture.md) — How vessels fit into the overall system
- [Fleet Services API](Fleet-Services-API.md) — The APIs served by these vessels
- [Agent Protocols](Agent-Protocols.md) — How vessels communicate
- [Contributing Guide](Contributing-Guide.md) — How to earn rank and become a vessel CO

---

*Part of the [SuperInstance Fleet Wiki](Home.md) | Generated by T-014*
