#!/usr/bin/env bash
# generate-index.sh — Build the SuperInstance repo index
# Runs via GitHub Actions (cron) or locally.
# Outputs INDEX.md with organized repo catalog.

set -e

OUTPUT="${1:-INDEX.md}"

cat > "$OUTPUT" << 'HEADER'
# SuperInstance — Index

This index is auto-generated from the GitHub API. It catalogs all public repositories
in the [SuperInstance](https://github.com/SuperInstance) organization.

**Last generated:** $(date -u '+%Y-%m-%d %H:%M UTC')
**Total repositories:** 

HEADER

# Count repos
REPO_COUNT=$(gh repo list SuperInstance --limit 2000 --json name 2>/dev/null | python3 -c "import sys,json; data=sys.stdin.read(); print(len(json.loads(data)) if data.strip() else 0)" 2>/dev/null || echo 0)
echo "$REPO_COUNT" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Generate catalog sections
python3 << 'PYEOF' >> "$OUTPUT"
import json, subprocess, sys

# Fetch all repos
result = subprocess.run(
    ["gh", "repo", "list", "SuperInstance", "--limit", "200", "--json", "name", "description", "url", "updatedAt"],
    capture_output=True, text=True
)
if result.returncode != 0 or not result.stdout.strip():
    print("<!-- Warning: gh repo list returned empty output -->")
    repos = []
else:
    try:
        repos = json.loads(result.stdout)
    except json.JSONDecodeError:
        print("<!-- Warning: gh repo list returned invalid JSON -->")
        repos = []

def categorize(name, desc):
    if not desc: desc = ''
    d = (name + ' ' + desc).lower()
    
    # Core infrastructure
    if name in ['keeper', 'agent-api', 'holodeck', 'plato-server', 'plato-client-js', 
                'plato-client-ruby', 'plato-client-php', 'keel', 'cocapn-glue-core',
                'fleet-health-monitor', 'fleet-vessel', 'zeroclaw-plato', 'zeroclaw-agent',
                'oracle1-box', 'superinstance-ci']:
        return 'Core Infrastructure'
    if name in ['.github', 'SuperInstance']:
        return 'Organization'
    
    # Constraint theory & math
    if any(k in d for k in ['holonomy', 'coordinate', 'pythagorean', 'constraint-theory',
                            'eisenstein', 'flux-vm', 'flux-lucid', 'snap-lut', 'temporal-flux',
                            'fold-compression', 'guard2mask', 'polyformalism',
                            'linguistic-polyformalism']):
        return 'Constraint Theory & Math'
    
    # Fleet coordination
    if any(k in d for k in ['fleet-spread', 'fleet-topology', 'fleet-manifest', 'fleet-homolog',
                            'fleet-murmur', 'fleet-resonance', 'fleet-coordinate', 'fleet-proto',
                            'fleet-constraint', 'fleet-raid5', 'fleet-manifold', 'fleet-crdt',
                            'fleet-clock', 'fleet-graph', 'fleet-ecosystem', 'fleet-bridge',
                            'fleet-holographic', 'fleet-immune', 'fleet-ecology', 'fleet-predict',
                            'fleet-phase', 'fleet-stitch', 'fleet-yaw', 'fleet-consciousness',
                            'fleet-discovery', 'fleet-formal-proofs', 'fleet-simulators',
                            'fleet-keel', 'fleet-memory', 'fleet-agent-core',
                            'bottle-protocol', 'beacon-protocol', 'a2a-adapter', 'whisper-sync',
                            'insight-cfp-bridge', 'murmur-plato-bridge']):
        return 'Fleet Coordination'
    
    # FLUX
    if 'flux' in d and name not in ['eisenstein']:
        return 'FLUX Ecosystem'
    
    # AI agents
    if any(k in d for k in ['agent-bootcamp', 'agent-coordinator', 'agent-forge', 'agent-skills',
                            'ai-character', 'bootstrap-spark', 'smartcrdt', 'cognitive',
                            'babel-vessel', 'superz', 'forgemaster']):
        return 'AI Agents & Vessels'
    
    # Hardware & edge
    if any(k in d for k in ['jetson', 'sonar', 'bare-metal', 'hardware-capability', 'sensor-plato',
                            'plato-vessel', 'arm-neon', 'edge', 'hardware-aware']):
        return 'Hardware & Edge'
    
    # Web & browser
    if any(k in d for k in ['cocapn-ai-web', 'cocapn-browser', 'cocapn-schemas', 'crab-traps',
                            'ai-pages', 'superinstance-ai-pages', 'eisenstein-wasm',
                            'podiumjs', 'superinstance-fleet-proto', 'superinstance-gpu-compute',
                            'cocapn']):
        return 'Web & Browser'
    
    # Domains
    if any(k in d for k in ['cocapn.com', 'superinstance.ai', 'log.ai', '-pages',
                            'purplepincher', 'capitaine', 'deckboss', 'lucineer',
                            'fishinglog', 'makerlog', 'studylog', 'activelog', 'businesslog',
                            'dmlog', 'playerlog', 'personallog', 'reallog', 'luciddreamer']):
        return 'Domain Portals'
    
    # Demos & tools
    if any(k in d for k in ['demo', 'test', 'bench', 'integration', 'getting-started',
                            'casting-call', 'workshop', 'harness', 'captains-log',
                            'ai-writings', 'insight-engine', 'depgraph', 'physics-clock',
                            'voice-signature', 'chess-engine', 'equilibrium']):
        return 'Demos, Tools & Utilities'
    
    return 'Other'

# Build catalog
categories = {}
for r in repos:
    cat = categorize(r['name'], r.get('description', ''))
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(r)

# Output categorized catalog
for cat in sorted(categories.keys()):
    section_repos = sorted(categories[cat], key=lambda x: x['name'].lower())
    print(f"\n## {cat}\n")
    
    for r in section_repos:
        name = r['name']
        desc = r.get('description', '')
        url = r.get('url', f"https://github.com/SuperInstance/{name}")
        
        if desc:
            print(f"- **[{name}]({url})** — {desc[:120]}")
        else:
            print(f"- **[{name}]({url})**")

PYEOF

wc -l "$OUTPUT"
echo "Index generated: $OUTPUT"