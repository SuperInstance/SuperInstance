#!/usr/bin/env python3
"""canon-lint — the fleet canon's consistency gate (Layer C).

Checks, in the doctrine's words: consistency is a first-class problem.

  1. schema        every CANON.md parses; all required fields; canon == 1;
                   state enum; verified is a real date; name == repo name.
  2. edges         feeds/owed_by acknowledged on BOTH sides when the other
                   side has a CANON.md (A.feeds B  =>  B.owed_by A).
  3. staleness     verified > 30d ago + pushes since => warning;
                   > 90d on Tier-1 => failure. (remote mode only)
  4. coverage      Tier-1 repos without CANON.md => warning, or failure
                   with --enforce-coverage (flip when coverage hits 100%).

Usage:
  python3 fleet-canon/lint.py                 # remote, over tier1.txt
  python3 fleet-canon/lint.py --dir fixtures  # local dirs {dir}/{repo}/CANON.md
  python3 fleet-canon/lint.py --enforce-coverage

Stdlib only. GITHUB_TOKEN used if set (55+ API calls otherwise squeak under
the anonymous 60/hr budget; the token makes it relaxed).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIER1 = os.path.join(ROOT, "fleet-canon", "tier1.txt")

REQUIRED = [
    "canon", "name", "mission", "state", "family", "vessel",
    "born_from", "feeds", "owed_by", "canonical_docs", "ledger", "verified",
]
STATES = {"experimental", "active", "stable", "sunset"}
LEDGERS = {"none", "quilt-wal", "git-log"}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MAX_LINES = 24  # 20 fields + fences + slack — the stub stays a stub


def tier1_repos() -> list[str]:
    repos = []
    with open(TIER1, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#"):
                repos.append(line)
    return repos


def api(path: str, accept: str = "application/vnd.github+json") -> object:
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Accept": accept,
            "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"
            if os.environ.get("GITHUB_TOKEN") else
            "X-Accept-Anonymous: yes",
            "User-Agent": "fleet-canon-lint",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_canon_remote(repo: str) -> str | None:
    try:
        raw = api(f"/repos/SuperInstance/{repo}/contents/CANON.md",
                  accept="application/vnd.github.raw")
        return raw if isinstance(raw, str) else None
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return None
        raise


def parse_front_matter(text: str) -> dict[str, object] | str:
    """Minimal front-matter parse. Returns dict or an error string."""
    lines = text.splitlines()
    if len(lines) > MAX_LINES:
        return f"stub too long: {len(lines)} lines (max {MAX_LINES}) — it became a document"
    if not lines or lines[0].strip() != "---":
        return "missing opening --- fence"
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        return "missing closing --- fence"
    if [l for l in lines[end + 1:] if l.strip()]:
        return "content after front-matter — canon is the handle, not the door"
    out: dict[str, object] = {}
    for line in lines[1:end]:
        if not line.strip() or line.strip().startswith("#"):
            continue
        if ":" not in line:
            return f"unparseable line: {line!r}"
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            inner = value[1:-1].strip()
            out[key] = [v.strip().strip("'\"") for v in inner.split(",")] if inner else []
        else:
            out[key] = value.strip("'\"")
    return out


def as_list(value: object) -> list[str]:
    return [str(v) for v in value] if isinstance(value, list) else []


def check_schema(repo: str, canon: dict[str, object]) -> list[str]:
    fails = []
    missing = [k for k in REQUIRED if k not in canon]
    if missing:
        fails.append(f"schema: missing fields {missing}")
    if str(canon.get("canon")) != "1":
        fails.append(f"schema: canon version must be 1, got {canon.get('canon')!r}")
    if canon.get("state") not in STATES:
        fails.append(f"schema: state {canon.get('state')!r} not in {sorted(STATES)}")
    if canon.get("ledger") not in LEDGERS:
        fails.append(f"schema: ledger {canon.get('ledger')!r} not in {sorted(LEDGERS)}")
    if not DATE_RE.match(str(canon.get("verified", ""))):
        fails.append(f"schema: verified must be YYYY-MM-DD, got {canon.get('verified')!r}")
    else:
        try:
            dt.date.fromisoformat(str(canon["verified"]))
        except ValueError as exc:
            fails.append(f"schema: verified invalid — {exc}")
    if canon.get("name") != repo:
        fails.append(f"drift: name {canon.get('name')!r} != repo {repo!r}")
    if str(canon.get("mission", "")).count(".") > 1:
        fails.append("schema: mission must be one honest sentence")
    return fails


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", help="local fixture dir {dir}/{repo}/CANON.md (no API calls)")
    ap.add_argument("--enforce-coverage", action="store_true",
                    help="missing CANON.md on Tier-1 becomes a failure")
    args = ap.parse_args()

    repos = tier1_repos()
    canons: dict[str, dict[str, object]] = {}
    failures: list[str] = []
    warnings: list[str] = []
    coverage_missing: list[str] = []

    for repo in repos:
        if args.dir:
            path = os.path.join(args.dir, repo, "CANON.md")
            text = open(path, encoding="utf-8").read() if os.path.exists(path) else None
        else:
            text = fetch_canon_remote(repo)
        if text is None:
            coverage_missing.append(repo)
            continue
        parsed = parse_front_matter(text)
        if isinstance(parsed, str):
            failures.append(f"{repo}: parse — {parsed}")
            continue
        fails = check_schema(repo, parsed)
        failures.extend(f"{repo}: {f}" for f in fails)
        if not fails:
            canons[repo] = parsed

    # Edge bidirectionality among repos that have canon files.
    for src, canon in canons.items():
        for dst in as_list(canon.get("feeds")):
            other = canons.get(dst)
            if other is not None and src not in as_list(other.get("owed_by")):
                failures.append(
                    f"edge: {src}.feeds -> {dst} but {dst}.owed_by lacks {src}")
        for dst in as_list(canon.get("owed_by")):
            other = canons.get(dst)
            if other is not None and src not in as_list(other.get("feeds")):
                failures.append(
                    f"edge: {src}.owed_by -> {dst} but {dst}.feeds lacks {src}")

    # Staleness (remote mode; needs the API for pushed_at).
    if not args.dir:
        today = dt.date.today()
        for repo, canon in canons.items():
            verified = dt.date.fromisoformat(str(canon["verified"]))
            age = (today - verified).days
            pushed_at = str(api(f"/repos/SuperInstance/{repo}").get("pushed_at", ""))[:10]
            pushed = dt.date.fromisoformat(pushed_at) if pushed_at else None
            stale_push = pushed is not None and pushed > verified
            if age > 90 and stale_push:
                failures.append(
                    f"staleness: {repo} verified {age}d ago with pushes since — re-curate")
            elif age > 30 and stale_push:
                warnings.append(
                    f"staleness: {repo} verified {age}d ago with pushes since — due")

    # Coverage.
    for repo in coverage_missing:
        msg = f"coverage: {repo} has no CANON.md (Tier-1 requires one)"
        (failures if args.enforce_coverage else warnings).append(msg)

    print(f"canon-lint: {len(canons)}/{len(repos)} Tier-1 repos curated")
    for warning in warnings:
        print(f"  WARN  {warning}")
    for failure in failures:
        print(f"  FAIL  {failure}")
    verdict = "FAIL" if failures else "PASS"
    print(f"canon-lint: {verdict} "
          f"({len(failures)} failures, {len(warnings)} warnings)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
