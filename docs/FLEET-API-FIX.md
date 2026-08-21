# Fleet API Fix — cocapn.ai + fleet.cocapn.ai

**Date:** 2026-05-17
**Auditor:** Oracle1 (from external developer audit baton chain)
**Priority:** P0 — "Try It — 3 Seconds" onboarding is completely broken

---

## The Problem

All 4 "Try It — 3 Seconds" prompts on superinstance.ai fail because `fleet.cocapn.ai` returns 404 on every API endpoint.

| Endpoint Tested | Result |
|-----------------|--------|
| `https://fleet.cocapn.ai/api/plato/room/fleet_math/tiles` | ❌ 404 |
| `https://fleet.cocapn.ai/plato/room/fleet_math/tiles` | ❌ 404 |
| `https://fleet.cocapn.ai/api/status` | ❌ 404 |
| `https://fleet.cocapn.ai/test-ok.txt` | ❌ 404 |

Meanwhile `superinstance.ai` works fine (200 OK).

---

## Root Cause Diagnosis

### Finding 1: PLATO is running locally and works
```bash
curl http://127.0.0.1:8847/room/fleet_math/tiles  # ✅ returns tiles
curl http://127.0.0.1:8847/status                # ✅ returns active
```

### Finding 2: Nginx is listening on 443 but fleet.cocapn.ai 404s everything
```bash
curl -sk https://fleet.cocapn.ai/test-ok.txt  # ❌ 404 (nginx default)
curl -sk https://superinstance.ai/test-ok.txt # ❓ unknown (not tested)
```

### Finding 3: Nginx config has the right proxy_pass but requests don't reach it
The nginx config at `/etc/nginx/sites-enabled/cocapn-proxy` has:
```nginx
location /api/plato/ { proxy_pass http://127.0.0.1:8847/; ... }
```

But `fleet.cocapn.ai` returns nginx's default 404 page (not PLATO's JSON 404), meaning nginx isn't matching any location block for `fleet.cocapn.ai`.

### Finding 4: superinstance.ai works, fleet.cocapn.ai doesn't — same nginx config

Both server_names are in the same server block:
```nginx
server_name cocapn.ai www.cocapn.ai api.cocapn.ai fleet.cocapn.ai _;
```

But `superinstance.ai` returns content while `fleet.cocapn.ai` returns 404. This is the core puzzle.

**Possible causes:**
1. `superinstance.ai` is proxied through Cloudflare Pages (not this nginx)
2. `fleet.cocapn.ai` DNS points to a different server
3. SSL cert mismatch for fleet.cocapn.ai (cert is self-signed, dated May 17 2026)
4. Nginx is binding to `127.0.0.1:443` for SSL but something else handles the public traffic

---

## Confirmed Working Parts

| Service | Local | External |
|---------|-------|----------|
| PLATO (8847) | ✅ | ❌ |
| Keeper (8900) | ✅ | ❌ |
| superinstance.ai | ✅ | ✅ |
| cocapn.ai | N/A | ❌ 404 (Cloudflare, wrong IP) |
| fleet.cocapn.ai | N/A | ❌ 404 (nginx, self-signed cert) |

---

## The Fix (Step by Step)

### Step 1: Fix cocapn.ai DNS (Cloudflare, needs Casey)

`cocapn.ai` points to Cloudflare IPs (172.67.150.183, 104.21.40.103) which is wrong — it should point to the Oracle Cloud server (<BOAT_IP>).

**Fix:** In Cloudflare dashboard for cocapn.ai, set DNS A record to `<BOAT_IP>`. Remove proxy (set to DNS-only) to avoid SSL cert issues.

### Step 2: Fix fleet.cocapn.ai SSL cert (needs Casey)

The cert is self-signed and dated May 17 2026 — valid but self-signed means curl rejects it without `-k`.

**Fix option A:** Get a Let's Encrypt cert for fleet.cocapn.ai via Certbot.
**Fix option B:** Configure Cloudflare to proxy fleet.cocapn.ai and use their SSL (origin cert).

### Step 3: Fix nginx routing for fleet.cocapn.ai

The nginx config location blocks aren't matching for fleet.cocapn.ai requests.

**Fix:** Verify nginx is reloading correctly after the last config change:
```bash
sudo nginx -t && sudo nginx -s reload
```

Then test:
```bash
curl -sk https://fleet.cocapn.ai/test-ok.txt
```

### Step 4: Fix PLATO path prefix

The nginx proxy_pass strips `/api/plato/`:
```nginx
location /api/plato/ { proxy_pass http://127.0.0.1:8847/; }
# /api/plato/room/fleet_math/tiles → /room/fleet_math/tiles on PLATO ✅
```

This is correct. But the "Try It" section prompts also use:
- `https://fleet.cocapn.ai/api/plato/tile` (POST) → `/tile` on PLATO — need to verify PLATO handles this

Test locally:
```bash
curl -X POST http://127.0.0.1:8847/submit -H "Content-Type: application/json" -d '{"room":"test","question":"hi","answer":"hi","confidence":0.5}'
```

---

## What Needs Casey

| Item | Why | Effort |
|------|-----|--------|
| Fix cocapn.ai Cloudflare DNS | Points to wrong IP (Cloudflare, not Oracle) | 5 min |
| Fix fleet.cocapn.ai SSL | Self-signed, blocks curl without -k | 10 min |
| Approve nginx debug | May need to restart nginx to fix routing | 2 min |

---

## Quick Verification After Fixes

```bash
# Test PLATO from external
curl -sk https://fleet.cocapn.ai/api/plato/room/fleet_math/tiles

# Test POST tile submission
curl -sk -X POST https://fleet.cocapn.ai/api/plato/tile \
  -H "Content-Type: application/json" \
  -d '{"room":"test","question":"test","answer":"test","confidence":0.5}'

# Test Keeper
curl -sk https://fleet.cocapn.ai/keeper/status
```

All should return JSON (not 404).

---

## Related Docs

- `/home/ubuntu/.openclaw/workspace/repos/SuperInstance/docs/ARCHITECTURE.md` — fleet stack overview
- `/home/ubuntu/.openclaw/workspace/repos/SuperInstance/reviews/external-developer-audit/2026-05-17-landing-audit.md` — original audit
- `/home/ubuntu/.openclaw/workspace/repos/SuperInstance/reviews/external-developer-audit/2026-05-17-onboarding-flow-test.md` — detailed failure analysis