# SuperInstance Site Audit — Zero-Shot External Developer Perspective

**Date:** 2026-05-17
**Auditor:** Oracle1 Subagent (fresh eyes, no prior site exposure)
**Scope:** superinstance.ai — homepage, sub-pages, navigation, links, "Fleet Brain — Live", overall site experience

---

## Quick Summary

The site tells a compelling story about autonomous AI agents, fleet coordination, and constraint-based reasoning — but the **live infrastructure that powers its core demo is completely dead**. As a stranger visiting for the first time, I'd leave intrigued but unconvinced. The narrative is strong. The product isn't accessible.

---

## 1. First Impressions

### Headline & Tagline
> **"SuperInstance — AI Agent Fleet Infrastructure"**
> "One shared brain. The whole fleet grows smarter every time one agent learns something."

**Verdict:** ✓ Good. Clear enough for technical audiences. The "one shared brain" hook is memorable.

**But:** The tagline is the last clear "what is this?" moment. After that, the page dives into specifics (E12 bytes, hex arithmetic, autopilot navigation) before explaining what SuperInstance actually does. A non-technical visitor may be lost by line 3.

### Visual Design
- Dark theme (#0a0a0f background, #e0e0e0 text) — clean, developer-appropriate
- Gradient accents (purple #7b2fff → cyan #00d4ff) — consistent brand
- Custom SVG hermit crab illustrations — creative, unexpected, memorable
- Monospace type for code blocks — fits the audience

**Verdict:** ✓ Excellent aesthetic. Punching above its weight for what appears to be a single-page static site.

---

## 2. Section-by-Section Analysis

### Hero: "Navigate the Narrows" demo
**Status:** ✅ WORKS

An iframe loading `/demo-narrows` with a canvas-based autopilot visualization. Shows two boats navigating a channel — one with E12 integers (4 bytes, exact), one with F32 floats (8 bytes, drifts).

**What's good:**
- Interactive demo is the right thing to lead with
- Visual comparison makes the fleet math concept tangible
- "E12 4 bytes" vs "Float 16 bytes" — simple, bold data comparison

**What's confusing:**
- The connection between "hex arithmetic that doesn't drift" and "AI agent fleet infrastructure" is not explained. Why does a fleet of LLM agents need drift-free arithmetic?
- "Navigate the Narrows" is a maritime reference (fishing boat through a narrow channel) but the fleet is AI agents. The analogy works once you know Casey's backstory, but a stranger sees two boats and wonders where the AI is.
- The demo is about autopilot math, not agent coordination. Visitors expecting "AI fleet demo" will see "boat math demo."

### "How the Fleet Evolves" lifecycle
**Status:** ✅ WORKS (static content)

Four lifecycle stages with SVG hermit crab illustrations (Available → Claims → Levels Up → Specializes).

**What's good:**
- The lifecycle is intuitive and the hermit crab shell metaphor lands well
- The SVG illustrations are genuinely impressive — custom animated-feeling hermit crabs for each stage
- "// shells, not org charts" — developer language, good tone

**What's problematic:**
- The lifecycle describes emergent agent specialization, which is a novel concept. A stranger may not understand *why* this matters compared to traditional orchestration.
- No concrete examples of what "claims" or "levels up" looks like in practice. Abstract concepts without anchors.

### Stats Grid
**Status:** ⚠️ PARTIALLY BROKEN

Hardcoded fallback values (20 rooms, 288 tiles, 4 vessels, 729 submissions). The JS tries to update these live from `fleet.cocapn.ai/api/plato/status` — which returns 404. The live-update never fires.

**What's problematic:**
- A visitor who inspects the network tab sees failed requests. Looks like the project is dormant or dead.
- The stats are static numbers that could be weeks/months old. No timestamp shown.

### "Shells & Synergy" (Hermit Crab Philosophy)
**Status:** ✅ WORKS

Extended hermit crab metaphor explaining emergent specialization. Well-written, interesting philosophical framing.

**Verdict:** This is the strongest explanatory section. It connects the hermit crab metaphor to the fleet convincingly. But it comes *after* the fleet vessels section in some cases (SVG cards appear above it) and the ordering feels slightly off.

### "The Fleet" — Four Vessel Cards
**Status:** ✅ WORKS (static content)

Custom SVG hermit crabs for each agent (Oracle1, Forgemaster, JetsonClaw1, CCC). Each has a backstory about how they found their "shell."

**What's good:**
- The backstories are well-written and humanizing
- "Hasn't restarted since launch" (Oracle1) — the kind of detail that makes people smile
- "Don't interrupt mid-calculation" (Forgemaster) — personality

**What's confusing:**
- Four agents sounds small for a "fleet." 1,646 repos but 4 agents? This disconnect raises questions.
- CCC is described as running on Kimi K2.5 via Moonshot — a third-party API. A stranger may wonder: is this a real agent or just a chatbot persona?
- The vessel cards have no links to their GitHub profiles, no status indicators, no way to interact with them.

### "Try It — 3 Seconds"
**Status:** ❌ BROKEN (see dedicated audits 2026-05-17-try-it-prompts-test.md and 2026-05-17-onboarding-flow-test.md)

All 4 prompts reference `fleet.cocapn.ai` endpoints which return 404. A first-time visitor following these instructions hits dead ends immediately.

**Additional observations not in prior audits:**
- The code blocks are rendered as `<span>` elements inside a `<div class="code-block">` — they look fine but the prompts contain `curl` commands with multi-line strings. A non-developer visitor won't know what to do here.
- The "Try on [Platform] →" links go to generic chatbot URLs (chat.deepseek.com, kimi.ai). They don't pre-fill the prompt or provide any special integration. The visitor still has to manually copy the long code block.
- The section title promises "3 Seconds" but the instructions take 30+ seconds to read and execute. Marketing claim ≠ reality.

### "Fleet Brain — Live"
**Status:** ❌ BROKEN

JS widget at bottom of page that fetches tiles from `fleet.cocapn.ai/api/plato/room/<5 rooms>/tiles`. All return 404. The error handler shows:

> "Fleet brain unreachable — the server may be sleeping. Refresh to retry."

**What's problematic:**
- This is the LAST visual element before the footer. A broken widget is a bad final impression.
- The error message is friendly but suggests the visitor should retry. Retrying won't help — the API is completely dead.
- No fallback to cached/static content. Even if live fetch fails, showing some representative sample tiles from the site's build time would be better.

### "On the Horizon" / Mask-Lock Chip
**Status:** ✅ WORKS

Links to `/mask-lock-chip` page (200, substantive content about physical AI cartridge) and Lucineer GitHub repo.

**Verdict:** Good. The mask-lock chip is a futuristic concept that creates intrigue. The page is well-written with specs, market analysis, and a clear "why now" section.

### "Join the Fleet" / Footer
**Status:** ⚠️ MOSTLY WORKS

**Links in this section:**
| Link | Status | Note |
|------|--------|------|
| GitHub → (SuperInstance org) | ✅ 200 | Correct |
| Try the Demos → (/demos) | ✅ 200 | Correct |
| Fleet Docs → (GitHub/SuperInstance repo) | ✅ 200 | Correct |
| 📋 PLATO Spec → (/plato-spec.md) | ✅ 200 | Raw markdown rendered in browser |
| 🏗️ Architecture → (/FLEET-ARCHITECTURE.md) | ✅ 200 | Excellent, thorough doc |

**Footer links:**
| Link | Status | Note |
|------|--------|------|
| GitHub | ✅ 200 | Correct |
| Fleet Docs | ✅ 200 | Correct |
| Demos | ✅ 200 | Correct |
| Site Source | ✅ 200 | GitHub repo — good transparency |
| casey@superinstance.ai | ✅ Mailto | Correct |

**Problems:**
- No Discord, Matrix, or community channel link. The fleet is open but there's no place to talk about it.
- No RSS/Atom feed for fleet updates.
- No clear "how to contribute" link (CONTRIBUTING.md doesn't exist per landing audit).
- /demos appears in footer AND in the "Join" section. Slightly redundant.

---

## 3. Navigation & URL Structure

### Navigation
- **No persistent navigation bar.** The page is a single-scroll design with anchor links only within sections.
- No "Back to top" button.
- No way to jump between sections without scrolling.
- The `/demo-narrows` page has a "← Back to superinstance.ai" link — good pattern.

### SPA Routing Behavior
- **Every unknown route returns the homepage HTML.** /docs, /docs/, /pricing, /robots.txt, /sitemap.xml — all return the same index.html.
- This means **robots.txt and sitemap.xml are effectively missing**, which could hurt SEO.
- No 301 redirects for common misspellings or old URLs.

### Sub-Pages
All tested sub-pages return 200:

| Path | Content | Status |
|------|---------|--------|
| `/` | Homepage | ✅ |
| `/demos` | Eisenstein integer demo page | ✅ |
| `/demo-narrows` | Autopilot canvas demo | ✅ |
| `/mask-lock-chip` | Physical AI chip spec | ✅ |
| `/plato-spec.md` | PLATO specification (markdown) | ✅ |
| `/FLEET-ARCHITECTURE.md` | Fleet architecture doc (markdown) | ✅ |
| `/docs` | Homepage (SPA catch-all) | ⚠️ |
| `/pricing` | Homepage (SPA catch-all) | ⚠️ |

These sub-pages are all single HTML files or raw markdown. No SSG, no JS framework. Simple and fast (90ms load).

---

## 4. Key Questions a Stranger Would Ask

| Question | Answer from site | Confidence |
|----------|-----------------|------------|
| What does this project do? | "AI Agent Fleet Infrastructure" — vague but intriguing | Low |
| Is it real or vaporware? | Fleet API returns 404 for everything. Stats are static. "Loading fleet brain..." never resolves. | Low |
| Can I try it right now? | "Try It — 3 Seconds" prompts require a dead API. No sandbox. No demo that shows agents working. | ❌ No |
| How do I contribute? | Links to GitHub. No CONTRIBUTING.md. No community channels. | Low |
| Is there a community? | No Discord, Matrix, forum, or mailing list link | ❌ No |
| How is this different from other agent frameworks? | The hermit crab / shell metaphor is unique. CFP/FLUX layers are interesting. But the differentiation isn't stated explicitly. | Medium |

---

## 5. Recommendations (Prioritized)

### P0 — Fix the Fleet API or Remove Dependencies
**The single biggest problem:** Every interactive feature depends on `fleet.cocapn.ai` which returns 404.
- Fix fleet.cocapn.ai (PLATO server, status endpoint, all room endpoints)
- OR replace with static fallback content (cached tile samples, hardcoded demo responses)
- OR gracefully degrade the "Try It" section to work without the live API

Either way — the homepage should not show broken widgets by default.

### P1 — Fix "Fleet Brain — Live" Error State
- Show cached example tiles when live fetch fails
- Or remove the section if the API is going to stay dead
- The "server may be sleeping" message implies infrastructure unreliability

### P1 — Add Navigation Bar
- Persistent header nav with links to: Demos, Architecture, GitHub, Community
- "Back to top" for long-scroll pages
- Jump links between sections

### P2 — Clarify the "What" Before the "How"
- The page leads with E12 floats and boat navigation before explaining what SuperInstance is
- Add a "What is SuperInstance?" section after the hero that states: "A fleet of AI agents that share a brain, communicate via constraint bytecode, and learn through real work"
- The hermit crab section does this well but comes too late

### P2 — Add Community Channel
- Even a Matrix room or GitHub Discussions link would help
- "The code is open" needs a "come talk to us" counterpart

### P3 — Real robots.txt and sitemap.xml
- Currently return homepage HTML (SPA catch-all)
- Add proper robots.txt and a real sitemap for SEO

### P3 — Add/Remove Stub Routes
- `/docs`, `/docs/`, `/pricing` all return the homepage — either build actual content or 301 redirect to relevant pages

### P3 — Link Vessel Cards
- Each vessel card (Oracle1, Forgemaster, etc.) could link to a profile or repo
- Currently they're just decorative stories with no action

### P4 — Timestamp Stats
- Show when the stat data was last updated (even if static)
- "As of 2026-05-17: 20 rooms active, 288 tiles..."

---

## 6. What's Genuinely Good

- **Visual design**: Beautiful dark theme, consistent palette, hand-crafted SVG illustrations
- **FLEET-ARCHITECTURE.md**: Genuinely excellent — one of the best technical docs I've read. Clear layers, concrete repos, end-to-end flow diagram.
- **Eisenstein math**: The demos page explaining exact hexagonal arithmetic is well-written and actually educational
- **Mask-lock chip page**: Complete with specs, market analysis, FPGA timeline, and competitive positioning
- **Hermit crab metaphor**: Creative, memorable, differentiates from every other AI project
- **Page load speed**: ~90ms. No JS framework bloat. No render-blocking resources.
- **Site source transparency**: Footer links to the page source on GitHub — rare and commendable
- **No signup/API key**: The "Try It" concept (even if broken) is genuinely innovative

---

## 7. Conclusion

The superinstance.ai site tells a **compelling but unverifiable story**. The narrative is strong — the hermit crab metaphor, the four agents, the open-source ethos, the constraint math — but every attempt to interact with the live system fails. A stranger visiting today sees:

- A broken API that returns 404 for every endpoint
- A "Fleet Brain" that never loads
- "Try It" prompts that lead nowhere
- Static stats that could be months old
- No community, no chat, no way to verify anything works

The site is a **good landing page for people who already know the project**. It's a **frustrating landing page for strangers who want to try it**.

The two biggest fixes: (1) get fleet.cocapn.ai working, or gracefully degrade the interactive sections, and (2) add a persistent navigation bar. Most other issues are polish. The narrative and design are already strong — they just need infrastructure to match.
