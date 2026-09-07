# CLAUDE.md — harmonycircle.ca

Production website for **Harmony Circle**, a Turkish community non-profit foundation in **London, Ontario, Canada**.

Read [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) before touching anything visual. Read [`docs/connectr-teardown.md`](docs/connectr-teardown.md) for the design reference and, more importantly, for §6 — the list of defects we are contractually not repeating.

---

## Stack — locked

| Concern | Decision |
|---|---|
| Framework | Astro 5, `output: 'server'` |
| Rendering | `export const prerender = true` on **every** public page. SSR only where it earns it (`/admin/*`, Actions). |
| Hosting | Cloudflare Workers via `@astrojs/cloudflare` |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`. CSS-first `@theme`. **No `tailwind.config.js`. No `@astrojs/tailwind`** (deprecated). |
| Interactivity | React 19 islands via `@astrojs/react` — mobile nav, forms, admin UI, `RingCanvas`. Nothing else. |
| Backend | Supabase (Postgres, Auth, Storage) |
| Email | Resend |
| Payments | Stripe Checkout / Payment Links. **Never a custom card form.** |
| Icons | lucide (`astro-icon` in Astro, `lucide-react` in islands) |
| Fonts | `@fontsource-variable/*`, self-hosted. No Google Fonts CDN. |
| Images | `astro:assets` `<Image>` / `<Picture>` only |
| Package manager | npm |
| Language | TypeScript, `strict` |

**Why `output: 'server'` with per-page `prerender = true`** rather than `output: 'static'` with per-page opt-out: the failure mode is safer. Forget the flag on a static page → it renders on demand; slower, still correct. Forget it under `'static'` on the admin dashboard → the auth gate is frozen at build time, which is a security bug. Fail loud and slow, not quiet and wrong.

---

## Commands

```
npm run dev          astro dev
npm run build        astro build
npm run preview      wrangler dev (real Workers runtime, not the Vite dev server)
npm run check        astro check && tsc --noEmit
npm run lint         eslint . && prettier --check .
npm run format       prettier --write .
npm run audit:img    fail if any emitted image > 250 KB
npm run audit:js     fail if any emitted JS chunk > 150 KB raw
npm run audit:a11y   axe-core over every built route
npm run deploy       wrangler deploy
```

`npm run build` runs `audit:img` and `audit:js` as part of the pipeline. They are gates, not reports.

### Cross-platform scripts — mandatory

The primary dev environment is **Windows 11**. (Note: the session that scaffolded this repo ran on Linux. Anything shell-shaped must be verified on Windows before it is called done.)

- No bash-only syntax in `package.json` scripts.
- No `NODE_ENV=x cmd` prefixes — use `cross-env`.
- No POSIX paths, no `&&`-chained shell builtins, no `rm -rf` — use `rimraf` or a Node script.
- Anything more complex than a single binary invocation goes in `scripts/*.mjs` and is run with `node`.

---

## Directory layout

```
src/
  actions/          Astro Actions — every form and mutation. Zod at the boundary.
  components/       Astro components. Default. No island unless proven necessary.
    islands/        React. Each one needs a written justification in its header comment.
  content/          Content collections, keyed by locale: <collection>/en/*.md
  i18n/             en.ts + the Strings interface. No inline English in components.
  layouts/
  lib/              supabase.ts, resend.ts, stripe.ts, seo.ts, images.ts
  pages/
  styles/global.css The three brand hexes live here and nowhere else.
docs/
scripts/            Build gates and one-off tooling. Node, cross-platform.
supabase/migrations Explicit SQL. RLS policies written by hand, never left to defaults.
```

---

## Conventions

### Colour
Three hex codes in `src/styles/global.css`. Everything else is opacity math on them (`text-ink/80`, `border-ink/15`, `bg-paper/70`). **Do not add a fourth colour.** Do not write a hex code in a component. Do not use a gradient as a surface.

Contrast floors are measured and non-negotiable — see `docs/DESIGN-SYSTEM.md` §1.4. Accent is decorative only on ink surfaces (§1.3).

### Type
Two registers, display and micro-label; everything else is body. Display headlines are one to three words ending in a full stop, second line in accent. Micro-labels are `font-mono uppercase text-[0.625rem] tracking-[0.25em]`. Section eyebrows are numbered `(01)`, `(02)`.

### Ornament
The ring, via `<Ring />`. Never hand-roll a circle. Never reintroduce the reference site's rotated square.

### Islands
Astro by default. A React island must justify itself in a comment at the top of the file: what interaction requires it, and why the Astro equivalent does not work. `client:idle` unless the component must be interactive before idle. `client:visible` for anything below the fold.

### Images
`astro:assets` only. Explicit `width`/`height`. `loading="lazy"` + `decoding="async"` on everything below the fold; the LCP image is eager with `fetchpriority="high"`. Adapter runs `imageService: 'compile'` — build-time optimisation for prerendered routes, passthrough at runtime, no Cloudflare Images binding required.

### Content
Content collections or Supabase. **Never a bundled string.** If you find yourself writing article HTML into a `.ts` file, stop — that is the exact defect in teardown §6.

### Strings
No hard-coded English in a component. `src/i18n/en.ts`, typed. Turkish is a v2 requirement and the structure must not need a rewrite to accept it.

### Forms
Astro Actions → Zod validation → Supabase write → Resend notification → real success/error state returned to the UI. Honeypot field plus rate limiting on every public form. Client validation is a convenience, never a control.

### Database
RLS on every table, policies written explicitly in a migration. Roles via a `user_roles` table. Never rely on default-deny as documentation — write the policy.

### SEO
Per-page canonical, Open Graph, JSON-LD (`NGO` on the org, `Event` on events, `BreadcrumbList` on nested routes), `sitemap.xml`, `robots.txt`, `llms.txt`, `hreflang` (wired for `tr` from day one even while `tr` is empty).

### Security headers
Set in the Cloudflare Worker: CSP, `Permissions-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, HSTS, `Referrer-Policy`. Draft CSP in `docs/DESIGN-SYSTEM.md` §9.5.

---

## Things that are never invented

Charity and legal claims are legally sensitive and nobody on this project is a lawyer. **Never write a plausible-looking value for any of these.** Emit a `{{PLACEHOLDER}}` token and log it in `docs/LAUNCH-BLOCKERS.md`:

- CRA charitable registration number / business number
- Whether donations are tax-receiptable, and under what conditions
- Receipt issuance process and minimum amount
- Any "registered charity" wording
- Street address, phone number, email address, hours
- Board member and staff names, titles, bios, photos
- Partner organisation relationships and logos
- Founding date, member counts, programme statistics

If Harmony Circle is not a CRA-registered charity, the site must not imply donations are tax-deductible. When in doubt, placeholder it.

The same rule applies to APIs: never invent a Supabase feature, a Stripe parameter, or an Astro config key. Check the docs. Say so when confidence is low.

---

## Build phases

Stop at each gate. Complete a phase fully before stopping; do not check in mid-phase.

- **0 — Recon.** Read the teardown, write `docs/DESIGN-SYSTEM.md` and this file. ← *current*
- **1 — Foundation.** Scaffold. Tokens, type scale, component library, `/styleguide` with every component in every state. Screenshot it.
- **2 — Home page.** Complete, with realistic self-written placeholder copy. Screenshot at 1440px and 390px.
- **3 — Remaining public pages.** All routes except `/admin`. Content collections. Full SEO.
- **4 — Supabase + forms + events.** Schema, migrations, RLS, Actions, Resend.
- **5 — Admin panel.**
- **6 — Donations, then audit.** Lighthouse every route, axe-core, image budget, security headers → `docs/AUDIT.md`.

Targets on every public route: **Lighthouse Performance ≥ 95, Accessibility 100, SEO 100.**

Commit at the end of each phase with a clear message.

---

## Working agreement

- Verify your own work. Run the build. Run `astro check`. Take the screenshot and actually look at it. Run the a11y scan. Do not ask the developer to read code to find out whether something works.
- If a decision in the brief looks wrong, say so with reasoning and numbers before proceeding — then do it their way if they still want it.
- State confidence when unsure.
- The developer does not need code explained to them. Ship working output and report the numbers.

---

## Routes

```
/                      Home
/about                 Mission, story, board and team
/programs              Programme index
/programs/[slug]
/events                Upcoming + past
/events/[slug]
/get-involved          Volunteer + membership
/donate
/news                  Index
/news/[slug]
/partners              Includes ConnecTR
/contact               Form + location + hours
/privacy-policy
/accessibility         AODA statement
/admin/*               Auth-gated, SSR, no prerender
/styleguide            Dev only, excluded from sitemap and robots
```
