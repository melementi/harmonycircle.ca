# Harmony Circle — Design System

**Status:** proposed, Phase 0. Nothing in this document has been built yet.
**Reference:** [`docs/connectr-teardown.md`](./connectr-teardown.md) — forensic teardown of connectr.ca.
**Relationship to the reference:** we take its *grammar* (two type registers, numbered eyebrows, hairline-divided full-bleed sections, one repeated ornament, opacity-only colour derivation, CSS-only motion) and replace its *vocabulary* (palette, ornament, background). The two sites should read as siblings, not as one site reskinned.

---

## 1. Colour

### 1.1 The three brand values

Everything on the site derives from three hex codes. Re-skinning the site means editing these three lines and nothing else.

```css
@theme {
  --color-ink:    #0f3b3c;  /* deep teal   — text, dark surfaces */
  --color-accent: #b54d2c;  /* terracotta  — the single accent */
  --color-paper:  #f6f2ea;  /* warm bone   — the ground */
}
```

There is no fourth colour. Every other value in the UI is one of these three at an opacity step. Gradients are not a surface treatment; the only gradient permitted anywhere is the transparent-to-paper mask on the marquee edges.

### 1.2 Accent: the brief's value fails AA, here are the numbers

The brief specified `--color-accent: #c75b39` and instructed me to verify contrast and darken if it fails. It fails. Measured against `--color-paper: #f6f2ea` using the WCAG 2.x relative-luminance formula:

| Candidate | On paper | Paper on it | White on it | On ink |
|---|---|---|---|---|
| `#c75b39` (brief) | **3.77** ✗ | 3.77 ✗ | 4.21 ✗ | 2.91 ✗ |
| `#bf5334` | 4.18 ✗ | 4.18 ✗ | 4.66 ✓ | 2.63 ✗ |
| `#b8502f` | 4.45 ✗ | 4.45 ✗ | 4.97 ✓ | 2.47 ✗ |
| **`#b54d2c` (chosen)** | **4.63** ✓ | **4.63** ✓ | **5.17** ✓ | 2.37 ✗ |
| `#b04a2c` | 4.87 ✓ | 4.87 ✓ | 5.44 ✓ | 2.26 ✗ |

`#c75b39` clears 3:1 — so it is legal for display type at ≥24px and for non-text ornament — but it cannot carry body text, links, or 10px micro-labels. Shipping two accent hexes (bright for display, dark for text) would break the "three hex codes" rule and is the kind of quiet inconsistency that makes a system rot. **Decision: one accent, darkened to `#b54d2c`.** It is still unambiguously Anatolian terracotta, and it is legal everywhere on paper, including the 10px mono labels.

I also tested deriving the dark variant from the bright one (`color-mix` of `#c75b39` toward ink). 85% accent + 15% ink lands at 4.56:1 but produces `#ab5639`, a muddier brick than `#b54d2c`. Rejected.

**If you want `#c75b39` back**, say so and I will ship it with a hard rule that accent never touches text below 24px — but that costs us accent links and accent micro-labels, which are load-bearing in this design grammar.

### 1.3 Accent on ink: the one hard constraint

Accent on ink is 2.37:1. It fails both 4.5:1 (text) and 3:1 (large text and UI components). No opacity step fixes this — `text-accent/70` on ink blends *toward* ink and gets worse.

**Rule: on ink surfaces, accent is decorative only.** Anything that carries meaning on a dark section — text, second display line, active indicators, focus rings, icon strokes that convey state — uses paper at an opacity step. A `<Ring>` sitting inside a solid-ink button is `aria-hidden` ornament and may stay accent; a ring used as a status dot on ink may not.

If we later want an accent-coloured *word* on a dark section we need a fourth value (a lifted terracotta). That is a deliberate decision to make then, not a token to ship now unused — see §9 anti-pattern 6.

### 1.4 The opacity ramp, with measured floors

| Step | Rendered on paper | Contrast | Permitted use |
|---|---|---|---|
| `ink` | `#0f3b3c` | 10.99 | Headlines, primary text, solid dark surfaces |
| `ink/90` | `#264d4d` | 8.35 | — |
| `ink/80` | `#3d605f` | 6.19 | **Body copy default** |
| `ink/70` | `#547270` | 4.68 | **Floor for any text, including 10px labels** |
| `ink/60` | `#6b8482` | 3.58 | Large text ≥24px only; icon strokes; never body |
| `ink/50` | `#839793` | 2.76 | Decorative only |
| `ink/15` | — | — | Borders on paper (`border-ink/15`) |
| `ink/10` | — | — | Hairline section rules (`border-ink/10`) |

| Step | Rendered on ink | Contrast | Permitted use |
|---|---|---|---|
| `paper` | `#f6f2ea` | 10.99 | Headlines and body on dark sections |
| `paper/80` | `#c8cdc7` | 7.60 | Secondary text on dark |
| `paper/70` | `#b1bbb6` | 6.23 | **Floor for body text on ink** |
| `paper/60` | `#9aa9a4` | 5.02 | Metadata on dark |
| `paper/50` | `#839793` | 3.98 | Display type ≥24px only — this is the "second line" colour on dark sections |
| `paper/15` | — | — | Borders on ink |

Ink on paper and paper on ink are both 10.99:1 — comfortably AAA. The palette's only weak axis is accent, and §1.2–1.3 fence it.

### 1.5 shadcn token contract

Mapped so shadcn-style components drop in later without a translation layer. Single `:root` block. **No `.dark` block** — the reference site ships a dead one; we do not.

```css
:root {
  --background:          #f6f2ea;  --foreground:            #0f3b3c;
  --card:                #ffffff;  --card-foreground:       #0f3b3c;
  --popover:             #ffffff;  --popover-foreground:    #0f3b3c;
  --primary:             #0f3b3c;  --primary-foreground:    #f6f2ea;
  --secondary:           #ebe6da;  --secondary-foreground:  #0f3b3c;
  --muted:               #ebe6da;  --muted-foreground:      #547270;  /* = ink/70, 4.68:1 */
  --accent:              #b54d2c;  --accent-foreground:     #ffffff;  /* 5.17:1 */
  --destructive:         #a11d1d;  --destructive-foreground:#ffffff;
  --border:  color-mix(in srgb, var(--color-ink) 15%, transparent);
  --input:   color-mix(in srgb, var(--color-ink) 20%, transparent);
  --ring:    var(--color-accent);
  --radius:  0.5rem;
}
```

`--destructive` is the one value not derived from the three brand hexes. It is not a brand colour — it is a safety signal in the admin panel, and admin-only. It never appears on a public page. If that bothers you it can become `--color-ink` with an alert icon instead; say the word.

`--ring` is accent, which on paper is 4.63:1 against the ground — well over the 3:1 required for focus indicators (WCAG 2.1 SC 1.4.11). On ink surfaces the focus ring switches to paper (see §7).

---

## 2. Type

Two registers. Nothing else. If a piece of text is neither display nor micro-label, it is body — and body has exactly one treatment.

### 2.1 Fonts

Self-hosted via `@fontsource-variable/*`. No Google Fonts CDN, no `preconnect`, no render-blocking stylesheet, no FOUT gamble on a third-party origin.

| Role | Package | CSS family |
|---|---|---|
| Sans | `@fontsource-variable/inter` | `"Inter Variable"` |
| Mono | `@fontsource-variable/jetbrains-mono` | `"JetBrains Mono Variable"` |

Subset to `latin` + `latin-ext`. **`latin-ext` is not optional** — Turkish needs `ı İ ğ Ğ ş Ş ç Ç ö Ö ü Ü`, and the v2 Turkish site is a stated requirement. `font-display: swap`, both preloaded as `woff2`.

### 2.2 Display register

```
font-black uppercase tracking-tighter leading-[0.85]
```

One to three words, ending in a full stop. Second line in accent (on paper) or `paper/50` (on ink).

| Token | Clamp | Use |
|---|---|---|
| `display-1` | `clamp(2.75rem, 11vw, 7rem)` | Hero `h1`, one per page |
| `display-2` | `clamp(2rem, 6.5vw, 4.5rem)` | Section `h2` |
| `display-3` | `clamp(1.375rem, 3vw, 2rem)` | Card and sub-section `h3` |

`tracking-tighter` at `display-1` scale is doing real optical work; at `display-3` it reads as a mistake, so `display-3` uses `tracking-tight`.

Example, from the brief:

```
A CIRCLE OF
NEIGHBOURS.        ← accent
```

### 2.3 Micro-label register

```
font-mono uppercase text-[0.625rem] tracking-[0.25em]
```

10px, matching the reference. Colour floor is `ink/70` on paper, `paper/70` on ink — no `ink/50` labels. Uses:

- Section eyebrows, numbered: `(01) MISSION`, `(02) PROGRAMS`, `(03) PEOPLE`
- Button labels
- Counts and metadata: `12 PROGRAMS`, `EST. 2019`
- Table headers, form field labels, breadcrumbs

The number in the eyebrow is `accent`; the word is `ink/70`.

### 2.4 Body

```
text-base md:text-lg leading-relaxed text-ink/80
```

Measure capped at `max-w-[65ch]`. Links inside body copy are `text-accent underline underline-offset-4 decoration-ink/25 hover:decoration-accent` — underlined, because colour alone must not be the only distinguishing signal (WCAG 1.4.1).

`text-sm` exists for captions and dense admin tables only; it is `ink/70`, never lower.

---

## 3. Ornament — the Ring

ConnecTR's whole ornament language is a `rotate-45` red square. Ours is a **ring**: an outlined circle in accent. It matches the name, it is instantly distinguishable at a glance, and it slots into every place the reference site uses its diamond.

Built once as `<Ring />`, used everywhere. Never hand-rolled inline.

### 3.1 API

```ts
interface RingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // 8 / 12 / 16 / 24 / 40 px
  variant?: 'outline' | 'solid' | 'dual' | 'dotted';
  tone?: 'accent' | 'ink' | 'paper' | 'current';
  class?: string;
}
```

- `outline` — the default. Stroke scales with size: 1px at `xs`/`sm`, 1.5px at `md`, 2px at `lg`/`xl`.
- `solid` — filled disc. Used for the active state in pagination and nav.
- `dual` — a ring inside a ring, 40% inner radius. Section dividers and the accordion open marker.
- `dotted` — outline with a solid centre dot. List bullets.

Rendered as an inline SVG so the stroke stays crisp and `currentColor` works; `aria-hidden="true"` and `focusable="false"` by default. A `Ring` that carries meaning (an active-page indicator) takes an explicit label prop and drops `aria-hidden` — but the meaning is always *also* carried by `aria-current`, never by the ring alone.

### 3.2 Where it appears

| Place | Variant |
|---|---|
| List bullets | `dotted xs` |
| Button suffix | `outline sm`, animates to `solid` on hover |
| Accordion marker | `outline md` closed → `dual md` open (CSS rotate + inner scale, no icon swap) |
| Section divider | `dual lg` centred on the hairline rule |
| Nav active indicator | `solid xs` |
| Stat row separator | `outline xs` |
| Timeline / process steps | `outline xl` with the step number inside |

### 3.3 Buttons

Pill, `rounded-full`. Mono uppercase label. Ring suffix. Coloured drop shadow on hover.

| Variant | Rest | Hover |
|---|---|---|
| `primary` | `bg-ink text-paper` | `shadow-[0_0_50px_-12px_rgba(15,59,60,0.55)]`, ring fills |
| `accent` | `bg-accent text-white` | `shadow-[0_0_50px_-12px_rgba(181,77,44,0.55)]`, ring fills |
| `outline` | `border border-ink/25 text-ink` | `bg-ink text-paper` |
| `ghost` | `text-ink/70` | `text-ink`, ring appears |

Minimum target 44×44px (WCAG 2.1 AAA 2.5.5 — we take it as a floor anyway; touch targets on a community site skew older and less confident). Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`, switching to `outline-paper` on ink surfaces.

---

## 4. Layout

- **Container:** `max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16`.
- **Sections:** full-bleed, separated by hairline `border-t border-ink/10`. No card-in-container padding rhythm; no rounded panels floating on a tinted background. Editorial, not SaaS.
- **Section rhythm:** `py-20 md:py-28 lg:py-36`.
- **Grid:** 12 columns, `gap-6 md:gap-8`. Asymmetric splits are the house style — `md:grid-cols-[1.3fr_0.9fr_0.9fr_1.3fr]` for the stat row, `lg:grid-cols-[5fr_7fr]` for text-beside-image.
- **Section head:** numbered eyebrow, then display `h2`, then optional lede at `max-w-[45ch]`, left-aligned. Centred text is used exactly once per page at most.
- **Stat row:** 2 columns mobile, 4 desktop, divided by `divide-x divide-ink/10`. Number in display type, label in micro-label.

Vertical spacing uses Tailwind's default 0.25rem scale. No custom spacing tokens — the reference site does not need them and neither do we.

---

## 5. Motion

CSS only. No framer-motion, no GSAP, no scroll library.

| Keyframe | Spec |
|---|---|
| `fade-up` | `translateY(20px)` + `opacity 0` → `0/1`, 600ms `cubic-bezier(.16,1,.3,1)`. Default section reveal. |
| `marquee` / `marquee-reverse` | `translateX(0 → -50%)` on a duplicated track, 40s linear infinite. Partner logo strip. |
| `shimmer-sweep` | `translateX(-100% → 200%) skew(-12deg)`, 900ms, fired on `group-hover`. |
| `glow-pulse` | Pulsing accent box-shadow, 2.4s ease-in-out infinite. Donate CTA only. |
| `trace-top` / `-right` / `-bottom` / `-left` | `scaleX`/`scaleY` 0→1, staggered 120ms, tracing a border around outlined cards on hover. |
| `ring-expand` | `scale(0.6 → 1.4)` + fade, the CSS echo of the canvas motif. Accordion open, form success. |

**Reveal mechanism.** One shared `IntersectionObserver` in a ~500-byte inline module script that adds `.is-in` and unobserves. Not a React island — no hydration cost. Elements are `opacity: 1` in the initial HTML and only get `opacity: 0` once the script confirms it will run, so content is never invisible to a non-JS client or a crawler.

**Reduced motion.** A single global block:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The marquee also gets `animation-play-state: paused` and switches to a horizontally scrollable flex row so the logos remain reachable.

### 5.1 `RingCanvas` — the background

The reference site draws a particle constellation. We draw **slow concentric rings expanding from a few anchor points** — same "connected community" idea, matches the name, visually distinct at a glance.

Spec:

- `position: fixed; inset: 0; z-index: -10`, `aria-hidden="true"`, `pointer-events: none`.
- 3–5 anchors, count from viewport area, positions from a seeded PRNG so they do not jump between renders.
- Each anchor emits a ring every 2.6–4s. Radius grows to a max of 42vmin, stroke alpha fades `0.10 → 0`, 1px hairline in ink.
- Hard cap: `MAX_RINGS = 24` total. Oldest is recycled, never allocated per frame.
- `devicePixelRatio` capped at 2.
- No cursor interaction at all. This deletes the reference site's `mousemove` handler, its O(n²) proximity loop, and its per-frame attraction math.
- `prefers-reduced-motion: reduce` → draw exactly one static frame of evenly spaced rings, never start `requestAnimationFrame`.
- `document.visibilitychange` → cancel the rAF on hide, restart on show.
- Every listener registered `{ passive: true }`. Resize debounced 150ms.
- Loaded `client:idle`. The page is complete and correct without it.

This is the only React island on the home page.

**Not building:** an intro splash. The reference site's nine-keyframe, `localStorage`-gated intro delays first paint. A visitor looking for a programme time and a phone number should not have to watch a logo assemble itself.

---

## 6. Component inventory (Phase 1)

Each ships with every state rendered on `/styleguide`, on both paper and ink grounds.

| Component | Type | States to render |
|---|---|---|
| `Button` | Astro | 4 variants × rest / hover / focus-visible / active / disabled, + `as="a"` |
| `Ring` | Astro | 5 sizes × 4 variants × 4 tones |
| `SectionHeader` | Astro | With and without lede, with and without action |
| `StatRow` | Astro | 2, 3, 4 items |
| `Marquee` | Astro | Forward, reverse, paused, reduced-motion fallback |
| `Accordion` | Astro (`<details>`) | Closed, open, multiple, keyboard focus |
| `Card` | Astro | Default, hover with border trace, with image, link-wrapped |
| `Nav` | Astro + React island | Desktop, mobile closed/open, active page, focus trap |
| `Footer` | Astro | Full |
| `RingCanvas` | React island | Animating, reduced-motion static, hidden-tab paused |
| `Prose` | Astro | Long-form article styling for content collections |

`Accordion` is a native `<details>`/`<summary>` — free keyboard support, free `aria-expanded` semantics, works with zero JS, and the ring marker is pure CSS on `[open]`. The reference site's FAQ does the same thing and it is one of the things it gets right.

---

## 7. Accessibility

Target: **WCAG 2.1 Level AA on every public route.** Ontario's AODA references WCAG 2.0 AA for public-facing sites above certain organisational thresholds; Harmony Circle may fall below that threshold, but we build to 2.1 AA regardless and publish `/accessibility` stating what we conform to and how to report a barrier. I am not a lawyer and this document is not legal advice — the statement's wording is a `{{PLACEHOLDER}}` for client/legal sign-off, logged in `docs/LAUNCH-BLOCKERS.md`.

Non-negotiable rules:

1. Contrast floors as measured in §1.4. No text below the floor, ever, including placeholder text and disabled labels.
2. Focus is always visible: `focus-visible:outline-2 outline-offset-2`, accent on paper, paper on ink. Never `outline: none` without a replacement.
3. Semantic landmarks: `header` / `nav` / `main` / `section` / `article` / `aside` / `footer`. One `h1` per page, no skipped heading levels.
4. Every decorative node — every `Ring`, the canvas, every ornamental rule — is `aria-hidden="true"`.
5. `aria-current="page"` on nav, `aria-expanded` on every disclosure, `aria-live="polite"` on form results.
6. Skip-to-content link, first focusable element.
7. Colour is never the only carrier of meaning. Links are underlined; form errors have an icon and text, not just a red border.
8. Forms: real `<label>` elements, `aria-describedby` for hints and errors, errors summarised at the top and linked to fields.
9. Motion respects `prefers-reduced-motion` globally.
10. Language: `<html lang="en-CA">`, switching to `tr` on the future `/tr` tree. `hreflang` wired from day one even though only `en` is populated.

Verified in Phase 6 with axe-core on every route plus manual keyboard traversal. Targets: Lighthouse Accessibility 100, zero axe violations.

---

## 8. Internationalisation posture (v1 is English only)

Nothing ships in Turkish in v1, but nothing blocks it either. Concretely:

- No English string is hard-coded inside a component. UI chrome comes from `src/i18n/en.ts` typed against a `Strings` interface; the Turkish file will have to satisfy the same type or the build fails.
- Page content lives in `src/content/<collection>/en/*.md`, so `tr/` is a sibling directory, not a schema change.
- Astro's i18n routing is configured with `locales: ['en','tr']`, `defaultLocale: 'en'`, `prefixDefaultLocale: false`, and `tr` routes simply have no content yet.
- `hreflang` and canonical helpers already accept a locale argument.
- Fonts are subset with `latin-ext` (§2.1).

The reference site's hand-rolled `t = (en, tr) => ...` with strings duplicated at every call site is exactly what we are avoiding — it makes a third locale, or a copy edit, a find-and-replace across the codebase.

---

## 9. Anti-patterns — hard checklist

Derived from §6 of the teardown. These are build-blocking, not suggestions.

1. **No raw `<img>` with `sizes` and no `srcset`.** Every image goes through `astro:assets` `<Image>`/`<Picture>`. Zero exceptions on public pages.
2. **No unoptimised assets.** AVIF + WebP, sized to 2× display box, explicit `width`/`height`. A build-time check fails the build if any emitted image exceeds **250 KB**.
3. **No client-rendered primary content.** If it matters to a reader or a crawler, it is in the initial HTML response. Verified by fetching the built HTML and grepping for the content, not by looking at the rendered page.
4. **No bulk content in the JS bundle.** Articles live in content collections or Supabase. A build-time check fails if any single JS chunk exceeds **150 KB** raw.
5. **Security headers ship.** `Content-Security-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, set in the Cloudflare Worker. Draft CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://<project>.supabase.co; connect-src 'self' https://<project>.supabase.co; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self' https://checkout.stripe.com`.
6. **No dead CSS.** No `.dark` block, no unused shadcn tokens, no `--cell-size` for a calendar that does not exist. If a token has no consumer, it is not in the file.
7. **No unthrottled always-on animation.** See §5.1.

Carried forward from what the reference site does well: semantic landmarks, clean heading hierarchy, `aria-hidden` on decorative nodes, `aria-expanded` / `aria-current`, `loading="lazy"` + `decoding="async"`, immutable cache headers on hashed assets, JSON-LD, `hreflang`, `llms.txt`.

---

## 10. The token file

One file, `src/styles/global.css`. This is the whole colour system.

```css
@import "tailwindcss";

@theme {
  /* ---- the only three brand values in the codebase ---- */
  --color-ink:    #0f3b3c;
  --color-accent: #b54d2c;
  --color-paper:  #f6f2ea;

  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  --radius: 0.5rem;

  --animate-fade-up:      fade-up .6s cubic-bezier(.16,1,.3,1) both;
  --animate-marquee:      marquee 40s linear infinite;
  --animate-ring-expand:  ring-expand .7s cubic-bezier(.16,1,.3,1) both;
}

/* shadcn contract — §1.5 */
:root { /* ... */ }

@keyframes fade-up      { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
@keyframes marquee      { from { transform:translateX(0) }  to { transform:translateX(-50%) } }
@keyframes shimmer-sweep{ from { transform:translateX(-100%) skewX(-12deg) } to { transform:translateX(200%) skewX(-12deg) } }
@keyframes glow-pulse   { 0%,100% { box-shadow:0 0 0 0 rgb(181 77 44 / .45) } 50% { box-shadow:0 0 40px -8px rgb(181 77 44 / .6) } }
@keyframes ring-expand  { from { opacity:0; transform:scale(.6) } to { opacity:1; transform:scale(1) } }
@keyframes trace-top    { from { transform:scaleX(0) } to { transform:scaleX(1) } }
/* trace-right / -bottom / -left likewise */

@media (prefers-reduced-motion: reduce) { /* §5 */ }
```

No `tailwind.config.js`. No `@astrojs/tailwind`.

---

## 11. Open decisions

Things I am not deciding unilaterally. None block Phase 1.

1. **Accent value** — I am shipping `#b54d2c`. Overrule me if you want `#c75b39` and accept the text restriction (§1.2).
2. **`--destructive`** — the one non-derived hex, admin-only (§1.5). Keep, or replace with ink + icon?
3. **Runtime image processing for admin uploads.** `sharp` does not run on Cloudflare Workers. Three viable routes: (a) Cloudflare Images binding, (b) Supabase Storage image transformations, (c) resize in the browser via `OffscreenCanvas` before upload with server-side dimension/size validation. Decide in Phase 5; (c) costs nothing and is the current lean.
4. **Astro image service on Cloudflare.** The adapter defaults to `imageService: 'cloudflare-binding'`, which needs a paid Images binding. Since every public page is prerendered, `imageService: 'compile'` optimises at build and passes through at runtime — no binding, no cost. Confirmed against the adapter docs. Going with `'compile'` unless you want the binding.
5. **10px micro-labels.** Legal at AA at `ink/70`, and it is the reference site's exact spec, but 10px is genuinely small for an audience skewing older. Option to bump to 11px site-wide is a one-line change. Flagging, not changing.
