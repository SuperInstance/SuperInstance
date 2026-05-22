/**
 * SuperInstance Fleet Schema Registry
 * Re-exports all schema types for the fleet
 */
export declare const SCHEMA_VERSION = "1.0.0";
export { type ServiceStatus, type AgentStatus, type HealthReport } from './fleet-health';
export { type Constraint, type MutableConstraintModel, type OverridePattern, type OverrideEvent, type DecisionDelta, type ConstraintOperator } from './constraint-model';
export { type IntentGoal, type IntentSignal, type NavigationPattern, type NavigationStep, type RetryPolicy, type ProductiveLane } from './productive-lane';
export { type TileQualityLabel, type QualityScore } from './quality-score';
export { type TrustVector, type TrustHistoryEntry, type VesselIdentity, type FleetGraph, type FleetNode, type FleetEdge } from './trust-vector';
export { ShellType, Capability, type TurboManifest } from './turbo-shell';
export { type RoomMetadata, type PlatoTile, type SubmitResponse, type ErrorResponse, type SubmitResult } from './plato-tile';
