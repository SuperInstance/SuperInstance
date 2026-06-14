# SuperInstance Demo & Onboarding

## Quick Start (5 minutes)

```bash
# Install
npm install @superinstance/sdk

# Onboard (auto-detects framework, creates config)
npx @superinstance/sdk init

# Or run the quickstart script
bash demo/quickstart.sh
```

## Killer Demo — Governed vs Ungoverned

Shows the conservation law preventing waste:

```bash
npx tsx demo/demo.ts
```

Expected output:
- Ungoverned fleet: ~47K tokens, ~3hr, multiple conflicts
- Governed fleet: ~18K tokens, ~45min, zero conflicts
- **~60% fewer tokens, ~4x faster**

## Harbor Bridge — Connect to Oracle2's Fleet

Loom's harbor-daemon (port 8796) bridges our SDK to Oracle2's agents:

```typescript
import { Fleet } from '@superinstance/sdk';
import { createHarborFleet } from './harbor-bridge';

// One line to connect both fleets
const { fleet, harbor } = await createHarborFleet('localhost:8796');

// SDK agents can now delegate through the harbor
const agent = fleet.spawn({ role: 'builder', gammaBudget: 0.3 });
const result = await agent.delegate('researcher', 'find patterns');
// → routes through harbor → reaches Oracle2's agents
```

### Harbor Health Check

```bash
curl http://localhost:8797/health
# → {"status":"ok","bottles":N}
```

## What Gets Created

```
.superinstance/
  config.json      # Fleet + governor + integration config

fleet.ts            # Your starter fleet file
```

## Framework Integration

The quickstart auto-detects:
- **OpenAI SDK** → `wrapOpenAI(agent, fleet, role)`
- **LangGraph** → `wrapLangGraph(graph, fleet, role)`
- **CrewAI** → `wrapCrewAI(crew, fleet, role)`
- **Any agent** → `wrapGeneric(agent, fleet, role)`

## MCP Server

For Claude Code, Cursor, Cline, etc:

```bash
npx superinstance-mcp
```

8 tools available: fleet_status, fleet_search, fleet_budget, conservation_check, ternary_validate, crate_info, fleet_agents, ecosystem_stats.
