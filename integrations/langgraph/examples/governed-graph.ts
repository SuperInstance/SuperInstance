// ─── Governed LangGraph Multi-Agent Example ──────────────────────────────────
//
// Demonstrates conservation-law governance applied to a LangGraph-style
// multi-agent pipeline. Each node gets its own γ budget.
//
// Run: npm run demo  (or: tsx examples/governed-graph.ts)
//

import { createGovernedMultiAgent } from '../src/index.js';

// ─── Simulated Graph Nodes ───────────────────────────────────────────────────
// In production, these would be LangGraph StateGraph nodes that call
// LLMs, databases, APIs, etc. Here we simulate the computation.

async function researchNode(state: any): Promise<any> {
  console.log(`  🔍 Researcher: investigating "${state.task}"...`);
  // Simulate research: discover patterns relevant to the task
  const patterns = ['singleton', 'factory', 'observer'];
  const findings = `Found ${patterns.length} relevant patterns: ${patterns.join(', ')}`;
  console.log(`     → ${findings}`);
  return { ...state, research: findings };
}

async function buildNode(state: any): Promise<any> {
  console.log(`  🔨 Builder: constructing from research...`);
  // Simulate building using research output
  const artifact = `Module based on: ${state.research ?? 'no research'}`;
  console.log(`     → Built artifact (${artifact.length} chars)`);
  return { ...state, built: true, artifact };
}

async function validateNode(state: any): Promise<any> {
  console.log(`  ✅ Validator: checking artifact...`);
  // Simulate validation
  const valid = state.built === true;
  const report = `Validation ${valid ? 'PASSED' : 'FAILED'}`;
  console.log(`     → ${report}`);
  return { ...state, validated: true, validationReport: report };
}

// ─── Run the Governed Pipeline ───────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SuperInstance × LangGraph — Governed Multi-Agent Demo');
  console.log('  Conservation Law: γ + η ≤ C where C = log₂(3) ≈ 1.585');
  console.log('═══════════════════════════════════════════════════════════\n');

  const { fleet, invoke } = createGovernedMultiAgent({
    fleetName: 'langgraph-governed',
    agents: [
      { name: 'Researcher', role: 'researcher', gammaBudget: 0.2, invoke: researchNode },
      { name: 'Builder', role: 'builder', gammaBudget: 0.3, invoke: buildNode },
      { name: 'Validator', role: 'validator', gammaBudget: 0.15, invoke: validateNode },
    ],
  });

  console.log('🚀 Invoking governed pipeline: "build rate limiter"\n');

  const result = await invoke({ task: 'build rate limiter' });

  console.log('\n─── Result ────────────────────────────────────────────────');
  console.log(`  task:         ${result.task}`);
  console.log(`  research:     ${result.research}`);
  console.log(`  built:        ${result.built}`);
  console.log(`  artifact:     ${result.artifact}`);
  console.log(`  validated:    ${result.validated}`);
  console.log(`  report:       ${result.validationReport}`);

  console.log('\n─── Conservation State ─────────────────────────────────────');
  const status = fleet.status();
  const cons = status.conservation;
  console.log(`  γ (gamma):     ${cons.gamma.toFixed(6)} bits`);
  console.log(`  η (eta):       ${cons.eta.toFixed(6)} bits`);
  console.log(`  C (capacity):  ${cons.C.toFixed(6)} bits`);
  console.log(`  δ (delta):     ${cons.delta.toFixed(6)} bits remaining`);
  console.log(`  status:        ${cons.status}`);
  console.log(`  agents:        ${status.agentCount}`);
  console.log(`  convergence:   ${status.convergenceDelta.toFixed(6)}`);

  console.log('\n─── Fleet Agents ──────────────────────────────────────────');
  for (const agent of status.agents) {
    console.log(
      `  ${agent.name.padEnd(14)} role=${agent.role.padEnd(12)} ` +
      `γ=${agent.gammaUsed.toFixed(4)}/${agent.conservationRemaining.toFixed(4)} ` +
      `phase=${agent.phase}`,
    );
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ Pipeline completed within conservation budget');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Demo failed:', err);
  process.exit(1);
});
