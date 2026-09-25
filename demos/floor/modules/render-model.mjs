// RenderModel — kernel subscription → scene graph → frame diffs.
//
// Headless and deterministic: every kernel event (Contract v5 L2 surface:
// bind/link/unlink/effect/apply/applyInverse/undo/unbind/load/tick) is
// folded into a retained scene, and drain() returns the per-frame delta
// since the last call. Same input events → same frames, on both
// substrates — the same law the floor is tested by, now for the VIEW
// layer. The canvas renderer (canvas-renderer.mjs) is a thin consumer of
// drain(); everything testable lives here.

export class RenderModel {
  constructor(kernel) {
    this.kernel = kernel;
    this.t = 0;
    this.nodes = new Map();  // name → {name, value, t, lastKind}
    this.edges = new Map();  // id → {from, to, type}
    this._pending = { added: [], changed: [], removed: [], edgeAdded: [], edgeRemoved: [] };
    this._unsub = kernel.subscribe((ev) => this._onEvent(ev));
    // late attach: a view born after the show started still sees the set
    for (const name of kernel.cells()) {
      this.nodes.set(name, { name, value: kernel.view(name), t: this.t, lastKind: 'bind' });
      this._stage('added', { name, value: kernel.view(name), t: this.t, kind: 'bind' });
    }
    for (const e of kernel.links()) {
      this.edges.set(e.id, { from: e.from, to: e.to, type: e.type });
      this._pending.edgeAdded.push({ from: e.from, to: e.to, type: e.type });
    }
  }

  _onEvent({ kind, cell, value, ts }) {
    this.t = ts;
    switch (kind) {
      case 'bind':
        this._upsert(cell, value, ts, kind);
        break;
      case 'unbind':
        if (this.nodes.delete(cell)) this._stage('removed', { name: cell, t: ts, kind });
        break;
      case 'load': {
        // bulk re-sync: kernel store was replaced wholesale. Upsert what
        // it now holds (bind events during load already staged the new
        // ones — don't duplicate), and remove what it no longer does.
        const alive = new Set(this.kernel.cells());
        for (const name of alive) {
          if (!this._pending.added.some(x => x.name === name)) {
            this._upsert(name, this.kernel.view(name), ts, kind);
          }
        }
        for (const name of [...this.nodes.keys()]) {
          if (!alive.has(name)) {
            this.nodes.delete(name);
            this._stage('removed', { name, t: ts, kind });
          }
        }
        break;
      }
      case 'link': {
        const e = { from: value.from, to: value.to, type: value.type };
        this.edges.set(value.id, e);
        this._pending.edgeAdded.push(e);
        break;
      }
      case 'unlink': {
        const e = this.edges.get(value.id);
        if (e && this.edges.delete(value.id)) this._pending.edgeRemoved.push({ ...e });
        break;
      }
      case 'apply':
      case 'applyInverse':
      case 'undo':
        // state change on a live cell: re-view and mark
        if (cell !== null && this.kernel.cells().includes(cell)) {
          this._upsert(cell, this.kernel.view(cell), ts, kind);
        }
        break;
      case 'effect':
        // op registration touches the cell but not its value; mark it alive
        if (cell !== null && this.nodes.has(cell)) {
          this._stage('changed', { name: cell, value: this.kernel.view(cell), t: ts, kind });
        }
        break;
      case 'tick':
        break; // t already updated
      default:
        break;
    }
  }

  _upsert(name, value, ts, kind) {
    this._stage(this.nodes.has(name) ? 'changed' : 'added',
                { name, value, t: ts, kind });
    this.nodes.set(name, { name, value, t: ts, lastKind: kind });
  }

  _stage(kind, entry) {
    const arr = this._pending[kind];
    const i = arr.findIndex(x => x.name === entry.name);
    if (i >= 0) arr[i] = entry; else arr.push(entry);
  }

  // Retained scene snapshot (fresh copies — aliasing is a bug).
  scene() {
    return {
      t: this.t,
      nodes: [...this.nodes.values()].map(n => ({ ...n, value: structuredClone(n.value) })),
      edges: [...this.edges.values()].map(e => ({ ...e })),
    };
  }

  // Frame diff since the last drain(). The unit the renderer consumes.
  drain() {
    const f = {
      t: this.t,
      added: this._pending.added.map(x => ({ ...x, value: structuredClone(x.value) })),
      changed: this._pending.changed.map(x => ({ ...x, value: structuredClone(x.value) })),
      removed: this._pending.removed.map(x => ({ ...x })),
      edgeAdded: this._pending.edgeAdded.map(x => ({ ...x })),
      edgeRemoved: this._pending.edgeRemoved.map(x => ({ ...x })),
    };
    this._pending = { added: [], changed: [], removed: [], edgeAdded: [], edgeRemoved: [] };
    return f;
  }

  dispose() { this._unsub(); }
}
