#!/usr/bin/env bash
# SuperInstance Quick Start — Onboarding Script
#
# Gets a new project from zero to governed fleet in under 5 minutes.
# Works with any Node.js project (TypeScript or JavaScript).
#
# Usage:
#   curl -fsSL https://superinstance.ai/quickstart.sh | bash
#   # or
#   npx @superinstance/sdk init

set -euo pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   SuperInstance Quick Start                          ║${NC}"
echo -e "${BOLD}║   Conservation-law governance for AI agent fleets    ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Install
echo -e "${YELLOW}Step 1: Installing @superinstance/sdk...${NC}"
npm install @superinstance/sdk
echo -e "${GREEN}✓ SDK installed${NC}"
echo ""

# Step 2: Create config
echo -e "${YELLOW}Step 2: Creating .superinstance/ config...${NC}"
mkdir -p .superinstance

cat > .superinstance/config.json << 'CONFIG'
{
  "fleet": {
    "name": "my-fleet",
    "governor": {
      "setpoint": 0.5,
      "Kp": 0.8,
      "Ki": 0.15,
      "Kd": 0.25,
      "deadband": 0.03
    }
  },
  "conservation": {
    "C": 1.5849625007211562,
    "law": "γ + η ≤ C where C = log₂(3)"
  },
  "integrations": {
    "harbor": {
      "enabled": false,
      "host": "localhost",
      "port": 8796
    },
    "mcp": {
      "enabled": false,
      "command": "npx superinstance-mcp"
    }
  }
}
CONFIG

echo -e "${GREEN}✓ Config created at .superinstance/config.json${NC}"
echo ""

# Step 3: Create starter fleet file
echo -e "${YELLOW}Step 3: Creating starter fleet...${NC}"

cat > fleet.ts << 'FLEET'
import { Fleet } from '@superinstance/sdk';

// Create a governed fleet
const fleet = new Fleet({
  name: 'my-fleet',
  governor: { setpoint: 0.5, Kp: 0.8, Ki: 0.15, Kd: 0.25 },
});

// Spawn agents with conservation budgets
const builder = fleet.spawn({ name: 'builder', role: 'builder', gammaBudget: 0.3 });
const researcher = fleet.spawn({ name: 'researcher', role: 'researcher', gammaBudget: 0.2 });

// Execute a task — conservation is automatically enforced
const result = await builder.execute('build a REST API endpoint');
console.log('Result:', result.conservationCheck);

// Check fleet health
const status = fleet.status();
console.log('Fleet status:', {
  agents: status.agentCount,
  active: status.activeAgents,
  conservation: status.conservation.status,
  gamma: status.conservation.gamma.toFixed(3),
  eta: status.conservation.eta.toFixed(3),
  delta: status.conservation.delta.toFixed(3),
  C: status.conservation.C.toFixed(3),
});

// Modular agent requests
const patterns = await builder.request('search', { query: 'rate limiter', topK: 3 });
const budget = await builder.request('budget');
const valid = await builder.request('validate', { signals: [1, -1, 0, 1] });

// Delegate to another agent
const research = await builder.delegate('researcher', 'find circuit breaker patterns');

console.log('\nγ + η ≤ C — build within the law.');
FLEET

echo -e "${GREEN}✓ Starter fleet created at fleet.ts${NC}"
echo ""

# Step 4: Create .gitignore entries
echo -e "${YELLOW}Step 4: Updating .gitignore...${NC}"
if ! grep -q '.superinstance/' .gitignore 2>/dev/null; then
  echo '.superinstance/' >> .gitignore
  echo -e "${GREEN}✓ Added .superinstance/ to .gitignore${NC}"
else
  echo -e "${GREEN}✓ .gitignore already has .superinstance/${NC}"
fi
echo ""

# Step 5: Detect framework and suggest integration
echo -e "${YELLOW}Step 5: Detecting framework...${NC}"
if [ -f "package.json" ]; then
  PKG=$(cat package.json)
  if echo "$PKG" | grep -q '"openai"'; then
    echo -e "${GREEN}Detected: OpenAI SDK${NC}"
    echo "  Add this to wrap your agents:"
    echo ""
    echo "  import { wrapOpenAI } from '@superinstance/sdk';"
    echo "  const governed = wrapOpenAI(yourAgent, fleet, 'builder');"
    echo ""
  elif echo "$PKG" | grep -q '"@langchain"'; then
    echo -e "${GREEN}Detected: LangChain/LangGraph${NC}"
    echo "  Add this to wrap your graph:"
    echo ""
    echo "  import { wrapLangGraph } from '@superinstance/sdk';"
    echo "  const governed = wrapLangGraph(yourGraph, fleet, 'builder');"
    echo ""
  elif echo "$PKG" | grep -q '"crewai"'; then
    echo -e "${GREEN}Detected: CrewAI${NC}"
    echo "  Add this to wrap your crew:"
    echo ""
    echo "  import { wrapCrewAI } from '@superinstance/sdk';"
    echo "  const governed = wrapCrewAI(yourCrew, fleet, 'builder');"
    echo ""
  else
    echo -e "${GREEN}No specific framework detected — using generic wrapper${NC}"
    echo "  Wrap any agent with { name, execute(task) → string }:"
    echo ""
    echo "  import { wrapGeneric } from '@superinstance/sdk';"
    echo "  const governed = wrapGeneric(yourAgent, fleet, 'builder');"
    echo ""
  fi
fi

# Step 6: Check for harbor-daemon (Loom integration)
echo -e "${YELLOW}Step 6: Checking for harbor-daemon...${NC}"
if command -v nc &>/dev/null && nc -z localhost 8796 2>/dev/null; then
  echo -e "${GREEN}✓ Harbor daemon detected on port 8796!${NC}"
  echo "  Enable harbor bridge in .superinstance/config.json:"
  echo '    "harbor": { "enabled": true, "host": "localhost", "port": 8796 }'
  echo ""
else
  echo -e "${YELLOW}  Harbor daemon not found (optional — for Oracle2 fleet bridge)${NC}"
  echo ""
fi

# Step 7: Verify installation
echo -e "${YELLOW}Step 7: Verifying...${NC}"
node -e "
const { Fleet, C } = require('@superinstance/sdk');
const f = new Fleet({ name: 'verify' });
console.log('✓ SDK imported successfully');
console.log('✓ C = log₂(3) =', C.toFixed(6));
console.log('✓ Fleet created:', f.name);
console.log('✓ Governor:', f.governor.constructor.name);
console.log('');
console.log('Ready to govern. γ + η ≤ C.');
" 2>/dev/null || node -e "
import('@superinstance/sdk').then(({ Fleet, C }) => {
  const f = new Fleet({ name: 'verify' });
  console.log('✓ SDK imported successfully');
  console.log('✓ C = log₂(3) =', C.toFixed(6));
  console.log('✓ Fleet created:', f.name);
  console.log('');
  console.log('Ready to govern. γ + η ≤ C.');
}).catch(e => console.error('Import failed:', e.message));
"

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   ✅ You're ready to govern your fleet!               ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${BOLD}║                                                       ║${NC}"
echo -e "${BOLD}║   Next steps:                                         ║${NC}"
echo -e "${BOLD}║   • Edit fleet.ts with your agents                    ║${NC}"
echo -e "${BOLD}║   • npx tsx fleet.ts to run                            ║${NC}"
echo -e "${BOLD}║   • npx @superinstance/sdk status for fleet health    ║${NC}"
echo -e "${BOLD}║   • npx @superinstance/sdk check 0.3 0.5 for γ+η≤C    ║${NC}"
echo -e "${BOLD}║                                                       ║${NC}"
echo -e "${BOLD}║   Docs: https://superinstance.ai                      ║${NC}"
echo -e "${BOLD}║   MCP:  npx superinstance-mcp                         ║${NC}"
echo -e "${BOLD}║   npm:  @superinstance/sdk                            ║${NC}"
echo -e "${BOLD}║                                                       ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
