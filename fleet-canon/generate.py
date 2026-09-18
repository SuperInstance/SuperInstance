#!/usr/bin/env python3
"""generate.py — Layer G: build fleet-canon/graph.json from CATALOG.md.

CATALOG.md is the fleet's CI-generated survey (7,527 lines, ~2,000 repos,
regenerated daily). Layer G reads it — no org-listing permission needed —
and emits a typed node per repo. Machines own every field; CANON.md
(Layer C) overrides family/tier/vessel for Tier-1 repos at LINT time,
never by hand-editing this file.

Known gaps (declared, not hidden):
  * CATALOG caps at 2,000 repos (org survey says ~3,951) — CATALOG-side
    pagination issue; Layer G's --check gate will surface the day it grows.
  * CATALOG marks every row 🟢 — tier-3 (orphan+stale) needs org-API
    pushedAt; synthesized as empty until access returns.
  * Tier-1 repos absent from CATALOG get flagged nodes (catalogMissing)
    so the gap is lint-able, never silent.

Usage:
  python3 fleet-canon/generate.py            # writes graph.json + stats
  python3 fleet-canon/generate.py --check    # CI drift gate: exit 1 if stale
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "fleet-canon", "graph.json")
TIER1 = os.path.join(ROOT, "fleet-canon", "tier1.txt")
CATALOG_URL = ("https://raw.githubusercontent.com/SuperInstance/"
               "SuperInstance/main/CATALOG.md")

SECTION_FAMILY = {
    "core infrastructure": "infra",
    "constraint theory & math": "constraint-theory",
    "constraint theory and math": "constraint-theory",
    "math foundations": "constraint-theory",
    "quilt kernel & cells": "quilt",
    "quilt": "quilt",
    "plato": "plato",
    "plato & portals": "plato",
    "flux": "flux",
    "canon": "canon",
    "live canon": "canon",
    "sites": "sites",
    "websites": "sites",
    "recovered copies": "recovered-copy",
    "recovered-copy": "recovered-copy",
    "applications": "applications",
    "fleet": "fleet",
    "agents": "applications",
    "experiments": "experimental",
    "experimental": "experimental",
    "archived": "sunset",
    "sunset": "sunset",
    "web & browser": "web-browser",
    "hardware & edge": "hardware-edge",
    "agent coordination": "agent-coordination",
}
# CATALOG's own bucket for ~78% of repos — re-infer family from the repo
# NAME inside this bucket rather than trusting the shrug.
CATCHALL = {"other / uncategorized", "other", "uncategorized", "misc"}
FAMILY_PREFIXES = [
    ("recovered-copy-", "recovered-copy"),
    ("constraint-theory-", "constraint-theory"),
    ("quilt-", "quilt"), ("fleet-", "fleet"), ("plato-", "plato"),
    ("flux-", "flux"), ("canon-", "canon"),
    ("scrap-", "scrap"), ("mist-", "mist"), ("mudra-", "mudra"),
    ("ternary-", "ternary"), ("lucid", "lucid"), ("lucineer", "lucid"),
    ("rc-", "rc"), ("f170-", "f170"),
]
SITE_SUFFIXES = ("-pages", "-site", "-website")
TIER1_FAMILY = {
    "hermit": "applications", "tidepool": "applications",
    "twist-engine": "applications", "erised": "applications",
    "Scrapcraft": "applications", "duke-lab": "applications",
    "crab-trap-web": "applications", "the-tap": "applications",
    "quilt-studio": "applications", "vector-novelty": "applications",
    "OpenConstruct": "infra", "AI-Writings": "infra",
    "cocapn-health": "infra", "ccc-os": "infra",
    "sunset-ecosystem": "infra", "cocapn-plato": "infra",
    "hebbian-router": "infra", "pareto-tournament": "infra",
    "quilt": "quilt", "quilt-cell": "quilt", "plato-portal": "plato",
    "constraint-theory-core": "constraint-theory",
    "constraint-theory-math": "constraint-theory",
    "canon-graph": "canon", "canon-claim": "canon", "live-canon": "canon",
    "quilt-canon-cli": "canon",
}
STATUS_MAP = {"🟢": "active", "🟡": "experimental", "🔴": "sunset",
            "⚫": "sunset", "⚪": "active"}


def slugify(header: str) -> str:
    key = header.strip().lower()
    if key in SECTION_FAMILY:
        return SECTION_FAMILY[key]
    return re.sub(r"[^a-z0-9]+", "-", key).strip("-") or "misc"


def infer_family(name: str, section: str, tier1: set[str]) -> str:
    if name in TIER1_FAMILY:
        return TIER1_FAMILY[name]
    if name in tier1:
        return "applications"
    if name.endswith(SITE_SUFFIXES):
        return "sites"
    if section in CATCHALL or section == "misc":
        for prefix, family in FAMILY_PREFIXES:
            if name.startswith(prefix):
                return family
        return "misc"
    return section


def load_catalog() -> str:
    local = os.path.join(ROOT, "CATALOG.md")
    if os.path.exists(local):
        with open(local, encoding="utf-8") as fh:
            return fh.read()
    req = urllib.request.Request(CATALOG_URL, headers={"User-Agent": "fleet-canon-generate"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", "replace")


def load_tier1() -> set[str]:
    with open(TIER1, encoding="utf-8") as fh:
        return {l.strip() for l in fh if l.strip() and not l.startswith("#")}


def parse(catalog: str, tier1: set[str]) -> tuple[list[dict], dict]:
    nodes: list[dict] = []
    meta: dict = {"catalogGenerated": None, "catalogTotal": None}
    family = "misc"
    seen: set[str] = set()
    for line in catalog.splitlines():
        if line.startswith("**Generated:**"):
            m = re.search(r"(\d{4}-\d{2}-\d{2})", line)
            meta["catalogGenerated"] = m.group(1) if m else None
        elif line.startswith("**Total repositories:**"):
            m = re.search(r"(\d+)", line)
            meta["catalogTotal"] = int(m.group(1)) if m else None
        elif (line.startswith("## ") and not line.startswith("### ")
              and line[3:].strip().lower() != "detailed entries"):
            family = slugify(line[3:])
        elif line.startswith("| **["):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) < 4:
                continue
            m = re.match(r"\*\*\[(.+?)\]\(.+?\)\*\*", cells[0])
            if not m:
                continue
            name = m.group(1)
            seen.add(name)
            nodes.append({
                "name": name,
                "family": infer_family(name, family, tier1),
                "vessel": cells[1] or "",
                "mission": cells[2] or "",
                "state": STATUS_MAP.get(cells[3][:2], "active"),
                "bornFrom": [],
                "tier": 0,  # resolved below
            })
    # Tier-1 repos ABSENT from the catalog are canon-critical: synthesize a
    # flagged node so the gap is visible in graph.json (and lint-able).
    for name in sorted(tier1 - seen):
        nodes.append({
            "name": name,
            "family": TIER1_FAMILY.get(name, "misc"),
            "vessel": "",
            "mission": "",
            "state": "active",
            "bornFrom": [],
            "tier": 1,
            "catalogMissing": True,
        })
    return nodes, meta


def resolve_tiers(nodes: list[dict], tier1: set[str]) -> None:
    for n in nodes:
        if n["name"] in tier1:
            n["tier"] = 1
        elif n["state"] == "sunset":
            n["tier"] = 3
        else:
            n["tier"] = 2


def main() -> int:
    check = "--check" in sys.argv
    tier1 = load_tier1()
    catalog = load_catalog()
    nodes, meta = parse(catalog, tier1)
    resolve_tiers(nodes, tier1)
    nodes.sort(key=lambda n: n["name"].lower())
    missing = [n["name"] for n in nodes if n.get("catalogMissing")]
    graph = {
        "generated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": "CATALOG.md",
        "catalogGenerated": meta["catalogGenerated"],
        "catalogTotal": meta["catalogTotal"],
        "parsed": len(nodes),
        "catalogMissing": missing,
        "tier3Note": "tier-3 (orphan+stale) populates once the CATALOG "
                     "generator fetches pushedAt/isArchived (meta repo PR #19, "
                     "catalog-v2); until then every row reads active",
        "tiers": {str(t): sum(1 for n in nodes if n["tier"] == t) for t in (1, 2, 3)},
        "vessels": sorted({n["vessel"] for n in nodes if n["vessel"]}),
        "nodes": nodes,
    }
    blob = json.dumps(graph, indent=1, ensure_ascii=False) + "\n"
    if check:
        try:
            with open(OUT, encoding="utf-8") as fh:
                old = json.loads(fh.read())
            for g in (old, graph):
                g.pop("generated", None)
            if old == graph:
                print("generate: graph.json is current")
                return 0
            print("generate: graph.json STALE — run generate.py", file=sys.stderr)
            return 1
        except FileNotFoundError:
            print("generate: graph.json missing", file=sys.stderr)
            return 1
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(blob)
    fam_counts: dict[str, int] = {}
    for n in nodes:
        fam_counts[n["family"]] = fam_counts.get(n["family"], 0) + 1
    print(f"generate: {len(nodes)} nodes (catalog total "
          f"{meta['catalogTotal']}) -> fleet-canon/graph.json")
    print(f"tiers: {graph['tiers']}")
    if missing:
        print(f"CATALOG-MISSING tier-1 (synthesized): {', '.join(missing)}")
    print("top families: " + ", ".join(f"{f}({c})" for f, c in
          sorted(fam_counts.items(), key=lambda kv: -kv[1])[:10]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
