/**
 * Production harbor-daemon TCP integration.
 * Loom's harbor-daemon runs on port 8796 (TCP) + 8797 (HTTP health).
 */

import { Fleet } from './sdk.js';
import type { CapabilityResponse } from './types.js';
import { createConnection, createServer, type Socket } from 'net';
import { request } from 'http';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HarborConfig {
  host: string;
  port: number;       // TCP port (default 8796)
  healthPort: number; // HTTP port (default 8797)
  timeoutMs: number;  // connection timeout (default 5000)
}

export interface HarborBottle {
  uuid: string;
  sender: string;
  role: string;
  payload: string;
  created: string;
  ttl: number;
  delivered: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: HarborConfig = {
  host: '127.0.0.1',
  port: 8796,
  healthPort: 8797,
  timeoutMs: 5000,
};

// ---------------------------------------------------------------------------
// HarborBridge
// ---------------------------------------------------------------------------

export class HarborBridge {
  readonly config: HarborConfig;
  private activeSockets: Set<Socket>;

  constructor(config?: Partial<HarborConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.activeSockets = new Set();
  }

  // ---- TCP helpers -------------------------------------------------------

  private tcpSend<T>(command: object): Promise<T> {
    return new Promise((resolve, reject) => {
      let socket: Socket | undefined;
      let settled = false;

      const cleanup = () => {
        if (socket) {
          this.activeSockets.delete(socket);
          socket.destroy();
        }
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(`Harbor TCP timeout after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);

      try {
        socket = createConnection(
          { host: this.config.host, port: this.config.port },
          () => {
            const line = JSON.stringify(command) + '\n';
            socket!.write(line);
          },
        );
      } catch (err) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`Harbor connection failed: ${(err as Error).message}`));
        return;
      }

      this.activeSockets.add(socket);

      let buffer = '';

      socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        const nl = buffer.indexOf('\n');
        if (nl !== -1) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          cleanup();
          const line = buffer.slice(0, nl);
          try {
            const parsed = JSON.parse(line);
            resolve(parsed as T);
          } catch {
            reject(new Error(`Harbor returned malformed JSON: ${line}`));
          }
        }
      });

      socket.on('error', (err: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(new Error(`Harbor TCP error: ${err.message}`));
      });

      socket.on('close', () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        cleanup();
        reject(new Error('Harbor connection closed before response'));
      });
    });
  }

  // ---- HTTP health -------------------------------------------------------

  async health(): Promise<{ status: string; bottles: number }> {
    return new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: this.config.host,
          port: this.config.healthPort,
          path: '/health',
          method: 'GET',
          timeout: this.config.timeoutMs,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk: Buffer) => { body += chunk.toString('utf8'); });
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              reject(new Error(`Harbor health returned malformed JSON: ${body}`));
            }
          });
        },
      );
      req.on('error', (err: Error) => {
        reject(new Error(`Harbor health check failed: ${err.message}`));
      });
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Harbor health timeout after ${this.config.timeoutMs}ms`));
      });
      req.end();
    });
  }

  // ---- Bottle operations -------------------------------------------------

  async sendBottle(bottle: HarborBottle): Promise<void> {
    await this.tcpSend<{ ok: boolean }>({
      action: 'send',
      bottle,
    });
  }

  async getBottle(uuid: string): Promise<HarborBottle | null> {
    const res = await this.tcpSend<{ bottle: HarborBottle | null }>({
      action: 'get',
      uuid,
    });
    return res.bottle ?? null;
  }

  async listBySender(sender: string): Promise<HarborBottle[]> {
    const res = await this.tcpSend<{ bottles: HarborBottle[] }>({
      action: 'list',
      filter: 'sender',
      sender,
    });
    return res.bottles ?? [];
  }

  async listUndelivered(): Promise<HarborBottle[]> {
    const res = await this.tcpSend<{ bottles: HarborBottle[] }>({
      action: 'list',
      filter: 'undelivered',
    });
    return res.bottles ?? [];
  }

  // ---- Fleet attachment --------------------------------------------------

  attach(fleet: Fleet): void {
    // Delegate capability — route through harbor as a bottle
    fleet.capability('delegate', async (ctx: { sender: string; role: string; payload: string }) => {
      const bottle: HarborBottle = {
        uuid: crypto.randomUUID(),
        sender: ctx.sender,
        role: ctx.role,
        payload: ctx.payload,
        created: new Date().toISOString(),
        ttl: 3600,
        delivered: false,
      };
      await this.sendBottle(bottle);
      const response: CapabilityResponse = {
        ok: true,
        result: { uuid: bottle.uuid },
      };
      return response;
    });

    // Crate-info capability — fetch from harbor by sender
    fleet.capability('crate-info', async (ctx: { sender: string }) => {
      const bottles = await this.listBySender(ctx.sender);
      const response: CapabilityResponse = {
        ok: true,
        result: { count: bottles.length, bottles },
      };
      return response;
    });
  }
}

// ---------------------------------------------------------------------------
// Convenience functions
// ---------------------------------------------------------------------------

export async function connectHarbor(
  config?: Partial<HarborConfig>,
): Promise<HarborBridge> {
  const bridge = new HarborBridge(config);
  // Verify connectivity with a health check
  await bridge.health();
  return bridge;
}

export async function createHarborFleet(
  harborAddr?: string,
  fleetName?: string,
): Promise<{ fleet: Fleet; harbor: HarborBridge }> {
  const harborHost = harborAddr?.split(':')[0] ?? '127.0.0.1';
  const harborPort = harborAddr ? parseInt(harborAddr.split(':')[1], 10) : undefined;

  const harbor = new HarborBridge({
    host: harborHost,
    ...(harborPort ? { port: harborPort } : {}),
  });

  const fleet = new Fleet(fleetName ?? 'harbor-fleet');
  harbor.attach(fleet);

  return { fleet, harbor };
}
