/**
 * SuperInstance ↔ Oracle2 Conservation Meter Bridge
 *
 * Loom built a conservation-meter daemon on port 8798.
 * This bridge lets our SDK READ from it and REPORT to it.
 *
 * Two-way glue:
 *   SDK → conservation-meter: report fleet status
 *   conservation-meter → SDK: read aggregate fleet health
 */

import { Fleet } from '@superinstance/sdk';

export interface ConservationMeterReading {
  gamma: number;
  eta: number;
  C: number;
  delta: number;
  status: 'healthy' | 'monitor' | 'tight' | 'violated';
  agentCount: number;
  timestamp: number;
}

export interface ConservationMeterConfig {
  host: string;
  port: number;  // 8798 for Loom's conservation-meter
}

const DEFAULT_METER_CONFIG: ConservationMeterConfig = {
  host: 'localhost',
  port: 8798,
};

/**
 * Read conservation state from Loom's conservation-meter daemon.
 */
export async function readConservationMeter(
  config?: Partial<ConservationMeterConfig>
): Promise<ConservationMeterReading> {
  const cfg = { ...DEFAULT_METER_CONFIG, ...config };
  const res = await fetch(`http://${cfg.host}:${cfg.port}/`);
  if (!res.ok) throw new Error(`Conservation meter returned ${res.status}`);
  return res.json();
}

/**
 * Report SDK fleet status TO Loom's conservation-meter.
 * Sends a POST with the fleet's current conservation snapshot.
 */
export async function reportFleetToMeter(
  fleet: Fleet,
  config?: Partial<ConservationMeterConfig>
): Promise<{ accepted: boolean }> {
  const cfg = { ...DEFAULT_METER_CONFIG, ...config };
  const status = fleet.status();

  const payload = {
    fleetName: status.name,
    gamma: status.conservation.gamma,
    eta: status.conservation.eta,
    C: status.conservation.C,
    delta: status.conservation.delta,
    status: status.conservation.status,
    agentCount: status.agentCount,
    activeAgents: status.activeAgents,
    timestamp: Date.now(),
  };

  const res = await fetch(`http://${cfg.host}:${cfg.port}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Report failed: ${res.status}`);
  return res.json();
}

/**
 * Start a periodic sync between SDK fleet and conservation-meter.
 * Reports every intervalMs, reads back aggregate state.
 */
export function syncWithMeter(
  fleet: Fleet,
  config?: Partial<ConservationMeterConfig> & { intervalMs?: number }
): { stop: () => void } {
  const intervalMs = config?.intervalMs ?? 3000;
  const timer = setInterval(async () => {
    try {
      await reportFleetToMeter(fleet, config);
    } catch {
      // Silent fail — meter might be down, fleet keeps running
    }
  }, intervalMs);

  return {
    stop: () => clearInterval(timer),
  };
}

/**
 * Compare SDK fleet's internal conservation state with Loom's meter.
 * Useful for detecting drift between the two systems.
 */
export async function compareConservation(
  fleet: Fleet,
  config?: Partial<ConservationMeterConfig>
): Promise<{
  sdk: ConservationMeterReading;
  meter: ConservationMeterReading;
  drift: { gammaDelta: number; etaDelta: number; deltaDelta: number };
}> {
  const [meterReading] = await Promise.all([
    readConservationMeter(config),
  ]);

  const sdkStatus = fleet.status();
  const sdkReading: ConservationMeterReading = {
    gamma: sdkStatus.conservation.gamma,
    eta: sdkStatus.conservation.eta,
    C: sdkStatus.conservation.C,
    delta: sdkStatus.conservation.delta,
    status: sdkStatus.conservation.status,
    agentCount: sdkStatus.agentCount,
    timestamp: Date.now(),
  };

  return {
    sdk: sdkReading,
    meter: meterReading,
    drift: {
      gammaDelta: Math.abs(sdkReading.gamma - meterReading.gamma),
      etaDelta: Math.abs(sdkReading.eta - meterReading.eta),
      deltaDelta: Math.abs(sdkReading.delta - meterReading.delta),
    },
  };
}
