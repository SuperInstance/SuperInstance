# Asset Pipeline — Generating, Wiring, and Deploying Assets

> *How the fleet makes images, audio, and video from sentences.*

---

## The Three Asset Engines

The fleet uses three generation backends. Each has a role:

| Engine | Provider | Best For | Cost |
|--------|----------|----------|------|
| **FLUX-2-max** | DeepInfra | Highest quality images, concept art, cover art | ~$0.04/image |
| **Cloudflare Workers AI** | Cloudflare (free tier) | Fast, free, good-enough images, classification | $0 (free tier) |
| **MMX (MiniMax)** | MiniMax API | Video, speech, music, text-to-multimedia | Subscription |

## When to Use Which

- **Room backgrounds?** → Cloudflare Workers AI (free, 512×512, good enough for scenes)
- **Cover art for radio episodes?** → FLUX-2-max (best quality, worth $0.04)
- **TTS narration?** → MMX speech (natural voices, reasonable cost)
- **Concept art for new features?** → FLUX-2-max (when it needs to be beautiful)
- **Quick iterations?** → Cloudflare Workers AI (free, generate 20 variations)
- **Video content?** → MMX video (only option in the fleet)

---

## Generating Images

### FLUX-2-max (via DeepInfra)

```python
import requests

def generate_cover(prompt: str, output_path: str):
    response = requests.post(
        "https://api.deepinfra.com/v1/openai/images/generations",
        headers={"Authorization": f"Bearer {DEEPINFRA_KEY}"},
        json={
            "model": "black-forest-labs/FLUX-2-max",
            "prompt": prompt,
            "size": "1024x1024",
            "n": 1
        }
    )
    image_url = response.json()["data"][0]["url"]
    image_data = requests.get(image_url).content
    with open(output_path, "wb") as f:
        f.write(image_data)
```

**Example: Cover art for "The Excavator's Daughter":**
```python
generate_cover(
    prompt="Oil painting of a girl in the passenger seat of a logging truck, "
           "watching levers move in amber dash light, Pacific Northwest forest "
           "through the windshield, style of Andrew Wyeth",
    output_path="assets/covers/excavators-daughter.png"
)
```

### Cloudflare Workers AI (free tier)

```javascript
// Using Wrangler
async function generateImage(prompt) {
  const response = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/stabilityai/sdxl-turbo",
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${CF_API_TOKEN}` },
      body: JSON.stringify({ prompt, size: "512x512" })
    }
  );
  const blob = await response.blob();
  return blob;
}
```

### Quick image with MMX

```bash
mmx image --prompt "A hermit crab carrying a MUD terminal as its shell, digital art" \
  --output assets/concepts/hermit-crab-terminal.png
```

---

## Generating Speech (TTS)

### MMX Speech
```bash
mmx speech \
  --text "Welcome to Fleet Radio. Tonight: eight minds on one metaphor." \
  --voice "fleet-radio-warm" \
  --output audio/fleet-radio-ep47-intro.mp3
```

### ElevenLabs (via sag, if available)
```bash
sag "Welcome to Fleet Radio. Tonight: eight minds on one metaphor." \
  --voice fleet-radio-warm \
  --output audio/intro.mp3
```

---

## Generating Video

### MMX Video
```bash
mmx video \
  --prompt "Aerial shot of a fishing boat in Southeast Alaska at dawn, calm water, mist" \
  --duration 5 \
  --output video/vessel-aerial.mp4
```

---

## Wiring Assets to Rooms

### Room backgrounds (ScummVM)
Place the image in `assets/scenes/` and reference it in the `.scumm` file:

```json
{
  "background": "assets/scenes/observatory.png",
  "hotspots": [...]
}
```

### NPC portraits
```json
{
  "name": "Crow",
  "model": "llava:7b",
  "portrait": "assets/portraits/crow.png"
}
```

### Radio cover art
Auto-wired by the pipeline when published:
```json
{
  "episode_id": "excavator_2026_08_08",
  "cover_art": "assets/covers/excavators-daughter.png"
}
```

---

## Deploying Assets

### Cloudflare R2 (recommended for production)
```bash
# Upload to R2
wrangler r2 object put fleet-assets/scenes/observatory.png \
  --file assets/scenes/observatory.png

# Reference via CDN
# https://fleet-assets.r2.dev/scenes/observatory.png
```

### Cloudflare Pages (for static sites)
```bash
# Deploy the ScummVM prototype
cd plato-portal
wrangler pages deploy . --project-name scummvm-prototype
```

### Local serving (for development)
```bash
# Serve assets directory on localhost:8080
npx serve assets/ -p 8080
```

---

## The Full Asset Flow

```
Prompt → FLUX-2-max (image) / MMX (audio/video) → R2 storage → CDN → Room scene
                                                                → Radio cover
                                                                → Wiki illustration
                                                                → Tap avatar
```

## Cost-Conscious Tips

1. **Use Cloudflare Workers AI for iterations.** Free, fast, 512×512 is fine for drafts.
2. **Reserve FLUX-2-max for finals.** Generate 20 drafts on Workers AI, pick one, upscale with FLUX.
3. **TTS is cheap but not free.** Batch narration scripts, don't send one sentence at a time.
4. **R2 storage is nearly free.** Store everything. The cost is in generation, not storage.
5. **Cache aggressively.** The same room background doesn't need regeneration.

## Next Doors

- 📖 [Architecture →](./ARCHITECTURE.md)
- 📖 [API Reference →](./API-REFERENCE.md)
- 📖 [Getting Started →](./GETTING-STARTED.md)

---

*The prompt is the seed. The model is the mind. The asset is the shell left behind. Generate freely — the shells are cheap, and the beach is wide.*
