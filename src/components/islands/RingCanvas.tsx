import { useEffect, useRef } from "react";

/**
 * ISLAND JUSTIFICATION
 *
 * What needs it: a `<canvas>` has to be sized to the device pixel ratio and
 * driven by `requestAnimationFrame` from the client. There is no Astro-only
 * equivalent — Astro renders HTML, and this is per-frame drawing against a 2D
 * context that only exists in the browser.
 *
 * Why React rather than a bare script: the component owns a real lifecycle —
 * an animation frame, a resize listener, a visibility listener and a media
 * query listener, all of which must be torn down together. `useEffect`'s
 * cleanup is that contract written down. A loose script would leak the rAF on
 * navigation.
 *
 * Loaded `client:idle`. The page is complete and correct without it.
 *
 * ---------------------------------------------------------------------------
 * What it draws: slow concentric rings expanding from a few fixed anchors. Same
 * "connected community" idea as the reference site's particle constellation,
 * matched to the name, visually distinct.
 *
 * Every one of the reference implementation's documented faults is answered
 * here (teardown §6):
 *
 *   - `prefers-reduced-motion` renders one static frame and never starts a loop
 *   - `visibilitychange` cancels the frame when the tab is hidden
 *   - devicePixelRatio capped at 2
 *   - a hard cap on live rings, allocated once and recycled
 *   - every listener registered `{ passive: true }`
 *   - no cursor interaction at all, which deletes the O(n²) proximity loop and
 *     the per-frame attraction math outright
 */

const MAX_RINGS = 24;
const RING_LIFE_MS = 9000;
const EMIT_MIN_MS = 2600;
const EMIT_MAX_MS = 4000;
const PEAK_ALPHA = 0.1;
/** --color-ink #0f3b3c. The one place a brand value is repeated, because a
 *  canvas context takes a colour string and cannot read a CSS custom property
 *  without a getComputedStyle call per frame. Read once, at setup. */
const FALLBACK_INK = "15, 59, 60";

interface Ring {
  x: number;
  y: number;
  birth: number;
  alive: boolean;
}

/** Deterministic, so the anchors do not jump between renders or reloads. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function RingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Read the brand colour from the cascade once, so the canvas re-skins with
    // the rest of the site when the three hexes change.
    const inkRaw = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-ink")
      .trim();
    const ink = parseHex(inkRaw) ?? FALLBACK_INK;

    let frame = 0;
    let width = 0;
    let height = 0;
    let maxRadius = 0;
    let anchors: { x: number; y: number; next: number }[] = [];
    const rings: Ring[] = Array.from({ length: MAX_RINGS }, () => ({
      x: 0,
      y: 0,
      birth: 0,
      alive: false,
    }));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      maxRadius = Math.min(width, height) * 0.42;

      // Three anchors on a narrow viewport, five on a wide one. Positions come
      // from a fixed seed, so they are stable across reloads and resizes.
      const rand = mulberry32(0x48432026);
      const count = width < 768 ? 3 : 5;
      anchors = Array.from({ length: count }, (_, i) => ({
        x: (0.12 + rand() * 0.76) * width,
        y: (0.1 + rand() * 0.8) * height,
        // Stagger the first emission so they do not all fire on frame one.
        next: i * 900,
      }));
    }

    function drawRing(x: number, y: number, radius: number, alpha: number) {
      if (alpha <= 0 || radius <= 0) return;
      ctx!.beginPath();
      ctx!.arc(x, y, radius, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${ink}, ${alpha})`;
      ctx!.lineWidth = 1;
      ctx!.stroke();
    }

    /** One frame of evenly spaced rings, for the reduced-motion case. */
    function drawStatic() {
      ctx!.clearRect(0, 0, width, height);
      for (const a of anchors) {
        for (let i = 1; i <= 3; i++) {
          const progress = i / 4;
          drawRing(a.x, a.y, maxRadius * progress, PEAK_ALPHA * (1 - progress));
        }
      }
    }

    function tick(now: number) {
      ctx!.clearRect(0, 0, width, height);

      for (const a of anchors) {
        if (now >= a.next) {
          const free = rings.find((r) => !r.alive);
          if (free) {
            free.x = a.x;
            free.y = a.y;
            free.birth = now;
            free.alive = true;
          }
          a.next = now + EMIT_MIN_MS + Math.random() * (EMIT_MAX_MS - EMIT_MIN_MS);
        }
      }

      for (const r of rings) {
        if (!r.alive) continue;
        const progress = (now - r.birth) / RING_LIFE_MS;
        if (progress >= 1) {
          r.alive = false;
          continue;
        }
        drawRing(r.x, r.y, maxRadius * progress, PEAK_ALPHA * (1 - progress));
      }

      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    }

    function apply() {
      stop();
      layout();
      if (reduced.matches) drawStatic();
      else start();
    }

    // Debounced, because a drag-resize fires this continuously and each call
    // reallocates the backing store.
    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(apply, 150);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!reduced.matches) start();
    }

    apply();
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility, { passive: true });
    reduced.addEventListener("change", apply, { passive: true });

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", apply);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}

/** `#0f3b3c` -> `"15, 59, 60"`. Returns null on anything unexpected. */
function parseHex(value: string): string | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(value);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
