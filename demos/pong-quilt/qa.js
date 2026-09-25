/* pong-quilt L2 — quantum-audio waveform-imaging advisor.
 * Sibling ports: SuperInstance/quilt-quantumaudio-demo (QPAM encode/decode pipeline
 * + honest [no-quantumaudio:...] fallback) and SuperInstance/quilt-echovision
 * (sonify state -> lossy channel -> image it back; name the seam, don't fake it).
 *
 * HONESTY CONTRACT (fleet doctrine — a labeled stub beats a fake that pretends):
 * No qiskit/AerSimulator can run inside a zero-dependency browser page. The
 * channel below is a DETERMINISTIC STAND-IN for the QPAM lossy round-trip
 * (low-pass smoothing + seeded shot noise, same LCG family as core.js). Every
 * surface says so: source tag "qa-sim", UI label, receipts. A real QPAM backend
 * belongs at the marked seam (bring-your-own endpoint, like the LLM seam).
 * Confidence is capped at SIM_MAX_CONF — a stand-in never claims full trust.
 *
 * Verified envelope of the real thing (research/2026-09-24-quantum-audio-L2.md):
 * QPAM = 9 qubits, depth 2; reconstruction pearson grows with shots/sample;
 * at 2000 shots over ~882 samples the real decode is shot-noise (run-to-run
 * pearson ~0.02). The sim's noise model is sized from that measurement.
 *
 * KEEP IN SYNC: browser loads this file; node tests require it. No dependencies. */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./core.js"));
  else root.QuantumAudioL2 = factory(root.PongQuilt);
})(typeof self !== "undefined" ? self : this, function (PQ) {
  "use strict";

  const N = 64;                 // samples per state-imaging frame
  const SIM_MAX_CONF = 0.5;     // stand-in confidence cap (honesty contract)
  const DEAD_ZCR = 0.02;        // below this the channel returned silence -> no advice (pot-bound)

  // --- 1. sonify: game state -> waveform (echovision idiom: emit, hear it back)
  // stateOf() units: ballX, paddleX in [0,1] (g.x / g.px) — this module lives
  // in that space directly, no renormalization.
  function sonify(s) {
    const f = 4 + 8 * Math.max(0, Math.min(1, s.ballX));     // ball position -> tone (4..12 cycles/frame)
    const amp = 0.5 + 0.5 * Math.min(1, (s.speed || 1) / 3); // speed -> envelope
    const intercept = (s.paddleX + 0.08) - s.ballX;          // positive: paddle right of ball
    const w = new Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / N;
      w[i] = amp * Math.sin(2 * Math.PI * f * t) + 0.30 * intercept * Math.sin(2 * Math.PI * 3 * t);
    }
    return w;
  }

  // --- 2. channel: DETERMINISTIC STAND-IN for the QPAM encode/decode round-trip.
  // Real QPAM (quilt-quantumaudio-demo/demo.py, verified by running): 9 qubits,
  // depth 2, lossy decode whose pearson vs original grows with shots/sample.
  // Stand-in = 3-tap low-pass (the smoothing QPAM decode exhibits) + shot noise
  // from a seeded LCG, amplitude ~ 1/sqrt(shotsPerBin) like real sampling noise.
  function channel(w, seed, shotsPerBin) {
    const spb = shotsPerBin || 32; // sized so noise is present but the image survives
    const rand = PQ.rng((seed == null ? 0x51eed : seed) >>> 0);
    const noiseAmp = 1.6 / Math.sqrt(spb);
    const lp = new Array(w.length);
    for (let i = 0; i < w.length; i++) {
      const a = i > 0 ? w[i - 1] : w[i], b = i < w.length - 1 ? w[i + 1] : w[i];
      lp[i] = (a + 2 * w[i] + b) / 4;
    }
    return lp.map((v) => v + (rand() - 0.5) * 2 * noiseAmp);
  }

  // --- 3. image it back: recover the tone period from the decoded waveform.
  // Autocorrelation peak over periods 5..16 samples (f in 4..12 cycles per 64)
  // — robust to the intercept harmonic; zero-crossing count alone was not.
  // Parabolic interpolation around the peak recovers sub-sample lag; without
  // it integer quantization biased xHat by up to 1/16 field (caught by tests).
  function estimateX(d) {
    const cs = [];
    for (let lag = 5; lag <= 16; lag++) {
      let c = 0;
      for (let i = 0; i + lag < d.length; i++) c += d[i] * d[i + lag];
      cs.push(c);
    }
    let bi = 0;
    for (let k = 1; k < cs.length; k++) if (cs[k] > cs[bi]) bi = k;
    const lag = 5 + bi;
    let offset = 0; // parabolic interpolation (one-sided at the search edges)
    if (bi > 0 && bi < cs.length - 1) {
      const a = cs[bi - 1], b = cs[bi], c = cs[bi + 1], den = a - 2 * b + c;
      if (Math.abs(den) > 1e-12) offset = Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / den));
    }
    const fHat = N / (lag + offset);                     // cycles per frame
    return Math.max(0, Math.min(1, (fHat - 4) / 8));     // invert sonify(): tone -> position [0,1]
  }
  function zeroCrossingRate(d) {
    let zc = 0;
    for (let i = 1; i < d.length; i++) if ((d[i - 1] < 0) !== (d[i] < 0)) zc++;
    return zc / d.length;
  }

  // --- 4. the advisor: state -> MoveSuggestion (JEV type {move, confidence, source})
  // Confidence = self-consistency of the imaging: drift between the position
  // imaged from the decoded waveform and the position imaged from the clean one.
  // A lossier channel -> more drift -> honestly lower confidence. Sim cap last.
  function suggest(s, seed) {
    const clean = sonify(s);
    const decoded = channel(clean, seed);
    if (zeroCrossingRate(decoded) < DEAD_ZCR) return null; // pot-bound: no echo, no advice
    const xClean = estimateX(clean), xHat = estimateX(decoded);
    const drift = Math.abs(xHat - xClean);
    const agree = Math.max(0, 1 - drift / 0.25);      // full agreement within a quarter-field
    const dead = 0.06;                                // paddle-centered deadzone, like jepaSuggest
    const px = s.paddleX + 0.08;
    const move = xHat < px - dead ? -1 : xHat > px + dead ? 1 : 0;
    return { move, confidence: +(Math.min(SIM_MAX_CONF, 0.5 * agree).toFixed(3)), source: "qa-sim" };
  }

  return { N, SIM_MAX_CONF, DEAD_ZCR, sonify, channel, estimateX, zeroCrossingRate, suggest };
});
