#!/usr/bin/env python3
"""floor_map.py — lay the fleet canon onto the Penrose multigrid floor.

The quilt floor's identity model is integer (k,s) grid space — floats never
touch identity (multigrid.test.mjs §1). This map honors that: every canon
node sits at a Penrose vertex whose full coordinate is five INTEGERS
(the multigrid offsets of the five grids at that intersection).

Method:
  5 grids, directions e_j = (cos 72j, sin 72j); grid j line k: x.e_j = -k.
  A floor VERTEX is exactly one crossing: identity = (i, ki, j, kj) — the
  two grid lines that cross, no floats, no rounding. The five-integer
  tuple is the TILE index (cells, not vertices); nodes-on-cells is the
  next iteration.
  Enumerate all line pairs within |k| <= R, order center-out (radius, then
  angle), assign nodes in that order.

Output: canon-floor.svg (view with any browser) + a summary line.
"""
import json
import math
import os
import re
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))

R = 8  # 10 * (2R+1)^2 = 2,890 crossings; 2,003 nodes fit with headroom
N_GRIDS = 5
DEG72 = math.radians(72)
E = [(math.cos(DEG72 * j), math.sin(DEG72 * j)) for j in range(N_GRIDS)]


def vertex(ki, i, kj, j):
    """Intersection of grid-i line ki with grid-j line kj -> (x, y, k_full)."""
    ei, ej = E[i], E[j]
    dot = ei[0] * ej[0] + ei[1] * ej[1]
    det = 1.0 - dot * dot
    # solve [1 dot; dot 1] [a; b] = [-ki; -kj]  (x = a*ei + b*ej)
    a = (-ki + dot * kj) / det
    b = (dot * ki - kj) / det
    x, y = a * ei[0] + b * ej[0], a * ei[1] + b * ej[1]
    k_full = tuple(int(round(-(x * E[l][0] + y * E[l][1]))) for l in range(N_GRIDS))
    return x, y, k_full


def enum_vertices():
    # identity = (i, ki, j, kj) — the two grid lines that cross.
    # (The five-integer tuple is the TILE index: cells, not vertices.
    # Deduping vertices by rounded tile index merges distinct crossings
    # that share a tile — found the hard way: 2,250 pair-hits collapsed
    # to 1,121. Vertex identity stays exact.)
    verts = []
    seen_xy = set()
    for i in range(N_GRIDS):
        for j in range(i + 1, N_GRIDS):
            for ki in range(-R, R + 1):
                for kj in range(-R, R + 1):
                    x, y, _kf = vertex(ki, i, kj, j)
                    key = (round(x, 9), round(y, 9))
                    if key in seen_xy:
                        continue
                    seen_xy.add(key)
                    verts.append(((i, ki, j, kj), x, y))
    verts.sort(key=lambda v: (math.hypot(v[1], v[2]), math.atan2(v[2], v[1])))
    return verts


# ---- fabric (same union as the R&D report) ----
def load_fabric(graph):
    feeds = defaultdict(list)
    edges = []
    for f in ('/tmp/stub-spec-tier1.json', '/tmp/stub-spec-apps.json',
              '/tmp/stub-spec-infra.json', '/tmp/stub-spec-t2.json'):
        try:
            spec = json.load(open(f))
        except FileNotFoundError:
            continue
        for r in spec['repos']:
            for line in r['stub'].splitlines():
                if line.startswith(('feeds:', 'owed_by:')):
                    key, val = line.split(':', 1)
                    items = [x.strip() for x in val.strip().strip('[]').split(',') if x.strip()]
                    if key.strip() == 'feeds':
                        feeds[r['name']] = items
        # post-round amendments
        feeds['quilt-live-canon'] = ['live-canon-npm', 'live-canon-pypi', 'live-canon-gh']
        feeds['hermit'] = ['tidepool', 'duke-lab']
        feeds['tidepool'] = ['quilt-studio', 'duke-lab']
        feeds['canon-claim'] = ['quilt-canvas-demo']
        feeds['canon-hash'] = ['quilt-canvas-demo']
        feeds['canon-paper'] = ['quilt-canvas-demo']
        feeds['canon-recs'] = ['quilt-canvas-demo']
    for src, tgts in feeds.items():
        for t in tgts:
            edges.append((src, t))
    return edges


PALETTE = [
    "#8b9dc3", "#f4a261", "#2a9d8f", "#e76f51", "#9b5de5",
    "#00bbf9", "#fee440", "#f15bb5", "#43aa8b", "#277da1",
    "#f9844a", "#90be6d", "#c9ada7", "#e63946",
]
FAMILIES = ["other-uncategorized", "agent-coordination", "constraint-theory",
            "hardware-edge", "web-browser", "infra", "sites", "applications",
            "canon", "quilt", "plato"]
FAM_COLOR = {f: PALETTE[i % len(PALETTE)] for i, f in enumerate(FAMILIES)}


def esc(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


def main():
    g = json.load(open(os.path.join(HERE, 'graph.json')))
    nodes = g['nodes']
    verts = enum_vertices()
    if len(verts) < len(nodes):
        raise SystemExit(f"R={R} yields {len(verts)} vertices < {len(nodes)} nodes; raise R")
    pos = {}
    for node, (ident, x, y) in zip(nodes, verts):
        pos[node['name']] = (x, y, ident)

    edges = load_fabric(g)
    fedges = [(s, t) for s, t in edges if s in pos and t in pos]

    size, cx, cy = 1300, size // 2 if False else 650, 650
    maxr = max(math.hypot(x, y) for _, x, y in verts) * 1.04
    scale = 600 / maxr
    tier1 = {n['name'] for n in nodes if n['tier'] == 1}
    famcount = Counter(n['family'] for n in nodes)

    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">',
           '<rect width="100%" height="100%" fill="#0b0f17"/>',
           f'<text x="{cx}" y="46" fill="#e8eaf0" font-family="monospace" font-size="24" text-anchor="middle">THE FLEET CANON ON THE PENROSE FLOOR</text>',
           f'<text x="{cx}" y="70" fill="#8b93a8" font-family="monospace" font-size="13" text-anchor="middle">{len(nodes)} nodes · {len(fedges)} fabric edges · floor identity = (i, ki, j, kj) — the two grid lines that cross · multigrid R={R}</text>']

    # fabric edges first (under dots)
    for s, t in fedges:
        x1, y1, _ = pos[s]
        x2, y2, _ = pos[t]
        X1, Y1 = cx + x1 * scale, cy + y1 * scale
        X2, Y2 = cx + x2 * scale, cy + y2 * scale
        mx, my = (X1 + X2) / 2, (Y1 + Y2) / 2
        dx, dy = X2 - X1, Y2 - Y1
        L = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / L, dx / L
        bend = min(40.0, L * 0.18)
        out.append(f'<path d="M {X1:.1f} {Y1:.1f} Q {mx + nx * bend:.1f} {my + ny * bend:.1f} {X2:.1f} {Y2:.1f}" fill="none" stroke="#ffd166" stroke-width="1.6" opacity="0.85"/>')

    # nodes
    for node in nodes:
        x, y, _ident = pos[node['name']]
        X, Y = cx + x * scale, cy + y * scale
        col = FAM_COLOR.get(node['family'], '#666')
        r = 4.2 if node['tier'] == 1 else 2.0
        op = '1' if node['tier'] == 1 else '0.75'
        out.append(f'<circle cx="{X:.1f}" cy="{Y:.1f}" r="{r}" fill="{col}" opacity="{op}"/>')

    # tier-1 labels (short)
    lbl_n = 0
    for node in nodes:
        if node['tier'] != 1 or lbl_n >= 40:
            continue
        x, y, _ident = pos[node['name']]
        X, Y = cx + x * scale, cy + y * scale
        name = node['name'][:18]
        out.append(f'<text x="{X + 7:.1f}" y="{Y + 4:.1f}" fill="#e8eaf0" font-family="monospace" font-size="11">{esc(name)}</text>')
        lbl_n += 1

    # legend
    lx, ly = 40, size - 40 - 18 * len([f for f in famcount if famcount[f] >= 2])
    out.append(f'<g font-family="monospace" font-size="12">')
    for i, (f, c) in enumerate(sorted(famcount.items(), key=lambda kv: -kv[1])):
        if c < 2:
            continue
        col = FAM_COLOR.get(f, '#666')
        out.append(f'<rect x="{lx}" y="{ly + i * 18}" width="10" height="10" fill="{col}"/>')
        out.append(f'<text x="{lx + 16}" y="{ly + i * 18 + 9}" fill="#aab2c5">{esc(f)} ({c})</text>')
    out.append(f'<line x1="{lx + 210}" y1="{ly + 4}" x2="{lx + 250}" y2="{ly + 4}" stroke="#ffd166" stroke-width="1.6"/>')
    out.append(f'<text x="{lx + 256}" y="{ly + 9}" fill="#aab2c5">feeds/owed_by fabric edge</text>')
    out.append('</g>')
    out.append(f'<text x="{cx}" y="{size - 14}" fill="#5c6370" font-family="monospace" font-size="11" text-anchor="middle">generated by fleet-canon/floor_map.py · canon Layer G × quilt floor · 2026-09-18</text>')
    out.append('</svg>')

    with open(os.path.join(HERE, 'canon-floor.svg'), 'w') as f:
        f.write('\n'.join(out))
    print(f"floor: {len(nodes)} nodes on {len(verts)} vertices (R={R}), {len(fedges)} fabric edges drawn -> fleet-canon/canon-floor.svg ({len(out)} svg elements)")


if __name__ == '__main__':
    main()
