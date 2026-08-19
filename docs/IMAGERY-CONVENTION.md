# IMAGERY CONVENTION — the visual law of the fleet

*Every repo answers the visual question before it ships.*

## The law

When working in any repo, ask: **"is there a visual way this is being explained?"**

- **Interconnection** (architecture, data flow, protocols) → **mermaid**. The right
  tool for things whose essence is *edges between nodes*.
- **Concept** (a metaphor, a mood, a thesis) → **one generated image, workshopped
  until it's the RIGHT image** — Mark Twain's law: the difference between the right
  image and the almost-right image is the target and the almost-target.
- **Both** → both. A mermaid for the engineer, an image for the human.

## The idiom (one gallery, not a scrapbook)

*Warm instruments doing precise work in the dark, seen from inside.*

- Palette: midnight navy + honey amber + brass + cream foam. Always.
- Interiority: the viewer is *inside* the system (in the shell, at the desk, at
  the bar), never looking at it from outside.
- No robots, no circuit-board clichés, no floating-head sci-fi. The crew's
  humanity is felt, not labeled — figures of light, not chrome.
- One glowing act per image. If two things glow, split it into two images.

## The workshop (how an image earns its place)

1. **Generate** 3 variants (DeepInfra FLUX; schnell for drafts, bigger FLUX for keepers).
2. **Judge** with a vision model against a 4-axis rubric: concept legibility,
   palette discipline, composition at README width, painterly quality.
3. **Fold** the critiques into the next round — but know when the judge is wrong
   (asking for "robot cues" is the almost-right instinct; resist it).
4. **Captain's call** on finalists (MEDIA: previews in chat).
5. **Wire** with provenance: commit message starts `imagery:` — the whole campaign
   is queryable: `git log --grep=imagery` across the org.

## Placement rules

- Hero goes after H1 + tagline, before the first `---` or `## `. Never inside
  tables (breaks markdown), never stacked on an old hero (demote the old one
  into a content section).
- Width 640–720. Always `<p align="center">` wrapped. Always alt text that
  *says the metaphor*, not the objects.
- Section images earn a one-line italic caption stating the concept.

## Status of the campaign

Landed: quilt, quilt-rust, plainsong, plainsong-mcp, OpenConstruct (3),
crab-traps (3), plato-perception, plato-prediction, signal-chain,
engine-ensign, OpenRoom, hermes-construct, terrain, plato-portal, elephant (beloved).
In workshop: flagship hero (3 finalists with the Captain).
