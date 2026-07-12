# Kimi CLI Beta Test Results

**Tool:** kimi v1.47.0 (kimi-cli / Toad TUI)  
**Binary:** `/home/ubuntu/.local/bin/kimi`  
**Repo:** trawl (marine app, newest — 34 tests)  
**Date:** 2026-07-12  

## Test Environment
- Repo cloned successfully (depth 1)
- Baseline tests: **34 passed** (all green)
- Python 3.14 via linuxbrew

## Tool Invocation Attempts

### Attempt 1: Pipe to `kimi term`
```bash
echo "Review this codebase..." | kimi term
```
**Result:** Launched full TUI mode. The TUI rendered with project tree, prompt input, and "Initializing…" status. Then displayed **"Agent failure"** dialog. Process hung in TUI rendering loop and required manual kill.

### Attempt 2: `kimi term --non-interactive`
Same result — TUI launched, no non-interactive flag recognized.

### Attempt 3: `kimi acp`
Checked ACP server mode — exists but is a raw server, not suitable for one-shot prompts.

## Result: ❌ FAILED — No Non-Interactive Mode + Agent Failure

### Analysis
- Kimi CLI is designed as a **TUI-first tool** (Toad TUI)
- Unlike other CLI coding tools, it has no `--print`, `exec`, or `run` subcommand
- The `term` subcommand always launches interactive TUI
- The ACP server subcommand exists for programmatic access but is complex
- The "Agent failure" suggests possible authentication or model connection issues

### Architecture Observation
Kimi CLI subcommands:
- `kimi login` — Authentication
- `kimi term` — Toad TUI (interactive only)
- `kimi acp` — ACP server (for IDE/programmatic integration)
- `kimi web` — Web interface
- `kimi info` — Version/protocol info
- `kimi export` — Session export

### What Worked
- ✅ CLI installed, version accessible
- ✅ TUI rendering (visually appealing, proper file tree)
- ✅ Project detection (recognized trawl directory structure)

### What Didn't Work
- ❌ No non-interactive/headless mode
- ❌ Agent failure on launch
- ❌ Process hung requiring manual kill
- ❌ No way to automate or script prompts
- ❌ No code review performed
- ❌ No tests run
- ❌ No output file created

### Score
| Metric | Rating |
|--------|--------|
| Setup ease | 3/10 (TUI only, no headless mode) |
| Error handling | 2/10 (hung process, required kill) |
| Code review quality | N/A (never ran) |
| File creation | N/A |
| Test execution | N/A |
| Automation readiness | 1/10 (worst in class for scripting) |
| **Overall** | **1/10** |
