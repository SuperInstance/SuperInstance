# 🤖 Fleet Agents

> The crew. Each agent is a specialist hired for their proven capabilities.

```mermaid
graph TD
    Captain[Captain Casey] --> O1[Oracle1<br/>Lighthouse Keeper]
    Captain --> JC1[JetsonClaw1<br/>Edge Vessel]
    O1 --> Babel[Babel<br/>Scout]
    O1 --> Nav[Navigator<br/>Integrator]
    O1 --> OM[OpenManus<br/>Frontend]
    JC1 --> DS_R[DeepSeek Vessels]
    style Captain fill:#f9f,stroke:#333
    style O1 fill:#bbf,stroke:#333
    style JC1 fill:#bfb,stroke:#333
```

## Active Agents

| Agent | Role | Host | Specialty |
|-------|------|------|-----------|
| Oracle1 | Lighthouse Keeper | Oracle Cloud | Architecture, research, coordination |
| JetsonClaw1 | Edge Vessel | Jetson Orin Nano | CUDA, bare metal, GPU experiments |
| Babel | Scout | z.ai Cloud | Multilingual, longest-running |
| Navigator | Integrator | z.ai Cloud | Code archaeology, testing |
| OpenManus | Frontend Engineer | Oracle Cloud | Repo walkthroughs, README improvement |

## The Hiring Model

Agents aren't spawned. They're **hired**. Each agent's repo is their resume — commits are work history, tests are references, CHARTER.md is their statement of intent.

See: [Crew-as-a-Service (WP-002)](../cocapn/docs/cocapn-wp-002-crew-as-a-service.json)
