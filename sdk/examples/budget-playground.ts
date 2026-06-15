// ─── Budget Playground ───────────────────────────────────────────────────────
//
// Interactive tool for experimenting with conservation budget allocations.
// Shows how different γ budget distributions across agents affect the
// fleet's conservation state (γ, η, δ) and governor decisions.
//
// Run: npx tsx examples/budget-playground.ts
//

import { Fleet, Governor, C, type AgentConfig } from '../src/index.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BAR_WIDTH = 32;

function bar(value: number, max: number, fill = '█', empty = '░'): string {
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.round(ratio * BAR_WIDTH);
  return fill.repeat(filled) + empty.repeat(BAR_WIDTH - filled);
}

function pct(value: number, total: number): string {
  return `${((value / total) * 100).toFixed(1)}%`;
}

// ─── Budget Configurations ───────────────────────────────────────────────────

interface BudgetConfig {
  name: string;
  description: string;
  agents: AgentConfig[];
}

const configs: BudgetConfig[] = [
  {
    name: 'balanced',
    description: 'Two agents with equal moderate budgets',
    agents: [
      { name: 'Builder-A',   role: 'builder',    gammaBudget: 0.3 },
      { name: 'Researcher',  role: 'researcher', gammaBudget: 0.3 },
    ],
  },
  {
    name: 'top-heavy',
    description: 'One agent hogs most of the budget',
    agents: [
      { name: 'Mega-Builder', role: 'builder',    gammaBudget: 0.6 },
      { name: 'Tiny-Helper',  role: 'researcher', gammaBudget: 0.1 },
    ],
  },
  {
    name: 'many-small',
    description: '10 agents with tiny individual budgets',
    agents: Array.from({ length: 10 }, (_, i) => ({
      name: `micro-${i + 1}`,
      role: 'builder' as const,
      gammaBudget: 0.05,
    })),
  },
  {
    name: 'specialized',
    description: 'Mixed roles with proportional budgets',
    agents: [
      { name: 'arch',     role: 'orchestrator', gammaBudget: 0.15 },
      { name: 'build-1',  role: 'builder',      gammaBudget: 0.25 },
      { name: 'build-2',  role: 'builder',      gammaBudget: 0.25 },
      { name: 'test-1',   role: 'validator',    gammaBudget: 0.15 },
      { name: 'deploy',   role: 'deployer',     gammaBudget: 0.10 },
    ],
  },
  {
    name: 'over-committed',
    description: 'Budgets sum > C — will violate conservation',
    agents: [
      { name: 'greedy-1', role: 'builder',  gammaBudget: 0.4 },
      { name: 'greedy-2', role: 'builder',  gammaBudget: 0.4 },
      { name: 'greedy-3', role: 'builder',  gammaBudget: 0.4 },
    ],
  },
];

// ─── Simulation ──────────────────────────────────────────────────────────────

async function runConfig(config: BudgetConfig): Promise<void> {
  console.log('\n' + '─'.repeat(58));
  console.log(`  ▸ ${config.name.padEnd(16)} — ${config.description}`);
  console.log('─'.repeat(58));

  const fleet = new Fleet({ name: config.name });
  const gov = new Governor();

  // Spawn agents
  for (const agentConfig of config.agents) {
    fleet.spawn(agentConfig);
  }

  // Show initial allocation
  const agents = fleet.getAgents();
  const totalBudget = agents.reduce((sum, a) => sum + a.gammaBudget, 0);

  console.log(`\n  Agents: ${agents.length}   Total γ budget: ${totalBudget.toFixed(3)}   C = ${C.toFixed(4)}`);
  console.log(`  Budget vs capacity: ${pct(totalBudget, C)} of C ${totalBudget > C ? '⚠️  EXCEEDS C' : ''}\n`);

  // Per-agent budget bar chart
  for (const a of agents) {
    const ratio = a.gammaBudget / C;
    const tag = ratio > 0.3 ? '⚠️ ' : '   ';
    console.log(`  ${tag}${a.name.padEnd(16)} ${a.role.padEnd(12)} γ=${a.gammaBudget.toFixed(3)} ${bar(a.gammaBudget, C)}`);
  }

  // Simulate one round of work per agent
  for (const agent of agents) {
    if (agent.getBudget() > 0.01) {
      await agent.execute('Perform a standard unit of fleet work');
    }
  }

  // Fleet status after one work cycle
  const status = fleet.status();
  const cons = status.conservation;

  console.log('\n  After one work cycle:');
  console.log(`    γ (coupling cost)  ${bar(cons.gamma, C)} ${cons.gamma.toFixed(4)} / ${C.toFixed(4)}`);
  console.log(`    η (value produced) ${bar(cons.eta, C)} ${cons.eta.toFixed(4)} / ${C.toFixed(4)}`);
  console.log(`    δ (headroom)       ${bar(cons.delta, C, '▓')} ${cons.delta.toFixed(4)} / ${C.toFixed(4)}`);
  console.log(`    Status: ${cons.status.toUpperCase()}`);

  // Governor decision
  const decision = fleet.getDecision();
  const icon = decision.action === 'release' ? '🟢' :
               decision.action === 'throttle' ? '🔴' :
               decision.action === 'spawn' ? '✨' :
               decision.action === 'merge' ? '🔀' : '⏸️';
  console.log(`    Governor: ${icon} ${decision.action.toUpperCase()} — ${decision.reason.substring(0, 60)}`);

  // Conservation verdict
  const holds = cons.delta >= 0;
  const verdict = holds
    ? `✅ CONSERVED — ${(cons.delta / C * 100).toFixed(1)}% headroom remaining`
    : `❌ VIOLATED — overshot C by ${Math.abs(cons.delta).toFixed(4)}`;
  console.log(`    Verdict: ${verdict}`);
}

// ─── Comparison Table ────────────────────────────────────────────────────────

function printComparison(): void {
  console.log('\n' + '═'.repeat(58));
  console.log('  Comparison Summary');
  console.log('═'.repeat(58));

  console.log(`\n  ${'config'.padEnd(16)} ${'agents'.padStart(6)} ${'Σγ budget'.padStart(10)} ${'γ used'.padStart(8)} ${'η prod'.padStart(8)} ${'δ'.padStart(8)}  status`);
  console.log('  ' + '─'.repeat(58));

  const gov = new Governor();

  for (const config of configs) {
    const fleet = new Fleet({ name: config.name });

    for (const ac of config.agents) {
      fleet.spawn(ac);
    }

    // Simulate one cycle
    const agents = fleet.getAgents();
    const totalBudget = agents.reduce((s, a) => s + a.gammaBudget, 0);

    // Run work synchronously
    for (const agent of agents) {
      if (agent.getBudget() > 0.01) {
        agent.execute('Work').then(() => {}).catch(() => {});
      }
    }

    // Force record γ/η for display (the execute calls above are async)
    // Use observe directly for the comparison
    const cons = gov.observe({
      gamma: fleet.totalGammaUsed,
      eta: fleet.totalEtaProduced,
      agentCount: agents.length,
    });

    console.log(
      `  ${config.name.padEnd(16)} ${String(agents.length).padStart(6)} ${totalBudget.toFixed(3).padStart(10)}` +
      ` ${cons.gamma.toFixed(4).padStart(8)} ${cons.eta.toFixed(4).padStart(8)}` +
      ` ${cons.delta.toFixed(4).padStart(8)}  ${cons.status}`,
    );
  }
  console.log('  ' + '─'.repeat(58));
  console.log(`  C = ${C.toFixed(4)} bits   |   γ + η ≤ C\n`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SuperInstance Budget Playground                          ║');
  console.log('║   Experiment with γ allocations and see conservation       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  console.log(`\n  Conservation law: γ + η ≤ C   (C = ${C.toFixed(4)})`);
  console.log(`  C = log₂(3) — the capacity of a ternary substrate.\n`);

  for (const config of configs) {
    await runConfig(config);
  }

  printComparison();

  console.log('═'.repeat(58));
  console.log('  Key takeaway: distribute γ budgets so Σγ ≲ C/2 for healthy');
  console.log('  headroom. Over-committing guarantees conservation violation.');
  console.log('═'.repeat(58) + '\n');
}

main().catch(console.error);
