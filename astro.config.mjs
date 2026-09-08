// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://harmonycircle.ca",

  // `server` with `export const prerender = true` on every public page, rather
  // than `static` with per-page opt-out. The failure mode is what decides it:
  // forgetting the flag here gives a slow-but-correct page, while forgetting it
  // under `static` freezes the admin auth gate at build time. See CLAUDE.md.
  output: "server",

  adapter: cloudflare({
    // Build-time optimisation for prerendered routes, passthrough at runtime.
    // The adapter's default, `cloudflare-binding`, needs a paid Cloudflare
    // Images binding; every public route here is prerendered, so the images are
    // already optimised by the time a request arrives.
    imageService: "compile",
  }),

  integrations: [react(), icon()],

  // Turkish is a v2 requirement. The routes are wired now so adding it is a
  // content change rather than a router change. `tr` has no pages yet.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "tr"],
    routing: { prefixDefaultLocale: false },
  },

  vite: { plugins: [tailwindcss()] },
});
