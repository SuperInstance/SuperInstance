# @superinstance/schemas

JSON Schema definitions for all SuperInstance fleet types — the canonical type system for inter-agent communication, fleet graphs, constraint models, and tile quality scoring.

## Overview

This package provides validated JSON Schema definitions for 40+ types used across the SuperInstance ecosystem:

- **Fleet Graph**: `FleetNode`, `FleetEdge`, `FleetGraph`, `VesselIdentity`
- **Constraint Models**: `Constraint`, `MutableConstraintModel`, `ConstraintOperator`
- **Intent & Navigation**: `IntentGoal`, `IntentSignal`, `NavigationPattern`, `NavigationStep`, `RetryPolicy`
- **Health & Status**: `ServiceStatus`, `AgentStatus`, `HealthReport`, `PlatoHealthStatus`
- **Quality & Trust**: `QualityScore`, `TrustVector`, `TrustHistoryEntry`, `TileQualityLabel`
- **Productive Lanes**: `ProductiveLane`, `ProductiveLaneStatus`
- **Override System**: `OverridePattern`, `OverrideEvent`, `DecisionDelta`
- **Tiles & Rooms**: `PlatoTile`, `RoomMetadata`, `TurboManifest`, `ShellType`
- **API Types**: `SubmitResponse`, `ErrorResponse`, `SubmitResult`

## Install

```bash
npm install @superinstance/schemas
```

## Usage

```typescript
import { schemas } from '@superinstance/schemas';

// Validate against a schema
const fleetNode = { id: 'vessel-1', status: 'active', ... };
const valid = schemas.FleetNode.validate(fleetNode);
```

## Schema Version

Current schema version: `1.0.0` ([view full schemas.json](./schemas.json))

## License

MIT — Part of the [SuperInstance](https://github.com/SuperInstance) ecosystem.
