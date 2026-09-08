import type { Strings } from "./types";
import { en } from "./en";

export type Locale = "en" | "tr";

/**
 * `tr` is wired in `astro.config.mjs` and deliberately empty. Until a `tr.ts`
 * exists that satisfies `Strings`, this returns English for every locale — a
 * visible gap, not a silent one.
 */
const catalogues: Record<Locale, Strings> = { en, tr: en };

export function strings(locale: Locale = "en"): Strings {
  return catalogues[locale] ?? en;
}

export type { Strings };
