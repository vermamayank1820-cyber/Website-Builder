"use client";

import { useEffect, useRef } from "react";

/* Deterministic helpers — seeded so the composition is reproducible. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
/* Cheap value noise in [0,1]. */
function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const tl = hash2(xi, yi);
  const tr = hash2(xi + 1, yi);
  const bl = hash2(xi, yi + 1);
  const br = hash2(xi + 1, yi + 1);
  const u = smooth(xf);
  const v = smooth(yf);
  return (tl * (1 - u) + tr * u) * (1 - v) + (bl * (1 - u) + br * u) * v;
}

interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  life: number;
  max: number;
}

const PARTICLES = 460;
const NOISE_SCALE = 0.0014;
const STEP = 1.5;
const BLUE = "rgba(31, 68, 224, 0.13)";
const WASH = "rgba(230, 230, 224, 0.012)"; /* slow fade so ink accumulates */
const TURN = Math.PI * 2.1; /* lower → smoother, more laminar streamlines */

/**
 * Pen-plotter flow field: particles advect along a value-noise field and
 * leave thin blue trails that slowly accumulate, like ink drawn by a
 * machine. Pointer adds a gentle swirl. Off-screen → paused. Reduced
 * motion → one static seeded frame, no loop.
 */
export function GenerativeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const context = el.getContext("2d");
    if (!context) return;
    return run(el, context);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}

/** All field logic, with non-null canvas/ctx so the closures type cleanly. */
function run(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32(20240617);

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let running = false;
    let tField = rand() * 1000;

    function spawn(p: Particle) {
      p.x = rand() * w;
      p.y = rand() * h;
      p.px = p.x;
      p.py = p.y;
      p.max = 150 + rand() * 260;
      p.life = 0;
    }

    function init() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#e6e6e0";
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      particles = Array.from({ length: PARTICLES }, () => {
        const p: Particle = { x: 0, y: 0, px: 0, py: 0, life: 0, max: 0 };
        spawn(p);
        return p;
      });
    }

    function fieldAngle(x: number, y: number) {
      let a = noise(x * NOISE_SCALE, y * NOISE_SCALE + tField * 0.06) * TURN;
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240) {
          const f = 1 - Math.sqrt(d2) / 240;
          a += Math.atan2(dy, dx) * f * 1.6;
        }
      }
      return a;
    }

    function drawStep() {
      // faint paper wash so old ink slowly fades and the field evolves
      ctx.fillStyle = WASH;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = BLUE;
      ctx.beginPath();
      for (const p of particles) {
        const a = fieldAngle(p.x, p.y);
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * STEP;
        p.y += Math.sin(a) * STEP;
        p.life++;
        if (p.life > p.max || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          spawn(p);
          continue;
        }
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      tField += 1;
    }

    function loop() {
      drawStep();
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      loop();
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    init();
    if (reduced) {
      // render a single dense static composition
      for (let i = 0; i < 320; i++) drawStep();
    } else {
      for (let i = 0; i < 150; i++) drawStep(); // warm start so it opens drawn
      start();
    }

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0.05 }
    );
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(init, 200);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

  return () => {
    stop();
    io.disconnect();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", onResize);
  };
}
