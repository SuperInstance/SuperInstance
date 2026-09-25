// spline.mjs — IARS: Identity-Anchored Rational Splines, the floor's analogue seam.
//
// The fleet's spaces are exact discrete worlds (integer (k,s) grid identities,
// ℤ⁵ lifts, hash-chained ids) stitched by ad-hoc teleports. IARS is the
// missing continuous layer between them, under fleet doctrine:
//
//   INTEGERS OWN IDENTITY; RATIONALS OWN MOTION; FLOATS ONLY MEASURE.
//
//   controls = native identities (lifted to ℚ, exact integers preferred)
//   knots    = ℚ (BigInt) — knot multiplicity is the smoothness dial:
//              mult k at a knot ⇒ C^{p−k} there (the analogue dial)
//   weights  = ℚ — Pythagorean Δ keeps cos(Δ/2) rational (3-4-5 ⇒ 4/5),
//              so a rational quadratic IS an exact circle arc
//   evaluate = BigInt-rational de Boor (Piegl & Tiller A2.1–A2.3) — no f64
//              in the pipeline; a discrete hop is the rounding of a motion
//   snap     = nearest identity by ℚ distance — derived, never hand-carried
//
// Honest limit: non-Pythagorean weights (cos 30° = √3/2) have no rational
// shadow — measure against the f64 shadow and say so, same stance as π in
// golden.mjs. Arc length is a MEASURE: adaptive Simpson on the exact speed
// function, returned as a float, never as identity.
//
// Ref: Piegl & Tiller, The NURBS Book, 2e, A2.1–A2.3 / A5.1; quilt-gan's
// fabric-nurbs probe (11/11); /tmp/nurbs/SYNTHESIS.md (IARS spec). The
// dersBasisFuns row-swap lives INSIDE the k-loop (A2.3) — the
// [null,null,2]-corruption class is what this discipline pins.

import {
  makeRat, floatToRat, ratAdd, ratSub, ratMul, ratDiv, ratNeg,
  ratEq, ratIsZero, ratCmp, ratAbs, ratToNumber, ratToString,
} from './commensurate.mjs';

const ZERO = makeRat(0n);
const ONE = makeRat(1n);

// toRat — rat | number | BigInt → canonical rat. Numbers take the exact
// dyadic path (floatToRat), so 0.1 is honestly 3602879701896397/2^55.
export function toRat(x) {
  if (typeof x === 'bigint') return makeRat(x);
  if (typeof x === 'number') {
    const r = floatToRat(x);
    if (!r) throw new Error('toRat: non-finite');
    return r;
  }
  if (x && typeof x === 'object' && typeof x.num === 'bigint' && typeof x.den === 'bigint') return x;
  throw new Error('toRat: unsupported operand');
}

// points may be {x,y} objects or coordinate arrays (ℚ¹⁶-ready).
const pointCoords = p => Array.isArray(p) ? p.map(toRat) : [toRat(p.x), toRat(p.y)];

const qPoint = coords => coords.map(c => (c && typeof c === 'object' && typeof c.num === 'bigint') ? c : toRat(c));

// ---------------------------------------------------------------- construction
// makeSpline({degree, knots, controls, weights?})
//   knots    : non-decreasing, length = controls.length + degree + 1
//   controls : identity points ({x,y} | [rat...]); stored as ℚ coordinate arrays
//   weights  : default 1 (B-spline); rationals make it NURBS
export function makeSpline({ degree: p, knots, controls, weights } = {}) {
  if (!Number.isInteger(p) || p < 1) throw new Error('makeSpline: degree must be a positive integer');
  const U = knots.map(toRat);
  const P = controls.map(pointCoords);
  const w = (weights ?? controls.map(() => 1)).map(toRat);
  const n = P.length - 1;
  if (n < 0) throw new Error('makeSpline: no control points');
  if (U.length !== n + p + 2) throw new Error(`makeSpline: knot vector length ${U.length} ≠ ${n + p + 2} controls+degree+1`);
  for (let i = 1; i < U.length; i++) if (ratCmp(U[i], U[i - 1]) < 0) throw new Error('makeSpline: knots must be non-decreasing');
  if (w.length !== P.length) throw new Error('makeSpline: weights.length ≠ controls.length');
  for (const wi of w) if (ratIsZero(wi)) throw new Error('makeSpline: zero weight (projective point) rejected');
  const dim = P[0].length;
  for (const pt of P) if (pt.length !== dim) throw new Error('makeSpline: ragged control points');
  return { degree: p, knots: U, controls: P, weights: w, dim };
}

// ---------------------------------------------------------------- Piegl A2.1 — exact span
export function findSpanRat(p, U, u) {
  const n = U.length - p - 2;
  if (ratCmp(u, U[n + 1]) >= 0) return n;
  if (ratCmp(u, U[p]) <= 0) return p;
  let lo = p, hi = n + 1, mid = (lo + hi) >> 1;
  while (ratCmp(u, U[mid]) < 0 || ratCmp(u, U[mid + 1]) >= 0) {
    if (ratCmp(u, U[mid]) < 0) hi = mid; else lo = mid;
    mid = (lo + hi) >> 1;
  }
  return mid;
}

// ---------------------------------------------------------------- Piegl A2.2 — basis in ℚ
// Guard: coincident knots give zero denominators off the active cone; the
// corresponding terms vanish (0/0 → 0), matching the float reference.
const qdiv = (a, b) => ratIsZero(b) ? ZERO : ratDiv(a, b);

export function basisFunsRat(span, u, p, U) {
  const N = new Array(p + 1).fill(null).map(() => ZERO);
  const left = new Array(p + 1), right = new Array(p + 1);
  N[0] = ONE;
  for (let j = 1; j <= p; j++) {
    left[j] = ratSub(u, U[span + 1 - j]);
    right[j] = ratSub(U[span + j], u);
    let saved = ZERO;
    for (let r = 0; r < j; r++) {
      const den = ratAdd(left[j - r], right[r + 1]);
      const t = qdiv(N[r], den);
      N[r] = ratAdd(saved, ratMul(right[r + 1], t));
      saved = ratMul(left[j - r], t);
    }
    N[j] = saved;
  }
  return N;
}

// ---------------------------------------------------------------- Piegl A2.3 — basis derivatives in ℚ
// THE ROW-SWAP LIVES INSIDE THE k-LOOP. (The [null,null,2]-corruption class:
// hoisting [s1,s2] = [s2,s1] outside once poisoned C'' with a transposed row,
// silently nulling curvature vetoes. Both-kernels discipline starts at home.)
export function dersBasisFunsRat(span, u, p, U, nDers) {
  const d = Array.from({ length: nDers + 1 }, () => new Array(p + 1).fill(null).map(() => ZERO));
  const ndu = Array.from({ length: p + 1 }, () => new Array(p + 1).fill(null).map(() => ZERO));
  const left = new Array(p + 1), right = new Array(p + 1);
  ndu[0][0] = ONE;
  for (let j = 1; j <= p; j++) {
    left[j] = ratSub(u, U[span + 1 - j]);
    right[j] = ratSub(U[span + j], u);
    let saved = ZERO;
    for (let r = 0; r < j; r++) {
      ndu[j][r] = ratAdd(right[r + 1], left[j - r]);
      const temp = qdiv(ndu[r][j - 1], ndu[j][r]);
      ndu[r][j] = ratAdd(saved, ratMul(right[r + 1], temp));
      saved = ratMul(left[j - r], temp);
    }
    ndu[j][j] = saved;
  }
  for (let j = 0; j <= p; j++) d[0][j] = ndu[j][p];
  const a = [[], []];
  for (let r = 0; r <= p; r++) {
    let s1 = 0, s2 = 1;
    a[0][0] = ONE;
    for (let k = 1; k <= nDers; k++) {
      let d_ = ZERO;
      const rk = r - k, pk = p - k;
      if (r >= k) { a[s2][0] = qdiv(a[s1][0], ndu[pk + 1][rk]); d_ = ratMul(a[s2][0], ndu[rk][pk]); }
      const j1 = rk >= -1 ? 1 : -rk, j2 = (r - 1 <= pk) ? k - 1 : p - r;
      for (let j = j1; j <= j2; j++) {
        a[s2][j] = qdiv(ratSub(a[s1][j], a[s1][j - 1]), ndu[pk + 1][rk + j]);
        d_ = ratAdd(d_, ratMul(a[s2][j], ndu[rk + j][pk]));
      }
      if (r <= pk) {
        a[s2][k] = ratNeg(qdiv(a[s1][k - 1], ndu[pk + 1][r]));
        d_ = ratAdd(d_, ratMul(a[s2][k], ndu[r][pk]));
      }
      d[k][r] = d_;
      [s1, s2] = [s2, s1]; // INSIDE the k-loop — Piegl A2.3, non-negotiable
    }
  }
  let r = BigInt(p);
  for (let k = 1; k <= nDers; k++) {
    for (let j = 0; j <= p; j++) d[k][j] = makeRat(d[k][j].num * r, d[k][j].den);
    r *= BigInt(p - k);
  }
  return d;
}

// ---------------------------------------------------------------- evaluation (exact)
// evalSpline(spline, t) → ℚ coordinate array. BigInt de Boor, no f64 anywhere.
export function evalSpline(spline, t) {
  const { degree: p, knots: U, controls: P, weights: w } = spline;
  const u = toRat(t);
  const n = P.length - 1;
  if (ratCmp(u, U[0]) <= 0) return P[0].map(c => ({ ...c }));
  if (ratCmp(u, U[U.length - 1]) >= 0) return P[n].map(c => ({ ...c }));
  const span = findSpanRat(p, U, u);
  const N = basisFunsRat(span, u, p, U);
  const dim = P[0].length;
  const A = new Array(dim).fill(null).map(() => ZERO);
  let W = ZERO;
  for (let i = 0; i <= p; i++) {
    const idx = span - p + i;
    const c = ratMul(N[i], w[idx]);
    W = ratAdd(W, c);
    for (let dd = 0; dd < dim; dd++) A[dd] = ratAdd(A[dd], ratMul(c, P[idx][dd]));
  }
  if (ratIsZero(W)) throw new Error('evalSpline: zero homogeneous weight');
  return A.map(x => ratDiv(x, W));
}

// evalDeriv(spline, t, k) → k-th derivative of the RATIONAL curve, exact ℚ.
// Homogeneous derivs A^{(j)} = Σ N_i^{(j)} w_i P_i, then Leibniz quotient.
export function evalDeriv(spline, t, k = 1) {
  if (k < 1 || k > 2) throw new Error('evalDeriv: k must be 1 or 2');
  const { degree: p, knots: U, controls: P, weights: w } = spline;
  const u = toRat(t);
  const n = P.length - 1;
  const span = findSpanRat(p, U, u);
  const dN = dersBasisFunsRat(span, u, p, U, k);
  const dim = P[0].length;
  const A = Array.from({ length: k + 1 }, () => new Array(dim).fill(null).map(() => ZERO));
  const Wd = new Array(k + 1).fill(null).map(() => ZERO);
  for (let j = 0; j <= k; j++) {
    for (let i = 0; i <= p; i++) {
      const idx = span - p + i;
      const c = ratMul(dN[j][i], w[idx]);
      Wd[j] = ratAdd(Wd[j], c);
      for (let dd = 0; dd < dim; dd++) A[j][dd] = ratAdd(A[j][dd], ratMul(c, P[idx][dd]));
    }
  }
  const W0 = Wd[0];
  if (ratIsZero(W0)) throw new Error('evalDeriv: zero homogeneous weight');
  const W0sq = ratMul(W0, W0);
  const out = new Array(dim).fill(null).map(() => ZERO);
  for (let dd = 0; dd < dim; dd++) {
    if (k === 1) {
      out[dd] = ratDiv(ratSub(ratMul(A[1][dd], W0), ratMul(A[0][dd], Wd[1])), W0sq);
    } else {
      const W1sq = ratMul(Wd[1], Wd[1]);
      const t1 = ratDiv(
        ratSub(ratSub(ratMul(A[2][dd], W0), ratMul(A[0][dd], Wd[2])), ratMul(makeRat(2n), ratMul(A[1][dd], Wd[1]))),
        W0sq);
      const t2 = ratDiv(ratMul(makeRat(2n), ratMul(A[0][dd], W1sq)), ratMul(W0sq, W0));
      out[dd] = ratAdd(t1, t2);
    }
  }
  return out;
}

// ---------------------------------------------------------------- measurement (floats, honestly)
// curvatureMeasure — κ = |det(C′,C″)| / |C′|³. Float measure of exact ℚ values.
export function curvatureMeasure(spline, t) {
  const d1 = evalDeriv(spline, t, 1).map(ratToNumber);
  const d2 = evalDeriv(spline, t, 2).map(ratToNumber);
  if (d1.length !== 2) throw new Error('curvatureMeasure: 2D only');
  const num = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);
  const den = Math.pow(Math.hypot(d1[0], d1[1]), 3);
  return den === 0 ? 0 : num / den;
}

// arcLengthMeasure — adaptive Simpson on |C′|. A float, because length is
// a measurement, never an identity.
export function arcLengthMeasure(spline, t0 = 0, t1 = 1, tol = 1e-12) {
  const a = toRat(t0), b = toRat(t1);
  if (ratCmp(b, a) <= 0) return 0;
  // measurement layer: float parameter space, exact eval inside — floats
  // only measure; the speed function itself is ℚ end-to-end.
  const lo = ratToNumber(a), hi = ratToNumber(b);
  const sf = x => { const d = evalDeriv(spline, floatToRat(x), 1).map(ratToNumber); return Math.hypot(...d); };
  const S = (l, r) => { const m = (l + r) / 2; return (r - l) / 6 * (sf(l) + 4 * sf(m) + sf(r)); };
  const adapt = (l, r, whole, eps, depth) => {
    const m = (l + r) / 2;
    const sl = S(l, m), sr = S(m, r);
    if ((Math.abs(sl + sr - whole) < 15 * eps && depth > 4) || depth > 60 || !isFinite(sl + sr)) return sl + sr + (sl + sr - whole) / 15;
    return adapt(l, m, sl, eps / 2, depth + 1) + adapt(m, r, sr, eps / 2, depth + 1);
  };
  return adapt(lo, hi, S(lo, hi), tol * Math.max(1, Math.abs(hi - lo)), 0);
}

// ---------------------------------------------------------------- the discrete hop (derived, not hand-carried)
// snap(qPoint, targets) — nearest identity by ℚ squared distance. Ties break
// to the FIRST target: deterministic, and documented. Motion is continuous;
// identity is the rounding at commit time (blend proposes, referee disposes).
export function snap(qPoint, targets) {
  const p = qPointCoords(qPoint);
  let best = null, bestIdx = -1;
  targets.forEach((raw, idx) => {
    const q = qPointCoords(raw);
    if (q.length !== p.length) throw new Error('snap: dimension mismatch');
    let dist = ZERO;
    for (let i = 0; i < p.length; i++) {
      const dd = ratSub(p[i], q[i]);
      dist = ratAdd(dist, ratMul(dd, dd));
    }
    if (!best || ratCmp(dist, best) < 0) { best = dist; bestIdx = idx; }
  });
  return { point: qPointCoords(targets[bestIdx]).map(c => ({ ...c })), index: bestIdx, distanceQ: best };
}

function qPointCoords(p) { return Array.isArray(p) ? p.map(toRat) : pointCoords(p); }

// ---------------------------------------------------------------- sampling
// sampleAlong(spline, n) — n+1 exact ℚ points at t = i/n (B2 twist-along-arc hook)
export function sampleAlong(spline, n) {
  if (!Number.isInteger(n) || n < 1) throw new Error('sampleAlong: n must be a positive integer');
  const out = [];
  for (let i = 0; i <= n; i++) out.push(evalSpline(spline, makeRat(BigInt(i), BigInt(n))));
  return out;
}

// ---------------------------------------------------------------- exact circle arcs (Pythagorean)
// pythagoreanArc(a, b, {side}) — the 3-4-5 arc: cos(Δ/2) = 4/5 EXACTLY, so the
// rational quadratic [A, T, B] · [1, 4/5, 1] IS the exact circular arc. Controls
// are integers iff the chord is a multiple of 8; otherwise ℚ — identity lives
// at the ENDPOINTS (given as integers), the tangent point is derived motion.
// Canonical: a=(0,0), b=(8,0) → T=(4,3), r=20/3, center=(4,−16/3).
export function pythagoreanArc(a, b, { side = 1 } = {}) {
  const A = pointCoords(a), B = pointCoords(b);
  if (A.length !== 2 || B.length !== 2) throw new Error('pythagoreanArc: 2D only');
  const dx = ratSub(B[0], A[0]), dy = ratSub(B[1], A[1]);
  const chSq = ratAdd(ratMul(dx, dx), ratMul(dy, dy));
  if (ratIsZero(chSq)) throw new Error('pythagoreanArc: coincident endpoints');
  // T = midpoint + (−dy, dx)·side·3/8 — the un-normalized normal scaled by
  // the 3-4-5 tangent ratio (tan(Δ/2) = 3/4 over half-chord).
  const mx = ratDiv(ratAdd(A[0], B[0]), makeRat(2n));
  const my = ratDiv(ratAdd(A[1], B[1]), makeRat(2n));
  const s38 = makeRat(BigInt(side * 3), 8n);
  const T = [ratAdd(mx, ratMul(ratNeg(dy), s38)), ratAdd(my, ratMul(dx, s38))];
  const w = makeRat(4n, 5n);
  const spline = makeSpline({
    degree: 2,
    knots: [0, 0, 0, 1, 1, 1],
    controls: [A, T, B],
    weights: [ONE, w, ONE],
  });
  // circle meta (ℚ): exact when the chord is axis-aligned, so ch = |dx| or |dy|
  // is a rational LENGTH — r = 5ch/6, center = mid − (−dy, dx)·side·2/3.
  // Slanted chords have irrational length: identity stays at the endpoints,
  // the circle itself is only measurable there (honesty-flagged, not faked).
  const axisAligned = ratIsZero(dy) || ratIsZero(dx);
  const circle = { exact: axisAligned };
  if (axisAligned) {
    const ch = ratIsZero(dy) ? ratAbs(dx) : ratAbs(dy);
    circle.radius = ratMul(makeRat(5n, 6n), ch);
    const f = makeRat(BigInt(side * 2), 3n);
    circle.center = [ratSub(mx, ratMul(ratNeg(dy), f)), ratSub(my, ratMul(dx, f))];
  }
  return Object.assign(spline, { circle });
}

// ---------------------------------------------------------------- kernel tenancy
// hostTrace(kernel, spline, n) — the analogue seam made tenancy: n+1 samples
// become cells (float x,y is the VIEW; the ℚ lift is the identity), joined by
// 'next' links. Same pattern on both kernels, per THE-FLOOR.md discipline.
export function hostTrace(kernel, spline, n = 8, { name = 'spline' } = {}) {
  const pts = sampleAlong(spline, n);
  pts.forEach((q, i) => {
    const t = makeRat(BigInt(i), BigInt(n));
    kernel.bind(`${name}.p.${i}`, { x: ratToNumber(q[0]), y: ratToNumber(q[1]) }, {
      lift: q.map(ratToString), t: ratToString(t), exact: true,
    });
    if (i > 0) kernel.link(`${name}.p.${i - 1}`, `${name}.p.${i}`, 'next');
  });
  kernel.bind(`${name}.params`, { degree: spline.degree, samples: n + 1, dim: spline.dim });
  return { points: pts.length, links: n };
}
