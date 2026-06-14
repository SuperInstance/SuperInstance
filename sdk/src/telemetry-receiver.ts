// ─── SuperInstance Telemetry Receiver ────────────────────────────────────────
//
// Receives telemetry from multiple fleets and aggregates them.
// This is the SDK-side counterpart to conservation-meter daemon.
//
// Use case: A central monitor that watches several fleets at once,
// computing aggregate conservation health across the entire organisation.
//

import type { FleetSnapshot } from './telemetry.js';

/** Aggregate metrics across all observed fleets */
export interface AggregateMetrics {
  totalAgents: number;
  totalActiveAgents: number;
  avgDelta: number;
  fleetCount: number;
  /** Fleets with violated or tight conservation status */
  atRiskFleets: string[];
  /** Oldest snapshot age in ms (0 if none) */
  maxAge: number;
}

/**
 * TelemetryReceiver — aggregates snapshots from multiple fleets.
 *
 * @example
 * ```typescript
 * const receiver = new TelemetryReceiver();
 *
 * // In an HTTP handler:
 * receiver.ingest(parsedSnapshot);
 *
 * // Query:
 * const agg = receiver.getAggregate();
 * console.log(`${agg.fleetCount} fleets, ${agg.totalAgents} agents, avg δ=${agg.avgDelta.toFixed(3)}`);
 * ```
 */
export class TelemetryReceiver {
  private fleets: Map<string, FleetSnapshot> = new Map();

  /**
   * Ingest a fleet snapshot. Updates if fleet already known.
   * Snapshots older than 60s are automatically pruned on ingest.
   */
  ingest(snapshot: FleetSnapshot): void {
    this.fleets.set(snapshot.fleetName, snapshot);
    this.pruneStale();
  }

  /** Get the latest snapshot for a specific fleet */
  getFleet(name: string): FleetSnapshot | undefined {
    return this.fleets.get(name);
  }

  /** Get all current fleet snapshots */
  getAll(): FleetSnapshot[] {
    return Array.from(this.fleets.values());
  }

  /** Number of fleets currently tracked */
  get size(): number {
    return this.fleets.size;
  }

  /**
   * Compute aggregate metrics across all observed fleets.
   */
  getAggregate(): AggregateMetrics {
    const snapshots = this.getAll();
    const now = Date.now();

    if (snapshots.length === 0) {
      return {
        totalAgents: 0,
        totalActiveAgents: 0,
        avgDelta: 0,
        fleetCount: 0,
        atRiskFleets: [],
        maxAge: 0,
      };
    }

    let totalAgents = 0;
    let totalActiveAgents = 0;
    let deltaSum = 0;
    const atRiskFleets: string[] = [];
    let maxAge = 0;

    for (const snap of snapshots) {
      totalAgents += snap.agentCount;
      totalActiveAgents += snap.activeAgents;
      deltaSum += snap.conservation.delta;

      if (snap.conservation.status === 'violated' || snap.conservation.status === 'tight') {
        atRiskFleets.push(snap.fleetName);
      }

      const age = now - snap.timestamp;
      if (age > maxAge) maxAge = age;
    }

    return {
      totalAgents,
      totalActiveAgents,
      avgDelta: deltaSum / snapshots.length,
      fleetCount: snapshots.length,
      atRiskFleets,
      maxAge,
    };
  }

  /** Remove a fleet from tracking */
  remove(name: string): boolean {
    return this.fleets.delete(name);
  }

  /** Clear all fleet data */
  clear(): void {
    this.fleets.clear();
  }

  /** Get list of fleet names currently tracked */
  getFleetNames(): string[] {
    return Array.from(this.fleets.keys());
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  /** Remove snapshots older than 60 seconds */
  private pruneStale(): void {
    const cutoff = Date.now() - 60_000;
    for (const [name, snap] of this.fleets) {
      if (snap.timestamp < cutoff) {
        this.fleets.delete(name);
      }
    }
  }
}
