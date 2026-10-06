Run `npx @framer/agent@latest setup`, load the `framer` skill (and `framer-factory` if installed), then read `/home/box/framer/Personal/PlasticSurgeon/HANDOFF.md`, `PlasticSurgeon/DIRECTION.md` and `PlasticSurgeon/SPEC.md`.

You are the builder on the Framer box. Working directory: `/home/box/framer/Personal`. Template folder: `PlasticSurgeon/` (pulled from `JamshidTashpulatov/framer-templates`). Project id: `gRmO0VwmSky5joyYsfug` (Templates workspace). Title stays exactly **Plastic Surgeon**.

## Mission (this session)
Apply the **Interface Craft v3 package, Home first**, for direction **The Sitting / Linden**. The package (tokens, presets, Contact Sheet code component, CMS upserts, DSL drafts, verify gate) was written in the repo by a Cursor Cloud Agent without a live Framer session. Your job is to apply it, reconcile the DSL with the live grammar, and produce a production-ready Home Jamshid can react to. Then stop and report. Do not Marketplace submit. Preview-publish only when Home is coherent at Desktop / Tablet / Phone and the gates pass.

## Required reading (in order), full IC text knowledge, not a skim
1. `PlasticSurgeon/HANDOFF.md` (run order, manual fill-ins, anti-slop checklist)
2. `PlasticSurgeon/DIRECTION.md` (LOCKED: no A/B, no style widget, no asking Jamshid for styles). Obey §0a + facets + copy rules + release gate.
3. `PlasticSurgeon/SPEC.md` and `PlasticSurgeon/brand/voice.md`
4. `/workspace/interface-craft/library-notes/SYNTHESIS.md`, **the entire file**
5. `/workspace/interface-craft/library-notes/MEANS_METHODS_DEEP.md`
6. Design critique: `/workspace/interface-craft/skills/design-critique.md` (or `~/.agents/skills/interface-craft/design-critique.md`) + skim `library-notes/using-design-critique.md`
7. Working Knowledge: `noticing.md`, `conceptual-range.md`, `conceptual-depth.md`, `uncommon-care.md`, `facets-of-quality.md`, `less-but-better.md`; also `live-tuning.md`, `animations-as-proof-of-care.md`, `separation-of-concerns.md`, `industry-standards.md`, `recreate-everything.md`
8. Practical Demonstration: `refining-today.md`, `refining-presscut.md`, `redesigning-mobile-web-app.md`, `-part-2.md`, `-part-3.md`
9. After `session new`: the generated `projects/gRmO0VwmSky5joyYsfug/index.md` task map (Anything row, then Pages, CMS, Components, Responsive rows) and `project-inventory.md`
10. Optional: `PlasticSurgeon/ref/ui-sh/` polish (IC wins on conflict); [supahero.io](https://supahero.io/) hero ideas, structure only

### Honest knowledge gaps
About 11 articles are video-only intro stubs (not transcribed): using-dial-kit, using-dial-kit-timeline, showit, refining-generative-graphic, refining-dial-kit, interface-craft-gift-animation-deep-dive, compound-motion, interface-kit-critique / refinements / details (+ thin overview). Do not claim full video knowledge.

## Non-negotiables
- One Framer session (`scripts/apply.sh session`), reused for every step. Rebuild **in place**. No second project.
- Facets: Precise, Private, Editorial, Daylit, Steady. Score ≥ 4 on Precise + Private before publish.
- Signature: **Contact Sheet** only. ZoneMap stays off Home.
- Fonts: Source Serif 4 (H1 only) + Outfit. Palette per `brand/tokens.json`. Cool only. On Mist, secondary text uses the “Muted On Mist” presets.
- Bans: Swiss left-H1 + right index; trust strip; 01–06 rows; style widgets; em dashes; emojis; drag before/after; AI purple glows; mixed warm + cool neutrals; muddy huge-blur shadows.
- **Copy rules (Jamshid, standing):** headings consistent per page (Linden: periods); periods on full sentences, paragraphs and standalone descriptive text; no periods only on list items; never emojis. Controls and names carry no period. All copy comes from `brand/copy.json`; never type copy into Framer or DSL by hand. If copy must change, edit `copy.json`, run `npm run check`, re-render.
- Never auto-pick Contact Sheet frames: one sitter, one light, one backdrop, chosen by hand into `ids.json → imagePicks`.

## Build order (this session)
1. `cd PlasticSurgeon && npm ci && npm run verify` (must pass before touching Framer).
2. `scripts/apply.sh setup`, `scripts/apply.sh session`, `scripts/apply.sh sync-ref`.
3. `scripts/apply.sh home` (dry runs). Fill the manual ids from `project-inventory.md`. Reconcile `formatStyleRef()` and any DSL statement the generated grammar writes differently.
4. `scripts/apply.sh home --apply`. Read back with `serialize` and screenshot after each section.
5. Translate the `//` notes: Collection Lists (Cases featured, Procedures 6, Notes 3, FAQ Show on Home 5), breakpoint overrides (Tablet 810, Phone 390), button variants, icons, link presets, tabular figures, section order above the footer.
6. Live-tune the Contact Sheet spring in preview (0.30–0.40 s, bounce 0–0.15). Record final values in HANDOFF.
7. `scripts/apply.sh verify` until PASS. Shots to `shots/v3/` (home desktop full, hero, contact sheet, phone).
8. Four-lens IC critique in `logs/v3_ic_critique.md` with facet scores as `Precise: N` and `Private: N`, plus one remove-something pass. `scripts/apply.sh critique-done`.
9. `scripts/apply.sh publish-preview`. Record the preview URL in HANDOFF.
10. Stop. Prefer a clean Home handoff over starting the remaining pages.

## Finish report
Print: preview URL, facet scores, shots paths, ids changed (`scripts/ids.json` diff), DSL statements you had to change, open issues, and which IC release gate and anti-slop items are checked.
