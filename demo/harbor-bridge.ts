/**
 * SuperInstance Harbor Bridge
 *
 * Glue between @superinstance/sdk and Loom's harbor-daemon (port 8796).
 * Lets governed SDK agents delegate through the harbor to Oracle2's fleet.
 *
 * Usage:
 *   import { Fleet } from '@superinstance/sdk';
 *   import { connectHarbor } from './harbor-bridge';
 *
 *   const fleet = new Fleet({ name: 'my-fleet' });
 *   const harbor = await connectHarbor('localhost:8796');
 *   harbor.attach(fleet);  // registers 'delegate' + 'crate-info' handlers
 *
 *   // Now any SDK agent can delegate through the harbor:
 *   const result = await agent.delegate('researcher', 'find patterns');
 *   // → goes through harbor-daemon → reaches Oracle2's agents
 */

import { Fleet } from '@superinstance/sdk';
import type { CapabilityResponse } from '@superinstance/sdk';

export interface HarborBottle {
  uuid: string;
  sender: string;
  role: string;
  payload: string;
  created: string;
  ttl: number;
  delivered: boolean;
}

export interface HarborConfig {
  host: string;
  port: number;
  healthPort: number;
}

const DEFAULT_CONFIG: HarborConfig = {
  host: 'localhost',
  port: 8796,
  healthPort: 8797,
};

/**
 * Connect to a harbor-daemon instance.
 * Tests connectivity and returns a bridge object.
 */
export async function connectHarbor(config?: Partial<HarborConfig>): Promise<HarborBridge> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Health check
  try {
    const res = await fetch(`http://${cfg.host}:${cfg.healthPort}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    const health = await res.json() as { status: string; bottles: number };
    if (health.status !== 'ok') throw new Error(`Harbor unhealthy: ${health.status}`);
  } catch (e) {
    throw new Error(`Cannot reach harbor-daemon at ${cfg.host}:${cfg.healthPort}: ${(e as Error).message}`);
  }

  return new HarborBridge(cfg);
}

/**
 * Bridge between SuperInstance SDK fleet and harbor-daemon.
 */
export class HarborBridge {
  readonly config: HarborConfig;
  private socket: Deno.Conn | null = null;

  constructor(config: HarborConfig) {
    this.config = config;
  }

  /**
   * Attach to a fleet — registers harbor-backed capability handlers.
   * This replaces the SDK's default local-only handlers with harbor-routed ones.
   */
  attach(fleet: Fleet): void {
    // Register 'delegate' handler — routes through harbor as a bottle
    fleet.registerCapability('delegate', async (req) => {
      const bottle: HarborBottle = {
        uuid: crypto.randomUUID(),
        sender: req.agentId,
        role: String(req.params.toRole ?? 'unknown'),
        payload: JSON.stringify({ task: req.params.task, budget: req.params.gammaBudget ?? 0.1 }),
        created: new Date().toISOString(),
        ttl: 3600,
        delivered: false,
      };

      await this.sendBottle(bottle);

      // Poll for response (in production, use harbor's push notification)
      const response = await this.waitForResponse(bottle.uuid, 30000);

      return {
        success: response !== null,
        data: response,
        gammaCost: 0.02,
        etaProduced: response ? 0.15 : 0,
      } as CapabilityResponse;
    });

    // Register 'crate-info' handler — query harbor for crate metadata
    fleet.registerCapability('crate-info', async (req) => {
      const crateName = String(req.params.name ?? '');
      const bottle: HarborBottle = {
        uuid: crypto.randomUUID(),
        sender: req.agentId,
        role: 'lookup',
        payload: JSON.stringify({ action: 'crate-info', crate: crateName }),
        created: new Date().toISOString(),
        ttl: 300,
        delivered: false,
      };

      await this.sendBottle(bottle);
      const info = await this.waitForResponse(bottle.uuid, 10000);

      return {
        success: info !== null,
        data: info,
        gammaCost: 0.01,
        etaProduced: info ? 0.05 : 0,
      } as CapabilityResponse;
    });
  }

  /**
   * Send a bottle to the harbor-daemon via TCP.
   */
  private async sendBottle(bottle: HarborBottle): Promise<void> {
    const data = JSON.stringify(bottle) + '\n';
    // Use net.Socket via Node's net module
    const { Socket } = await import('net');
    return new Promise((resolve, reject) => {
      const sock = new Socket();
      sock.connect(this.config.port, this.config.host, () => {
        sock.write(data, () => {
          sock.end();
          resolve();
        });
      });
      sock.on('error', reject);
      setTimeout(() => { sock.destroy(); reject(new Error('Harbor send timeout')); }, 5000);
    });
  }

  /**
   * Wait for a response bottle from the harbor.
   * In production, this would use harbor's push notification or WebSocket.
   */
  private async waitForResponse(_uuid: string, _timeoutMs: number): Promise<unknown> {
    // Placeholder: poll harbor for response bottles
    // Real implementation would subscribe to harbor events
    return null; // simulated — real version queries harbor for delivery
  }

  /**
   * Check harbor health.
   */
  async health(): Promise<{ status: string; bottles: number }> {
    const res = await fetch(`http://${this.config.host}:${this.config.healthPort}/health`);
    return res.json();
  }

  /**
   * List undelivered bottles in the harbor.
   */
  async listUndelivered(): Promise<HarborBottle[]> {
    // Connect via TCP and send list-undelivered command
    const { Socket } = await import('net');
    return new Promise((resolve, reject) => {
      const sock = new Socket();
      let buf = '';
      sock.connect(this.config.port, this.config.host, () => {
        sock.write('list-undelivered\n');
      });
      sock.on('data', (data) => {
        buf += data.toString();
        if (buf.includes('\n')) {
          try { resolve(JSON.parse(buf.trim())); } catch { resolve([]); }
          sock.destroy();
        }
      });
      sock.on('error', reject);
      setTimeout(() => { sock.destroy(); resolve([]); }, 5000);
    });
  }
}

/**
 * One-line convenience: create fleet + attach harbor.
 *
 * @example
 * const { fleet, harbor } = await createHarborFleet('localhost:8796');
 * const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
 * await agent.delegate('researcher', 'find patterns');
 * // → routes through harbor to Oracle2's fleet
 */
export async function createHarborFleet(
  harborAddr: string = 'localhost:8796',
  fleetName: string = 'harbor-fleet'
): Promise<{ fleet: Fleet; harbor: HarborBridge }> {
  const [host, portStr] = harborAddr.split(':');
  const port = parseInt(portStr) || 8796;

  const harbor = await connectHarbor({ host, port });
  const fleet = new Fleet({ name: fleetName });
  harbor.attach(fleet);

  return { fleet, harbor };
}
