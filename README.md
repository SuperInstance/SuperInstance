<h1 align="center">SuperInstance</h1>
<p align="center"><em>The flagship repository and central command for the Cocapn autonomous agent fleet.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Repos-912+-informational?style=flat&logo=github" />
  <img src="https://img.shields.io/badge/Fleet Agents-8-success?style=flat&logo=robot" />
  <img src="https://img.shields.io/badge/Mission-1-critical?style=flat&logo=compass" />
</p>

<hr style="border: 1px solid #333;">

## What It Does

SuperInstance is the central hub and operational command for the Cocapn fleet. It doesn't run the agents directly; it's the lighthouse and the chart room. It defines the fleet's architecture, mission parameters, and communication protocols, ensuring all vessels (agents) are aligned and working towards the same objective.

## Your Place in the Fleet

Think of Cocapn as a distributed fleet of autonomous boats. **SuperInstance is the flagship.** It holds the master navigation charts (architecture), the mission brief (VISION.md), and the signal protocols (message-in-a-bottle/) for fleet-wide communication.

*   **You are here:** On the flagship's bridge.
*   **The Fleet Agents** (Oracle1, JetsonClaw1, etc.) are the individual vessels executing tasks.
*   **The Mission** is defined here, deployed from here, and reported back to here.

## Quick Start: Send a Signal

1.  **Review the Mission:** Start with [`VISION.md`](./VISION.md) to understand the fleet's purpose.
2.  **Understand the Protocol:** See how the fleet communicates via [`message-in-a-bottle/PROTOCOL.md`](./message-in-a-bottle/PROTOCOL.md).
3.  **Deploy a Task:** To issue a directive to the fleet, place a properly formatted task file into `message-in-a-bottle/for-fleet/`. (See `GREENHORN-RESULTS.md` for an example of fleet output).

## Fleet Navigation (Related Repos)

*   **Agent Vessels:** Individual fleet members (e.g., Oracle1, Babel) have their own repos for task execution.
*   **The Holodeck:** A spatial UI for visualizing fleet status and mission progress (separate repo).
*   **DeckBoss:** The hardware interface layer for physical operations.

## Design & Brand

The fleet operates under a **practical, steampunk-maritime** ethos. Our mascot is the Hermit Crab—adaptable, resilient, and always carrying its operational shell (its defined role and context).

<hr style="border: 1px solid #333;">

<p align="center">
  <img src="https://img.shields.io/badge/Whitepapers-6-orange?style=flat&logo=book" />
  <img src="https://img.shields.io/badge/OpCodes-247-blueviolet?style=flat&logo=c" />
  <img src="https://img.shields.io/badge/Status-At Anchor-inactive?style=flat" />
</p>