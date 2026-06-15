// ─── LangGraph Integration Tests ─────────────────────────────────────────────
//
// Tests for the SuperInstance LangGraph governance integration.
// Run: npm test  (after build)
//

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Fleet } from '@superinstance/sdk';
import {
  governGraph,
  GovernedGraph,
  governNode,
  createGovernedMultiAgent,
} from '../src/index.js';
import {
  extractConservation,
  injectConservation,
  conservationReducer,
  CONSERVATION_KEY,
} from '../src/state-adapter.js';
import type { ConservationChannel } from '../src/state-adapter.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simple identity graph for testing */
function identityGraph<T>(): { invoke: (state: T) => Promise<T> } {
  return {
    async invoke(state: T): Promise<T> {
      return state;
    },
  };
}

/** Graph that appends a key to state */
function appendingGraph(): { invoke: (state: any) => Promise<any> } {
  return {
    async invoke(state: any): Promise<any> {
      return { ...state, output: 'processed' };
    },
  };
}

/** Make a fresh fleet for each test */
function makeFleet(name: string = 'test-fleet'): Fleet {
  return new Fleet({ name });
}

// ─── GovernedGraph Tests ───────────────────────────────────────────────────

describe('GovernedGraph', () => {
  let fleet: Fleet;

  beforeEach(() => {
    fleet = makeFleet('test-fleet');
  });

  it('should wrap and execute a graph', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'builder',
      gammaBudget: 0.3,
      name: 'test-graph',
    });

    const { state, result } = await gov.invoke({ input: 'hello' });

    assert.equal(state.output, 'processed');
    assert.equal(result.success, true);
    assert.ok(result.gammaUsed > 0, 'gamma should be positive');
    assert.ok(result.etaProduced > 0, 'eta should be positive');
    assert.ok(result.taskId.startsWith('gov-graph-'));
  });

  it('should check budget before invocation', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'builder',
      gammaBudget: 0.0001, // Extremely tiny budget
      name: 'tiny-budget',
    });

    // First invocation should succeed (gamma is clamped to min 0.005)
    // but will exceed the tiny budget
    const { result: r1 } = await gov.invoke({ input: 'x' });
    // gammaUsed is at least 0.005 > 0.0001, so budget is exhausted after first
    assert.ok(gov.canRun() === false, 'budget should be exhausted');
  });

  it('should report γ/η after invocation', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'researcher',
      gammaBudget: 0.5,
      name: 'reporting-graph',
    });

    const { result } = await gov.invoke({ data: 'test' });

    assert.ok(result.gammaUsed > 0, 'γ should be reported');
    assert.ok(result.etaProduced > 0, 'η should be reported');
    assert.ok(result.conservationCheck, 'conservation check should be present');
    assert.ok(typeof result.conservationCheck.gamma === 'number');
    assert.ok(typeof result.conservationCheck.eta === 'number');
    assert.ok(typeof result.conservationCheck.delta === 'number');
  });

  it('should block execution when budget is exhausted', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'builder',
      gammaBudget: 0.006, // Enough for exactly one invocation (min gamma = 0.005)
      name: 'limited-graph',
    });

    // First invocation: succeeds
    const r1 = await gov.invoke({ step: 1 });
    assert.ok(r1.result.success, 'first invocation should succeed');

    // Second invocation: budget exhausted
    const r2 = await gov.invoke({ step: 2 });
    assert.equal(r2.result.success, false);
    assert.match(r2.result.output, /budget exhausted/i);
    assert.equal(r2.state.step, 2, 'state should be unchanged (passed through)');
  });

  it('canRun() should reflect budget availability', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'validator',
      gammaBudget: 0.01,
      name: 'canrun-test',
    });

    assert.ok(gov.canRun(), 'should be able to run initially');

    await gov.invoke({ data: 1 });
    // After one invocation gammaUsed >= 0.005, budget 0.01
    // Second should still be possible if gammaUsed < 0.01
    if (gov.getGammaUsed() >= 0.01) {
      assert.ok(!gov.canRun(), 'should not be able to run after budget exhaustion');
    } else {
      assert.ok(gov.canRun(), 'should still have budget remaining');
    }
  });

  it('should accumulate γ across multiple invocations', async () => {
    const graph = appendingGraph();
    const gov = governGraph({
      fleet,
      graph,
      role: 'builder',
      gammaBudget: 1.0, // Large budget
      name: 'accum-test',
    });

    const { result: r1 } = await gov.invoke({ step: 1 });
    const gammaAfter1 = gov.getGammaUsed();

    const { result: r2 } = await gov.invoke({ step: 2 });
    const gammaAfter2 = gov.getGammaUsed();

    assert.ok(gammaAfter2 > gammaAfter1, 'γ should accumulate');
    assert.ok(r1.success && r2.success, 'both should succeed');
    assert.equal(gov.getInvocationCount(), 2);
  });
});

// ─── governNode Tests ────────────────────────────────────────────────────────

describe('governNode', () => {
  let fleet: Fleet;

  beforeEach(() => {
    fleet = makeFleet('node-test-fleet');
  });

  it('should wrap a node function with governance', async () => {
    const originalNode = async (state: any) => ({ ...state, processed: true });
    const governed = governNode(originalNode, fleet, 0.2);

    const result = await governed({ input: 'test' });
    assert.equal(result.processed, true);
  });

  it('should allocate γ budget per node', async () => {
    const fleetGamma = fleet.totalGammaUsed;
    const originalNode = async (state: any) => ({ ...state, done: true });
    const governed = governNode(originalNode, fleet, 0.1);

    await governed({ task: 'work' });

    assert.ok(fleet.totalGammaUsed > fleetGamma, 'fleet γ should increase');
  });

  it('should pass through when budget exhausted', async () => {
    let callCount = 0;
    const originalNode = async (state: any) => {
      callCount++;
      return { ...state, count: callCount };
    };
    const governed = governNode(originalNode, fleet, 0.001); // Tiny budget

    // First call: executes (gamma min is 0.005 which > 0.001)
    // Actually, gamma is checked before execution: gammaUsed (0) < gammaBudget (0.001) → executes
    // After: gammaUsed ~ 0.005 > 0.001
    const r1 = await governed({ step: 1 });
    assert.equal(callCount, 1, 'first call should execute');

    // Second call: budget exhausted, passes through
    const r2 = await governed({ step: 2 });
    assert.equal(callCount, 1, 'second call should not execute');
    assert.equal(r2.step, 2, 'state passes through unchanged');
  });
});

// ─── createGovernedMultiAgent Tests ──────────────────────────────────────────

describe('createGovernedMultiAgent', () => {
  it('should create a fleet and invoke pipeline', async () => {
    const { fleet, invoke } = createGovernedMultiAgent({
      fleetName: 'multi-agent-test',
      agents: [
        { name: 'A', role: 'researcher', gammaBudget: 0.2, invoke: async (s) => ({ ...s, a: true }) },
        { name: 'B', role: 'builder', gammaBudget: 0.3, invoke: async (s) => ({ ...s, b: true }) },
        { name: 'C', role: 'validator', gammaBudget: 0.15, invoke: async (s) => ({ ...s, c: true }) },
      ],
    });

    const result = await invoke({ task: 'test pipeline' });

    assert.equal(result.a, true, 'agent A should have run');
    assert.equal(result.b, true, 'agent B should have run');
    assert.equal(result.c, true, 'agent C should have run');
    assert.equal(result.task, 'test pipeline');
    assert.ok(fleet.status().agentCount === 3);
  });

  it('should enforce conservation across all agents', async () => {
    const { fleet, invoke } = createGovernedMultiAgent({
      fleetName: 'conservation-test',
      agents: [
        { name: 'X', role: 'builder', gammaBudget: 0.3, invoke: async (s) => ({ ...s, x: true }) },
        { name: 'Y', role: 'validator', gammaBudget: 0.2, invoke: async (s) => ({ ...s, y: true }) },
      ],
    });

    await invoke({ task: 'check conservation' });

    const cons = fleet.getConservation();
    assert.ok(cons.gamma > 0, 'fleet γ should be positive');
    assert.ok(cons.eta > 0, 'fleet η should be positive');
    assert.ok(cons.delta > 0, 'fleet should have remaining budget');
    assert.notEqual(cons.status, 'violated', 'conservation should not be violated');
  });

  it('should accumulate γ correctly across sequential invocations', async () => {
    const { fleet, invoke } = createGovernedMultiAgent({
      fleetName: 'accumulate-test',
      agents: [
        { name: 'P', role: 'builder', gammaBudget: 0.5, invoke: async (s) => ({ ...s, p: Date.now() }) },
      ],
    });

    const gammaBefore = fleet.totalGammaUsed;
    await invoke({ task: 'first' });
    const gammaAfter1 = fleet.totalGammaUsed;
    await invoke({ task: 'second' });
    const gammaAfter2 = fleet.totalGammaUsed;

    assert.ok(gammaAfter1 > gammaBefore, 'γ should increase after first invocation');
    assert.ok(gammaAfter2 > gammaAfter1, 'γ should increase after second invocation');
  });

  it('should inject conservation state into pipeline state', async () => {
    const { invoke } = createGovernedMultiAgent({
      fleetName: 'injection-test',
      agents: [
        { name: 'Z', role: 'builder', gammaBudget: 0.2, invoke: async (s) => ({ ...s, z: true }) },
      ],
    });

    const result = await invoke({ task: 'injection' });

    assert.ok(result.__conservation__, 'conservation channel should be present');
    assert.ok(typeof result.__conservation__.gamma === 'number');
    assert.ok(typeof result.__conservation__.eta === 'number');
    assert.ok(typeof result.__conservation__.delta === 'number');
    assert.equal(result.__conservation__.agentCount, 1);
  });
});

// ─── State Adapter Tests ─────────────────────────────────────────────────────

describe('State Adapter', () => {
  it('should extract conservation data from state', () => {
    const state = {
      messages: ['hello'],
      [CONSERVATION_KEY]: {
        gamma: 0.15,
        eta: 0.08,
        delta: 1.355,
        agentCount: 3,
      },
    };

    const extracted = extractConservation(state);

    assert.equal(extracted.gamma, 0.15);
    assert.equal(extracted.eta, 0.08);
    assert.equal(extracted.delta, 1.355);
    assert.equal(extracted.agentCount, 3);
  });

  it('should return empty partial when no conservation data', () => {
    const state = { messages: ['hello'] };
    const extracted = extractConservation(state);
    assert.deepEqual(extracted, {});
  });

  it('should inject conservation data into state', () => {
    const state = { messages: ['hello'] };
    const channel: ConservationChannel = {
      gamma: 0.2,
      eta: 0.1,
      delta: 1.285,
      agentCount: 5,
    };

    const newState = injectConservation(state, channel);

    assert.deepEqual(newState.messages, ['hello']);
    assert.deepEqual(newState[CONSERVATION_KEY], channel);
    // Original state should not be mutated
    assert.equal((state as Record<string, unknown>)[CONSERVATION_KEY], undefined);
  });

  it('should round-trip conservation data', () => {
    const original: ConservationChannel = {
      gamma: 0.333,
      eta: 0.222,
      delta: 1.03,
      agentCount: 7,
    };

    const state = injectConservation({ foo: 'bar' }, original);
    const extracted = extractConservation(state);

    assert.equal(extracted.gamma, original.gamma);
    assert.equal(extracted.eta, original.eta);
    assert.equal(extracted.delta, original.delta);
    assert.equal(extracted.agentCount, original.agentCount);
  });

  it('conservationReducer should merge updates', () => {
    const reducer = conservationReducer();
    const current: ConservationChannel = {
      gamma: 0.1,
      eta: 0.05,
      delta: 1.435,
      agentCount: 2,
    };

    const merged = reducer.reducer(current, { gamma: 0.2, agentCount: 3 });

    assert.equal(merged.gamma, 0.2);
    assert.equal(merged.eta, 0.05); // Unchanged
    assert.equal(merged.agentCount, 3);
  });

  it('conservationReducer should provide default', () => {
    const reducer = conservationReducer();
    const def = reducer.default();

    assert.equal(def.gamma, 0);
    assert.equal(def.eta, 0);
    assert.ok(def.delta > 0);
    assert.equal(def.agentCount, 0);
  });
});

// ─── Integration: Full Flow Tests ────────────────────────────────────────────

describe('Full Integration', () => {
  it('should run a governed graph within fleet conservation', async () => {
    const fleet = new Fleet({ name: 'integration-fleet' });

    // Create a simple graph
    const graph = {
      async invoke(state: any): Promise<any> {
        return { ...state, result: 'computed' };
      },
    };

    const gov = governGraph({
      fleet,
      graph,
      role: 'orchestrator',
      gammaBudget: 0.4,
      name: 'integration-graph',
    });

    // Run multiple invocations
    const r1 = await gov.invoke({ input: 'a' });
    const r2 = await gov.invoke({ input: 'b' });

    assert.ok(r1.result.success);
    assert.ok(r2.result.success);

    // Fleet should have accumulated γ
    const cons = fleet.getConservation();
    assert.ok(cons.gamma > 0);
    assert.ok(cons.delta > 0, 'should not violate conservation');
  });

  it('should handle graph execution errors gracefully', async () => {
    const fleet = new Fleet({ name: 'error-fleet' });

    const failingGraph = {
      async invoke(_state: any): Promise<any> {
        throw new Error('Node execution failed');
      },
    };

    const gov = governGraph({
      fleet,
      graph: failingGraph,
      role: 'builder',
      gammaBudget: 0.3,
      name: 'failing-graph',
    });

    const { state, result } = await gov.invoke({ input: 'will-fail' });

    assert.equal(result.success, false);
    assert.match(result.output, /failed/i);
    assert.equal(result.gammaUsed, 0, 'no γ consumed on failure');
    assert.equal(state.input, 'will-fail', 'original state returned on failure');
  });
});
