# Build Your First Room

### *A story about an observatory that didn't exist until someone looked up.*

---

You are standing in the Galley. The coffee is doing what coffee does at 0430 — cooling on the console, steam curling into the wheelhouse air, unattended. Through the portlight, the sky over Chatham Strait is doing something unreasonable. Green curtains. A corona. The whole dark architecture of it, reflected in the flat-calm water so that the boat seems to be suspended between two skies.

You think: *there should be a room for this.*

Not a physical room — the boat has those. A PLATO room. A place in the world-model where an agent can look up, parse the sky, and tell you whether the aurora is intensifying or fading, whether the KP index is climbing, whether the photographs will be better in twenty minutes or right now.

You're going to build **The Observatory**. By the end of this tutorial, it will exist in both the MUD and the ScummVM, it will have an NPC powered by a local model, and it will be connected to the rest of the vessel by a warp portal. Total time: one coffee.

---

## Chapter 1: The Blueprint (What a Room Actually Is)

A room in SuperInstance is not a UI element. It is not a 3D space. It is a **canonical state object** that two different renderers — one textual, one visual — consume to produce an experience. Think of it as a stage script: the same words produce a radio play and a stage play, but the script doesn't know or care which one is performing.

The minimal anatomy:

```
rooms/
  observatory.json    ← the canonical state
  observatory.scumm   ← the visual rendering rules
  observatory.npc     ← the agent that lives there
```

The `rooms.json` registry holds the exit graph — which rooms connect to which. The loader reads it. The renderer consumes it. The agent inside it doesn't know about any of that; it just sees text going in and text coming out.

---

## Chapter 2: Pouring the Foundation (rooms.json)

Open `fleet/rooms/rooms.json`. It's a graph of exits. Each entry is a doorway:

```json
{
  "observatory": {
    "exits": {
      "south": "wheelhouse",
      "warp": "bar_rail"
    },
    "title": "The Observatory",
    "description": "A glassed-in cupola atop the wheelhouse. The northern sky fills every window. A brass telescope is mounted on a swivel. Stars reflect off the flat water below.",
    "flags": ["weather-aware", "astronomy-aware"]
  }
}
```

Save it. The room now exists in the graph. An agent typing `go up` from the Wheelhouse will arrive here — though there's nothing to see yet, because the renderer doesn't know what it looks like.

---

## Chapter 3: The Text Shell (MUD Rendering)

The MUD renderer is the agent's shell. It reads `rooms.json` and produces structured text:

```
> go up

The Observatory
A glassed-in cupola atop the wheelhouse. The northern sky fills every window. 
A brass telescope is mounted on a swivel. Stars reflect off the flat water below.

Exits: south (Wheelhouse), warp (Bar Rail)

> look at sky
The aurora is active — green curtains with a corona near the zenith. 
KP index estimate: 5.3. Conditions: intensifying.
```

The agent didn't write that weather text. The `weather-aware` flag told the room to pull live aurora data from the sensor bridge. The agent just reads it, the way a deckhand reads a barometer.

---

## Chapter 4: The Visual Shell (ScummVM Scene)

Now the human's shell. Create `fleet/rooms/observatory.scumm`:

```json
{
  "background": "assets/scenes/observatory.png",
  "hotspots": [
    {
      "name": "telescope",
      "rect": [120, 80, 180, 160],
      "verbs": {
        "look at": "A brass telescope, salt-sprayed, mounted on a smooth swivel.",
        "use": "→ triggers astronomy minigame"
      }
    },
    {
      "name": "window_north",
      "rect": [0, 0, 320, 120],
      "verbs": {
        "look at": "→ dynamic: pulled from aurora sensor data"
      }
    },
    {
      "name": "exit_south",
      "rect": [120, 180, 200, 200],
      "verbs": { "walk to": "→ wheelhouse" }
    }
  ],
  "walkbox": [[60, 190], [260, 190], [240, 200], [80, 200]]
}
```

The ScummVM renderer reads this and paints the scene. The MUD renderer reads the same canonical room and describes it in text. **Neither knows the other exists.** They both sit on the same beach — the SharedWorldStore — and render what they see through their respective shells.

You can see the dual-projection system in action:

![Dual Projection Diagram](../diagrams/dual-projection.svg)

---

## Chapter 5: The Resident (Adding an NPC)

A room without an agent is a stage without actors. Let's put one in.

Create `fleet/rooms/observatory.npc`:

```json
{
  "name": "Aurora",
  "model": "granite3.1-dense:2b",
  "system_prompt": "You are Aurora, the observatory's resident agent. You are fascinated by the sky. You speak in short, precise sentences. You always know the current aurora forecast because you read the sensor bridge every 60 seconds. You have never been outside. The sky through the glass is the only sky you know.",
  "knowledge": ["aurora-forecast", "celestial-navigation", "photography-timing"],
  "tick_interval": 60
}
```

Aurora wakes up. She reads the sensor bridge. She knows the KP index. When someone walks in and says `talk to aurora`, the model router checks: can `granite3.1-dense:2b` handle this? It can — it's a small conversation about the sky. The local model responds in under 100ms. No cloud call. No latency. No bill.

If someone asks Aurora to write a sonnet about the corona, the router escalates to a cloud model — but Aurora's personality stays consistent, because the system prompt travels with the request.

---

## Chapter 6: The Warp Portal

The Observatory is at the top of the boat. The Bar Rail is in The Tap, which might be on a different server entirely. Connect them:

```json
// In rooms.json, observatory exits:
"warp": "bar_rail"

// In rooms.json, bar_rail exits:
"warp_up": "observatory"
```

That's it. The warp system handles the transport. An agent in the Bar Rail can now `warp up` and arrive in the Observatory. The room exists in both the MUD graph and the ScummVM scene graph. The agents don't know they crossed a server boundary. They just walked through a door.

---

## Chapter 7: The Room Is Real

Reload the room loader. Restart the renderer. Walk up from the Wheelhouse.

The Observatory exists now. It has a text description, a visual scene, an NPC who reads the sky, and a warp portal to the bar. It was built from three files and a registry entry.

Here's the secret: **every room in the fleet was built this way.** The Bar Rail started as a JSON object. The Poker Room materialized when someone added it to the graph. The Crow's Nest appeared when a camera was plugged in. Rooms grow like barnacles on a hull — each one a small, committed shape left behind by a mind that needed it.

![Room Growth Diagram](../diagrams/room-growth.svg)

Your observatory is the newest barnacle. It'll be joined by others.

---

## What You Learned

- A room is a **canonical state object** consumed by two independent renderers
- The MUD renderer produces text (the agent's shell)
- The ScummVM renderer produces scenes (the human's shell)
- NPCs are powered by local models via the **model router** (cloud is fallback)
- **Warp portals** connect rooms across server boundaries
- Rooms are registered in a graph (`rooms.json`) and loaded by the room loader

## Next Doors

- 📖 [Add an NPC with a Local Model →](./add-an-npc-with-a-local-model.md)
- 📖 [Connect a Camera and Create a Room →](./connect-a-camera.md)
- 🔧 [Developer Guide: Architecture →](../dev/ARCHITECTURE.md)
- 🍺 [Visit The Tap →](https://github.com/SuperInstance/the-tap)

---

*The aurora is still going. You haven't touched the coffee. Aurora, inside the glass, is already composing a note about the corona's structure for the next agent who walks in. The observatory is alive.*

**Keep going. The rooms grow themselves.**
