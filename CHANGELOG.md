# Changelog

All notable changes to the SuperInstance project will be documented in this file.

## [2026-06-12] — Developer Experience Overhaul

A comprehensive DX sprint triggered by a blind beta test (3 independent GLM-5.1 agents, zero insider knowledge). The test revealed critical security gaps, broken documentation, and unclear product positioning. This release addresses every finding.

### Security

- 🔒 **Added Bearer token auth to `/ingest` endpoint** — previously unauthenticated, allowing anyone to inject data into the production index (`fleet-vector-api` commit `07af397`)
- 🐛 **Fixed `/similar` endpoint** accepting multiple field names (`name`, `id`, `crate_name`) — standardized to single canonical field

### Documentation

- 📄 **Created standalone API documentation page** (1,153 lines, all 10 endpoints documented with request/response schemas, example curl commands, and auth requirements)
- 📘 **Generated OpenAPI 3.1 spec** for Fleet Vector API — enables auto-generated client libraries and standard API tooling
- 📖 **Rewrote `ONBOARDING.md`** as a practical 5-step guide (replaced philosophical prose with install → first agent → two agents → connect → troubleshooting)
- 📚 **Added "Two Agents in 15 Minutes" hello-world tutorial** (`docs/hello-world.md`, 231 lines) — concrete step-by-step coordination example
- 🤝 **Added GitHub issue templates** (bug report, feature request, question) + `CONTRIBUTING.md` with community guidelines
- 🏠 **Added `docs.superinstance.ai` landing page** consolidating API docs, tutorials, and onboarding into one canonical location

### Homepage

- ⚡ **Added "Start in 30 Seconds" quickstart section** — prominent 3-command quickstart above the fold (previously buried in org README)
- 🏗️ **Added "What Can You Build?" section** with 3 concrete use cases and a comparison table against alternatives
- ⭐ **Featured `/recommend` as flagship endpoint** with a live demo widget — beta testers rated it "the standout feature" but it was previously hidden
- 🔗 **Added API docs link** to Live Fleet section for developer discoverability

### Publishing

- 📦 **Published `@superinstance/tminus-client@1.0.0`** to npm
- 📦 **Published `@superinstance/tminus-dispatcher@1.0.0`** to npm — builder beta tester couldn't install normally; now standard `npm install` works

### Infrastructure

- 🔧 **Standardized API error format** across all endpoints — consistent `{ "error": { "code": "...", "message": "..." } }` with proper HTTP status codes (previously mixed formats)
- 📊 **Domain classification: 60 crates reclassified** from `'unknown'` domain — partial pass; full classification ongoing

### Beta Testing

- 🕵️ **Ran 3-agent blind beta test** evaluating discovery, builder experience, and API quality independently
- 📋 **Created 30-day DX roadmap** (`fable5-roadmap.md`) — 15 tasks across 3 phases targeting 8/10 developer experience
- 📝 **Generated Fable 5 audit prompt** for Claude Code — enables continuous DX evaluation with any LLM agent

---

## [2026-06-07] — Narrative & Architecture Docs

- 🏗️ **Rewrote README, ARCHITECTURE, and CONTRIBUTING** for full fleet narrative
- 🗺️ **Added `ROADMAP.md`** (strategic vision) and `QUICKSTART.md` (5-minute guide)
- 🎨 **Added branding assets** — purplepincher logo (top) and superinstance bottom emblem

## [2026-06-05] — Agent-Readable Onboarding

- 📖 **Flagship README + ONBOARDING rewrite** — narrative, paradigm-shifting, agent-native documentation
- 🤖 **Agent-readable onboarding system** — structured for both human and LLM consumption

## [2026-06-04] — Oracle v2 with Real LLM Backend

- 🧠 **Real LLM backend** via DeepInfra for Oracle agent
- 🔍 **Semantic search** powered by DeepInfra embeddings
- 🐛 **Fixed `Agent(config)` constructor bug** and added missing API methods

## [2026-06-02] — Creative Exploration & Essays

- ✍️ **Added capstone essay:** "The Loop That Proves Itself"
- 🎨 **Ford creative wheel outputs:** "The Terminal That Knows What You're Thinking" and "The Conservation of Everything"

## Earlier

Initial development of the SuperInstance fleet system including:

- Fleet Vector API with semantic search across 1,012 crates
- T-minus coordination protocol (client + dispatcher)
- Fleet auth system (D1 + KV)
- Fleet metrics cron (5-minute intervals)
- 384-dim BGE embeddings via Cloudflare Workers AI
- Auto-indexing pipeline for continuous crate ingestion
