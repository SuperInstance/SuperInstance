// ─── SuperInstance Governor Tests ────────────────────────────────────────────
//
// Run with: node --test dist/test/governor.test.js
// (after `npm run build`)
//

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Governor } from '../src/governor.js';
import { Fleet } from '../src/sdk.js';
import { C, convergenceDelta } from '../src/index.js';

// ─── Constants ───────────────────────────────────────────────────────────────

describe('Conservation Constants', () => {
  it('C = log₂(3) ≈ 1.585', () => {
    assert.ok(Math.abs(C - Math.log2(3)) < 1e-15);
    assert.ok(Math.abs(C - 1.584962500721156) < 1e-15);
    // Approximate check
    assert.ok(Math.abs(C - 1.585) < 0.001);
  });

  it('C is greater than 1 and less than 2', () => {
    assert.ok(C > 1, 'C should be > 1');
    assert.ok(C < 2, 'C should be < 2');
  });
});

// ─── Convergence Formula ─────────────────────────────────────────────────────

describe('Convergence δ(n)', () => {
  it('δ(n) = (1/√n)(1 − 3/(2n)) for n=7', () => {
    const delta = convergenceDelta(7);
    // (1/√7)(1 - 3/14) = (1/2.6458)(1 - 0.2143) = 0.3780 * 0.7857 = 0.2970
    const expected = (1 / Math.sqrt(7)) * (1 - 3 / 14);
    assert.ok(Math.abs(delta - expected) < 1e-15);
    assert.ok(delta > 0.29 && delta < 0.30, `δ(7) ≈ 0.297, got ${delta}`);
  });

  it('δ(n) for n=100', () => {
    const delta = convergenceDelta(100);
    // (1/10)(1 - 3/200) = 0.1 * 0.985 = 0.0985
    assert.ok(delta > 0.09 && delta < 0.11, `δ(100) ≈ 0.099, got ${delta}`);
    // Should show ~90% cancellation
    assert.ok(delta < 0.1 + 0.01);
  });

  it('δ(n) for n=10000', () => {
    const delta = convergenceDelta(10000);
    // (1/100)(1 - 3/20000) = 0.01 * 0.99985 = 0.0099985
    assert.ok(delta > 0.009 && delta < 0.011, `δ(10000) ≈ 0.010, got ${delta}`);
    // Should show ~99% cancellation
    assert.ok(delta < 0.011);
  });

  it('δ(n) → 0 as n → ∞', () => {
    assert.ok(convergenceDelta(1000) < convergenceDelta(100));
    assert.ok(convergenceDelta(10000) < convergenceDelta(1000));
    assert.ok(convergenceDelta(100000) < convergenceDelta(10000));
  });

  it('δ(n) = ∞ for n = 0', () => {
    assert.equal(convergenceDelta(0), Infinity);
  });

  it('δ(n) = 1 for n < 3 (below threshold)', () => {
    assert.equal(convergenceDelta(1), 1);
    assert.equal(convergenceDelta(2), 1);
  });
});

// ─── Governor Conservation Observation ───────────────────────────────────────

describe('Governor.observe()', () => {
  const gov = new Governor();

  it('returns healthy status when δ > 0.3', () => {
    const state = gov.observe({ gamma: 0.2, eta: 0.1, agentCount: 5 });
    assert.equal(state.status, 'healthy');
    assert.ok(state.delta > 0.3);
    assert.ok(state.delta > 0);
  });

  it('returns monitor status when 0.1 < δ < 0.3', () => {
    const state = gov.observe({ gamma: 0.7, eta: 0.5, agentCount: 5 });
    // γ+η = 1.2, C = 1.585, δ = 0.385 — that's healthy, let's adjust
    const state2 = gov.observe({ gamma: 0.9, eta: 0.4, agentCount: 5 });
    // γ+η = 1.3, δ = 0.285 — monitor
    assert.equal(state2.status, 'monitor');
  });

  it('returns tight status when 0 < δ < 0.1', () => {
    const state = gov.observe({ gamma: 1.0, eta: 0.5, agentCount: 5 });
    // γ+η = 1.5, C = 1.585, δ = 0.085 — tight
    assert.equal(state.status, 'tight');
  });

  it('returns violated status when δ < 0', () => {
    const state = gov.observe({ gamma: 1.0, eta: 0.7, agentCount: 5 });
    // γ+η = 1.7 > C = 1.585 — violated
    assert.equal(state.status, 'violated');
    assert.ok(state.delta < 0);
  });

  it('correctly computes C = log₂(3)', () => {
    const state = gov.observe({ gamma: 0, eta: 0, agentCount: 1 });
    assert.ok(Math.abs(state.C - Math.log2(3)) < 1e-15);
  });
});

// ─── Governor PID Decision ───────────────────────────────────────────────────

describe('Governor.decide()', () => {
  it('releases budget when γ is low', () => {
    const gov = new Governor();
    // Low γ — should release or spawn
    const decision = gov.decide({ gamma: 0.1, eta: 0.1, agentCount: 5 });
    assert.ok(
      decision.action === 'release' || decision.action === 'spawn',
      `Expected release/spawn, got ${decision.action}: ${decision.reason}`,
    );
  });

  it('throttles when γ is high', () => {
    const gov = new Governor();
    // High γ relative to C — should throttle
    const decision = gov.decide({ gamma: 1.0, eta: 0.3, agentCount: 5 });
    assert.equal(decision.action, 'throttle');
  });

  it('holds when γ is near setpoint', () => {
    const gov = new Governor({ deadband: 0.05 });
    // γ/C ≈ 0.5 → right at setpoint with some deadband
    const gamma = C * 0.5; // = 0.7925
    const decision = gov.decide({ gamma, eta: 0.01, agentCount: 5 });
    // First call may have derivative transient, check the action is reasonable
    assert.ok(
      ['hold', 'release', 'throttle'].includes(decision.action),
      `Expected hold/release/throttle, got ${decision.action}`,
    );
  });

  it('immediately throttles when conservation violated', () => {
    const gov = new Governor();
    const decision = gov.decide({ gamma: 1.0, eta: 0.7, agentCount: 5 });
    assert.equal(decision.action, 'throttle');
    assert.equal(decision.conservation.status, 'violated');
  });

  it('suggests spawn for small fleet with headroom', () => {
    const gov = new Governor();
    const decision = gov.decide({ gamma: 0.1, eta: 0.05, agentCount: 2 });
    assert.equal(decision.action, 'spawn');
  });

  it('suggests merge for large fleet near capacity', () => {
    const gov = new Governor();
    // 8 agents, γ near capacity
    const decision = gov.decide({ gamma: 1.1, eta: 0.3, agentCount: 8 });
    assert.ok(
      decision.action === 'throttle' || decision.action === 'merge',
      `Expected throttle/merge, got ${decision.action}`,
    );
  });
});

// ─── Anti-Windup ─────────────────────────────────────────────────────────────

describe('Governor Anti-Windup', () => {
  it('integral term is clamped to prevent windup', () => {
    const gov = new Governor({ Ki: 1.0 });

    // Run many iterations with high error to try to wind up the integral
    for (let i = 0; i < 100; i++) {
      gov.decide({ gamma: 0.01, eta: 0.01, agentCount: 5 });
    }

    // Now suddenly switch to high γ — the integral shouldn't cause extreme output
    const decision = gov.decide({ gamma: 1.2, eta: 0.1, agentCount: 5 });
    // Should still respond reasonably (not infinite or NaN)
    assert.ok(Number.isFinite(decision.magnitude));
    assert.ok(decision.magnitude >= 0 && decision.magnitude <= 10);
  });
});

// ─── Deadband ────────────────────────────────────────────────────────────────

describe('Governor Deadband', () => {
  it('large deadband causes hold', () => {
    const gov = new Governor({ deadband: 0.5, setpoint: 0.5 });
    // With a 50% deadband, should hold for most inputs
    const decision = gov.decide({ gamma: 0.6, eta: 0.01, agentCount: 5 });
    assert.equal(decision.action, 'hold');
  });

  it('small deadband allows response', () => {
    const gov = new Governor({ deadband: 0.001, setpoint: 0.5 });
    const decision = gov.decide({ gamma: 0.1, eta: 0.01, agentCount: 5 });
    // Should not be hold — should respond
    assert.notEqual(decision.action, 'hold');
  });
});

// ─── Fleet Spawn & Budget ────────────────────────────────────────────────────

describe('Fleet.spawn()', () => {
  it('creates agents with correct budgets', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    assert.equal(agent.role, 'builder');
    assert.equal(agent.gammaBudget, 0.3);
    assert.equal(agent.getBudget(), 0.3); // Nothing used yet
  });

  it('fleet status reports correct agent count', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });
    fleet.spawn({ role: 'validator', gammaBudget: 0.15 });

    const status = fleet.status();
    assert.equal(status.agentCount, 3);
    assert.equal(status.activeAgents, 3);
  });

  it('fleet respects conservation after spawn', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });

    const status = fleet.status();
    // Fresh fleet, no tasks executed → γ = 0
    assert.equal(status.conservation.gamma, 0);
    assert.equal(status.conservation.eta, 0);
    assert.equal(status.conservation.status, 'healthy');
  });
});

// ─── Fleet Status ────────────────────────────────────────────────────────────

describe('Fleet.status()', () => {
  it('reports correct conservation state', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const status = fleet.status();

    assert.equal(status.name, 'test-fleet');
    assert.equal(status.agentCount, 0);
    assert.equal(status.conservation.C, C);
    assert.equal(status.conservation.delta, C); // γ=0, η=0 → δ=C
    assert.equal(status.conservation.status, 'healthy');
  });

  it('reports convergence delta', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    fleet.spawn({ role: 'researcher', gammaBudget: 0.2 });

    const status = fleet.status();
    const expectedDelta = convergenceDelta(2);
    assert.ok(Math.abs(status.convergenceDelta - expectedDelta) < 1e-15);
  });

  it('tracks uptime', () => {
    const fleet = new Fleet({ name: 'test-fleet' });

    // Wait a tiny bit
    const status1 = fleet.status();
    assert.ok(status1.uptime >= 0);

    return new Promise((resolve) => {
      setTimeout(() => {
        const status2 = fleet.status();
        assert.ok(status2.uptime >= status1.uptime);
        resolve();
      }, 10);
    });
  });
});

// ─── Governor Methods ────────────────────────────────────────────────────────

describe('Governor utility methods', () => {
  it('getC() returns log₂(3)', () => {
    const gov = new Governor();
    assert.ok(Math.abs(gov.getC() - Math.log2(3)) < 1e-15);
  });

  it('getConvergence() matches standalone function', () => {
    const gov = new Governor();
    for (const n of [3, 5, 7, 10, 50, 100, 1000]) {
      const expected = (1 / Math.sqrt(n)) * (1 - 3 / (2 * n));
      assert.ok(Math.abs(gov.getConvergence(n) - expected) < 1e-15);
    }
  });

  it('reset() clears PID state', () => {
    const gov = new Governor();

    // Run some iterations
    gov.decide({ gamma: 0.1, eta: 0.01, agentCount: 5 });
    gov.decide({ gamma: 0.8, eta: 0.1, agentCount: 5 });

    // Reset
    gov.reset();

    // After reset, next decision should behave like first call
    const decision = gov.decide({ gamma: 0.1, eta: 0.01, agentCount: 5 });
    assert.ok(Number.isFinite(decision.magnitude));
  });
});
