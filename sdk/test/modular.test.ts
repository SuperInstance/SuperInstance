// ─── SuperInstance Modular Capability System Tests ───────────────────────────
//
// Tests for the modular agent request system, capability routing,
// delegation, and conservation integration.
//
// Run with: node --test dist/test/modular.test.js
// (after `npm run build`)
//

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Fleet, Agent } from '../src/sdk.js';
import { CapabilityRouter } from '../src/modular.js';
import type { Capability, CapabilityRequest, CapabilityResponse } from '../src/modular.js';
import type { DelegationResult } from '../src/fleet-delegate.js';
import { C } from '../src/index.js';

// ─── Capability Router ───────────────────────────────────────────────────────

describe('CapabilityRouter', () => {
  it('registers and routes capabilities', async () => {
    const router = new CapabilityRouter();

    router.register('search', async (req: CapabilityRequest): Promise<CapabilityResponse> => ({
      success: true,
      data: { echo: req.params },
      gammaCost: 0.01,
      etaProduced: 0.005,
    }));

    const response = await router.route({
      capability: 'search',
      params: { query: 'test' },
      agentId: 'agent-1',
    });

    assert.ok(response.success);
    assert.equal(response.gammaCost, 0.01);
    assert.equal(response.etaProduced, 0.005);
  });

  it('returns error for unknown capability', async () => {
    const router = new CapabilityRouter();

    const response = await router.route({
      capability: 'search',
      params: {},
      agentId: 'agent-1',
    });

    assert.ok(!response.success);
    assert.ok(response.error!.includes('Unknown capability'));
  });

  it('lists available capabilities', () => {
    const router = new CapabilityRouter();
    router.register('search', async () => ({ success: true, gammaCost: 0, etaProduced: 0 }));
    router.register('budget', async () => ({ success: true, gammaCost: 0, etaProduced: 0 }));

    const available = router.listAvailable();
    assert.ok(available.includes('search'));
    assert.ok(available.includes('budget'));
    assert.equal(available.length, 2);
  });

  it('unregisters capabilities', () => {
    const router = new CapabilityRouter();
    router.register('search', async () => ({ success: true, gammaCost: 0, etaProduced: 0 }));
    assert.ok(router.has('search'));

    router.unregister('search');
    assert.ok(!router.has('search'));
  });
});

// ─── Fleet Built-in Capabilities ─────────────────────────────────────────────

describe('Fleet built-in capabilities', () => {
  it('auto-registers built-in handlers on construction', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const router = fleet.getRouter();

    assert.ok(router.has('search'));
    assert.ok(router.has('budget'));
    assert.ok(router.has('validate'));
    assert.ok(router.has('conserve'));
    assert.ok(router.has('status'));
    assert.ok(router.has('report'));
    assert.ok(router.has('delegate'));
  });

  it('allows custom capability registration', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    fleet.registerCapability('spawn', async () => ({
      success: true,
      gammaCost: 0,
      etaProduced: 0,
    }));

    assert.ok(fleet.getRouter().has('spawn'));
  });
});

// ─── Agent.request('search') ─────────────────────────────────────────────────

describe("Agent.request('search')", () => {
  it('returns search results for a valid query', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('search', { query: 'governor', topK: 3 });

    assert.ok(response.success);
    const data = response.data as { results: unknown[]; count: number };
    assert.ok(data.results.length > 0);
    assert.ok(data.count > 0);
  });

  it('returns empty results for non-matching query', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('search', { query: 'xyznonexistent' });

    assert.ok(response.success);
    const data = response.data as { count: number };
    assert.equal(data.count, 0);
  });

  it('deducts γ from agent budget', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const budgetBefore = agent.getBudget();
    await agent.request('search', { query: 'conservation' });
    const budgetAfter = agent.getBudget();

    assert.ok(budgetAfter < budgetBefore, 'Budget should decrease after request');
  });
});

// ─── Agent.request('budget') ─────────────────────────────────────────────────

describe("Agent.request('budget')", () => {
  it('returns agent budget information', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('budget');

    assert.ok(response.success);
    const data = response.data as {
      agentId: string;
      gammaBudget: number;
      gammaRemaining: number;
    };
    assert.equal(data.gammaBudget, 0.3);
    assert.equal(data.gammaRemaining, 0.3); // Nothing used yet
    assert.equal(data.agentId, agent.id);
  });

  it('reflects budget changes after task execution', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    await agent.execute('do some work');
    const response = await agent.request('budget');

    const data = response.data as { gammaRemaining: number };
    assert.ok(data.gammaRemaining < 0.3, 'Budget should be less after execution');
  });

  it('budget check is free (no γ cost)', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const budgetBefore = agent.getBudget();
    await agent.request('budget');
    const budgetAfter = agent.getBudget();

    assert.equal(budgetBefore, budgetAfter, 'Budget check should cost 0 γ');
  });
});

// ─── Agent.request('validate') ───────────────────────────────────────────────

describe("Agent.request('validate')", () => {
  it('validates correct ternary signals', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'validator', gammaBudget: 0.3 });

    const response = await agent.request('validate', { signals: [1, -1, 0, 1, 1] });

    assert.ok(response.success);
    const data = response.data as { valid: boolean; aggregate: number; sum: number };
    assert.ok(data.valid);
    assert.equal(data.sum, 2);
    assert.equal(data.aggregate, 1); // Positive sum → +1
  });

  it('validates zero-sum signals', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'validator', gammaBudget: 0.3 });

    const response = await agent.request('validate', { signals: [1, -1, 0] });

    assert.ok(response.success);
    const data = response.data as { aggregate: number; sum: number };
    assert.equal(data.sum, 0);
    assert.equal(data.aggregate, 0); // Zero sum → 0 (hold)
  });

  it('rejects non-ternary signals', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'validator', gammaBudget: 0.3 });

    const response = await agent.request('validate', { signals: [1, 2, -1] });

    assert.ok(!response.success);
    assert.ok(response.error!.includes('Invalid ternary'));
  });

  it('rejects missing signals param', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'validator', gammaBudget: 0.3 });

    const response = await agent.request('validate');

    assert.ok(!response.success);
    assert.ok(response.error!.includes('signals'));
  });
});

// ─── Agent.request('conserve') ───────────────────────────────────────────────

describe("Agent.request('conserve')", () => {
  it('returns current conservation state', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('conserve');

    assert.ok(response.success);
    const data = response.data as {
      gamma: number;
      eta: number;
      C: number;
      delta: number;
      invariantHolds: boolean;
    };
    assert.ok(Math.abs(data.C - Math.log2(3)) < 1e-15);
    assert.ok(data.invariantHolds);
    assert.ok(data.delta > 0);
  });

  it('supports what-if analysis with custom γ/η', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('conserve', { gamma: 1.0, eta: 0.7 });

    assert.ok(response.success);
    const data = response.data as { scenario: string; wouldViolate: boolean; delta: number };
    assert.equal(data.scenario, 'what-if');
    assert.ok(data.wouldViolate); // 1.0 + 0.7 > C
    assert.ok(data.delta < 0);
  });

  it('conserve check is free (no γ cost)', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const budgetBefore = agent.getBudget();
    await agent.request('conserve');
    const budgetAfter = agent.getBudget();

    assert.equal(budgetBefore, budgetAfter, 'Conserve check should cost 0 γ');
  });
});

// ─── Agent.request('status') ─────────────────────────────────────────────────

describe("Agent.request('status')", () => {
  it('returns fleet status snapshot', async () => {
    const fleet = new Fleet({ name: 'status-test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const response = await agent.request('status');

    assert.ok(response.success);
    const data = response.data as { name: string; agentCount: number };
    assert.equal(data.name, 'status-test-fleet');
    assert.ok(data.agentCount >= 1);
  });
});

// ─── Unknown Capability ──────────────────────────────────────────────────────

describe('Unknown capability handling', () => {
  it('returns error for unregistered capability', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    // 'spawn' is not registered by default
    const response = await agent.request('spawn', { role: 'builder' });

    assert.ok(!response.success);
    assert.ok(response.error!.includes('not registered'));
  });
});

// ─── Custom Handler Registration ─────────────────────────────────────────────

describe('Custom capability handlers', () => {
  it('can register and use custom handlers', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    let handlerCalled = false;
    fleet.registerCapability('crate-info', async (req: { params: Record<string, unknown> }) => {
      handlerCalled = true;
      return {
        success: true,
        data: { crate: req.params.name, version: '0.1.0' },
        gammaCost: 0.002,
        etaProduced: 0.001,
      };
    });

    const response = await agent.request('crate-info', { name: 'superinstance' });

    assert.ok(handlerCalled);
    assert.ok(response.success);
    const data = response.data as { crate: string; version: string };
    assert.equal(data.crate, 'superinstance');
    assert.equal(data.version, '0.1.0');
  });

  it('custom handler γ cost is deducted from agent budget', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    fleet.registerCapability('crate-info', async () => ({
      success: true,
      data: {},
      gammaCost: 0.05,
      etaProduced: 0.02,
    }));

    const budgetBefore = agent.getBudget();
    await agent.request('crate-info');
    const budgetAfter = agent.getBudget();

    assert.ok(
      budgetAfter < budgetBefore,
      `Budget should decrease (${budgetAfter} < ${budgetBefore})`,
    );
  });
});

// ─── γ Budget Deduction ──────────────────────────────────────────────────────

describe('γ budget deduction', () => {
  it('multiple requests accumulate γ cost', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.05 });

    // Each search costs 0.005 γ
    const r1 = await agent.request('search', { query: 'governor' });
    const r2 = await agent.request('search', { query: 'convergence' });
    const r3 = await agent.request('search', { query: 'ternary' });

    assert.ok(r1.success);
    assert.ok(r2.success);
    assert.ok(r3.success);

    // Should have used ~0.015 γ (3 × 0.005)
    const budget = await agent.request('budget');
    const data = budget.data as { gammaRemaining: number };
    assert.ok(data.gammaRemaining < 0.05 - 0.014, `Should have used >0.014 γ, remaining=${data.gammaRemaining}`);
  });

  it('agent with exhausted budget cannot make requests', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.006 });

    // First request should succeed (costs 0.005 γ)
    const r1 = await agent.request('search', { query: 'test' });
    assert.ok(r1.success);

    // Second request should also succeed (0.005 more, but budget has 0.006 - 0.005 = 0.001 left, minus reserve)
    // Actually with the MIN_RESERVE of 0.001, remaining is 0.006 - 0.005 - 0.001 = 0 → can't make another
    const r2 = await agent.request('search', { query: 'test' });
    assert.ok(!r2.success, 'Should fail due to exhausted budget');
    assert.ok(r2.error!.includes('exhausted') || r2.error!.includes('γ'));
  });
});

// ─── Agent Delegation ────────────────────────────────────────────────────────

describe('Agent.delegate()', () => {
  it('delegates task to matching role agent', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });

    const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    const researcher = fleet.spawn({ role: 'researcher', gammaBudget: 0.3 });

    const result = await builder.delegate('researcher', 'research ternary computing', 0.1);

    assert.ok(result.success);
    assert.ok(result.delegatedTo.length > 0);
    assert.equal(result.delegatedTo, researcher.id);
    assert.ok(result.result!.success);
  });

  it('fails when no matching agent is available', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    // No researcher in fleet
    const result = await builder.delegate('researcher', 'research something');

    assert.ok(!result.success);
    assert.ok(result.error!.includes('No active'));
  });

  it('does not delegate to self', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    // Builder delegates to builder — but self is excluded
    const result = await builder.delegate('builder', 'build something');

    assert.ok(!result.success);
    assert.ok(result.error!.includes('No active'));
  });

  it('selects agent with most remaining budget', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });

    const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
    const researcher1 = fleet.spawn({ role: 'researcher', name: 'r1', gammaBudget: 0.5 });
    const researcher2 = fleet.spawn({ role: 'researcher', name: 'r2', gammaBudget: 0.1 });

    // r2 has less budget, so should delegate to r1
    const result = await builder.delegate('researcher', 'research task');

    assert.ok(result.success);
    assert.equal(result.delegatedTo, researcher1.id);
  });
});

// ─── Conservation Integration ────────────────────────────────────────────────

describe('Conservation integration', () => {
  it('request γ costs flow to fleet ledger', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    const gammaBefore = fleet.totalGammaUsed;
    await agent.request('search', { query: 'test' });
    const gammaAfter = fleet.totalGammaUsed;

    assert.ok(gammaAfter > gammaBefore, 'Fleet γ should increase after request');
  });

  it('fleet status shows request activity', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });

    await agent.request('search', { query: 'governor' });
    await agent.request('validate', { signals: [1, 0, -1] });

    const status = fleet.status();
    assert.ok(status.conservation.gamma > 0, 'Fleet γ should be > 0 after requests');
    assert.ok(status.conservation.eta > 0, 'Fleet η should be > 0 after requests');
    assert.ok(status.conservation.status === 'healthy', 'Fleet should still be healthy');
  });
});
