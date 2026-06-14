// ─── SuperInstance Dashboard Tests ───────────────────────────────────────────
//
// Run with: node --test dist/test/dashboard.test.js
// (after `npm run build`)
//

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FleetDashboard } from '../src/dashboard.js';
import { Fleet } from '../src/sdk.js';
import type { FleetStatus, GovernorDecision } from '../src/types.js';
import { C } from '../src/index.js';

// ─── Test Fixtures ───────────────────────────────────────────────────────────

function makeFleet(): Fleet {
  const fleet = new Fleet({ name: 'test-fleet' });
  fleet.spawn({ role: 'builder', name: 'Builder-1', gammaBudget: 0.35 });
  fleet.spawn({ role: 'builder', name: 'Builder-2', gammaBudget: 0.35 });
  fleet.spawn({ role: 'validator', name: 'Tester', gammaBudget: 0.25 });
  return fleet;
}

// ─── Construction ────────────────────────────────────────────────────────────

describe('FleetDashboard construction', () => {
  it('constructs without error', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    assert.ok(dash instanceof FleetDashboard);
  });

  it('accepts custom refreshMs', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet, { refreshMs: 250 });
    assert.ok(dash instanceof FleetDashboard);
  });

  it('accepts zero-agent fleet', () => {
    const fleet = new Fleet({ name: 'empty' });
    const dash = new FleetDashboard(fleet);
    assert.ok(dash instanceof FleetDashboard);
  });
});

// ─── start/stop Lifecycle ────────────────────────────────────────────────────

describe('FleetDashboard start/stop', () => {
  it('start() and stop() do not crash (non-TTY)', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet, { refreshMs: 50 });

    // In test env, stdin is likely not TTY, so start should be safe
    dash.start();
    assert.ok(true, 'start() completed');

    dash.stop();
    assert.ok(true, 'stop() completed');
  });

  it('stop() is safe to call without start()', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    dash.stop();
    assert.ok(true, 'stop() without start() completed');
  });

  it('start() is idempotent (double start is safe)', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet, { refreshMs: 50 });
    dash.start();
    dash.start();
    dash.stop();
    assert.ok(true);
  });

  it('stop() is idempotent (double stop is safe)', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet, { refreshMs: 50 });
    dash.start();
    dash.stop();
    dash.stop();
    assert.ok(true);
  });
});

// ─── renderLines() Output ────────────────────────────────────────────────────

describe('FleetDashboard.renderLines()', () => {
  it('returns an array of strings', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    assert.ok(Array.isArray(lines));
    assert.ok(lines.length > 0, 'should produce multiple lines');
  });

  it('includes the fleet name in the header', () => {
    const fleet = new Fleet({ name: 'my-special-fleet' });
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(
      joined.includes('my-special-fleet'),
      'fleet name should appear in dashboard output',
    );
  });

  it('includes the conservation law in the header', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('γ + η ≤ C'), 'should show conservation law');
    assert.ok(joined.includes('log₂(3)'), 'should show C formula');
  });

  it('includes top and bottom borders', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    assert.ok(
      lines[0].includes('╔'),
      'first line should have top-left border corner',
    );
    assert.ok(
      lines[lines.length - 1].includes('╚'),
      'last line should have bottom-left border corner',
    );
  });

  it('includes status indicator', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('STATUS:'), 'should show STATUS line');
    assert.ok(joined.includes('HEALTHY'), 'fresh fleet should be healthy');
  });

  it('includes δ (delta) value', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('δ ='), 'should show δ value');
  });

  it('includes progress bars with block characters', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('█'), 'should have filled bar blocks');
    assert.ok(joined.includes('░'), 'should have empty bar blocks');
  });

  it('includes γ (coupling) and η (value) labels', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('γ (coupling)'), 'should show γ label');
    assert.ok(joined.includes('η (value)'), 'should show η label');
    assert.ok(joined.includes('δ (budget)'), 'should show δ label');
  });

  it('includes AGENTS count line', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('AGENTS:'), 'should show AGENTS line');
    assert.ok(joined.includes('3 total'), 'should show 3 agents');
    assert.ok(joined.includes('active'), 'should show active count');
  });

  it('includes agent table with headers', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('ID'), 'table should have ID column');
    assert.ok(joined.includes('ROLE'), 'table should have ROLE column');
    assert.ok(joined.includes('PHASE'), 'table should have PHASE column');
  });

  it('lists individual agents in the table', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('Builder-1'), 'should list Builder-1');
    assert.ok(joined.includes('Builder-2'), 'should list Builder-2');
    assert.ok(joined.includes('Tester'), 'should list Tester');
  });

  it('shows (no agents) message for empty fleet', () => {
    const fleet = new Fleet({ name: 'empty' });
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('no agents'), 'should show empty fleet message');
  });

  it('includes GOVERNOR line with decision', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('GOVERNOR:'), 'should show GOVERNOR line');
  });

  it('includes uptime and tick info in footer', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('Uptime:'), 'should show uptime');
    assert.ok(joined.includes('Tick:'), 'should show tick number');
    assert.ok(joined.includes('quit'), 'should show quit instruction');
  });

  it('increments tick on each render', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines1 = dash.renderLines();
    const joined1 = lines1.join('\n');
    const tick1Match = joined1.match(/Tick: #(\d+)/);
    assert.ok(tick1Match, 'should find tick number');
    const tick1 = parseInt(tick1Match![1], 10);

    const lines2 = dash.renderLines();
    const joined2 = lines2.join('\n');
    const tick2Match = joined2.match(/Tick: #(\d+)/);
    assert.ok(tick2Match, 'should find second tick number');
    const tick2 = parseInt(tick2Match![1], 10);

    assert.equal(tick2, tick1 + 1, 'tick should increment by 1');
  });

  it('renders consistently with 10+ agents', () => {
    const fleet = new Fleet({ name: 'big-fleet' });
    for (let i = 0; i < 12; i++) {
      fleet.spawn({ role: 'builder', name: `Agent-${i}`, gammaBudget: 0.1 });
    }
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    assert.ok(lines.length > 0);
    const joined = lines.join('\n');
    assert.ok(joined.includes('12 total'), 'should show 12 agents');
  });
});

// ─── Conservation Status Display ─────────────────────────────────────────────

describe('FleetDashboard status coloring', () => {
  it('shows HEALTHY for fresh fleet', () => {
    const fleet = makeFleet();
    const dash = new FleetDashboard(fleet);
    const lines = dash.renderLines();
    const joined = lines.join('\n');
    assert.ok(joined.includes('HEALTHY'));
  });
});
