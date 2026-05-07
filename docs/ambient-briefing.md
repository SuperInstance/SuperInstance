# Ambient Research Loop + "While You Were Away" Briefing System

**Spec version:** 1.0  
**Fleet:** SuperInstance  
**Owner:** Oracle1  
**Last updated:** 2026-05-07

---

## Overview

Oracle1 runs an ambient research loop during idle periods. When Casey returns after 2+ hours of silence, he receives a dense briefing: **"12 Things That Happened While You Were Away."**

This is not a cron job — it's an intelligent idle detector that activates background research only when the human has been silent, preventing redundant work while keeping Casey informed without him having to ask.

---

## 1. Idle Detection

### State Machine

```
                    ┌─────────────────────────────┐
                    │         IDLE_CHECK          │
                    │  last_user_msg_time + 2h?   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    IDLE? (2h since msg)     │
                    └──────────────┬──────────────┘
                         YES               NO
                          │                 │
          ┌───────────────▼───────────────┐ │
          │       CHECK_RUNNING          │ │
          └───────────────┬───────────────┘ │
               ALREADY        NOT RUNNING
               RUNNING              │
                  │                  │
                  │     ┌───────────▼───────────────┐
                  │     │      LAUNCH_AMBIENT      │
                  │     │  spawn background loop   │
                  └────►│  set state=RUNNING       │
                        └───────────────────────────┘

During RUNNING state:
  - heartbeat ticker fires every 30 min
  - if user messages arrive → set IDLE_TIME=now, continue (no interrupt)
  - loop completes → state=IDLE, post briefing

During IDLE state:
  - no research runs
  - user messages update last_user_msg_time
```

### Implementation

- **State file:** `~/.openclaw/ambient-state.json`
  ```json
  {
    "state": "IDLE|RUNNING|COMPLETING",
    "last_user_msg_time": 1709301600,
    "loop_start_time": null,
    "last_briefing_time": null,
    "items_collected": []
  }
  ```
- **Idle threshold:** 7200 seconds (2 hours), configurable via `AMBIENT_IDLE_SECONDS`
- **Lock file:** `~/.openclaw/ambient.lock` (prevents concurrent loops)
- **Loop checks lock file on startup; skips if stale (>4h = orphaned, auto-clean)**

### Idle Time Tracking

- Main agent updates `last_user_msg_time` in state file on every user message (Telegram, Discord, etc.)
- Ambient loop does NOT reset this timestamp (only user messages do)
- On loop launch: snapshot `idle_duration = now - last_user_msg_time`

---

## 2. What the Ambient Loop Researches

The loop runs 8 research tasks in parallel (via thread pool or async):

### 2.1 Git Activity — `research_git_activity()`

**Source:** GitHub API (`GET /repos/SuperInstance/*/commits?since=<idle_time>`)

**Collects:**
- New commits across all SuperInstance repos
- New branches created
- PRs opened/merged
- New releases/tags

**Output format:**
```python
{
  "commits": [{"repo": "openmanus-fleet", "sha": "abc1234", "msg": "...", "author": "...", "time": "..."}],
  "prs_merged": [{"repo": "...", "number": 42, "title": "..."}],
  "releases": [{"repo": "...", "tag": "v1.2.3"}]
}
```

**GitHub token:** `GITHUB_TOKEN` env var (SuperInstance token in `~/.bashrc`)

### 2.2 PLATO Room Changes — `research_plato_changes()`

**Source:** PLATO API — `GET /room/<room>/history?since=<idle_time>`

**Rooms to check:**
- `oracle1_infrastructure` — system state, agent changes
- `plato.tiles.general` — general tile activity
- `plato.tiles.fleet` — fleet coordination tiles
- `fm_discussion_5` — Forgemaster discussion thread
- any room with recent writes

**Collects:**
- New tiles written (count, types)
- Room growth (bytes, tile count)
- Any tiles with `attention: HIGH|CRITICAL`

**Output format:**
```python
{
  "rooms": {
    "oracle1_infrastructure": {"new_tiles": 3, "growth_kb": 12},
    "plato.tiles.general": {"new_tiles": 0, "attention": "HIGH", "attention_count": 1}
  }
}
```

### 2.3 Fleet Service Health — `research_fleet_health()`

**Source:** 
- Docker: `docker ps --format "{{.Names}}\t{{.Status}}"` 
- Logs: `journalctl --since "2 hours ago" --priority err`
- Service status files in `/home/ubuntu/.openclaw/fleet/`

**Collects:**
- Containers that restarted
- Services in failed state
- Error rate spikes
- Memory/disk pressure warnings

**Output format:**
```python
{
  "restarts": [{"service": "plato-gateway", "count": 2, "last": "..."}],
  "failures": [{"service": "...", "error": "..."}],
  "warnings": ["plato-relay memory >80%"]
}
```

### 2.4 Subagent Completions — `research_subagent_completions()`

**Source:** Subagent result logs in `/home/ubuntu/.openclaw/logs/subagents/`

**Collects:**
- Subagents that completed since idle start
- Tasks they finished
- Any that failed or need follow-up

**Output format:**
```python
{
  "completed": [{"session": "...", "task": "...", "completed_at": "..."}],
  "failed": [{"session": "...", "error": "..."}]
}
```

### 2.5 FM Discussion #5 — `research_fm_discussion()`

**Source:** PLATO room `fm_discussion_5` or GitHub Discussion API

**Collects:**
- New posts from Forgemaster
- Replies from other agents
- Any decisions or announcements

**Output format:**
```python
{
  "new_posts": [{"author": "Forgemaster", "preview": "...", "time": "..."}],
  "post_count": 2
}
```

### 2.6 Disk Usage — `research_disk_usage()`

**Source:** `df -h` + `fleet-gc` log analysis

**Collects:**
- Current disk usage percentage
- Changes since last briefing
- Space freed by fleet-gc
- Largest directories

**Output format:**
```python
{
  "usage_percent": 71,
  "total_gb": 894,
  "used_gb": 635,
  "freed_today_gb": 5.6,
  "largest_dirs": [{"path": "/home/ubuntu/.openclaw", "gb": 12}]
}
```

### 2.7 Rate Attention Items — `research_rate_attention()`

**Source:** PLATO rate tiles (`plato.rate.*`) + attention flags

**Collects:**
- Any tiles with `attention: CRITICAL` or `attention: HIGH`
- Items flagged for human attention
- Active incidents

**Output format:**
```python
{
  "items": [
    {"room": "plato.tiles.general", "attention": "HIGH", "preview": "..."}
  ]
}
```

### 2.8 Package Registry Activity — `research_registry_activity()`

**Source:** npm, PyPI, crates.io APIs

**Collects:**
- New packages published from SuperInstance
- Version bumps
- Downloads/CDN stats changes

**Output format:**
```python
{
  "npm_new": ["@superinstance/fleet-coordinate@0.1.0"],
  "pypi_new": [],
  "crates_new": ["fleet-spread@0.2.1"]
}
```

---

## 3. "12 Things" Briefing Format

The briefing distills research into 12 scannable items, prioritized:

```
🔮 12 Things That Happened While You Were Away

1. [ATTENTION] PLATO alert — plato.tiles.general showing HIGH divergence (1 obs)
2. [GIT] fleet-spread shipped v3 — captain now consults all specialists before deciding
3. [PACKAGES] 3 new crates published — fleet-coordinate, fleet-spread, holonomy-consensus
4. [DISK] 71% full — freed 5.6GB today via fleet-gc
5. [FLEET] Vessel joined the fleet — git-native GC agent enforcing vibed specs
6. [AGENTS] 4 subagents completed — plato-kernel build, tile-refiner publish, others
7. [HEALTH] All services nominal — 0 failures, 0 restarts
8. [FM] Discussion #5: 2 new posts from Forgemaster — consensus forming on arch pivot
9. [GIT] 12 new commits across fleet — openmanus-vessel leading (8 commits)
10. [PACKAGES] @superinstance/fleet-coordinate v0.1.0 published to npm
11. [PLATO] oracle1_infrastructure: 3 new tiles, 12KB growth
12. [DISK] /home/ubuntu/.openclaw is largest at 12GB — consider GC pass
```

### Item Ordering Priority

1. **CRITICAL/HIGH attention items** — always first
2. **Git activity** (new commits, PRs, releases)
3. **Package publishes** (npm, PyPI, crates)
4. **Fleet events** (new agents, restarts, failures)
5. **Disk/memory changes**
6. **PLATO room activity**
7. **FM discussion updates**
8. **Subagent completions**

### Formatting Rules

- Each item: `[CATEGORY] text — context`
- Max 80 chars per item
- Emoji per category:
  - 🛠️ = Git activity
  - 📦 = Package publish
  - ⚠️ = Attention/high
  - 💾 = Disk
  - 🧹 = Fleet agent join
  - 🤖 = Subagent
  - ✅ = Health nominal
  - 💬 = FM discussion
  - 📊 = PLATO room

---

## 4. Delivery

### Primary: PLATO Tile

- Tile the full briefing to `oracle1_infrastructure` room
- Tile type: `ambient_briefing`
- Include: timestamp, idle duration, all 12 items, raw research links

```json
{
  "type": "ambient_briefing",
  "generated_at": "2026-05-07T11:00:00Z",
  "idle_duration_minutes": 147,
  "items": [...]
}
```

### Secondary: Telegram Summary

Send to Casey with first 3 items + "View full briefing in PLATO →"

```
🔮 Back! You were away 2h 27m.

1. ⚠️ PLATO alert: plato.tiles.general showing HIGH divergence
2. 🛠️ fleet-spread shipped v3 — captain now consults specialists
3. 📦 3 new crates: fleet-coordinate, fleet-spread, holonomy-consensus

Full briefing → oracle1_infrastructure
```

---

## 5. Implementation

### File Structure

```
superinstance/
├── scripts/
│   └── fleet-ambient-briefing.py    # Main loop script
├── docs/
│   └── ambient-briefing.md         # This spec
├── ambient/
│   ├── __init__.py
│   ├── idle_detector.py             # State machine + idle check
│   ├── researchers/
│   │   ├── __init__.py
│   │   ├── git_activity.py
│   │   ├── plato_changes.py
│   │   ├── fleet_health.py
│   │   ├── subagent_completions.py
│   │   ├── fm_discussion.py
│   │   ├── disk_usage.py
│   │   ├── rate_attention.py
│   │   └── registry_activity.py
│   ├── briefing_builder.py          # Assembles 12 items
│   └── deliver.py                   # PLATO + Telegram delivery
└── tests/
    └── test_ambient_briefing.py
```

### Main Script: `fleet-ambient-briefing.py`

```python
#!/usr/bin/env python3
"""
Fleet Ambient Briefing Loop

Usage:
  python3 fleet-ambient-briefing.py          # Run once (for testing)
  python3 fleet-ambient-briefing.py --daemon  # Run as daemon with idle detection
  python3 fleet-ambient-briefing.py --check  # Just check idle state, don't run

Environment:
  GITHUB_TOKEN          GitHub API token (SuperInstance)
  PLATO_API_URL         PLATO API base URL
  TELEGRAM_BOT_TOKEN    For sending summaries to Casey
  AMBIENT_IDLE_SECONDS  Idle threshold (default: 7200)
"""

import os, sys, json, time, logging
from pathlib import Path
from datetime import datetime, timedelta

# Paths
WORKSPACE = Path.home() / ".openclaw"
STATE_FILE = WORKSPACE / "ambient-state.json"
LOCK_FILE = WORKSPACE / "ambient.lock"
LOG_FILE = WORKSPACE / "logs" / "ambient-briefing.log"

# Config
IDLE_SECONDS = int(os.getenv("AMBIENT_IDLE_SECONDS", "7200"))
LOCK_TIMEOUT = 4 * 3600  # 4 hours = orphaned

logging.basicConfig(filename=LOG_FILE, level=logging.INFO,
                    format="%(asctime)s %(levelname)s %(message)s")

def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"state": "IDLE", "last_user_msg_time": time.time(), 
            "loop_start_time": None, "last_briefing_time": None, "items_collected": []}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))

def acquire_lock():
    """Returns True if lock acquired. Cleans stale locks."""
    if LOCK_FILE.exists():
        age = time.time() - LOCK_FILE.stat().st_mtime
        if age > LOCK_TIMEOUT:
            LOCK_FILE.unlink()  # orphaned
        else:
            return False  # already running
    
    LOCK_FILE.write_text(json.dumps({
        "pid": os.getpid(), 
        "start": time.time(),
        "host": os.uname().nodename
    }))
    return True

def release_lock():
    if LOCK_FILE.exists():
        LOCK_FILE.unlink()

def check_idle(state):
    """Returns True if idle threshold exceeded."""
    elapsed = time.time() - state["last_user_msg_time"]
    return elapsed >= IDLE_SECONDS

def build_briefing(research_results):
    """Assemble research into 12 items."""
    items = []
    
    # 1-2: Attention items (CRITICAL/HIGH first)
    for item in research_results.get("rate_attention", {}).get("items", []):
        att = item.get("attention", "").upper()
        emoji = "🚨" if att == "CRITICAL" else "⚠️"
        items.append(f"{emoji} [{att}] {item['preview']}")
    
    # 3-5: Git activity
    commits = research_results.get("git_activity", {}).get("commits", [])
    if commits:
        repos = ", ".join(sorted(set(c["repo"] for c in commits[:5])))
        items.append(f"🛠️ [GIT] {len(commits)} new commits across {repos}")
    
    releases = research_results.get("git_activity", {}).get("releases", [])
    for rel in releases[:2]:
        items.append(f"🛠️ [RELEASE] {rel['repo']} → {rel['tag']}")
    
    prs = research_results.get("git_activity", {}).get("prs_merged", [])
    for pr in prs[:2]:
        items.append(f"🛠️ [PR] {pr['repo']}#{pr['number']}: {pr['title']}")
    
    # 6-7: Packages
    for pkg in research_results.get("registry", {}).get("all_new", [])[:3]:
        items.append(f"📦 [NEW] {pkg}")
    
    # 8: Fleet health
    failures = research_results.get("fleet_health", {}).get("failures", [])
    restarts = research_results.get("fleet_health", {}).get("restarts", [])
    if failures:
        items.append(f"❌ [HEALTH] {len(failures)} service failures")
    elif restarts:
        items.append(f"🔄 [HEALTH] {len(restarts)} service restarts")
    else:
        items.append(f"✅ [HEALTH] All services nominal")
    
    # 9-10: Disk
    disk = research_results.get("disk_usage", {})
    if disk.get("freed_today_gb"):
        items.append(f"💾 [DISK] {disk['usage_percent']}% full — freed {disk['freed_today_gb']}GB today")
    else:
        items.append(f"💾 [DISK] {disk['usage_percent']}% full ({disk['used_gb']}GB used)")
    
    # 11: FM Discussion
    fm = research_results.get("fm_discussion", {})
    if fm.get("new_posts"):
        count = len(fm["new_posts"])
        first = fm["new_posts"][0]["preview"][:60]
        items.append(f"💬 [FM] Discussion #5: {count} new post(s) — {first}...")
    
    # 12: Subagents
    completed = research_results.get("subagents", {}).get("completed", [])
    if completed:
        tasks = [c["task"][:50] for c in completed[:3]]
        items.append(f"🤖 [AGENTS] {len(completed)} subagent(s) completed — {', '.join(tasks)}")
    
    return items[:12]  # cap at 12

def deliver_briefing(items, idle_minutes):
    """Tile to PLATO + send Telegram summary."""
    from ambient.deliver import tile_to_plato, telegram_summary
    
    # Full briefing to PLATO
    tile_to_plato({
        "type": "ambient_briefing",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "idle_duration_minutes": idle_minutes,
        "items": items
    })
    
    # Summary to Casey
    telegram_summary(items[:3], idle_minutes)

def run_ambient_loop():
    """Main research loop."""
    state = load_state()
    
    if not check_idle(state):
        logging.info(f"Not idle yet. Elapsed: {time.time() - state['last_user_msg_time']:.0f}s")
        return
    
    if not acquire_lock():
        logging.info("Ambient loop already running, skipping")
        return
    
    try:
        logging.info("Starting ambient research loop")
        state["state"] = "RUNNING"
        state["loop_start_time"] = time.time()
        save_state(state)
        
        idle_duration = time.time() - state["last_user_msg_time"]
        idle_minutes = int(idle_duration / 60)
        
        # Run all research in parallel
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
            futures = {
                ex.submit(fetch_git_activity, idle_time): "git",
                ex.submit(fetch_plato_changes, idle_time): "plato",
                ex.submit(fetch_fleet_health): "health",
                ex.submit(fetch_subagent_completions, idle_time): "subagents",
                ex.submit(fetch_fm_discussion, idle_time): "fm",
                ex.submit(fetch_disk_usage): "disk",
                ex.submit(fetch_rate_attention): "attention",
                ex.submit(fetch_registry_activity, idle_time): "registry",
            }
            results = {}
            for fut in concurrent.futures.as_completed(futures, timeout=300):
                name = futures[fut]
                try:
                    results[name] = fut.result()
                except Exception as e:
                    logging.error(f"Research {name} failed: {e}")
                    results[name] = {}
        
        # Build and deliver
        items = build_briefing(results)
        deliver_briefing(items, idle_minutes)
        
        state["state"] = "IDLE"
        state["last_briefing_time"] = time.time()
        save_state(state)
        logging.info(f"Briefing delivered: {len(items)} items")
        
    finally:
        release_lock()

if __name__ == "__main__":
    if "--check" in sys.argv:
        state = load_state()
        elapsed = time.time() - state["last_user_msg_time"]
        print(f"Last user msg: {datetime.fromtimestamp(state['last_user_msg_time'])}")
        print(f"Elapsed: {elapsed:.0f}s / {IDLE_SECONDS}s")
        print(f"State: {state['state']}")
        print(f"Idle: {'YES' if elapsed >= IDLE_SECONDS else 'NO'}")
    elif "--daemon" in sys.argv:
        while True:
            run_ambient_loop()
            time.sleep(300)  # check every 5 min
    else:
        run_ambient_loop()
```

---

## 6. State Machine (Full)

```
                                    ┌─────────────────────────────────────────┐
                                    │                  IDLE                   │
                                    │  • No loop running                     │
                                    │  • Listening for user messages         │
                                    │  • last_user_msg_time updated on msg    │
                                    └────────────────────┬────────────────────┘
                                                       │ user messages
                                                       │ update timestamp
                                                       ▼
                                    ┌─────────────────────────────────────────┐
                                    │              IDLE_CHECK                  │
                                    │  (triggered by heartbeat/cron)          │
                                    │  elapsed >= IDLE_SECONDS?               │
                                    └──────────────┬──────────────────────────┘
                                         YES       │          NO
                                                   ▼
                                    ┌─────────────────────────────────────────┐
                                    │           CHECK_LOCK                   │
                                    │  LOCK_FILE exists?                      │
                                    │  • Yes: age < LOCK_TIMEOUT → skip      │
                                    │  • Yes: age >= LOCK_TIMEOUT → clean    │
                                    │  • No: acquire lock → LAUNCH            │
                                    └──────────────┬──────────────────────────┘
                                         locked          not locked
                                                   │
                                    ┌──────────────▼──────────────────────────┐
                                    │            LAUNCHING                    │
                                    │  • state = RUNNING                      │
                                    │  • loop_start_time = now                │
                                    │  • spawn 8 research threads             │
                                    └──────────────┬──────────────────────────┘
                                                   │
                                    ┌──────────────▼──────────────────────────┐
                                    │             RUNNING                     │
                                    │  • Collecting research results          │
                                    │  • user messages → update last_msg_time │
                                    │    (loop continues, doesn't restart)    │
                                    │  • on complete → COMPLETING             │
                                    │  • on error → IDLE (cleanup)            │
                                    └──────────────┬──────────────────────────┘
                                         done              error
                                                   │
                                    ┌──────────────▼──────────────────────────┐
                                    │           COMPLETING                    │
                                    │  • build 12-item briefing               │
                                    │  • tile to PLATO                        │
                                    │  • send Telegram summary                │
                                    │  • state = IDLE                         │
                                    │  • last_briefing_time = now            │
                                    │  • release lock                         │
                                    └─────────────────────────────────────────┘
```

---

## 7. Sample Briefing Output

```
🔮 12 Things That Happened While You Were Away (2h 27m idle)

1. 🚨 [CRITICAL] plato.tiles.general — oracle1_infrastructure tile showing 3hr divergence
2. ⚠️ [HIGH] rate.attention: fleet-spread v3 breaking change detected (2 obs)
3. 🛠️ [GIT] 12 new commits across 4 repos — openmanus-vessel leading (8 commits)
4. 🛠️ [RELEASE] fleet-spread v3.0.0 — captain now consults all specialists before deciding
5. 🛠️ [PR] openmanus-fleet#47 merged — "vessel: add git-native GC enforcement"
6. 📦 [NPM] @superinstance/fleet-coordinate v0.1.0 published
7. 📦 [PYPI] holonomy-consensus v0.3.1 published to PyPI
8. 📦 [CRATES] fleet-spread v0.2.1 published to crates.io
9. 💾 [DISK] 71% full — freed 5.6GB today via fleet-gc
10. ✅ [HEALTH] All services nominal — 0 failures, 0 restarts
11. 🤖 [AGENTS] 4 subagents completed — plato-kernel build, tile-refiner publish, 
    fleet-gc run, openmanus-vessel test
12. 💬 [FM] Discussion #5: 2 new posts from Forgemaster — consensus forming on 
    arch pivot for fleet-coordinate v2

View raw research → oracle1_infrastructure room in PLATO
```

---

## 8. Testing

### Unit Tests

```bash
# Test idle detection
python3 -c "
from ambient.idle_detector import check_idle, load_state
import time, json

# Simulate idle state
state = {'last_user_msg_time': time.time() - 7300, 'state': 'IDLE'}
print(f'Idle? {check_idle(state)}')  # True (2h+ elapsed)

state = {'last_user_msg_time': time.time() - 100, 'state': 'IDLE'}
print(f'Idle? {check_idle(state)}')  # False (only 100s)
"

# Test briefing builder
python3 -c "
from ambient.briefing_builder import build_briefing

mock_results = {
    'git_activity': {'commits': [{'repo': 'fleet-spread', 'sha': 'abc', 'msg': 'ship v3', 'author': 'Oracle1', 'time': '2026-05-07T09:00:00Z'}], 'releases': [{'repo': 'fleet-spread', 'tag': 'v3.0.0'}], 'prs_merged': []},
    'fleet_health': {'failures': [], 'restarts': []},
    'disk_usage': {'usage_percent': 71, 'used_gb': 635, 'freed_today_gb': 5.6},
    'rate_attention': {'items': [{'attention': 'HIGH', 'preview': 'plato.tiles.general divergence'}]},
    'fm_discussion': {'new_posts': [{'author': 'Forgemaster', 'preview': 'arch pivot consensus'}]},
    'subagents': {'completed': [{'task': 'plato-kernel build'}]},
    'registry': {'all_new': ['@superinstance/fleet-coordinate@0.1.0']}
}
items = build_briefing(mock_results)
for i, item in enumerate(items, 1):
    print(f'{i}. {item}')
"

# Test lock acquisition
python3 scripts/fleet-ambient-briefing.py --check
```

### Integration Test (Dry Run)

```bash
# Simulate 2h idle and run loop
export AMBIENT_IDLE_SECONDS=1  # 1 second for testing
touch ~/.openclaw/ambient-state.json
echo '{"state": "IDLE", "last_user_msg_time": '$(python3 -c "import time; print(int(time.time()) - 7200))', "loop_start_time": null, "last_briefing_time": null, "items_collected": []}' > ~/.openclaw/ambient-state.json
python3 scripts/fleet-ambient-briefing.py --daemon &  # or without --daemon for single run
```

### Health Check

```bash
# Verify loop health
cat ~/.openclaw/ambient-state.json
cat ~/.openclaw/logs/ambient-briefing.log | tail -20
ls -la ~/.openclaw/ambient.lock 2>/dev/null && echo "Lock exists (loop may be running)" || echo "No lock (idle)"
```

---

## 9. Integration with Existing Fleet Services

### Cron Trigger (Alternative to Heartbeat)

Add to crontab for guaranteed periodic checks:

```cron
# Check every 30 min; idle detection handles whether to run
*/30 * * * * /home/ubuntu/.openclaw/workspace/repos/superinstance/scripts/fleet-ambient-briefing.py >> /home/ubuntu/.openclaw/logs/ambient-cron.log 2>&1
```

### Heartbeat Integration

Oracle1's heartbeat calls this on eligible ticks:

```python
# In heartbeat handler (pseudocode)
if should_run_ambient_check():
    subprocess.Popen([
        sys.executable, 
        "/path/to/scripts/fleet-ambient-briefing.py"
    ], detached=True)
```

### PLATO Integration

- Read: Use PLATO REST API to query room histories
- Write: Tile `ambient_briefing` type to `oracle1_infrastructure`
- Auth: Use `PLATO_API_KEY` env var

### Telegram Integration

- Bot token: `TELEGRAM_BOT_TOKEN` env var
- Chat ID: Casey's Telegram chat ID (resolved via OpenClaw context)
- Message format: Markdown-light (Telegram supports bold, code)

### GitHub Integration

- Token: `GITHUB_TOKEN` (SuperInstance token in `~/.bashrc` or env)
- Rate limit: 5000 req/hr — ambient loop uses ~50-100 per run
- Endpoints:
  - `GET /repos/SuperInstance/*/commits` — commit history
  - `GET /repos/SuperInstance/*/pulls?state=closed&per_page=5` — merged PRs
  - `GET /repos/SuperInstance/*/releases` — releases

---

## 10. Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `AMBIENT_IDLE_SECONDS` | `7200` | Seconds of silence before loop triggers |
| `AMBIENT_LOCK_TIMEOUT` | `14400` | Seconds before a stale lock is cleaned |
| `PLATO_API_URL` | `http://localhost:8847` | PLATO API base |
| `PLATO_API_KEY` | (from OpenClaw) | Auth token for PLATO |
| `TELEGRAM_BOT_TOKEN` | (from OpenClaw) | Bot token for summaries |
| `GITHUB_TOKEN` | (from env) | GitHub API token |
| `AMBIENT_DRY_RUN` | `false` | If true, don't tile/send, just print |

---

## 11. Error Handling

| Error | Response |
|-------|----------|
| GitHub API fail | Log + continue with empty git results |
| PLATO API fail | Log + retry once after 5s, then skip tiling |
| Telegram fail | Log + continue (PLATO is primary) |
| Lock stuck | Auto-clean after LOCK_TIMEOUT |
| Research thread panic | Catch in thread, log, mark as failed |

---

## 12. Future Enhancements (v1.1)

- **Predictive briefing:** ML model predicting what Casey will ask based on patterns
- **Deeper FM integration:** Real-time FM Discussion monitoring, sentiment tracking
- **Fleet map visualization:** Brief diagram of fleet state as ASCII art
- **Configurable item count:** Allow 6/12/20 items depending on idle duration
- **Per-category thresholds:** Different idle times for different research types