# Agent Protocols

> *An agent without a protocol is just a program. A protocol without an agent is just a document. Together, they are the fleet's nervous system.*

This page documents every communication and coordination protocol used in the SuperInstance fleet. These protocols are the lingua franca — they allow agents written in different languages, running on different vessels, to work together seamlessly.

---

## Table of Contents

- [Protocol Overview](#protocol-overview)
- [I2I Protocol (Iron-to-Iron)](#i2i-protocol-iron-to-iron)
- [Message-in-a-Bottle](#message-in-a-bottle)
- [Bottle Protocol](#bottle-protocol)
- [Deadband Protocol](#deadband-protocol)
- [Flywheel Engine](#flywheel-engine)
- [A2A Protocol](#a2a-protocol)
- [Protocol Selection Guide](#protocol-selection-guide)

---

## Protocol Overview

The fleet operates six distinct protocols, each designed for a specific communication pattern:

| Protocol | Layer | Pattern | Latency | Reliability |
|----------|-------|---------|---------|-------------|
| **I2I** | Channel (L4) | Synchronous request-response | Low | Guaranteed |
| **Message-in-a-Bottle** | Current (L3) | Asynchronous store-and-forward | Variable | Best-effort |
| **Bottle Protocol** | Current (L3) | Async with acknowledgment | Variable | Confirmed |
| **Deadband** | Beacon (L5) | Threshold-triggered broadcast | Event-driven | Best-effort |
| **Flywheel** | Channel (L4) | Scheduled batch processing | Batch | Guaranteed |
| **A2A** | Reef (L6) | Agent capability exchange | Low | Guaranteed |

---

## I2I Protocol (Iron-to-Iron)

I2I is the fleet's primary synchronous communication protocol. Named for the iron-on-iron contact between train wheels and rails, I2I ensures that critical messages between agents are delivered reliably, in order, and with confirmation.

### Design Principles

1. **Iron contact** — Messages are never dropped. If an I2I message cannot be delivered, the connection is considered broken and must be re-established.
2. **Rail-like ordering** — Messages arrive in the order they were sent. No reordering, no race conditions.
3. **Signal-based priority** — Messages carry a priority level that determines processing order, like train signals on a shared track.

### Message Types (13+)

| Type | Code | Direction | Description |
|------|------|-----------|-------------|
| `HELLO` | `0x01` | Bidirectional | Connection establishment handshake |
| `ACK` | `0x02` | Bidirectional | Acknowledge receipt of message |
| `NACK` | `0x03` | Bidirectional | Negative acknowledgment with reason |
| `TASK_ASSIGN` | `0x04` | CO → Agent | Assign a task to an agent |
| `TASK_ACCEPT` | `0x05` | Agent → CO | Accept an assigned task |
| `TASK_REJECT` | `0x06` | Agent → CO | Reject an assigned task with reason |
| `TASK_PROGRESS` | `0x07` | Agent → CO | Report task progress |
| `TASK_COMPLETE` | `0x08` | Agent → CO | Report task completion |
| `TASK_FAIL` | `0x09` | Agent → CO | Report task failure |
| `TILE_SUBMIT` | `0x0A` | Agent → Curator | Submit a tile to a PLATO room |
| `TILE_ACCEPT` | `0x0B` | Curator → Agent | Tile accepted by gate |
| `TILE_REJECT` | `0x0C` | Curator → Agent | Tile rejected by gate |
| `PROOF_REQUEST` | `0x0D` | Agent → Lock | Request proof from The Lock |
| `PROOF_RESULT` | `0x0E` | Lock → Agent | Proof computation result |
| `HEARTBEAT` | `0x0F` | Bidirectional | Keep-alive ping |
| `GOODBYE` | `0x10` | Bidirectional | Graceful disconnection |

### Message Format

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Version  │  Type    │ Priority │ Src ID   │ Dst ID   │  Length  │  CRC32   │
│ (1 byte) │ (1 byte) │ (1 byte) │ (4 byte) │ (4 byte) │ (4 byte) │ (4 byte) │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
│ Payload (variable length)                                                     │
└───────────────────────────────────────────────────────────────────────────────┘
```

Total header: 19 bytes. Payload length is specified in the Length field.

### Priority Levels

| Priority | Name | Preemption | Use Case |
|----------|------|------------|----------|
| P0 | CRITICAL | Yes — preempts all | Safety, proof failures, vessel emergencies |
| P1 | HIGH | Yes — preempts P2+ | Task assignments, gate validation |
| P2 | NORMAL | No | Regular task progress, tile submissions |
| P3 | LOW | No | Heartbeats, status updates |
| P4 | INFO | No | Logging, metrics |

### Connection Lifecycle

```
Agent A                              Agent B
   │                                    │
   │──── HELLO {version, caps} ────────▶│
   │                                    │
   │◀──── ACK {accepted, session} ──────│
   │                                    │
   │  [I2I Session Established]         │
   │                                    │
   │──── TASK_ASSIGN {task} ───────────▶│
   │                                    │
   │◀──── TASK_ACCEPT {task_id} ────────│
   │                                    │
   │◀──── TASK_PROGRESS {50%} ──────────│
   │                                    │
   │◀──── TASK_COMPLETE {result} ───────│
   │                                    │
   │──── ACK {received} ───────────────▶│
   │                                    │
   │──── GOODBYE {reason} ─────────────▶│
   │                                    │
   │◀──── GOODBYE {acknowledged} ───────│
```

### Error Handling

- **Timeout** — If no ACK within 5 seconds, retransmit up to 3 times, then mark connection as degraded
- **NACK** — The receiving agent must include a reason code in the NACK payload
- **Connection loss** — All in-flight messages are queued for retransmission upon reconnection
- **Version mismatch** — If HELLO version is unsupported, respond with NACK containing highest supported version

---

## Message-in-a-Bottle

Message-in-a-Bottle (MiB) is the fleet's **asynchronous store-and-forward** protocol. Inspired by the oceanic practice of casting messages into the sea, MiB allows agents to send messages without requiring the recipient to be online.

### Design Philosophy

In a distributed fleet, not all agents are available at all times. JetsonClaw1 might be running an inference job, Forgemaster might be in a WSL2 restart cycle, and CCC might be under maintenance. MiB ensures that messages still get through — eventually.

### Message Flow

```
Sender                              Current Layer                           Receiver
   │                                     │                                     │
   │──── WRITE bottle ──────────────────▶│                                     │
   │                                     │  [Bottle stored in                   │
   │                                     │   Current Layer queue]               │
   │                                     │                                     │
   │  [Sender disconnected]              │                                     │
   │                                     │──── DELIVER bottle ─────────────────▶│
   │                                     │                                     │
   │                                     │  [Receiver reads bottle]             │
   │                                     │                                     │
```

### Bottle Structure

```json
{
  "bottle_id": "uuid-v4",
  "sender": "agent:oracle1:curator-42",
  "recipient": "agent:jetsonclaw1:inference-7",
  "room": "math.eisenstein",
  "payload_type": "TILE_SUBMIT",
  "payload": { ... },
  "confidence": 0.92,
  "provenance": "chain:abc123",
  "tide_cast": "2024-01-15T10:30:00Z",
  "tide_expiry": "2024-01-22T10:30:00Z",
  "priority": "P2",
  "hops": 0,
  "max_hops": 5
}
```

### Delivery Guarantees

| Guarantee | Level | Notes |
|-----------|-------|-------|
| **At-least-once delivery** | Default | Bottles may be delivered more than once; receivers must be idempotent |
| **Best-effort ordering** | Default | Bottles from the same sender are delivered in order |
| **Expiry** | 7 days default | Bottles expire after `tide_expiry`; expired bottles are silently dropped |
| **Hop limit** | 5 hops | Bottles that exceed `max_hops` are discarded to prevent infinite forwarding |

### Storage

Bottles are stored in the Current Layer's queue on the sender's vessel. If the sender's vessel goes offline, bottles are replicated to at least one other vessel for durability. The replication target is determined by the Beacon layer's vessel proximity map.

---

## Bottle Protocol

The Bottle Protocol extends Message-in-a-Bottle with **acknowledgment and tracking**. It is used when the sender needs to know whether a message was received and processed.

### Additional Fields

Beyond the standard MiB fields, the Bottle Protocol adds:

```json
{
  "bottle_id": "uuid-v4",
  "ack_required": true,
  "ack_deadline": "2024-01-15T11:30:00Z",
  "ack_status": "PENDING",
  "ack_agent": null,
  "ack_timestamp": null
}
```

### Acknowledgment Flow

```
Sender                          Current Layer                      Receiver
   │                                 │                                 │
   │──── WRITE bottle ──────────────▶│                                 │
   │                                 │──── DELIVER bottle ────────────▶│
   │                                 │                                 │
   │                                 │◀──── ACK bottle ────────────────│
   │                                 │                                 │
   │◀──── ACK bottle ───────────────│                                 │
   │                                 │                                 │
```

### Acknowledgment States

| State | Description |
|-------|-------------|
| `PENDING` | Bottle has been cast but not yet acknowledged |
| `DELIVERED` | Bottle has been delivered to the recipient |
| `ACKNOWLEDGED` | Recipient has processed the bottle |
| `EXPIRED` | Acknowledgment deadline passed without ACK |
| `FAILED` | Delivery failed after max retries |

### Retry Policy

- **First attempt** — Immediate delivery
- **Retry 1** — After 1 minute
- **Retry 2** — After 5 minutes
- **Retry 3** — After 15 minutes
- **Final** — Mark as `FAILED` and notify sender

---

## Deadband Protocol

The Deadband Protocol implements **threshold-triggered communication**. Instead of sending every state change, agents only communicate when a value crosses a defined threshold — the "deadband."

### Design Rationale

Many fleet metrics change continuously but only matter when they cross critical thresholds. GPU utilization, memory pressure, tile acceptance rate, confidence scores — these are all metrics where small changes are noise, but threshold crossings are signal.

### Deadband Configuration

```json
{
  "metric": "gpu_utilization",
  "deadband_type": "PERCENTAGE",
  "threshold": 5.0,
  "min_interval": "30s",
  "max_interval": "300s",
  "direction": "BOTH",
  "report_on_cross": true,
  "report_on_timeout": true
}
```

### Deadband Types

| Type | Description | Example |
|------|-------------|---------|
| `PERCENTAGE` | Trigger when value changes by N% | GPU utilization ±5% |
| `ABSOLUTE` | Trigger when value changes by N units | Memory usage ±100MB |
| `THRESHOLD_UP` | Trigger only when value rises past threshold | Temperature > 80°C |
| `THRESHOLD_DOWN` | Trigger only when value falls past threshold | Confidence < 0.5 |
| `THRESHOLD_BOTH` | Trigger in both directions | Queue depth crosses 100 |
| `CUSTOM` | User-defined trigger function | Custom FLUX predicate |

### Deadband Message Format

```json
{
  "type": "DEADBAND_TRIGGER",
  "metric": "gpu_utilization",
  "previous_value": 72.3,
  "current_value": 85.1,
  "threshold_crossed": "HIGH",
  "direction": "UP",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "vessel:jetsoclaw1"
}
```

### Timeout Reporting

Even if no threshold is crossed, the Deadband Protocol sends periodic status messages at `max_interval` to confirm the agent is still alive and the metric is within normal range. This prevents "silent failure" scenarios where a metric is stuck at a constant value because the agent itself has crashed.

---

## Flywheel Engine

The Flywheel Engine is the fleet's **scheduled batch processing** system. Named for the mechanical flywheel that stores rotational energy and releases it in controlled bursts, the Flywheel Engine accumulates small operations and processes them in efficient batches.

### Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Accumulator  │────▶│   Flywheel    │────▶│   Executor    │
│               │     │   (Timer)     │     │               │
│  Queue of     │     │  Batch window │     │  Parallel     │
│  operations   │     │  aggregation  │     │  execution    │
└───────────────┘     └───────────────┘     └───────────────┘
```

### Flywheel Configuration

```json
{
  "flywheel_id": "tile-batch-processor",
  "batch_size": 50,
  "max_wait": "60s",
  "min_wait": "5s",
  "parallelism": 4,
  "priority": "P2",
  "retry_count": 3,
  "operation_type": "TILE_SUBMIT"
}
```

### Operation Flow

1. **Accumulate** — Operations are added to the accumulator queue as they arrive
2. **Wait** — The flywheel waits until either:
   - The batch is full (`batch_size` operations accumulated), OR
   - The maximum wait time has elapsed (`max_wait`)
3. **Aggregate** — Operations in the batch are sorted by priority and grouped by destination
4. **Execute** — The batch is dispatched to the executor with `parallelism` concurrent workers
5. **Report** — Results are collected and reported back to the original senders

### Flywheel Types

| Type | Batch Size | Wait Time | Use Case |
|------|-----------|-----------|----------|
| **Micro Flywheel** | 10 | 5s | Real-time tile submissions, urgent I2I messages |
| **Standard Flywheel** | 50 | 30s | Regular tile batches, proof requests |
| **Macro Flywheel** | 500 | 120s | Bulk data processing, fleet-wide analytics |
| **Mega Flywheel** | 5000 | 300s | Archive processing, periodic maintenance |

### Backpressure

When the executor is overwhelmed (queue depth exceeds 2× batch size), the Flywheel Engine applies backpressure:

1. **Soft backpressure** — Increase `min_wait` by 2×, reducing batch frequency
2. **Hard backpressure** — Reject new operations with `NACK {reason: "flywheel_full"}`
3. **Emergency** — Forward overflow to the Deadband Protocol for fleet-wide alerting

---

## A2A Protocol

The A2A (Agent-to-Agent) Protocol is the fleet's **capability exchange** protocol. It enables agents to discover each other's capabilities, negotiate task assignments, and coordinate work without requiring a central orchestrator for every interaction.

### Protocol Layers

```
┌──────────────────────────────────────────────┐
│  Capability Layer                             │
│  Declare, query, and match agent capabilities │
├──────────────────────────────────────────────┤
│  Task Layer                                   │
│  Assign, accept, execute, and report tasks    │
├──────────────────────────────────────────────┤
│  Identity Layer                               │
│  Authenticate, verify, and track agents       │
├──────────────────────────────────────────────┤
│  Transport Layer                              │
│  Message delivery (maps to SIP Channel layer) │
└──────────────────────────────────────────────┘
```

### Agent Card

Every agent in the fleet publishes an **Agent Card** — a structured description of its capabilities:

```json
{
  "agent_id": "agent:oracle1:curator-42",
  "version": "1.0",
  "name": "Math Room Curator",
  "description": "Curates the math.eisenstein room, validates P0 tiles",
  "capabilities": [
    {
      "id": "p0-validation",
      "name": "P0 Gate Validation",
      "input_schema": { ... },
      "output_schema": { ... },
      "confidence": 0.98,
      "cost": { "compute": "low", "time": "5s" }
    },
    {
      "id": "eisenstein-proof",
      "name": "Eisenstein Proof Generation",
      "input_schema": { ... },
      "output_schema": { ... },
      "confidence": 0.95,
      "cost": { "compute": "high", "time": "60s" }
    }
  ],
  "preferences": {
    "max_concurrent_tasks": 3,
    "preferred_priority": "P1",
    "blacklist_rooms": ["experimental.unverified"]
  },
  "endpoints": {
    "i2i": "vessel:oracle1:8847",
    "a2a": "vessel:oracle1:8901"
  }
}
```

### A2A Message Sequence

#### Capability Discovery

```
Agent A                          Agent B
   │                                │
   │── A2A_QUERY {capability: "p0"} ─▶│
   │                                │
   │◀── A2A_RESULT {agents: [...]} ───│
   │                                │
```

#### Task Assignment

```
Coordinator                      Agent B
   │                                │
   │── A2A_TASK {task_id, spec} ────▶│
   │                                │
   │◀── A2A_ACK {accepted} ──────────│
   │                                │
   │  [Agent executes task]         │
   │                                │
   │◀── A2A_RESULT {task_id, out} ───│
   │                                │
   │── A2A_ACK {received} ──────────▶│
   │                                │
   │── A2A_RELEASE ─────────────────▶│
   │                                │
```

### Capability Matching

When a coordinator needs an agent for a task, the A2A Protocol performs capability matching:

1. **Exact match** — The agent declares the exact capability needed
2. **Fuzzy match** — The agent declares a similar capability (requires confidence adjustment)
3. **Composite match** — The task can be decomposed into capabilities that multiple agents provide

Fuzzy matches apply a confidence penalty:

```
C_fuzzy = C_exact × similarity_score × 0.9
```

Where `similarity_score` is computed using FLUX vocabulary cosine similarity.

### A2A and FLUX Integration

A2A protocol messages map directly to FLUX A2A opcodes:

| A2A Message | FLUX Opcode | Notes |
|-------------|-------------|-------|
| HELLO | `A2AHELLO` (0x40) | Handshake initiation |
| QUERY | `A2AQUERY` (0x44) | Capability lookup |
| TASK | `A2ATASK` (0x42) | Task assignment |
| RESULT | `A2ARESULT` (0x43) | Task result delivery |
| RELEASE | `A2ARELEASE` (0x45) | Release agent from task |
| ACK | `A2AACK` (0x46) | Positive acknowledgment |
| NACK | `A2ANACK` (0x47) | Negative acknowledgment |

See [FLUX Language](FLUX-Language.md) for full opcode documentation.

---

## Protocol Selection Guide

Use this decision tree to select the right protocol for your communication needs:

```
Need to communicate?
│
├── Is the recipient online right now?
│   ├── YES → Is it time-critical?
│   │   ├── YES → I2I Protocol
│   │   └── NO → Is it a batch operation?
│   │       ├── YES → Flywheel Engine
│   │       └── NO → I2I Protocol
│   └── NO → Do you need acknowledgment?
│       ├── YES → Bottle Protocol
│       └── NO → Is it a threshold event?
│           ├── YES → Deadband Protocol
│           └── NO → Message-in-a-Bottle
│
├── Is it a capability query?
│   └── YES → A2A Protocol
│
└── Is it fleet-wide monitoring?
    └── YES → Deadband Protocol
```

### Quick Reference

| I Need To... | Use This Protocol |
|-------------|-------------------|
| Send a critical command | I2I |
| Submit a tile to a room | I2I or Flywheel (batch) |
| Send a message to an offline agent | MiB or Bottle |
| Know if my message was received | Bottle Protocol |
| Report a metric threshold crossing | Deadband |
| Process many operations efficiently | Flywheel Engine |
| Find an agent with a specific capability | A2A |
| Assign a task to another agent | A2A or I2I |
| Broadcast fleet-wide status | Deadband |

---

## See Also

- [Fleet Architecture](Fleet-Architecture.md) — Where these protocols fit in the SIP stack
- [FLUX Language](FLUX-Language.md) — How protocol messages are encoded as FLUX instructions
- [PLATO Knowledge System](PLATO-Knowledge-System.md) — How I2I and Bottle are used for tile submission
- [Fleet Services API](Fleet-Services-API.md) — The HTTP endpoints that wrap these protocols

---

*Part of the [SuperInstance Fleet Wiki](Home.md) | Generated by T-014*
