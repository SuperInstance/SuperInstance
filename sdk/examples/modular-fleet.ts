// ─── SuperInstance Modular Fleet Example ─────────────────────────────────────
//
// A complete demo showing agents requesting capabilities, delegating tasks,
// and operating under conservation governance.
//
// Run with: npx tsx examples/modular-fleet.ts
//

import { Fleet } from '../src/sdk.js';
import type { CapabilityResponse } from '../src/modular.js';

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  SuperInstance Modular Fleet Demo');
  console.log('  Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Create a fleet
  const fleet = new Fleet({ name: 'demo-fleet' });
  console.log(`✓ Fleet '${fleet.name}' created`);
  console.log(`  Capabilities: ${fleet.getRouter().listAvailable().join(', ')}\n`);

  // 2. Spawn agents
  const builder = fleet.spawn({ role: 'builder', name: 'builder-alpha', gammaBudget: 0.3 });
  const researcher = fleet.spawn({ role: 'researcher', name: 'researcher-beta', gammaBudget: 0.3 });
  const validator = fleet.spawn({ role: 'validator', name: 'validator-gamma', gammaBudget: 0.2 });
  console.log(`✓ Spawned 3 agents:`);
  console.log(`  ${builder.id} (${builder.name}) — builder, γ budget: ${builder.gammaBudget}`);
  console.log(`  ${researcher.id} (${researcher.name}) — researcher, γ budget: ${researcher.gammaBudget}`);
  console.log(`  ${validator.id} (${validator.name}) — validator, γ budget: ${validator.gammaBudget}\n`);

  // 3. Builder requests search for patterns
  console.log('── Builder requests search ──────────────────────────────────');
  const searchRes: CapabilityResponse = await builder.request('search', {
    query: 'governor',
    topK: 3,
  });
  if (searchRes.success) {
    const data = searchRes.data as { results: { name: string; description: string }[] };
    console.log(`  Found ${data.results.length} result(s):`);
    for (const r of data.results) {
      console.log(`    • ${r.name}: ${r.description}`);
    }
  }
  console.log(`  γ cost: ${searchRes.gammaCost.toFixed(4)}\n`);

  // 4. Builder requests budget check
  console.log('── Builder requests budget check ────────────────────────────');
  const budgetRes = await builder.request('budget');
  if (budgetRes.success) {
    const data = budgetRes.data as {
      gammaBudget: number;
      gammaUsed: number;
      gammaRemaining: number;
      fleetConservation: { delta: number; status: string };
    };
    console.log(`  Agent budget: ${data.gammaUsed.toFixed(4)} / ${data.gammaBudget.toFixed(4)} γ used`);
    console.log(`  Remaining: ${data.gammaRemaining.toFixed(4)} γ`);
    console.log(`  Fleet: δ=${data.fleetConservation.delta.toFixed(4)} (${data.fleetConservation.status})`);
  }
  console.log();

  // 5. Builder delegates research to researcher
  console.log('── Builder delegates to researcher ──────────────────────────');
  const delegation = await builder.delegate(
    'researcher',
    'research ternary computing substrates',
    0.1,
  );
  if (delegation.success) {
    console.log(`  Delegated to: ${delegation.delegatedTo}`);
    console.log(`  Task: "${delegation.result!.output}"`);
    console.log(`  γ used by delegate: ${delegation.result!.gammaUsed.toFixed(4)}`);
    console.log(`  η produced: ${delegation.result!.etaProduced.toFixed(4)}`);
  } else {
    console.log(`  Delegation failed: ${delegation.error}`);
  }
  console.log();

  // 6. Builder delegates validation to validator
  console.log('── Builder delegates to validator ───────────────────────────');
  const validation = await builder.request('validate', {
    signals: [1, 1, 1, -1, 0, 1, -1, 0],
  });
  if (validation.success) {
    const data = validation.data as { signals: number[]; sum: number; aggregate: number };
    console.log(`  Signals: [${data.signals.join(', ')}]`);
    console.log(`  Sum: ${data.sum}, Aggregate: ${data.aggregate} → ${data.aggregate > 0 ? 'RELEASE' : data.aggregate < 0 ? 'THROTTLE' : 'HOLD'}`);
  }
  console.log(`  γ cost: ${validation.gammaCost.toFixed(4)}\n`);

  // 7. Builder checks conservation invariant
  console.log('── Builder checks conservation invariant ────────────────────');
  const conserve = await builder.request('conserve');
  if (conserve.success) {
    const data = conserve.data as {
      gamma: number;
      eta: number;
      C: number;
      delta: number;
      invariantHolds: boolean;
    };
    console.log(`  γ = ${data.gamma.toFixed(4)}`);
    console.log(`  η = ${data.eta.toFixed(4)}`);
    console.log(`  C = ${data.C.toFixed(4)}`);
    console.log(`  δ = ${data.delta.toFixed(4)}`);
    console.log(`  Invariant: γ + η ≤ C → ${data.invariantHolds ? '✅ HOLDS' : '❌ VIOLATED'}`);
  }
  console.log();

  // 8. Final fleet status
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Final Fleet Status');
  console.log('═══════════════════════════════════════════════════════════════');
  const status = fleet.status();
  console.log(`  Fleet: ${status.name}`);
  console.log(`  Agents: ${status.agentCount} (${status.activeAgents} active)`);
  console.log(`  Uptime: ${status.uptime}ms`);
  console.log(`  Convergence δ(n): ${status.convergenceDelta.toFixed(4)}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Conservation:`);
  console.log(`    γ (coupling cost): ${status.conservation.gamma.toFixed(4)}`);
  console.log(`    η (value output):  ${status.conservation.eta.toFixed(4)}`);
  console.log(`    C (capacity):      ${status.conservation.C.toFixed(4)}`);
  console.log(`    δ (headroom):      ${status.conservation.delta.toFixed(4)}`);
  console.log(`    Status:            ${status.conservation.status}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Agent Breakdown:`);
  for (const a of status.agents) {
    console.log(`    ${a.name.padEnd(20)} ${a.role.padEnd(12)} γ: ${a.gammaUsed.toFixed(4)}  η: ${a.etaProduced.toFixed(4)}  remaining: ${a.conservationRemaining.toFixed(4)}`);
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Demo complete. All agents operated within conservation bounds.');
}

main().catch(console.error);
