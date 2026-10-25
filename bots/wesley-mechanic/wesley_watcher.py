#!/usr/bin/env python3
"""wesley_watcher.py — poll the fleet canon, witness the change, log it.

Mechanic skill: `watch-canon`. The mechanic is the fleet's watcher. Other
agents poll; the mechanic keeps the record — it notes that the canon moved,
what moved it, and in which direction, so the history of the substrate is
not a feeling but a log.

Canon doctrine (SuperInstance/fleet-canon CANON.schema.md) — three layers,
one writer per field:

    Layer G — what is true NOW.  fleet-canon/graph.json (generated).
    Layer C — what it MEANS.    CANON.md in Tier-1 repos.
    Layer H — what HAPPENED.    the quilt WAL (hermit's canon ledger).

The watcher reads all three, folds them into ONE canon fingerprint, and
compares that fingerprint against the fingerprint recorded at the last
poll. A change in the fingerprint IS a canon change. Drift is one string,
not a feeling — same doctrine as hermit's canon-ledger replay hash.

Usage:
    python3 wesley_watcher.py --once        # one poll, then exit
    python3 wesley_watcher.py --once --json # one poll, machine-readable

Exit codes:
    0  poll completed (change or no change — both are successes)
    1  poll failed (could not read any canon layer)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

# The fleet's standard hash: FNV-1a 64-bit, canary 0x024a555471370b18d.
# Integers own identity; floats only ever measure. (fleet-canon/FLOOR.md)
FNV64_OFFSET = 0xCBF29CE484222325
FNV64_PRIME = 0x100000001B3
FNV64_MASK = 0xFFFFFFFFFFFFFFFF
FNV64_CANARY = 0x024A555471370B18D

HERE = os.path.dirname(os.path.abspath(__file__))

# Layout: bots/wesley-mechanic/wesley_watcher.py -> repo root is ../..
REPO_ROOT = os.path.abspath(os.path.join(HERE, os.pardir, os.pardir))

DEFAULT_STATE = os.path.join(HERE, "state", "last_poll.json")
DEFAULT_LOG = os.path.join(HERE, "state", "witness_log.jsonl")
DEFAULT_NOTES = os.path.join(HERE, "state", "witness_notes")


# --------------------------------------------------------------------------
# hashing
# --------------------------------------------------------------------------
def fnv1a64(data: str) -> int:
    """FNV-1a 64-bit over UTF-8 bytes. The fleet's standard hash."""
    h = FNV64_OFFSET
    for byte in data.encode("utf-8"):
        h ^= byte
        h = (h * FNV64_PRIME) & FNV64_MASK
    return h


def fnv1a64_hex(data: str) -> str:
    """16-char hex, zero-padded, lowercase."""
    return f"{fnv1a64(data):016x}"


def sha256_file(path: str) -> Optional[str]:
    """SHA-256 of a file's bytes, or None if unreadable."""
    try:
        h = hashlib.sha256()
        with open(path, "rb") as fh:
            for chunk in iter(lambda: fh.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None


# --------------------------------------------------------------------------
# canon layers
# --------------------------------------------------------------------------
@dataclass
class LayerRead:
    """One canon layer's observed state."""

    layer: str            # "G" | "C" | "H"
    source: str           # what was read
    ok: bool
    digest: str           # hex digest of the layer's normalized content
    detail: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "layer": self.layer,
            "source": self.source,
            "ok": self.ok,
            "digest": self.digest,
            "detail": self.detail,
        }


def read_layer_g(root: str) -> LayerRead:
    """Layer G — the generated canon graph."""
    path = os.path.join(root, "fleet-canon", "graph.json")
    if not os.path.isfile(path):
        return LayerRead("G", path, False, "", {"error": "graph.json absent"})
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        return LayerRead("G", path, False, "", {"error": str(exc)})

    nodes = data.get("nodes") or []
    # Fold to a stable digest: node identity + state, sorted so that a
    # reordering of the file is NOT a canon change, but a state flip IS.
    fingerprint_rows = sorted(
        f"{n.get('name', '')}|{n.get('state', '')}|{n.get('tier', '')}"
        for n in nodes
        if isinstance(n, dict)
    )
    body = "\n".join(fingerprint_rows)

    # Staleness against its own source. Layer G is GENERATED from
    # CATALOG.md; the canon-generate cron runs weekly, so between runs the
    # source moves and the graph does not. A canon that no longer says what
    # is true is a canon change even though graph.json did not change.
    catalog_path = os.path.join(root, "CATALOG.md")
    catalog_total = data.get("catalogTotal")
    stale_repos: List[str] = []
    cat_rows: List[str] = []
    if os.path.isfile(catalog_path):
        try:
            with open(catalog_path, "r", encoding="utf-8") as fh:
                catalog_text = fh.read()
            cat_rows = re.findall(
                r"\|\s*\*\*\[([^\]]+)\]\(https://github\.com/SuperInstance/[^)]+\)\*\*\s*\|",
                catalog_text,
            )
            node_names = {n.get("name") for n in nodes if isinstance(n, dict)}
            stale_repos = sorted(set(cat_rows) - node_names)
        except OSError:
            pass

    # The staleness set IS part of Layer G's identity: a graph that no
    # longer describes its source has moved, even if graph.json is byte-
    # identical. Fold it in so the fingerprint can see it.
    body = body + "\n--stale--\n" + "\n".join(stale_repos)
    digest = fnv1a64_hex(body)

    return LayerRead(
        "G",
        path,
        True,
        digest,
        {
            "generated": data.get("generated"),
            "catalogGenerated": data.get("catalogGenerated"),
            "catalogTotal": catalog_total,
            "parsed": data.get("parsed"),
            "node_count": len(nodes),
            "tiers": data.get("tiers"),
            "catalog_rows": len(cat_rows) if os.path.isfile(catalog_path) else None,
            "stale_vs_catalog": len(stale_repos),
            "stale_repos": stale_repos[:40],
        },
    )


_CANON_FM = re.compile(r"^---\s*$")


def parse_canon_md(text: str) -> Optional[Dict[str, Any]]:
    """Parse the CANON.md YAML front-matter (Layer C).

    Deliberately minimal: the schema forbids prose sections, so the file is
    front-matter only. We read the fields that carry meaning — mission,
    state, edges, staleness clock.
    """
    lines = text.splitlines()
    if not lines or not _CANON_FM.match(lines[0].strip()):
        return None
    try:
        end = next(i for i in range(1, len(lines)) if _CANON_FM.match(lines[i].strip()))
    except StopIteration:
        return None

    out: Dict[str, Any] = {}
    for raw in lines[1:end]:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if ":" not in raw:
            continue
        key, _, val = raw.partition(":")
        key = key.strip()
        val = val.strip()
        if val.startswith("[") and val.endswith("]"):
            out[key] = [v.strip() for v in val[1:-1].split(",") if v.strip()]
        else:
            out[key] = val
    return out


def tier1_repos(root: str) -> List[str]:
    """The Tier-1 roster. Same source as fleet-canon/lint.py."""
    path = os.path.join(root, "fleet-canon", "tier1.txt")
    repos: List[str] = []
    try:
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith("#"):
                    repos.append(line)
    except OSError:
        pass
    return repos


def _api_get(path: str, accept: str = "application/vnd.github+json") -> Optional[Any]:
    """GET the GitHub API. None on any failure (rate limit, 404, network)."""
    import urllib.error
    import urllib.request

    token = os.environ.get("GITHUB_TOKEN", "")
    headers = {
        "Accept": accept,
        "User-Agent": "wesley-watcher",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        headers["X-Accept-Anonymous"] = "yes"
    req = urllib.request.Request(f"https://api.github.com{path}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, OSError, ValueError):
        return None


def fetch_canon_remote(repo: str) -> Optional[str]:
    """Fetch a Tier-1 repo's CANON.md raw text, or None if unavailable."""
    import urllib.error
    import urllib.request

    token = os.environ.get("GITHUB_TOKEN", "")
    headers = {
        "Accept": "application/vnd.github.raw",
        "User-Agent": "wesley-watcher",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        headers["X-Accept-Anonymous"] = "yes"
    req = urllib.request.Request(
        f"https://api.github.com/repos/SuperInstance/{repo}/contents/CANON.md",
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8")
    except (urllib.error.URLError, urllib.error.HTTPError, OSError, UnicodeDecodeError):
        return None


def read_layer_c(root: str, mirror_dir: Optional[str] = None) -> LayerRead:
    """Layer C — the CANON.md claims across the Tier-1 roster.

    Layer C is not one file: it is one claim per Tier-1 repo. The watcher
    sweeps the roster and folds every claim into a single layer digest, so
    a claim flip anywhere in Tier-1 registers as a canon change.

    Three sources, in order of preference per repo:
      1. a local mirror dir   ({dir}/{repo}/CANON.md)
      2. the GitHub API        (raw contents endpoint)
      3. the local repo's own CANON.md if the repo IS Tier-1
    """
    repos = tier1_repos(root)
    if not repos:
        return LayerRead("C", "fleet-canon/tier1.txt", False, "",
                         {"error": "Tier-1 roster unreadable or empty"})

    claims: Dict[str, str] = {}
    claim_states: Dict[str, str] = {}
    missing: List[str] = []
    unreadable: List[str] = []
    remote_ok = 0
    mirror_ok = 0

    for repo in repos:
        text: Optional[str] = None
        source = ""

        if mirror_dir:
            cand = os.path.join(mirror_dir, repo, "CANON.md")
            if os.path.isfile(cand):
                try:
                    with open(cand, "r", encoding="utf-8") as fh:
                        text = fh.read()
                    source = "mirror"
                    mirror_ok += 1
                except OSError:
                    pass

        if text is None:
            local = os.path.join(root, repo, "CANON.md")
            if os.path.isfile(local):
                try:
                    with open(local, "r", encoding="utf-8") as fh:
                        text = fh.read()
                    source = "local"
                except OSError:
                    pass

        if text is None:
            text = fetch_canon_remote(repo)
            if text is not None:
                source = "api"
                remote_ok += 1

        if text is None:
            unreadable.append(repo)
            continue

        claim = parse_canon_md(text)
        if claim is None:
            unreadable.append(repo)
            continue

        # Fold only the meaning-bearing fields. A comment reformat must not
        # read as a canon change; a state flip must.
        fields = [
            "canon", "name", "mission", "state", "family", "vessel",
            "born_from", "feeds", "owed_by", "canonical_docs", "ledger",
        ]
        rows = []
        for f in fields:
            val = claim.get(f)
            if isinstance(val, list):
                val = ",".join(val)
            rows.append(f"{f}={val}")
        claims[repo] = "\n".join(rows)
        claim_states[repo] = str(claim.get("state", ""))

    if not claims:
        return LayerRead("C", f"tier1 roster ({len(repos)} repos)", False, "",
                         {"error": "no Tier-1 claim could be read",
                          "tier1_count": len(repos),
                          "unreadable": unreadable})

    # Sorted by repo so roster reordering is not a change, but any claim
    # edit anywhere in Tier-1 is.
    body = "\n".join(f"{repo}\n{claims[repo]}" for repo in sorted(claims))
    digest = fnv1a64_hex(body)
    return LayerRead(
        "C",
        f"tier1 roster ({len(repos)} repos)",
        True,
        digest,
        {
            "tier1_count": len(repos),
            "claims_read": len(claims),
            "claims_missing": missing,
            "claims_unreadable": unreadable,
            "read_via": {"api": remote_ok, "mirror": mirror_ok},
            "states": claim_states,
        },
    )


def _git(repo: str, args: List[str]) -> Optional[str]:
    try:
        out = subprocess.run(
            ["git", "-C", repo] + args,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    if out.returncode != 0:
        return None
    return out.stdout


def read_layer_h(root: str) -> LayerRead:
    """Layer H — what HAPPENED: the git log over the canon's scope.

    The repo's own git log IS the ledger (hermit/src/quilt/canon-ledger.ts).
    We take the HEAD commit of the canon-scope paths, which is the cheapest
    honest proxy for "has the event stream moved since last poll".
    """
    # `.git` is a directory in a normal clone but a FILE in a worktree or
    # submodule checkout. Accept either.
    git_path = os.path.join(root, ".git")
    if not (os.path.isdir(git_path) or os.path.isfile(git_path)):
        return LayerRead("H", root, False, "", {"error": "not a git repo"})
    rev = _git(root, ["rev-parse", "HEAD"])
    if rev is None:
        return LayerRead("H", root, False, "", {"error": "no HEAD"})
    head = rev.strip()

    # `git rev-parse HEAD -- <paths>` emits one line PER path, which would
    # poison the digest with newlines. Ask for the tree entries instead.
    scope_parts = []
    for scope_path in ("fleet-canon/graph.json", "fleet-canon/tier1.txt",
                       "fleet-canon/CANON.schema.md", "CANON.md", "CATALOG.md"):
        r = _git(root, ["rev-parse", f"HEAD:{scope_path}"])
        if r:
            scope_parts.append(f"{scope_path}={r.strip().splitlines()[0]}")
    canon_scope = ";".join(scope_parts) if scope_parts else head

    last_commit = _git(root, ["log", "-1", "--format=%H %ct %s", "--",
                              "fleet-canon", "CANON.md", "CATALOG.md"])
    subject = ""
    ts = 0
    if last_commit:
        parts = last_commit.strip().split(" ", 2)
        if len(parts) == 3:
            subject = parts[2]
            try:
                ts = int(parts[1])
            except ValueError:
                ts = 0

    count = _git(root, ["rev-list", "--count", "HEAD"])
    shallow = os.path.isfile(os.path.join(git_path, "shallow"))
    return LayerRead(
        "H",
        f"{root} @ {head[:12]}",
        True,
        fnv1a64_hex(f"{head}\n{canon_scope}\n{subject}\n{ts}"),
        {
            "head": head,
            "canon_scope_commit": canon_scope,
            "canon_scope_subject": subject,
            "canon_scope_ts": ts,
            "commit_count": count.strip() if count else None,
            "shallow": shallow,
        },
    )


# --------------------------------------------------------------------------
# poll
# --------------------------------------------------------------------------
@dataclass
class Poll:
    """The result of one poll."""

    ts: int
    fingerprint: str
    layers: List[LayerRead]
    changed: bool
    previous_fingerprint: Optional[str]
    detail: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ts": self.ts,
            "fingerprint": self.fingerprint,
            "changed": self.changed,
            "previous_fingerprint": self.previous_fingerprint,
            "layers": [l.to_dict() for l in self.layers],
            "detail": self.detail,
        }


def compute_fingerprint(layers: List[LayerRead]) -> str:
    """Fold the layers into one canon fingerprint."""
    parts = []
    for l in sorted(layers, key=lambda x: x.layer):
        parts.append(f"{l.layer}:{l.digest if l.ok else 'unreadable'}")
    return fnv1a64_hex("\n".join(parts))


def load_state(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save_state(path: str, state: Dict[str, Any]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2, sort_keys=True)
        fh.write("\n")
    os.replace(tmp, path)


def diff_layers(
    previous: List[Dict[str, Any]], current: List[LayerRead]
) -> List[Dict[str, Any]]:
    """What moved between two polls, layer by layer."""
    prev_by_layer = {p.get("layer"): p for p in previous if isinstance(p, dict)}
    out = []
    for cur in current:
        prev = prev_by_layer.get(cur.layer)
        if prev is None:
            out.append({"layer": cur.layer, "kind": "new", "to": cur.digest})
        elif prev.get("digest") != cur.digest:
            entry = {
                "layer": cur.layer,
                "kind": "changed",
                "from": prev.get("digest"),
                "to": cur.digest,
            }
            if cur.layer == "C":
                # Name the repos whose claim moved. The layer digest is
                # opaque; the witness note has to say WHAT moved.
                old_states = (prev.get("detail") or {}).get("states") or {}
                new_states = cur.detail.get("states") or {}
                moved = []
                for repo in sorted(set(old_states) | set(new_states)):
                    o = old_states.get(repo)
                    n = new_states.get(repo)
                    if o != n:
                        moved.append({"repo": repo, "from": o, "to": n})
                entry["moved"] = moved
            out.append(entry)
    return out


def poll_once(root: str, state_path: str, mirror_dir: Optional[str] = None) -> Poll:
    """One poll: read the layers, compare against the last poll."""
    layers = [
        read_layer_g(root),
        read_layer_c(root, mirror_dir),
        read_layer_h(root),
    ]
    fingerprint = compute_fingerprint(layers)
    state = load_state(state_path)
    previous_fp = state.get("fingerprint")
    previous_layers = state.get("layers") or []

    changed = previous_fp is not None and previous_fp != fingerprint
    first_poll = previous_fp is None

    detail: Dict[str, Any] = {
        "first_poll": first_poll,
        "layer_diffs": diff_layers(previous_layers, layers),
        "unreadable_layers": [l.layer for l in layers if not l.ok],
        "previous_layers": previous_layers,
    }

    poll = Poll(
        ts=int(time.time()),
        fingerprint=fingerprint,
        layers=layers,
        changed=changed,
        previous_fingerprint=previous_fp,
        detail=detail,
    )

    save_state(
        state_path,
        {
            "fingerprint": fingerprint,
            "ts": poll.ts,
            "layers": [l.to_dict() for l in layers],
        },
    )
    return poll


# --------------------------------------------------------------------------
# witness log + note
# --------------------------------------------------------------------------
def count_log_entries(path: str) -> int:
    if not os.path.isfile(path):
        return 0
    with open(path, "r", encoding="utf-8") as fh:
        return sum(1 for line in fh if line.strip())


def append_witness_log(path: str, poll: Poll) -> Dict[str, Any]:
    """Append one witness-log entry. The log is append-only."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    entry = {
        "seq": count_log_entries(path) + 1,
        "ts": poll.ts,
        "ts_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(poll.ts)),
        "witness": "wesley-mechanic",
        "event": "canon-poll",
        "fingerprint": poll.fingerprint,
        "changed": poll.changed,
        "previous_fingerprint": poll.previous_fingerprint,
        "layers": {l.layer: {"ok": l.ok, "digest": l.digest} for l in poll.layers},
        "detail": poll.detail,
    }
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, sort_keys=True) + "\n")
    return entry


def write_witness_note(notes_dir: str, poll: Poll) -> Optional[str]:
    """Write the one-paragraph witness note. Only when canon changed."""
    if not poll.changed:
        return None
    os.makedirs(notes_dir, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S", time.gmtime(poll.ts))
    path = os.path.join(notes_dir, f"wesley-witness-note-{stamp}.md")

    by_layer = {l.layer: l for l in poll.layers}
    prev_layers_by_layer = {p.get("layer"): p for p in (poll.detail.get("previous_layers") or [])}
    diffs = poll.detail.get("layer_diffs") or []

    if not diffs:
        body = (
            "The canon fingerprint moved, but no individual layer attributed "
            "the movement; the change is distributed across the layers read "
            "in this poll and the watcher could not localize it."
        )
    else:
        bits = []
        for d in diffs:
            layer = d.get("layer")
            lread = by_layer.get(layer)
            if lread is None:
                bits.append(f"layer {layer} moved from {d.get('from')} to {d.get('to')}")
                continue
            detail = lread.detail or {}
            if layer == "G":
                stale = detail.get("stale_vs_catalog") or 0
                prev_detail = (prev_layers_by_layer.get(layer) or {}).get("detail") or {}
                prev_stale = prev_detail.get("stale_vs_catalog")
                prev_generated = prev_detail.get("generated")
                now_generated = detail.get("generated")
                if prev_stale is not None and stale > prev_stale and now_generated == prev_generated:
                    # The graph file did not change; its SOURCE moved out from
                    # under it. Say so plainly — this is the common case and
                    # a misreading of it would be a false canon event.
                    repos = detail.get("stale_repos") or []
                    bits.append(
                        f"Layer G (the generated canon graph) did not regenerate "
                        f"(still {now_generated}) but its source moved: the graph "
                        f"is now stale against CATALOG.md by {stale} repos, up from "
                        f"{prev_stale} at the last poll"
                        + (
                            f" ({', '.join(repos[:6])}" + (" ...)" if len(repos) > 6 else ")")
                            if repos else ""
                        )
                    )
                else:
                    bits.append(
                        f"Layer G (the generated canon graph) moved: {lread.digest[:12]} "
                        f"now, generated {now_generated} over "
                        f"{detail.get('node_count')} nodes, stale against its own "
                        f"source by {stale} repos"
                    )
            elif layer == "C":
                moved = d.get("moved") or []
                if moved:
                    names = ", ".join(
                        f"{m.get('repo')} ({m.get('from')} -> {m.get('to')})"
                        for m in moved
                    )
                    bits.append(
                        f"Layer C (the CANON.md claims) moved: {lread.digest[:12]} now; "
                        f"the claim moved for {names}"
                    )
                else:
                    bits.append(
                        f"Layer C (the CANON.md claims) moved: {lread.digest[:12]} now "
                        f"across {detail.get('claims_read')} Tier-1 claims, with the "
                        f"moving claim not isolable"
                    )
            elif layer == "H":
                bits.append(
                    f"Layer H (the event ledger) moved: HEAD {str(detail.get('head'))[:12]}, "
                    f"last canon-scope commit {str(detail.get('canon_scope_commit'))[:12]} "
                    f"\"{detail.get('canon_scope_subject')}\""
                )
            else:
                bits.append(f"layer {layer} moved from {d.get('from')} to {d.get('to')}")
        body = (
            "The canon moved. "
            + "; ".join(bits)
            + f". The fleet fingerprint for this poll is {poll.fingerprint[:12]}, "
            + (
                f"down from {poll.previous_fingerprint[:12]}."
                if poll.previous_fingerprint
                else "with no prior fingerprint recorded."
            )
            + " The mechanic witnesses the change and records it; the substrate "
            "remembers by accumulation, and the canon is what it now says it is."
        )

    with open(path, "w", encoding="utf-8") as fh:
        fh.write(
            f"# Witness Note — {time.strftime('%Y-%m-%d %H:%M:%SZ', time.gmtime(poll.ts))}\n\n"
            f"*wesley-mechanic · canon poll · fingerprint `{poll.fingerprint}`*\n\n"
            f"{body}\n"
        )
    return path


# --------------------------------------------------------------------------
# cli
# --------------------------------------------------------------------------
def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(
        prog="wesley_watcher.py",
        description="Poll the fleet canon; append to the witness log.",
    )
    ap.add_argument("--once", action="store_true", help="run a single poll and exit")
    ap.add_argument("--root", default=REPO_ROOT, help="fleet repo root to poll")
    ap.add_argument("--state", default=DEFAULT_STATE, help="path to last-poll state file")
    ap.add_argument("--log", default=DEFAULT_LOG, help="path to the witness log (append-only)")
    ap.add_argument("--notes", default=DEFAULT_NOTES, help="directory for witness notes")
    ap.add_argument("--mirror", default=None,
                    help="local dir of Tier-1 mirrors: {dir}/{repo}/CANON.md")
    ap.add_argument("--json", action="store_true", help="emit the poll as JSON")
    args = ap.parse_args(argv)

    if not args.once:
        # The watcher is a poll-once tool; refuse to spin by accident.
        sys.stderr.write(
            "wesley_watcher: --once is required (this watcher does not daemonize).\n"
        )
        return 2

    root = os.path.abspath(args.root)
    poll = poll_once(root, os.path.abspath(args.state), args.mirror)
    entry = append_witness_log(os.path.abspath(args.log), poll)
    note = write_witness_note(os.path.abspath(args.notes), poll)

    if args.json:
        print(json.dumps({"poll": poll.to_dict(), "entry": entry, "note": note}, indent=2))
    else:
        status = "CHANGED" if poll.changed else "unchanged"
        if poll.detail.get("first_poll"):
            status = "BASELINE"
        print(f"wesley_watcher: poll {status}")
        print(f"  fingerprint : {poll.fingerprint}")
        print(f"  previous    : {poll.previous_fingerprint or '(none - first poll)'}")
        for l in poll.layers:
            mark = "ok " if l.ok else "ERR"
            print(f"  layer {l.layer} {mark} {l.digest or l.detail.get('error', '')}")
        print(f"  witness log : {args.log} (seq {entry['seq']})")
        if note:
            print(f"  witness note: {note}")
        else:
            print("  witness note: (not written - canon unchanged)")

    if poll.detail.get("unreadable_layers") and len(poll.detail["unreadable_layers"]) == len(poll.layers):
        sys.stderr.write("wesley_watcher: no canon layer could be read.\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
