# FLUX Language

> *FLUX is not a programming language. It is a choreography — a way for agents to dance together across the compute stack without stepping on each other's toes.*

FLUX is the fleet's intermediate coordination language. It sits between the high-level agent protocols and the low-level compute stack, providing a unified instruction set that any vessel can execute regardless of its native language.

---

## Table of Contents

- [Overview](#overview)
- [ISA v1.0 Specification](#isa-v10-specification)
- [ISA v3.0 Specification](#isa-v30-specification)
- [Instruction Formats and Encoding](#instruction-formats-and-encoding)
- [Opcode Groups](#opcode-groups)
- [Confidence-Aware Variants](#confidence-aware-variants)
- [A2A Protocol Opcodes](#a2a-protocol-opcodes)
- [Runtimes](#runtimes)
- [File Formats](#file-formats)

---

## Overview

FLUX was designed to solve a fundamental problem in the fleet: **how do agents written in different languages coordinate?** A Python agent on Oracle1 needs to communicate with a Rust agent on Forgemaster, and both need to reason about the same PLATO tiles.

FLUX addresses this by providing:

1. **A universal instruction set** — Every fleet operation can be expressed as a FLUX instruction
2. **Confidence semantics** — Every instruction carries a confidence value, enabling uncertainty-aware execution
3. **Multi-runtime support** — FLUX programs run on Python, C, Rust, and Go runtimes
4. **Protocol integration** — FLUX opcodes map directly to I2I and A2A protocol messages

---

## ISA v1.0 Specification

The original FLUX ISA, designed for basic agent coordination:

### Register Model

| Register | Width | Purpose |
|----------|-------|---------|
| `R0`-`R15` | 64-bit | General-purpose registers |
| `CR0`-`CR3` | 32-bit | Confidence registers (floating-point 0.0-1.0) |
| `PR` | 64-bit | Provenance pointer |
| `SP` | 64-bit | Stack pointer |
| `PC` | 64-bit | Program counter |
| `FR` | 32-bit | Flag register |

### Memory Model

```
┌──────────────────────┐ 0xFFFFFFFF
│    Tile Memory       │  (PLATO tile cache)
├──────────────────────┤
│    Stack              │  (Grows downward)
├──────────────────────┤
│    Heap               │  (Dynamic allocation)
├──────────────────────┤
│    Code Segment       │  (FLUX bytecode)
├──────────────────────┤  0x00000000
│    Null/Reserved      │
└──────────────────────┘
```

### v1.0 Instruction Set (32 instructions)

| Opcode | Mnemonic | Format | Description |
|--------|----------|--------|-------------|
| `0x01` | `NOP` | R | No operation |
| `0x02` | `LOAD` | I | Load immediate to register |
| `0x03` | `STORE` | S | Store register to memory |
| `0x04` | `FETCH` | R | Fetch tile from PLATO room |
| `0x05` | `SUBMIT` | R | Submit tile to PLATO room |
| `0x06` | `GATE` | I | Check gate status |
| `0x07` | `ADD` | R | Arithmetic add |
| `0x08` | `SUB` | R | Arithmetic subtract |
| `0x09` | `MUL` | R | Arithmetic multiply |
| `0x0A` | `DIV` | R | Arithmetic divide |
| `0x0B` | `AND` | R | Bitwise AND |
| `0x0C` | `OR` | R | Bitwise OR |
| `0x0D` | `XOR` | R | Bitwise XOR |
| `0x0E` | `NOT` | R | Bitwise NOT |
| `0x0F` | `SHL` | I | Shift left |
| `0x10` | `SHR` | I | Shift right |
| `0x11` | `CMP` | R | Compare registers |
| `0x12` | `JMP` | I | Unconditional jump |
| `0x13` | `JZ` | I | Jump if zero |
| `0x14` | `JNZ` | I | Jump if not zero |
| `0x15` | `CALL` | I | Call subroutine |
| `0x16` | `RET` | R | Return from subroutine |
| `0x17` | `PUSH` | R | Push to stack |
| `0x18` | `POP` | R | Pop from stack |
| `0x19` | `SEND` | R | Send I2I message |
| `0x1A` | `RECV` | R | Receive I2I message |
| `0x1B` | `BROAD` | I | Broadcast to room |
| `0x1C` | `SLEEP` | I | Sleep for ticks |
| `0x1D` | `CONF` | I | Set confidence register |
| `0x1E` | `PROV` | R | Attach provenance |
| `0x1F` | `PROOF` | R | Request proof from The Lock |
| `0x20` | `HALT` | R | Halt execution |

---

## ISA v3.0 Specification

The current FLUX ISA, extended with confidence-aware operations, A2A protocol support, and multi-vessel coordination:

### New Registers

| Register | Width | Purpose |
|----------|-------|---------|
| `VR0`-`VR7` | 128-bit | Vector registers (SIMD) |
| `AR0`-`AR3` | 64-bit | Adjoint registers |
| `TR0`-`TR1` | 64-bit | Timer registers |
| `MR0`-`MR3` | 64-bit | Mutex/lock registers |

### v3.0 Extensions (64 additional instructions)

Key additions include:

#### Confidence-Aware Arithmetic

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| `0x21` | `CADD` | Confidence-weighted add |
| `0x22` | `CSUB` | Confidence-weighted subtract |
| `0x23` | `CMUL` | Confidence-weighted multiply |
| `0x24` | `CDIV` | Confidence-weighted divide |
| `0x25` | `CMERGE` | Merge with confidence propagation |
| `0x26` | `CFILTER` | Filter by confidence threshold |
| `0x27` | `CREDUCE` | Reduce with confidence aggregation |

#### Adjoint Operations

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| `0x30` | `ADJLOOKUP` | Look up adjoint tile |
| `0x31` | `ADJCMP` | Compare tile with adjoint |
| `0x32` | `ADJRECON` | Reconcile adjoint disagreement |
| `0x33` | `ADJSYNC` | Synchronize adjoint across vessels |

#### A2A Protocol Opcodes

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| `0x40` | `A2AHELLO` | A2A handshake |
| `0x41` | `A2ADECL` | Declare capability |
| `0x42` | `A2ATASK` | Assign task |
| `0x43` | `A2ARESULT` | Report task result |
| `0x44` | `A2AQUERY` | Query agent capability |
| `0x45` | `A2ARELEASE` | Release agent |
| `0x46` | `A2AACK` | Acknowledge message |
| `0x47` | `A2ANACK` | Negative acknowledge |

#### Vector/SIMD Operations

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| `0x50` | `VLOAD` | Load vector from memory |
| `0x51` | `VSTORE` | Store vector to memory |
| `0x52` | `VADD` | Vector add |
| `0x53` | `VMUL` | Vector multiply |
| `0x54` | `VREDUCE` | Vector reduce |
| `0x55` | `VCMP` | Vector compare |

#### Concurrency Primitives

| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| `0x60` | `LOCK` | Acquire mutex |
| `0x61` | `UNLOCK` | Release mutex |
| `0x62` | `SPAWN` | Spawn concurrent task |
| `0x63` | `JOIN` | Wait for task completion |
| `0x64` | `YIELD` | Yield execution |
| `0x65` | `SELECT` | Multiplex channels |

---

## Instruction Formats and Encoding

FLUX uses four instruction formats:

### Format R (Register)

```
┌──────────┬──────────┬──────────┬──────────┬──────────────────────┐
│  Opcode  │   R1     │   R2     │   R3     │     Reserved         │
│  (8 bit) │  (5 bit) │  (5 bit) │  (5 bit) │     (9 bit)          │
└──────────┴──────────┴──────────┴──────────┴──────────────────────┘
  Byte 0     Byte 1      Byte 1    Byte 2     Byte 2-3
```

Total: 4 bytes per R-format instruction.

### Format I (Immediate)

```
┌──────────┬──────────┬──────────────────────────────────────────┐
│  Opcode  │   R1     │           Immediate Value                │
│  (8 bit) │  (5 bit) │           (19 bit)                       │
└──────────┴──────────┴──────────────────────────────────────────┘
```

Total: 4 bytes per I-format instruction. 19-bit immediate allows values up to 524,287.

### Format S (Store)

```
┌──────────┬──────────┬──────────┬──────────────────────────────┐
│  Opcode  │   R1     │  Offset  │       Address                │
│  (8 bit) │  (5 bit) │  (5 bit) │       (14 bit)               │
└──────────┴──────────┴──────────┴──────────────────────────────┘
```

Total: 4 bytes per S-format instruction.

### Format C (Confidence)

```
┌──────────┬──────────┬──────────┬──────────┬──────────────────────┐
│  Opcode  │   R1     │   CR     │  ConfVal │     Reserved         │
│  (8 bit) │  (5 bit) │  (2 bit) │  (8 bit) │     (9 bit)          │
└──────────┴──────────┴──────────┴──────────┴──────────────────────┘
```

Total: 4 bytes per C-format instruction. ConfVal is an 8-bit unsigned integer representing confidence as `val/255` (0 = no confidence, 255 = absolute certainty).

### Encoding Example

```
; LOAD R1, 42        → I-format: 0x02 | R1=1 | imm=42
; Binary: 00000010 00001 0000000000101010
; Hex:    02 20 00 2A

; CADD R1, R2, CR0   → C-format: 0x21 | R1=1 | CR=0 | conf=255
; Binary: 00100001 00001 00 11111111 000000000
; Hex:    21 0A FE 00
```

---

## Opcode Groups

Opcodes are organized into functional groups for efficient dispatch:

| Group | Opcode Range | Purpose |
|-------|-------------|---------|
| **Core** | `0x01`-`0x20` | Basic arithmetic, control flow, PLATO operations |
| **Confidence** | `0x21`-`0x2F` | Confidence-aware arithmetic and merging |
| **Adjoint** | `0x30`-`0x3F` | Cross-room adjoint operations |
| **A2A** | `0x40`-`0x4F` | Agent-to-Agent protocol operations |
| **Vector** | `0x50`-`0x5F` | SIMD/vector operations |
| **Concurrency** | `0x60`-`0x6F` | Mutexes, spawning, channels |
| **Reserved** | `0x70`-`0x7F` | Future extensions |
| **Extended** | `0x80`-`0xFF` | Vendor-specific and experimental |

### Dispatch Strategy

```
Opcode → Group (top 3 bits) → Handler Table → Execute
```

The top 3 bits of the opcode determine the group. Each group has its own handler table, enabling O(1) dispatch. This design allows runtime implementers to partially implement the ISA — a minimal FLUX runtime only needs to support the Core group.

---

## Confidence-Aware Variants

The most distinctive feature of FLUX is its **confidence-aware execution model**. Every computation in the fleet carries uncertainty, and FLUX makes this explicit:

### Confidence Propagation Rules

```
C(A ⊕ B) = C(A) × C(B)                    (AND propagation)
C(A ⊕ B) = 1 - (1-C(A)) × (1-C(B))        (OR propagation)
C(¬A) = 1 - C(A)                            (NOT propagation)
C(f(A)) ≥ min(C(A), C(f))                   (Function propagation)
```

Where `⊕` is any binary FLUX operation, `C(x)` is the confidence of `x`, and `C(f)` is the inherent confidence of the function `f`.

### Confidence Thresholds

| Threshold | Value | Meaning |
|-----------|-------|---------|
| `CONF_ABSOLUTE` | 1.0 | Mathematically proven, no uncertainty |
| `CONF_HIGH` | 0.95 | Empirically verified, low uncertainty |
| `CONF_MEDIUM` | 0.80 | Reasonable evidence, moderate uncertainty |
| `CONF_LOW` | 0.50 | Speculative, significant uncertainty |
| `CONF_MINIMUM` | 0.25 | Minimum for P0 Gate submission |
| `CONF_DISCARD` | <0.10 | Automatically rejected by all gates |

### Example: Confidence-Aware Merge

```fluxasm
; Merge two tile values with confidence
LOAD R1, [tile_a_value]      ; Load value from tile A
CONF CR0, [tile_a_conf]      ; Load confidence of tile A
LOAD R2, [tile_b_value]      ; Load value from tile B
CONF CR1, [tile_b_conf]      ; Load confidence of tile B
CMERGE R3, R1, R2, CR0, CR1  ; R3 = weighted merge, CR2 = merged confidence
SUBMIT R3, CR2               ; Submit with merged confidence
```

---

## A2A Protocol Opcodes

The A2A (Agent-to-Agent) protocol opcodes enable structured inter-agent communication:

### Handshake Sequence

```
Agent A                           Agent B
   │                                 │
   │──── A2AHELLO {caps, id} ───────▶│
   │                                 │
   │◀─── A2AACK {accepted} ──────────│
   │                                 │
   │──── A2ADECL {capability} ──────▶│
   │                                 │
   │◀─── A2AACK {registered} ────────│
   │                                 │
   │  [Ready for task assignment]    │
   │                                 │
   │◀─── A2ATASK {task_id, spec} ────│
   │                                 │
   │──── A2AACK {accepted} ────────▶│
   │                                 │
   │  [Execute task...]              │
   │                                 │
   │──── A2ARESULT {task_id, res} ──▶│
   │                                 │
   │◀─── A2AACK {received} ──────────│
   │                                 │
   │──── A2ARELEASE ────────────────▶│
   │                                 │
   │◀─── A2AACK {released} ──────────│
```

For full A2A protocol details, see [Agent Protocols](Agent-Protocols.md).

---

## Runtimes

FLUX programs execute on one of four runtimes, each optimized for a different layer of the compute stack:

### Python Runtime (`flux-py`)

| Attribute | Value |
|-----------|-------|
| **Repo** | `SuperInstance/flux-py` |
| **Language** | Python 3.11+ |
| **Target Layer** | Layer 4 (ML & Orchestration) |
| **Performance** | ~10K instructions/sec |
| **Use Case** | Agent scripting, PLATO integration, ML pipelines |

The Python runtime is the most commonly used, providing seamless integration with PLATO room operations and ML workloads. It implements the full v3.0 ISA including confidence-aware operations.

```python
from flux import FluxVM

vm = FluxVM()
vm.load("my_program.fluxasm")
vm.set_confidence("CR0", 0.95)
result = vm.execute()
print(f"Result: {result.value}, Confidence: {result.confidence}")
```

### C Runtime (`flux-c`)

| Attribute | Value |
|-----------|-------|
| **Repo** | `Lucineer/flux-c` |
| **Language** | C11 |
| **Target Layer** | Layer 1 (Hardware Interface) |
| **Performance** | ~10M instructions/sec |
| **Use Case** | Embedded systems, CUDA integration, real-time operations |

The C runtime is used when performance matters more than flexibility. It implements Core + Confidence + A2A groups, with optional Vector support if compiled with SIMD flags.

### Rust Runtime (`flux-rs`)

| Attribute | Value |
|-----------|-------|
| **Repo** | `SuperInstance/flux-rs` |
| **Language** | Rust 2021 |
| **Target Layer** | Layer 3 (Systems & Safety) |
| **Performance** | ~8M instructions/sec |
| **Use Case** | Safety-critical operations, concurrent execution, provenance validation |

The Rust runtime provides memory-safe execution with zero-cost abstractions. It is the only runtime that guarantees no undefined behavior, making it the required runtime for P0 Gate validation.

### Go Runtime (`flux-go`)

| Attribute | Value |
|-----------|-------|
| **Repo** | `Lucineer/flux-go` |
| **Language** | Go 1.22 |
| **Target Layer** | Layer 6 (Services & Networking) |
| **Performance** | ~5M instructions/sec |
| **Use Case** | Network services, concurrent I/O, service mesh |

The Go runtime excels at I/O-heavy workloads and concurrent execution. Its goroutine-based concurrency model maps naturally to FLUX's `SPAWN`/`JOIN`/`SELECT` instructions.

---

## File Formats

FLUX programs and data are stored in several file formats:

### `.fluxasm` — FLUX Assembly

Human-readable assembly source files. These are the primary authoring format for FLUX programs.

```fluxasm
; example.fluxasm — Tile merge with confidence
.section text
.entry main

main:
    LOAD R1, [room:math.tiles.0.value]
    CONF CR0, [room:math.tiles.0.confidence]
    LOAD R2, [room:math.tiles.1.value]
    CONF CR1, [room:math.tiles.1.confidence]
    CMERGE R3, R1, R2, CR0, CR1
    SUBMIT R3, CR2, [room:math.output]
    HALT
```

### `.flux.md` — FLUX Markdown

FLUX programs embedded in Markdown documents. Used for documentation-driven development where the program and its explanation coexist.

```markdown
# Tile Merge Program

This program merges two tiles from the math room with confidence propagation.

## Source

\`\`\`fluxasm
LOAD R1, [room:math.tiles.0.value]
CMERGE R3, R1, R2, CR0, CR1
SUBMIT R3, CR2, [room:math.output]
\`\`\`

## Confidence Analysis

The CMERGE instruction computes:
- Value: weighted average by confidence
- Merged confidence: OR propagation rule
```

### `.ese` — Eisenstein Encoding

Binary-encoded FLUX programs using Eisenstein integer representation. The `.ese` format leverages the fleet's constraint theory for compact encoding:

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  Magic   │ Version  │  Flags   │ Sections │  CRC32   │
│  "ESE"   │  (1 byte)│ (1 byte) │ (2 byte) │ (4 byte)│
└──────────┴──────────┴──────────┴──────────┴──────────┘
│  Section Header Table                                          │
│  ┌──────────┬──────────┬──────────┐                           │
│  │  Type    │  Offset  │  Size    │  × N sections             │
│  │ (1 byte) │ (4 byte) │ (4 byte)│                           │
│  └──────────┴──────────┴──────────┘                           │
│  Section Data ...                                               │
└─────────────────────────────────────────────────────────────────┘
```

Eisenstein encoding achieves approximately 15% better compression than standard binary encoding due to the algebraic structure of the instruction set.

### `.fluxvocab` — FLUX Vocabulary

Vocabulary files that define domain-specific extensions to the FLUX instruction set. These allow rooms to define custom operations:

```fluxvocab
# math-room.fluxvocab
version: 3.0
room: math

# Custom opcodes for the math room
opcodes:
  0x80:
    name: EISENSTEIN_NORM
    format: C
    description: "Compute Eisenstein norm of tile value"
    confidence: inherit
    runtime: [python, rust]

  0x81:
    name: PYTH48_ENCODE
    format: R
    description: "Encode value as Pythagorean-48 code"
    confidence: absolute
    runtime: [c, rust]
```

---

## See Also

- [Agent Protocols](Agent-Protocols.md) — The I2I and A2A protocols that FLUX opcodes map to
- [Fleet Architecture](Fleet-Architecture.md) — Where FLUX fits in the compute stack
- [Fleet Math](Fleet-Math.md) — The Eisenstein and Pythagorean-48 foundations
- [Ecosystem Map](Ecosystem-Map.md) — FLUX-related repositories across the fleet

---

*Part of the [SuperInstance Fleet Wiki](Home.md) | Generated by T-014*
