// Live view of the Penrose floor: penfield orbits + twist registrations,
// served straight off this file tree (paths are relative).
//   cd packages/quilt-view && python3 -m http.server 8807
//   → http://localhost:8807/examples/penfield-view.html
import { QuiltKernel } from './modules/reference-kernel.mjs';
import { Multigrid } from './modules/multigrid.mjs';
import { PenField } from './modules/penfield.mjs';
import { twistFieldFrom } from './modules/twistfield.mjs';
import { RenderModel } from './modules/render-model.mjs';
import { CanvasRenderer } from './modules/canvas-renderer.mjs';

const kernel = new QuiltKernel();
const mg = new Multigrid({ N: 5, gamma: [0.1, 0.7, 0.3, 0.9, 0.4], reach: 8 });
const field = new PenField(kernel, mg);

// the twist instrument's evidence, live in the same scene
const tf = twistFieldFrom(mg, 2.1);
kernel.bind('twist.curve', tf.curve(0, 6, 0.5),
  { what: 'twist registrations on the floor — twistfield.mjs' });

const model = new RenderModel(kernel);
const canvas = document.getElementById('view');
const renderer = new CanvasRenderer(model, canvas);

// draw the Penrose vertex lattice as the stage floor
const stage = document.getElementById('stage');
const sctx = stage.getContext('2d');
function drawStage() {
  const W = stage.width, H = stage.height;
  sctx.fillStyle = '#08141d';
  sctx.fillRect(0, 0, W, H);
  sctx.fillStyle = 'rgba(70,224,192,.10)';
  for (const v of field.vertices()) {
    sctx.fillRect(W / 2 + v.x * W * 0.22, H / 2 + v.y * W * 0.22, 2, 2);
  }
}
drawStage();

renderer.start();
setInterval(() => { field.step(); drawStage(); }, 100);

// re-run the twist sweep live: registration re-measured in-scene
let th = 0;
setInterval(() => {
  th = (th + 0.25) % 6;
  kernel.bind('twist.live', { theta: th, R: tf.registration(th) });
}, 400);
