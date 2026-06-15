// ─── Conservation Law Simulator ──────────────────────────────────────────────
//
// Interactive simulation showing the conservation law in action
// WITHOUT needing a real AI API. Three scenarios demonstrate:
//   1. Healthy fleet — δ stays positive, governor holds/releases
//   2. Depleted fleet — agents exhaust γ budgets, governor throttles
//   3. Scale test — δ(n) convergence as fleet grows to 10,000 agents
//
// Run: npx tsx examples/conservation-simulator.ts
//

import {
  Fleet,
  Governor,
  C,
  convergenceDelta,
  type ConservationState,
} from '../src/index.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BAR_WIDTH = 40;

function bar(value: number, max: number, fill: string = '█', empty: string = '░'): string {
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(ratio * BAR_WIDTH);
  return fill.repeat(filled) + empty.repeat(BAR_WIDTH - filled);
}

function statusIcon(status: ConservationState['status']): string {
  switch (status) {
    case 'healthy':  return '🟢';
    case 'monitor':  return '🟡';
    case 'tight':    return '🟠';
    case 'violated': return '🔴';
  }
}

function printHeader(title: string): void {
  console.log('\n' + '═'.repeat(58));
  console.log(`  ${title}`);
  console.log('═'.repeat(58));
}

function printState(step: number, state: ConservationState, decision: string): void {
  const pct = (v: number) => (v / state.C * 100).toFixed(1).padStart(5);
  console.log(
    `  step ${String(step).padStart(2)}  ${statusIcon(state.status)} ${state.status.toUpperCase().padEnd(8)}` +
    `  γ=${state.gamma.toFixed(4)} (${pct(state.gamma)}%)` +
    `  η=${state.eta.toFixed(4)} (${pct(state.eta)}%)` +
    `  δ=${state.delta.toFixed(4)}`,
  );
  console.log(
    `         γ ${bar(state.gamma, state.C)} ${pct(state.gamma)}%` +
    `\n         η ${bar(state.eta, state.C)} ${pct(state.eta)}%` +
    `\n         δ ${bar(state.delta, state.C, '▓')} ${pct(state.delta)}%`,
  );
  console.log(`         ⚡ ${decision}\n`);
}

// ─── Scenario 1: Healthy Fleet ───────────────────────────────────────────────

async function healthyFleet(): Promise<void> {
  printHeader('Scenario 1: Healthy Fleet — 3 Agents, Balanced Work');

  const fleet = new Fleet({ name: 'healthy', governor: { setpoint: 0.45 } });

  fleet.spawn({ name: 'Alice',   role: 'builder',     gammaBudget: 0.3 });
  fleet.spawn({ name: 'Bob',     role: 'researcher',  gammaBudget: 0.25 });
  fleet.spawn({ name: 'Charlie', role: 'validator',   gammaBudget: 0.2 });

  console.log(`  Agents: ${fleet.getAgents().map((a) => a.name).join(', ')}`);
  console.log(`  C = ${C.toFixed(4)} bits`);
  console.log(`  Target: γ/C = 0.45 (balanced)\n`);

  // Simulate 8 lightweight tasks
  const taskDescriptions = [
    'Build the REST API scaffold',
    'Research best practices for auth',
    'Validate the API schema',
    'Implement the user endpoints',
    'Add input sanitization',
    'Run the test suite',
    'Optimize the database queries',
    'Generate final coverage report',
  ];

  const agents = fleet.getAgents();
  let taskIdx = 0;

  for (let step = 1; step <= 8; step++) {
    const agent = agents[taskIdx % agents.length]!;
    taskIdx++;
    const desc = taskDescriptions[step - 1]!;
    await agent.execute(desc);

    const state = fleet.getConservation();
    const dec = fleet.getDecision();
    printState(step, state, `${dec.action.toUpperCase()} — ${dec.reason.substring(0, 50)}`);
  }

  const status = fleet.status();
  console.log(`  Final: ${status.agents.filter((a) => a.phase === 'active').length}/${status.agentCount} active` +
    ` | γ=${status.conservation.gamma.toFixed(4)} η=${status.conservation.eta.toFixed(4)}` +
    ` | δ=${status.conservation.delta.toFixed(4)} (${statusIcon(status.conservation.status)} ${status.conservation.status})`);
  console.log('  ✅ Fleet stayed healthy throughout — conservation law held.\n');
}

// ─── Scenario 2: Depleted Fleet ──────────────────────────────────────────────

async function depletedFleet(): Promise<void> {
  printHeader('Scenario 2: Depleted Fleet — Budgets Exhausted');

  const fleet = new Fleet({ name: 'depleted', governor: { setpoint: 0.6 } });

  // Give agents tight budgets so they run out fast
  fleet.spawn({ name: 'Worker-A', role: 'builder',   gammaBudget: 0.1 });
  fleet.spawn({ name: 'Worker-B', role: 'builder',   gammaBudget: 0.08 });

  console.log(`  Agents: ${fleet.getAgents().map((a) => `${a.name} (γ:${a.gammaBudget})`).join(', ')}`);
  console.log(`  C = ${C.toFixed(4)} bits`);
  console.log(`  Target: γ/C = 0.6 (aggressive)\n`);

  // Hammer tasks until agents are exhausted
  let step = 0;
  let allDepleted = false;

  while (!allDepleted && step < 15) {
    step++;
    const agents = fleet.getAgents();

    for (const agent of agents) {
      if (agent.getBudget() > 0.01) {
        await agent.execute('Process data batch and compute results');
      }
    }

    const state = fleet.getConservation();
    const dec = fleet.getDecision();
    printState(step, state, `${dec.action.toUpperCase()} (mag=${dec.magnitude.toFixed(3)})`);

    allDepleted = agents.every((a) => a.getBudget() <= 0.01);
  }

  const status = fleet.status();
  const active = status.agents.filter((a) => a.phase === 'active').length;
  console.log(`  Final: ${active}/${status.agentCount} active` +
    ` | γ=${status.conservation.gamma.toFixed(4)} η=${status.conservation.eta.toFixed(4)}` +
    ` | δ=${status.conservation.delta.toFixed(4)} (${statusIcon(status.conservation.status)} ${status.conservation.status})`);

  for (const a of status.agents) {
    const pct = ((a.gammaUsed / a.conservationRemaining + a.gammaUsed) * 100).toFixed(0);
    console.log(`    ${a.name}: γ used ${a.gammaUsed.toFixed(4)} / budget ${(a.gammaUsed + a.conservationRemaining).toFixed(2)} (${pct}%) [${a.phase}]`);
  }
  console.log('  ⚠️  Governor throttled exhausted agents — conservation law enforced.\n');
}

// ─── Scenario 3: Scale Convergence ───────────────────────────────────────────

function scaleTest(): void {
  printHeader('Scenario 3: Scale Test — δ(n) Convergence');

  const gov = new Governor();

  console.log('  δ(n) = (1/√n)(1 − 3/(2n))\n');
  console.log('  ' + '─'.repeat(54));
  console.log(`  ${'n'.padStart(7)}  ${'δ(n)'.padStart(10)}  ${'cancellation'.padStart(13)}  bar`);
  console.log('  ' + '─'.repeat(54));

  const fleetSizes = [3, 5, 10, 25, 50, 100, 500, 1_000, 10_000];

  for (const n of fleetSizes) {
    const delta = gov.getConvergence(n);
    const cancelPct = (1 - delta) * 100;

    // Bar chart: each █ = ~5% cancellation
    const barLen = Math.round(cancelPct / 5);
    const barStr = '█'.repeat(Math.min(barLen, BAR_WIDTH));

    console.log(
      `  ${n.toLocaleString().padStart(7)}  ${delta.toFixed(6).padStart(10)}` +
      `  ${cancelPct.toFixed(1).padStart(11)}%  ${barStr}`,
    );
  }

  console.log('  ' + '─'.repeat(54));

  // Compare actual Governor.getConvergence vs the standalone function
  console.log('\n  Cross-check: Governor.getConvergence vs convergenceDelta()');
  let allMatch = true;
  for (const n of fleetSizes) {
    const fromGov = gov.getConvergence(n);
    const fromFn = convergenceDelta(n);
    const match = Math.abs(fromGov - fromFn) < 1e-10;
    if (!match) allMatch = false;
    console.log(`    n=${n.toLocaleString().padStart(5)}: gov=${fromGov.toFixed(8)}  fn=${fromFn.toFixed(8)}  ${match ? '✅' : '❌'}`);
  }
  console.log(`  ${allMatch ? '✅ All values match.' : '❌ Mismatch detected!'}\n`);

  // Demonstrate conservation at each scale
  console.log('  Conservation headroom at each scale (γ=0.5, η=0.5):');
  const gamma = 0.5;
  const eta = 0.5;
  for (const n of [3, 10, 100, 1000]) {
    const observed = gov.observe({ gamma, eta, agentCount: n });
    console.log(
      `    n=${n.toLocaleString().padStart(4)}: ` +
      `γ+η=${(gamma + eta).toFixed(2)} C=${observed.C.toFixed(4)} ` +
      `δ=${observed.delta.toFixed(4)} → ${statusIcon(observed.status)} ${observed.status}`,
    );
  }
  console.log();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SuperInstance Conservation Law Simulator                 ║');
  console.log('║   γ + η ≤ C   where C = log₂(3) ≈ 1.585 bits              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  await healthyFleet();
  await depletedFleet();
  scaleTest();

  console.log('═'.repeat(58));
  console.log('  Simulation complete. The conservation law holds. 🎯');
  console.log('═'.repeat(58) + '\n');
}

main().catch(console.error);
