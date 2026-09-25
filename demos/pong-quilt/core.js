/* pong-quilt core — shared by demo (index.html) and tools/prerun.js (Node).
 * KEEP IN SYNC. No dependencies. Numbers verified by running (node tools/prerun.js).
 * The quilt: game state projected into cells -> tiny net -> GA breeding ->
 * speed ramp forces planning ahead -> black-swan perturbations kill certainty.
 *
 * Edge-ML patterns (branch edge-ml-crush, inspired by SuperInstance/quilt-edge-ml):
 *  - makeRing:        bounded FIFO champion history (their ring_buffer.py)
 *  - makeEvaluator:   out-of-core streaming fitness eval (their out_of_core.py)
 *  - swans are rng-seeded when a rand is passed to step/playOne, so
 *    tools/prerun.js is byte-reproducible from DEFAULTS.seed (verified).
 *
 * Round 3 (branch round-3-builder):
 *  - fitnessOf:        HIT_WEIGHT=100 — hits must matter; a capped 0-hit
 *                      survivor scores maxFrames and can never top a hitter
 *  - effectivePaddle:  the drawn paddle IS the registered hitbox (0.20 wide)
 *  - makeSeam:         paced, serialized LLM advice (fire on death/interval,
 *                      drop stale — one in flight at a time)
 *  - makeJepa:         sense-vector features for BOTH learn and infer
 *                      (Round 2's feature-skew fix, now node-pinned)
 *  - COEVOLUTION (C1): adversarial pair — survivor net keeps the rally
 *                      alive, ender net tries to end it; loser mutates.
 *                      Separate lineage: checkpoints/coev.js, md5-stable.
 *  - VERIFIED_CLAIMS:  the wristband registry the demo badge renders from.
 *  - makeLedger:       hash-chained match ledger with HONEST eviction count. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.PongQuilt = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const DEFAULTS = {
    popSize: 48, elites: 4, sigma: 0.12,
    decisionInterval: 4,        // frames between decisions = speed-of-action limit
    paddleW: 0.16, paddleSpeed: 0.02,
    ballBase: 0.004, ramp: 0.0004, hitBoost: 1.03,
    swanP: 0.00008,             // black-swan chance/frame, scales with speed
    maxFrames: 6000, inDim: 6, hid: 10, outDim: 3, seed: 20260924,
  };
  function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function makeNet(rand) {
    const { inDim, hid, outDim } = DEFAULTS, w1 = [], b1 = [], w2 = [], b2 = [];
    for (let i = 0; i < inDim * hid; i++) w1.push((rand() - 0.5) * 0.6);
    for (let i = 0; i < hid; i++) b1.push(0);
    for (let i = 0; i < hid * outDim; i++) w2.push((rand() - 0.5) * 0.6);
    for (let i = 0; i < outDim; i++) b2.push(0);
    return { w1, b1, w2, b2 };
  }
  function forward(net, inp) {
    const { hid, outDim } = DEFAULTS, h = [];
    for (let j = 0; j < hid; j++) {
      let s = net.b1[j];
      for (let i = 0; i < inp.length; i++) s += net.w1[i * hid + j] * inp[i];
      h.push(Math.tanh(s));
    }
    const o = [];
    for (let k = 0; k < outDim; k++) {
      let s = net.b2[k];
      for (let j = 0; j < hid; j++) s += net.w2[j * outDim + k] * h[j];
      o.push(s);
    }
    return o;
  }
  function mutate(net, rand, sigma) {
    const m = (a) => a.map((v) => v + (rand() + rand() + rand() - 1.5) * sigma);
    return { w1: m(net.w1), b1: m(net.b1), w2: m(net.w2), b2: m(net.b2) };
  }
  const HIT_WEIGHT = 100; // Round 3 honesty pass: at the frame cap a 0-hit
  // survivor scores exactly maxFrames; ANY hit adds 100, so once survival
  // saturates, hitting is the only way to climb. Skill, not parking luck.
  const EFFECTIVE_MARGIN = 0.02; // hit registration extends the drawn paddle
  // by this on both sides — one constant for draw AND death-check (no ghost).
  function fitnessOf(frames, hits) { return frames + hits * HIT_WEIGHT; }
  function effectivePaddle(px) { return { x: px - EFFECTIVE_MARGIN,
                                          w: DEFAULTS.paddleW + 2 * EFFECTIVE_MARGIN }; }
  function step(g, action, rand) { // one frame; action in {-1,0,1} held for decisionInterval
    const D = DEFAULTS, swan = rand || Math.random; // seeded in prerun, live-random in browser
    if (g.frames % D.decisionInterval === 0) g.hold = action;
    g.px = Math.max(0, Math.min(1 - D.paddleW, g.px + g.hold * D.paddleSpeed));
    const sp = D.ballBase * g.speedMul;
    g.x += g.vx * sp; g.y += g.vy * sp;
    if (g.x < 0) { g.x = 0; g.vx = Math.abs(g.vx); }
    if (g.x > 1) { g.x = 1; g.vx = -Math.abs(g.vx); }
    if (g.y < 0) { g.y = 0; g.vy = Math.abs(g.vy); }
    if (swan() < D.swanP * g.speedMul) { // black swan: angle kick
      const a = Math.atan2(g.vy, g.vx) + (swan() - 0.5) * 1.2;
      g.vx = Math.cos(a); g.vy = Math.abs(Math.sin(a)) * (g.vy < 0 ? -1 : 1);
    }
    g.speedMul = 1 + g.frames * D.ramp;
    g.frames++;
    if (g.vy > 0 && g.y >= 0.94) {
      const eff = effectivePaddle(g.px);
      if (g.x > eff.x && g.x < eff.x + eff.w) {
        g.vy = -Math.abs(g.vy); g.hits++; g.speedMul *= D.hitBoost;
        g.x = Math.max(0.02, Math.min(0.98, g.x)); // avoid wall lock
      } else return false; // death
    }
    return true;
  }
  function newGame(rand) {
    const a = (rand() * 0.8 + 0.7) * Math.PI * (rand() < 0.5 ? 0.25 : 0.75);
    return { x: 0.5, y: 0.5, vx: Math.cos(a), vy: Math.abs(Math.sin(a)),
             px: 0.42, hold: 0, frames: 0, hits: 0, speedMul: 1 };
  }
  function sense(g) {
    return [g.x * 2 - 1, g.y * 2 - 1, g.vx, g.vy * (g.vy > 0 ? 1 : -1) * (g.vy > 0 ? 1 : -0.2),
            (g.px + DEFAULTS.paddleW / 2 - g.x) * 2, Math.min(1, g.speedMul / 3)];
  }
  function playOne(net, rand) {
    let g = newGame(rand);
    while (g.frames < DEFAULTS.maxFrames) {
      const o = forward(net, sense(g));
      const act = o[0] > o[2] ? (o[0] > o[1] ? -1 : 0) : (o[2] > o[1] ? 1 : 0);
      if (!step(g, act, rand)) break;
    }
    return { fitness: fitnessOf(g.frames, g.hits), frames: g.frames, hits: g.hits,
             maxSpeed: g.speedMul };
  }
  function runGeneration(pop, scored, rand, sigma) {
    const D = DEFAULTS, next = [];
    scored.sort((a, b) => b.fitness - a.fitness);
    for (let i = 0; i < D.elites; i++) next.push(JSON.parse(JSON.stringify(scored[i].net)));
    while (next.length < pop.length)
      next.push(mutate(scored[Math.floor(rand() * D.elites)].net, rand, sigma));
    return next;
  }
  // === edge-ml pattern 1: ring-buffered champion history ===================
  // Port of quilt-edge-ml's ring_buffer.py (bounded FIFO; oldest evicted on
  // overflow) minus the disk layer — in memory, one slot per generation.
  function makeRing(capacity) {
    if (!(capacity >= 1)) throw new RangeError("ring capacity must be >= 1");
    const buf = new Array(capacity);
    let head = 0, count = 0, writes = 0;
    return {
      write(rec) { // FIFO: newest kept, oldest evicted; returns total writes
        buf[(head + count) % capacity] = rec;
        if (count < capacity) count++;
        else head = (head + 1) % capacity;
        return ++writes;
      },
      tail(n) { // last n records in write order (n > size returns all)
        const k = Math.min(n, count), out = new Array(k);
        for (let i = 0; i < k; i++) out[i] = buf[(head + count - k + i) % capacity];
        return out;
      },
      items() { return this.tail(count); },
      get size() { return count; },
      get writes() { return writes; },
      get capacity() { return capacity; },
    };
  }
  // === edge-ml pattern 2: out-of-core streaming fitness evaluation =========
  // Port of quilt-edge-ml's out_of_core.py (stream batches; never load the
  // whole dataset; partial_fit per batch). One candidate per step(); only a
  // bounded elite archive + running stats are retained, so memory is flat no
  // matter the population size, and a browser can spread one generation
  // across animation frames instead of blocking on a synchronous eval loop.
  function makeEvaluator(candidates, evalOne, opts) {
    const eliteK = (opts && opts.eliteK) || DEFAULTS.elites;
    let i = 0, sum = 0;
    let best = null;
    const elites = []; // fitness-desc, length <= eliteK; the ONLY retained records
    return {
      step(n) { // evaluate up to n more candidates; returns progress snapshot
        const stop = Math.min(candidates.length, i + (n === undefined ? 1 : n));
        for (; i < stop; i++) {
          const r = evalOne(candidates[i], i);
          const rec = { index: i, fitness: r.fitness, frames: r.frames,
                        hits: r.hits, maxSpeed: r.maxSpeed, net: candidates[i] };
          sum += r.fitness;
          if (!best || r.fitness > best.fitness) best = rec;
          let j = elites.length;
          while (j > 0 && elites[j - 1].fitness < r.fitness) j--; // desc: skip only smaller; stable (new after equals)
          if (j < eliteK) {
            elites.splice(j, 0, rec);
            if (elites.length > eliteK) elites.pop();
          }
        }
        return { done: i >= candidates.length, evaluated: i, total: candidates.length,
                 elites: elites.slice(), best, mean: i ? sum / i : 0 };
      },
      get done() { return i >= candidates.length; },
      get evaluated() { return i; },
    };
  }
  // === Round 3: LLM seam pacing (Round 4: + timeout) =======================
  // Round 2 found the seam fired one fetch per animation frame and applied
  // responses in arrival-burst order. makeSeam enforces the doc'd contract:
  // fire on death/interval (never per frame), ONE request in flight, stale
  // responses dropped by sequence number. Drops are counted, not hidden.
  // Round 4 (queued by Round 3): a hung transport no longer stalls the seam —
  // timeoutMs races the transport; on timeout the seam frees itself, counts
  // the death in dropped.timedOut, and reports an error through onResult.
  // Default timeoutMs=0 keeps the pinned Round-3 behavior (no timer) —
  // opt-in, not a silent semantic change.
  function makeSeam(opts) {
    const transport = opts.transport, minIntervalMs = opts.minIntervalMs || 0;
    const timeoutMs = opts.timeoutMs || 0;
    const schedule = opts.schedule || ((fn, ms) => setTimeout(fn, ms));
    const cancel = opts.cancel || ((h) => clearTimeout(h));
    const now = opts.now || (() => Date.now());
    const onResult = opts.onResult || (() => {});
    let inFlight = false, lastFire = -Infinity, seq = 0;
    const dropped = { inFlight: 0, paced: 0, stale: 0, timedOut: 0 };
    // Stale-drop fence: while fire() refuses during in-flight, a delivered
    // response is always the latest seq — but if a future caller loosens
    // pacing, out-of-order arrivals die here, silently-safe. Fences outrank
    // gates; the counter proves the fence stands (tests/seam.test.js).
    return {
      fire(payload) { // returns the request's seq, or null if refused (counted)
        const t = now();
        if (inFlight) { dropped.inFlight++; return null; }
        if (t - lastFire < minIntervalMs) { dropped.paced++; return null; }
        const mySeq = ++seq; lastFire = t; inFlight = true;
        let settled = false, timer = null;
        // Exactly-once settlement shared by the timeout race and the transport:
        // whichever lands first owns the result; the late arrival dies on the
        // `settled` fence. (A post-timeout transport arrival does NOT count
        // stale — the timeout already owned and counted that request.)
        const settle = (res, err) => {
          if (settled) return; settled = true;
          if (timer !== null) { cancel(timer); timer = null; }
          inFlight = false;
          if (mySeq !== seq) { dropped.stale++; return; }
          onResult(res, mySeq, err);
        };
        if (timeoutMs > 0) timer = schedule(() => {
          dropped.timedOut++;
          settle(null, new Error("seam timeout after " + timeoutMs + "ms"));
        }, timeoutMs);
        Promise.resolve().then(() => transport(payload)).then(
          (res) => settle(res),
          (err) => settle(null, err));
        return mySeq;
      },
      get inFlight() { return inFlight; },
      get lastSeq() { return seq; },
      dropped: dropped, // honest counters — the UI surfaces these
    };
  }
  // === Round 3: micro-JEPA, one representation ===============================
  // Round 2's P1: learn consumed sense() scale ([-1,1]) while infer consumed
  // stateOf() scale ([0,1]) — 16x degradation, advice skewed to constant
  // right-moves. makeJepa takes the sense() vector for BOTH. Node-pinned.
  function makeJepa() {
    let w = [0, 0, 0.5];
    return {
      learn(prevSense, curSense) {
        const pred = w[0] * prevSense[0] + w[1] * prevSense[3] + w[2];
        const err = curSense[0] - pred, lr = 0.05;
        w[0] += lr * err * prevSense[0]; w[1] += lr * err * prevSense[3]; w[2] += lr * err;
      },
      suggest(senseVec) {
        const px = Math.max(-1, Math.min(1, w[0] * senseVec[0] + w[1] * senseVec[3] + w[2]));
        const err = senseVec[0] - px;
        return { move: err < -0.05 ? -1 : err > 0.05 ? 1 : 0, confidence: 0.6, source: "jepa" };
      },
      get weights() { return w.slice(); },
    };
  }
  // === Round 3: shared hash + net ids ========================================
  function hash8(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0"); }
  function netId(net) { return hash8(JSON.stringify(net)); } // content id — stable across runs for the same weights
  // === Round 3: hash-chained match ledger (MOTH-style, honest bounds) ========
  // Unlike the browser receipt panel (silent shift at 40), evictions are
  // counted and exposed — a bounded ledger that admits it forgets.
  function makeLedger(capacity) {
    if (!(capacity >= 1)) throw new RangeError("ledger capacity must be >= 1");
    const rows = []; let head = "0".repeat(64); // genesis hash, MOTH-compatible length
    let evicted = 0;
    return {
      write(row) {
        const r = Object.assign({}, row, { i: rows.length + evicted, prev: head });
        head = hash8(JSON.stringify(r));
        r.hash = head; rows.push(r);
        if (rows.length > capacity) { rows.shift(); evicted++; }
        return r;
      },
      tail(n) { return rows.slice(-n); },
      items() { return rows.slice(); },
      get head() { return head; },
      get size() { return rows.length; },
      get evicted() { return evicted; },
      get capacity() { return capacity; },
    };
  }
  // === Round 3 (C1): COEVOLUTION — the GAN pair ==============================
  // A second paddle sits at the TOP of the arena. The survivor (bottom) keeps
  // the rally alive exactly as in L1. The ender (top) can BLOCK the ball —
  // sending it back down with a speed boost from wherever the ender's zone
  // meets it — and wants the rally SHORT: kill the survivor fast. Physics are
  // shared with L1 (same step, same effective margin); every draw uses
  // effectivePaddle so the ghost hitbox lie cannot return.
  function newAdvGame(rand) {
    const g = newGame(rand);
    g.ex = 0.42; g.enderHits = 0; g.boost = 1; // boost: hits/blocks accumulate HERE
    return g; // (L1's hitBoost multiplies speedMul after the per-frame ramp reset,
  }            //  so it is dead code there — C1 makes boosts real via `boost`)
  function stepAdv(g, actS, actE, rand) { // one frame; both nets act each decisionInterval
    const D = DEFAULTS, swan = rand || Math.random;
    if (g.frames % D.decisionInterval === 0) { g.hold = actS; g.holdE = actE; }
    g.px = Math.max(0, Math.min(1 - D.paddleW, g.px + g.hold * D.paddleSpeed));
    g.ex = Math.max(0, Math.min(1 - D.paddleW, g.ex + (g.holdE || 0) * D.paddleSpeed));
    const sp = D.ballBase * g.speedMul;
    g.x += g.vx * sp; g.y += g.vy * sp;
    if (g.x < 0) { g.x = 0; g.vx = Math.abs(g.vx); }
    if (g.x > 1) { g.x = 1; g.vx = -Math.abs(g.vx); }
    if (swan() < D.swanP * g.speedMul) { // black swan: angle kick (same law as L1)
      const a = Math.atan2(g.vy, g.vx) + (swan() - 0.5) * 1.2;
      g.vx = Math.cos(a); g.vy = Math.abs(Math.sin(a)) * (g.vy < 0 ? -1 : 1);
    }
    g.speedMul = (1 + g.frames * D.ramp) * g.boost; // boost survives the ramp
    g.frames++;
    if (g.vy < 0 && g.y <= 0.06) { // ender's line (top)
      const eff = effectivePaddle(g.ex);
      if (g.x > eff.x && g.x < eff.x + eff.w) { // ender block: back down, faster
        g.vy = Math.abs(g.vy); g.enderHits++; g.boost *= 1.02;
        g.x = Math.max(0.02, Math.min(0.98, g.x));
      } else g.vy = Math.abs(g.vy); // clean escape past the ender — wall bounce, rally continues
    }
    if (g.vy > 0 && g.y >= 0.94) { // survivor's line (bottom) — same contract as L1
      const eff = effectivePaddle(g.px);
      if (g.x > eff.x && g.x < eff.x + eff.w) {
        g.vy = -Math.abs(g.vy); g.hits++; g.boost *= D.hitBoost;
        g.x = Math.max(0.02, Math.min(0.98, g.x));
      } else return false; // death — the ender got its kill
    }
    return true;
  }
  function playAdv(sNet, eNet, rand, maxFrames) {
    const cap = maxFrames || DEFAULTS.maxFrames;
    let g = newAdvGame(rand);
    while (g.frames < cap) {
      const os = forward(sNet, sense(g)), oe = forward(eNet, sense(g));
      const pick = (o) => o[0] > o[2] ? (o[0] > o[1] ? -1 : 0) : (o[2] > o[1] ? 1 : 0);
      if (!stepAdv(g, pick(os), pick(oe), rand)) break;
    }
    const reachedCap = g.frames >= cap;
    const sFitness = fitnessOf(g.frames, g.hits); // survivor: live + hit, L1 semantics
    // ender: short rallies are wins. kill => (cap-frames) + 30/block; surviving
    // to the cap means the ender failed — small consolation for contesting.
    const eFitness = reachedCap ? g.enderHits * 5 : (cap - g.frames) + g.enderHits * 30;
    return { sFitness, eFitness, frames: g.frames, hits: g.hits,
             enderHits: g.enderHits, maxSpeed: g.speedMul,
             outcome: reachedCap ? "SURVIVOR-CAP" : "ENDER-KILL" };
  }
  // One coevolution generation: every survivor faces the ender champion, every
  // ender faces the survivor champion (minimax-style alternating pressure,
  // classic GAN pairing). THE LOSER MUTATES: the side that lost the last
  // head-to-head breeds at 2x sigma this generation (elites are still copied
  // intact — accumulation survives; pressure lands on the loser's offspring,
  // not on its champion's memory). Deterministic given `rand`: same seed =>
  // same populations, same ledger (md5-verified by tools/prerun-coev.js).
  function runCoevGeneration(popS, popE, scoredS, scoredE, rand, sigma, lastOutcome) {
    const D = DEFAULTS;
    scoredS.sort((a, b) => b.sFitness - a.sFitness);
    scoredE.sort((a, b) => b.eFitness - a.eFitness);
    const champS = scoredS[0], champE = scoredE[0];
    const breed = (scored, sig) => {
      const next = [];
      for (let i = 0; i < D.elites; i++) next.push(JSON.parse(JSON.stringify(scored[i].net)));
      while (next.length < scored.length)
        next.push(mutate(scored[Math.floor(rand() * D.elites)].net, rand, sig));
      return next;
    };
    const sigS = lastOutcome === "ENDER-KILL" ? sigma * 2 : sigma;   // the loser mutates harder
    const sigE = lastOutcome === "SURVIVOR-CAP" ? sigma * 2 : sigma;
    const nextS = breed(scoredS, sigS), nextE = breed(scoredE, sigE);
    const loserId = lastOutcome === "SURVIVOR-CAP" ? netId(champE.net)
                  : lastOutcome === "ENDER-KILL" ? netId(champS.net) : null;
    return { popS: nextS, popE: nextE,
             sChamp: champS, eChamp: champE, loserId,
             sigS, sigE };
  }
  // === Round 3: stats line + honesty badge ===================================
  function formatStats(gen, games, best) {
    let s = `gen ${gen} · games ${games} · best ${best.fitness | 0} (frames ${best.frames}, ${best.hits} hits, speed x${best.maxSpeed.toFixed(2)})`;
    if (best.hits === 0 && best.frames >= DEFAULTS.maxFrames / 2) s += " · ⚠ 0-hit luck — survival without skill";
    return s;
  }
  // === Round 3: the wristband registry =======================================
  // What the demo's "claims verified" badge renders from. proofTest names the
  // node --test file that pins the claim; null = browser-only (honest amber).
  // tests/honesty.test.js pins the two-way match between this list and tests/.
  const VERIFIED_CLAIMS = [
    { id: "fitness-weights", claim: "fitness = frames + hits×100 — a capped 0-hit survivor cannot top a hitter", proofTest: "tests/honesty.test.js" },
    { id: "ring-buffer", claim: "the champion ring is bounded FIFO with a monotonic write counter (Round 2)", proofTest: "tests/ring.test.js" },
    { id: "evaluator-elites", claim: "streaming evaluator elites equal brute-force top-K, archive stays bounded (Round 2)", proofTest: "tests/streaming.test.js" },
    { id: "effective-paddle", claim: "the drawn paddle IS the registered hitbox (0.20 incl. ±0.02 margins)", proofTest: "tests/honesty.test.js" },
    { id: "swan-seeded", claim: "black swans draw from the passed rng — seeded runs are bit-reproducible", proofTest: "tests/honesty.test.js" },
    { id: "stats-badge", claim: "the stats line shows hits and flags 0-hit luck champions", proofTest: "tests/honesty.test.js" },
    { id: "jepa-features", claim: "micro-JEPA learns and infers on the same sense() representation", proofTest: "tests/jepa.test.js" },
    { id: "llm-pacing", claim: "LLM advice fires on death/interval, one in flight, stale dropped, hung requests time out (Round 4)", proofTest: "tests/seam.test.js" },
    { id: "coev-rules", claim: "C1 coevolution: ender blocks return the ball downward; only the survivor's line can die", proofTest: "tests/coev.test.js" },
    { id: "coev-determinism", claim: "C1 coevolution is seeded-deterministic — same seed, same champions and ledger", proofTest: "tests/coev.test.js" },
    { id: "coev-glue", claim: "the browser C1 training loop runs end-to-end — evaluator→map→runCoevGeneration→h2h, champions are real nets, ledger rows hash-chain (Round 5)", proofTest: "tests/coev-glue.test.js" },
    { id: "seam-glue", claim: "the seam stamps the asking gameId at fire — a dead game's reply is dropped, never rebranded onto its successor (Round 6)", proofTest: "tests/seam-glue.test.js" },
    { id: "receipt-glue", claim: "the receipt panel counts its evictions like makeLedger — 'N shown / M evicted' after the 40-row bound (Round 7)", proofTest: "tests/receipt-glue.test.js" },
    { id: "cells-render", claim: "projection cells / fitness strip / receipt panel render live", proofTest: null },
  ];
  return { DEFAULTS, rng, makeNet, forward, mutate, step, newGame, sense, playOne,
           runGeneration, makeRing, makeEvaluator,
           HIT_WEIGHT, EFFECTIVE_MARGIN, fitnessOf, effectivePaddle, formatStats,
           makeSeam, makeJepa, hash8, netId, makeLedger,
           newAdvGame, stepAdv, playAdv, runCoevGeneration, VERIFIED_CLAIMS };
});
