// Golden-ratio substrate: exact φ arithmetic, Fibonacci word, substitution
// matrix, Zeckendorf representation, convergent gaps. No kernel here — this is
// the pure mathematics the floor modules stand on. Every constant exact.

export const PHI = (1 + Math.sqrt(5)) / 2;

export function fib(n) {
  // Iterative — exact integers up to n=78, fine for floor use.
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

export function fibNum(n) { return Number(fib(n)); }

// The Fibonacci word via substitution A → AB, B → A.
// word(g) has F(g+2) letters. Letter counts (A,B) follow the matrix
// [[1,1],[1,0]] with eigenvalues φ and −1/φ — the Penrose substitution matrix.
export function word(g) {
  let w = 'A';
  for (let i = 0; i < g; i++) {
    let next = '';
    for (const ch of w) next += ch === 'A' ? 'AB' : 'A';
    w = next;
  }
  return w;
}

export function wordCounts(g) {
  let a = 1n, b = 0n; // gen 0: 'A'
  for (let i = 0; i < g; i++) [a, b] = [a + b, a];
  return { A: a, B: b };
}

// Ratio of long to short intervals → φ as g → ∞.
export function lengthRatio(g) {
  const { A, B } = wordCounts(g);
  return Number(A) / Number(B);
}

// Zeckendorf: every n is a unique sum of non-consecutive Fibonacci numbers
// (F(2)=1, F(3)=2, F(4)=3, F(5)=5, ...). Returns indices k with F(k) terms,
// k descending, no two adjacent. The Fibonacci clock's display.
export function zeckendorf(n) {
  if (!Number.isInteger(n) || n < 0) throw new TypeError('zeckendorf: non-negative integer expected');
  const terms = [];
  let rem = n;
  // Largest Fibonacci ≤ rem; F(2)=1, F(3)=2 (use 1,2 sequence to avoid the
  // duplicate 1s of F(1)=F(2)=1).
  const seq = [1, 2];
  while (seq[seq.length - 1] <= rem) seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  for (let i = seq.length - 1; i >= 0 && rem > 0; i--) {
    if (seq[i] <= rem) { terms.push(i + 2); rem -= seq[i]; i--; } // skip adjacent
  }
  return terms; // indices k into F with F(2)=1, F(3)=2
}

// The Zeckendorf shift identity, which makes the strip's window EXACT:
//   floor(a·φ) = (Σ F(k+1) over a's Zeckendorf terms) − ε,
//   ε = 1 iff the LEAST Zeckendorf index is even, else 0 (and ε = 0 for a = 0).
// Derived by probe, pinned by test over a < 3000 (golden.test.mjs).
// Consequence: the strip accepts column a ≥ 1 iff {aφ} > 1/φ² — acceptance
// is a Zeckendorf-threshold condition (the a = 0 column is the window's
// closed-lower-edge boundary tile, always accepted).
export function zeckShift(a) {
  const terms = zeckendorf(a);
  if (!terms.length) return 0;
  const base = terms.reduce((s, k) => s + fibNum(k + 1), 0);
  return base - (Math.min(...terms) % 2 === 0 ? 1 : 0);
}

export function zeckSum(terms) {
  return terms.reduce((s, k) => s + fibNum(k), 0);
}

// Convergent gaps of the golden direction: F(n+1)/F(n) · 360° vs 360°·φ.
// These gaps, in degrees, are the teeth of the Twist engine's commensuration
// comb — the instrument measures exactly this Diophantine ladder.
export function convergentGaps(maxN = 12) {
  const gaps = [];
  for (let n = 2; n <= maxN; n++) {
    const approx = (fibNum(n + 1) / fibNum(n)) * 360;
    gaps.push({ n, degrees: approx - 360 * PHI });
  }
  return gaps;
}
