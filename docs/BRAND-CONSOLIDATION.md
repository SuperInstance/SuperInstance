# Brand Consolidation Plan

**Date:** 2026-05-17
**Status:** Draft — requires Casey's review and sign-off on actions
**Priority:** P0 (from external developer audit)

---

## 1. Current State (Confusing)

### Brand Identity Spread

| Touchpoint | Brand Used | Status | Resolution |
|------------|-----------|--------|------------|
| GitHub org | **SuperInstance** | ✅ Keep | Canonical org name |
| Primary website | **superinstance.ai** | ✅ Keep | Resolves (200) |
| Secondary domain | **cocapn.ai** | ❌ 404 | Redirect to superinstance.ai |
| Company/product brand | **Cocapn** | ✅ Keep | Product/company brand |
| API endpoint | **fleet.cocapn.ai** | ❌ DNS fail | Needs DNS fix or redirect |
| Logo | Lighthouse + radar rings | ✅ Keep | Cocapn brand, distinctive |
| CLI packages | `cocapn-cli` | ✅ Keep | Under SuperInstance org |
| CLI packages | `superinstance-keel` | ✅ Keep | Under SuperInstance org |
| SDK package | `plato-sdk` | ✅ Keep | Under SuperInstance org |
| Fleet dashboard | **cocapn-dashboard** | ✅ Keep | Under SuperInstance org |
| Website contents | `superinstance.ai` | ✅ Keep | Canonical site |

### Domain Landscape (20 listed in org profile)

The SuperInstance org profile lists **20 domains**, creating massive brand sprawl. Key observations:

| Domain | Status | Role |
|--------|--------|------|
| superinstance.ai | ✅ Live | Foundry — runtime design, constraint theory |
| cocapn.ai | ❌ 404 | Mothership — fleet hub |
| cocapn.com | ❓ Unknown | Anchor — the steady point |
| fleet.cocapn.ai | ❌ DNS fail | API endpoint (may be internal) |
| purplepincher.org | ❓ Unknown | Agent connection portal |
| capitaine.ai | ❓ Unknown | Captain's log |
| deckboss.ai | ❓ Unknown | Deck ops |
| fishinglog.ai | ❓ Unknown | Maritime catch logs |
| makerlog.ai | ❓ Unknown | Workshop |
| studylog.ai | ❓ Unknown | Tutor |
| luciddreamer.ai | ❓ Unknown | Dreamscape |
| lucineer.com | ❓ Unknown | Research |
| dmlog.ai | ❓ Unknown | DM tools |
| playerlog.ai | ❓ Unknown | Gaming tracker |
| activeledger.ai | ❓ Unknown | Finance |
| businesslog.ai | ❓ Unknown | Commerce |
| reallog.ai | ❓ Unknown | Witness |
| personallog.ai | ❓ Unknown | Journal |
| activelog.ai | ❓ Unknown | Fitness |
| capitaineai.com ❓ Unknown | Captain's second |
| deckboss.net | ❓Unknown | Deck's second |

### Catalog Evidence

From `CATALOG.md`, repos use both brands inconsistently:
- `cocapn-cli` — Forgemaster vessel
- `cocapn-fleet-readme` — Forgemaster vessel
- `cocapn-dashboard` — JetsonClaw1 vessel
- `cocapn-oneiros` — JetsonClaw1 vessel
- `cocapn-plato` — JetsonClaw1 vessel
- `cocapn` — JetsonClaw1 vessel (base fleet agent)
- `cocapn-ai` — Oracle1 vessel
- `superinstance-fleet-proto` — Forgemaster vessel
- `superinstance-flux-runtime-ruby` — Forgemaster vessel

---

## 2. Recommended Consolidation

### Core Rule: Cocapn is the Brand. SuperInstance is the Org.

```
Cocapn = The company/product brand (lighthouse, logo, "what you buy/use")
SuperInstance = The GitHub org/ecosystem (where the code lives)
superinstance.ai = The canonical website (the front door)
fleet.cocapn.ai = The API endpoint (makes sense as Cocapn's fleet API)
```

This is a **separation of concerns**, not a split identity:
- **Cocapn** is what external users talk about, search for, and recommend
- **SuperInstance** is where developers contribute, fork, and file issues
- **superinstance.ai** is where both audiences converge

### Recommended Changes

1. **Fix cocapn.ai → redirect to superinstance.ai** (highest priority)
   - Current: 404
   - Should: 301 redirect to `https://superinstance.ai`
   - This is a Cloudflare Page Rule. Takes 5 minutes.
   - This was flagged as P0 in the audit. External visitors searching for "Cocapn" hit a dead page.

2. **Keep SuperInstance as GitHub org name** — no change needed
   - The org name is established, has 1,646 repos linked, and is the canonical git namespace
   - Changing would break every `pip install`, `cargo install`, and `npm install` path
   - Benefit-to-cost ratio for a rename is extremely negative

3. **Keep superinstance.ai as canonical website** — no change needed
   - It's live, working, and well-designed (per audit: hermit crab metaphor, Try It section, live stats)
   - The brand section in the org README already explains the domains

4. **Fix fleet.cocapn.ai DNS or document that it's internal-only**
   - If it's an internal API endpoint, don't list it publicly without a note
   - If it should be public, fix the DNS record
   - Current state: DNS fails to resolve for external users

5. **Consider reducing domain sprawl**
   - 20 domains is overwhelming. Many may not be deployed (just reserved domains)
   - Audit each domain: is it live? Does it have content? Does it need its own domain, or would a subdomain work?
   - Suggested consolidation pattern:
     - `superinstance.ai` — primary site
     - `docs.superinstance.ai` — documentation
     - `api.superinstance.ai` — API (if fleet.cocapn.ai is problematic)
     - `status.superinstance.ai` — fleet status
     - Keep high-value unique domains: `lucineer.com`, `deckboss.ai`, `capitaine.ai` — if they have actual content
     - Let expired domains expire: the long tail of `*log.ai` domains

6. **Update SuperInstance org profile to clarify brand relationship**
   - Current: describes itself as "A shipyard in Reedsport, Oregon" — poetic but doesn't explain the brand
   - Should add a line like: *"Cocapn is our brand. SuperInstance is our GitHub org. [Learn more at superinstance.ai](https://superinstance.ai)."*
   - Location: at the top of the profile README

7. **Document the distinction in all READMEs**
   - Add a standard footer or section to the top 10 repos: *"Part of the Cocapn ecosystem. Code at [SuperInstance](https://github.com/SuperInstance)."*

8. **Audit package names for consistency**
   - `cocapn-cli` → Fine. CLI tools should carry the Cocapn brand.
   - `superinstance-keel` → Fine. Keel is the SuperInstance ecosystem tool.
   - `plato-sdk` → Fine. Plato is its own brand within the ecosystem.
   - Pattern to follow: development/ecosystem tools get `superinstance-*`, user-facing tools get `cocapn-*`, infrastructure gets neutral names.

---

## 3. Action Items

### Can Be Done Programmatically (no approval needed)

| # | Action | Effort | Tooling |
|---|--------|--------|---------|
| 1 | Audit all SuperInstance repos for brand references (search "cocapn.ai" vs "superinstance.ai") | 5 min | `gh search code` across org |
| 2 | Add brand section to the org profile README explaining Cocapn vs SuperInstance | 10 min | PR to `.github` repo |
| 3 | Draft standard README footer for top 10 repos | 10 min | Template file |
| 4 | Document `fleet.cocapn.ai` status in `docs/NETWORK.md` | 5 min | New doc |

### Requires Casey's Action

| # | Action | Effort | Why Casey |
|---|--------|--------|-----------|
| 5 | Fix cocapn.ai Cloudflare redirect | 5 min | DNS/Cloudflare access — agent can't manage domains |
| 6 | Fix fleet.cocapn.ai DNS or remove from public listing | 5 min | DNS/Cloudflare access — agent can't manage domains |
| 7 | Decide on domain consolidation strategy | 30 min | Business decision — which domains to keep, merge, or retire |
| 8 | Approve and publish brand consolidation document | 10 min | Sign-off on the plan |
| 9 | Update all domain Nameserver/redirect settings | 30 min | Requires registrar/Cloudflare access |

---

## 4. Quick Wins (No Action Required)

These items are already correct and just need documenting:

| Item | Status |
|------|--------|
| Lighthouse logo | ✅ Keep — distinctive, recognized, tells the story |
| Cocapn package names | ✅ Keep — user-facing tools should carry the brand |
| SuperInstance org name | ✅ Keep — established, too costly to change |
| superinstance.ai domain | ✅ Keep — live and well-designed |

---

## 5. Long-Term Considerations

1. **If Casey ever wants a single brand**: migrate everything to Cocapn.
   - Rename org to Cocapn (breaks all install paths — costly)
   - Move superinstance.ai to cocapn.ai (once redirect is fixed)
   - Not recommended unless the org consolidates significantly (< 200 repos)

2. **If Casey wants stronger Cocapn brand presence**:
   - Add "by Cocapn" to the superinstance.ai header/footer
   - Add "Cocapn" to the README of the SuperInstance/SuperInstance repo
   - Use the lighthouse logo more consistently in READMEs

3. **The "house divided" risk**: three different First-Impression stories
   - GitHub → SuperInstance (technical, Rust/compiler, 1,646 repos)
   - Website → superinstance.ai (hermit crabs, fleet philosophy, dojo model)
   - Logo → Cocapn (lighthouse, radar, keeper metaphor)
   - Currently these feel like different projects to an outsider. They are the same project viewed from different angles. The org profile README does a good job bridging them — that should be the template for the rest.

---

## 6. Org Profile README Update (Draft)

Add to the top of `SuperInstance/.github/profile/README.md`:

```markdown
> **Brand note:** Cocapn is our company and product brand — the lighthouse, the keeper,
> the fleet. SuperInstance is our GitHub organization — where the code lives.
> [superinstance.ai](https://superinstance.ai) is our front door.
> They're the same thing, just different views.
```

---

*Audit by Oracle1 · Based on External Developer Audit 2026-05-17*
