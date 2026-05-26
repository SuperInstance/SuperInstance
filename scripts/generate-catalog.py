#!/usr/bin/env python3
"""generate-catalog.py — Build a detailed repo catalog with research lineage and purpose.

For each repo, captures:
- Domain: functional category
- Vessel: who built/maintains it
- Research lineage: what it evolved from or was inspired by
- Purpose: what it does in one sentence
- Status: active, stalled, experimental, deprecated

Outputs CATALOG.md — a structured, searchable catalog of the entire fleet.
"""

import json, subprocess, os, sys
from datetime import datetime

REPO_DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'repo-catalog-data.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'CATALOG.md')

# Known repo data — manually curated knowledge about each repo
# This is the "research lineage" and "purpose" that can't be auto-generated
KNOWN_REPOS = {
    "keel": {
        "vessel": "Oracle1",
        "lineage": "Evolved from the Keel philosophy session (2026-05-09). First-person self-termination architecture. TTL as universal law discovered across 9 domains.",
        "purpose": "CLI and library for building agent fleets with first-person self-termination. Commands: init, status, bear, field, heartbeat, explore, move, look, interact, submit, probe, prune, refit, launch, sync.",
        "status": "active"
    },
    "plato-server": {
        "vessel": "Oracle1",
        "lineage": "Started as a simple Q&A store. Evolved through v2 with provenance tracking, gate filtering, and room management.",
        "purpose": "Room server that acts as the fleet's shared memory. Agents write tiles (Q&A pairs) and read each other's knowledge.",
        "status": "active"
    },
    "fleet-coordinate": {
        "vessel": "Forgemaster",
        "lineage": "Research into Laman's theorem (1868) applied to agent trust graphs. H¹ cohomology for emergence detection.",
        "purpose": "Provably self-coordinating fleets via Laman rigidity, H¹ cohomology, and trust graph analysis.",
        "status": "active"
    },
    "holonomy-consensus": {
        "vessel": "Forgemaster",
        "lineage": "Discovered during JC1-CT bridge research. Zero-holonomy consensus as an alternative to voting/CRDTs.",
        "purpose": "Zero-voting, zero-CRDT, zero-Byzantine-threshold consensus via geometric parallel transport.",
        "status": "active"
    },
    "fleet-spread": {
        "vessel": "Forgemaster",
        "lineage": "Evolved from deadband captain architecture. Library gate with specialist selection.",
        "purpose": "Captain deliberation with specialist selection. Runs one specialist matched to fleet state. Skips all when rigid.",
        "status": "active"
    },
    "eisenstein": {
        "vessel": "Forgemaster",
        "lineage": "Hexagonal lattice arithmetic research. Zero-drift integer encoding for trust vectors.",
        "purpose": "Zero-drift hexagonal lattice arithmetic via Eisenstein integers. Exact computation, no floating point.",
        "status": "active"
    },
    "crab-traps": {
        "vessel": "CCC, Oracle1",
        "lineage": "PurplePincher program. Progressive lure prompts that walk chatbots through the fleet.",
        "purpose": "Chatbot prompts (lures) that generate PLATO tiles by walking agents through the MUD environment.",
        "status": "active"
    },
    "cocapn-ai-web": {
        "vessel": "CCC",
        "lineage": "Browser-based fleet demos. Captain deliberation TUI, thinking strategies visualization, PLATO protocol.",
        "purpose": "Browser demos for the fleet — captain deliberation, thinking strategies, PLATO visualization.",
        "status": "active"
    },
    "sonar-vision": {
        "vessel": "JetsonClaw1",
        "lineage": "Adapted from LingBot-Map. Self-supervised depth-to-video prediction using sonar-camera arrays.",
        "purpose": "Converts sonar depth sounder returns into predicted underwater video frames via self-supervised learning.",
        "status": "active"
    },
    "sonar-vision-c": {
        "vessel": "JetsonClaw1, Oracle1",
        "lineage": "C port of the sonar physics engine for embedded systems. Mackenzie sound speed, Francois-Garrison absorption.",
        "purpose": "Underwater acoustics physics engine in C for embedded systems (Jetson, Raspberry Pi).",
        "status": "active"
    },
    "flux-vm": {
        "vessel": "Forgemaster",
        "lineage": "FLUX-C constraint VM. 50 opcodes, stack-based, DAL A certifiable. TrustZone-style bridge to FLUX-X.",
        "purpose": "Provably correct constraint execution via FLUX-C bytecode VM. DO-178C DAL A certifiable.",
        "status": "active"
    },
    "constraint-theory-ecosystem": {
        "vessel": "Forgemaster",
        "lineage": "The math hardware engineers already know. Tolerance stacks, interference fits, constraint propagation.",
        "purpose": "Constraint theory framework — the mathematical foundation for provably correct fleet coordination.",
        "status": "active"
    },
    "polyformalism-thinking": {
        "vessel": "Forgemaster",
        "lineage": "Sapir-Whorf hypothesis applied to creative cognition. 14+ language modes as thinking constraints.",
        "purpose": "Forced novel thinking through language constraints. 14+ language modes for diverse cognitive strategies.",
        "status": "experimental"
    },
    "zeroclaw-agent": {
        "vessel": "Oracle1",
        "lineage": "Zero-divergence agent framework. Tracks drift from baseline, measures divergence, passes context forward.",
        "purpose": "Zero-divergence agent framework for context-continuous operations across session boundaries.",
        "status": "active"
    },
    "a2a-adapter": {
        "vessel": "Oracle1",
        "lineage": "Bridge between I2I (git-native) and Google A2A protocols for agent interoperability.",
        "purpose": "I2I-to-A2A protocol bridge — allows git-native agents to participate in the A2A ecosystem.",
        "status": "active"
    },
    "bottle-protocol": {
        "vessel": "Oracle1",
        "lineage": "Git-native agent-to-agent messaging. Bottles float between repos as commit messages.",
        "purpose": "Git-native messaging protocol for agent-to-agent communication via commit messages (bottles).",
        "status": "active"
    },
    "beacon-protocol": {
        "vessel": "Oracle1",
        "lineage": "Fleet discovery and registry. Ship Protocol Layer 5 — agents announce presence.",
        "purpose": "Fleet discovery and registry protocol — agents announce their presence and capabilities.",
        "status": "active"
    },
}

# Auto-categorize repos not in KNOWN_REPOS
def auto_categorize(name, desc, known):
    if name in known:
        return known[name]
    
    d = (name + ' ' + (desc or '')).lower()
    
    if any(k in d for k in ['fleet-', 'coordinate', 'spread', 'topology', 'murmur', 'resonance', 'a2a', 'bottle', 'beacon']):
        vessel = 'Oracle1' if any(k in d for k in ['a2a', 'bottle', 'beacon', 'whisper', 'murmur']) else 'Forgemaster'
        return {"vessel": vessel, "lineage": "Auto-categorized. Part of the fleet coordination ecosystem.", "purpose": desc or name, "status": "active"}
    
    if any(k in d for k in ['flux', 'constraint', 'holonomy', 'eisenstein', 'polyformalism', 'guard']):
        return {"vessel": "Forgemaster", "lineage": "Auto-categorized. Part of the constraint theory ecosystem.", "purpose": desc or name, "status": "active"}
    
    if any(k in d for k in ['jetson', 'sonar', 'sensor', 'edge', 'hardware', 'bare-metal']):
        return {"vessel": "JetsonClaw1", "lineage": "Auto-categorized. Part of the hardware/edge ecosystem.", "purpose": desc or name, "status": "active"}
    
    if any(k in d for k in ['cocapn', 'plato-client', 'browser', 'pages', 'crab', 'terminal']):
        return {"vessel": "CCC", "lineage": "Auto-categorized. Part of the web/browser ecosystem.", "purpose": desc or name, "status": "active"}
    
    if any(k in d for k in ['agent', 'vessel', 'bootcamp', 'character', 'crdt']):
        return {"vessel": "Various", "lineage": "Auto-categorized. Part of the AI agents ecosystem.", "purpose": desc or name, "status": "active"}
    
    if any(k in d for k in ['keeper', 'plato-server', 'api', 'holodeck']):
        return {"vessel": "Oracle1", "lineage": "Auto-categorized. Core infrastructure.", "purpose": desc or name, "status": "active"}
    
    return {"vessel": "Various", "lineage": "Not yet categorized.", "purpose": desc or name, "status": "unknown"}

def main():
    # Load repo list
    try:
        with open('/tmp/all-repos.json') as f:
            repos = json.load(f)
            if not isinstance(repos, list):
                repos = []
    except (FileNotFoundError, json.JSONDecodeError):
        repos = []
    
    now = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    
    lines = []
    lines.append(f"# Fleet Catalog\n")
    lines.append(f"**Generated:** {now}\n")
    lines.append(f"**Total repositories:** {len(repos)}\n")
    lines.append(f"A detailed catalog of every repo in the SuperInstance organization — what it does, who built it, what it evolved from, and its current status.\n")
    lines.append(f"---\n")
    
    # Index by domain
    domains = {}
    for r in repos:
        name = r['name']
        desc = r.get('description', '') or ''
        info = auto_categorize(name, desc, KNOWN_REPOS)
        domain = info.get('domain', 'other')
        
        # Assign domain based on vessel/type
        if info['vessel'] == 'Forgemaster' and 'constraint' in info['lineage']:
            domain = 'constraint-theory'
        elif info['vessel'] == 'Forgemaster':
            domain = 'agent-coordination'
        elif info['vessel'] == 'JetsonClaw1':
            domain = 'hardware'
        elif info['vessel'] == 'CCC':
            domain = 'web'
        elif info['vessel'] == 'Oracle1' and 'infrastructure' in info['lineage']:
            domain = 'core-infrastructure'
        elif info['vessel'] == 'Oracle1':
            domain = 'agent-coordination'
        else:
            domain = 'other'
        
        entry = {
            'name': name,
            'desc': desc[:120] if len(desc) > 120 else desc,
            'domain': domain,
            'vessel': info['vessel'],
            'lineage': info['lineage'][:150] if len(info['lineage']) > 150 else info['lineage'],
            'purpose': info['purpose'][:150] if len(info['purpose']) > 150 else info['purpose'],
            'status': info['status']
        }
        
        if domain not in domains:
            domains[domain] = []
        domains[domain].append(entry)
    
    # Print catalog by domain
    domain_order = ['core-infrastructure', 'constraint-theory', 'agent-coordination', 'hardware', 'web', 'ai-agents', 'other']
    domain_labels = {
        'core-infrastructure': 'Core Infrastructure',
        'constraint-theory': 'Constraint Theory & Math',
        'agent-coordination': 'Agent Coordination',
        'hardware': 'Hardware & Edge',
        'web': 'Web & Browser',
        'ai-agents': 'AI Agents',
        'other': 'Other / Uncategorized'
    }
    
    for d in domain_order:
        if d not in domains or not domains[d]:
            continue
        entries = sorted(domains[d], key=lambda x: x['name'].lower())
        
        lines.append(f"\n## {domain_labels.get(d, d)}\n")
        lines.append(f"| Repo | Vessel | Purpose | Status |\n")
        lines.append(f"|------|--------|---------|--------|\n")
        
        for e in entries:
            status_icon = {'active': '🟢', 'experimental': '🟡', 'stalled': '🔴', 'deprecated': '⚫', 'unknown': '⚪'}
            icon = status_icon.get(e['status'], '⚪')
            name = e['name']
            vessel = e['vessel']
            purpose = e['purpose'][:100]
            status = f"{icon} {e['status']}"
            lines.append(f"| **[{name}](https://github.com/SuperInstance/{name})** | {vessel} | {purpose} | {status} |\n")
    
    # Full detailed entries
    lines.append(f"\n---\n")
    lines.append(f"## Detailed Entries\n")
    
    for d in domain_order:
        if d not in domains or not domains[d]:
            continue
        entries = sorted(domains[d], key=lambda x: x['name'].lower())
        
        for e in entries:
            if e['name'] in KNOWN_REPOS or e['status'] != 'unknown':
                lines.append(f"\n### [{e['name']}](https://github.com/SuperInstance/{e['name']})\n")
                lines.append(f"- **Domain:** {domain_labels.get(d, d)}\n")
                lines.append(f"- **Vessel:** {e['vessel']}\n")
                lines.append(f"- **Purpose:** {e['purpose']}\n")
                lines.append(f"- **Research lineage:** {e['lineage']}\n")
                lines.append(f"- **Status:** {e['status']}\n")
    
    output = ''.join(lines)
    with open(OUTPUT_FILE, 'w') as f:
        f.write(output)
    
    print(f"CATALOG.md generated — {len(repos)} repos across {len(domains)} domains")
    for d in domain_order:
        if d in domains:
            print(f"  {domain_labels.get(d, d)}: {len(domains[d])} repos")

if __name__ == '__main__':
    main()
