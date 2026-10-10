/**
 * Missing frame: five slots in a film rack, four frames standing in them, and
 * the fourth slot holds none. At rest the frames beside it sag into the gap,
 * and the empty slot, with the outline of the frame it lost, is the one bright
 * mark. The pointer picks a slot: a frame there lifts
 * out of it, and its neighbours lean away, the farther the less, staggered
 * outwards from it. Over the empty slot the neighbours part and nothing rises.
 * The slider is how far the neighbours lean, in degrees.
 *
 * The pattern: discrete items, as Riffle. Tweens, a stagger by distance, and a
 * hit test on each slot's rest centre, so a frame lifting cannot flip the choice.
 */
const {
  Cam, clamp, facing, fit, poly, prism, proj, rad, ringAt, rings, rrect,
  tdone, tset, tval, tween, disposer, mk, pointer, put, reflect, register, solid,
} = HL;

const N = 5, GAP = 3, W = 46, H = 40, SP = 6, TK = 1.4, SH = 6, LIFT = 14, SAG = 9;
const L = N * W + (N - 1) * SP, X0 = -9, X1 = L + 9, Y0 = -9, Y1 = 8, STEP = 45;
const xs = Array.from({ length: N }, (_, i) => i * (W + SP));

/** The share of the lean at d slots from the chosen one: 1, then half, then a quarter. */
const fall = (d) => (d <= 1 ? 1 : d === 2 ? 0.5 : 0.25);

/** A frame's outline, its picture window and its eight perforations, in its own (u, v) plane. */
const ring2 = (u0, v0, u1, v1, r) => rrect(u0, v0, u1, v1, r, 4).map((q) => [q.u, q.v]);
const OUTLINE = ring2(0, 0, W, H, 2.6);
const WINDOW = ring2(3.5, 7.5, W - 3.5, H - 7.5, 1.6);
const PERFS = [];
for (const v of [3.7, H - 3.7]) for (let j = 0; j < 4; j++) {
  const u = (W / 8) * (2 * j + 1);
  PERFS.push(ring2(u - 2.4, v - 1.5, u + 2.4, v + 1.5, 1));
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let part = value, act = -1;

  // Fitted to the most extreme poses: a frame lifted, the end frames leaning out at full reach.
  const C = Cam(45, 0.5, 1.5);
  const top = SH + H + LIFT;
  fit(C, [[X0, Y0, 0], [X1, Y1, -10], [X1, Y0, 0], [X0, Y1, 0], [-10, 0, top], [L + 10, 0, top], [0, 0, top]], 200, 166);
  const P = proj(C), front = facing(C);

  /** Frame i's point (u, v), leaning th degrees (positive tips its top towards +x) on its bottom corner, lifted by z, at depth y. */
  const at = (i, th, z, y) => {
    const up = th >= 0 ? W : 0, s = Math.sin(rad(th)), c = Math.cos(rad(th));
    return (u, v) => P(xs[i] + up + (u - up) * c + v * s, y, SH + z - (u - up) * s + v * c);
  };
  const path = (pts, w) => poly(pts.map(([u, v]) => w(u, v)));

  const g = mk("g", {}, svg);
  const [sr, si] = rings(X0, Y0, X1, Y1, 5, 1.4);
  reflect(svg, g, P, front, sr, 0, 12);
  put(solid(g), prism(P, front, sr, si, 0, SH));

  // The slots, cut in the rack's top; the empty one is the mark at rest.
  const slots = xs.map((x, i) => mk("path", {
    d: poly(ringAt(P, rrect(x - 1, -TK - 1.3, x + W + 1, 1.3, 1.3, 4), SH)),
    class: i === GAP ? "nf hi" : "nf lo",
  }, g));
  // Where the missing frame would stand: a guide, painted before the frames beside it.
  const ghost = mk("path", { d: path(OUTLINE, at(GAP, 0, 0, 0)), class: "nf dash hi" }, g);

  const rest = (i) => (i === GAP ? 0 : -Math.sign(i - GAP) * SAG * fall(Math.abs(i - GAP)));
  const frames = [];
  for (let i = 0; i < N; i++) {
    if (i === GAP) { frames.push(null); continue; }
    const grp = mk("g", {}, g);
    frames.push({
      back: mk("path", { class: "lo" }, grp), face: mk("path", { class: "sil" }, grp),
      win: mk("path", { class: "nf" }, grp), perf: mk("path", { class: "nf lo" }, grp),
      a: tween(rest(i)), z: tween(0), last: "",
    });
  }

  function draw(i, th, z) {
    const f = frames[i], key = th.toFixed(3) + "," + z.toFixed(3);
    if (key === f.last) return;
    f.last = key;
    const w = at(i, th, z, 0);
    f.back.setAttribute("d", path(OUTLINE, at(i, th, z, -TK)));
    f.face.setAttribute("d", path(OUTLINE, w));
    f.win.setAttribute("d", path(WINDOW, w));
    f.perf.setAttribute("d", PERFS.map((p) => path(p, w)).join(""));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    frames.forEach((f, i) => {
      if (!f) return;
      draw(i, tval(f.a, now), tval(f.z, now));
      if (!tdone(f.a, now) || !tdone(f.z, now)) moving = true;
    });
    return moving;
  });
  bag.add(B.unregister);

  // Hit test: each slot's centre in the rest pose, upright and unlifted. It never moves.
  const centres = xs.map((_, i) => at(i, 0, 0, 0)(W / 2, H / 2));
  const half = (centres[1][0] - centres[0][0]) / 2;
  function hit([x, y]) {
    let best = -1, bd = Infinity;
    centres.forEach((c, i) => { const d = Math.abs(x - c[0]); if (d < bd) { bd = d; best = i; } });
    if (bd > half + 4) return -1;
    const dy = y - centres[best][1];
    return dy < -58 || dy > 40 ? -1 : best;
  }

  /** Chooses slot a (-1 lets go): a frame there lifts, the rest lean away from it, staggered outwards. */
  function apply(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    frames.forEach((f, i) => {
      if (!f) return;
      const d = Math.abs(i - from), delay = force ? 0 : d * STEP;
      const th = a < 0 ? rest(i) : i === a ? 0 : Math.sign(i - a) * part * fall(Math.abs(i - a));
      tset(f.a, th, now, delay);
      tset(f.z, i === a ? LIFT : 0, now, delay);
      f.face.classList.toggle("hi", i === a);
      f.win.classList.toggle("hi", i === a);
    });
    slots[GAP].classList.toggle("hi", a < 0 || a === GAP);
    ghost.classList.toggle("hi", a < 0 || a === GAP);
    read.textContent = a < 0 ? "rest" : "frame " + (a + 1) + " · " + (a === GAP ? 0 : 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => apply(hit(p)), leave: () => apply(-1) }));
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";

  return {
    set: (v) => { part = clamp(v, 0, 16); if (act >= 0) apply(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "missing-frame",
  means: "Film frames in a rack, one slot empty where a frame never rendered; the pointer lifts a frame, and its neighbours lean away.",
  rules: [1, 2, 5, 10],
  range: [4, 8, 14],
  tour: [[146, 110], [255, 164], null],
  mount,
});
