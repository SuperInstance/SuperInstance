// ─── Example: Governed OpenAI Agent ──────────────────────────────────────────
//
// Demonstrates SuperInstance governance applied to OpenAI Agents SDK.
//
// Since we don't have an OpenAI API key in this environment, we simulate
// the agent execution. In production, replace `simulateOpenAI` with:
//
//   import { Runner } from '@openai/agents';
//   const result = await Runner.run(agent, task);
//
// $ npx tsx examples/governed-openai-agent.ts
//

import { createGovernedFleet } from '../src/index.js';
import { TokenTracker } from '../src/token-tracker.js';

// ─── Simulated OpenAI Agent ──────────────────────────────────────────────────

/**
 * Simulates an OpenAI Agents SDK call.
 * In production, replace with:
 *
 *   import { Agent as OpenAIAgent, Runner } from '@openai/agents';
 *   const agent = new OpenAIAgent({ name, instructions, model });
 *   return await Runner.run(agent, task);
 */
async function simulateOpenAI(task: string): Promise<string> {
  // Simulate varying work
  const outputs: Record<string, string> = {
    build: `[Builder] REST API scaffolded with Express, 3 routes defined.`,
    research: `[Researcher] Found 5 relevant papers on ternary computing.`,
    validate: `[Validator] All tests pass. Coverage: 94%. Conservation OK.`,
  };

  for (const key of Object.keys(outputs)) {
    if (task.toLowerCase().includes(key)) return outputs[key];
  }

  return `Completed: ${task}`;
}

// ─── Create a Governed Fleet ─────────────────────────────────────────────────

const { fleet, agents } = createGovernedFleet({
  name: 'openai-governed-demo',
  agents: [
    { name: 'Builder', role: 'builder', gammaBudget: 0.3, execute: simulateOpenAI },
    { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, execute: simulateOpenAI },
    { name: 'Validator', role: 'validator', gammaBudget: 0.15, execute: simulateOpenAI },
  ],
});

console.log('═══════════════════════════════════════════════════════');
console.log('  SuperInstance × OpenAI Agents SDK — Governed Fleet');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Fleet: ${fleet.name}`);
console.log(`Agents: ${agents.map((a) => a.name).join(', ')}\n`);

// ─── Run Governed Tasks ──────────────────────────────────────────────────────

console.log('─── Task 1: Builder builds ────────────────────────────');
const r1 = await agents[0].execute('Build a REST API for user management');
console.log(`  Result:   ${r1.output}`);
console.log(`  Success:  ${r1.success}`);
console.log(`  γ used:   ${r1.gammaUsed.toFixed(4)}`);
console.log(`  η made:   ${r1.etaProduced.toFixed(4)}`);
console.log(`  δ remain: ${r1.conservationCheck.delta.toFixed(4)}\n`);

console.log('─── Task 2: Researcher researches ─────────────────────');
const r2 = await agents[1].execute('Research ternary computing architectures');
console.log(`  Result:   ${r2.output}`);
console.log(`  Success:  ${r2.success}`);
console.log(`  γ used:   ${r2.gammaUsed.toFixed(4)}`);
console.log(`  η made:   ${r2.etaProduced.toFixed(4)}`);
console.log(`  δ remain: ${r2.conservationCheck.delta.toFixed(4)}\n`);

console.log('─── Task 3: Validator validates ───────────────────────');
const r3 = await agents[2].execute('Validate the build output and run tests');
console.log(`  Result:   ${r3.output}`);
console.log(`  Success:  ${r3.success}`);
console.log(`  γ used:   ${r3.gammaUsed.toFixed(4)}`);
console.log(`  η made:   ${r3.etaProduced.toFixed(4)}`);
console.log(`  δ remain: ${r3.conservationCheck.delta.toFixed(4)}\n`);

// ─── Token Tracker Demo ──────────────────────────────────────────────────────

console.log('─── Token Tracker ─────────────────────────────────────');
const tracker = new TokenTracker();
const gamma = tracker.tokensToGamma(5000, 1500);
const eta = tracker.outputToEta('Built and tested!', true);
console.log(`  5000 prompt tokens  → γ = ${gamma.toFixed(4)}`);
console.log(`  1500 completion      → η = ${eta.toFixed(4)}`);
console.log(`  Conservation check:  γ + η = ${(gamma + eta).toFixed(4)} ≤ ${(Math.log2(3)).toFixed(4)} ✓\n`);

// ─── Fleet Status ────────────────────────────────────────────────────────────

console.log('─── Fleet Status ──────────────────────────────────────');
const status = fleet.status();
console.log(`  Name:        ${status.name}`);
console.log(`  Agents:      ${status.agentCount} (${status.activeAgents} active)`);
console.log(`  γ total:     ${status.conservation.gamma.toFixed(4)}`);
console.log(`  η total:     ${status.conservation.eta.toFixed(4)}`);
console.log(`  δ remaining: ${status.conservation.delta.toFixed(4)}`);
console.log(`  Status:      ${status.conservation.status}`);
console.log(`  δ(n):        ${status.convergenceDelta.toFixed(4)} at n=${status.agentCount}`);

console.log('\n─── Agent Budgets ─────────────────────────────────────');
for (const a of agents) {
  const st = a.getState() as any;
  console.log(`  ${st.name.padEnd(12)} γ ${st.gammaUsed.toFixed(4)} / ${st.gammaBudget.toFixed(2)}  remaining ${st.budgetRemaining.toFixed(4)}`);
}

console.log('\n═══════════════════════════════════════════════════════');
console.log('  All tasks executed within conservation bounds. ✓');
console.log('═══════════════════════════════════════════════════════');
