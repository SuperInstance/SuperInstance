/**
 * SuperInstance SDK — Full Fleet Demo
 *
 * A complete working example showing:
 * - 4 specialized agents (builder, researcher, validator, deployer)
 * - Budget allocation and conservation law enforcement
 * - Capability requests (search)
 * - Cross-agent delegation
 * - Validation workflows
 * - Deployment with governor gating
 * - Conservation trace and governor decisions
 * - Final fleet status report
 *
 * Run: npx tsx examples/full-fleet-demo.ts
 */

import { Fleet, FleetDashboard, C } from 'superinstance';

// ── Setup ──────────────────────────────────────────────────────────

const fleet = new Fleet({ name: 'demo-fleet' });

console.log('╔══════════════════════════════════════════╗');
console.log('║  SuperInstance Full Fleet Demo           ║');
console.log(`║  Conservation constant C = ${C.toFixed(6)}        ║`);
console.log('╚══════════════════════════════════════════╝\n');

// ── Spawn 4 specialized agents ─────────────────────────────────────

const builder = fleet.spawn({ role: 'builder', gammaBudget: 0.4 });
const researcher = fleet.spawn({ role: 'researcher', gammaBudget: 0.35 });
const validator = fleet.spawn({ role: 'validator', gammaBudget: 0.25 });
const deployer = fleet.spawn({ role: 'deployer', gammaBudget: 0.3 });

console.log('▸ Spawned 4 agents:');
for (const agent of [builder, researcher, validator, deployer]) {
  const s = agent.getState();
  console.log(`  ${s.role}: γ=${s.gammaBudget} budget=${s.remainingBudget}`);
}

// ── Register custom capabilities ───────────────────────────────────

fleet.registerCapability('search', async (params: any) => {
  const { query } = params;
  return {
    results: [`Result for "${query}" #1`, `Result for "${query}" #2`],
    totalFound: 2,
  };
});

fleet.registerCapability('validate', async (params: any) => {
  return { valid: true, score: 0.95, issues: [] };
});

fleet.registerCapability('deploy', async (params: any) => {
  const { target, artifact } = params;
  return {
    success: true,
    url: `https://${target}.example.com`,
    artifact,
    timestamp: Date.now(),
  };
});

// ── Phase 1: Research ──────────────────────────────────────────────

console.log('\n── Phase 1: Research ──');
const searchResults = await researcher.request('search', {
  query: 'best practices for API rate limiting',
  topK: 5,
});
console.log('  Search results:', searchResults.results);

const research = await researcher.execute({
  prompt: 'Analyze rate limiting strategies based on search results',
  context: { results: searchResults.results },
});
console.log(`  Research output: ${research.output}`);
console.log(`  Conservation: ${research.conservationCheck.passed ? '✅' : '❌'}`);

// ── Phase 2: Build ─────────────────────────────────────────────────

console.log('\n── Phase 2: Build ──');
const build = await builder.execute({
  prompt: 'Build rate limiter middleware',
  context: { research: research.output },
});
console.log(`  Build output: ${build.output}`);

// ── Phase 3: Validate via delegation ───────────────────────────────

console.log('\n── Phase 3: Validate ──');
const validation = await builder.delegate(
  'validator',
  { prompt: 'Validate the rate limiter implementation', context: { build: build.output } },
  0.08, // transfer budget
);
console.log(`  Validation passed: ${validation.result.conservationCheck.passed ? '✅' : '❌'}`);
console.log(`  Budget used: ${validation.budgetUsed}`);

// ── Phase 4: Governor gates deployment ─────────────────────────────

console.log('\n── Phase 4: Governor Decision ──');
const decision = fleet.getDecision();
console.log(`  Action: ${decision.action}`);
console.log(`  Reason: ${decision.reason}`);
console.log(`  γ=${decision.gamma.toFixed(3)} η=${decision.eta.toFixed(3)}`);

if (decision.action === 'throttle' || decision.action === 'hold') {
  console.log('  ⛔ Governor blocked deployment — conservation risk');
} else {
  // ── Phase 5: Deploy ──────────────────────────────────────────────
  console.log('\n── Phase 5: Deploy ──');
  const deployResult = await deployer.request('deploy', {
    target: 'production',
    artifact: 'rate-limiter-v1.0.0',
  });
  console.log(`  Deployed: ${deployResult.url}`);
  console.log(`  Artifact: ${deployResult.artifact}`);

  const finalDeploy = await deployer.execute({
    prompt: 'Confirm production deployment is healthy',
    context: { url: deployResult.url },
  });
  console.log(`  Health check: ${finalDeploy.output}`);
}

// ── Final Status ───────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════');
console.log('  FINAL FLEET STATUS');
console.log('═══════════════════════════════════════════');

const status = fleet.status();
console.log(`  Fleet: ${status.name}`);
console.log(`  Agents: ${status.agents}`);
console.log(`  Conservation: γ=${status.conservation.gamma.toFixed(3)} + η=${status.conservation.eta.toFixed(3)} = ${(status.conservation.gamma + status.conservation.eta).toFixed(3)} / C=${C.toFixed(3)}`);
console.log(`  Satisfied: ${status.conservation.satisfied ? '✅' : '❌'}`);
console.log(`  Convergence δ(n): ${status.convergenceDelta.toFixed(6)}`);

console.log('\n  Agent budgets:');
console.log(`    Builder:    ${builder.getBudget().toFixed(3)} (state: ${builder.getState().status})`);
console.log(`    Researcher: ${researcher.getBudget().toFixed(3)} (state: ${researcher.getState().status})`);
console.log(`    Validator:  ${validator.getBudget().toFixed(3)} (state: ${validator.getState().status})`);
console.log(`    Deployer:   ${deployer.getBudget().toFixed(3)} (state: ${deployer.getState().status})`);

console.log('\n  Governor decision:', fleet.getDecision());
console.log('\n✅ Demo complete.');
