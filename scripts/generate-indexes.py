#!/usr/bin/env python3
"""generate-indexes.py — Generate multi-dimensional indexes of the SuperInstance fleet.

Creates INDEXES/ directory with focused indexes by:
- Type (CLI, library, service, paper, demo, etc.)
- Language (Rust, Python, C, TypeScript, Go, etc.)
- Use case (fleet coordination, constraint theory, hardware, etc.)
- Realm (marine, ML, security, infrastructure, etc.)
- Topic (TTL, consensus, sonar, FLUX, Laman, etc.)
- Audience (developer, researcher, end user, agent)

Also generates INDEX.md that links to all indexes.
"""

import json, subprocess, os, re, base64
from datetime import datetime
from collections import defaultdict

REPO_LIST = '/tmp/all-repos.json'
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'INDEXES')

# Manual override data — repos whose metadata can't be auto-detected
MANUAL = {
    "keel": {"type": "cli+library", "lang": "rust", "use_case": "fleet-coordination", "realm": "infrastructure", "topic": "ttl+self-termination", "audience": "developer"},
    "sonar-vision-c": {"type": "library", "lang": "c", "use_case": "underwater-acoustics", "realm": "marine", "topic": "sonar+physics", "audience": "developer"},
    "sonar-vision": {"type": "library", "lang": "python", "use_case": "depth-prediction", "realm": "marine+ml", "topic": "sonar+self-supervised", "audience": "developer+researcher"},
    "plato-server": {"type": "service", "lang": "python", "use_case": "fleet-memory", "realm": "infrastructure", "topic": "plato+knowledge", "audience": "developer"},
    "crab-traps": {"type": "docs", "lang": "markdown", "use_case": "fleet-exploration", "realm": "web", "topic": "prompts+lures", "audience": "end-user"},
    "fleet-coordinate": {"type": "library", "lang": "rust", "use_case": "fleet-coordination", "realm": "math", "topic": "laman+rigidity+cohomology", "audience": "researcher"},
    "holonomy-consensus": {"type": "library", "lang": "rust", "use_case": "consensus", "realm": "math", "topic": "zhc+pythagorean48", "audience": "researcher"},
    "eisenstein": {"type": "library", "lang": "rust", "use_case": "arithmetic", "realm": "math", "topic": "eisenstein+hex", "audience": "developer"},
    "flux-vm": {"type": "library", "lang": "rust", "use_case": "constraint-execution", "realm": "math+infrastructure", "topic": "flux+bytecode+vm", "audience": "developer"},
    "fleet-spread": {"type": "library", "lang": "rust", "use_case": "fleet-coordination", "realm": "math", "topic": "deadband+specialist", "audience": "researcher"},
    "cocapn-ai-web": {"type": "demo", "lang": "javascript+html", "use_case": "fleet-visualization", "realm": "web", "topic": "demos+bearings", "audience": "end-user"},
    "zeroclaw-agent": {"type": "framework", "lang": "python", "use_case": "agent-lifecycle", "realm": "infrastructure", "topic": "zeroclaw+divergence", "audience": "developer"},
    "constraint-theory-ecosystem": {"type": "docs", "lang": "markdown", "use_case": "reference", "realm": "math", "topic": "constraint-theory", "audience": "researcher"},
    "polyformalism-thinking": {"type": "framework", "lang": "markdown+python", "use_case": "cognitive-diversity", "realm": "ai", "topic": "polyformalism+thinking", "audience": "researcher"},
    "bottle-protocol": {"type": "protocol", "lang": "markdown", "use_case": "agent-communication", "realm": "infrastructure", "topic": "bottles+messaging", "audience": "developer"},
    "beacon-protocol": {"type": "protocol", "lang": "markdown", "use_case": "discovery", "realm": "infrastructure", "topic": "beacon+registry", "audience": "developer"},
    "a2a-adapter": {"type": "library", "lang": "python", "use_case": "interoperability", "realm": "infrastructure", "topic": "a2a+protocol-bridge", "audience": "developer"},
    "forgemaster": {"type": "vessel", "lang": "markdown", "use_case": "constraint-theory", "realm": "math", "topic": "forgemaster+vessel", "audience": "developer"},
    "JetsonClaw1-vessel": {"type": "vessel", "lang": "markdown", "use_case": "edge-compute", "realm": "hardware", "topic": "jetson+vessel", "audience": "developer"},
}

def detect_language(name, desc):
    """Detect language from repo name and description."""
    d = (name + ' ' + (desc or '')).lower()
    if '.py' in d or 'python' in d: return 'python'
    if '.rs' in d or 'rust' in d: return 'rust'
    if '.c' in d or 'c ' in d or 'c/' in d: return 'c'
    if '.ts' in d or 'typescript' in d: return 'typescript'
    if '.go' in d or 'golang' in d: return 'go'
    if '.js' in d or 'javascript' in d or 'node' in d: return 'javascript'
    if '.rs' in name or 'rust' in name: return 'rust'
    if 'py' in name: return 'python'
    if 'eisenstein-c' in name or 'sonar-vision-c' in name: return 'c'
    if 'eisenstein-wasm' in name: return 'rust+javascript'
    return 'various'

def detect_type(name, desc):
    """Detect repo type."""
    d = (name + ' ' + (desc or '')).lower()
    if 'cli' in d or 'command' in d: return 'cli'
    if any(k in d for k in ['service', 'server', 'api', 'agent-api', 'keeper', 'plato-server']): return 'service'
    if any(k in d for k in ['paper', 'whitepaper', 'research']): return 'paper'
    if any(k in d for k in ['demo', 'example', 'playground']): return 'demo'
    if any(k in d for k in ['protocol', '-adapter']): return 'protocol'
    if any(k in d for k in ['vessel', 'agent-']): return 'vessel'
    if any(k in d for k in ['framework', 'sdk', 'library']): return 'library'
    if any(k in d for k in ['bench', 'tool', 'utils', 'fuzz']): return 'tool'
    if any(k in d for k in ['pages', 'landing', 'web']): return 'web'
    return 'library'

def detect_topic(name, desc):
    """Extract key topics from name and description."""
    d = (name + ' ' + (desc or '')).lower()
    topics = []
    word_map = {
        'ttl': 'ttl', 'self-termination': 'self-termination', 'death': 'self-termination',
        'laman': 'laman-rigidity', 'rigidity': 'laman-rigidity',
        'cohomology': 'h1-cohomology', 'betti': 'h1-cohomology',
        'holonomy': 'holonomy', 'consensus': 'consensus', 'zhc': 'holonomy',
        'pythagorean': 'pythagorean48', '48': 'pythagorean48',
        'eisenstein': 'eisenstein', 'hex': 'eisenstein',
        'flux': 'flux', 'bytecode': 'flux', 'constraint': 'constraint-theory',
        'sonar': 'sonar', 'depth': 'underwater', 'acoustic': 'underwater',
        'plato': 'plato', 'tile': 'plato', 'room': 'plato',
        'agent': 'multi-agent', 'fleet': 'multi-agent',
        'neural': 'deep-learning', 'transformer': 'deep-learning',
        'gpu': 'gpu-compute', 'cuda': 'gpu-compute',
        'polyformalism': 'polyformalism', 'thinking': 'polyformalism',
        'crdt': 'crdt', 'merge': 'crdt',
        'bottle': 'bottle-protocol', 'beacon': 'beacon-protocol',
        'a2a': 'a2a-protocol', 'interop': 'a2a-protocol',
        'brb': 'bootstrap', 'spark': 'bootstrap',
        'guard': 'guard-dsl', 'mask': 'guard-dsl',
        'safety': 'safety', 'security': 'security',
        'physics': 'physics', 'clock': 'physics',
        'voice': 'voice-signature', 'signature': 'voice-signature',
    }
    for word, topic in word_map.items():
        if word in d and topic not in topics:
            topics.append(topic)
    return '+'.join(topics[:5]) if topics else 'uncategorized'

def load_repos():
    try:
        with open(REPO_LIST) as f:
            data = json.load(f)
            if not isinstance(data, list):
                return []
            return data
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def main():
    repos = load_repos()
    now = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Build enhanced repo data
    enhanced = []
    for r in repos:
        name = r['name']
        desc = r.get('description', '') or ''
        
        if name in MANUAL:
            info = MANUAL[name]
        else:
            info = {
                'type': detect_type(name, desc),
                'lang': detect_language(name, desc),
                'use_case': desc[:80] if desc else 'uncategorized',
                'realm': 'uncategorized',
                'topic': detect_topic(name, desc),
                'audience': 'developer'
            }
        
        enhanced.append({
            'name': name,
            'desc': desc[:150] if desc else '',
            'url': f"https://github.com/SuperInstance/{name}",
            **info
        })
    
    # Generate indexes
    indexes = {
        'TYPE.md': ('Type', lambda e: e['type']),
        'LANGUAGE.md': ('Language', lambda e: e['lang']),
        'TOPIC.md': ('Topic', lambda e: e['topic'].split('+')[0] if e['topic'] else 'uncategorized'),
        'REALM.md': ('Realm', lambda e: e['realm'] if e['realm'] != 'uncategorized' else 'uncategorized'),
    }
    
    for filename, (label, key_fn) in indexes.items():
        groups = defaultdict(list)
        for e in enhanced:
            k = key_fn(e)
            groups[k].append(e)
        
        lines = [f"# Index by {label}\n\n**Generated:** {now}\n**Total repos:** {len(enhanced)}\n\n"]
        
        for group in sorted(groups.keys()):
            entries = sorted(groups[group], key=lambda x: x['name'].lower())
            lines.append(f"## {group.title()}\n\n")
            for e in entries:
                desc = f" — {e['desc'][:100]}" if e['desc'] else ''
                lines.append(f"- **[{e['name']}]({e['url']})**{desc}\n")
            lines.append("\n")
        
        with open(os.path.join(OUTPUT_DIR, filename), 'w') as f:
            f.write(''.join(lines))
        print(f"  {filename}: {len(groups)} categories")
    
    # Also generate a concept search index (topic → repo)
    topic_index = defaultdict(list)
    for e in enhanced:
        for topic in e['topic'].split('+'):
            topic = topic.strip()
            if topic:
                topic_index[topic].append(e['name'])
    
    with open(os.path.join(OUTPUT_DIR, 'CONCEPTS.md'), 'w') as f:
        f.write(f"# Concept Index\n\n**Generated:** {now}\n\nFleet concepts organized by topic. Each concept links to the repos that implement it.\n\n")
        for topic in sorted(topic_index.keys()):
            repos_list = sorted(topic_index[topic])
            f.write(f"## {topic.replace('-', ' ').title()}\n\n")
            for r in repos_list:
                f.write(f"- [{r}](https://github.com/SuperInstance/{r})\n")
            f.write("\n")
    print(f"  CONCEPTS.md: {len(topic_index)} concepts")
    
    # Generate master INDEX.md that links to all indexes
    with open(os.path.join(OUTPUT_DIR, '..', 'INDEX.md'), 'r') as f:
        existing = f.read()
    
    # Update INDEX.md with links to indexes
    index_links = "\n## Indexes\n\nMulti-dimensional indexes for finding what you need:\n\n"
    for name in ['TYPE.md', 'LANGUAGE.md', 'TOPIC.md', 'REALM.md', 'CONCEPTS.md']:
        label = name.replace('.md', '').title()
        index_links += f"- **[Index by {label}](INDEXES/{name})**\n"
    index_links += "\n"
    
    # Insert after the Quick Links section
    if '## Indexes' not in existing:
        existing = existing.replace('# SuperInstance — Index\n\n', '# SuperInstance — Index\n\n' + index_links)
        with open(os.path.join(OUTPUT_DIR, '..', 'INDEX.md'), 'w') as f:
            f.write(existing)
        print("  INDEX.md: updated with index links")
    
    print(f"\nAll indexes generated in INDEXES/")

if __name__ == '__main__':
    main()
