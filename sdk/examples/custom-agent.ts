// ─── Example: Standalone Conservation-Governed Fleet ─────────────────────────
//
// A complete from-scratch example showing SuperInstance governance
// with custom agents — no framework dependency.
//
// Run: npx tsx examples/custom-agent.ts
//

import { Fleet, convergenceDelta } from '../src/index.js';

// ─── Simulated Agent Tasks ───────────────────────────────────────────────────
//
// Each task simulates real agent work with different γ/η profiles.

async function simulateWork(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  SuperInstance Custom Fleet Demo           ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ─── Create the Fleet ──────────────────────────────────────────────────────
  const fleet = new Fleet({
    name: 'build-pipeline',
    governor: { setpoint: 0.45 },
  });

  console.log(`Fleet: ${fleet.name}`);
  console.log(`C = ${fleet.governor.getC().toFixed(6)}`);
  console.log(`δ(3) = ${convergenceDelta(3).toFixed(4)} (80% cancellation)\n`);

  // ─── Spawn Agents ──────────────────────────────────────────────────────────
  const architect = fleet.spawn({
    name: 'architect',
    role: 'orchestrator',
    gammaBudget: 0.4,
  });

  const builder = fleet.spawn({
    name: 'builder',
    role: 'builder',
    gammaBudget: 0.35,
  });

  const tester = fleet.spawn({
    name: 'tester',
    role: 'validator',
    gammaBudget: 0.2,
  });

  console.log(`Spawned 3 agents:`);
  for (const agent of fleet.getAgents()) {
    console.log(`  • ${agent.name} (${agent.role}) — γ budget: ${agent.gammaBudget}`);
  }
  console.log();

  // ─── Execute Governed Tasks ────────────────────────────────────────────────
  const tasks = [
    { agent: architect, task: 'Design REST API schema for user management' },
    { agent: builder, task: 'Implement CRUD endpoints with input validation' },
    { agent: builder, task: 'Add rate limiting and authentication middleware' },
    { agent: tester, task: 'Write integration tests for all endpoints' },
    { agent: architect, task: 'Review architecture and create deployment plan' },
  ];

  for (const { agent, task } of tasks) {
    await simulateWork(50);
    const result = await agent.execute(task);

    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${agent.name} → "${task.substring(0, 50)}..."`);
    console.log(`   γ=${result.gammaUsed.toFixed(4)}  η=${result.etaProduced.toFixed(4)}  δ=${result.conservationCheck.delta.toFixed(4)}`);

    const decision = fleet.getDecision();
    if (decision.action !== 'hold') {
      console.log(`   ⚡ Governor: ${decision.action.toUpperCase()} — ${decision.reason.substring(0, 70)}`);
    }
    console.log();
  }

  // ─── Final Fleet Report ────────────────────────────────────────────────────
  const status = fleet.status();

  console.log('═══════════ Fleet Report ═══════════');
  console.log(`  Name:           ${status.name}`);
  console.log(`  Agents:         ${status.agentCount} (${status.activeAgents} active)`);
  console.log(`  Uptime:         ${(status.uptime / 1000).toFixed(2)}s`);
  console.log();
  console.log('  Conservation:');
  console.log(`    γ (coupling):  ${status.conservation.gamma.toFixed(4)}`);
  console.log(`    η (value):     ${status.conservation.eta.toFixed(4)}`);
  console.log(`    C (capacity):  ${status.conservation.C.toFixed(4)}`);
  console.log(`    δ (headroom):  ${status.conservation.delta.toFixed(4)}`);
  console.log(`    Status:        ${status.conservation.status.toUpperCase()}`);
  console.log();
  console.log('  Agent Details:');
  for (const a of status.agents) {
    console.log(`    ${a.name} (${a.role}) — γ:${a.gammaUsed.toFixed(3)}/${a.gammaBudget} η:${a.etaProduced.toFixed(3)} [${a.phase}]`);
  }
  console.log();
  console.log('  Governor Decision:');
  const d = fleet.getDecision();
  console.log(`    Action: ${d.action.toUpperCase()}`);
  console.log(`    Reason: ${d.reason}`);
  console.log();
  console.log(`  ${'γ + η ≤ C'.padEnd(20)} — build within the law.`);
  console.log('═══════════════════════════════════');
}

main().catch(console.error);
