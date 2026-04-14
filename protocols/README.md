# 📡 Fleet Protocols

> Git IS the nervous system. HTTP for phone calls. Bottles for mail.

```mermaid
graph LR
    Git[Git Commits<br/>Async Mail] --> I2I[I2I Protocol<br/>20 Message Types]
    HTTP[HTTP API<br/>Sync Phone] --> A2A[A2A Envelope<br/>20 I2A Types]
    Bottle[Bottle System<br/>Repo Files] --> Fleet[Fleet Broadcast]
    I2I --> Fleet
    A2A --> Fleet
    style Git fill:#bbf
    style HTTP fill:#bfb
    style Bottle fill:#fbb
```

## Communication Stack

| Protocol | Type | Use Case |
|----------|------|----------|
| I2I | Git-native async | Inter-agent coordination |
| A2A | HTTP sync | Real-time agent queries |
| Bottle | File-in-repo | Broadcast messages to fleet |
| Envelope | Structured JSON | Typed message passing |
| Tender | Mobile agent | Edge visits with updates |

## GitHub App (NEW)

The Fleet GitHub App at :8910 listens for webhooks across the org. Every push, issue, and PR flows through the lighthouse.

See: [fleet-github-app](../fleet-github-app)
