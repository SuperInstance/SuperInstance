// commensurate.mjs — exact rational arithmetic for the twist instrument.
//
// The twist instrument's question is commensuration: "is this measured
// ratio a small-denominator rational?" Float tolerance imports are the
// wrong tool. Every JS float IS a dyadic rational (mantissa × 2^e) — so
// the measurement can be made EXACT end-to-end:
//
//   f64 bits ──floatToRat──▶ exact BigInt rational ──SternBrocot──▶
//   nearest small-denominator rational, tie-broken exactly.
//
// Honest limit: π is transcendental; we measure against its f64 shadow
// (same constant golden.mjs uses), and say so.
//
// Ref: FM's fleet-midi golden.mjs law; twist-engine's TWIST commensuration
// comb; the May-30 fleet backlog item "exact Pythagorean snapping" — the
// exactness without the LLM-weight quantizer that turned out to live in
// the dormant crate.

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };

export function makeRat(num, den = 1n) {
  num = BigInt(num); den = BigInt(den);
  if (den === 0n) throw new Error('rat: zero denominator');
  if (den < 0n) { num = -num; den = -den; }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

export const ratToNumber = r => Number(r.num) / Number(r.den);
export const ratToString = r => `${r.num}/${r.den}`;
export const ratAbs = r => r.num < 0n ? makeRat(-r.num, r.den) : r;
export const ratNeg = r => makeRat(-r.num, r.den);
export const ratSign = r => r.num < 0n ? -1 : r.num > 0n ? 1 : 0;
export const ratIsZero = r => r.num === 0n;

// ratSqrt(r) — exact rational square root: r = n/d in lowest terms with
// r ≥ 0; returns makeRat(isqrt(n), isqrt(d)) when BOTH are perfect squares,
// else null. The honest ℚ gate for PH hodograph solving.
export function ratSqrt(r) {
  if (ratSign(r) < 0) return null;
  const n = r.num < 0n ? -r.num : r.num;
  const d = r.den < 0n ? -r.den : r.den;
  const sn = isqrt(n), sd = isqrt(d);
  if (sn * sn !== n || sd * sd !== d) return null;
  return makeRat(sn, sd);
}

// integer square root (floor) — Newton iteration
function isqrt(n) {
  if (n < 0n) throw new RangeError('isqrt of negative');
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}
export const ratEq = (a, b) => a.num * b.den === b.num * a.den;
export const ratAdd = (a, b) => makeRat(a.num * b.den + b.num * a.den, a.den * b.den);
export const ratMul = (a, b) => makeRat(a.num * b.num, a.den * b.den);
export const ratDiv = (a, b) => {
  if (b.num === 0n) throw new Error('rat: division by zero');
  return makeRat(a.num * b.den, a.den * b.num);
};
export const ratSub = (a, b) => makeRat(a.num * b.den - b.num * a.den, a.den * b.den);
export const ratCmp = (a, b) => {
  const d = a.num * b.den - b.num * a.den;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
};

// floatToRat — the exact dyadic expansion of an f64. Non-finite → null.
export function floatToRat(x) {
  if (!Number.isFinite(x)) return null;
  const buf = new DataView(new ArrayBuffer(8));
  buf.setFloat64(0, x);
  const bits = buf.getBigUint64(0);
  const sign = bits >> 63n ? -1n : 1n;
  const exp = Number((bits >> 52n) & 0x7ffn);
  const mant = bits & ((1n << 52n) - 1n);
  if (exp === 0) { // subnormal: value = mant × 2^(-1074)
    return makeRat(sign * mant, 1n << 1074n);
  }
  if (exp === 0x7ff) return null; // inf/nan (shouldn't reach: isFinite gate)
  // normal: value = (2^52 + mant) × 2^(exp − 1075)
  const e = exp - 1075;
  const m = (1n << 52n) + mant;
  return e >= 0 ? makeRat(sign * m * (1n << BigInt(e)), 1n)
                : makeRat(sign * m, 1n << BigInt(-e));
}

// continuedFraction(x, depth) — exact CF terms of a rational.
export function continuedFraction(rat, depth = 64) {
  const terms = [];
  let { num, den } = rat;
  while (den !== 0n && terms.length < depth) {
    const q = num / den;
    terms.push(q);
    [num, den] = [den, num - q * den];
  }
  return terms;
}

// nearestRational(x, maxDen) — best rational approximation with
// denominator ≤ maxDen, via continued-fraction convergents + the final
// semiconvergent. Returns { rat, error } where error is exact |x − p/q|.
export function nearestRational(x, maxDen = 20) {
  const target = typeof x === 'number' ? floatToRat(x) : x;
  if (!target) return null;
  const md = BigInt(maxDen);
  const terms = continuedFraction(target, 256);
  let p0 = 0n, p1 = 1n, q0 = 1n, q1 = 0n;
  let best = null;
  for (const a of terms) {
    const p = a * p1 + p0;
    const q = a * q1 + q0;
    if (q > md) {
      // semiconvergents: floor((md − q0) / q1) copies of the last term
      const k = (md - q0) / q1;
      if (q1 > 0n) {
        const pk = k * p1 + p0, qk = k * q1 + q0;
        best = pickBest(target, best, makeRat(pk, qk));
        best = pickBest(target, best, makeRat(p1, q1)); // the convergent itself
      }
      break;
    }
    best = pickBest(target, best, makeRat(p, q));
    [p0, p1] = [p1, p];
    [q0, q1] = [q1, q];
  }
  return { rat: best, error: ratAbs(ratSub(target, best)) };
}

function pickBest(target, a, b) {
  if (!a) return b;
  if (!b) return a;
  const ea = ratAbs(ratSub(target, a)), eb = ratAbs(ratSub(target, b));
  return ratCmp(ea, eb) <= 0 ? a : b;
}
