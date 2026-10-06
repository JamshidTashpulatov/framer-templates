# v3 spec critique (paper pass, before pixels)

Scope: a design-critique pass on `SPEC.md`, `brand/copy.json`, `brand/tokens.json` and `code/ContactSheet.tsx`, done while packaging. It is **not** the release-gate critique: that one must be run on real Home screenshots and written to `logs/v3_ic_critique.md`. No facet scores are claimed here.

## Context
A Home page for an independent plastic surgery clinic template. Visitors are considering elective surgery: private, anxious about cost and recovery, often browsing late at night and comparing clinics.

## First impressions
The structure is calm and has one idea a buyer can name: the contact sheet. The risk is that “calm” slides into the v2 default. What keeps it out is specificity: prices on every card, downtime ranges, week numerals, a surgeon who says “not yet”. If the photography is generic stock, the whole page reads as a spa template regardless of the copy.

## Visual design
- **Muted text on Mist failed contrast.** `Text/Muted` on Mist measured 4.3:1, under AA for body copy, and both Mist bands (Contact Sheet, Pricing) used it. This hides the recovery detail, the most important text on the page. Fixed: `Alpha/Ink 72` (5.4:1) for secondary text on Mist, enforced by the checker and a contrast test.
- **One serif moment.** Source Serif 4 appears once (H1). Section H2s in Outfit 500 keep the serif special instead of decorating every heading, which was the v2 tell.
- **Shadows.** One layered shadow on the whole Home (phone strip). Everything else is hairlines at 14% Ink. Correct for Daylit.

## Interface design
- **Focusing mechanism.** The hero photo is the entry point; the H1 sits low in the margin like a caption. The Contact Sheet stage is the second focal point. No section competes with these two.
- **Expectation setting.** Prices before the exam, “quoted in writing after the exam”, and downtime on every card answer the three questions patients carry in.
- **Missed opportunity, kept out on purpose.** A zone filter on Home would be a second interaction competing with the signature. Chips link to `/procedures` anchors instead.

## Consistency and conventions
- One button language (Ink pill, Ink-on-light outline), one link preset per band colour, one radius family (999 / 16 / 12, concentric with a 4px inset).
- Copy rules are typed per key and enforced, so headings cannot drift between periods and none within a page.

## User context
- The emotion to design for is **apprehensive**. The copy answers with control (camera-off, consent, written quotes) rather than reassurance words.
- Uncommon care already specified: per-frame and whole-case empty states, consent note on every case, phone-only consult strip that hides over the menu, a 404 that offers three next steps.

## Remove-something pass
Removed from the plan: a sticky desktop consult strip (the header pill already does this job), a hero intro animation longer than 400ms, and a fourth pricing fact.

## Top opportunities for the live pass
1. Pick a same-sitter, cool-light photo series for the four frames. This decides whether the signature is honest.
2. Tune the Contact Sheet spring live; the ring glide should feel like a grease pencil moving, not a UI highlight.
3. Check the hero at 810px: the 5-column margin note must not crush the H1 into four lines.
4. Run the four lenses on real shots and score Precise and Private before preview.
