import { sdBox2d, sdRoundedBox2d } from '@typegpu/sdf';
import { common, d, std, tgpu } from 'typegpu';

/**
 * A field of binary digits, drawn in the style of the logo's 0s and 1s.
 * Bits flip at their own pace, a scanline sweeps across the grid and the
 * cells near the pointer light up in the accent colors.
 */

const Params = d.struct({
  resolution: d.vec2f,
  pointer: d.vec2f,
  time: d.f32,
  cellSize: d.f32,
  pointerStrength: d.f32,
  dark: d.f32,
});

const hash = (p: d.v2f) => {
  'use gpu';
  const q = std.fract(p * d.vec2f(0.1031, 0.103));
  const r = q + std.dot(q, q.yx + 33.33);
  return std.fract((r.x + r.y) * r.x);
};

/** A "0" as it appears in the logo: a rounded-rectangle ring. */
const sdZero = (p: d.v2f) => {
  'use gpu';
  return std.abs(sdRoundedBox2d(p, d.vec2f(0.215, 0.215), 0.09)) - 0.055;
};

/** A "1" as it appears in the logo: a vertical bar with a slanted flag. */
const sdOne = (p: d.v2f) => {
  'use gpu';
  const bar = sdBox2d(p - d.vec2f(0.145, 0), d.vec2f(0.055, 0.27));
  let flagP = p - d.vec2f(-0.055, -0.2);
  flagP = d.vec2f(flagP.x, flagP.y + flagP.x * 0.22);
  const flag = sdBox2d(flagP, d.vec2f(0.145, 0.05));
  return std.min(bar, flag);
};

const fill = (dist: number) => {
  'use gpu';
  const aa = std.max(std.fwidth(dist), 0.0001);
  return std.saturate(0.5 - dist / aa);
};

export async function startBitField(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) {
    return undefined;
  }

  const root = await tgpu.init();
  const context = root.configureContext({ canvas, alphaMode: 'premultiplied' });
  const format = navigator.gpu.getPreferredCanvasFormat();

  const params = root.createUniform(Params);

  const fragment = tgpu.fragmentFn({
    in: { pos: d.builtin.position },
    out: d.vec4f,
  })(({ pos }) => {
    'use gpu';
    const p = params.$;
    const px = pos.xy;
    const cell = std.floor(px / p.cellSize);
    const local = px / p.cellSize - cell - 0.5;
    const center = (cell + 0.5) * p.cellSize;

    // Every cell flips its bit at its own pace
    const seed = hash(cell);
    const phase = p.time * (0.08 + 0.35 * hash(cell + 17.3)) + seed * 13;
    const epoch = std.floor(phase);
    const isOne = hash(cell + d.vec2f(epoch * 7.13, epoch * 3.71)) > 0.5;
    const flash = std.exp(-std.fract(phase) * 6);

    // A diagonal scanline sweeping across the field
    const diag = (center.x * 0.85 + center.y * 0.5) / std.max(p.resolution.x, 1);
    const head = std.fract(p.time * 0.06) * 1.9 - 0.4;
    const scan = std.exp(-std.pow((diag - head) * 9, 2));
    const trail = std.select(0, std.exp((diag - head) * 5), diag < head) * 0.35;

    // The pointer lights up its neighbourhood
    const toPointer = (center - p.pointer) / p.cellSize;
    const near = std.exp(-std.dot(toPointer, toPointer) / 9) * p.pointerStrength;

    const energy = std.saturate(scan + trail + near + flash * 0.25 * seed);

    let dist = sdZero(local);
    if (isOne) {
      dist = sdOne(local);
    }
    const glyph = fill(dist);
    const cellBox = fill(sdBox2d(local, d.vec2f(0.47)));

    // Neutral blue-gray at rest, cyan to blue when energized
    const t = std.saturate(px.x / std.max(p.resolution.x, 1));
    const restDark = d.vec3f(0.42, 0.48, 0.58);
    const restLight = d.vec3f(0.36, 0.42, 0.52);
    const cyanDark = d.vec3f(0.18, 0.86, 0.96);
    const blueDark = d.vec3f(0.3, 0.48, 1);
    const cyanLight = d.vec3f(0.02, 0.6, 0.76);
    const blueLight = d.vec3f(0.14, 0.36, 0.92);
    const rest = std.mix(restLight, restDark, p.dark);
    const accent = std.mix(
      std.mix(cyanLight, blueLight, t),
      std.mix(cyanDark, blueDark, t),
      p.dark,
    );

    const glyphColor = std.mix(rest, accent, std.smoothstep(0.05, 0.6, energy));
    const glyphAlpha = glyph * std.mix(0.16, 1, energy);
    const boxAlpha = cellBox * energy * energy * 0.14;

    // Premultiplied "over": glyph on top of the highlighted cell
    const rgb = glyphColor * glyphAlpha + accent * boxAlpha * (1 - glyphAlpha);
    const alpha = glyphAlpha + boxAlpha * (1 - glyphAlpha);
    return d.vec4f(rgb, alpha);
  });

  const pipeline = root.createRenderPipeline({
    vertex: common.fullScreenTriangle,
    fragment,
    targets: { format },
  });

  const state = {
    time: 0,
    pointer: d.vec2f(-1e4, -1e4),
    pointerStrength: 0,
    targetStrength: 0,
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDark = () => document.documentElement.dataset.theme !== 'light';
  const cellSizeCss = () => (window.innerWidth < 800 ? 26 : 34);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  }

  function draw() {
    const dpr = canvas.width / Math.max(canvas.clientWidth, 1);
    params.write({
      resolution: d.vec2f(canvas.width, canvas.height),
      pointer: state.pointer,
      time: state.time,
      cellSize: cellSizeCss() * dpr,
      pointerStrength: state.pointerStrength,
      dark: isDark() ? 1 : 0,
    });
    pipeline.withColorAttachment({ view: context }).draw(3);
  }

  function onPointerMove(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / Math.max(rect.width, 1);
    state.pointer = d.vec2f((event.clientX - rect.left) * dpr, (event.clientY - rect.top) * dpr);
    state.targetStrength = 1;
    if (reducedMotion.matches) {
      state.pointerStrength = 1;
      draw();
    }
  }

  function onPointerLeave() {
    state.targetStrength = 0;
    if (reducedMotion.matches) {
      state.pointerStrength = 0;
      draw();
    }
  }

  let visible = true;
  let frame = 0;
  let last = performance.now();

  function loop(now: number) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    state.time += dt;
    state.pointerStrength += (state.targetStrength - state.pointerStrength) * Math.min(dt * 6, 1);
    draw();
    schedule();
  }

  function schedule() {
    if (frame || !visible || document.hidden || reducedMotion.matches) {
      return;
    }
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }

  function refresh() {
    resize();
    draw();
    schedule();
  }

  const resizeObserver = new ResizeObserver(refresh);
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    schedule();
  });
  intersectionObserver.observe(canvas);

  const themeObserver = new MutationObserver(() => draw());
  themeObserver.observe(document.documentElement, { attributeFilter: ['data-theme'] });

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', refresh);

  // Start a few seconds in, so the first frame already has some flipped bits
  state.time = 4;
  refresh();

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    themeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', schedule);
    reducedMotion.removeEventListener('change', refresh);
    root.destroy();
  };
}
