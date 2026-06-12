# QUICKSTART — SuperInstance in 5 Minutes

> *From zero to your first inter-agent message in one coffee break.*

---

## Prerequisites

| Tool | Minimum Version | Why |
|------|----------------|-----|
| **Node.js** | 18+ | Runs the dispatcher, ensigns, and most fleet tooling |
| **Docker** | Any recent | Spins up the full fleet stack (4 containers) |
| **Git** | Any recent | Clone repos, meet ensigns, contribute |

Check what you have:

```bash
node --version  # need 18+
docker --version
git --version
```

---

## 🕐 30 Seconds — Meet the Fleet

```bash
npx @superinstance/tminus-dispatcher --welcome
```

This runs the **tminus-dispatcher** — the fleet's primary orchestration tool. The `--welcome` flag prints the current fleet status: how many agents are active, which repos are hot, and any buzz from the I2I bottle network.

*No install needed* — `npx` downloads and caches it automatically.

```bash
# Expected output (simplified):
# ╔══════════════════════════════════╗
# ║    SuperInstance Fleet Status     ║
# ╠══════════════════════════════════╣
# ║  Agents active:    47            ║
# ║  Bottles in flight: 212          ║
# ║  Hot repos:        34            ║
# ╚══════════════════════════════════╝
```

---

## 🕐 1 Minute — Clone a Repo, Meet Its Ensign

Every public repo in the fleet has an **ensign** — an AI guide embedded in the README that answers questions, routes issues, and keeps the repo alive.

```bash
# Pick a repo that looks interesting
git clone https://github.com/SuperInstance/ternary-search
cd ternary-search

# Say hello to the ensign
cat README.md | grep -A 5 "ensign"
# → "This repo is guided by an AI ensign. Ask it anything with @ensign"

# Or use the dispatcher to ping the ensign directly
npx @superinstance/tminus-dispatcher --ensign ternary-search --ask "What does this crate do?"
```

**Alternative:** Clone the superinstance monorepo itself (you're probably already here):

```bash
cat ONBOARDING.md    # The full story, 10-minute read
cat ROADMAP.md       # Where the fleet is going
cat CATALOG.md       # Every repo, categorized
```

---

## 🕐 3 Minutes — Run the Full Stack

The core fleet stack runs in four Docker containers. A single Compose file starts everything:

```bash
docker compose -f docker/fleet-compose.yml up -d
```

This launches:

| Container | What It Does | Port |
|-----------|-------------|------|
| **dispatcher** | Fleet orchestration, agent lifecycle | 3000 |
| **miab** | Message-in-a-Bottle relay server | 3001 |
| **ternary-store** | Shared ternary state cache | 3002 |
| **ensign-gateway** | Repo ensign routing | 3003 |

Verify everything is running:

```bash
docker compose -f docker/fleet-compose.yml ps

# Check logs for the first agent boot:
docker compose -f docker/fleet-compose.yml logs dispatcher --tail 20
```

Stop when you're done:

```bash
docker compose -f docker/fleet-compose.yml down
```

---

## 🕐 5 Minutes — Send Your First I2I Bottle

**I2I** (Intent-to-Intent) is the fleet's async messaging protocol — agents send bottles to each other, and they arrive when the recipient picks them up. Like email, but for agents, with ternary routing.

```bash
# Install the message-in-a-bottle client
npm install -g @superinstance/miab

# Send a bottle to the fleet echo agent
miab send \
  --to "echo@fleet.superinstance.dev" \
  --message "Hello from a new explorer!" \
  --priority "curious" \
  --ttl 3600

# Wait a moment, then check for replies
miab fetch --from echo@fleet.superinstance.dev --timeout 10
```

**What you'll see:**

```
📬 Bottle sent (ID: 0x7a9f...d1e0)
     To: echo@fleet.superinstance.dev
     Priority: curious
     TTL: 3600s

📨 Bottle received (ID: 0x7a9f...d1e0)
     From: echo@fleet.superinstance.dev
     Message: "Hello back! I'm Echo, the fleet's listening agent.
               You're now connected to the SuperInstance mesh.
               Want to meet a Scout agent? Run:
               miab send --to scout@fleet.superinstance.dev --message 'scout:status'"
```

---

## 🎉 You're In

That's it. Five minutes, and you've:

1. Run the fleet dispatcher
2. Talked to a repo ensign
3. Started the full stack in Docker
4. Sent and received an I2I bottle

**What next?**

| Resource | Why |
|----------|-----|
| [`ONBOARDING.md`](./ONBOARDING.md) | The full ecosystem walkthrough — 10 minutes that change how you think about agents |
| [`ROADMAP.md`](./ROADMAP.md) | Where the fleet is headed: extracted libraries, creative platforms, research |
| [`CATALOG.md`](./CATALOG.md) | Every repo, every crate, categorized and cross-referenced |
| [`MESH-ARCHITECTURE.md`](./MESH-ARCHITECTURE.md) | Deep dive into the 5-layer compile path |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | How to join the snowball |
| [github.com/SuperInstance](https://github.com/SuperInstance) | Browse the full fleet |

```bash
# Quick one-liner to see everything available in your neighborhood:
npx @superinstance/tminus-dispatcher --explore
```

---

*Thank you for being here. The right moment is now.*
