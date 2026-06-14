// ─── Example: Wrapping an OpenAI Agents SDK Agent ────────────────────────────
//
// Shows how to take an existing OpenAI Agents SDK agent and wrap it
// with SuperInstance conservation governance.
//
// Run: npx tsx examples/openai-agent.ts
//

import { Fleet, wrapOpenAI, type WrappableAgent } from '../src/index.js';

// ─── Simulated OpenAI Agent ──────────────────────────────────────────────────
//
// In real usage, you'd import from '@openai/agents' and use Runner.run().
// Here we simulate the interface for a zero-dependency example.

const openaiAgent: WrappableAgent = {
  name: 'code-builder',
  framework: 'openai',
  async execute(task: string): Promise<string> {
    // Simulate an LLM call
    await new Promise((r) => setTimeout(r, 100));
    return `[Generated] ${task}\n\nexport function solve() {\n  return 42;\n}`;
  },
};

// ─── Create Governed Fleet ───────────────────────────────────────────────────

async function main() {
  const fleet = new Fleet({
    name: 'openai-production',
    governor: {
      setpoint: 0.5,
      Kp: 0.8,
      Ki: 0.15,
      Kd: 0.25,
      deadband: 0.03,
    },
  });

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  SuperInstance + OpenAI Agents SDK Demo   ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Wrap the OpenAI agent with conservation governance
  const governed = wrapOpenAI(openaiAgent, fleet, 'builder');

  console.log(`Wrapped agent: ${governed.name} (${governed.framework})`);
  console.log(`Role: ${governed.role}\n`);

  // Execute tasks through governance
  const tasks = [
    'Build a REST endpoint for /users',
    'Create a rate limiter middleware',
    'Write unit tests for the auth module',
  ];

  for (const task of tasks) {
    console.log(`─── Task: ${task} ───`);

    const result = await governed.execute(task);

    if (result.success) {
      console.log(`  ✅ Success`);
      console.log(`  γ used: ${result.gammaUsed.toFixed(4)}`);
      console.log(`  η produced: ${result.etaProduced.toFixed(4)}`);
      console.log(`  Conservation: ${result.conservationCheck.status} (δ=${result.conservationCheck.delta.toFixed(4)})`);
    } else {
      console.log(`  ❌ Blocked by conservation governor`);
      console.log(`  Reason: ${result.conservationCheck.status}`);
    }
    console.log();
  }

  // Final fleet status
  const status = fleet.status();
  console.log('─── Fleet Status ───');
  console.log(`  Name: ${status.name}`);
  console.log(`  Agents: ${status.agentCount}`);
  console.log(`  γ total: ${status.conservation.gamma.toFixed(4)}`);
  console.log(`  η total: ${status.conservation.eta.toFixed(4)}`);
  console.log(`  C:       ${status.conservation.C.toFixed(4)}`);
  console.log(`  δ:       ${status.conservation.delta.toFixed(4)}`);
  console.log(`  Status:  ${status.conservation.status}`);
  console.log(`\n  ${'γ + η ≤ C'.padEnd(20)} — build within the law.\n`);
}

main().catch(console.error);
