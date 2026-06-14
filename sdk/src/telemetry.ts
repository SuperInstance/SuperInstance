// ─── SuperInstance Conservation Telemetry Reporter ───────────────────────────
//
// Reports fleet conservation state to external monitoring:
// - conservation-meter daemon (port 8798) — Loom's dashboard
// - fleet-dashboard-api — our Cloudflare Worker
// - Any HTTP endpoint that accepts POST /telemetry
//
// Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585 bits
//

import type { Fleet } from './sdk.js';
import type { FleetStatus, ConservationState } from './types.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/** A serializable fleet snapshot for telemetry reporting */
export interface FleetSnapshot {
  fleetName: string;
  timestamp: number;
  agentCount: number;
  activeAgents: number;
  uptime: number;
  convergenceDelta: number;
  conservation: {
    gamma: number;
    eta: number;
    C: number;
    delta: number;
    status: ConservationState['status'];
  };
}

/** Configuration for the telemetry reporter */
export interface TelemetryConfig {
  /** Endpoint URL, e.g. 'http://localhost:8798' or a Worker URL */
  endpoint: string;
  /** Reporting interval in milliseconds (default 5000) */
  intervalMs: number;
  /** Fleet name override (defaults to fleet.name) */
  fleetName: string;
}

/** Conservation alert fired when status changes */
export interface ConservationAlert {
  level: ConservationState['status'];
  /** δ delta from previous report */
  delta: number;
  /** Human-readable message */
  message: string;
  timestamp: number;
}

// ─── TelemetryReporter ───────────────────────────────────────────────────────

/**
 * Reports fleet conservation state to an external monitoring endpoint.
 *
 * @example
 * ```typescript
 * const reporter = new TelemetryReporter({
 *   endpoint: 'http://localhost:8798',
 *   intervalMs: 5000,
 *   fleetName: 'my-fleet',
 * });
 * reporter.onAlert((alert) => console.log(alert.message));
 * reporter.attach(fleet);
 * ```
 */
export class TelemetryReporter {
  private config: TelemetryConfig;
  private fleet: Fleet | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private alertCallbacks: Array<(alert: ConservationAlert) => void> = [];
  private prevStatus: ConservationState['status'] | null = null;
  private prevDelta: number | null = null;
  private consecutiveFailures: number = 0;
  private reporting: boolean = false;

  constructor(config: TelemetryConfig) {
    this.config = {
      ...config,
      intervalMs: config.intervalMs ?? 5000,
    };
  }

  /**
   * Attach to a fleet and start periodic reporting.
   * Calling attach while already attached will detach first.
   */
  attach(fleet: Fleet): void {
    // Detach previous if any
    this.detach();

    this.fleet = fleet;
    this.prevStatus = null;
    this.prevDelta = null;
    this.consecutiveFailures = 0;

    // Start periodic reporting
    this.timer = setInterval(() => {
      void this.reportOnce();
    }, this.config.intervalMs);
  }

  /**
   * Stop reporting and detach from the fleet.
   */
  detach(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.fleet = null;
    this.prevStatus = null;
    this.prevDelta = null;
    this.consecutiveFailures = 0;
  }

  /**
   * Register a callback for conservation status changes.
   * Multiple callbacks are supported.
   */
  onAlert(cb: (alert: ConservationAlert) => void): void {
    this.alertCallbacks.push(cb);
  }

  /**
   * Send a single telemetry report now.
   * Handles connection failures with retry (3x) then exponential backoff.
   */
  async reportOnce(): Promise<void> {
    if (!this.fleet) return;
    if (this.reporting) return; // Prevent overlapping reports
    this.reporting = true;

    try {
      const snapshot = this.captureSnapshot(this.fleet);
      this.checkAlerts(snapshot);
      await this.sendWithRetry(snapshot);
      this.consecutiveFailures = 0;
    } catch (err) {
      this.consecutiveFailures++;
      // After 3 consecutive failures, increase the interval (backoff)
      if (this.consecutiveFailures === 3 && this.timer !== null) {
        clearInterval(this.timer);
        const backoffMs = this.config.intervalMs * 4;
        this.timer = setInterval(() => {
          void this.reportOnce();
        }, backoffMs);
      }
      // Silently swallow — telemetry must never crash the fleet
    } finally {
      this.reporting = false;
    }
  }

  /** Whether the reporter is currently attached and sending */
  get isAttached(): boolean {
    return this.fleet !== null && this.timer !== null;
  }

  /** Current consecutive failure count */
  get failureCount(): number {
    return this.consecutiveFailures;
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  /** Capture a serializable snapshot from the fleet */
  private captureSnapshot(fleet: Fleet): FleetSnapshot {
    const status: FleetStatus = fleet.status();
    return {
      fleetName: this.config.fleetName || status.name,
      timestamp: Date.now(),
      agentCount: status.agentCount,
      activeAgents: status.activeAgents,
      uptime: status.uptime,
      convergenceDelta: status.convergenceDelta,
      conservation: {
        gamma: status.conservation.gamma,
        eta: status.conservation.eta,
        C: status.conservation.C,
        delta: status.conservation.delta,
        status: status.conservation.status,
      },
    };
  }

  /** Check for status changes and fire alert callbacks */
  private checkAlerts(snapshot: FleetSnapshot): void {
    const currentStatus = snapshot.conservation.status;

    if (this.prevStatus !== null && this.prevStatus !== currentStatus) {
      const deltaChange = this.prevDelta !== null
        ? snapshot.conservation.delta - this.prevDelta
        : 0;

      const alert: ConservationAlert = {
        level: currentStatus,
        delta: deltaChange,
        message: `Fleet "${snapshot.fleetName}" conservation status changed: ${this.prevStatus} → ${currentStatus} (δ=${snapshot.conservation.delta.toFixed(4)})`,
        timestamp: snapshot.timestamp,
      };

      for (const cb of this.alertCallbacks) {
        try {
          cb(alert);
        } catch {
          // Callback errors must not crash reporting
        }
      }
    }

    this.prevStatus = currentStatus;
    this.prevDelta = snapshot.conservation.delta;
  }

  /** POST snapshot to endpoint with up to 3 retries */
  private async sendWithRetry(snapshot: FleetSnapshot): Promise<void> {
    const url = `${this.config.endpoint.replace(/\/+$/, '')}/telemetry`;
    const body = JSON.stringify(snapshot);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok || res.status === 202 || res.status === 200) {
          return; // Success
        }

        // 4xx — don't retry, it's a client error
        if (res.status >= 400 && res.status < 500) {
          return;
        }

        // 5xx — retry
      } catch {
        // Network error — retry
      }

      // Exponential backoff between retries: 100ms, 200ms
      if (attempt < 2) {
        await sleep(100 * Math.pow(2, attempt));
      }
    }

    // All retries exhausted — throw to let caller handle
    throw new Error(`Telemetry POST failed after 3 attempts to ${url}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
