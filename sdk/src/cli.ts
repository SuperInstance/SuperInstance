#!/usr/bin/env node
// ─── SuperInstance CLI ───────────────────────────────────────────────────────
//
// Usage:
//   npx superinstance init              — Create .superinstance/ config
//   npx superinstance status            — Show fleet status
//   npx superinstance check <γ> <η>     — Conservation check
//   npx superinstance converge <n>      — Convergence rate for fleet size n
//

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { C, CONSERVATION_LAW, convergenceDelta, Fleet, Governor, FleetDashboard } from './index.js';

const args = process.argv.slice(2);
const command = args[0];

function showHelp(): void {
  console.log(`
  SuperInstance — Conservation-law governance for AI agent fleets

  ${CONSERVATION_LAW}

  Usage:
    npx superinstance init              Create .superinstance/ config in current project
    npx superinstance status            Show fleet status (requires .superinstance/config.json)
    npx superinstance check <γ> <η>     Check if γ + η ≤ C holds
    npx superinstance converge <n>      Show convergence rate δ(n) for fleet size n
    npx superinstance dashboard          Live fleet dashboard (press q to quit)
    npx superinstance help              Show this help message

  Examples:
    npx superinstance check 0.8 0.5     Check if γ=0.8, η=0.5 conserves
    npx superinstance converge 100      Show δ(100) — convergence at 100 agents
    npx superinstance dashboard         Launch the live fleet dashboard
  `);
}

function cmdInit(): void {
  const configDir = join(process.cwd(), '.superinstance');

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  const configPath = join(configDir, 'config.json');

  if (existsSync(configPath)) {
    console.log('⚠️  .superinstance/config.json already exists — skipping.');
    return;
  }

  const config = {
    name: process.cwd().split('/').pop() ?? 'my-fleet',
    governor: {
      setpoint: 0.5,
      Kp: 0.8,
      Ki: 0.15,
      Kd: 0.25,
      deadband: 0.03,
    },
    conservationLaw: CONSERVATION_LAW,
    C: C,
    createdAt: new Date().toISOString(),
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`✅ Created .superinstance/config.json`);
  console.log(`   Fleet name: ${config.name}`);
  console.log(`   Conservation: ${CONSERVATION_LAW}`);
  console.log(`   C = ${C.toFixed(6)}`);
  console.log(`\n   Next steps:`);
  console.log(`   import { Fleet } from 'superinstance';`);
  console.log(`   const fleet = new Fleet({ name: '${config.name}' });`);
}

function cmdStatus(): void {
  const configPath = join(process.cwd(), '.superinstance', 'config.json');

  if (!existsSync(configPath)) {
    console.log('❌ No .superinstance/config.json found. Run `npx superinstance init` first.');
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const fleet = new Fleet({ name: config.name, governor: config.governor });

  // Add a sample agent to show status
  fleet.spawn({ role: 'orchestrator', gammaBudget: 0.3 });

  const status = fleet.status();
  console.log(`\n  Fleet: ${status.name}`);
  console.log(`  Agents: ${status.agentCount} (${status.activeAgents} active)`);
  console.log(`  Uptime: ${(status.uptime / 1000).toFixed(1)}s`);
  console.log(`\n  Conservation:`);
  console.log(`    γ (gamma):    ${status.conservation.gamma.toFixed(4)}`);
  console.log(`    η (eta):      ${status.conservation.eta.toFixed(4)}`);
  console.log(`    C (capacity): ${status.conservation.C.toFixed(4)}`);
  console.log(`    δ (delta):    ${status.conservation.delta.toFixed(4)}`);
  console.log(`    Status:       ${status.conservation.status.toUpperCase()}`);
  console.log(`\n  Convergence: δ(${status.agentCount}) = ${status.convergenceDelta.toFixed(4)}`);
  console.log(`  ${CONSERVATION_LAW}\n`);
}

function cmdCheck(gammaStr: string, etaStr: string): void {
  const gamma = parseFloat(gammaStr);
  const eta = parseFloat(etaStr);

  if (isNaN(gamma) || isNaN(eta)) {
    console.log('❌ Invalid arguments. Usage: npx superinstance check <γ> <η>');
    console.log('   Example: npx superinstance check 0.8 0.5');
    process.exit(1);
  }

  const governor = new Governor();
  const state = governor.observe({ gamma, eta, agentCount: 1 });
  const total = gamma + eta;
  const valid = state.delta >= 0;

  console.log(`\n  Conservation Check`);
  console.log(`  ────────────────────`);
  console.log(`  γ (gamma):     ${gamma.toFixed(4)}`);
  console.log(`  η (eta):       ${eta.toFixed(4)}`);
  console.log(`  γ + η:         ${total.toFixed(4)}`);
  console.log(`  C (limit):     ${C.toFixed(4)}`);
  console.log(`  δ (delta):     ${state.delta.toFixed(4)}`);
  console.log(`  Status:        ${state.status.toUpperCase()}`);
  console.log(`  ${valid ? '✅' : '❌'} ${valid ? 'CONSERVED' : 'VIOLATED'} — ${CONSERVATION_LAW}\n`);
}

function cmdConverge(nStr: string): void {
  const n = parseInt(nStr, 10);

  if (isNaN(n) || n <= 0) {
    console.log('❌ Invalid argument. Usage: npx superinstance converge <n>');
    console.log('   Example: npx superinstance converge 100');
    process.exit(1);
  }

  const delta = convergenceDelta(n);
  const pct = ((1 - delta) * 100).toFixed(1);

  console.log(`\n  Convergence Rate`);
  console.log(`  ──────────────────`);
  console.log(`  Fleet size (n): ${n}`);
  console.log(`  δ(n):           ${delta.toFixed(6)}`);
  console.log(`  Cancellation:   ${pct}%`);
  console.log(`  Formula:        δ(n) = (1/√n)(1 − 3/(2n))\n`);
}

function cmdDashboard(): void {
  const configPath = join(process.cwd(), '.superinstance', 'config.json');

  let fleet: Fleet;
  if (existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    fleet = new Fleet({ name: config.name, governor: config.governor });
  } else {
    fleet = new Fleet({ name: process.cwd().split('/').pop() ?? 'my-fleet' });
  }

  // Spawn demo agents if fleet is empty
  fleet.spawn({ role: 'builder', name: 'Builder-1', gammaBudget: 0.35 });
  fleet.spawn({ role: 'builder', name: 'Builder-2', gammaBudget: 0.35 });
  fleet.spawn({ role: 'builder', name: 'Builder-3', gammaBudget: 0.3 });
  fleet.spawn({ role: 'validator', name: 'Tester', gammaBudget: 0.25 });
  fleet.spawn({ role: 'orchestrator', name: 'Docs', gammaBudget: 0.2 });

  const dash = new FleetDashboard(fleet, { refreshMs: 1000 });

  // Graceful exit
  const cleanup = (): void => {
    dash.stop();
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  dash.start();
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

switch (command) {
  case 'init':
    cmdInit();
    break;
  case 'status':
    cmdStatus();
    break;
  case 'check':
    if (args.length < 3) {
      console.log('❌ Usage: npx superinstance check <γ> <η>');
      console.log('   Example: npx superinstance check 0.8 0.5');
      process.exit(1);
    }
    cmdCheck(args[1], args[2]);
    break;
  case 'converge':
    if (args.length < 2) {
      console.log('❌ Usage: npx superinstance converge <n>');
      process.exit(1);
    }
    cmdConverge(args[1]);
    break;
  case 'dashboard':
    cmdDashboard();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.log(`Unknown command: ${command}\n`);
    }
    showHelp();
    break;
}
