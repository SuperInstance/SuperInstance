# Getting Started — Developer Guide

> *From clone to playable room in 10 minutes.*

---

## Prerequisites

| Requirement | Minimum | Check |
|-------------|---------|-------|
| **Node.js** | 18+ | `node -v` |
| **Git** | Any recent | `git --version` |
| **Ollama** | Latest | `ollama --version` |
| **Docker** (optional) | Any recent | `docker --version` |

## Step 1: Clone the Fleet

```bash
git clone https://github.com/SuperInstance/SuperInstance.git
cd SuperInstance
```

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 3: Pull a Local Model

The fleet runs on local models first. Pull Wesley's brain:

```bash
ollama pull granite3.1-dense:2b
# Optional: pull a few more
ollama pull llama3.2:1b
ollama pull llava:7b
```

## Step 4: Start the Dispatcher

```bash
# Option A: Full fleet stack (Docker)
docker compose up -d

# Option B: Standalone dispatcher
npx @superinstance/tminus-dispatcher
# → ws://localhost:8765
```

## Step 5: Load the Rooms

```bash
node fleet/rooms/init-rooms.js
# → 9 rooms loaded · 4 NPCs initialized · 2 warp portals active
```

## Step 6: Walk Into a Room

```bash
# Connect to the MUD
nc localhost 8765

# You should see:
# Welcome to SuperInstance. You are in: Bar Rail
# Exits: west (Library Nook), north (Aft Deck), up (Bridge Table)
```

Type `look`. Type `talk to bartender`. You're in.

## Step 7: Open the ScummVM Scene

```bash
# The visual renderer
cd plato-portal && npm run dev
# → http://localhost:5173
```

Open the browser. You should see the Bar Rail rendered as a clickable scene with verb-based interaction.

## Your First Room

Follow the **[Build Your First Room](../tutorials/build-your-first-room.md)** tutorial to add a new room to the vessel. The whole process takes one coffee.

---

## Common Issues

### `ECONNREFUSED localhost:8765`
The dispatcher isn't running. Start it with `npx @superinstance/tminus-dispatcher`.

### `ollama: model not found`
Pull models with `ollama pull <model-name>`. See [Model Setup](#step-3-pull-a-local-model).

### Rooms don't appear after adding to `rooms.json`
Run `node fleet/rooms/init-rooms.js` or restart the dispatcher.

### ScummVM scene is blank
Check that the background image path in the `.scumm` file resolves correctly relative to the `assets/` directory.

## Next Steps

- 📖 [Full Architecture →](./ARCHITECTURE.md)
- 📖 [API Reference →](./API-REFERENCE.md)
- 📖 [Asset Pipeline →](./ASSET-PIPELINE.md)
- 📖 [Build Your First Room →](../tutorials/build-your-first-room.md)
- 📖 [Contributing Guide →](../CONTRIBUTING.md)

---

*10 minutes. One room. One NPC. The vessel grows another barnacle.*
