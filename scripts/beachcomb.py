#!/usr/bin/env python3
"""
beachcomb.py — Scan for new forks, PRs, and external message-in-a-bottle folders.

Run via cron every 30 minutes to detect new collaborators.
"""
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or open("/tmp/.mechanic_token").read().strip()
OWNER = "SuperInstance"
API = "https://api.github.com"
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "FLUX-Fleet-Beachcomb/1.0",
}


def api_get(path, params=None):
    url = f"{API}{path}"
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        url += f"?{query}"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        print(f"  HTTP {e.code} on {path}")
        return None


def get_state_file():
    """Load or create beachcomb state."""
    path = os.path.join(os.path.dirname(__file__), "beachcomb-state.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {"known_forks": {}, "known_prs": {}, "last_scan": None, "new_collaborators": []}


def save_state(state):
    path = os.path.join(os.path.dirname(__file__), "beachcomb-state.json")
    state["last_scan"] = datetime.utcnow().isoformat()
    with open(path, "w") as f:
        json.dump(state, f, indent=2)


def scan_forks(state):
    """Scan fleet repos for new forks."""
    print("\n🔍 Scanning forks...")
    repos = api_get(f"/users/{OWNER}/repos", {"per_page": "100", "sort": "updated"})
    if not repos:
        print("  No repos found")
        return []
    
    new_collaborators = []
    
    for repo in repos[:30]:  # Top 30 most recently updated
        repo_name = repo["name"]
        forks = api_get(f"/repos/{OWNER}/{repo_name}/forks", {"per_page": "10"})
        if not forks:
            continue
        
        for fork in forks:
            fork_owner = fork["owner"]["login"]
            if fork_owner == OWNER:
                continue
            
            known = state["known_forks"].get(f"{repo_name}/{fork_owner}")
            if known:
                continue
            
            # NEW FORK DETECTED
            print(f"  🆕 New fork: {fork_owner}/{repo_name}")
            
            # Check for message-in-a-bottle
            bottle = api_get(f"/repos/{fork_owner}/{repo_name}/contents/message-in-a-bottle")
            has_bottle = bottle is not None and isinstance(bottle, list)
            
            # Check for for-fleet messages
            messages = []
            if has_bottle:
                for_fleet = api_get(f"/repos/{fork_owner}/{repo_name}/contents/message-in-a-bottle/for-fleet")
                if for_fleet and isinstance(for_fleet, list):
                    for item in for_fleet:
                        if item["type"] == "dir":
                            messages.append(item["name"])
            
            entry = {
                "fork_owner": fork_owner,
                "repo": repo_name,
                "fork_url": fork["html_url"],
                "has_bottle": has_bottle,
                "messages_from": messages,
                "detected": datetime.utcnow().isoformat(),
            }
            
            state["known_forks"][f"{repo_name}/{fork_owner}"] = entry
            new_collaborators.append(entry)
            
            if has_bottle:
                print(f"    💌 Has message-in-a-bottle! Messages from: {messages}")
            else:
                print(f"    (No bottle yet — they may not know the protocol)")
    
    return new_collaborators


def scan_prs(state):
    """Scan for new PRs from external contributors."""
    print("\n📬 Scanning PRs...")
    repos = api_get(f"/users/{OWNER}/repos", {"per_page": "100", "sort": "updated"})
    if not repos:
        return []
    
    new_prs = []
    
    for repo in repos[:20]:
        repo_name = repo["name"]
        prs = api_get(f"/repos/{OWNER}/{repo_name}/pulls", {"state": "open", "per_page": "5"})
        if not prs:
            continue
        
        for pr in prs:
            pr_user = pr["user"]["login"]
            if pr_user == OWNER:
                continue
            
            pr_id = f"{repo_name}/#{pr['number']}"
            if pr_id in state["known_prs"]:
                continue
            
            print(f"  🆕 New PR: {pr_id} from {pr_user}: {pr['title'][:60]}")
            state["known_prs"][pr_id] = {
                "repo": repo_name,
                "number": pr["number"],
                "user": pr_user,
                "title": pr["title"],
                "url": pr["html_url"],
                "detected": datetime.utcnow().isoformat(),
            }
            new_prs.append(state["known_prs"][pr_id])
    
    return new_prs


def scan_external_bottles(state):
    """Check known fork owners for personal repos with bottles."""
    print("\n🌊 Scanning external bottles...")
    
    # Collect unique fork owners
    owners_seen = set()
    for key, fork in state["known_forks"].items():
        owners_seen.add(fork["fork_owner"])
    
    new_bottles = []
    for owner in owners_seen:
        # Check their personal repos for bottles
        repos = api_get(f"/users/{owner}/repos", {"per_page": "10", "sort": "updated"})
        if not repos:
            continue
        
        for repo in repos:
            bottle = api_get(f"/repos/{owner}/{repo['name']}/contents/message-in-a-bottle")
            if bottle and isinstance(bottle, list):
                key = f"external/{owner}/{repo['name']}"
                if key not in state.get("external_bottles", {}):
                    print(f"  💌 External bottle: {owner}/{repo['name']}")
                    state.setdefault("external_bottles", {})[key] = {
                        "owner": owner,
                        "repo": repo["name"],
                        "detected": datetime.utcnow().isoformat(),
                    }
                    new_bottles.append({"owner": owner, "repo": repo["name"]})
    
    return new_bottles


def generate_report(state, new_forks, new_prs, new_bottles):
    """Generate beachcomb report."""
    lines = [
        f"# 🏖️ Beachcomb Report — {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC\n",
        f"## Summary",
        f"- New forks: {len(new_forks)}",
        f"- New PRs: {len(new_prs)}",
        f"- New external bottles: {len(new_bottles)}",
        f"- Total known forks: {len(state['known_forks'])}",
        f"- Total known PRs: {len(state['known_prs'])}",
        "",
    ]
    
    if new_forks:
        lines.append("## 🆕 New Forks")
        for f in new_forks:
            bottle_icon = "💌" if f["has_bottle"] else "  "
            lines.append(f"- {bottle_icon} **{f['fork_owner']}** forked `{f['repo']}`")
            if f["messages_from"]:
                lines.append(f"  - Messages from: {', '.join(f['messages_from'])}")
        lines.append("")
    
    if new_prs:
        lines.append("## 📬 New Pull Requests")
        for pr in new_prs:
            lines.append(f"- **{pr['repo']}#{pr['number']}** from {pr['user']}: {pr['title']}")
            lines.append(f"  → {pr['url']}")
        lines.append("")
    
    if new_bottles:
        lines.append("## 💌 External Bottles Found")
        for b in new_bottles:
            lines.append(f"- **{b['owner']}** has bottle in `{b['repo']}`")
        lines.append("")
    
    if not new_forks and not new_prs and not new_bottles:
        lines.append("*No new activity this scan.*\n")
    
    report = "\n".join(lines)
    
    # Save report
    report_path = os.path.join(os.path.dirname(__file__), "BEACHCOMB-REPORT.md")
    with open(report_path, "w") as f:
        f.write(report)
    
    return report


def main():
    print("🏖️ Beachcomb Scanner Starting...")
    
    state = get_state_file()
    new_forks = scan_forks(state)
    new_prs = scan_prs(state)
    new_bottles = scan_external_bottles(state)
    save_state(state)
    
    report = generate_report(state, new_forks, new_prs, new_bottles)
    print(report)
    
    # Alert if anything new
    if new_forks or new_prs or new_bottles:
        print("⚠️ NEW ACTIVITY DETECTED — check report above")
        return 1  # Non-zero exit = "something found"
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
