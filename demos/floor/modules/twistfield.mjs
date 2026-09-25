// TwistField — twist-engine's registration instrument seated on the floor.
//
// twist-engine app.js defines ONE instrument: registration R = mean
// gaussian alignment of a rotated point set B against a reference set A,
// R = mean_p∈B exp(−d²(p, A) / 2σ²), σ = 0.24·s, spatial hash cell 0.6·s,
// s = mean nearest-neighbor spacing. This module runs that EXACT law on
// the Penrose vertex set — the twist of a superstructure against the
// locational tiling.
//
// Probe-pinned laws (tests/twistfield.test.mjs):
//   • R(0) = 1 exactly (identity alignment).
//   • CLOUD LAW: for θ ≲ 2°, R(θ) ≈ exp(−⟨r²⟩θ² / 2σ²) — the rotated
//     cloud's self-alignment, with ⟨r²⟩ measured from the data. Verified
//     to 0.06% at 1°, 0.89% at 2°.
//   • Beyond ~2.5° the truth deviates UP from the cloud law: rotated
//     vertices start landing near OTHER vertex species — cross-alignment.
//     The deviation is the lattice's rotational fingerprint, and it is
//     γ-independent (universal for generic floors).
//   • KILLED by the same probe: fine magic-window teeth in 0–1° (none at
//     0.02° resolution — smooth falloff), and large-θ commensuration
//     peaks (the naive S-minimum at 24° is a disk-rim artifact, swamped
//     beyond σ/r_max ≈ 2.2°). The instrument is honest only inside the
//     twist regime, exactly as twist-engine runs it (0.15°–6°).

import { sampleAlong as splineSamples } from './spline.mjs';
import { ratToNumber } from './commensurate.mjs';

export class TwistField {
  constructor(points, { sigmaScale = 0.24, gridScale = 0.6 } = {}) {
    this.points = points;
    const n = points.length;
    // mean nearest-neighbor spacing
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let d2min = Infinity;
      const p = points[i];
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const q = points[j];
        const d2 = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
        if (d2 < d2min) d2min = d2;
      }
      sum += Math.sqrt(d2min);
    }
    this.s = sum / n;
    this.sigma = sigmaScale * this.s;
    this.twoSig2 = 2 * this.sigma ** 2;
    this.grid = gridScale * this.s;
    this.r2 = points.reduce((a, p) => a + p[0] ** 2 + p[1] ** 2, 0) / n;
  }

  // The small-angle closed form: each point's nearest is itself, and
  // rotation displaces it by r·θ — the gaussian cloud law.
  cloudLaw(thetaDeg) {
    const th = thetaDeg * Math.PI / 180;
    return Math.exp(-this.r2 * th * th / this.twoSig2);
  }

  // twist-engine's instrument, verbatim semantics.
  registration(thetaDeg) {
    const th = thetaDeg * Math.PI / 180;
    const c = Math.cos(th), si = Math.sin(th);
    const grid = this.grid, hash = new Map();
    const key = (x, y) => `${Math.floor(x / grid)},${Math.floor(y / grid)}`;
    for (const p of this.points) {
      const k = key(p[0], p[1]);
      if (!hash.has(k)) hash.set(k, []);
      hash.get(k).push(p);
    }
    const cell = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    let sum = 0;
    const n = this.points.length;
    for (const [x, y] of this.points) {
      const px = x * c - y * si, py = x * si + y * c;
      let best = Infinity;
      const cx = Math.floor(px / grid), cy = Math.floor(py / grid);
      for (const [dx, dy] of cell) {
        const bucket = hash.get(`${cx + dx},${cy + dy}`);
        if (!bucket) continue;
        for (const q of bucket) {
          const d2 = (px - q[0]) ** 2 + (py - q[1]) ** 2;
          if (d2 < best) best = d2;
        }
      }
      sum += Math.exp(-best / this.twoSig2);
    }
    return sum / n;
  }

  curve(fromDeg, toDeg, stepDeg) {
    const out = [];
    for (let a = fromDeg; a <= toDeg + 1e-12; a += stepDeg) {
      out.push({ theta: a, R: this.registration(a) });
    }
    return out;
  }
}

// Seat the instrument on the floor: tiling vertices (face centers) inside
// a core disk — the twist regime's viewport.
export function twistFieldFrom(multigrid, radius) {
  const pts = multigrid.faces()
    .filter(f => Math.hypot(f.x, f.y) < radius)
    .map(f => [f.x, f.y]);
  return new TwistField(pts);
}

// ---------------------------------------------------------------- B2 — twist along an arc
// The seam generalization: twist-engine rotates about the ORIGIN. Between
// two quilt spaces the rotation center GLIDES along the seam. Two laws carry:
//   • the instrument is center-equivariant — registrationAbout(c, θ) with
//     c = 0 recovers registration(θ) bit-for-bit;
//   • the cloud law is per-point exact about ANY station: a rotation about c
//     displaces point p by exactly |p−c|·θ, so R ≈ mean_p exp(−|p−c|²θ²/2σ²)
//     while "nearest is itself" holds (θ in the twist regime — the station
//     radius shrinks the budget: displacement grows with |p−c|).
Object.assign(TwistField.prototype, {
  // rotation about an arbitrary center — verbatim semantics otherwise.
  registrationAbout(center, thetaDeg) {
    const [cx, cy] = center;
    const th = thetaDeg * Math.PI / 180;
    const c = Math.cos(th), si = Math.sin(th);
    const grid = this.grid, hash = new Map();
    const key = (x, y) => `${Math.floor(x / grid)},${Math.floor(y / grid)}`;
    for (const p of this.points) {
      const k = key(p[0], p[1]);
      if (!hash.has(k)) hash.set(k, []);
      hash.get(k).push(p);
    }
    const cell = [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    let sum = 0;
    const n = this.points.length;
    for (const [x, y] of this.points) {
      const px = cx + (x - cx) * c - (y - cy) * si;
      const py = cy + (x - cx) * si + (y - cy) * c;
      let best = Infinity;
      const gx = Math.floor(px / grid), gy = Math.floor(py / grid);
      for (const [dx, dy] of cell) {
        const bucket = hash.get(`${gx + dx},${gy + dy}`);
        if (!bucket) continue;
        for (const q of bucket) {
          const d2 = (px - q[0]) ** 2 + (py - q[1]) ** 2;
          if (d2 < best) best = d2;
        }
      }
      sum += Math.exp(-best / this.twoSig2);
    }
    return sum / n;
  },

  // the honest per-point cloud about a station (exact under nearest-is-itself)
  cloudAbout(center, thetaDeg) {
    const [cx, cy] = center;
    const th = thetaDeg * Math.PI / 180;
    const f = th * th / this.twoSig2;
    return this.points.reduce((a, p) => a + Math.exp(-((p[0] - cx) ** 2 + (p[1] - cy) ** 2) * f), 0) / this.points.length;
  },

  // the ⟨r²⟩-moment closed form about a station (what the cloud law becomes)
  cloudLawAbout(center, thetaDeg) {
    const [cx, cy] = center;
    const m2 = this.points.reduce((a, p) => a + (p[0] - cx) ** 2 + (p[1] - cy) ** 2, 0) / this.points.length;
    const th = thetaDeg * Math.PI / 180;
    return Math.exp(-m2 * th * th / this.twoSig2);
  },

  // sampleAlong(curve, {n, thetaDeg}) — the twist budget along the seam.
  // Stations are the curve's exact ℚ samples (floats only measure); each row
  // carries R (the instrument about that station), the per-point cloud, and
  // the cumulative measured arc length — R as a function of true position.
  sampleAlong(curve, { n = 8, thetaDeg = 1 } = {}) {
    const qs = splineSamples(curve, n);
    const rows = [];
    let len = 0;
    let prev = null;
    for (let i = 0; i < qs.length; i++) {
      const st = [ratToNumber(qs[i][0]), ratToNumber(qs[i][1])];
      if (prev) len += Math.hypot(st[0] - prev[0], st[1] - prev[1]);
      rows.push({
        i, s: i / n, x: st[0], y: st[1], len,
        R: this.registrationAbout(st, thetaDeg),
        cloud: this.cloudAbout(st, thetaDeg),
        cloudMoment: this.cloudLawAbout(st, thetaDeg),
      });
      prev = st;
    }
    return rows;
  },
});

// twistAlongArc(multigrid, curve, opts) — seat the instrument on the floor's
// core disk and sample the twist along the seam in one call.
export function twistAlongArc(multigrid, curve, { radius = 2.1, n = 8, thetaDeg = 1 } = {}) {
  const tf = twistFieldFrom(multigrid, radius);
  return { tf, samples: tf.sampleAlong(curve, { n, thetaDeg }) };
}
