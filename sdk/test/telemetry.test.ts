// ─── SuperInstance Telemetry Tests ───────────────────────────────────────────
//
// Run with: node --test dist/test/telemetry.test.js
// (after `npm run build`)
//

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Fleet } from '../src/sdk.js';
import { TelemetryReporter } from '../src/telemetry.js';
import { TelemetryReceiver } from '../src/telemetry-receiver.js';
import type { FleetSnapshot } from '../src/telemetry.js';
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { execSync } from 'node:child_process';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get a random high port to avoid collisions */
function getPort(): number {
  // Use the test PID to generate a unique-ish port in the ephemeral range
  const pid = process.pid;
  return 30000 + (pid % 10000) + Math.floor(Math.random() * 1000);
}

/** Create a minimal test HTTP server that records received telemetry */
function createTelemetryServer(): Promise<{
  received: FleetSnapshot[];
  url: string;
  close: () => Promise<void>;
}> {
  return new Promise((resolve) => {
    const received: FleetSnapshot[] = [];
    const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method === 'POST' && req.url === '/telemetry') {
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body) as FleetSnapshot;
            received.push(parsed);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.writeHead(400);
            res.end('Bad JSON');
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({
        received,
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

/** Make a snapshot for testing the receiver */
function makeSnapshot(name: string, agents: number, delta: number, status: string): FleetSnapshot {
  return {
    fleetName: name,
    timestamp: Date.now(),
    agentCount: agents,
    activeAgents: agents,
    uptime: 1000,
    convergenceDelta: 0.1,
    conservation: {
      gamma: 0.5,
      eta: 0.3,
      C: Math.log2(3),
      delta,
      status: status as FleetSnapshot['conservation']['status'],
    },
  };
}

// ─── TelemetryReporter Tests ─────────────────────────────────────────────────

describe('TelemetryReporter', () => {
  let fleet: Fleet;

  beforeEach(() => {
    fleet = new Fleet({ name: 'test-fleet' });
    fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });
  });

  it('should attach to a fleet and report periodically', async () => {
    const srv = await createTelemetryServer();
    const reporter = new TelemetryReporter({
      endpoint: srv.url,
      intervalMs: 100,
      fleetName: 'test-fleet',
    });

    reporter.attach(fleet);

    // Wait for at least 2 reports
    await new Promise((r) => setTimeout(r, 350));

    reporter.detach();
    await srv.close();

    assert.ok(srv.received.length >= 2, `Expected >= 2 reports, got ${srv.received.length}`);
    assert.equal(srv.received[0].fleetName, 'test-fleet');
    assert.ok(srv.received[0].agentCount > 0);
    assert.equal(typeof srv.received[0].conservation.gamma, 'number');
    assert.equal(typeof srv.received[0].conservation.delta, 'number');
  });

  it('should fire onAlert callback when conservation status changes', async () => {
    const srv = await createTelemetryServer();
    const alerts: Array<{ level: string; message: string }> = [];

    const reporter = new TelemetryReporter({
      endpoint: srv.url,
      intervalMs: 50,
      fleetName: 'alert-fleet',
    });

    reporter.onAlert((alert) => {
      alerts.push({ level: alert.level, message: alert.message });
    });

    reporter.attach(fleet);

    // Let a couple reports fire (healthy status)
    await new Promise((r) => setTimeout(r, 180));

    // Push fleet into "violated" territory — γ + η > C
    fleet.recordTask(2.0, 0.5);

    // Let reports pick up the change
    await new Promise((r) => setTimeout(r, 180));

    reporter.detach();
    await srv.close();

    // Should have at least one alert about the status change
    const statusChange = alerts.find((a) => a.message.includes('→'));
    assert.ok(statusChange, `Expected a status change alert, got: ${JSON.stringify(alerts)}`);
    assert.ok(statusChange!.message.includes('violated'));
  });

  it('should stop reporting after detach()', async () => {
    const srv = await createTelemetryServer();
    const reporter = new TelemetryReporter({
      endpoint: srv.url,
      intervalMs: 80,
      fleetName: 'detach-fleet',
    });

    reporter.attach(fleet);
    assert.ok(reporter.isAttached);

    await new Promise((r) => setTimeout(r, 250));

    reporter.detach();
    assert.ok(!reporter.isAttached);

    // Allow in-flight request to drain
    await new Promise((r) => setTimeout(r, 100));
    const countAfterDrain = srv.received.length;

    // Wait to confirm no more reports arrive
    await new Promise((r) => setTimeout(r, 300));

    assert.ok(
      srv.received.length === countAfterDrain,
      `Expected ${countAfterDrain} reports after detach, got ${srv.received.length}`,
    );
    await srv.close();
  });

  it('should handle connection failures without crashing', async () => {
    // Use a port we know is not listening — high random port
    const deadPort = getPort();
    const reporter = new TelemetryReporter({
      endpoint: `http://127.0.0.1:${deadPort}`,
      intervalMs: 99999, // Don't auto-fire; we'll call reportOnce manually
      fleetName: 'failing-fleet',
    });

    reporter.attach(fleet);
    assert.ok(reporter.isAttached);

    // Manually trigger a report — this should fail gracefully
    await reporter.reportOnce();
    assert.ok(reporter.failureCount > 0, 'Should have recorded failures');

    // Reporter should still be alive and not have crashed
    assert.ok(reporter.isAttached);

    reporter.detach();
  });

  it('should send a manual report via reportOnce()', async () => {
    const srv = await createTelemetryServer();
    const reporter = new TelemetryReporter({
      endpoint: srv.url,
      intervalMs: 99999, // Effectively never fires automatically
      fleetName: 'manual-fleet',
    });

    reporter.attach(fleet);

    // Send manually
    await reporter.reportOnce();

    assert.ok(srv.received.length >= 1, `Expected >= 1 report, got ${srv.received.length}`);
    assert.equal(srv.received[0].fleetName, 'manual-fleet');

    reporter.detach();
    await srv.close();
  });
});

// ─── TelemetryReceiver Tests ─────────────────────────────────────────────────

describe('TelemetryReceiver', () => {
  it('should ingest snapshots from multiple fleets', () => {
    const receiver = new TelemetryReceiver();

    receiver.ingest(makeSnapshot('fleet-alpha', 5, 0.8, 'healthy'));
    receiver.ingest(makeSnapshot('fleet-beta', 3, 0.1, 'tight'));
    receiver.ingest(makeSnapshot('fleet-gamma', 10, -0.2, 'violated'));

    assert.equal(receiver.size, 3);
    assert.equal(receiver.getFleetNames().length, 3);
  });

  it('should get a specific fleet by name', () => {
    const receiver = new TelemetryReceiver();
    receiver.ingest(makeSnapshot('fleet-alpha', 5, 0.8, 'healthy'));

    const fleet = receiver.getFleet('fleet-alpha');
    assert.ok(fleet);
    assert.equal(fleet!.fleetName, 'fleet-alpha');
    assert.equal(fleet!.agentCount, 5);

    assert.equal(receiver.getFleet('nonexistent'), undefined);
  });

  it('should compute aggregate metrics correctly', () => {
    const receiver = new TelemetryReceiver();

    receiver.ingest(makeSnapshot('fleet-a', 4, 0.6, 'healthy'));
    receiver.ingest(makeSnapshot('fleet-b', 6, 0.2, 'monitor'));
    receiver.ingest(makeSnapshot('fleet-c', 10, -0.1, 'violated'));

    const agg = receiver.getAggregate();

    assert.equal(agg.fleetCount, 3);
    assert.equal(agg.totalAgents, 20); // 4 + 6 + 10
    assert.equal(agg.totalActiveAgents, 20);
    assert.ok(Math.abs(agg.avgDelta - ((0.6 + 0.2 + (-0.1)) / 3)) < 1e-10);
    assert.ok(agg.atRiskFleets.includes('fleet-c'));
    assert.ok(!agg.atRiskFleets.includes('fleet-a'));
  });

  it('should update existing fleet on re-ingest', () => {
    const receiver = new TelemetryReceiver();

    receiver.ingest(makeSnapshot('fleet-x', 3, 0.8, 'healthy'));
    assert.equal(receiver.size, 1);

    receiver.ingest(makeSnapshot('fleet-x', 5, 0.1, 'tight'));
    assert.equal(receiver.size, 1); // Still 1, not 2

    const fleet = receiver.getFleet('fleet-x');
    assert.equal(fleet!.agentCount, 5); // Updated value
    assert.equal(fleet!.conservation.status, 'tight');
  });

  it('should handle empty receiver aggregate', () => {
    const receiver = new TelemetryReceiver();
    const agg = receiver.getAggregate();

    assert.equal(agg.fleetCount, 0);
    assert.equal(agg.totalAgents, 0);
    assert.equal(agg.avgDelta, 0);
    assert.equal(agg.atRiskFleets.length, 0);
  });

  it('should remove fleets', () => {
    const receiver = new TelemetryReceiver();
    receiver.ingest(makeSnapshot('fleet-a', 3, 0.5, 'healthy'));

    assert.equal(receiver.size, 1);
    assert.ok(receiver.remove('fleet-a'));
    assert.equal(receiver.size, 0);
    assert.ok(!receiver.remove('nonexistent'));
  });

  it('should clear all fleets', () => {
    const receiver = new TelemetryReceiver();
    receiver.ingest(makeSnapshot('a', 1, 0.5, 'healthy'));
    receiver.ingest(makeSnapshot('b', 2, 0.5, 'healthy'));

    receiver.clear();
    assert.equal(receiver.size, 0);
  });

  it('should return all snapshots via getAll()', () => {
    const receiver = new TelemetryReceiver();
    receiver.ingest(makeSnapshot('fleet-a', 3, 0.5, 'healthy'));
    receiver.ingest(makeSnapshot('fleet-b', 5, 0.3, 'monitor'));

    const all = receiver.getAll();
    assert.equal(all.length, 2);
    const names = all.map((s) => s.fleetName).sort();
    assert.deepEqual(names, ['fleet-a', 'fleet-b']);
  });
});
