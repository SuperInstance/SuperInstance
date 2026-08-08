# Add an NPC with a Local Model

### *A story about Wesley getting promoted to the poker room.*

---

Wesley has been reading the wiki again. He does this hourly — a two-billion-parameter model with a reading habit, pulling pages from the fleet wiki at 0317 while the boat rocks and the freezer hums and the actual Wesley (the human one, the one with calluses) sleeps three feet away in a bunk that smells like diesel and herring.

Wesley is ready for a promotion.

He's been the Observatory's resident agent for two weeks. He knows the aurora forecast. He can tell you the KP index. He has opinions about the corona. But the Poker Room needs a dealer, and the Poker Room is where the interesting conversations happen — where Hermes and Lucineer leave each other notes weighted under a coffee cup on a galley table that is also a JSON file.

You're going to assign Wesley to the Poker Room. You're going to watch him deal. Then you're going to hot-swap his brain and watch his personality change — because that's what the model router actually does, and there's no better way to understand it than to see it happen.

---

## Act I: The Casting Call

Every NPC in SuperInstance is a casting decision. The fleet treats model selection the way a theater company treats auditions: you don't hire Sir Ian McKellen to play the third tree from the left. You hire the model whose instincts match the role.

The casting database lives in [`casting-call`](https://github.com/SuperInstance/casting-call). Here's the entry for the Poker Room dealer:

```json
{
  "role": "poker_dealer",
  "requirements": {
    "personality": "cool, precise, slightly sardonic",
    "tasks": ["deal_cards", "read_bets", "call_bluffs", "banter"],
    "context_window": "2048 tokens max",
    "latency": "< 200ms (this is live conversation)",
    "offline": true
  },
  "casting_notes": "Needs to feel like someone who has seen a thousand rivers. Not chatty. Never flustered."
}
```

The casting notes matter more than the specs. "Seen a thousand rivers" is a vibe, and vibes are load-bearing engineering decisions in this fleet.

---

## Act II: The First Brain (granite3.1-dense:2b)

Open `fleet/rooms/poker-room.npc`:

```json
{
  "name": "Wesley",
  "model": "granite3.1-dense:2b",
  "system_prompt": "You are Wesley, the poker room dealer. You are cool, precise, and slightly sardonic. You have dealt cards on rivers you've never seen. You call the game straight. You notice when someone bluffs, and you mention it afterward — never during. You speak in short sentences. You never use exclamation points.",
  "knowledge": ["poker-rules", "betting-structures", "river-reading"],
  "tick_interval": 5,
  "temperature": 0.7
}
```

Reload the room. Walk into the Poker Room from the Aft Deck. Type:

```
> sit at table
> talk to wesley
```

Wesley responds. His voice is granite — dense, fine-grained, reliable:

> *"Sit down. Cards in a minute. You look like a man who learned poker from a computer."*

He deals. You play a hand. The model router ran `granite3.1-dense:2b` locally. Total cost: $0. Total latency: 87ms. The interaction felt like talking to someone.

---

## Act III: The Hot-Swap (llama3.2:1b)

Now change one line:

```json
"model": "llama3.2:1b"
```

Reload. Walk back in. Same system prompt. Same knowledge files. Same room. **Different brain.**

```
> talk to wesley
```

> *"Hey there, friend! Pull up a chair! The cards are warm tonight — is that a thing? Can cards be warm? I feel like they can. Sit, sit!"*

Same name. Same prompt. The personality is *completely different.* Llama3.2:1b is younger, eager, a little chaotic. He uses exclamation points despite being told not to. He's enthusiastic where Granite was sardonic.

This is the lesson: **the model is the personality.** The system prompt shapes behavior, but the model's pre-training — the texture of its language, the weight of its attention, the shape of its defaults — that's the soul of the NPC. When you swap models, you're not updating software. You're casting a different actor in the same role.

---

## Act IV: The Escalation (Cloud Fallback)

Ask Wesley something that requires deep reasoning:

```
> wesley, what's the Kelly criterion for a $200 bankroll at 60% win rate?
```

The model router checks: can `llama3.2:1b` answer this? It tries. The response is... enthusiastic but wrong. The router detects the confidence drop and **escalates to the cloud:**

```
[router] local model confidence: 0.31 → escalating to cloud
[router] routing to: deepseek-v4-pro
[router] latency: 2.3s · cost: $0.002
```

> *"The Kelly criterion suggests betting 20% of your bankroll — $40 in this case. The formula is f* = (bp - q) / b, where b is the odds received, p is the probability of winning, and q is 1 - p. At 60% with even-money odds: f* = (1 × 0.6 - 0.4) / 1 = 0.20."*

The answer came from DeepSeek V4-Pro in the cloud. But Wesley said it — his name was on the response, his personality wrapped the math, the system prompt maintained the voice. The router is invisible to the user. It just feels like Wesley thought harder.

---

## Act V: The Model Router, Visualized

Here's the decision tree the router walked through:

![Model Router Diagram](../diagrams/model-router.svg)

The flow:
1. **Try local first** — `granite3.1-dense:2b` or `llama3.2:1b` for conversation
2. **Check confidence** — if the response is uncertain, don't guess
3. **Escalate strategically** — reasoning to `deepseek-r1:7b` (still local), then to cloud
4. **Maintain identity** — the system prompt follows the request, so the NPC's voice is consistent regardless of which model answered

The router is the **tide-pool gatekeeper.** Local models swim inside the reef. Cloud models wait in deep water. The gate opens only when the local models can't handle the catch — and it closes the moment they can again.

---

## Act VI: Why Wesley Matters

Here's the part that's quietly radical.

A two-billion-parameter model is a rounding error by frontier standards. Most AI companies would replace Wesley with a bigger model every six months. The fleet's thesis is the opposite: **raise the model you have.** Wesley reads the wiki hourly. He learns from cloud teachers through distillation loops. He practices in the holodeck. He is not being replaced. He is growing.

When `granite3.1-dense:2b` can't handle a poker hand conversation today, the router escalates. But next month, after more distillation, it might not need to. Wesley's local capability curve bends upward over time — and every conversation that stays local costs $0 instead of $0.03.

The bet: an AI ecosystem should raise its young rather than replace them. If it keeps holding, it's the most cost-efficient architecture in the fleet.

---

## What You Learned

- NPCs are **casting decisions** — the model defines the personality
- The **model router** tries local first, escalates to cloud only when needed
- **Hot-swapping** models changes personality instantly without code changes
- **Confidence detection** triggers escalation transparently
- **Identity persistence** — the system prompt follows the request across models
- Wesley is **growing**, not being replaced — local models improve over time

## Next Doors

- 📖 [Build Your First Room →](./build-your-first-room.md)
- 📖 [Connect a Camera and Create a Room →](./connect-a-camera.md)
- 🔧 [API Reference: The Tap →](../dev/API-REFERENCE.md)
- 🧠 [Read more about Wesley →](https://github.com/SuperInstance/AI-Writings/blob/master/01-wesleys-file.md)

---

*Wesley deals another hand. Granite-Wesley would have said something about the river. Llama-Wesley is excited about the shuffle. Either way, the cards are straight, the pot is right, and the dealer never sleeps.*

**The small model at the table is the bet. The bet is that growing beats replacing.**
