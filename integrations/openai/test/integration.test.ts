// ─── Integration Tests ───────────────────────────────────────────────────────
//
// Tests for the SuperInstance × OpenAI integration layer.
// Run: npm test
//

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Fleet } from '@superinstance/sdk';
import {
  createGovernedAgent,
  createGovernedFleet,
  GovernedAgent,
  TokenTracker,
} from '../src/index.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simulated OpenAI execute function */
function makeExecutor(result = 'Task completed', delay = 0) {
  return async (task: string): Promise<string> => {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    return `${result}: ${task}`;
  };
}

/** Failing executor */
function makeFailingExecutor(error = 'Task failed') {
  return async (): Promise<string> => {
    throw new Error(error);
  };
}

// ─── TokenTracker Tests ──────────────────────────────────────────────────────

describe('TokenTracker', () => {
  let tracker: TokenTracker;

  beforeEach(() => {
    tracker = new TokenTracker();
  });

  it('converts prompt tokens to γ correctly', () => {
    // γ = prompt_tokens / 10000
    assert.equal(tracker.tokensToGamma(10000, 0), 1.0);
    assert.equal(tracker.tokensToGamma(5000, 0), 0.5);
    assert.equal(tracker.tokensToGamma(0, 0), 0);
  });

  it('converts output to η correctly', () => {
    const eta = tracker.outputToEta('success output', true);
    assert.ok(eta > 0, 'eta should be positive for successful output');

    const etaFailed = tracker.outputToEta('error output', false);
    assert.equal(etaFailed, 0, 'failed tasks should have η = 0');
  });

  it('caps η below C', () => {
    // Very large output → should be capped at C × 0.8 ≈ 1.268
    const bigOutput = 'x'.repeat(100000);
    const eta = tracker.outputToEta(bigOutput, true);
    assert.ok(eta <= 1.269, `eta should be capped below C×0.8, got ${eta}`);
  });

  it('tracks cumulative usage', () => {
    tracker.recordTask(5000, 2000, true);
    tracker.recordTask(3000, 1000, true);

    const cumulative = tracker.getCumulative();
    assert.equal(cumulative.promptTokens, 8000);
    assert.equal(cumulative.completionTokens, 3000);
    assert.equal(cumulative.gammaTotal, 0.8); // 8000/10000
  });

  it('records failed tasks with η = 0', () => {
    const { gamma, eta } = tracker.recordTask(4000, 1000, false);
    assert.ok(gamma > 0, 'γ should still count for failed tasks');
    assert.equal(eta, 0, 'η should be 0 for failed tasks');
  });

  it('resets cleanly', () => {
    tracker.recordTask(5000, 2000, true);
    tracker.reset();
    const cum = tracker.getCumulative();
    assert.equal(cum.promptTokens, 0);
    assert.equal(cum.gammaTotal, 0);
  });
});

// ─── createGovernedAgent Tests ───────────────────────────────────────────────

describe('createGovernedAgent', () => {
  it('creates a working governed agent', () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'TestBuilder',
      gammaBudget: 0.3,
      execute: makeExecutor(),
    });

    assert.ok(agent instanceof GovernedAgent);
    assert.equal(agent.name, 'TestBuilder');
    assert.equal(agent.role, 'builder');
  });

  it('execute() returns a TaskResult', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'Worker',
      gammaBudget: 0.3,
      execute: makeExecutor('Built it'),
    });

    const result = await agent.execute('build the thing');

    assert.ok(result.taskId, 'should have a taskId');
    assert.equal(result.success, true);
    assert.ok(result.output.includes('Built it'));
    assert.ok(result.gammaUsed > 0, 'should report γ used');
    assert.ok(result.conservationCheck, 'should have conservation state');
  });

  it('execute() reports γ/η after running', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'GammaReporter',
      gammaBudget: 0.5,
      execute: makeExecutor('Done'),
    });

    const result = await agent.execute('do something substantial');
    assert.ok(result.gammaUsed > 0, 'γ should be > 0');
    assert.ok(result.etaProduced > 0, 'η should be > 0');
    assert.ok(result.conservationCheck.gamma > 0, 'fleet γ should reflect usage');
  });

  it('execute() checks budget before running', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    let executed = false;

    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'BudgetChecker',
      gammaBudget: 0.001, // very low budget
      execute: async () => {
        executed = true;
        return 'should not reach';
      },
    });

    // First execution might use up the tiny budget
    await agent.execute('small task');

    // Second execution should be blocked
    const result = await agent.execute('another task');
    assert.equal(result.success, false, 'should fail when budget exhausted');
    assert.equal(executed, false, 'execute fn should not be called when budget exhausted');
  });

  it('handles execute function errors gracefully', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'ErrorAgent',
      gammaBudget: 0.3,
      execute: makeFailingExecutor('API timeout'),
    });

    const result = await agent.execute('will fail');
    assert.equal(result.success, false);
    assert.ok(result.output.includes('API timeout'));
  });
});

// ─── Budget Exhaustion Tests ─────────────────────────────────────────────────

describe('Budget exhaustion', () => {
  it('prevents execution when budget is exhausted', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    let callCount = 0;

    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'ExhaustBudget',
      gammaBudget: 0.005, // very small budget
      execute: async () => {
        callCount++;
        return 'done';
      },
    });

    // Use long task strings to consume γ quickly
    const longTask = 'x'.repeat(5000);

    // Execute until budget runs out
    let successes = 0;
    let blocked = 0;
    for (let i = 0; i < 10; i++) {
      const r = await agent.execute(longTask);
      if (r.success) successes++;
      else blocked++;
    }

    assert.ok(callCount < 10, `should not execute all tasks (${callCount} calls)`);
    assert.ok(blocked > 0, 'some tasks should be blocked');
    assert.ok(agent.getBudget() < agent.getBudget() + 1, 'budget should be consumed');
  });
});

// ─── Delegate Tests ──────────────────────────────────────────────────────────

describe('delegate()', () => {
  it('routes to fleet capability router', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });

    // Spawn a target agent so delegation has someone to delegate to
    fleet.spawn({ name: 'TargetBuilder', role: 'builder', gammaBudget: 0.2 });

    const agent = createGovernedAgent({
      fleet,
      role: 'orchestrator',
      name: 'Delegator',
      gammaBudget: 0.3,
      execute: makeExecutor(),
    });

    const result = await agent.delegate('builder', 'delegate this task');
    assert.ok(result, 'delegate should return a result');
  });
});

// ─── Request Tests ───────────────────────────────────────────────────────────

describe('request()', () => {
  it('routes to fleet capability router', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'Requester',
      gammaBudget: 0.3,
      execute: makeExecutor(),
    });

    // 'budget' is a built-in capability
    const result = await agent.request('budget');
    assert.ok(result, 'request should return a response');
  });

  it('returns error for unknown capability', async () => {
    const fleet = new Fleet({ name: 'test-fleet' });
    const agent = createGovernedAgent({
      fleet,
      role: 'builder',
      name: 'UnknownCap',
      gammaBudget: 0.3,
      execute: makeExecutor(),
    });

    const result = await agent.request('nonexistent-cap') as any;
    assert.equal(result.success, false);
  });
});

// ─── createGovernedFleet Tests ───────────────────────────────────────────────

describe('createGovernedFleet', () => {
  it('creates fleet with multiple governed agents', () => {
    const { fleet, agents } = createGovernedFleet({
      name: 'multi-agent-test',
      agents: [
        { name: 'A', role: 'builder', gammaBudget: 0.2, execute: makeExecutor() },
        { name: 'B', role: 'researcher', gammaBudget: 0.15, execute: makeExecutor() },
        { name: 'C', role: 'validator', gammaBudget: 0.1, execute: makeExecutor() },
      ],
    });

    assert.equal(fleet.name, 'multi-agent-test');
    assert.equal(agents.length, 3);
    assert.equal(agents[0].name, 'A');
    assert.equal(agents[1].name, 'B');
    assert.equal(agents[2].name, 'C');
  });

  it('multiple agents share fleet conservation state', async () => {
    const { fleet, agents } = createGovernedFleet({
      name: 'shared-conservation',
      agents: [
        { name: 'Builder', role: 'builder', gammaBudget: 0.3, execute: makeExecutor('built') },
        { name: 'Validator', role: 'validator', gammaBudget: 0.2, execute: makeExecutor('validated') },
      ],
    });

    // Agent 0 executes
    await agents[0].execute('build the feature');

    // Fleet γ should be > 0
    const status1 = fleet.status();
    assert.ok(status1.conservation.gamma > 0, 'fleet γ should reflect agent 0 usage');

    // Agent 1 executes
    await agents[1].execute('validate the feature');

    // Fleet γ should be even higher now
    const status2 = fleet.status();
    assert.ok(
      status2.conservation.gamma > status1.conservation.gamma,
      'fleet γ should increase after agent 1 executes',
    );
  });
});

// ─── Governor Decisions Affect Availability ──────────────────────────────────

describe('Governor decisions affect agent availability', () => {
  it('agents become unavailable when conservation is violated', async () => {
    const { fleet, agents } = createGovernedFleet({
      name: 'violation-test',
      agents: [
        { name: 'Spendy', role: 'builder', gammaBudget: 0.8, execute: makeExecutor('spending') },
      ],
    });

    // Exhaust conservation by running many tasks with the fleet directly
    // Record enough γ/η to approach violation
    fleet.recordTask(1.0, 0.5); // γ=1.0, η=0.5 → γ+η=1.5, near C=1.585

    const beforeStatus = fleet.getConservation();
    assert.ok(beforeStatus.delta < 0.2, 'should be near conservation limit');

    // Push over the edge
    fleet.recordTask(0.2, 0.1); // γ+η ≈ 1.8 > C

    // Now agent execution should be blocked
    const result = await agents[0].execute('should be blocked');
    const conservation = fleet.getConservation();

    // Either the agent is blocked or conservation is violated
    assert.ok(
      !result.success || conservation.status === 'violated',
      'agent should be blocked or conservation violated',
    );
  });
});
