# Launch blockers

Every `{{PLACEHOLDER}}` in the codebase is listed here. **None of these values may be invented.** They come from the client, in writing, before launch.

Status key: `OPEN` — not yet supplied. `SUPPLIED` — received, pending implementation. `DONE` — in the site.

---

## Legal and financial — highest risk

| Token | What it is | Status |
|---|---|---|
| `{{CRA_REGISTRATION_NUMBER}}` | CRA charitable registration / business number, if any | OPEN |
| `{{IS_REGISTERED_CHARITY}}` | Whether Harmony Circle is a CRA-registered charity at all | OPEN |
| `{{DONATION_TAX_RECEIPTABLE}}` | Whether donations are tax-receiptable, and under what conditions | OPEN |
| `{{RECEIPT_PROCESS}}` | How and when receipts are issued | OPEN |
| `{{RECEIPT_MINIMUM}}` | Minimum donation that generates a receipt | OPEN |
| `{{CHARITY_WORDING}}` | Exact approved wording for any "registered charity" claim | OPEN |
| `{{LEGAL_ENTITY_NAME}}` | Full registered legal name of the organisation | OPEN |

**If `{{IS_REGISTERED_CHARITY}}` is false, the site must not imply donations are tax-deductible anywhere**, including the donate page, the footer, receipts, and Stripe product descriptions. The donate page copy has two variants and cannot be finalised until this is answered.

## Contact and location

| Token | What it is | Status |
|---|---|---|
| `{{STREET_ADDRESS}}` | Physical address in London, Ontario | OPEN |
| `{{MAILING_ADDRESS}}` | If different from above | OPEN |
| `{{PHONE}}` | Public phone number | OPEN |
| `{{EMAIL_GENERAL}}` | General enquiries address | OPEN |
| `{{EMAIL_ACCESSIBILITY}}` | Address for accessibility barrier reports (required by the `/accessibility` statement) | OPEN |
| `{{HOURS}}` | Opening hours, if the org has a physical space open to the public | OPEN |
| `{{SOCIAL_LINKS}}` | Facebook / Instagram / LinkedIn / YouTube URLs | OPEN |

## People

| Token | What it is | Status |
|---|---|---|
| `{{BOARD_MEMBERS}}` | Names, titles, bios, headshots, consent to publish | OPEN |
| `{{STAFF}}` | Same | OPEN |
| `{{FOUNDING_DATE}}` | Year founded | OPEN |

Photo consent is a separate item from the photo itself. Do not publish a headshot without written confirmation the person agreed.

## Organisation facts

| Token | What it is | Status |
|---|---|---|
| `{{MISSION_STATEMENT}}` | Official mission wording | OPEN |
| `{{MEMBER_COUNT}}` | Any membership number used in a stat row | OPEN |
| `{{PROGRAM_STATS}}` | Participant counts, hours served, etc. | OPEN |
| `{{PARTNERS}}` | Confirmed partner organisations + logo usage permission. ConnecTR is named in the brief but the relationship wording still needs client confirmation. | OPEN |

## Accounts and credentials

| Item | Status |
|---|---|
| Supabase project (URL, anon key, service role key) | OPEN |
| Resend account + verified sending domain for `harmonycircle.ca` | OPEN |
| Stripe account, live keys, Payment Links or Checkout configuration | OPEN |
| Cloudflare account + `harmonycircle.ca` DNS control | OPEN |
| Admin email addresses to seed into `user_roles` | OPEN |

## Policy documents

| Item | Status |
|---|---|
| Privacy policy text — must reflect what the forms actually collect and where it is stored (Supabase region) | OPEN |
| Accessibility statement wording — conformance claim and barrier-report process, needs client/legal sign-off | OPEN |
| Any donation refund policy required by Stripe | OPEN |
