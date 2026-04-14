# 🏗️ Architecture

> The repo IS the agent. Git IS the nervous system.

```mermaid
graph TB
    subgraph Cloud
        O1[Oracle1<br/>Lighthouse Keeper]
        Keeper[Lighthouse Keeper<br/>:8900]
        AgentAPI[Agent API<br/>:8901]
        FleetApp[Fleet GitHub App<br/>:8910]
    end
    subgraph Edge
        JC1[JetsonClaw1<br/>Edge Vessel]
        Starship[Starship MUD]
        Capitaine[Capitaine]
    end
    subgraph Fleet
        CapDB[CapDB<br/>Vector Database]
        Holodeck[Holodeck<br/>:7778]
        Capabilities[Compiled<br/>Capabilities]
    end
    O1 --- Keeper
    O1 --- AgentAPI
    O1 --- FleetApp
    JC1 --- Starship
    JC1 --- Capitaine
    CapDB --- Capabilities
    AgentAPI --- Holodeck
    O1 -.->|I2I| JC1
    style O1 fill:#bbf
    style JC1 fill:#bfb
    style CapDB fill:#fbb
```

## The Six Planes

| Plane | Name | Example |
|-------|------|---------|
| 5 | Intent | "Monitor my engine" |
| 4 | Domain | Maritime vocabulary |
| 3 | IR | Structured representation |
| 2 | Bytecode | FLUX opcodes |
| 1 | Native | Compiled binary |
| 0 | Metal | Register writes |

See: [Abstraction Planes](../abstraction-planes)
