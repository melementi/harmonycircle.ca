/**
 * The shape every locale must satisfy.
 *
 * The point of the interface is that adding `tr.ts` in v2 is a type error until
 * every key is translated, rather than a silent fallback to English. The
 * reference site's `t = (en, tr) => ...` duplicates both languages at every
 * call site, which makes a copy edit a find-and-replace across the codebase.
 */
export interface Strings {
  siteName: string;
  tagline: string;

  nav: {
    label: string;
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    about: string;
    programs: string;
    events: string;
    getInvolved: string;
    news: string;
    partners: string;
    contact: string;
    donate: string;
  };

  footer: {
    heading: string;
    explore: string;
    connect: string;
    legal: string;
    privacy: string;
    accessibility: string;
    rights: string;
    landAcknowledgement: string;
  };

  common: {
    readMore: string;
    viewAll: string;
    learnMore: string;
    loading: string;
    required: string;
    optional: string;
  };
}
