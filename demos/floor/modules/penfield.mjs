// The field on the floor — Phyllomandel orbiters seated at Penrose vertices.
//
// The 1D field seeds orbiters along a Vogel spiral (one index, one golden
// angle). The 2D floor generalizes the address space: every core Penrose
// vertex (an arrangement face of the multigrid dual) hosts an orbiter whose
// complex parameter c IS the vertex position. The vertices are not numbered
// by a spiral but by the cut-and-project lift — and read along any grid
// direction, their address gaps form a rank-2 golden module: two atoms
// p < q with q/p = φ, every gap m·p + n·q for small integers m, n (probed
// 2026-09-17; the φ-ladder hypothesis died with rung offsets −0.44 — the
// truth is the integer span, docs/THE-FLOOR.md §8).
//
// Honest note: same sea as phyllomandel.mjs — z → z² + c is not invertible;
// the registered inverse is a documented no-op; real reversal is history/undo.

import { PHI } from './golden.mjs';

const LISTEN_DEG = 36; // a grid (normal) direction — the floor's ear

export class PenField {
  constructor(kernel, multigrid, { coreFrac = 0.35 } = {}) {
    this.k = kernel;
    this.mg = multigrid;
    this.coreFrac = coreFrac;
    const pts = this.vertices();
    kernel.bind('penfield.c', pts.map(p => [p.x, p.y]),
      { what: 'orbiter seats = core Penrose vertex positions' });
    kernel.bind('penfield.z', pts.map(() => [0, 0]),
      { what: 'orbit state, advanced coherently per kernel tick' });
    kernel.bind('penfield.escaped', 0, { what: 'orbiters past the radius-2 horizon' });
    kernel.bind('penfield.ladder', null,
      { what: 'the rank-2 golden module of projected address gaps, measured' });
    kernel.effect('penfield.z', 'step',
      zs => {
        const c = this.k.view('penfield.c');
        let escaped = this.k.view('penfield.escaped');
        const out = zs.map((z, i) => {
          if (z === null) return null;                        // gone, stay gone
          const [zx, zy] = z, [cx, cy] = c[i];
          const nz = [zx * zx - zy * zy + cx, 2 * zx * zy + cy];
          if (nz[0] * nz[0] + nz[1] * nz[1] > 4) { escaped++; return null; }
          return nz;
        });
        this.k.bind('penfield.escaped', escaped);
        return out;
      },
      v => v); // documented no-op — irreversibility is the sea's nature
    this.sampleLadder();
  }

  // Core Penrose vertices: arrangement faces (dual vertices) inside the
  // same core discipline as every floor instrument.
  vertices() {
    const core = this.mg.reach * this.coreFrac;
    return this.mg.faces().filter(f => Math.hypot(f.x, f.y) < core);
  }

  // One coherent iteration across the whole vertex field, on the kernel clock.
  step() {
    this.k.queueEffect('penfield.z', 'step');
    return this.k.tick(1);
  }

  escaped() { return this.k.view('penfield.escaped'); }

  // The address law: project core vertices onto the listening direction,
  // sort, take consecutive gaps (wrap included). The distinct gaps are NOT a
  // geometric ladder — the probe killed that hypothesis (rung offsets −0.44)
  // — they form a rank-2 golden module: two atoms p < q with q/p = φ, and
  // every gap = m·p + n·q for small integers m, n. The 1D floor's alphabet
  // was a word over two letters; the 2D vertex address alphabet is their
  // integer span. Returns { atoms, elements } — measured, never synthesized.
  ladder({ deg = LISTEN_DEG } = {}) {
    const th = deg * Math.PI / 180;
    const u = [Math.cos(th), Math.sin(th)];
    const a = this.vertices()
      .map(f => ((f.x * u[0] + f.y * u[1]) % 1 + 1) % 1)
      .sort((p, q) => p - q);
    if (a.length < 3) return { atoms: null, elements: [] };
    const gaps = [];
    for (let i = 0; i + 1 < a.length; i++) gaps.push(a[i + 1] - a[i]);
    gaps.push(a[0] + 1 - a[a.length - 1]); // wrap
    // cluster at 1e-6 relative, KEEP full-precision representatives
    gaps.sort((x, y) => x - y);
    const distinct = [];
    for (const g of gaps) {
      if (g < 1e-9) continue; // exact projection ties (grid-direction degeneracy)
      if (distinct.length && Math.abs(g - distinct[distinct.length - 1]) < 1e-6 * g) continue;
      distinct.push(g);
    }
    const p = distinct[0], q = distinct[1];
    return { atoms: [p, q], elements: this.#moduleCoords(distinct, p, q) };
  }

  #moduleCoords(distinct, p, q) {
    // brute-force the small integer coordinates (|m|,|n| ≤ 12) — honest
    // search, no symbolic solver pretense
    return distinct.map(g => {
      for (let m = -2; m <= 12; m++) {
        for (let n = -2; n <= 12; n++) {
          if (Math.abs(m * p + n * q - g) < 1e-9) return { value: g, m, n };
        }
      }
      return { value: g, m: null, n: null }; // outside the module box
    });
  }

  sampleLadder() {
    const l = this.ladder();
    this.k.bind('penfield.ladder', {
      atoms: l.atoms,
      elements: l.elements.map(e => ({ value: e.value, m: e.m, n: e.n })),
    });
    return l;
  }

  // The module is golden only when its atoms sing φ and every element is
  // inside the integer span.
  singsPhi(l = this.sampleLadder()) {
    if (!l.atoms || l.elements.length < 3) return false;
    const [p, q] = l.atoms;
    if (Math.abs(q / p - PHI) > 1e-6) return false;
    return l.elements.every(e => e.m !== null);
  }
}
