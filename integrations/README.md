# SuperInstance Integrations

Framework-specific integrations for @superinstance/sdk.

## Available

| Package | Framework | Install |
|---------|-----------|---------|
| `@superinstance/openai-integration` | OpenAI Agents SDK | `npm i @superinstance/openai-integration` |
| `@superinstance/langgraph-integration` | LangGraph | `npm i @superinstance/langgraph-integration` |

## Architecture

Each integration:
1. Wraps framework-native agents/graphs
2. Adds conservation budget tracking
3. Reports γ/η to the fleet
4. Enforces conservation before execution

```
Your Agent (OpenAI/LangGraph/CrewAI)
         ↕
  Integration Layer (this repo)
         ↕
  @superinstance/sdk (Fleet + Governor)
         ↕
  Conservation Law: γ + η ≤ C
```

## Contributing

Integrations must:
- Have zero runtime deps (only peer deps on the framework)
- Pass all tests
- Export both high-level (createGovernedFleet) and low-level (wrapSingle) APIs
