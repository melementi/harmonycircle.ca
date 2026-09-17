import type { Strings } from "./types";

/**
 * Interface chrome only. Page content lives in content collections
 * (`src/content/<collection>/en/`) or Supabase — never in this file, and never
 * inline in a component.
 */
export const en: Strings = {
  siteName: "Harmony Circle",
  tagline:
    "A movement for good that develops and oversees social responsibility projects for the benefit of the community.",

  nav: {
    label: "Main",
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Home",
    about: "About",
    programs: "Programs",
    events: "Events",
    getInvolved: "Get involved",
    news: "News",
    partners: "Partners",
    contact: "Contact",
    donate: "Donate",
  },

  footer: {
    heading: "Harmony Circle",
    explore: "Explore",
    connect: "Connect",
    legal: "Legal",
    privacy: "Privacy policy",
    accessibility: "Accessibility",
    rights: "All rights reserved.",
    landAcknowledgement:
      "We gather on the traditional territories of the Anishinaabek, Haudenosaunee, Lūnaapéewak and Chonnonton Nations.",
  },

  common: {
    readMore: "Read more",
    viewAll: "View all",
    learnMore: "Learn more",
    loading: "Loading",
    required: "Required",
    optional: "Optional",
  },
};
