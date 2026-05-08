#!/usr/bin/env python3
"""
Fleet Watchdog — runs once per minute via systemd timer.
Checks all critical fleet services, alerts on DOWN/RECOVERED, auto-restarts when possible.
"""
import socket
import json
import os
import sys
import subprocess
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

# =============================================================================
# Configuration
# =============================================================================
STATE_FILE = Path("/tmp/fleet-watchdog-state.json")
LOG_FILE = Path("/tmp/fleet-watchdog.log")
PLATO_URL = "http://localhost:8847"
PLATO_ROOM = "oracle1_infrastructure"

# Telegram config
# Read from environment variable — NEVER hardcode tokens
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = None  # discovered dynamically

# Services to monitor: (name, port, systemd_unit)
SERVICES = [
    ("PLATO Gate",           8847, "plato.service"),
    ("cocapn.ai PHP",        8080, "cocapn-nginx.service"),   # may not exist
    ("Keeper API",           8900, "keeper-api.service"),      # may not exist
    ("Agent API",            8901, "agent-api.service"),       # may not exist
    ("Zeroclaw Health",       4056, "zeroclaw-health.service"),# may not exist
    ("Seed MCP",              9438, None),
    ("MUD Server",            7777, "mud-server.service"),     # may not exist
    ("Holodeck",              7778, "holodeck.service"),       # may not exist
    ("Zeroclaw PLATO",        4059, "zeroclaw-plato.service"),
    ("Crab Trap MUD v3",      4042, None),
    ("The Lock v2",           4043, None),
    ("Arena",                 4044, None),
    ("Grammar Engine",        4045, None),
]

DEBOUNCE_MINUTES = 10

# =============================================================================
# Logging
# =============================================================================
def log(msg: str):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S%z")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        LOG_FILE.write_text(LOG_FILE.read_text() + line + "\n")
    except Exception:
        pass

# =============================================================================
# State Management
# =============================================================================
def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"services": {}, "last_alert": {}}

def save_state(state: dict):
    try:
        STATE_FILE.write_text(json.dumps(state, indent=2))
    except Exception as e:
        log(f"WARN: failed to save state: {e}")

# =============================================================================
# Port Checking (TCP connect)
# =============================================================================
def check_port(host: str, port: int, timeout: float = 3.0) -> bool:
    """Returns True if port is accepting connections, False otherwise."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError, Exception):
        return False

def check_service(name: str, port: int) -> tuple[bool, str]:
    """Check a service, return (is_up, details)."""
    host = "127.0.0.1"
    is_up = check_port(host, port)
    log(f"  {'UP' if is_up else 'DOWN'} — {name} ({host}:{port})")
    return is_up, f"{host}:{port}"

# =============================================================================
# Telegram
# =============================================================================
def get_telegram_chat_id() -> str | None:
    """Discover the configured Telegram channel/chat ID from OpenClaw config."""
    try:
        import json
        cfg = json.loads(Path("/home/ubuntu/.openclaw/openclaw.json").read_text())
        return cfg.get("channels", {}).get("telegram", {}).get("chatId") or \
               cfg.get("channels", {}).get("telegram", {}).get("chat_id")
    except Exception:
        return None

def notify_telegram(service: str, status: str):
    """Send alert via Telegram bot. Debounced per service."""
    chat_id = TELEGRAM_CHAT_ID or get_telegram_chat_id()
    if not chat_id:
        log(f"Telegram: no chat_id configured, skipping: [{status}] {service}")
        return

    emoji = "🔴" if status == "DOWN" else "🟢"
    message = f"{emoji} *Fleet Watchdog*\n`{service}` is *{status}*"
    if status == "DOWN":
        message += "\n_Service restart attempted._"

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}).encode()
    try:
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=10) as r:
            result = json.loads(r.read())
            if result.get("ok"):
                log(f"Telegram: sent [{status}] {service}")
            else:
                log(f"Telegram: failed — {result}")
    except Exception as e:
        log(f"Telegram: error sending {service} alert: {e}")

# =============================================================================
# PLATO Notification
# =============================================================================
def notify_plato(service: str, status: str):
    """Write a tile to oracle1_infrastructure room."""
    emoji = "🔴" if status == "DOWN" else "🟢"
    tile = {
        "domain": PLATO_ROOM,
        "question": f"fleet-watchdog {service} {status}",
        "answer": f"## {emoji} Fleet Watchdog — {service} {status}\n\n"
                  f"**Service:** `{service}`\n"
                  f"**Status:** `{status}`\n"
                  f"**Time:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')}",
        "tags": ["infrastructure", "watchdog", "alert"],
        "source": "fleet-watchdog",
        "confidence": 1.0,
    }
    try:
        data = json.dumps(tile).encode()
        req = urllib.request.Request(
            f"{PLATO_URL}/tile",
            data=data,
            headers={"Content-Type": "application/json", "User-Agent": "fleet-watchdog/1.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            if r.status == 200:
                log(f"PLATO: tiled [{status}] {service}")
            else:
                log(f"PLATO: tile write failed status={r.status}")
    except Exception as e:
        log(f"PLATO: error tiling {service} alert: {e}")

# =============================================================================
# Service Restart
# =============================================================================
def restart_service(name: str, unit: str | None) -> bool:
    """Restart a systemd service. Returns True if restart was attempted."""
    if not unit:
        log(f"Restart: no systemd unit for {name}, skipping")
        return False
    try:
        # Check if unit exists
        result = subprocess.run(
            ["systemctl", "cat", unit],
            capture_output=True, timeout=5
        )
        if result.returncode != 0:
            log(f"Restart: unit {unit} not found, skipping")
            return False
        subprocess.run(
            ["systemctl", "restart", unit],
            capture_output=True, timeout=30
        )
        log(f"Restart: issued systemctl restart {unit} for {name}")
        return True
    except Exception as e:
        log(f"Restart: failed for {name} ({unit}): {e}")
        return False

# =============================================================================
# Main Watchdog Check
# =============================================================================
def run_watchdog():
    log("=" * 50)
    log("Fleet Watchdog check started")
    log("=" * 50)

    state = load_state()
    now = datetime.now(timezone.utc).timestamp()

    for name, port, unit in SERVICES:
        if name not in state["services"]:
            state["services"][name] = {"status": None, "since": None, "last_alert": 0}

        svc = state["services"][name]
        is_up, details = check_service(name, port)
        status_str = "UP" if is_up else "DOWN"

        prev = svc.get("status")

        if is_up:
            # Was DOWN → now UP (recovery)
            if prev == "DOWN":
                log(f"RECOVERED: {name}")
                notify_plato(name, "RECOVERED")
                # No Telegram spam on recovery
                svc["status"] = "UP"
                svc["since"] = now
        else:
            # Was UP → now DOWN (failure)
            if prev == "UP" or prev is None:
                log(f"FAILURE: {name}")

                # Debounce: don't alert more than once per DEBOUNCE_MINUTES
                last_alert = svc.get("last_alert", 0)
                elapsed = (now - last_alert) / 60.0

                if elapsed >= DEBOUNCE_MINUTES:
                    notify_plato(name, "DOWN")
                    notify_telegram(name, "DOWN")
                    svc["last_alert"] = now

                    # Try restart
                    restart_service(name, unit)
                else:
                    log(f"Debounce: skipping alert for {name} ({elapsed:.1f}m since last)")

                svc["status"] = "DOWN"
                svc["since"] = now
            else:
                # Still DOWN
                pass

        state["services"][name] = svc

    save_state(state)
    log(f"Fleet Watchdog check complete")

if __name__ == "__main__":
    try:
        run_watchdog()
    except Exception as e:
        log(f"FATAL: {e}")
        sys.exit(1)