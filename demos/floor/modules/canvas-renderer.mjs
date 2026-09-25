// CanvasRenderer — the thin browser skin over RenderModel.drain().
// Untested in node (no DOM); all semantics live in render-model.mjs.
// Aesthetic: the fleet's abyssal bioluminescence, same palette family as
// twist-engine — deep water background, teal nodes, amber links.

export const ABYSS = {
  bg: '#0a1a24',
  node: 'rgba(70,224,192,.85)',
  nodeDim: 'rgba(70,224,192,.28)',
  edge: 'rgba(247,160,38,.30)',
  edgeHot: 'rgba(247,160,38,.75)',
  label: 'rgba(190,225,235,.55)',
  changedFlashMs: 900,
};

export class CanvasRenderer {
  constructor(model, canvas, { theme = ABYSS, labelPrefix = null } = {}) {
    this.model = model;
    this.ctx = canvas.getContext('2d');
    this.theme = theme;
    this.labelPrefix = labelPrefix; // e.g. 'penfield.' — only draw this namespace
    this.layout = new Map();        // name → {x, y} (consumers may seed/override)
    this.hot = new Map();           // name → flash-until-ms
    this.running = false;
  }

  // Default layout: cells whose value is [x, y] or [[x,y],…] draw at their
  // coordinates; anything else arranges on a hash ring. Override `layout`.
  place(name, x, y) { this.layout.set(name, { x, y }); }

  _pos(name, value, W, H, i, n) {
    const p = this.layout.get(name);
    if (p) return p;
    if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number') {
      return { x: W / 2 + value[0] * W * 0.22, y: H / 2 + value[1] * W * 0.22 };
    }
    const a = (i / Math.max(1, n)) * Math.PI * 2 +
      ([...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 97) / 97;
    return { x: W / 2 + Math.cos(a) * W * 0.36, y: H / 2 + Math.sin(a) * W * 0.30 };
  }

  frame(now = performance.now()) {
    const { ctx, theme: T } = this;
    const W = ctx.canvas.width, H = ctx.canvas.height;
    const f = this.model.drain();

    for (const c of f.changed) this.hot.set(c.name, now + 900);
    for (const r of f.removed) { this.layout.delete(r.name); this.hot.delete(r.name); }
    for (const e of f.edgeAdded) this.hot.set(`→${e.from}›${e.to}`, now + 900);
    for (const e of f.edgeRemoved) this.hot.delete(`→${e.from}›${e.to}`);

    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);

    const scene = this.model.scene();
    const nodes = scene.nodes.filter(n => !this.labelPrefix || n.name.startsWith(this.labelPrefix));
    const byName = new Map(nodes.map(n => [n.name, n]));

    ctx.strokeStyle = T.edge;
    for (const e of scene.edges) {
      if (this.labelPrefix && !e.from.startsWith(this.labelPrefix)) continue;
      const a = byName.get(e.from), b = byName.get(e.to);
      if (!a || !b) continue;
      const pa = this._pos(a.name, a.value, W, H, 0, nodes.length);
      const pb = this._pos(b.name, b.value, W, H, 0, nodes.length);
      const hot = (this.hot.get(`→${e.from}›${e.to}`) ?? 0) > now;
      ctx.strokeStyle = hot ? T.edgeHot : T.edge;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }

    nodes.forEach((n, i) => {
      const p = this._pos(n.name, n.value, W, H, i, nodes.length);
      const hotUntil = this.hot.get(n.name) ?? 0;
      const hot = hotUntil > now;
      // an array-of-points cell (the penfield orbit) draws its swarm
      if (Array.isArray(n.value) && n.value.length &&
          Array.isArray(n.value[0]) && n.value[0]?.length === 2) {
        ctx.fillStyle = hot ? T.node : T.nodeDim;
        const r = Math.max(1.6, W * 0.004);
        for (const pt of n.value) {
          if (!pt) continue;
          ctx.fillRect(W / 2 + pt[0] * W * 0.22 - r / 2, H / 2 + pt[1] * W * 0.22 - r / 2, r, r);
        }
      } else {
        ctx.fillStyle = hot ? T.node : T.nodeDim;
        ctx.beginPath(); ctx.arc(p.x, p.y, hot ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = T.label;
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(n.name.split('.').pop(), p.x + 8, p.y + 3);
      }
    });

    ctx.fillStyle = T.label;
    ctx.font = '11px ui-monospace, monospace';
    ctx.fillText(`t=${this.model.t}  nodes=${nodes.length}  edges=${scene.edges.length}`, 10, 16);
    return f;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => { if (!this.running) return; this.frame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  stop() { this.running = false; }
}
