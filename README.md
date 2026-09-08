# harmonycircle.ca

Website for **Harmony Circle**, a Turkish community non-profit foundation in London, Ontario, Canada.

Design brief and conventions: [`CLAUDE.md`](CLAUDE.md).
Design system, with measured contrast ratios: [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).
Values that must come from the client before launch: [`docs/LAUNCH-BLOCKERS.md`](docs/LAUNCH-BLOCKERS.md).

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Astro, `output: 'server'` with `export const prerender = true` on every public page |
| Hosting | Cloudflare Workers (`@astrojs/cloudflare`, `imageService: 'compile'`) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first `@theme`, no config file |
| Interactivity | React 19 islands, only where an island is justified in writing |
| Backend | Supabase — phase 4 |
| Email | Resend — phase 4 |
| Payments | Stripe Checkout / Payment Links — phase 6 |
| Fonts | `@fontsource-variable/*`, self-hosted, `latin` + `latin-ext` |
| Language | TypeScript, strict |

TypeScript is pinned to 6.x because `astro check` does not yet run on 7.x.

## Commands

```
npm run dev          astro dev
npm run build        astro build, then the image and JS budget gates
npm run preview      wrangler dev, the real Workers runtime
npm run check        astro check && tsc --noEmit
npm run lint         eslint . && prettier --check .
npm run format       prettier --write .
npm run audit:img    fail if any emitted image exceeds 250 KB
npm run audit:js     fail if any client JS chunk exceeds 150 KB raw
npm run deploy       wrangler deploy
```

`audit:img` and `audit:js` run as part of `npm run build`. They are gates, not reports.

## Design system in four rules

1. **Three colours, one file.** `--color-ink` `#0f3b3c`, `--color-accent` `#b54d2c`, `--color-paper` `#f6f2ea`, all in [`src/styles/global.css`](src/styles/global.css). Everything else is opacity math on them. Re-skinning the site is editing three lines.
2. **Two type registers.** Display — `font-black uppercase tracking-tighter leading-[0.85]`, one to three words ending in a full stop, second line in accent. Micro-label — `font-mono uppercase text-[0.625rem] tracking-[0.25em]`, section eyebrows numbered `(01)`, `(02)`. Everything else is body.
3. **One ornament.** A ring, via `<Ring />`. Bullets, button suffixes, accordion markers, section dividers.
4. **Full-bleed sections on hairline rules.** No card-in-container padding rhythm. Editorial, not SaaS.

Contrast is measured, not estimated, and the floors are enforced: body copy sits at `ink/80` (6.19:1) with `ink/70` (4.68:1) the floor for any text. Accent on ink measures 2.37:1, so on dark grounds accent is ornament only and anything meaning-carrying uses paper.

## Accessibility

Built to WCAG 2.1 AA on every public route. Ontario's AODA references WCAG 2.0 AA for public-facing sites above certain organisational thresholds; Harmony Circle may fall below that threshold, and the site is built to the higher bar regardless. `/accessibility` publishes the conformance statement — its wording is a launch blocker pending client and legal sign-off, and nothing in this repository is legal advice.

## Build phases

- [x] **0 — Recon.** Design system and project conventions.
- [x] **1 — Foundation.** Scaffold, tokens, component library, `/styleguide` with every component in every state.
- [ ] **2 — Home page.**
- [ ] **3 — Remaining public pages.** Content collections, full SEO.
- [ ] **4 — Supabase, forms, events.** Schema, migrations, RLS, Actions, Resend.
- [ ] **5 — Admin panel.**
- [ ] **6 — Donations, then audit.** Lighthouse, axe-core, image budget, security headers.

Targets on every public route: Lighthouse Performance ≥ 95, Accessibility 100, SEO 100.

## A note on placeholders

Charity registration details, addresses, phone numbers, board member names, partner relationships and programme statistics are **never invented**. Where a value is unknown the source carries a `{{PLACEHOLDER}}` token and the item is logged in [`docs/LAUNCH-BLOCKERS.md`](docs/LAUNCH-BLOCKERS.md). If Harmony Circle is not a CRA-registered charity, the site must not imply donations are tax-deductible.

## Design reference

The visual grammar is derived from [connectr.ca](https://connectr.ca), a partner organisation, at the client's request. [`docs/connectr-teardown.md`](docs/connectr-teardown.md) is the teardown that brief came from; its section 6 is a list of that site's real defects, which this repository treats as a build-blocking checklist rather than a suggestion.
