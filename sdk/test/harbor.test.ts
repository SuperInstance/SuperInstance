import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server, type Socket } from 'net';
import { createServer as createHttpServer, type Server as HttpServer } from 'http';
import { HarborBridge, type HarborBottle } from '../src/harbor.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBottle(overrides?: Partial<HarborBottle>): HarborBottle {
  return {
    uuid: crypto.randomUUID(),
    sender: 'test-sender',
    role: 'test-role',
    payload: 'hello harbor',
    created: new Date().toISOString(),
    ttl: 3600,
    delivered: false,
    ...overrides,
  };
}

/** Minimal TCP server that responds to JSON-line commands. */
function startMockTcp(
  handler: (cmd: any) => any,
): Promise<{ server: Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = createServer((sock: Socket) => {
      let buf = '';
      sock.on('data', (chunk: Buffer) => {
        buf += chunk.toString('utf8');
        const nl = buf.indexOf('\n');
        if (nl !== -1) {
          const line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          let cmd: any;
          try { cmd = JSON.parse(line); } catch { sock.end(); return; }
          const res = handler(cmd);
          sock.write(JSON.stringify(res ?? { ok: true }) + '\n');
          sock.end();
        }
      });
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        resolve({ server, port: addr.port });
      } else {
        reject(new Error('Failed to get server port'));
      }
    });
  });
}

/** Minimal HTTP health server. */
function startMockHealth(
  body: object,
): Promise<{ server: HttpServer; port: number }> {
  return new Promise((resolve, reject) => {
    const server = createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        resolve({ server, port: addr.port });
      } else {
        reject(new Error('Failed to get health port'));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HarborBridge', () => {
  let tcpServer: Server | undefined;
  let tcpPort = 0;
  let httpServer: HttpServer | undefined;
  let httpPort = 0;
  const bottles: Map<string, HarborBottle> = new Map();

  beforeEach(async () => {
    bottles.clear();

    // Start mock TCP
    const tcp = await startMockTcp((cmd) => {
      switch (cmd.action) {
        case 'send': {
          const b = cmd.bottle as HarborBottle;
          bottles.set(b.uuid, b);
          return { ok: true };
        }
        case 'get': {
          return { bottle: bottles.get(cmd.uuid) ?? null };
        }
        case 'list': {
          let result = [...bottles.values()];
          if (cmd.filter === 'sender') {
            result = result.filter((b) => b.sender === cmd.sender);
          } else if (cmd.filter === 'undelivered') {
            result = result.filter((b) => !b.delivered);
          }
          return { bottles: result };
        }
        default:
          return { ok: false, error: 'unknown action' };
      }
    });
    tcpServer = tcp.server;
    tcpPort = tcp.port;

    // Start mock health
    const health = await startMockHealth({ status: 'ok', bottles: bottles.size });
    httpServer = health.server;
    httpPort = health.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => {
      tcpServer?.close(() => resolve());
    });
    await new Promise<void>((resolve) => {
      httpServer?.close(() => resolve());
    });
  });

  it('constructs with defaults', () => {
    const bridge = new HarborBridge();
    assert.equal(bridge.config.host, '127.0.0.1');
    assert.equal(bridge.config.port, 8796);
    assert.equal(bridge.config.healthPort, 8797);
    assert.equal(bridge.config.timeoutMs, 5000);
  });

  it('constructs with custom config', () => {
    const bridge = new HarborBridge({ host: '10.0.0.1', port: 9999, timeoutMs: 1000 });
    assert.equal(bridge.config.host, '10.0.0.1');
    assert.equal(bridge.config.port, 9999);
    assert.equal(bridge.config.timeoutMs, 1000);
  });

  it('health() returns status and bottle count', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    const result = await bridge.health();
    assert.equal(result.status, 'ok');
    assert.equal(typeof result.bottles, 'number');
  });

  it('sendBottle() writes to TCP and gets response', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    const bottle = makeBottle();
    await bridge.sendBottle(bottle);
    // Verify it was stored in mock
    assert.ok(bottles.has(bottle.uuid));
  });

  it('getBottle() retrieves by UUID', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    const bottle = makeBottle({ payload: 'test-payload-123' });
    bottles.set(bottle.uuid, bottle);

    const result = await bridge.getBottle(bottle.uuid);
    assert.ok(result);
    assert.equal(result!.payload, 'test-payload-123');
  });

  it('getBottle() returns null for unknown UUID', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    const result = await bridge.getBottle('nonexistent-uuid');
    assert.equal(result, null);
  });

  it('listBySender() filters correctly', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });

    const b1 = makeBottle({ sender: 'alice', payload: 'msg1' });
    const b2 = makeBottle({ sender: 'bob', payload: 'msg2' });
    const b3 = makeBottle({ sender: 'alice', payload: 'msg3' });
    bottles.set(b1.uuid, b1);
    bottles.set(b2.uuid, b2);
    bottles.set(b3.uuid, b3);

    const result = await bridge.listBySender('alice');
    assert.equal(result.length, 2);
    assert.ok(result.every((b) => b.sender === 'alice'));
  });

  it('listUndelivered() excludes delivered', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });

    const b1 = makeBottle({ delivered: false });
    const b2 = makeBottle({ delivered: true });
    const b3 = makeBottle({ delivered: false });
    bottles.set(b1.uuid, b1);
    bottles.set(b2.uuid, b2);
    bottles.set(b3.uuid, b3);

    const result = await bridge.listUndelivered();
    assert.equal(result.length, 2);
    assert.ok(result.every((b) => !b.delivered));
  });

  it('connection timeout handled gracefully', async () => {
    // Point at a port that nobody is listening on
    const bridge = new HarborBridge({
      port: 59999,
      healthPort: 59998,
      timeoutMs: 500,
    });
    await assert.rejects(
      () => bridge.sendBottle(makeBottle()),
      (err: Error) => {
        assert.ok(err.message.includes('Harbor'), `Unexpected error: ${err.message}`);
        return true;
      },
    );
  });

  it('connection refused handled gracefully', async () => {
    const bridge = new HarborBridge({
      port: 1, // privileged port, will be refused
      healthPort: 1,
      timeoutMs: 500,
    });
    await assert.rejects(
      () => bridge.sendBottle(makeBottle()),
      (err: Error) => {
        assert.ok(
          err.message.includes('Harbor'),
          `Unexpected error: ${err.message}`,
        );
        return true;
      },
    );
  });

  it('health() handles connection failure gracefully', async () => {
    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: 59997, // nothing listening
      timeoutMs: 500,
    });
    await assert.rejects(
      () => bridge.health(),
      (err: Error) => {
        assert.ok(err.message.includes('Harbor'));
        return true;
      },
    );
  });
});

// ---------------------------------------------------------------------------
// attach(fleet) tests — uses a minimal mock Fleet
// ---------------------------------------------------------------------------

describe('HarborBridge.attach(fleet)', () => {
  let tcpServer: Server | undefined;
  let tcpPort = 0;
  let httpServer: HttpServer | undefined;
  let httpPort = 0;
  const bottles: Map<string, HarborBottle> = new Map();

  beforeEach(async () => {
    bottles.clear();

    const tcp = await startMockTcp((cmd) => {
      switch (cmd.action) {
        case 'send': {
          const b = cmd.bottle as HarborBottle;
          bottles.set(b.uuid, b);
          return { ok: true };
        }
        case 'list': {
          let result = [...bottles.values()];
          if (cmd.filter === 'sender') {
            result = result.filter((b) => b.sender === cmd.sender);
          }
          return { bottles: result };
        }
        default:
          return { ok: false };
      }
    });
    tcpServer = tcp.server;
    tcpPort = tcp.port;

    const health = await startMockHealth({ status: 'ok', bottles: 0 });
    httpServer = health.server;
    httpPort = health.port;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => { tcpServer?.close(() => resolve()); });
    await new Promise<void>((resolve) => { httpServer?.close(() => resolve()); });
  });

  it('registers delegate + crate-info handlers', () => {
    const handlers: Record<string, Function> = {};

    const mockFleet = {
      registerCapability(name: string, fn: Function) {
        handlers[name] = fn;
      },
    } as any;

    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });

    bridge.attach(mockFleet);

    assert.equal(typeof handlers['delegate'], 'function');
    assert.equal(typeof handlers['crate-info'], 'function');
  });

  it('delegate handler creates bottle and sends via TCP', async () => {
    const handlers: Record<string, Function> = {};
    const mockFleet = {
      registerCapability(name: string, fn: Function) {
        handlers[name] = fn;
      },
    } as any;

    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    bridge.attach(mockFleet);

    const result = await handlers['delegate']({
      capability: 'delegate',
      params: { sender: 'agent-1', role: 'worker', payload: 'do work' },
      agentId: 'test-agent',
    });

    assert.equal(result.success, true);
    assert.ok(result.data.uuid);
    assert.equal(bottles.size, 1);
  });

  it('crate-info handler returns bottles by sender', async () => {
    const handlers: Record<string, Function> = {};
    const mockFleet = {
      registerCapability(name: string, fn: Function) {
        handlers[name] = fn;
      },
    } as any;

    const bridge = new HarborBridge({
      port: tcpPort,
      healthPort: httpPort,
      timeoutMs: 2000,
    });
    bridge.attach(mockFleet);

    // Seed some bottles
    const b1 = makeBottle({ sender: 'agent-x', payload: 'p1' });
    const b2 = makeBottle({ sender: 'agent-y', payload: 'p2' });
    bottles.set(b1.uuid, b1);
    bottles.set(b2.uuid, b2);

    const result = await handlers['crate-info']({
      capability: 'crate-info',
      params: { sender: 'agent-x' },
      agentId: 'test-agent',
    });
    assert.equal(result.success, true);
    assert.equal(result.data.count, 1);
    assert.equal(result.data.bottles[0].sender, 'agent-x');
  });
});
