# Client content brief

A standalone HTML page that renders the site in its real design with every
piece of copy editable in place. It is published as an Artifact and sent to
the client; they type their words straight onto the page and press Save,
which writes their answers back into the page itself.

Published at: https://claude.ai/code/artifact/2cbe2e46-6f40-4877-be76-c6e7f22580ef

## Files

| File | What it is |
|---|---|
| `brief.html` | The page. Self-contained: CSS, schema and app in one file. |
| `fields.json` | The question set on its own — 10 pages, 65 sections, 286 field definitions. |

`brief.html` renders itself from two JSON islands: `hc-schema` (the questions,
fixed) and `hc-content` (the answers, replaced on every save). Saving rebuilds
the whole document from those two islands plus the style and app source read
back off the DOM, so a save is a function of state rather than a snapshot of
the live DOM. Answers are held in `localStorage` while the client types and
only written into the page when they press Save.

## Getting the answers back

1. Open the Artifact and read `hc-content` — it is the full answer state.
2. Or use the client's downloaded `harmony-circle-content.json`, which is the
   same data shaped page → section → field.

Keys are `pageKey.sectionId.fieldId`, and `pageKey.sectionId#instanceId.fieldId`
for repeatable sections (programmes, events, board members, partners, FAQs).

## Relationship to LAUNCH-BLOCKERS.md

Every field carrying a `{{TOKEN}}` from [`../LAUNCH-BLOCKERS.md`](../LAUNCH-BLOCKERS.md)
is flagged `legal: true` in `fields.json`. Those fields ship with no example
value, render with an accent dashed outline and an "official wording" marker,
and the guidance panel tells the client to leave them empty rather than
estimate. When answers come back, move the matching row in
`LAUNCH-BLOCKERS.md` from `OPEN` to `SUPPLIED`.

## Deliberately not asked

Menu wording, internal link destinations, URL slugs, generic button labels
("Read more", "View all"), form input labels, and image alt text. The first
five are the developer's to decide; alt text describes a photograph that does
not exist yet and is written when the photo arrives.

## Rebuilding

The page is assembled from parts kept in the session scratchpad, not in the
repo — `brief.html` here is the built artifact. To change the questions, edit
`fields.json`, replace the `hc-schema` island in `brief.html`, and republish.
