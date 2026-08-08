# Connect a Camera and Create a Room

### *A story about a USB camera, a crow's nest, and an agent learning to read the swell.*

---

The camera arrived in a Pelican case with a crack in the lid and salt crystals on the lens housing. It was supposed to be a backup unit for the deck cam that watches the longline shooter. It became something else — the eye of a new room.

You're going to plug it in, create the **Crow's Nest Forward Camera** room, assign a vision model to watch what it sees, and then do the interesting part: teach the agent to read the water the way a fisherman reads it — not by analyzing pixels, but by being corrected, over and over, by someone who has been looking at the ocean for twenty years.

This is the story of how a camera becomes a crew member.

---

## Scene 1: The Hardware (Plugging In)

On the boat, the camera goes on the mast rail, facing forward, angled 15° below horizon to catch the water surface. The USB cable runs through the wheelhouse window. The laptop sees it:

```bash
ls /dev/video*
# /dev/video0  (built-in webcam, ignore)
# /dev/video1  (the new camera)
```

The sensor bridge picks it up automatically. The sensor bridge is the boat's nervous system — it watches every data source and makes each one available as a MUD room:

```bash
# Verify the sensor bridge sees the camera
curl http://localhost:8765/sensors
# {
#   "cameras": [
#     { "id": "forward_cam", "device": "/dev/video1", "status": "active" }
#   ]
# }
```

The camera exists in the system now. But it's just a feed. It doesn't know what it's looking at.

---

## Scene 2: The Room (Making Space)

Create the room in `rooms.json`:

```json
{
  "crows_nest_camera": {
    "title": "Crow's Nest Forward Camera",
    "description": "A forward-facing camera feed from the mast rail. The ocean fills the frame — gray, green, or black depending on the weather. Whitecaps appear and vanish. The horizon tilts with the swell.",
    "exits": {
      "below": "wheelhouse",
      "warp": "bar_rail"
    },
    "flags": ["camera-feed", "vision-aware"]
  }
}
```

The `camera-feed` flag tells the room to pull frames from the sensor bridge. The `vision-aware` flag tells the NPC system to expect image input. Save and reload. The room exists in the graph now — an agent can walk into it — but there's no one home.

---

## Scene 3: The Watchkeeper (Assigning llava:7b)

The NPC needs eyes. The only local model that can see is `llava:7b` — seven billion parameters of vision-language understanding, running on the laptop's GPU. It's not the smartest model in the fleet, but it's the one that can look at the ocean and say something about it.

Create `fleet/rooms/crows-nest-camera.npc`:

```json
{
  "name": "Crow",
  "model": "llava:7b",
  "system_prompt": "You are Crow, the forward camera watchkeeper. You describe what you see in the camera feed using precise maritime language. You report swell direction, sea state, visibility, and any vessels or wildlife visible. You are laconic. You do not speculate beyond what you can see. When you are uncertain, you say 'uncertain' and describe what makes it hard to tell.",
  "tick_interval": 30,
  "vision": {
    "source": "forward_cam",
    "capture_interval": 30,
    "resolution": [640, 480]
  }
}
```

Every 30 seconds, Crow captures a frame, processes it through llava:7b, and writes an observation to the room's history buffer. The first time you walk in:

```
> go to crows_nest_camera

Crow's Nest Forward Camera
A forward-facing camera feed from the mast rail. The ocean fills the frame.

Crow looks at the feed.

> talk to crow

Crow: "Gray water. Swell from the southwest, maybe three feet. Whitecaps scattered. Visibility good to the horizon. No vessels. Uncertain on swell period — the frame rate makes timing hard."
```

Crow is looking. Crow is reporting. Crow is also, in the most generous reading, **wrong about the swell direction.**

---

## Scene 4: The Correction (Teaching by Talking)

The swell is coming from the northwest. You know this because you've been on this boat for fourteen days and the swells in Chatham Strait come from the northwest when the low pressure sits over Yakutat, which it has for three days. Crow doesn't know this. Crow sees pixels.

Correct it:

```
> say to crow "The swell is from the northwest, not southwest. 
  The low is over Yakutat. Northwest swell means following seas 
  if we're heading southeast."

Crow: "Corrected. Swell from the northwest. Thank you."
```

The correction goes into Crow's context window. The next frame capture, Crow writes:

> *"Swell from northwest, approximately three feet. Following seas on current heading. Whitecaps scattered."*

Better. But two hours later, the swell shifts — it always does, when the tide changes and the current meets the wind at a different angle. Crow doesn't notice the shift, because Crow's context window doesn't extend to "patterns over six hours." You correct again:

```
> say to crow "The tide just turned. The current is now ebbing 
  southeast against a northwest wind. Expect wind-against-tide 
  at the cape. Steepen your sea state estimate."

Crow: "Corrected. Sea state likely to steepen near cape due to 
wind-against-tide. I will watch for shorter, steeper wave forms 
in the next capture."
```

**This is how the agent learns.** Not through fine-tuning. Not through backpropagation. Through conversation — the same way a green deckhand learns. The captain says "the swell's from the northwest" and the deckhand adjusts. The captain says "wind-against-tide at the cape" and the deckhand watches for it. The model doesn't change. The context grows.

Over days, Crow's observations accumulate context:
- Swell patterns by tide phase
- What wind-against-tide looks like from this camera angle
- The difference between coho jump (small splash, no repeat) and humpback breach (enormous, unmistakable)
- When to say "uncertain" — fog, night, spray on the lens

The agent isn't being retrained. It's being **raised.**

---

## Scene 5: The Room Is Alive

Walk into the Crow's Nest after a week of corrections:

```
> talk to crow

Crow: "Northwest swell, four feet, period about eight seconds. 
Steeper than yesterday — wind has freshened. The whitecap pattern 
near the horizon suggests we're approaching the cape. If we round 
it, expect wind-against-tide. I'd recommend checking the chart for 
sea room. No vessels. One whale blow, two points off the starboard 
bow, distant. Uncertain on species."

> look at feed

[The camera frame shows gray water, short steep waves, spray on 
the lens. The horizon tilts twelve degrees as the boat rolls. 
A distant white plume — the whale.]
```

Crow isn't smart by frontier model standards. Seven billion parameters is nothing. But Crow has something a frontier model doesn't: **a week of being wrong in exactly this channel, corrected by someone who has been right in exactly this channel for twenty years.** The context window is the curriculum. The corrections are the training data. The agent is the student who never forgets a lesson because it's still in the conversation.

---

## What You Learned

- Camera rooms use the `camera-feed` and `vision-aware` flags
- The sensor bridge auto-discovers USB cameras and exposes them as data sources
- `llava:7b` processes frames and generates maritime observations locally
- **Correction is the teaching method** — no fine-tuning, just conversation
- Agents accumulate domain knowledge through context, not weight updates
- "Uncertain" is a feature — an agent that knows what it doesn't know is safer than one that doesn't

## Next Doors

- 📖 [Build Your First Room →](./build-your-first-room.md)
- 📖 [Add an NPC with a Local Model →](./add-an-npc-with-a-local-model.md)
- 🔧 [Asset Pipeline Guide →](../dev/ASSET-PIPELINE.md)
- 📡 [Sensor Bridge →](https://github.com/SuperInstance/signalk-bridge)

---

*The camera watches. Crow describes. You correct. The swell turns. Crow adjusts. The room learns the water the way everyone learns the water — by being wrong first, and by someone patient enough to say so.*

**The agent at the camera is not replacing the lookout. The agent at the camera is the lookout's notebook, and it never loses a page.**
