// ─── PID Governor Tuning Visualizer ──────────────────────────────────────────
//
// Visualize how different PID tunings (Kp, Ki, Kd) affect the governor's
// behavior when driving γ → C/2 across a simulated workload. Shows the
// γ/C trajectory, governor decisions, settling time, and steady-state error.
//
// Run: npx tsx examples/pid-tuning.ts
//

import { Governor, C, type GovernorConfig, type GovernorDecision } from '../src/index.js';

// ─── Tuning Configurations ───────────────────────────────────────────────────

interface TuningDef {
  name: string;
  description: string;
  config: Partial<GovernorConfig>;
}

const tunings: TuningDef[] = [
  {
    name: 'aggressive',
    description: 'High Kp — fast response, possible overshoot',
    config: { Kp: 1.5, Ki: 0.3, Kd: 0.1, deadband: 0.02 },
  },
  {
    name: 'balanced',
    description: 'Default tuning — stable, moderate response',
    config: { Kp: 0.8, Ki: 0.15, Kd: 0.25, deadband: 0.03 },
  },
  {
    name: 'gentle',
    description: 'High Kd — slow, smooth, no overshoot',
    config: { Kp: 0.3, Ki: 0.05, Kd: 0.5, deadband: 0.05 },
  },
  {
    name: 'no-derivative',
    description: 'Kd=0 — pure PI, prone to oscillation',
    config: { Kp: 0.8, Ki: 0.2, Kd: 0.0, deadband: 0.03 },
  },
  {
    name: 'integral-heavy',
    description: 'High Ki — eliminates steady-state error slowly',
    config: { Kp: 0.4, Ki: 0.5, Kd: 0.1, deadband: 0.03 },
  },
];

// ─── Simulation ──────────────────────────────────────────────────────────────

const STEPS = 50;
const BAR_WIDTH = 36;

interface SimResult {
  name: string;
  description: string;
  gammaTrajectory: number[];
  decisions: GovernorDecision[];
  settlingStep: number | null;
  steadyStateError: number;
  overshoot: number;
  finalGamma: number;
}

function simulate(tuning: TuningDef): SimResult {
  const gov = new Governor(tuning.config);
  const setpoint = gov.config.setpoint;
  const targetGamma = setpoint * C;

  // Start with zero γ and inject workload gradually
  let currentGamma = 0;
  let currentEta = 0;
  const agentCount = 5;

  const gammaTrajectory: number[] = [];
  const decisions: GovernorDecision[] = [];
  let maxRatio = 0;

  for (let step = 0; step < STEPS; step++) {
    const decision = gov.decide({
      gamma: currentGamma,
      eta: currentEta,
      agentCount,
    });
    decisions.push(decision);

    // Simulate plant response:
    // - "release" adds γ (agents spend more)
    // - "throttle" reduces γ (agents curtailed)
    // - "hold" keeps γ steady (minor drift)
    // - "spawn" adds a small amount (new agent ramps up)
    // - "merge" reduces γ slightly
    const magnitude = decision.magnitude;

    switch (decision.action) {
      case 'release':
        currentGamma += magnitude * 0.15;
        break;
      case 'throttle':
        currentGamma -= magnitude * 0.2;
        break;
      case 'spawn':
        currentGamma += magnitude * 0.05;
        break;
      case 'merge':
        currentGamma -= magnitude * 0.1;
        break;
      case 'hold':
        // Tiny natural drift from coordination
        currentGamma += 0.002;
        break;
    }

    // η accumulates as a function of productive work
    currentEta += Math.max(0, 0.008 * (1 - currentGamma / C));

    // Clamp
    currentGamma = Math.max(0, currentGamma);
    currentEta = Math.max(0, currentEta);

    const ratio = currentGamma / C;
    if (ratio > maxRatio) maxRatio = ratio;

    gammaTrajectory.push(currentGamma);
  }

  // Settling time: first step where γ stays within ±5% of target for remainder
  const tolerance = 0.05 * C;
  let settlingStep: number | null = null;
  for (let i = 0; i < STEPS; i++) {
    let settled = true;
    for (let j = i; j < STEPS; j++) {
      if (Math.abs(gammaTrajectory[j]! - targetGamma) > tolerance) {
        settled = false;
        break;
      }
    }
    if (settled) {
      settlingStep = i;
      break;
    }
  }

  const finalRatio = currentGamma / C;
  const steadyStateError = Math.abs(finalRatio - setpoint);
  const overshoot = Math.max(0, maxRatio - setpoint);

  return {
    name: tuning.name,
    description: tuning.description,
    gammaTrajectory,
    decisions,
    settlingStep,
    steadyStateError,
    overshoot,
    finalGamma: currentGamma,
  };
}

// ─── Display ─────────────────────────────────────────────────────────────────

function bar(value: number, max: number, fill = '█', empty = '░'): string {
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(ratio * BAR_WIDTH);
  return fill.repeat(filled) + empty.repeat(BAR_WIDTH - filled);
}

function actionIcon(action: GovernorDecision['action']): string {
  switch (action) {
    case 'release': return '🟢';
    case 'throttle': return '🔴';
    case 'spawn':   return '✨';
    case 'merge':   return '🔀';
    case 'hold':    return '⏸️';
  }
}

function printTrajectory(result: SimResult): void {
  const targetGamma = 0.5 * C;
  const targetPct = 50; // 50% of C

  console.log('\n' + '─'.repeat(58));
  console.log(`  ▸ ${result.name.padEnd(16)} — ${result.description}`);
  console.log('─'.repeat(58));

  // Plot γ/C as a mini-chart
  console.log(`\n  γ/C trajectory (target = ${targetPct}%):\n`);

  // Y-axis labels at 100%, 75%, 50%, 25%, 0%
  const plotWidth = STEPS;
  const plotHeight = 10;
  const grid: string[][] = Array.from({ length: plotHeight }, () =>
    Array<string>(plotWidth).fill(' '),
  );

  // Draw target line
  for (let x = 0; x < plotWidth; x++) {
    const targetY = Math.round((1 - targetPct / 100) * (plotHeight - 1));
    grid[targetY]![x] = '·';
  }

  // Draw trajectory
  for (let x = 0; x < result.gammaTrajectory.length; x++) {
    const ratio = result.gammaTrajectory[x]! / C;
    const y = Math.round((1 - Math.min(1, ratio)) * (plotHeight - 1));
    if (y >= 0 && y < plotHeight) {
      grid[y]![x] = '█';
    }
  }

  // Print the chart
  for (let row = 0; row < plotHeight; row++) {
    const label = `${(100 - row * 10)}%`.padStart(4);
    const isTarget = (plotHeight - 1 - row) === Math.round((1 - targetPct / 100) * (plotHeight - 1));
    console.log(`  ${label} │${grid[row]!.join('')}${isTarget ? ' ← target' : ''}`);
  }
  console.log(`       └${'─'.repeat(plotWidth)} step`);

  // Decision timeline (compressed — show first 5 and last 5)
  const decs = result.decisions;
  const showCount = Math.min(5, decs.length);
  console.log(`\n  Decisions (first ${showCount} / last ${showCount}):`);
  for (let i = 0; i < showCount; i++) {
    const d = decs[i]!;
    console.log(`    step ${String(i).padStart(2)}: ${actionIcon(d.action)} ${d.action.padEnd(8)} mag=${d.magnitude.toFixed(3)}`);
  }
  if (decs.length > showCount * 2) {
    console.log(`    ... ${decs.length - showCount * 2} more steps ...`);
  }
  for (let i = Math.max(showCount, decs.length - showCount); i < decs.length; i++) {
    const d = decs[i]!;
    console.log(`    step ${String(i).padStart(2)}: ${actionIcon(d.action)} ${d.action.padEnd(8)} mag=${d.magnitude.toFixed(3)}`);
  }

  // Metrics
  const settled = result.settlingStep !== null;
  console.log('\n  Metrics:');
  console.log(`    Final γ/C:       ${(result.finalGamma / C).toFixed(4)} (${((result.finalGamma / C) * 100).toFixed(1)}%)`);
  console.log(`    γ bar:           ${bar(result.finalGamma, C)} ${result.finalGamma.toFixed(4)} / ${C.toFixed(4)}`);
  console.log(`    Steady-state err: ${result.steadyStateError.toFixed(4)} (${(result.steadyStateError * 100).toFixed(2)}%)`);
  console.log(`    Overshoot:        ${result.overshoot.toFixed(4)} (${(result.overshoot * 100).toFixed(2)}%)`);
  console.log(`    Settling time:    ${settled ? `step ${result.settlingStep}` : '❌ never settled'}`);
}

function printComparisonTable(results: SimResult[]): void {
  console.log('\n' + '═'.repeat(58));
  console.log('  PID Tuning Comparison');
  console.log('═'.repeat(58));

  console.log(`\n  ${'tuning'.padEnd(16)} ${'final γ/C'.padStart(10)} ${'ss error'.padStart(9)} ${'overshoot'.padStart(10)} ${'settled'.padStart(9)}`);
  console.log('  ' + '─'.repeat(58));

  for (const r of results) {
    console.log(
      `  ${r.name.padEnd(16)}` +
      ` ${(r.finalGamma / C).toFixed(4).padStart(10)}` +
      ` ${r.steadyStateError.toFixed(4).padStart(9)}` +
      ` ${r.overshoot.toFixed(4).padStart(10)}` +
      ` ${(r.settlingStep !== null ? `step ${r.settlingStep}` : 'never').padStart(9)}`,
    );
  }

  console.log('  ' + '─'.repeat(58));

  // Rank by settling time
  const ranked = [...results].sort((a, b) => {
    if (a.settlingStep === null && b.settlingStep === null) return 0;
    if (a.settlingStep === null) return 1;
    if (b.settlingStep === null) return -1;
    return a.settlingStep - b.settlingStep;
  });

  const best = ranked[0]!;
  console.log(`\n  🏆 Fastest settling: ${best.name}` +
    `${best.settlingStep !== null ? ` (step ${best.settlingStep})` : ' (did not settle)'}`);

  // Lowest error
  const byError = [...results].sort((a, b) => a.steadyStateError - b.steadyStateError);
  const mostAccurate = byError[0]!;
  console.log(`  🎯 Lowest error:    ${mostAccurate.name} (err=${mostAccurate.steadyStateError.toFixed(4)})`);

  // Lowest overshoot
  const byOvershoot = [...results].sort((a, b) => a.overshoot - b.overshoot);
  const smoothest = byOvershoot[0]!;
  console.log(`  🪶 Lowest overshoot: ${smoothest.name} (overshoot=${smoothest.overshoot.toFixed(4)})`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main(): void {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SuperInstance PID Governor Tuning Visualizer             ║');
  console.log('║   See how Kp/Ki/Kd shape the γ → C/2 trajectory             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  console.log(`\n  Conservation law: γ + η ≤ C   (C = ${C.toFixed(4)})`);
  console.log(`  PID setpoint: γ/C = 0.5 (balanced equilibrium)`);
  console.log(`  Simulation: ${STEPS} steps, 5 agents\n`);

  const results: SimResult[] = [];

  for (const tuning of tunings) {
    const result = simulate(tuning);
    printTrajectory(result);
    results.push(result);
  }

  printComparisonTable(results);

  console.log('\n' + '═'.repeat(58));
  console.log('  The balanced tuning (Kp=0.8, Ki=0.15, Kd=0.25) is the');
  console.log('  SDK default — a good starting point for most fleets.');
  console.log('  Increase Kp for snappier response, Kd for smoothness.');
  console.log('═'.repeat(58) + '\n');
}

main();
