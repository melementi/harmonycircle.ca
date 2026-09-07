# connectr.ca — full teardown

Crawled 2026-09-07. Method: raw HTTP fetch of all 20 sitemap routes + robots/llms.txt/sitemap, download and static analysis of the CSS bundle (131 KB) and all 15 JS chunks (~1.3 MB raw), plus live DOM/visual inspection in Chrome.

---

## 1. Verdict

1. **AI-built, and provably so.** The site was generated with **Lovable** (formerly GPT Engineer). This is not an inference from code style — the vendor's runtime is literally shipped in the production bundle.
2. **But it is not a raw one-shot generation.** The design system is coherent and deliberate, the Turkish localisation is native-quality, and the app has real backend features (auth, admin CMS, Supabase tables, file uploads). Someone drove it through many iterations and supplied real brand direction.
3. **Confidence: very high (95%+) on Lovable.** Confidence on "vibe coded" (directed by prompt, not hand-written) is high (~85%) based on secondary code tells listed in section 5.

---

## 2. Stack and infrastructure

| Layer | What it is | Evidence |
|---|---|---|
| Framework | **TanStack Start** (TanStack Router + `createServerFn` + Nitro server build) | `/assets/createServerFn-*.js`, `/_serverFn/` prefix, `useRouterState`, `matchContext`, server `package.json` with `"main": "./server/index.mjs"` |
| Rendering | SSR + client hydration, route-level code splitting via Vite/Rollup | `modulepreload` chain in `<head>`, per-route chunks (`news._slug-*`, `admin.index-*`) |
| UI | React 19 (`react-dom` chunk), no Radix, no framer-motion | zero `radix` / `motion` strings in bundles |
| Styling | **Tailwind CSS v4.2.4** (CSS-first `@theme`) + `tw-animate-css` | `/*! tailwindcss v4.2.4 */` header, `--tw-enter-*` / `--tw-exit-*` vars |
| Icons | **lucide-react**, tree-shaken and inlined per module | `createLucideIcon-*.js`, 18 icon nodes in the main chunk |
| Toasts | **sonner** (CSS injected as a 14.8 KB template literal) | `[data-sonner-toaster]` block inside `index-*.js` |
| Charts (admin) | **Recharts** | 14 refs in `admin.index-*.js` |
| Backend | **Supabase** (`@supabase/supabase-js` 2.x, auth-js, storage-js 2.108.2) | full SDK bundled in `client-*.js` |
| Hosting/CDN | **Cloudflare** in front of Lovable Cloud | `server: cloudflare`, `cf-ray`, `x-deployment-id: psr2.<uuid>…` |
| Asset store | Lovable's R2-backed asset manager | `/__l5e/assets-v1/<uuid>/…`, inline `r2_key: a/v1/<project_id>/…` records |

### Supabase surface (client-visible)

- Tables: `site_settings`, `exhibitors_2026`, `user_roles`
- Storage bucket: `exhibitor-logos`
- Own endpoints: `/api/public/time` (returns `{"now": <epoch ms>}` — server clock for the countdown), `/api/public/track`, `/api/broadcast`
- Admin gate: `/auth` — "Admin access is granted automatically to verified @connectr.ca email addresses"

---

## 3. Design system — the actual tokens

### 3.1 Palette

Three brand tokens drive everything. Everything else is opacity math on those three.

```css
:root{
  --navy:   #0c1844;   /* ink, dark surfaces */
  --red:    #c80036;   /* single accent, used hard */
  --paper:  #f9f8f6;   /* off-white ground */
  --radius: .5rem;
}
```

`#0C1844` + `#C80036` is a well-known stock ColorHunt pairing (the fourth colour of that palette, `#FFF5E0`, was swapped for a cooler `#F9F8F6`). It doubles as a Turkish-flag red against Canadian navy, so the choice reads as intentional rather than default.

Mapped onto the **shadcn/ui token contract**:

```css
:root{
  --background:#f9f8f6;  --foreground:#0c1844;
  --card:#fff;           --card-foreground:#0c1844;
  --popover:#fff;        --popover-foreground:#0c1844;
  --primary:#0c1844;     --primary-foreground:#f9f8f6;
  --secondary:#eceae5;   --secondary-foreground:#0c1844;
  --muted:#eceae5;       --muted-foreground:#5b6478;
  --accent:#c80036;      --accent-foreground:#fff;
  --destructive:#b91c1c; --destructive-foreground:#fff;
  --border:#0b1b3b1a;    --input:#0b1b3b1f;  --ring:#0b1b3b66;
}
.dark{ --background:#0c1844; --card:#11254d; --secondary:#1a2f5c;
       --muted-foreground:#aab2c5; --border:#ffffff1a; /* …etc */ }
```

**The `.dark` block is dead code.** Zero `dark:` utilities are compiled into the CSS and there is no theme toggle anywhere in the app. It ships because the scaffold ships it.

### 3.2 Type

- **Inter** at weights 300–900 (display + body), **JetBrains Mono** 400/500 (labels only). Both from Google Fonts, `display=swap`, with `preconnect`.
- Two-register system, applied ruthlessly:
  - **Display:** `font-black uppercase tracking-tighter leading-[0.85]`, scaling to `lg:text-[9rem]`. Headlines are one or two words plus a full stop — "THE CIVIC EXCHANGE.", "2026 EXHIBITORS.", "PRESENTING PARTNER."
  - **Micro-label:** `font-mono uppercase text-[10px]` with tracking from `0.16em` up to `0.3em`. Used for section numbers `(01) VISION`, counts `50 BRANDS`, eyebrows `POWERED BY OUR`.
- `uppercase` appears 119 times on the homepage alone — it is the single most-used utility on the site.

### 3.3 Layout and ornament

- Full-bleed sections divided by hairline rules (`border-navy/10`, `divide-navy/10`); no card-in-container padding rhythm. Content sits on a 4-column exhibitor grid (`md:grid-cols-[1.3fr_0.9fr_0.9fr_1.3fr]` for the stat row).
- **Rotated squares as the whole ornament language**: `rotate-45 size-3 bg-red` — 28 instances on the homepage. They serve as bullets, button suffixes, FAQ chevrons (`group-open:rotate-[225deg]`), and section markers. That one motif is what makes the site look "designed".
- Buttons: pill (`rounded-full`), solid navy or solid red, uppercase mono label, diamond suffix, plus a coloured drop shadow on hover — `hover:shadow-[0_0_50px_-12px_rgba(200,0,54,0.55)]`.
- Numbered sections `(01) VISION` → `(02) PERSPECTIVE` → `(03) TEAM`, an editorial/agency convention.

### 3.4 Motion — all CSS, no animation library

31 `@keyframes` in the stylesheet. No framer-motion, no GSAP. Notable ones:

| Keyframe | Use |
|---|---|
| `fade-up` | 20 px rise + fade, the default section reveal (8 uses on home) |
| `marquee` / `marquee-reverse` | `translateX(0 → -50%)` on a duplicated partner strip — the standard CSS ticker |
| `blob` | slow drifting blurred gradient orbs (`blur-[120px]`, `size-[640px]`) |
| `shimmer-sweep` | `translateX(-100% → 200%) skew(-12deg)` sheen, fired on `group-hover` |
| `glow-pulse` | pulsing red box-shadow |
| `trace-top/right/bottom/left` | four scaleX/scaleY border-tracing animations for outlined cards |
| `blink-cursor` | terminal caret for the typed headline |
| `intro-logo`, `intro-word`, `intro-forge-ring`, `intro-forge-node`, `intro-wash`, `intro-flash`, `intro-rise`, `intro-spin-in`, `intro-pulse` | a **9-keyframe scripted intro sequence**: nodes fly in and assemble, a ring spins, a `clip-path: circle()` wash reveals the page. Shown once per 24 h, gated by `localStorage['ctr_intro_last_shown']` (`1440 * 60 * 1000`) |

### 3.5 The background

A hand-written **canvas particle-network** ("constellation") is `position: fixed; inset: 0; -z-10` on every page:

- Node count `Math.min(110, floor(w*h/14000))`, DPR capped at 2.
- O(n²) pair loop each frame; edges drawn under 130 px, alpha `(1 - d/130) * 0.18` in navy.
- Cursor is a node: within 180 px it draws a **red** link and applies a `2e-5` attraction force to nearby particles.
- A second, near-duplicate implementation exists with different constants (70 nodes, `/11000`, 60 fps) — two copies of the same idea in one bundle.

### 3.6 Hero mechanism

`useTyping(text, 80ms/char, 600ms delay)` types the headline character by character, then hides the caret 1.2 s after finishing. The `<h1>` is **empty in the SSR HTML** — it only fills in after hydration.

---

## 4. Content and information architecture

- Bilingual EN/TR via a **hand-rolled i18n**: `i18n-*.js` is 600 bytes and exports `t = (en, tr) => lang === 'tr' ? tr : en`, with locale derived from the URL prefix (`/tr/...`). No i18next. Every string is duplicated inline at its call site.
- Turkish content is genuinely written, not machine-translated — idiomatic phrasing, correct diacritics, culturally specific wording.
- 20 URLs in `sitemap.xml`, correct `hreflang` (`en-CA` / `tr-TR` / `x-default`) and canonicals on every page.
- Rich JSON-LD: `Organization`, `WebSite`, and a full `Event` with venue `PostalAddress` (Venu Event Space, 2800 Highway 7, Vaughan ON L4K 1W8), start/end times, `eventStatus`, organizers.
- **`llms.txt` present** — a hand-curated page index for AI crawlers.
- A **fake "LIVE" support chat**: a scripted four-branch FAQ tree (Event Info / Exhibitor Registration / Sponsorship / General) that hands off to WhatsApp `+1 519 902 4087`. No agent, no LLM, no websocket.
- Legacy WordPress origin is visible: image paths under `/wp/`, and the news archive is WordPress-exported HTML (`<h2><strong>`, `\xA0`, inline `style="color: #d01b1d"`).

---

## 5. Evidence it was AI-generated / vibe coded

**Direct, conclusive:**

1. `client-DUI_Jb6_.js` contains Lovable's preview-auth bridge verbatim, including the host allowlist:
   `lovableproject.com`, `lovableproject-dev.com`, `lovable.app`, `gpt-eng.com`, `gptengineer.run`, and postMessage types `lovable-preview-auth:get/set/remove`.
2. All uploaded assets are served from `/__l5e/assets-v1/<uuid>/…` — `__l5e` is a numeronym for **l**ovabl**e** (5 letters elided). Lovable's asset manager.
3. Asset records are pasted into the source as objects, R2 key and all:
   `{version:1, asset_id:'872d1256…', project_id:'b283f546…', url:'/__l5e/…/berkan-kirpik.png', r2_key:'a/v1/b283f546…/berkan-kirpik.png', original_filename:'berkan-kirpik.png', size:2705631, …}`
   A human would have written `/images/berkan.png`.
4. `x-deployment-id: psr2.<uuid>.<epoch>.<sig>` on every response — Lovable Cloud's deploy header, not Vercel/Netlify/Cloudflare Pages.
5. Lovable publicly ships TanStack Start as its app template, which matches the framework exactly.

**Secondary tells (consistent with prompt-driven building):**

6. `sizes="(min-width: 640px) 25vw, 50vw"` on team photos **with no `srcset`**. `sizes` alone is a no-op. Zero `srcset` attributes exist anywhere on the site. This is a signature LLM markup mistake.
7. A 2.7 MB PNG (`berkan-kirpik.png`, 2,705,631 bytes) shipped as a headshot next to three ~130 KB JPEGs — no pipeline, no resizing, whatever was uploaded is what serves.
8. Full shadcn dark-mode token block with zero `dark:` utilities and no toggle. `--cell-size` (react-day-picker/shadcn Calendar) defined with no calendar in the app.
9. The entire news archive is **hardcoded into the client bundle** as template literals — 113 KB of the 532 KB `index` chunk (21%) is content strings, including a 28.7 KB JSON blob of page copy. There is a Supabase backend right there; the articles are not in it.
10. Two near-identical canvas particle systems with divergent magic numbers in the same bundle.
11. `sizes`-without-`srcset`, dead theme tokens, and duplicated helpers all coexisting with genuinely careful ARIA work is the classic signature: broad competent scaffolding, no one auditing the details.

**Evidence of real human direction (why it does not read as one-shot AI slop):**

- Deliberate, restrained three-colour palette with one repeated ornament motif — AI defaults are gradient-purple, glassmorphism, and four accent colours.
- Native-quality Turkish across the entire site, including chat scripts.
- Real business data: 27 industries, ~90 exhibitor logos tiered Platinum/Gold/Food/Silver, named sponsors, four founder bios.
- Real backend scope: Supabase auth with domain-gated admin, an admin CMS with logo uploads to a storage bucket, a Recharts analytics dashboard, exhibitor/vendor agreement forms.
- SEO work beyond any default: `llms.txt`, hreflang, three JSON-LD blocks, per-route canonicals, a keyword set written in both languages.

---

## 6. Problems found

| Severity | Issue |
|---|---|
| High | 2.7 MB PNG headshot on the homepage. Convert to WebP at 2× display size (~60 KB). |
| High | `sizes` without `srcset` on every responsive image — the attribute does nothing. Either add `srcset` or drop `sizes`. |
| Med | The exhibitor grid (~90 logos) is absent from SSR HTML and only appears after hydration + a Supabase round trip. Costs LCP and leaves that content invisible to non-JS crawlers. |
| Med | 113 KB of article HTML hardcoded in the entry bundle instead of the DB it already has. Every visitor downloads the whole news archive to view the homepage. |
| Med | Canvas animation runs on every page, forever, with no `prefers-reduced-motion` check, no pause on `visibilitychange`, and no pause when off-screen. Battery cost on mobile. |
| Med | **No Content-Security-Policy, no Permissions-Policy, no X-Frame-Options.** Only HSTS and Referrer-Policy are set. |
| Low | `mousemove` listener registered without `{passive: true}` (touchmove correctly is). |
| Low | Dead `.dark` theme block and unused shadcn tokens shipped in CSS. |
| Low | TTFB measured 0.43–0.84 s from a datacenter — variable, likely cold server-function starts. |

**What is done well:** semantic landmarks (`header`/`nav`/`main`/`section`/`article`/`footer`), clean h1→h2→h3 hierarchy, 38 `aria-hidden` on decorative nodes, `aria-expanded`/`aria-current`/`aria-pressed`, a live region, `loading="lazy"` + `decoding="async"` on 227 images, immutable 1-year cache headers on hashed assets, and a 13 KB gzipped HTML document.

---

## 7. If you want to rebuild this look

```css
@theme {
  --color-navy:  #0c1844;
  --color-red:   #c80036;
  --color-paper: #f9f8f6;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

The whole style is four rules:

1. **Display type**: `font-black uppercase tracking-tighter leading-[0.85]`, one to three words, ending in a period. Second line in red.
2. **Every label**: `font-mono uppercase text-[10px] tracking-[0.25em]`, numbered `(01)`, `(02)`.
3. **Every accent**: a `rotate-45` square in red. Bullets, button suffixes, chevrons, dividers.
4. **Opacity, not new colours**: `text-navy/20`, `border-navy/15`, `bg-paper/70`. The site uses roughly 30 distinct opacity steps of three base colours and nothing else.

Motion: `fade-up` on scroll, a duplicated-track CSS marquee, `group-hover` shimmer sweep, and one canvas particle field. No animation library needed.
