# Plastic Surgeon handoff

Status: **v3 package ready to apply** (2026-10-07 Asia/Tashkent). Nothing has been applied to Framer and nothing is published. The package was written by a Cursor Cloud Agent (Claude Opus) on Jamshid’s order, without a live Framer session.
Jamshid approved the redesign with **Interface Craft** craft (no AI slop). No A/B styles. No style widget.
Locked direction: **The Sitting / Linden**, in `DIRECTION.md`.
Marketplace NOT submitted. Do not publish without explicit OK (preview publish for reaction is OK once Home passes `verify` and the IC critique).

---

## Next box command

On the Framer box, from `/home/box/framer/Personal` after pulling `JamshidTashpulatov/framer-templates` → `PlasticSurgeon/`:

```bash
cd PlasticSurgeon && npm ci && npm run verify          # local gate: copy rules, bans, palette, 34 tests
scripts/apply.sh setup                                 # npx @framer/agent@latest setup (once)
scripts/apply.sh session                               # session new gRmO0VwmSky5joyYsfug
scripts/apply.sh sync-ref                              # overwrite ref/DIRECTION.md with v3 if present
scripts/apply.sh home                                  # Home-first sequence, dry runs, pauses after each step
scripts/apply.sh home --apply                          # same sequence, writing, after reviewing the dry runs
```

Builder: Claude Code (or any agent with the `framer` skill) using `logs/v3_ic_prompt_home.md` as the session prompt. The orchestrator does not run Framer CLI directly.

## What `home` does, in order

| Step | Kind | Effect |
|-|-|-|
| `check-package` | local | Fails on any copy-rule, emoji, em dash, banned font/term, off-palette colour or contrast problem |
| `00_inventory` | read | Pages, Home sections, colour/text styles, code files, collections → `scripts/ids.json` |
| `10_color_tokens` | write | Linden palette as colour styles. Renames v1/v2 styles in place (Theatre → Brand/Ink, Suture → Accent/Oxide…) so bindings flip; never deletes |
| `11_text_presets` | write | 18 presets, 5 sizes, 3 breakpoints. Stops if Source Serif 4 or Outfit is missing |
| `20_contact_sheet` | write | `ContactSheet.tsx` code component, type-checked in Framer first |
| `30_images` | write | Stock photos with alt text. Case frames are never auto-picked |
| `40_cms` | write | Adds missing fields, upserts Linden items by slug; lists legacy items |
| `21–23` DSL | write | Buttons, header, footer restyled in place |
| `50_home_hide_legacy` | write | Hides (not deletes) v1/v2 Home sections |
| `31–39` DSL | write | Home sections in locked order |
| `60_verify_home` | read | Section order and bans, fonts, copy rules, emojis, ZoneMap, copy drift → `ids.json → verify` |

Then by hand: screenshots to `shots/v3/` (home desktop full, hero, contact sheet, phone), `logs/v3_ic_critique.md` (four lenses + facet scores), `scripts/apply.sh critique-done` (needs Precise ≥ 4 and Private ≥ 4), `scripts/apply.sh publish-preview` (type PREVIEW). Record the preview URL here and in Notion.

## Manual fill-ins the scripts cannot guess

1. `ids.json → components.button` (`identifier`, `labelControl`, `variants.*`, `labels.*`), `components.header.*`, `components.footer.*`: node ids from the generated `project-inventory.md`.
2. `ids.json → imagePicks`: four Contact Sheet frames of **one sitter, one light, one backdrop** (`case.upper-eyelid-lift-52.week0/1/6/12`). `30_images` lists candidates and never auto-picks these.
3. Review `ids.json → styles.suggestedLegacyColorMap` / `suggestedLegacyTextMap` from the inventory; copy any corrections into `legacyColorMap` / `legacyTextMap` before `--apply`.
4. DSL grammar reconcile: read the generated `prompt/updating-the-project.md`. If styles are referenced by path, change `formatStyleRef()` in `scripts/render-dsl.mjs` (one function). Collection List, breakpoint override, variant and icon steps are `//` notes with exact values; translate them per the generated guides.
5. Tabular figures on `Text/Label` and `Heading/Fact`, and the two link presets: set in Framer’s UI (not exposed in the plugin API). Confirm Outfit has `tnum`; if not, give week labels and prices fixed-width boxes.

## Anti-slop checklist (SYNTHESIS §1 + house bans)

Tick on the live Home before asking Jamshid. “Auto” means `npm run check` or `scripts/apply.sh verify` fails on it; “Eye” means it needs a screenshot pass.

- [ ] No AI purple/indigo gradients, no glow blobs (Auto: palette lint allows only Linden colours in code and DSL)
- [ ] No unintentional background colour on every block; each band colour has a job (Eye: Day, Mist, Ink, Ink Raised only, in the DIRECTION rhythm)
- [ ] Neutral temperature consistent: cool only, no warm greys or beige (Auto: tokens `temperature: cool`, palette lint)
- [ ] No muddy, huge-blur, single-layer shadows; layered shadow only on the phone consult strip (Eye)
- [ ] No mixed icon styles: Phosphor Light 20px, four icons total (Eye)
- [ ] No redundant subtitles or eyebrow + heading + subheading stacks; no stat cards that should be one scoreboard (Eye: pricing is one hairline-divided row)
- [ ] Display serif only on H1, never every heading (Auto: one `Display/*` reference on Home; presets lint)
- [ ] Real punctuation: curly quotes and apostrophes, en dash ranges, no straight quotes (Auto)
- [ ] Something is a card only if it is independently clickable; siblings share one container (Eye: only procedure cards)
- [ ] Four-lens self-critique written as observation → impact → fix, plus one remove-something pass (`logs/v3_ic_critique.md`)
- [ ] No Swiss left-H1 + right index, no trust strip, no 01–06 rows (Auto: section names and text)
- [ ] No style widgets, live clocks, fake counters or “slots left” (Eye + Auto on banned section names)
- [ ] No drag before/after (Auto: banned terms; Eye)
- [ ] No em dashes, no emojis anywhere (Auto)
- [ ] Fonts only Source Serif 4 + Outfit (Auto: `verify` reads every text node’s font)
- [ ] Contrast ≥ 4.5:1 for every text pair; Mist bands use the “On Mist” presets (Auto)
- [ ] Copy rules: headings end with periods on every page, periods on sentences and descriptive text, none on list items (Auto on `copy.json`; `verify` checks the live text matches it)

## IC release gate

Follow SYNTHESIS §7 and DIRECTION §7 before marking Review or asking Jamshid. Facet scores ≥ 4 on Precise and Private; `95_publish_preview` refuses to run without a passed `verify` and a recorded critique.

## Interface Craft knowledge (for builders)

Must read before the Home build (paths under `/workspace/interface-craft/`): SYNTHESIS.md (full), MEANS_METHODS_DEEP.md, skills/design-critique.md, Working Knowledge notes (noticing, conceptual-range/depth, uncommon-care, facets-of-quality, less-but-better, + live-tuning / proof-of-care / separation / industry-standards / recreate), Practical Demonstration (`refining-today`, `refining-presscut`, `redesigning-mobile-web-app*`). See DIRECTION §0a.
**Gap:** about 11 video-only articles are intro-only (not transcribed). Do not claim full video knowledge; apply text + SYNTHESIS + skills markdown.

Hero ideas (optional): [supahero.io](https://supahero.io/) is Jamshid’s approved hero-section idea library. Use it for structure only, never brand, copy or media. Not a required pass; the Home hero is locked in SPEC §3.

## Direction (locked; do not ask Jamshid to pick styles)

- Concept: **The Sitting**
- Demo brand: **Linden** (wordmark `linden`)
- Facets: Precise · Private · Editorial · Daylit · Steady
- Fonts: **Source Serif 4** (H1 only) + **Outfit** (everything else)
- Palette: Day `#EEF1F4` / Mist `#D8DEE5` / Ink `#1A222C` / Oxide `#4A6670` (cool only)
- Signature: **Contact Sheet** (Week 0/1/6/12), only one
- Copy rules: Jamshid’s standing punctuation rules, `brand/voice.md`
- Archives on the box: `ref/DIRECTION_v1_markup_REJECTED.md`, `ref/DIRECTION_v2_solenne_STOPPED.md`

## Hard bans (every session)

- Swiss index hero, trust strip, 01–06 rows, style widgets
- Banned fonts and palettes listed in DIRECTION.md (incl. Solenne Instrument + Inter + sage and Caliper Theatre / Suture / Syne)
- Zone Map as brand hero (an existing ZoneMap.tsx may stay in code, unused; `verify` fails if it is visible on Home)
- Em dashes, emojis, drag before/after, Marketplace submit

## Open issues and unknowns

- The DSL drafts follow the only grammar form visible offline (`+Type name parent=…; SET ref attr=…;` from Framer’s recipes) and real plugin attribute names. They have not run against Framer. Expect to reconcile style references, Collection Lists, breakpoint overrides and sibling order on the first apply.
- `Collection.addFields`, `CodeFile.setFileContent` and `framer.agent.publish` signatures were not visible offline; the scripts check for the methods and stop with a `docs` hint if they differ.
- Industry bar (Medix, Solace Clinic, AETHERIA) was not viewed in the authoring run; compare on the box (SPEC §9).
- Contact Sheet photos need a hand-picked same-sitter series; until then the component shows its empty state.

## Notion (orchestrator MCP)

- Status: Building
- Notion id: `3eea2927-1503-819d-8372-c51e5bcc6990`
- Project Link: https://framer.com/projects/Plastic-Surgeon--gRmO0VwmSky5joyYsfug
- Project ID: `gRmO0VwmSky5joyYsfug`
- Preview Link: (pending Home apply + preview publish)
- Last Update: 2026-10-07
- Planned domain: plastic-surgeon.framer.wiki
- SEO root: Plastic Surgeon | Free Plastic Surgeon Website Template

## Framer live project

- Project ID: `gRmO0VwmSky5joyYsfug` · Workspace: Templates · Title stays **Plastic Surgeon**
- Pretty URL: https://framer.com/projects/Plastic-Surgeon--gRmO0VwmSky5joyYsfug
- Prior v1 Mark-Up build is still live in the project; v2 Solenne token rename was partial (`logs/v2_s01_system.txt`, `logs/v2_s02_chrome.txt` on the box) then stopped. v3 rebuilds in place.

## Still not done (v3)

- [ ] Apply tokens, presets, buttons, header, footer (`scripts/apply.sh home --apply`)
- [ ] Home sections live (photo hero → Contact Sheet → procedures → surgeon → pricing → notes → FAQ → consult)
- [ ] `verify` PASS, shots in `shots/v3/`
- [ ] `logs/v3_ic_critique.md` + facet scores, `critique-done`
- [ ] Preview publish, URL recorded here and in Notion
- [ ] Remaining pages restyle
- [ ] Notion → Review only after the gate

## Build path history

- v1 Mark-Up / Caliper: rejected (whole vibe).
- v2 Studio Quiet / Solenne: stopped as AI-slop before Home was reactable.
- v3 The Sitting / Linden: Claude Fable 02:50 queue cancelled; Cursor Cloud Agent wrote this package (2026-10-07). Next: box apply.

## Leave alone

Translation, Speech Therapist, Hearing, Locksmith, Dog Trainer, FamilyLawyer, Orthodontist, BridalShop, Planning-only rows.
