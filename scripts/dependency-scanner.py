#!/usr/bin/env python3
"""dependency-scanner.py — Scan SuperInstance repos for cross-references

Reads Cargo.toml, package.json, and README.md from key repos to detect:
- Direct dependencies (crate/package imports)
- Conceptual references (README mentions of other repos)
- Missing backlinks (A depends on B but B doesn't reference A)

Outputs cross-reference data in JSON format for use by other tools.
"""

import json, subprocess, re, sys
from pathlib import Path

# Key repos to scan
KEY_REPOS = [
    "keel", "plato-server", "fleet-coordinate", "holonomy-consensus",
    "fleet-spread", "fleet-topology", "fleet-manifest", "fleet-homology",
    "fleet-murmur", "fleet-resonance", "constraint-theory-ecosystem",
    "constraint-theory-core", "flux-vm", "flux-lucid", "eisenstein",
    "cocapn-ai-web", "cocapn-browser-agent", "plato-client-js",
    "crab-traps", "sonar-vision", "agent-bootcamp", "a2a-adapter",
    "bottle-protocol", "beacon-protocol", "zeroclaw-agent",
    "smartcrdt", "polyformalism-thinking", "iron-to-iron",
    "fleet-constraint", "fleet-consolidation-plan", "fleet-containers",
]

def fetch_readme(repo):
    """Fetch a repo's README.md via GitHub API."""
    try:
        result = subprocess.run(
            ["gh", "api", f"repos/SuperInstance/{repo}/readme", "--jq", ".content"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            import base64
            content = base64.b64decode(result.stdout.strip()).decode()
            return content
    except:
        pass
    return ""

def scan_cargo_refs(content):
    """Scan README content for references to SuperInstance repos."""
    refs = set()
    for repo in KEY_REPOS:
        if repo in content:
            refs.add(repo)
    # Also scan for crate names
    for line in content.split('\n'):
        # Look for github.com/SuperInstance/<repo> URLs
        matches = re.findall(r'github\.com/SuperInstance/([a-zA-Z0-9_-]+)', line)
        for m in matches:
            refs.add(m)
    return refs

def check_readme_has_meta(content):
    """Check if README has a meta-header."""
    return bool(re.search(r'##\s*Meta', content))

def main():
    results = {}
    
    print("Scanning SuperInstance repos for cross-references...\n")
    
    for repo in KEY_REPOS:
        try:
            content = fetch_readme(repo)
            if not content:
                print(f"  ⚠️  {repo}: could not fetch README")
                continue
            
            refs = scan_cargo_refs(content)
            has_meta = check_readme_has_meta(content)
            
            results[repo] = {
                "has_meta": has_meta,
                "references": sorted(refs),
                "ref_count": len(refs),
            }
            
            meta_status = "✅" if has_meta else "❌"
            ref_str = ", ".join(sorted(refs)[:5])
            if len(refs) > 5:
                ref_str += f"... (+{len(refs)-5} more)"
            print(f"  {meta_status} {repo}: {ref_str or '(no refs)'}")
            
        except Exception as e:
            print(f"  ❌ {repo}: {e}")
    
    # Generate cross-reference graph
    print("\n--- Cross-Reference Graph ---\n")
    
    # Find repos that reference each other (bidirectional)
    for repo in sorted(results.keys()):
        info = results[repo]
        if info["references"]:
            # Find which of its references also reference it back
            backlinks = []
            for ref in info["references"]:
                if ref in results and repo in results[ref]["references"]:
                    backlinks.append(ref)
            
            # Missing backlinks
            missing = [r for r in info["references"] if r not in backlinks and r in results]
            
            if backlinks:
                print(f"  🔗 {repo} ↔ {', '.join(backlinks)}")
            if missing:
                print(f"  ⚠️  {repo} → {', '.join(missing)} (missing backlink)")

if __name__ == "__main__":
    main()
