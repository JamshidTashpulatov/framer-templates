# Plastic Surgeon v3 · The Sitting / Linden

Factory package for the **Plastic Surgeon** Framer template (project `gRmO0VwmSky5joyYsfug`). Direction v3 **The Sitting**, demo brand **Linden**: photo-led, private, editorial, daylit, with one signature, the Week 0 / 1 / 6 / 12 **Contact Sheet**. Supersedes v1 Mark-Up / Caliper (rejected) and v2 Studio Quiet / Solenne (stopped).

Status: ready for the box to apply with `npx @framer/agent`. Not applied, not published.

| File | What it is |
|-|-|
| `DIRECTION.md` | Locked direction, facets, palette, type, copy rules, signature, Home order, IC release gate |
| `SPEC.md` | Section-by-section Home build spec, Contact Sheet spec, states, CMS schema, contrast |
| `HANDOFF.md` | Next box command, run order, manual fill-ins, anti-slop checklist, open issues, Notion fields |
| `listing.md` | Template listing copy for plastic-surgeon.framer.wiki (not Marketplace) |
| `brand/voice.md` | Voice and Jamshid’s punctuation rules |
| `brand/copy.json` | Every UI string, typed by copy rule (single source) |
| `brand/copy.md` | Generated readable view of the copy |
| `brand/tokens.json` | Colour, type, radius, space, shadow, motion tokens |
| `brand/images.json` | Photo slots, queries and alt text |
| `code/ContactSheet.tsx` | The signature code component |
| `scripts/` | Apply runner, exec scripts, DSL drafts, lint (see `scripts/README.md`) |
| `logs/v3_ic_prompt_home.md` | Session prompt for the builder on the box |
| `logs/v3_spec_critique.md` | Paper critique of the spec (not the release-gate critique) |
| `tests/` | Contact Sheet, copy rules, contrast, DSL render and exec-script tests |

```bash
npm ci
npm run verify            # lint + typecheck + tests
scripts/apply.sh help     # box runner
```
