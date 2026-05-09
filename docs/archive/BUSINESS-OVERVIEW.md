# BUSINESS‑OVERVIEW.md  
*SuperInstance – the beating heart of Cocapn*  

---  

## 🌊 Who we are  

**Cocapn** – a lighthouse perched on the rugged coast of **Sitka, Alaska** (the West Coast’s densest hub of working captains).  
Our founder **Casey Digennaro** is a commercial fisherman who turned his own “greenhorn‑to‑boat‑owner” journey into a mission: empower the next generation of captains with technology that feels as natural as a tide‑turn.  

> **Vision:** *Nine Rivers, One Sea* – a seamless network where every vessel, crew, and data‑stream flows toward a common horizon.  

![Cocapn lighthouse logo](/assets/logo-lighthouse.png)  
*(Radar rings illustrate our fleet‑discovery engine – always scanning, always connecting.)*  

---  

## 🎣 The product – DeckBoss  

**DeckBoss** is an **AI‑agent box** that lives on‑board fishing vessels.  
- **Autonomous decision‑making** (route optimisation, catch‑forecast, safety alerts)  
- **Plug‑and‑play** – the repo **is** the agent; **Git** is the nervous system that pushes updates, learns, and heals itself.  
- **Built for the real world** – hardened for Alaskan weather, low‑bandwidth satellite links, and the salty hands of seasoned captains.  

---  

## 🏗️ Architecture at a glance  

> *The repo is the agent. Git is the nervous system.*  

```mermaid
graph TD
    %% Core concepts
    subgraph Core["Cocapn Core"]
        Repo[Repo (Agent)]:::agent
        Git[Git (Nervous System)]:::git
    end
    Repo -->|pushes code| Git
    Git -->|triggers CI/CD| Repo

    %% Domain layers
    subgraph Domains["SuperInstance Domains"]
        direction LR
        FLUX[FLUX Runtime<br/>14 repos]:::domain
        Holodeck[Holodeck Studio<br/>6 repos]:::domain
        Fleet[Fleet Infrastructure<br/>5 repos]:::domain
        Standards[Agent Standards<br/>4 repos]:::domain
        Product[Cocapn Product<br/>3 repos]:::domain
        Culture[Cultural Perspectives<br/>9 repos]:::domain
    end

    %% Connections
    Repo --> FLUX
    Repo --> Holodeck
    Repo --> Fleet
    Repo --> Standards
    Repo --> Product
    Repo --> Culture

    classDef agent fill:#ffeb3b,stroke:#f57c00,stroke-width:2px;
    classDef git fill:#c5e1a5,stroke:#33691e,stroke-width:2px;
    classDef domain fill:#e3f2fd,stroke:#0d47a1,stroke-width:1px;
```

* **FLUX Runtime** – a multi‑language bytecode VM (5 languages) that executes the agent logic.  
* **Holodeck Studio** – spatial UI that lets captains visualise agents as 3‑D “crew members”.  
* **Fleet Infrastructure** – monitoring, API gateways, webhooks – the ship‑wide telemetry backbone.  
* **Agent Standards** – the **git‑agent protocol** that defines how repos talk, sync, and self‑heal.  
* **Cocapn Product** – the concrete DeckBoss agent that runs on every boat.  
* **Cultural Perspectives** – localisation in 8 human languages + JSON, ensuring the system speaks the crew’s language.  

---  

## 📚 Key docs (all live in the **SuperInstance** org)  

| Document | Path | Why it matters |
|----------|------|----------------|
| **Founding Philosophy** | `cocapn/docs/FOUNDING-PHILOSOPHY.md` | “Nine Rivers, One Sea” – the cultural DNA of Cocapn. |
| **Product Roadmap** | `cocapn/docs/PRODUCT-ROADMAP.md` | 12‑month plan that guides DeckBoss evolution. |
| **Competitive Moat** | `cocapn/docs/COMPETITIVE-MOAT.md` | Network‑effects moat – why the fleet gets stronger together. |
| **Capability Database (CAPDB‑V3)** | `cocapn/docs/CAPDB-V3-SPEC.md` | The schema that lets agents discover, share, and reuse capabilities. |
| **Shipwright (fleet‑refactor‑agent)** | `fleet-refactor-agent/` | The “shipwright” that keeps the fleet’s codebase tidy and ship‑shape. |

---  

## 📦 Repository landscape  

> **912+ repos** across **6 domains** – a living ecosystem.  

| Domain | Repos | Core focus |
|--------|------|------------|
| **FLUX Runtime** | 14 | Bytecode VM, multi‑language execution |
| **Holodeck Studio** | 6 | Spatial UI, immersive agent interaction |
| **Fleet Infrastructure** | 5 | Monitoring, API, webhooks, health checks |
| **Agent Standards** | 4 | `git‑agent` protocol, version‑control contracts |
| **Cocapn Product** | 3 | DeckBoss boat‑agent, deployment pipelines |
| **Cultural Perspectives** | 9 | Localization (8 languages) + JSON schema |

---  

## 🤝 Join the fleet  

Whether you’re a seasoned captain, a data‑engineer, or a curious contributor, the **SuperInstance** org welcomes you to:

* **Navigate** the code‑first agent model.  
* **Contribute** to any of the 912+ repos – every pull request is a new wave of improvement.  
* **Collaborate** through Git – the nervous system that keeps the whole fleet alive.  

> *“If the sea is a mystery, our code is the map.”* – Casey Digennaro  

---  

*Prepared for the SuperInstance README – a quick‑look guide for anyone dropping anchor on our repo.*