// The multigrid — de Bruijn's pentagrid and its dual, the rhombic Penrose
// floor (P3). The iceberg: the 1D Fibonacci floor and the Strip were a
// cross-section; here is the crystal.
//
// Construction (all positions derived, none trusted from memory):
//   • N=5 families of lines; family k has normal n_k at angle kπ/N
//     (pentagrid: 0°, 36°, 72°, 108°, 144°). Line (k,j):
//     n_k·x = (j + γ_k)·spacing. γ is the shift vector; γ=0 is singular
//     (triple concurrences, tested), generic γ gives proper Penrose.
//   • Arrangement vertices = pairwise intersections; each has a ℤ^N lift
//     (cell indices j_i = round(n_i·x − γ_i)) and defining lines.
//   • Faces = index vectors adjacent to each arrangement segment. A face
//     with index vector j sits at
//         x(j) = (2/N) · Σ_k (j_k + γ_k + ½) · n_k          (N=5 → 2/5)
//     because Σ n_k n_kᵀ = (N/2)·I — the strip center is the least-squares
//     center of the five strips. Verified to 1e-12 in tests.
//   • Dual edges: each arrangement segment separates exactly two faces
//     j⁺ and j⁻; they differ by ±1 in exactly the segment's family k, and
//     x(j⁺) − x(j⁻) = (2/N)·n_k EXACTLY — every dual edge has the same
//     length and one of the five normal directions. That is the Penrose
//     P3 tiling (de Bruijn's theorem; here re-derived, not quoted).
//   • Dual tiles: the faces around each arrangement vertex form a rhombus
//     (degree 4 at generic γ): thick (72°) or thin (36°) by the angle
//     between the two defining normals.
//
// THE ICEBERG TEST (multigrid.test.mjs): dual edges of family k lie on
// lines with two-gap intercept structure in ratio φ, sequenced as the
// Fibonacci word — the 1D floor hiding inside every direction of the 2D
// crystal. Anti-vacuity: detuned normals break the two-gap law exactly.

import { PHI } from './golden.mjs';

export const TAU = Math.PI * 2;

// Cell indices are FLOORS, not rounds: the face with index j is the strip
// j ≤ n·x − γ < j+1. Round() silently picks the neighbor half the time —
// that one bug bent every downstream constant (edge lengths came out
// 2φ/5 and 2·SQ/5 instead of the unique 2/5).
function tieFloor(r) {
  const q = Math.round(r);
  return Math.abs(r - q) < 1e-9 ? q : Math.floor(r);
}

// THE GOLDEN GAPS (pinned by probe, locked by tests): family-k edge-lines
// of the pentagrid dual have intercept gaps drawn from
//   S   = (2/5)·sin(2π/5)·φ⁻³
//   L   = (2/5)·sin(2π/5)·φ⁻² = S·φ
//   S+L = (2/5)·sin(2π/5)·φ⁻¹
// In the patch core, consecutive gaps take exactly {L, S+L} (ratio φ,
// no two L adjacent); S appears as their difference and as a rare clipped
// residual. The detuned grid (alternating ±2° normals) breaks all of this
// — 12 distinct gap values, smallest ratio 1.43 — anti-vacuity in the
// test file. Edge length (2/5) is the lattice unit; sin(2π/5) is the
// altitude of the thick rhombus.
export function goldenGaps() {
  const a = (2 / 5) * Math.sin(2 * Math.PI / 5);
  return { S: a * Math.pow(PHI, -3), L: a * Math.pow(PHI, -2), SL: a * Math.pow(PHI, -1) };
}

// Normal of family k for an N-grid: angle k·π/N.
export function gridNormal(k, N = 5) {
  const a = Math.PI * k / N;
  return [Math.cos(a), Math.sin(a)];
}

// Dual-tiling edge direction for family k: exactly n_k (each dual edge
// telescopes to (2/N)·n_k — see file header).
export function edgeDirection(k, N = 5) {
  return gridNormal(k, N);
}

export class Multigrid {
  constructor({ N = 5, gamma = null, reach = 3, spacing = 1 } = {}) {
    this.N = N;
    this.gamma = gamma ?? new Array(N).fill(0.5);
    this.reach = reach;
    this.spacing = spacing;
    this.normals = Array.from({ length: N }, (_, k) => gridNormal(k, N));
  }

  lineCount() { return 2 * this.reach + 1; }

  // ---- arrangement: vertices and segments -----------------------------

  // Pairwise intersections between distinct families, deduped by position
  // (the lift is DATA, not identity — distinct vertices can share a lift
  // vector when they sit in the same index slab; that bug bit once).
  arrangementVertices() {
    const { N, normals, gamma, spacing, reach } = this;
    const found = new Map();
    const vs = [];
    for (let k = 0; k < N; k++) {
      for (let l = k + 1; l < N; l++) {
        const [ax, ay] = normals[k], [bx, by] = normals[l];
        const det = ax * by - ay * bx;
        for (let j = -reach; j <= reach; j++) {
          for (let m = -reach; m <= reach; m++) {
            const ck = (j + gamma[k]) * spacing;
            const cl = (m + gamma[l]) * spacing;
            const x = (ck * by - cl * ay) / det;
            const y = (ax * cl - bx * ck) / det;
            const key = `${Math.round(x * 1e9)},${Math.round(y * 1e9)}`;
            if (found.has(key)) {
              // triple concurrence: record the extra defining line
              const v = vs[found.get(key)];
              v.lines.push({ k, j });
              continue;
            }
            found.set(key, vs.length);
            const lift = new Array(N);
            for (let i = 0; i < N; i++)
              lift[i] = tieFloor((normals[i][0] * x + normals[i][1] * y) / spacing - gamma[i]);
            vs.push({ x, y, lift, lines: [{ k, j }, { k: l, j: m }] });
          }
        }
      }
    }
    return vs;
  }

  // Segments of the arrangement, as TRUE 1-faces: each line is split at its
  // crossings with EVERY other family — including lines one step beyond the
  // reach window (they still split what we can see). Splitting only at the
  // computed vertices merged across out-of-reach lines and produced midpoint
  // ties that made the two side-faces disagree (the 6 bent edges the probe
  // caught). Each segment carries its two adjacent faces' index vectors.
  arrangementSegments() {
    const { N, normals, gamma, spacing, reach } = this;
    const segs = [];
    const d = normals.map(n => [-n[1], n[0]]);
    for (let k = 0; k < N; k++) {
      for (let j = -reach; j <= reach; j++) {
        // anchor point on line (k,j): a = (j+γ_k)·n_k (per unit spacing)
        const a = [(j + gamma[k]) * spacing * normals[k][0], (j + gamma[k]) * spacing * normals[k][1]];
        const ts = [];
        for (let q = 0; q < N; q++) {
          if (q === k) continue;
          const den = normals[q][0] * d[k][0] + normals[q][1] * d[k][1];
          if (Math.abs(den) < 1e-12) continue;
          for (let m = -reach - 1; m <= reach + 1; m++) {
            const num = (m + gamma[q]) * spacing - (normals[q][0] * a[0] + normals[q][1] * a[1]);
            ts.push(num / den);
          }
        }
        ts.sort((x, y) => x - y);
        const face = (t, sign) => {
          const mx = a[0] + t * d[k][0] + sign * 1e-7 * spacing * normals[k][0];
          const my = a[1] + t * d[k][1] + sign * 1e-7 * spacing * normals[k][1];
          const f = new Array(N);
          for (let q = 0; q < N; q++) {
            if (q === k) { f[q] = sign > 0 ? j : j - 1; continue; }
            f[q] = tieFloor((normals[q][0] * mx + normals[q][1] * my) / spacing - gamma[q]);
          }
          return f;
        };
        for (let i = 0; i + 1 < ts.length; i++) {
          const t1 = ts[i], t2 = ts[i + 1];
          if (t2 - t1 < 1e-9) continue;               // concurrence: zero-length
          const tm = (t1 + t2) / 2;
          segs.push({ k, j, t1, t2, above: face(tm, 1), below: face(tm, -1) });
        }
      }
    }
    return segs;
  }

  // ---- the dual: faces (tiling vertices), edges, tiles ---------------

  // Face = index vector; position = strip-center formula. Existence is
  // constructional: a face appears iff some arrangement segment borders it.
  faces() {
    const { N, normals, gamma } = this;
    const segs = this.arrangementSegments();
    const map = new Map();
    for (const s of segs) {
      for (const f of [s.above, s.below]) {
        const key = f.join(',');
        if (map.has(key)) continue;
        let x = 0, y = 0;
        for (let k = 0; k < N; k++) {
          const w = (f[k] + gamma[k] + 0.5);
          x += w * normals[k][0];
          y += w * normals[k][1];
        }
        x *= 2 / N; y *= 2 / N;
        map.set(key, { lift: f, x, y });
      }
    }
    return [...map.values()];
  }

  // Dual edges: one per arrangement segment; endpoints are its two faces.
  dualEdges() {
    const segs = this.arrangementSegments();
    const faces = this.faces();
    const idOf = new Map(faces.map((f, i) => [f.lift.join(','), i]));
    const edges = [];
    for (const s of segs) {
      const a = idOf.get(s.above.join(','));
      const b = idOf.get(s.below.join(','));
      if (a === undefined || b === undefined) continue;
      edges.push({ a, b, family: s.k, line: s.j });
    }
    return { faces, edges };
  }

  // Dual tiles: the faces around each arrangement vertex form a rhombus.
  // Corner lifts: vertex.lift with the two defining families shifted by
  // the four quadrant combinations.
  dualTiles() {
    const { N } = this;
    const vs = this._av ?? (this._av = this.arrangementVertices());
    const { faces, edges } = this.dualEdges();
    const idOf = new Map(faces.map((f, i) => [f.lift.join(','), i]));
    const adj = new Map();
    for (const e of edges) {
      if (!adj.has(e.a)) adj.set(e.a, []);
      if (!adj.has(e.b)) adj.set(e.b, []);
      adj.get(e.a).push(e.b);
      adj.get(e.b).push(e.a);
    }
    const tiles = [];
    for (const v of vs) {
      if (v.lines.length > 2) continue;          // concurrence: no rhombus
      const [d1, d2] = v.lines;
      const corners = [];
      let ok = true;
      for (const s1 of [0, -1]) {
        for (const s2 of [0, -1]) {
          // the four cells around the vertex: base lift, defining components
          // shifted to the line's lower side (cell j has the line as its
          // LOWER boundary — the floor convention, same as the strip)
          const f = v.lift.slice();
          f[d1.k] += s1;
          f[d2.k] += s2;
          const id = idOf.get(f.join(','));
          if (id === undefined) { ok = false; break; }
          corners.push(id);
        }
        if (!ok) break;
      }
      if (!ok) continue;
      const [n1, n2] = [this.normals[d1.k], this.normals[d2.k]];
      let ang = Math.abs(Math.atan2(n1[0] * n2[1] - n1[1] * n2[0], n1[0] * n2[0] + n1[1] * n2[1]));
      if (ang > Math.PI / 2) ang = Math.PI - ang;
      tiles.push({ corners, angle: ang, families: [d1.k, d2.k], at: [v.x, v.y] });
    }
    return { faces, edges, tiles };
  }

  // THE ICEBERG PROBE: dual edges of family k lie on lines x·n_k⊥ = c.
  // For the true Penrose: consecutive distinct c's have exactly two gap
  // values in ratio φ, sequenced as a Fibonacci word (pinned in tests).
  interceptGaps(k) {
    const n = this.normals[k];
    const perp = [-n[1], n[0]];
    const { faces, edges } = this.dualEdges();
    const set = new Map();
    for (const e of edges) {
      if (e.family !== k) continue;
      const f = faces[e.a];
      const c = perp[0] * f.x + perp[1] * f.y;
      set.set(Math.round(c * 1e9), c);           // dedup lines, keep raw
    }
    const vals = [...set.values()].sort((a, b) => a - b);
    const gaps = [];
    for (let i = 0; i + 1 < vals.length; i++) gaps.push(vals[i + 1] - vals[i]);
    return { intercepts: vals, gaps };
  }

  // Window probe: perp-space projection of face lifts. The physical plane
  // in index space is spanned by c=(cos πk/N)_k, s=(sin πk/N)_k; a face's
  // index vector y = j + γ + ½ projects there, and the remainder is the
  // window coordinate. Boundedness + central symmetry pinned in tests.
  windowCoords() {
    const { N, gamma } = this;
    const c = Array.from({ length: N }, (_, k) => Math.cos(Math.PI * k / N));
    const s = Array.from({ length: N }, (_, k) => Math.sin(Math.PI * k / N));
    const cN = Math.hypot(...c), sN = Math.hypot(...s);
    const faces = this.faces();
    return faces.map(f => {
      const y = f.lift.map((j, k) => j + gamma[k] + 0.5);
      const pc = y.reduce((a, yk, k) => a + yk * c[k], 0) / (cN * cN);
      const ps = y.reduce((a, yk, k) => a + yk * s[k], 0) / (sN * sN);
      return y.map((yk, k) => yk - pc * c[k] - ps * s[k]);
    });
  }

  // Kernel tenancy: faces become cells, dual edges become typed links,
  // one patch per bind — a tenant like every floor instrument.
  host(kernel, { name = 'mg' } = {}) {
    const { faces, edges } = this.dualEdges();
    faces.forEach((f, i) => kernel.bind(`${name}.v.${i}`, { x: f.x, y: f.y, lift: f.lift }, { index: i }));
    for (const e of edges) kernel.link(`${name}.v.${e.a}`, `${name}.v.${e.b}`, `fam${e.family}`);
    kernel.bind(`${name}.params`, { N: this.N, gamma: this.gamma, reach: this.reach });
    return { vertices: faces.length, edges: edges.length };
  }
}
