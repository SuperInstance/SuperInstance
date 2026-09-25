/* SUPERINSTANCE — a twist engine.
   Six substrates, one law: layers + deliberate offset -> interference -> emergence.
   TWIST  two hex lattices, one rotation -> moire superlattice (measured, not asserted)
   FLOCK  the same birds under four collective nouns
   CHIRP  a phased array of twelve transducers: beam steering as a twist in time
   QUILT  a tempo-twisted cell grid; the ledger counts holes, b1 = E - V + C
   PERM   the twist law in S_n: a twist is a cycle, inversions live
   SETL   the twist law in B_n: the twist is A ↦ A △ K, registry S = 1 − |A∩K|/|K|   */
"use strict";

const TAU = Math.PI * 2;
const canvas = document.getElementById("sea");
const ctx = canvas.getContext("2d");
const chartCv = document.getElementById("chart");
const chartCtx = chartCv.getContext("2d");
const metricsEl = document.getElementById("metrics");
const ctrlEl = document.getElementById("ctrl-body");
const doctrineEl = document.getElementById("doctrine");
const titleEl = document.getElementById("mode-title");
const subEl = document.getElementById("mode-sub");

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const cw = chartCv.clientWidth || 252;
  chartCv.width = cw * DPR; chartCv.height = 72 * DPR;
  chartCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (MODES[state.mode] && MODES[state.mode].resize) MODES[state.mode].resize();
}
window.addEventListener("resize", resize);

/* ---------- shared helpers ---------- */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

function makeSlider(label, min, max, step, get, set, fmt) {
  const wrap = document.createElement("div");
  wrap.className = "ctrl";
  const lab = document.createElement("label");
  const name = document.createElement("span"); name.textContent = label;
  const val = document.createElement("b");
  lab.append(name, val);
  const input = document.createElement("input");
  input.type = "range"; input.min = min; input.max = max; input.step = step;
  input.value = get();
  const show = () => { val.textContent = fmt ? fmt(get()) : get(); };
  input.addEventListener("input", () => { set(parseFloat(input.value)); show(); });
  show();
  wrap.append(lab, input);
  return wrap;
}
function makeButtons(options, get, set) {
  const wrap = document.createElement("div");
  wrap.className = "ctrl";
  const row = document.createElement("div"); row.className = "btnrow";
  const refresh = () => {
    row.querySelectorAll("button").forEach(b =>
      b.classList.toggle("active", b.dataset.k === get()));
  };
  for (const [k, label] of options) {
    const b = document.createElement("button");
    b.className = "fbtn"; b.dataset.k = k; b.textContent = label;
    b.addEventListener("click", () => { set(k); refresh(); });
    row.appendChild(b);
  }
  wrap.appendChild(row);
  refresh();
  return wrap;
}
function setMetrics(list) {
  metricsEl.innerHTML = "";
  for (const [k, v, cls] of list) {
    const row = document.createElement("div"); row.className = "metric";
    const ke = document.createElement("span"); ke.className = "k"; ke.textContent = k;
    const ve = document.createElement("span"); ve.className = "v" + (cls ? " " + cls : "");
    ve.textContent = v;
    row.append(ke, ve); metricsEl.appendChild(row);
  }
}
function chartAxes(label) {
  const w = chartCv.clientWidth, h = 72;
  chartCtx.clearRect(0, 0, w, h);
  chartCtx.strokeStyle = "rgba(237,228,211,.08)";
  chartCtx.lineWidth = 1;
  chartCtx.beginPath(); chartCtx.moveTo(0, h / 2 + .5); chartCtx.lineTo(w, h / 2 + .5); chartCtx.stroke();
  chartCtx.fillStyle = "#73909c";
  chartCtx.font = "8px ui-monospace, monospace";
  chartCtx.fillText(label, 6, 11);
}

/* ============================================================
   TWIST — two hex lattices, one rotation. The superlattice
   appears; the resonance curve is measured live, not asserted.
   ============================================================ */
const twist = {
  theta: 1.06, s: 11, curve: [], windows: [], flashes: [],
  base: null, R0: 430, dragging: false,
  doctrine: "no new atoms — <em>a new angle</em>. the property is in the twist.",
  title: "TWIST", sub: "two lattices, one deliberate misalignment",

  resize() { this.init(); },

  hex(s, R) {
    const pts = [], dy = s * Math.sin(Math.PI / 3);
    const nj = Math.ceil(R / dy) + 1, ni = Math.ceil(R / s) + 1;
    for (let j = -nj; j <= nj; j++) {
      const xo = (Math.abs(j) % 2) ? s / 2 : 0;
      for (let i = -ni; i <= ni; i++) {
        const x = i * s + xo, y = j * dy;
        if (x * x + y * y <= R * R) pts.push([x, y]);
      }
    }
    return pts;
  },
  hash(pts, eps) {
    const m = new Map();
    const OFF = 1 << 20; // integer keys: much faster than string concat at this scale
    for (const p of pts) {
      const k = (Math.floor(p[0] / eps) + OFF) * 2097152 + Math.floor(p[1] / eps) + OFF;
      let a = m.get(k); if (!a) { a = []; m.set(k, a); }
      a.push(p);
    }
    return m;
  },
  near2(m, x, y, eps) {
    const OFF = 1 << 20;
    const cx = Math.floor(x / eps), cy = Math.floor(y / eps);
    let best = Infinity;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const a = m.get((cx + i + OFF) * 2097152 + cy + j + OFF);
      if (!a) continue;
      for (const p of a) {
        const d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y);
        if (d < best) best = d;
      }
    }
    return best;
  },
  rotated(pts, th) {
    const c = Math.cos(th), s = Math.sin(th), out = new Array(pts.length);
    for (let i = 0; i < pts.length; i++)
      out[i] = [pts[i][0] * c - pts[i][1] * s, pts[i][0] * s + pts[i][1] * c];
    return out;
  },
  alignment(ptsA, ptsB, eps) {
    const m = this.hash(ptsA, eps), e2 = eps * eps;
    let hit = 0;
    for (const p of ptsB) if (this.near2(m, p[0], p[1], eps) < e2) hit++;
    return hit / ptsB.length;
  },
  init() {
    this.s = clamp(Math.min(W, H) / 72, 9, 15);
    this.R0 = Math.hypot(W, H) / 2 + this.s * 4;
    this.base = this.hex(this.s, this.R0);
    this.curve = [];
    // ONE registration instrument everywhere: mean gaussian alignment
    // (σ = 0.24·s, hash cell 0.60·s — the field the eye reads as moiré).
    // The resonance curve and the live ledger S = 1 − R must agree.
    const mA = this.hash(this.base, this.s * 0.60);
    const sig = this.s * 0.24, twoSig2 = 2 * sig * sig;
    for (let i = 0; i <= 260; i++) {
      const th = lerp(0.15, 6.0, i / 260) * Math.PI / 180;
      const B = this.rotated(this.base, th);
      let sum = 0;
      for (const p of B) sum += Math.exp(-this.near2(mA, p[0], p[1], this.s * 0.60) / twoSig2);
      this.curve.push([th, sum / B.length]);
    }
    this.windows = [];
    for (let i = 2; i < this.curve.length - 2; i++) {
      const v = this.curve[i][1];
      if (!(v > 0.10 && v > this.curve[i - 1][1] && v > this.curve[i + 1][1] &&
            v > this.curve[i - 2][1] && v > this.curve[i + 2][1])) continue;
      // prominence against the trough within ±0.45° — comb teeth stand
      // ~0.01–0.04 above their troughs; sampling noise stays under 0.006.
      let trough = Infinity;
      for (let j = Math.max(0, i - 20); j <= Math.min(this.curve.length - 1, i + 20); j++)
        if (this.curve[j][1] < trough) trough = this.curve[j][1];
      if (v - trough < 0.006) continue;
      const last = this.windows[this.windows.length - 1];
      if (last && this.curve[i][0] - last[0] <= 0.4 * Math.PI / 180) {
        if (v > last[1]) this.windows[this.windows.length - 1] = this.curve[i];
      } else this.windows.push(this.curve[i]);
    }
    this.flashes = [];
  },
  controls() {
    ctrlEl.appendChild(makeSlider(
      "TWIST THETA", 0.15, 6.0, 0.005,
      () => this.theta, v => { this.theta = v; },
      v => v.toFixed(3) + "°"));
    ctrlEl.appendChild(makeButtons(
      [["snap", "SNAP TO NEXT WINDOW"]],
      () => "",
      () => {
        const th = this.theta * Math.PI / 180;
        const next = this.windows.find(w => w[0] > th + 0.01);
        this.theta = (next ? next[0] : this.windows[0][0]) * 180 / Math.PI;
      }));
  },
  frame(dt, t) {
    const cx = W / 2, cy = H / 2;
    const s = this.s, th = this.theta * Math.PI / 180;
    const A = this.base, B = this.rotated(A, th);
    // INVARIANT: hash and near2 share one cell size. (The shipped toy broke
    // this — its S meter and flashes were dead. Fixed and kept under test.)
    // One instrument: registration R = mean gaussian alignment (σ = 0.24·s);
    // ledger S = 1 − R — the same quantity the resonance curve integrates.
    const grid = s * 0.60;
    const sig = s * 0.24, twoSig2 = 2 * sig * sig;

    ctx.fillStyle = "#0a1a24";
    ctx.fillRect(0, 0, W, H);

    ctx.save(); ctx.translate(cx, cy);
    ctx.globalCompositeOperation = "lighter";

    const dot = Math.max(1.8, s * 0.22);
    ctx.fillStyle = "rgba(70,224,192,.30)";
    for (const p of A) {
      ctx.fillRect(p[0] - dot / 2, p[1] - dot / 2, dot, dot);
    }
    ctx.fillStyle = "rgba(247,160,38,.34)";
    for (const p of B) {
      ctx.fillRect(p[0] - dot / 2, p[1] - dot / 2, dot, dot);
    }
    ctx.globalCompositeOperation = "source-over";

    if (!this.alignCache || ((this.frameNo = (this.frameNo || 0) + 1) % 6 === 0)) {
      this._cacheTheta = this.theta;
      const mA = this.hash(A, grid);
      this.alignCache = new Float32Array(B.length);
      let sum = 0;
      for (let i = 0; i < B.length; i++) {
        const d2 = this.near2(mA, B[i][0], B[i][1], grid);
        const al = Math.exp(-d2 / twoSig2);
        this.alignCache[i] = al;
        sum += al;
      }
      this.S = 1 - sum / B.length; // ledger S = 1 − registration, curve's definition
    }
    for (let i = 0; i < B.length; i++) {
      if (this.alignCache[i] > 0.86 && Math.random() < 0.003)
        this.flashes.push({ x: B[i][0], y: B[i][1], life: 1 });
    }

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt * 1.4;
      if (f.life <= 0) { this.flashes.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(247,160,38,${f.life * 0.8})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 3 + (1 - f.life) * 14, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();

    const lam = s / (2 * Math.sin(th / 2));
    this.lam = lam;
    const nearWin = this.windows.some(w => Math.abs(w[0] - th) < 0.03 * Math.PI / 180 * 6);
    this.inWindow = nearWin;

    if (!this._dragBound) {
      this._dragBound = true;
      let sx = 0, st0 = 0;
      canvas.addEventListener("pointerdown", e => {
        if (state.mode !== "twist") return;
        this.dragging = true; sx = e.clientX; st0 = this.theta;
      });
      window.addEventListener("pointermove", e => {
        if (!this.dragging) return;
        this.theta = clamp(st0 + (e.clientX - sx) * 0.008, 0.15, 6.0);
      });
      window.addEventListener("pointerup", () => { this.dragging = false; });
    }
  },
  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("R(THETA) — REGISTRATION, MEASURED");
    const x0 = 0.15 * Math.PI / 180, x1 = 6.0 * Math.PI / 180;
    chartCtx.beginPath();
    for (let i = 0; i < this.curve.length; i++) {
      const [th, v] = this.curve[i];
      const x = (th - x0) / (x1 - x0) * w;
      const y = h - 6 - v * (h - 18);
      i ? chartCtx.lineTo(x, y) : chartCtx.moveTo(x, y);
    }
    chartCtx.strokeStyle = "rgba(70,224,192,.75)"; chartCtx.lineWidth = 1.2; chartCtx.stroke();
    chartCtx.fillStyle = "rgba(247,160,38,.9)";
    for (const wp of this.windows) {
      const x = (wp[0] - x0) / (x1 - x0) * w;
      chartCtx.fillRect(x - 0.5, h - 6 - wp[1] * (h - 18) - 3, 1.5, 3);
    }
    const tx = (this.theta * Math.PI / 180 - x0) / (x1 - x0) * w;
    chartCtx.strokeStyle = "#f7a026"; chartCtx.lineWidth = 1.4;
    chartCtx.beginPath(); chartCtx.moveTo(tx, 0); chartCtx.lineTo(tx, h); chartCtx.stroke();
  },
  metrics() {
    return [
      ["TWIST", this.theta.toFixed(3) + "°", "hot"],
      ["MEAN REGISTRY", (this.S || 0).toFixed(4), ""],
      ["SUPERCELL LAMBDA", this.lam ? (this.lam / this.s).toFixed(1) + " cells" : "—", "sig"],
      ["MAGIC WINDOWS", String(this.windows.length), ""],
      ["IN A WINDOW", this.inWindow ? "YES — CORRELATED" : "no — plain grids", this.inWindow ? "hot" : ""],
    ];
  }
};

/* ============================================================
   FLOCK — same birds, four nouns. The word builds the group.
   ============================================================ */
const FICTIONS = {
  murmuration: {
    label: "MURMURATION", ali: 1.0, coh: 0.55, sep: 1.25, tgt: 0, vmax: 2.7,
    line: "seven neighbors. no plan. no architect."
  },
  pack: {
    label: "PACK", ali: 0.8, coh: 0.35, sep: 0.85, tgt: 1.6, vmax: 3.6,
    line: "pursuit. perimeter. the alpha question."
  },
  kennel: {
    label: "KENNEL", ali: 0.25, coh: 0.15, sep: 0.7, tgt: 0, vmax: 1.1,
    pen: true, line: "containment. feeding. waiting."
  },
  parliament: {
    label: "PARLIAMENT", ali: 0.9, coh: 1.3, sep: 0.6, tgt: 0, vmax: 0.9,
    ring: true, line: "the owl that speaks last has watched the longest."
  }
};
const flock = {
  birds: [], fiction: "murmuration", lureT: 0, polHist: [],
  doctrine: "the word <em>builds</em> the group. four nouns, same birds.",
  title: "FLOCK", sub: "relational rules only — no world-model anywhere",
  init() {
    this.birds = [];
    const n = Math.min(340, Math.floor(W * H / 5200));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      this.birds.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(a), vy: Math.sin(a)
      });
    }
    // parliament convenes by circling: seed tangential velocity so the ring
    // is the attractor, not a lucky accident of the initial conditions.
    if (this.fiction === "parliament") this.seedOrbit();
    this.grid = new Map();
  },
  seedOrbit() {
    for (const b of this.birds) {
      const ang = Math.atan2(b.y - H / 2, b.x - W / 2) + Math.PI / 2;
      const sp = FICTIONS.parliament.vmax * 0.7;
      b.vx = Math.cos(ang) * sp + (Math.random() - 0.5) * 0.2;
      b.vy = Math.sin(ang) * sp + (Math.random() - 0.5) * 0.2;
    }
  },
  resize() { if (state.mode === "flock") this.init(); },
  controls() {
    ctrlEl.appendChild(makeButtons(
      Object.keys(FICTIONS).map(k => [k, FICTIONS[k].label]),
      () => this.fiction,
      k => { this.fiction = k; if (k === "parliament") this.seedOrbit(); }));
  },
  frame(dt, t) {
    const F = FICTIONS[this.fiction];
    this.lureT += dt * 0.35;
    const lx = W / 2 + Math.cos(this.lureT) * W * 0.3;
    const ly = H / 2 + Math.sin(this.lureT * 1.7) * H * 0.26;
    const cx = W / 2, cy = H / 2, penR = Math.min(W, H) * 0.26, ringR = Math.min(W, H) * 0.3;

    const cell = 46, grid = this.grid;
    grid.clear();
    const B = this.birds;
    for (let i = 0; i < B.length; i++) {
      const k = Math.floor(B[i].x / cell) + "," + Math.floor(B[i].y / cell);
      let a = grid.get(k); if (!a) { a = []; grid.set(k, a); }
      a.push(i);
    }

    ctx.fillStyle = "#0a1a24"; ctx.fillRect(0, 0, W, H);

    if (F.pen) {
      ctx.strokeStyle = "rgba(247,160,38,.35)"; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(cx, cy, penR, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (F.tgt) {
      ctx.fillStyle = "rgba(247,160,38,.9)";
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, TAU); ctx.fill();
    }

    let svx = 0, svy = 0, spd = 0;
    const step = clamp(dt * 60, 0.5, 2);
    for (let i = 0; i < B.length; i++) {
      const b = B[i];
      const gx = Math.floor(b.x / cell), gy = Math.floor(b.y / cell);
      let nA = 0, ax = 0, ay = 0, px = 0, py = 0, sx = 0, sy = 0;
      for (let i2 = -1; i2 <= 1 && nA < 7; i2++) for (let j2 = -1; j2 <= 1 && nA < 7; j2++) {
        const arr = grid.get((gx + i2) + "," + (gy + j2));
        if (!arr) continue;
        for (const j of arr) {
          if (j === i || nA >= 7) continue;
          const o = B[j], dx = o.x - b.x, dy = o.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 46 * 46 || d2 < 1e-6) continue;
          nA++; ax += o.vx; ay += o.vy; px += o.x; py += o.y;
          const inv = 1 / d2; sx -= dx * inv; sy -= dy * inv;
        }
      }
      let fx = 0, fy = 0;
      if (nA > 0) {
        const al = Math.hypot(ax, ay) || 1;
        fx += (ax / al - b.vx / (Math.hypot(b.vx, b.vy) || 1)) * F.ali * 0.05;
        fy += (ay / al - b.vy / (Math.hypot(b.vx, b.vy) || 1)) * F.ali * 0.05;
        fx += ((px / nA - b.x)) * F.coh * 0.0016;
        fy += ((py / nA - b.y)) * F.coh * 0.0016;
        fx += sx * F.sep * 0.9; fy += sy * F.sep * 0.9;
      }
      if (F.tgt) { fx += (lx - b.x) * 0.00045 * F.tgt; fy += (ly - b.y) * 0.00045 * F.tgt; }
      if (F.pen) {
        const dx = cx - b.x, dy = cy - b.y, d = Math.hypot(dx, dy) || 1;
        if (d > penR) {
          const ov = d - penR; // spring past the fence: overshoot must cost
          fx += dx / d * (0.06 + ov * 0.012);
          fy += dy / d * (0.06 + ov * 0.012);
        }
        fx *= 0.985; fy *= 0.985;
      }
      if (F.ring) {
        const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy) || 1;
        const err = ringR - d;
        fx += dx / d * err * 0.0012 - dy / d * 0.012;
        fy += dy / d * err * 0.0012 + dx / d * 0.012;
      }
      b.vx += fx * step; b.vy += fy * step;
      const v = Math.hypot(b.vx, b.vy) || 1;
      const vc = clamp(v, F.vmax * 0.35, F.vmax);
      b.vx = b.vx / v * vc; b.vy = b.vy / v * vc;
      b.x += b.vx * step; b.y += b.vy * step;
      if (b.x < -8) b.x = W + 8; if (b.x > W + 8) b.x = -8;
      if (b.y < -8) b.y = H + 8; if (b.y > H + 8) b.y = -8;

      svx += b.vx / vc; svy += b.vy / vc; spd += vc;
      const ang = Math.atan2(b.vy, b.vx);
      ctx.strokeStyle = "rgba(70,224,192,.8)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(b.x - Math.cos(ang) * 4, b.y - Math.sin(ang) * 4);
      ctx.lineTo(b.x + Math.cos(ang) * 4, b.y + Math.sin(ang) * 4);
      ctx.stroke();
    }
    const pol = Math.hypot(svx, svy) / B.length;
    this.polHist.push(pol); if (this.polHist.length > 220) this.polHist.shift();
    this.pol = pol; this.meanSpd = spd / B.length;
  },
  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("POLARIZATION — |MEAN HEADING|");
    if (this.polHist.length < 2) return;
    chartCtx.beginPath();
    for (let i = 0; i < this.polHist.length; i++) {
      const x = i / 219 * w, y = h - 6 - this.polHist[i] * (h - 18);
      i ? chartCtx.lineTo(x, y) : chartCtx.moveTo(x, y);
    }
    chartCtx.strokeStyle = "rgba(247,160,38,.85)"; chartCtx.lineWidth = 1.2; chartCtx.stroke();
  },
  metrics() {
    const F = FICTIONS[this.fiction];
    return [
      ["FICTION", F.label, "hot"],
      ["BIRDS", String(this.birds.length), ""],
      ["MEAN SPEED", (this.meanSpd || 0).toFixed(2), ""],
      ["POLARIZATION", (this.pol || 0).toFixed(3), "sig"],
      ["RULE", F.line, ""]
    ];
  }
};

/* ============================================================
   CHIRP — twelve transducers, progressive phase twist = beam.
   The interference field is computed; contacts are found by it.
   ============================================================ */
const chirp = {
  twist: 0, auto: true, fish: [], log: [], heading: 0,
  doctrine: "the box rings. <em>listen in time</em> for what you cannot see in space.",
  title: "CHIRP", sub: "twelve transducers — resolution bought with bandwidth, position bought with time",
  N: 12, lambda: 26,
  init() {
    this.fish = [];
    for (let i = 0; i < 6; i++)
      this.fish.push({
        x: W * (0.15 + Math.random() * 0.7),
        y: H * (0.15 + Math.random() * 0.5),
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.2,
        cool: 0, lastR: null, lastT: 0
      });
    this.log = [];
    this.off = document.createElement("canvas");
    this.frameCount = 0;
  },
  resize() { if (state.mode === "chirp") this.init(); },
  controls() {
    ctrlEl.appendChild(makeSlider(
      "PHASE TWIST / ELEMENT", -60, 60, 0.5,
      () => this.auto ? this.heading : this.twist,
      v => { this.twist = v; this.auto = false; },
      v => v.toFixed(1) + "°"));
    ctrlEl.appendChild(makeButtons(
      [["scan", "AUTO-SWEEP"], ["hold", "HOLD BEAM"]],
      () => this.auto ? "scan" : "hold",
      k => { this.auto = (k === "scan"); }));
  },
  fieldAt(x, y, t, src) {
    const k = TAU / this.lambda;
    let re = 0, im = 0;
    const w = t * TAU * 0.9;
    const fph = this.focusPh(src);
    for (let n = 0; n < this.N; n++) {
      const dx = x - src[n][0], dy = y - src[n][1];
      const ph = k * Math.sqrt(dx * dx + dy * dy) - w + fph[n];
      re += Math.cos(ph); im += Math.sin(ph);
    }
    return Math.sqrt(re * re + im * im) / this.N;
  },
  focusPh(src) {
    // time-reversal focusing: each element pre-compensates its path length to
    // the steered focus point, so the wavefront arrives in phase there (I→1).
    // a linear phase ramp would only tilt the beam — in the near field the
    // focal spot is the physical way to buy position with time.
    const k = TAU / this.lambda, h = this.heading * Math.PI / 180, fr = H * 0.55;
    const cx = (src[0][0] + src[this.N - 1][0]) / 2;
    const Fx = cx + Math.sin(h) * fr, Fy = src[0][1] - Math.cos(h) * fr;
    const out = new Array(this.N);
    for (let n = 0; n < this.N; n++) {
      const dx = Fx - src[n][0], dy = Fy - src[n][1];
      out[n] = -k * Math.sqrt(dx * dx + dy * dy);
    }
    return out;
  },
  focusXY(src) {
    const h = this.heading * Math.PI / 180, fr = H * 0.55;
    const cx = (src[0][0] + src[this.N - 1][0]) / 2;
    return [cx + Math.sin(h) * fr, src[0][1] - Math.cos(h) * fr];
  },
  frame(dt, t) {
    if (!this.off) this.init();
    if (this.auto) this.heading = 52 * Math.sin(t * 0.22);
    else this.heading = this.twist;

    const src = [];
    for (let n = 0; n < this.N; n++)
      src.push([lerp(W * 0.16, W * 0.84, n / (this.N - 1)), H * 0.94]);

    let st = Math.max(4, Math.round(Math.min(W, H) / 140));
    let gw = Math.ceil(W / st), gh = Math.ceil(H / st);
    while (gw * gh * this.N > 500000) { st += 1; gw = Math.ceil(W / st); gh = Math.ceil(H / st); }

    this.frameCount++;
    if (this.frameCount % 2 === 0 || this.off.width !== gw) {
      this.off.width = gw; this.off.height = gh;
      const octx = this.off.getContext("2d");
      const img = octx.createImageData(gw, gh);
      const d = img.data;
      const k = TAU / this.lambda, wv = t * TAU * 0.9;
      const fph = this.focusPh(src);
      for (let gy = 0; gy < gh; gy++) {
        const y = gy * st + st / 2;
        for (let gx = 0; gx < gw; gx++) {
          const x = gx * st + st / 2;
          let re = 0, im = 0;
          for (let n = 0; n < this.N; n++) {
            const dx = x - src[n][0], dy = y - src[n][1];
            const ph = k * Math.sqrt(dx * dx + dy * dy) - wv + fph[n];
            re += Math.cos(ph); im += Math.sin(ph);
          }
          const I = Math.sqrt(re * re + im * im) / this.N;
          const v = Math.pow(I, 1.7);
          const o = (gy * gw + gx) * 4;
          d[o]     = Math.round(lerp(10, 247, Math.max(0, v - 0.35) * 1.6));
          d[o + 1] = Math.round(lerp(26, 190, v));
          d[o + 2] = Math.round(lerp(36, 120, v * v));
          d[o + 3] = 255;
        }
      }
      octx.putImageData(img, 0, 0);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.off, 0, 0, W, H);
    ctx.fillStyle = "#0a1a24";
    ctx.fillRect(0, H * 0.94 + 5, W, H - H * 0.94);

    for (const s of src) {
      ctx.fillStyle = "#f7a026";
      ctx.fillRect(s[0] - 2, s[1] - 3, 4, 6);
    }

    // the focal spot — where the array is listening
    const F = this.focusXY(src);
    ctx.strokeStyle = "rgba(70,224,192,.55)";
    ctx.beginPath(); ctx.arc(F[0], F[1], 7, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(F[0] - 11, F[1]); ctx.lineTo(F[0] + 11, F[1]);
    ctx.moveTo(F[0], F[1] - 11); ctx.lineTo(F[0], F[1] + 11); ctx.stroke();
    ctx.fillStyle = "rgba(70,224,192,.75)"; ctx.font = "8px ui-monospace, monospace";
    ctx.fillText("FOCUS", F[0] + 10, F[1] - 10);

    const arrayCx = (src[0][0] + src[this.N - 1][0]) / 2;
    for (const f of this.fish) {
      f.x += f.vx; f.y += f.vy;
      if (f.x < W * 0.08 || f.x > W * 0.92) f.vx *= -1;
      if (f.y < H * 0.1 || f.y > H * 0.62) f.vy *= -1;
      f.cool -= dt;
      const I = this.fieldAt(f.x, f.y, t, src);
      const r = Math.hypot(f.x - arrayCx, f.y - H * 0.94) / 40;
      if (I > 0.72 && f.cool <= 0) {
        f.cool = 2.2; f.flash = 1;
        const closure = (f.lastR !== null) ? (f.lastR - r) / Math.max(0.5, t - f.lastT) : null;
        this.log.unshift({
          r, closure,
          brg: Math.atan2(f.x - arrayCx, (H * 0.94 - f.y)) * 180 / Math.PI,
          h: this.heading // beam heading at detection — makes bearing verifiable
        });
        if (this.log.length > 4) this.log.pop();
        f.lastR = r; f.lastT = t;
      }
      f.flash = Math.max(0, (f.flash || 0) - dt * 0.7);
      ctx.fillStyle = f.flash > 0 ? `rgba(247,160,38,${0.4 + f.flash * 0.6})` : "rgba(70,224,192,.85)";
      ctx.beginPath(); ctx.arc(f.x, f.y, f.flash > 0 ? 5.5 : 3.5, 0, TAU); ctx.fill();
      if (f.flash > 0) {
        ctx.strokeStyle = `rgba(247,160,38,${f.flash})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, 6 + (1 - f.flash) * 22, 0, TAU); ctx.stroke();
      }
    }
    this.lastContact = this.log[0] || null;
  },
  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("BEAM HEADING — DEG OFF BOW");
    const cx = w / 2, cy = h - 8, R = h * 0.72;
    chartCtx.strokeStyle = "rgba(237,228,211,.18)";
    chartCtx.beginPath(); chartCtx.arc(cx, cy, R, Math.PI, TAU); chartCtx.stroke();
    const a = -Math.PI / 2 + this.heading * Math.PI / 180 * 1.4;
    chartCtx.strokeStyle = "#f7a026"; chartCtx.lineWidth = 1.6;
    chartCtx.beginPath(); chartCtx.moveTo(cx, cy);
    chartCtx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92);
    chartCtx.stroke();
    chartCtx.fillStyle = "#73909c"; chartCtx.font = "8px ui-monospace, monospace";
    chartCtx.fillText("-60", 8, h - 4); chartCtx.fillText("+60", w - 24, h - 4);
  },
  metrics() {
    const c = this.lastContact;
    return [
      ["TWIST / ELEMENT", this.heading.toFixed(1) + "°", "hot"],
      ["ELEMENTS", "12 TRANSDUCERS", ""],
      ["FOCUS RANGE", (H * 0.55).toFixed(0) + " PX", ""],
      ["CONTACT RANGE", c ? c.r.toFixed(2) + " NM" : "—", "sig"],
      ["CONTACT BEARING", c ? c.brg.toFixed(1) + "°" : "—", ""],
      ["CLOSURE", c && c.closure !== null && c.closure !== undefined
        ? (c.closure > 0 ? "CLOSING " : "OPENING ") + Math.abs(c.closure).toFixed(2) + " KN"
        : "AWAITING SECOND PING", c && c.closure > 0 ? "hot" : ""]
    ];
  }
};

/* ============================================================
   QUILT — a tempo-twisted cell grid. Every cell a boolean snap.
   The ledger counts the holes: b1 = E - V + C.
   ============================================================ */
const quilt = {
  N: 24, delta: 0.06, K: 1.1, phi: null, w0: TAU * 0.42, fired: null,
  stepBack: false, hist: [], acc: 0,
  doctrine: "the pattern is not in any hook. <em>b1 = E − V + C</em> — the ledger counts the holes.",
  title: "QUILT", sub: "two sub-lattices twisted in tempo; the step-back is computed, live",
  init() {
    const n = this.N * this.N;
    this.phi = new Float64Array(n);
    this.fired = new Float64Array(n).fill(-99);
    for (let i = 0; i < n; i++) this.phi[i] = Math.random() * TAU;
    this.hist = [];
  },
  resize() { if (state.mode === "quilt") this.init(); },
  controls() {
    ctrlEl.appendChild(makeSlider(
      "TEMPO TWIST DELTA", 0, 0.4, 0.002,
      () => this.delta, v => { this.delta = v; },
      v => (v * 100).toFixed(1) + "%"));
    ctrlEl.appendChild(makeSlider(
      "COUPLING K", 0, 3, 0.02,
      () => this.K, v => { this.K = v; },
      v => v.toFixed(2)));
    ctrlEl.appendChild(makeButtons(
      [["zoom", "STEP BACK"]],
      () => "",
      () => { this.stepBack = !this.stepBack; }));
  },
  frame(dt, t) {
    const N = this.N, phi = this.phi, K = this.K, d = this.delta;
    const step = clamp(dt, 0.001, 0.05);
    const deltaPhi = new Float64Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const w = ((x + y) % 2 === 0) ? this.w0 : this.w0 * (1 + d);
      let cpl = 0;
      if (x > 0) cpl += Math.sin(phi[i - 1] - phi[i]);
      if (x < N - 1) cpl += Math.sin(phi[i + 1] - phi[i]);
      if (y > 0) cpl += Math.sin(phi[i - N] - phi[i]);
      if (y < N - 1) cpl += Math.sin(phi[i + N] - phi[i]);
      deltaPhi[i] = (w + K * cpl * 0.25) * step;
    }
    for (let i = 0; i < N * N; i++) {
      phi[i] += deltaPhi[i];
      if (phi[i] >= TAU) { phi[i] -= TAU; this.fired[i] = t; }
    }

    const Wc = 1.2;
    const active = new Int8Array(N * N);
    let V = 0;
    for (let i = 0; i < N * N; i++) if (t - this.fired[i] < Wc) { active[i] = 1; V++; }
    const parent = new Int32Array(N * N); for (let i = 0; i < N * N; i++) parent[i] = i;
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    let E = 0;
    const edges = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      if (!active[i]) continue;
      const tryLink = (j) => {
        if (active[j]) {
          E++; edges.push([i, j]);
          const ra = find(i), rb = find(j);
          if (ra !== rb) parent[ra] = rb;
        }
      };
      if (x < N - 1) tryLink(i + 1);
      if (y < N - 1) tryLink(i + N);
      if (x < N - 1 && y < N - 1) tryLink(i + N + 1);
      if (x > 0 && y < N - 1) tryLink(i + N - 1);
    }
    const roots = new Set();
    for (let i = 0; i < N * N; i++) if (active[i]) roots.add(find(i));
    const C = roots.size;
    const b1 = Math.max(0, E - V + C);
    this.acc += dt;
    if (this.acc > 0.12) { this.acc = 0; this.hist.push(b1); if (this.hist.length > 220) this.hist.shift(); }
    this.V = V; this.E = E; this.C = C; this.b1 = b1;

    ctx.fillStyle = "#0a1a24"; ctx.fillRect(0, 0, W, H);
    const size = Math.min(W, H) * (this.stepBack ? 0.52 : 0.78);
    const cs = size / N, ox = (W - size) / 2, oy = (H - size) / 2;

    ctx.strokeStyle = "rgba(247,160,38,.20)"; ctx.lineWidth = 1;
    for (const [a, b] of edges) {
      const ax = a % N, ay = (a / N) | 0, bx = b % N, by = (b / N) | 0;
      ctx.beginPath();
      ctx.moveTo(ox + (ax + 0.5) * cs, oy + (ay + 0.5) * cs);
      ctx.lineTo(ox + (bx + 0.5) * cs, oy + (by + 0.5) * cs);
      ctx.stroke();
    }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const ph = phi[i] / TAU;
      const age = t - this.fired[i];
      const flash = age < 0.5 ? 1 - age * 2 : 0;
      const g = Math.pow(ph, 3);
      const r = Math.round(lerp(lerp(14, 46, g), 247, flash));
      const gg = Math.round(lerp(lerp(38, 224, g), 160, flash));
      const b = Math.round(lerp(lerp(48, 192, g), 38, flash));
      ctx.fillStyle = `rgb(${r},${gg},${b})`;
      ctx.fillRect(ox + x * cs + 0.5, oy + y * cs + 0.5, cs - 1, cs - 1);
    }
  },
  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("B1 OVER TIME — HOLES IN THE CO-FIRE GRAPH");
    if (this.hist.length < 2) return;
    const mx = Math.max(4, ...this.hist);
    chartCtx.beginPath();
    for (let i = 0; i < this.hist.length; i++) {
      const x = i / 219 * w, y = h - 6 - this.hist[i] / mx * (h - 18);
      i ? chartCtx.lineTo(x, y) : chartCtx.moveTo(x, y);
    }
    chartCtx.strokeStyle = "rgba(70,224,192,.85)"; chartCtx.lineWidth = 1.2; chartCtx.stroke();
  },
  metrics() {
    return [
      ["TEMPO TWIST", (this.delta * 100).toFixed(1) + "%", "hot"],
      ["V — SNAPS", String(this.V || 0), ""],
      ["E — RELATIONS", String(this.E || 0), ""],
      ["C — COMPONENTS", String(this.C || 0), ""],
      ["B1 — HOLES", String(this.b1 || 0), "sig"]
    ];
  }
};

/* ============================================================
   PERM — the twist law in S_n
   arrangement model: arr[i] = wire label sitting at position i
   (one-line notation, left→right along the top rail).
   · adjacent swap at (i, i+1) = Coxeter generator σ_i
   · "twist k" rotates the first k entries left by one = the
     k-cycle (1 2 … k) = the braid word σ1σ2…σ{k−1}
     — the exact analog of TWIST's k-block rotation.
   ledger: inversions (Cayley distance), cycles, parity, LIS,
   fixed points, derangement — every quantity computed live.
   ============================================================ */
function subfactorial(n) {
  if (n === 0) return 1;
  let a = 1, b = 0; // !0 = 1, !1 = 0; !(i) = (i−1)(!(i−1) + !(i−2))
  for (let i = 2; i <= n; i++) { const t = (i - 1) * (a + b); a = b; b = t; }
  return b;
}

const perm = {
  n: 6, arr: [], tw: 3, iSel: 1,
  walking: false, rate: 6, acc: 0, railAcc: 0,
  hist: [], walkInv: [], steps: 0, flash: null,
  inv: 0, cyc: 0, lisV: 0, fixed: 0,
  doctrine: "one law: adjacent swaps generate everything. <em>a twist is a cycle.</em>",
  title: "PERM", sub: "misalignment as a permutation — the twist law in S_n",

  resize() { if (state.mode === "perm") this.init(); },
  init() {
    this.arr = Array.from({ length: this.n }, (_, i) => i);
    this.hist = []; this.walkInv = []; this.steps = 0;
    this.acc = 0; this.railAcc = 0; this.flash = null;
    this.recompute();
  },

  // ---- group arithmetic ----
  recompute() {
    const a = this.arr, n = this.n;
    let inv = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++)
      if (a[i] > a[j]) inv++;
    const seen = new Array(n).fill(false);
    let c = 0;
    for (let i = 0; i < n; i++) if (!seen[i]) { c++; let j = i; while (!seen[j]) { seen[j] = true; j = a[j]; } }
    const top = [];
    for (const x of a) {
      let lo = 0, hi = top.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (top[m] < x) lo = m + 1; else hi = m; }
      top[lo] = x;
    }
    let fixed = 0;
    for (let i = 0; i < n; i++) if (a[i] === i) fixed++;
    this.inv = inv; this.cyc = c; this.lisV = top.length; this.fixed = fixed;
    this.deranged = fixed === 0;
  },
  swap(i) { // Coxeter generator σ_i at positions (i, i+1)
    if (i < 0 || i + 1 >= this.n) return;
    const t = this.arr[i]; this.arr[i] = this.arr[i + 1]; this.arr[i + 1] = t;
    this.steps++; this.flash = { i, life: 1 };
  },
  twistBlock(k) { // the k-cycle (1 2 … k) on the first k positions
    if (k < 2 || k > this.n) return;
    const head = this.arr.slice(0, k);
    head.push(head.shift());
    this.arr.splice(0, k, ...head);
    this.steps++; this.flash = { i: 0, life: 1 };
  },
  shuffle() {
    for (let i = this.n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = this.arr[i]; this.arr[i] = this.arr[j]; this.arr[j] = t;
    }
    this.steps++; this.flash = null;
  },

  controls() {
    ctrlEl.appendChild(makeSlider("WIRES N", 3, 12, 1,
      () => this.n, v => { this.n = v; this.tw = Math.min(this.tw, v); this.iSel = Math.min(this.iSel, v - 2); this.init(); ctrlEl.innerHTML = ""; this.controls(); },
      v => String(v)));
    ctrlEl.appendChild(makeSlider("TWIST BLOCK K", 2, this.n, 1,
      () => this.tw, v => { this.tw = v; },
      v => String(v)));
    ctrlEl.appendChild(makeButtons(
      [["twist", "TWIST K (CYCLE)"], ["swap", "SWAP σ"], ["shuffle", "SHUFFLE"], ["reset", "RESET"]],
      () => "",
      v => {
        if (v === "twist") this.twistBlock(this.tw);
        else if (v === "swap") this.swap(this.iSel);
        else if (v === "shuffle") this.shuffle();
        else this.init();
      }));
    ctrlEl.appendChild(makeSlider("SWAP INDEX i", 1, this.n - 1, 1,
      () => this.iSel + 1, v => { this.iSel = v - 1; },
      v => "σ_" + v));
    ctrlEl.appendChild(makeButtons(
      [[true, "WALK: ON"], [false, "WALK: OFF"]],
      () => this.walking,
      v => { this.walking = v; }));
    ctrlEl.appendChild(makeSlider("WALK RATE /S", 1, 60, 1,
      () => this.rate, v => { this.rate = v; },
      v => String(v)));
  },

  frame(dt, t) {
    if (this.walking) {
      this.acc += dt * this.rate;
      while (this.acc >= 1) {
        this.acc -= 1;
        this.swap(Math.floor(Math.random() * (this.n - 1)));
        this.recompute();
        this.walkInv.push(this.inv);
        if (this.walkInv.length > 2000) this.walkInv.shift();
      }
    }
    this.recompute();
    this.railAcc += dt;
    if (this.railAcc > 0.12) { this.railAcc = 0; this.hist.push(this.inv); if (this.hist.length > 220) this.hist.shift(); }

    ctx.fillStyle = "#0a1a24"; ctx.fillRect(0, 0, W, H);
    const n = this.n, pad = Math.max(56, W * 0.09);
    const y0 = H * 0.14, y1 = H * 0.86;
    const span = W - 2 * pad;
    const ax = i => n === 1 ? W / 2 : pad + i * span / (n - 1);

    // rails
    ctx.strokeStyle = "rgba(70,224,192,.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad - 24, y0); ctx.lineTo(W - pad + 24, y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad - 24, y1); ctx.lineTo(W - pad + 24, y1); ctx.stroke();

    // wires: position i (top) → position arr[i] (bottom); identity = straight
    for (let i = 0; i < n; i++) {
      const label = this.arr[i];
      const u = n === 1 ? 0 : label / (n - 1);
      ctx.strokeStyle = `rgba(${Math.round(lerp(70, 247, u))},${Math.round(lerp(224, 160, u))},${Math.round(lerp(192, 38, u))},.72)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(ax(i), y0);
      ctx.bezierCurveTo(ax(i), lerp(y0, y1, 0.5), ax(label), lerp(y0, y1, 0.5), ax(label), y1);
      ctx.stroke();
    }

    // swap flash
    if (this.flash) {
      this.flash.life -= dt * 2.2;
      if (this.flash.life <= 0) this.flash = null;
      else {
        const fx = (ax(this.flash.i) + ax(Math.min(this.flash.i + 1, n - 1))) / 2;
        const fy = lerp(y0, y1, 0.5);
        ctx.strokeStyle = `rgba(247,160,38,${this.flash.life * 0.9})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(fx, fy, 6 + (1 - this.flash.life) * 26, 0, TAU); ctx.stroke();
      }
    }

    // anchor pips + labels
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(70,224,192,.8)";
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.arc(ax(i), y0, 3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(ax(i), y1, 3, 0, TAU); ctx.fill();
      ctx.fillText(String(i), ax(i) - 3, y0 - 8);
      ctx.fillText(String(i), ax(i) - 3, y1 + 16);
    }
  },

  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("INVERSIONS — CAYLEY DISTANCE |π|");
    if (this.hist.length < 2) return;
    const mx = Math.max(2, this.n * (this.n - 1) / 2);
    chartCtx.beginPath();
    for (let i = 0; i < this.hist.length; i++) {
      const x = i / 219 * w, y = h - 6 - this.hist[i] / mx * (h - 18);
      i ? chartCtx.lineTo(x, y) : chartCtx.moveTo(x, y);
    }
    chartCtx.strokeStyle = "rgba(70,224,192,.85)"; chartCtx.lineWidth = 1.2; chartCtx.stroke();
    // theory line: uniform mean E = n(n−1)/4
    const ey = h - 6 - (this.n * (this.n - 1) / 4) / mx * (h - 18);
    chartCtx.strokeStyle = "rgba(247,160,38,.4)"; chartCtx.setLineDash([3, 4]);
    chartCtx.beginPath(); chartCtx.moveTo(0, ey); chartCtx.lineTo(w, ey); chartCtx.stroke();
    chartCtx.setLineDash([]);
  },

  metrics() {
    const rows = [
      ["N — WIRES", String(this.n), ""],
      ["INVERSIONS |π|", String(this.inv), "sig"],
      ["CYCLES", String(this.cyc), ""],
      ["PARITY", this.inv % 2 ? "odd" : "even", ""],
      ["LIS", String(this.lisV), ""],
      ["FIXED / DERANGED", `${this.fixed} / ${this.deranged ? "yes" : "no"}`, this.deranged ? "hot" : ""],
      ["!N — DERANGEMENTS", String(subfactorial(this.n)), ""]
    ];
    if (this.walkInv.length >= 20) {
      const m = this.walkInv.length;
      const mu = this.walkInv.reduce((a, x) => a + x, 0) / m;
      const va = this.walkInv.reduce((a, x) => a + (x - mu) * (x - mu), 0) / m;
      const eT = this.n * (this.n - 1) / 4;
      const vT = this.n * (this.n - 1) * (2 * this.n + 5) / 72;
      rows.push(["WALK μ (live / theory)", `${mu.toFixed(2)} / ${eT.toFixed(2)}`, ""]);
      rows.push(["WALK σ² (live / theory)", `${va.toFixed(2)} / ${vT.toFixed(2)}`, ""]);
    }
    return rows;
  }
};

/* ============================================================
   SETL — the twist law in B_n (the Boolean lattice)
   substrate: all subsets of an n-set under inclusion, 2^n vertices,
   cover graph = the n-cube. n tunable 4..8 for viewability.
   twist law: fix the offset subset K ⊆ [n]; the twist is ONE global
   operation on every vertex — no new atoms, a new relation:
       τ_K : A ↦ A △ K        (symmetric difference with K)
   · K={i} is a single-bit flip = a cover relation of B_n — a generator
     of the cube's edges (PERM's Coxeter σ_i, ported to subsets).
   · K=[n] is complementation: a fixed-point-free involution and order
     anti-automorphism, rank r ↦ n−r.
   commensuration analog, measured like TWIST instead of asserted:
       registry R(A) = |A ∩ K| / |K|   (fraction of the offset present in A)
       ledger   S(A) = 1 − R(A)         — the same misalignment meter as TWIST
   emergent quantity = the rank displacement the twist induces:
       |A △ K| − |A| = |K| − 2|A ∩ K| = |K|·(2S(A) − 1)
   — a linear readout of the same meter. Interference: one offset, every
   vertex thrown to a new rank. Emergence: the measured displacement.
   ledger (live, one definition, no dead meters): rank |A|; per-rank counts
   C(n,r); Sperner antichain = widest rank C(n,⌊n/2⌋) rendered distinctly
   (Sperner 1928); registry R, S; displacement; complement pairs 2^(n−1)
   (derived: fixed-point-free involution on 2^n vertices); Dedekind trace
   M(n) cited from table only — OEIS A000372 (Dedekind 1897; M(8):
   Wiedemann 1991) — never computed above what the view handles.
   WALK: random single-bit flips = the Ehrenfest urn (Ehrenfest & Ehrenfest
   1907, Physikalische Zeitschrift 8:311–314). Rank then converges to the
   binomial CLT: mean → n/2, variance → n/4 — measured live, drawn against
   the amber theory lines. (Binomial identities: standard; e.g. Pascal.)
   ============================================================ */
function popcount(x) {
  x = x - ((x >> 1) & 0x55555555);             // SWAR popcount, 32-bit
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  return (x * 0x01010101) >> 24;
}
function binom(n, r) { // exact integers; n ≤ 8 here, far from overflow
  if (r < 0 || r > n) return 0;
  r = Math.min(r, n - r);
  let out = 1;
  for (let i = 1; i <= r; i++) out = out * (n - r + i) / i; // exact: divisible each step (Pascal)
  return out;
}
// Dedekind numbers M(n) = # monotone Boolean functions on n vars = # antichains
// in B_n = # elements of the free distributive lattice on n generators.
// CITED TABLE ONLY — never computed past the view (M(9) is unknown).
// Values n=0..8: OEIS A000372; M(8) after Wiedemann 1991 ("A computation of
// the eighth Dedekind number", Order 8:5–6). n=8 exceeds 2^53 → string.
const DEDEKIND = { 0: "2", 1: "3", 2: "6", 3: "20", 4: "168", 5: "7581",
  6: "7828352", 7: "2414682040998", 8: "56130437228687557907788" };

const setl = {
  n: 5, A: 0, K: 0b00011, // state: ONE vertex A ⊆ [n], plus the fixed offset K
  walking: false, rate: 10, acc: 0, railAcc: 0, steps: 0,
  hist: [], walkRank: [], trail: [], flash: null,
  doctrine: "no new atoms — <em>a new subset K</em>. the property is in the twist: A ↦ A △ K.",
  title: "SETL", sub: "the twist law in B_n — misalignment of a subset against a fixed offset",

  resize() { /* layout is derived per-frame from W/H; nothing stale to rebuild */ },
  init() { // RESET: ∅ against the fixed offset — full misalignment, maximal displacement
    const mask = (1 << this.n) - 1;
    this.A = 0; this.K &= mask;
    this.hist = []; this.walkRank = []; this.trail = [];
    this.acc = 0; this.railAcc = 0; this.steps = 0; this.flash = null;
    this.recompute();
  },

  // ---- lattice arithmetic (all exact, all cited in the header comment) ----
  recompute() {
    const n = this.n, A = this.A, K = this.K;
    const rank = popcount(A);            // |A| — position on any maximal chain
    const k = popcount(K);               // |K|
    const inter = popcount(A & K);       // |A ∩ K|
    const R = k ? inter / k : 1;         // registry — fraction of the offset present
    const twistRank = popcount(A ^ K);   // |A △ K|
    const mid = n >> 1;                  // floor(n/2)
    this.rank = rank; this.k = k; this.inter = inter;
    this.R = R; this.S = 1 - R;          // ledger S = 1 − registry, TWIST's definition
    this.displacement = twistRank - rank;        // = k − 2·|A∩K| = k·(2S − 1)
    this.twistRank = twistRank;
    this.sperner = binom(n, mid);        // Sperner 1928: width of B_n = C(n,⌊n/2⌋)
    this.atMiddle = this.rankCount === this.sperner; // current rank IS a widest rank (odd n: two of them)
    this.rankCount = binom(n, rank);     // how many subsets share the current rank
    this.complementPairs = Math.pow(2, n - 1); // fixed-point-free involution A↦Aᶜ on 2^n verts
    this.dedekind = DEDEKIND[n];
    this.maxChain = n + 1;               // longest chain ∅⊂…⊂[n] has n covers, n+1 vertices
  },
  flip(i) { // cover relation: toggle element i — a generator of the n-cube's edges
    if (i < 0 || i >= this.n) return;
    this.A ^= (1 << i);
    this.steps++; this.flash = { i, life: 1 };
    this.trail.push(this.A); if (this.trail.length > 48) this.trail.shift();
  },
  applyTwist() { // τ_K: the twist law itself, applied to the current vertex
    this.A ^= this.K;
    this.steps++; this.flash = { i: -1, life: 1 };
    this.trail.push(this.A); if (this.trail.length > 48) this.trail.shift();
  },
  complement() { // τ_[n]: the full twist = complementation, rank ↦ n − rank
    this.A ^= (1 << this.n) - 1;
    this.steps++; this.flash = { i: -2, life: 1 };
    this.trail.push(this.A); if (this.trail.length > 48) this.trail.shift();
  },

  controls() {
    ctrlEl.appendChild(makeSlider("SET SIZE N", 4, 8, 1,
      () => this.n, v => { this.n = v; this.K &= (1 << v) - 1; this.A &= (1 << v) - 1; this.init(); ctrlEl.innerHTML = ""; this.controls(); },
      v => String(v)));
    // the offset K, edited bit by bit — the deliberate misalignment, made visible
    const kWrap = document.createElement("div"); kWrap.className = "ctrl";
    const kLab = document.createElement("label");
    const kName = document.createElement("span"); kName.textContent = "OFFSET SUBSET K";
    const kVal = document.createElement("b");
    kLab.append(kName, kVal);
    const kRow = document.createElement("div"); kRow.className = "btnrow";
    const kBits = [];
    const showK = () => {
      kVal.textContent = this.K.toString(2).padStart(this.n, "0") + "  (|K|=" + popcount(this.K) + ")";
      kBits.forEach((b, i) => b.classList.toggle("active", !!(this.K & (1 << i))));
    };
    for (let i = 0; i < this.n; i++) {
      const b = document.createElement("button");
      b.className = "fbtn"; b.textContent = "k" + i;
      b.addEventListener("click", () => { this.K ^= (1 << i); showK(); });
      kRow.appendChild(b); kBits.push(b);
    }
    showK();
    kWrap.append(kLab, kRow);
    ctrlEl.appendChild(kWrap);
    ctrlEl.appendChild(makeButtons(
      [["twist", "TWIST K (A△K)"], ["comp", "COMPLEMENT"], ["reset", "RESET"]],
      () => "",
      v => {
        if (v === "twist") this.applyTwist();
        else if (v === "comp") this.complement();
        else this.init();
      }));
    ctrlEl.appendChild(makeButtons(
      [[true, "WALK: ON"], [false, "WALK: OFF"]],
      () => this.walking,
      v => { this.walking = v; }));
    ctrlEl.appendChild(makeSlider("WALK RATE /S", 1, 60, 1,
      () => this.rate, v => { this.rate = v; },
      v => String(v)));
  },

  viewMode() { return this.n <= 5 ? "hasse" : "bars"; },

  frame(dt, t) {
    if (this.walking) {
      this.acc += dt * this.rate;
      while (this.acc >= 1) {
        this.acc -= 1;
        this.flip(Math.floor(Math.random() * this.n)); // Ehrenfest: pick a flea, move it
        this.recompute();
        this.walkRank.push(this.rank);
        if (this.walkRank.length > 2000) this.walkRank.shift();
      }
    }
    this.recompute();
    this.railAcc += dt;
    if (this.railAcc > 0.12) { this.railAcc = 0; this.hist.push(this.rank); if (this.hist.length > 220) this.hist.shift(); }

    ctx.fillStyle = "#0a1a24"; ctx.fillRect(0, 0, W, H);
    if (this.viewMode() === "hasse") this.drawHasse(dt);
    else this.drawBars(dt);
  },

  nodeXY(mask, layout) { // ranked embedding: y by rank, x spread within the rank row
    const r = popcount(mask);
    const row = layout.rows[r];
    const idx = row.index.get(mask);
    const x = row.x0 + (idx + 1) * row.dx;
    const y = row.y;
    return [x, y];
  },
  buildLayout() {
    const n = this.n, top = H * 0.10, bot = H * 0.80;
    const rows = [];
    for (let r = 0; r <= n; r++) {
      const count = binom(n, r);
      const y = n === 0 ? (top + bot) / 2 : lerp(top, bot, r / n);
      const margin = Math.max(60, W * 0.08);
      rows.push({ y, count, index: new Map(),
        x0: margin, dx: (W - 2 * margin) / (count + 1) });
    }
    for (let m = 0; m < (1 << n); m++) rows[popcount(m)].index.set(m, rows[popcount(m)].index.size);
    return { rows };
  },
  drawHasse(dt) {
    const n = this.n;
    const layout = this.buildLayout();
    const mid = n >> 1;
    // the Sperner antichain: widest rank banded distinctly — the magic-window analog
    ctx.fillStyle = "rgba(247,160,38,.07)";
    ctx.fillRect(0, layout.rows[mid].y - 26, W, 52);
    ctx.fillStyle = "rgba(247,160,38,.55)"; ctx.font = "8px ui-monospace, monospace";
    ctx.fillText("SPERNER ANTICHAIN — WIDEST RANK C(n,⌊n/2⌋)=" + this.sperner, 8, layout.rows[mid].y - 30);

    // cover edges (differ by one bit) — the cube, ranked
    ctx.strokeStyle = "rgba(70,224,192,.16)"; ctx.lineWidth = 1;
    for (let m = 0; m < (1 << n); m++) {
      for (let i = 0; i < n; i++) {
        if (m & (1 << i)) continue;
        const u = this.nodeXY(m, layout), v = this.nodeXY(m | (1 << i), layout);
        ctx.beginPath(); ctx.moveTo(u[0], u[1]); ctx.lineTo(v[0], v[1]); ctx.stroke();
      }
    }
    // walk trail: recent path through the lattice
    if (this.trail.length > 1) {
      ctx.strokeStyle = "rgba(247,160,38,.28)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < this.trail.length; i++) {
        const p = this.nodeXY(this.trail[i], layout);
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
      }
      ctx.stroke();
    }
    // vertices
    const dot = n <= 4 ? 9 : 7;
    ctx.font = "7px ui-monospace, monospace";
    for (let m = 0; m < (1 << n); m++) {
      const [x, y] = this.nodeXY(m, layout);
      const r = popcount(m);
      const onMid = r === mid;
      ctx.fillStyle = onMid ? "rgba(247,160,38,.50)" : "rgba(70,224,192,.42)";
      ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot);
      ctx.fillStyle = "rgba(237,228,211,.40)";
      ctx.fillText(m.toString(2).padStart(n, "0"), x - n * 2.1, y + dot / 2 + 8);
    }
    // the twist pair, rendered distinctly: current vertex + its τ_K image
    const pA = this.nodeXY(this.A, layout);
    const pT = this.nodeXY(this.A ^ this.K, layout);
    ctx.strokeStyle = "rgba(247,160,38,.85)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(pA[0], pA[1], 10, 0, TAU); ctx.stroke();
    ctx.fillStyle = "#f7a026";
    ctx.beginPath(); ctx.arc(pA[0], pA[1], 4, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(70,224,192,.85)";
    ctx.beginPath(); ctx.arc(pT[0], pT[1], 8, 0, TAU); ctx.stroke();
    ctx.fillStyle = "#46e0c0";
    ctx.fillRect(pT[0] - 3, pT[1] - 3, 6, 6);
    ctx.fillStyle = "rgba(237,228,211,.75)"; ctx.font = "8px ui-monospace, monospace";
    ctx.fillText("A=" + this.A.toString(2).padStart(n, "0"), pA[0] + 13, pA[1] - 8);
    ctx.fillText("A△K=" + (this.A ^ this.K).toString(2).padStart(n, "0"), pT[0] + 11, pT[1] + 14);
    ctx.fillStyle = "#73909c";
    ctx.fillText("LEDGER S = 1 − |A∩K|/|K| = " + this.S.toFixed(3), 8, H * 0.94);
    ctx.fillText("DISPLACEMENT |A△K|−|A| = " + (this.displacement >= 0 ? "+" : "") + this.displacement, 8, H * 0.94 + 12);

    if (this.flash) {
      this.flash.life -= dt * 2.2;
      if (this.flash.life <= 0) this.flash = null;
      else {
        ctx.strokeStyle = `rgba(247,160,38,${this.flash.life * 0.9})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(pA[0], pA[1], 8 + (1 - this.flash.life) * 26, 0, TAU); ctx.stroke();
      }
    }
  },
  drawBars(dt) {
    const n = this.n;
    const vals = [];
    for (let r = 0; r <= n; r++) vals.push(binom(n, r));
    const max = vals[this.n >> 1];
    const base = H * 0.82, top = H * 0.14;
    const bw = Math.min(60, (W * 0.7) / (n + 1));
    const ox = (W - bw * (n + 1)) / 2;
    const mid = n >> 1;
    ctx.font = "8px ui-monospace, monospace";
    for (let r = 0; r <= n; r++) {
      const h = lerp(6, H * 0.62, vals[r] / max);
      const x = ox + r * bw, y = base - h;
      const isCur = r === this.rank, isTw = r === this.twistRank, isMid = r === mid;
      ctx.fillStyle = isMid ? "rgba(247,160,38,.40)" : "rgba(70,224,192,.30)";
      if (isCur) ctx.fillStyle = "rgba(247,160,38,.85)";
      ctx.fillRect(x + 3, y, bw - 6, h);
      if (isTw) {
        ctx.strokeStyle = "rgba(70,224,192,.9)"; ctx.lineWidth = 1.4;
        ctx.strokeRect(x + 3, y, bw - 6, h);
      }
      ctx.fillStyle = "rgba(237,228,211,.65)";
      ctx.fillText("C(" + n + "," + r + ")=" + vals[r], x, base + 12);
      ctx.fillStyle = isMid ? "#f7a026" : "#73909c";
      ctx.fillText("r=" + r, x, y - 4);
    }
    // the current vertex and its twist image as ranked markers
    const mark = (r, color) => {
      const x = ox + r * bw + bw / 2;
      ctx.strokeStyle = color; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x - 10, base + 22); ctx.lineTo(x + 10, base + 22); ctx.stroke();
    };
    mark(this.rank, "#f7a026"); mark(this.twistRank, "#46e0c0");
    ctx.fillStyle = "rgba(237,228,211,.75)";
    ctx.fillText("A: rank " + this.rank + (this.rank === this.twistRank ? "  (A = A△K — K absorbed)" : ""), ox, base + 36);
    ctx.fillStyle = "#73909c";
    ctx.fillText("SPERNER WIDTH C(n,⌊n/2⌋)=" + this.sperner + "  ·  n≥6: ranked bars (" + (1 << n) + " vertices too dense for Hasse)", ox, H * 0.08);
  },

  chart() {
    const w = chartCv.clientWidth, h = 72;
    chartAxes("RANK |A| — EHRENFEST CONVERGENCE");
    if (this.hist.length >= 2) {
      chartCtx.beginPath();
      for (let i = 0; i < this.hist.length; i++) {
        const x = i / 219 * w, y = h - 6 - this.hist[i] / this.n * (h - 18);
        i ? chartCtx.lineTo(x, y) : chartCtx.moveTo(x, y);
      }
      chartCtx.strokeStyle = "rgba(70,224,192,.85)"; chartCtx.lineWidth = 1.2; chartCtx.stroke();
    }
    // theory: E[rank] = n/2 (Ehrenfest & Ehrenfest 1907); Var = n/4 → σ = √n/2
    const ey = h - 6 - (this.n / 2) / this.n * (h - 18);
    chartCtx.strokeStyle = "rgba(247,160,38,.55)"; chartCtx.setLineDash([3, 4]);
    chartCtx.beginPath(); chartCtx.moveTo(0, ey); chartCtx.lineTo(w, ey); chartCtx.stroke();
    const sd = Math.sqrt(this.n) / 2 / this.n * (h - 18);
    chartCtx.strokeStyle = "rgba(247,160,38,.22)";
    chartCtx.beginPath(); chartCtx.moveTo(0, ey - sd); chartCtx.lineTo(w, ey - sd); chartCtx.stroke();
    chartCtx.beginPath(); chartCtx.moveTo(0, ey + sd); chartCtx.lineTo(w, ey + sd); chartCtx.stroke();
    chartCtx.setLineDash([]);
  },

  metrics() {
    const rows = [
      ["N — SET SIZE", String(this.n), ""],
      ["A (bitstring)", this.A.toString(2).padStart(this.n, "0"), "hot"],
      ["RANK |A|", String(this.rank), "sig"],
      ["K / |K|", this.K.toString(2).padStart(this.n, "0") + " / " + this.k, ""],
      ["REGISTRY R = |A∩K|/|K|", this.R.toFixed(3), ""],
      ["LEDGER S = 1−R", this.S.toFixed(3), "sig"],
      ["|A△K| − |A| = |K|(2S−1)", (this.displacement >= 0 ? "+" : "") + this.displacement, ""],
      ["RANK COUNT C(n,|A|)", String(this.rankCount), ""],
      ["SPERNER WIDTH C(n,⌊n/2⌋)", String(this.sperner), this.atMiddle ? "hot" : ""],
      ["COMPLEMENT PAIRS 2^(n−1)", String(this.complementPairs), ""],
      ["LONGEST CHAIN (verts)", String(this.maxChain), ""],
      ["DEDEKIND M(n)", this.dedekind, ""]
    ];
    if (this.walkRank.length >= 20) {
      const m = this.walkRank.length;
      const mu = this.walkRank.reduce((a, x) => a + x, 0) / m;
      const va = this.walkRank.reduce((a, x) => a + (x - mu) * (x - mu), 0) / m;
      rows.push(["WALK μ (live / theory n/2)", mu.toFixed(2) + " / " + (this.n / 2).toFixed(2), ""]);
      rows.push(["WALK σ² (live / theory n/4)", va.toFixed(2) + " / " + (this.n / 4).toFixed(2), ""]);
    }
    return rows;
  }
};

/* ============================================================
   mode manager + boot
   ============================================================ */
const MODES = { twist, flock, chirp, quilt, perm, setl };
const state = { mode: "twist", t: 0 };

function setMode(name) {
  state.mode = name;
  document.querySelectorAll(".tab").forEach(b =>
    b.classList.toggle("active", b.dataset.mode === name));
  const M = MODES[name];
  titleEl.textContent = M.title;
  subEl.textContent = M.sub;
  doctrineEl.innerHTML = M.doctrine;
  ctrlEl.innerHTML = "";
  M.init();
  M.controls();
  try { history.replaceState(null, "", "?mode=" + name); } catch (e) {}
}
document.querySelectorAll(".tab").forEach(b =>
  b.addEventListener("click", () => setMode(b.dataset.mode)));

let last = performance.now(), railAcc = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  state.t += dt;
  const M = MODES[state.mode];
  M.frame(dt, state.t);
  railAcc += dt;
  if (railAcc > 0.14) { railAcc = 0; M.chart(); setMetrics(M.metrics()); }
  requestAnimationFrame(loop);
}

resize();
const q = new URLSearchParams(location.search).get("mode");
setMode(MODES[q] ? q : "twist");
requestAnimationFrame(loop);
