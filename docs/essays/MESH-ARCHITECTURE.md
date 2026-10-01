# SuperInstance Mesh Architecture

> **Version:** 1.0.0  
> **Status:** Design Specification — Ready for Implementation  
> **Scope:** Full decomposition of `plato-training` monolith + mesh hooks for existing packages

---

## 1. Philosophy

The SuperInstance ecosystem follows the **pytest plugin model**: every package is standalone, useful in isolation, and gains superpowers when co-installed with siblings. No hard dependencies between siblings — only soft `try/except` imports mediated by a central mesh registry.

**Core Principles:**
1. **Alone:** `pip install X` gives you X, fully functional.
2. **Together:** `pip install X Y Z` auto-composes cross-package features without code changes.
3. **No diamond problems:** Packages never hard-depend on each other. Only `plato-core` is a true dependency.
4. **Entry-point discovery:** `importlib.metadata.entry_points(group="plato.mesh")` is the single source of truth.
5. **Registry, not framework:** Packages register capabilities; they don't ask permission.

---

## 2. Package Map

### 2.1 Ecosystem Overview (9 packages)

| Package | Source | Role | Hard Deps |
|---------|--------|------|-----------|
| `plato-core` | *new* | Base types + mesh registry | `none` (stdlib only) |
| `plato-rooms` | *split from monolith* | Training engines (PyTorch, TF, GPT-2) | `plato-core`, `torch` |
| `plato-micro` | *split from monolith* | Micro-model training + hardware deployment | `plato-core`, `torch` |
| `plato-intelligence` | *split from monolith* | LLM distillation, filters, self-training | `plato-core`, `torch` |
| `plato-fleet` | *split from monolith* | Collective inference, I2I, swarm rooms | `plato-core` |
| `tensor-spline` | exists | SplineLinear, LowRankLinear, compression | `torch` |
| `eisenstein-embed` | exists | 5-layer matching cascade + embeddings | `numpy` |
| `deadband-rs` | exists | Rust deadband cache (PyO3 bindings) | `none` (Rust extension) |
| `constraint-theory-py` | exists | Mathematical constraint solving | `numpy` |
| `spectral-conservation` | exists | Spectral analysis utilities | `numpy`, `scipy` |

### 2.2 Module Assignment: `plato-training` → 4 packages + `plato-core`

#### `plato-core` (formerly `types.py` + `store.py` + mesh registry)
```
plato_core/
  __init__.py          # exports types, registry, discovery
  types.py             # TrainingTile, TileType, TileLifecycle, LamportClock, etc.
  store.py             # TileStore, LocalTileStore (interface + JSON impl)
  mesh.py              # MeshRegistry, Capability, auto-discovery
  lamport.py           # VectorClock, CausalOrder, ConcurrentDetector
  tile_lifecycle.py    # DeprecationNotice, LineageTracker, ConflictResolver
```

#### `plato-rooms` (training engines)
```
plato_rooms/
  __init__.py          # exports PyTorchRoom, TensorFlowRoom, GPT2Room, LoRAFactory
  pytorch_room.py      # PyTorch training loop with LoRA injection
  tensorflow_room.py   # Keras training loop
  gpt2_room.py         # GPT-2 specific room
  gpt2_trainer.py      # GPT-2 trainer utilities
  adapters/
    __init__.py        # LoRALayer, inject_lora, save/load
    lora.py            # LoRA implementation
  rooms/
    __init__.py
    lora_factory.py    # LoRAFactory for multi-adapter management
  throttle.py          # TrainingThrottle (fleet-aware resource throttling)
```

#### `plato-micro` (tiny models + deployment)
```
plato_micro/
  __init__.py          # exports MicroRoom, RoomFactory, deploy_micro, deploy_fleet
  micro_models.py      # TASK_REGISTRY, train_micro, MicroClassifier
  micro_room.py        # MicroRoom (ensign-facing inference room)
  hardware.py          # HardwareProfile, PROFILES, DeployedModel
  device_router.py     # Route inference to best available device
  npu_bridge.py        # NPU-specific compilation
  onnx_export.py       # ONNX export + benchmark
  data_pipeline.py     # Data pipeline helpers
```

#### `plato-intelligence` (LLM distillation pipeline)
```
plato_intelligence/
  __init__.py          # exports IntelligenceRoom, PreFilter, PostFilter, SelfTrainer
  intelligence_room.py # Main intelligence room
  intelligence_pre_filter.py   # Routing decision micro-model
  intelligence_post_filter.py  # Knowledge extraction micro-model
  intelligence_self_trainer.py # Idle-loop retraining
  semantic_matcher.py  # Model2Vec + FAISS semantic matching (soft dep)
  semantic_store.py    # Semantic knowledge store
  tutor_judge.py       # Bitvector similarity for tutor grading
  triplet_miner.py     # Hard negative mining
  eisenstein_encoder.py # Tiny text encoder (moved here from monolith)
```

#### `plato-fleet` (distributed collective)
```
plato_fleet/
  __init__.py          # exports Collective, SwarmRoom, I2I, FleetMiner
  collective.py        # Collective inference core
  collective_loop.py   # Event loop for collective rooms
  fleet_miner.py       # Git history miner for training data
  i2i.py               # Instance-to-instance protocol
  swarm_rooms.py       # Swarm coordination rooms
  commit_predictor.py  # Predict next commits
  agent_field.py       # Agent field dynamics
  gpu_fleet_trainer.py # Multi-GPU fleet training
```

### 2.3 Modules Removed from `plato-training`

These modules move to their natural homes in existing packages:

| Module | Moves To | Reason |
|--------|----------|--------|
| `spline.py` | `tensor-spline` | Already duplicated there; canonical home |
| `low_rank.py` | `tensor-spline` | Same compression family |
| `hierarchical_spline.py` | `tensor-spline` | Multi-scale spline variant |
| `spline_hd.py` | `tensor-spline` | High-dimensional splines |
| `eisenstein_encoder.py` | `plato-intelligence` | Uses spline layers; belongs with intelligence pipeline |

---

## 3. Mesh Protocol Specification

### 3.1 Entry Points

Every mesh-aware package declares an entry point in group `plato.mesh`:

```toml
[project.entry-points."plato.mesh"]
plato-rooms = "plato_rooms.mesh:register"
tensor-spline = "tensor_spline.mesh:register"
eisenstein-embed = "eisenstein_embed.mesh:register"
```

The value is a `module:callable` string. The callable receives the global `MeshRegistry` instance and registers capabilities.

### 3.2 Capability Model

A **capability** is a named feature with metadata and a factory/hook:

```python
from dataclasses import dataclass
from typing import Any, Callable, Optional

@dataclass
class Capability:
    name: str                    # e.g. "layer.spline_linear"
    package: str                 # e.g. "tensor-spline"
    factory: Optional[Callable]  # Constructor or factory function
    metadata: dict               # Version, config schema, docs
    requires: tuple              # Tuple of capability names this depends on
```

### 3.3 MeshRegistry API

```python
class MeshRegistry:
    """Global capability registry. Auto-populated on first import of plato_core.mesh."""

    def register(self, cap: Capability) -> None:
        """Register a capability. Idempotent (same name + package overwrites)."""

    def get(self, name: str, package: Optional[str] = None) -> Optional[Capability]:
        """Get a capability by name. If package given, exact match."""

    def find(self, prefix: str) -> list[Capability]:
        """Find all capabilities matching name prefix."""

    def has(self, name: str) -> bool:
        """Check if a capability is available."""

    def require(self, name: str) -> Capability:
        """Get capability or raise MeshCapabilityMissing."""

    def call(self, name: str, *args, **kwargs) -> Any:
        """Get capability and invoke its factory."""

    @property
    def packages(self) -> set[str]:
        """Set of all discovered package names."""

    @property
    def capabilities(self) -> dict[str, Capability]:
        """All registered capabilities."""
```

### 3.4 Auto-Discovery Mechanism

Discovery happens **lazily on first access** to avoid import-time side effects:

```python
# plato_core/mesh.py
import sys
from importlib.metadata import entry_points
from functools import lru_cache

class MeshRegistry:
    _instance = None
    _discovered = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._caps = {}
        return cls._instance

    def _ensure_discovered(self):
        if self._discovered:
            return
        self._discovered = True
        try:
            eps = entry_points(group="plato.mesh")
        except Exception:
            eps = []
        for ep in eps:
            try:
                register = ep.load()
                register(self)
            except Exception as e:
                # Log but never fail — mesh is best-effort
                import warnings
                warnings.warn(f"Mesh discovery failed for {ep.name}: {e}")

    def register(self, cap):
        self._ensure_discovered()
        key = f"{cap.package}:{cap.name}"
        self._caps[key] = cap

    def get(self, name, package=None):
        self._ensure_discovered()
        if package:
            return self._caps.get(f"{package}:{name}")
        # Return first match by name (any package)
        for key, cap in self._caps.items():
            if cap.name == name:
                return cap
        return None
```

### 3.5 Package Registration Pattern

Each package creates a `mesh.py` module:

```python
# tensor_spline/mesh.py
from plato_core.mesh import Capability, MeshRegistry

def register(registry: MeshRegistry) -> None:
    registry.register(Capability(
        name="layer.spline_linear",
        package="tensor-spline",
        factory=SplineLinear,
        metadata={"version": __version__, "framework": "pytorch"},
        requires=(),
    ))
    registry.register(Capability(
        name="layer.low_rank_linear",
        package="tensor-spline",
        factory=LowRankLinear,
        metadata={"version": __version__, "framework": "pytorch"},
        requires=(),
    ))
    registry.register(Capability(
        name="compression.recommend",
        package="tensor-spline",
        factory=recommend_variant,
        metadata={"version": __version__},
        requires=(),
    ))
```

Packages call `register()` in their `__init__.py` for eager discovery:

```python
# tensor_spline/__init__.py
from .spline import SplineLinear, inject_spline, compression_ratio, EisensteinLattice
from .low_rank import LowRankLinear, LowRankClassifier, inject_low_rank, recommend_variant, VARIANT_GUIDE
from .hierarchical_spline import HierarchicalSplineLinear, HierarchicalSplineClassifier, inject_hierarchical_spline

__version__ = "1.0.0"

# Eager mesh registration
try:
    from .mesh import register
    from plato_core.mesh import MeshRegistry
    register(MeshRegistry())
except Exception:
    pass  # plato-core not installed — we're still fully functional
```

---

## 4. Interface Contracts

### 4.1 `plato-core` Contract

**Provides:**
- `TrainingTile`, `TileType`, `TileLifecycle`, `LamportClock`, `VectorClock`
- `AdapterConfig`, `TrainingConfig`, `TrainingMetrics`
- `TileStore` (ABC), `LocalTileStore` (JSON impl)
- `MeshRegistry`, `Capability`, `MeshCapabilityMissing`
- `content_hash()` — SHA-256 truncated to 16 chars

**Promises:**
- Zero ML framework dependencies (stdlib + `dataclasses` only)
- `plato-core` never imports any sibling package
- Types are JSON-serializable round-trip
- Mesh registry is a singleton, thread-safe (for reads), lazy

### 4.2 `plato-rooms` Contract

**Provides:**
- `PyTorchRoom`, `TensorFlowRoom`, `GPT2Room`
- `LoRALayer`, `inject_lora()`, `save_lora_weights()`, `load_lora_weights()`
- `LoRAFactory`
- `TrainingThrottle`, `ThrottleLevel`, `ThrottleState`

**Soft Dependencies:**
- `tensor-spline` → uses `MeshRegistry.get("layer.spline_linear")` for spline-aware training
- `plato-micro` → none (rooms produce tiles; micro consumes them)

**Entry Points:**
```toml
[project.entry-points."plato.mesh"]
plato-rooms = "plato_rooms.mesh:register"
```

**Capabilities Registered:**
- `room.pytorch`, `room.tensorflow`, `room.gpt2`
- `adapter.lora`, `adapter.lora_factory`
- `training.throttle`

### 4.3 `plato-micro` Contract

**Provides:**
- `MicroRoom(task, target="cpu")` — inference room
- `RoomFactory` — create rooms by task + target
- `deploy_micro(task, target)` — one-function deployment
- `deploy_fleet()` — all tasks × all targets
- `TASK_REGISTRY` — canonical task definitions
- `HardwareProfile`, `PROFILES`

**Soft Dependencies:**
- `tensor-spline` → `MeshRegistry.get("compression.recommend")` for variant selection
- `plato-rooms` → uses `LoRAFactory` if available for adapter management
- `plato-intelligence` → none at training time; intelligence may deploy micro models

**Capabilities Registered:**
- `micro.room`, `micro.deploy`, `micro.hardware_profile`
- `micro.task_registry` (read-only dict)

### 4.4 `plato-intelligence` Contract

**Provides:**
- `IntelligenceRoom` — LLM distillation pipeline
- `PreFilter`, `PostFilter` — routing and knowledge extraction
- `SelfTrainer` — idle-loop continuous improvement
- `SemanticMatcher` — Model2Vec + FAISS (graceful fallback to keyword)
- `EisensteinEncoder` — tiny text encoder

**Soft Dependencies:**
- `eisenstein-embed` → `MeshRegistry.get("match.cascade")` for 5-layer matching
- `tensor-spline` → `MeshRegistry.get("layer.spline_linear")` for encoder layers
- `deadband-rs` → `MeshRegistry.get("cache.deadband")` for deadband caching
- `plato-micro` → deploys improved models as micro rooms

**Capabilities Registered:**
- `intelligence.room`, `intelligence.pre_filter`, `intelligence.post_filter`
- `intelligence.self_trainer`, `intelligence.semantic_matcher`
- `encoder.eisenstein`

### 4.5 `plato-fleet` Contract

**Provides:**
- `Collective` — collective inference engine
- `SwarmRoom` — swarm coordination
- `I2I` — instance-to-instance protocol
- `FleetMiner` — git history → training data
- `CommitPredictor` — predictive commit modeling

**Soft Dependencies:**
- `plato-intelligence` → fleet may host intelligence rooms
- `plato-micro` → deploys micro models across fleet
- `constraint-theory-py` → `MeshRegistry.get("constraint.solve")` for constraint validation

**Capabilities Registered:**
- `fleet.collective`, `fleet.swarm_room`, `fleet.i2i`
- `fleet.miner`, `fleet.predictor`

### 4.6 `tensor-spline` Contract

**Provides:**
- `SplineLinear`, `HierarchicalSplineLinear`, `HierarchicalSplineClassifier`
- `LowRankLinear`, `LowRankClassifier`
- `inject_spline()`, `inject_low_rank()`, `inject_hierarchical_spline()`
- `compression_ratio()`, `recommend_variant()`, `VARIANT_GUIDE`
- `EisensteinLattice`

**Soft Dependencies:**
- None (pure layer library)

**Capabilities Registered:**
- `layer.spline_linear`, `layer.hierarchical_spline`, `layer.low_rank_linear`
- `compression.recommend`, `compression.inject`
- `lattice.eisenstein`

### 4.7 `eisenstein-embed` Contract

**Provides:**
- `EisensteinModel` — static embedding model
- `CascadeMatcher` — 5-layer cascade: exact→bitvector→semantic→domain→deadband
- `DeadbandCache` — Python deadband cache
- `DomainSIF` — domain-specific SIF weighting
- `BMAMonitor` — Bayesian Moving Average drift detection
- `SplineLinearQuantizer` — quantization utilities

**Soft Dependencies:**
- `deadband-rs` → `MeshRegistry.get("cache.deadband_rust")` for accelerated cache
- `tensor-spline` → `MeshRegistry.get("layer.spline_linear")` for quantized layers

**Capabilities Registered:**
- `embed.eisenstein`, `match.cascade`, `match.bitvector`
- `cache.deadband`, `monitor.bma`, `quantize.spline`

### 4.8 `deadband-rs` Contract

**Provides:**
- Rust-accelerated deadband cache
- `bma` — Bayesian Moving Average drift detection
- `eisenstein` — Eisenstein integer arithmetic

**Soft Dependencies:**
- None (lowest level)

**Capabilities Registered:**
- `cache.deadband_rust`, `math.bma`, `math.eisenstein`

### 4.9 `constraint-theory-py` Contract

**Provides:**
- Constraint solving primitives
- `plato` bridge module for PLATO integration

**Capabilities Registered:**
- `constraint.solve`, `constraint.adaptive`, `constraint.temporal`

### 4.10 `spectral-conservation` Contract

**Provides:**
- Spectral analysis and conservation laws

**Capabilities Registered:**
- `spectral.analyze`, `spectral.conserve`

---

## 5. Dependency Graph

### 5.1 Hard Dependencies (install_requires)

```
plato-core           →  (none)
plato-rooms          →  plato-core, torch
plato-micro          →  plato-core, torch
plato-intelligence   →  plato-core, torch, numpy
plato-fleet          →  plato-core

tensor-spline        →  torch
eisenstein-embed     →  numpy
deadband-rs          →  (none — Rust extension)
constraint-theory-py →  numpy
spectral-conservation → numpy, scipy
```

### 5.2 Soft Dependencies (runtime capability discovery)

```
plato-rooms ───────soft──────► tensor-spline   (spline layers for compression)
plato-micro ───────soft──────► tensor-spline   (variant recommendation)
plato-micro ───────soft──────► plato-rooms     (LoRA factory reuse)
plato-intelligence ─soft─────► eisenstein-embed (5-layer matching)
plato-intelligence ─soft─────► tensor-spline   (encoder spline layers)
plato-intelligence ─soft─────► deadband-rs     (accelerated cache)
plato-intelligence ─soft─────► plato-micro     (deploy improved models)
plato-fleet ───────soft──────► plato-intelligence (host intel rooms)
plato-fleet ───────soft──────► plato-micro     (fleet-wide micro deploy)
plato-fleet ───────soft──────► constraint-theory-py (constraint validation)
eisenstein-embed ──soft──────► deadband-rs     (Rust cache acceleration)
eisenstein-embed ──soft──────► tensor-spline   (quantized spline layers)
```

### 5.3 Visual Graph

```
                              ┌─────────────────┐
                              │   plato-core    │
                              │  (mesh registry)│
                              └────────┬────────┘
                                       │
         ┌─────────────┬───────────────┼───────────────┬─────────────┐
         ▼             ▼               ▼               ▼             ▼
   ┌──────────┐ ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │plato-rooms│ │plato-micro│   │plato-int │   │plato-fleet│   │tensor-   │
   │           │ │           │   │elligence │   │           │   │spline    │
   └─────┬─────┘ └─────┬─────┘   └─────┬─────┘   └─────┬─────┘   └──────────┘
         │             │               │               │
         └─────────────┴───────┬───────┴───────────────┘
                               ▼
                    ┌─────────────────┐
                    │ eisenstein-embed│
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   deadband-rs   │
                    └─────────────────┘

External (soft-linked only):
  constraint-theory-py  ←→  plato-fleet
  spectral-conservation ←→  plato-fleet, plato-intelligence
```

---

## 6. Cross-Package Composition Examples

### 6.1 Alone: `pip install tensor-spline`

```python
from tensor_spline import SplineLinear
import torch

layer = SplineLinear(64, 32, n_control_points=8)
```
Works perfectly. No mesh, no registry, no overhead.

### 6.2 Pair: `pip install tensor-spline plato-rooms`

```python
from plato_rooms import PyTorchRoom

room = PyTorchRoom("my-model")
room.set_base_model(model)

# PyTorchRoom auto-detects tensor-spline and offers spline injection
room.train(model, dataset, adapter_config=adapter_cfg)
# → internally: if MeshRegistry.has("layer.spline_linear"): use spline LoRA
```

### 6.3 Trio: `pip install plato-micro tensor-spline eisenstein-embed`

```python
from plato_micro import deploy_micro

# deploy_micro sees tensor-spline → recommends spline variant for smooth tasks
# deploy_micro sees eisenstein-embed → offers cascade matcher for drift detection
deploy_micro("drift-detect", target="cpu-tiny")
```

### 6.4 Full Mesh: `pip install plato-{core,rooms,micro,intelligence,fleet} tensor-spline eisenstein-embed`

```python
from plato_intelligence import IntelligenceRoom
from plato_fleet import Collective

# IntelligenceRoom auto-discovers:
#   - tensor-spline → EisensteinEncoder uses SplineLinear layers
#   - eisenstein-embed → semantic matching via CascadeMatcher
#   - deadband-rs → accelerated deadband cache
#   - plato-micro → deploys improved models as MicroRooms

room = IntelligenceRoom("fleet-daemon")
collective = Collective()
collective.add_room(room)

# Fleet collective auto-discovers:
#   - plato-intelligence rooms → hosts them
#   - plato-micro models → deploys across fleet
#   - constraint-theory-py → validates constraint drift predictions
```

---

## 7. `plato-core` Implementation Reference

### 7.1 File: `plato_core/mesh.py`

```python
"""
plato-core mesh — capability registry and auto-discovery.

Usage:
    from plato_core.mesh import MeshRegistry, Capability

    registry = MeshRegistry()
    if registry.has("layer.spline_linear"):
        SplineLinear = registry.call("layer.spline_linear", 64, 32, n_control_points=8)
"""

from __future__ import annotations
import warnings
from dataclasses import dataclass, field
from typing import Any, Callable, Optional, Dict, List


class MeshCapabilityMissing(Exception):
    """Raised when a required capability is not available."""
    pass


@dataclass
class Capability:
    """A named feature offered by a package."""
    name: str
    package: str
    factory: Optional[Callable] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    requires: tuple = ()


class MeshRegistry:
    """
    Global capability registry with lazy entry-point discovery.

    Singleton pattern — all packages share one registry.
    Thread-safe for reads; registration should happen at import time (single-threaded).
    """

    _instance: Optional[MeshRegistry] = None
    _discovered: bool = False

    def __new__(cls) -> MeshRegistry:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._caps: Dict[str, Capability] = {}
        return cls._instance

    def _ensure_discovered(self) -> None:
        if self._discovered:
            return
        self._discovered = True
        try:
            from importlib.metadata import entry_points
            eps = entry_points(group="plato.mesh")
        except Exception:
            eps = []
        for ep in eps:
            try:
                register = ep.load()
                register(self)
            except Exception as e:
                warnings.warn(f"Mesh discovery failed for {ep.name}: {e}", RuntimeWarning)

    def register(self, cap: Capability) -> None:
        self._ensure_discovered()
        key = f"{cap.package}:{cap.name}"
        self._caps[key] = cap

    def get(self, name: str, package: Optional[str] = None) -> Optional[Capability]:
        self._ensure_discovered()
        if package:
            return self._caps.get(f"{package}:{name}")
        for key, cap in self._caps.items():
            if cap.name == name:
                return cap
        return None

    def find(self, prefix: str) -> List[Capability]:
        self._ensure_discovered()
        return [cap for cap in self._caps.values() if cap.name.startswith(prefix)]

    def has(self, name: str) -> bool:
        return self.get(name) is not None

    def require(self, name: str, package: Optional[str] = None) -> Capability:
        cap = self.get(name, package=package)
        if cap is None:
            raise MeshCapabilityMissing(f"Capability {name!r} not found. "
                                        f"Install a package that provides it.")
        return cap

    def call(self, name: str, *args, **kwargs) -> Any:
        cap = self.require(name)
        if cap.factory is None:
            raise MeshCapabilityMissing(f"Capability {name!r} has no factory.")
        return cap.factory(*args, **kwargs)

    @property
    def packages(self) -> set:
        self._ensure_discovered()
        return {cap.package for cap in self._caps.values()}

    @property
    def capabilities(self) -> Dict[str, Capability]:
        self._ensure_discovered()
        return dict(self._caps)
```

### 7.2 File: `plato_core/__init__.py`

```python
"""
plato-core — Base types and mesh registry for the SuperInstance ecosystem.

Zero dependencies. Safe to import anywhere.
"""

from .types import (
    TileType, TileLifecycle,
    AdapterConfig, TrainingConfig, TrainingMetrics,
    TrainingTile, LifecycleEvent,
    content_hash,
)
from .lamport import LamportClock, VectorClock, CausalOrder, ConcurrentDetector
from .tile_lifecycle import DeprecationNotice, LineageTracker, ConflictResolver
from .store import TileStore, LocalTileStore
from .mesh import MeshRegistry, Capability, MeshCapabilityMissing

__version__ = "2.0.0"
```

---

## 8. Migration Path from Monolith

### Step 1: Create `plato-core` (1 day)
- Extract `types.py`, `store.py`, `lamport.py`, `tile_lifecycle.py` from `plato-training`
- Add `mesh.py` registry
- Publish `plato-core==1.0.0`

### Step 2: Split `plato-training` into 4 packages (2-3 days)
- `plato-rooms`: training engines + adapters
- `plato-micro`: micro models + hardware
- `plato-intelligence`: intelligence pipeline
- `plato-fleet`: collective + I2I
- Each package gets `mesh.py` + entry points
- Update imports from `plato_training.X` to `plato_X.Y`

### Step 3: Add mesh hooks to existing packages (1 day)
- `tensor-spline`: add `mesh.py`, register layer capabilities
- `eisenstein-embed`: add `mesh.py`, register cascade + embed capabilities
- `deadband-rs`: add Python `mesh.py` shim (or PyO3 module registers directly)

### Step 4: Deprecate `plato-training` (ongoing)
- `plato-training` becomes a **metapackage**:
  ```toml
  [project]
  name = "plato-training"
  version = "1.0.0"
  dependencies = [
      "plato-core>=1.0",
      "plato-rooms>=1.0",
      "plato-micro>=1.0",
      "plato-intelligence>=1.0",
      "plato-fleet>=1.0",
  ]
  ```
- Keep for backward compatibility; new code imports from subpackages directly.

---

## 9. Testing the Mesh

### 9.1 Unit Test: Capability Registration

```python
# test_mesh.py
import pytest
from plato_core.mesh import MeshRegistry, Capability, MeshCapabilityMissing

@pytest.fixture(autouse=True)
def clean_registry():
    reg = MeshRegistry()
    reg._caps.clear()
    reg._discovered = True  # skip entry-point scanning
    yield reg
    reg._caps.clear()

def test_register_and_get():
    reg = MeshRegistry()
    reg.register(Capability(name="test.foo", package="test", factory=lambda: 42))
    assert reg.has("test.foo")
    assert reg.call("test.foo") == 42

def test_missing_capability():
    reg = MeshRegistry()
    assert not reg.has("test.missing")
    with pytest.raises(MeshCapabilityMissing):
        reg.require("test.missing")
```

### 9.2 Integration Test: Cross-Package Composition

```python
# test_composition.py
import pytest

def test_tensor_spline_registers_layers():
    pytest.importorskip("tensor_spline")
    pytest.importorskip("plato_core")
    from plato_core.mesh import MeshRegistry
    reg = MeshRegistry()
    assert reg.has("layer.spline_linear")
    assert reg.has("layer.low_rank_linear")

def test_intelligence_room_with_spline():
    pytest.importorskip("plato_intelligence")
    pytest.importorskip("tensor_spline")
    from plato_intelligence import IntelligenceRoom
    room = IntelligenceRoom("test")
    # If tensor-spline is present, encoder uses spline layers
    if room.has_spline():
        assert room.encoder_is_spline()
```

---

## 10. Appendix: Capability Namespace Reference

| Namespace | Capability | Provider | Description |
|-----------|-----------|----------|-------------|
| `room.*` | `room.pytorch` | plato-rooms | PyTorch training room |
| `room.*` | `room.tensorflow` | plato-rooms | TensorFlow training room |
| `room.*` | `room.gpt2` | plato-rooms | GPT-2 specific room |
| `adapter.*` | `adapter.lora` | plato-rooms | LoRA layer + injection |
| `adapter.*` | `adapter.lora_factory` | plato-rooms | Multi-adapter factory |
| `training.*` | `training.throttle` | plato-rooms | Fleet-aware throttle |
| `micro.*` | `micro.room` | plato-micro | Micro inference room |
| `micro.*` | `micro.deploy` | plato-micro | Deployment function |
| `micro.*` | `micro.task_registry` | plato-micro | Task definitions |
| `intelligence.*` | `intelligence.room` | plato-intel | Intelligence room |
| `intelligence.*` | `intelligence.pre_filter` | plato-intel | Pre-filter micro-model |
| `intelligence.*` | `intelligence.post_filter` | plato-intel | Post-filter micro-model |
| `intelligence.*` | `intelligence.self_trainer` | plato-intel | Self-training loop |
| `intelligence.*` | `intelligence.semantic_matcher` | plato-intel | Semantic matching |
| `encoder.*` | `encoder.eisenstein` | plato-intel | Tiny text encoder |
| `fleet.*` | `fleet.collective` | plato-fleet | Collective inference |
| `fleet.*` | `fleet.swarm_room` | plato-fleet | Swarm coordination |
| `fleet.*` | `fleet.i2i` | plato-fleet | Instance protocol |
| `fleet.*` | `fleet.miner` | plato-fleet | Git history miner |
| `layer.*` | `layer.spline_linear` | tensor-spline | Spline linear layer |
| `layer.*` | `layer.hierarchical_spline` | tensor-spline | Hierarchical spline |
| `layer.*` | `layer.low_rank_linear` | tensor-spline | Low-rank layer |
| `compression.*` | `compression.recommend` | tensor-spline | Variant selector |
| `compression.*` | `compression.inject` | tensor-spline | Injection utilities |
| `lattice.*` | `lattice.eisenstein` | tensor-spline | Eisenstein lattice math |
| `embed.*` | `embed.eisenstein` | eisenstein-embed | Static embed model |
| `match.*` | `match.cascade` | eisenstein-embed | 5-layer cascade |
| `match.*` | `match.bitvector` | eisenstein-embed | Bitvector matching |
| `cache.*` | `cache.deadband` | eisenstein-embed | Python deadband cache |
| `cache.*` | `cache.deadband_rust` | deadband-rs | Rust deadband cache |
| `monitor.*` | `monitor.bma` | eisenstein-embed | BMA drift detection |
| `quantize.*` | `quantize.spline` | eisenstein-embed | Spline quantizer |
| `constraint.*` | `constraint.solve` | constraint-theory-py | Constraint solver |
| `constraint.*` | `constraint.adaptive` | constraint-theory-py | Adaptive constraints |
| `constraint.*` | `constraint.temporal` | constraint-theory-py | Temporal constraints |
| `spectral.*` | `spectral.analyze` | spectral-conservation | Spectral analysis |
| `spectral.*` | `spectral.conserve` | spectral-conservation | Conservation laws |

---

*End of Specification*
