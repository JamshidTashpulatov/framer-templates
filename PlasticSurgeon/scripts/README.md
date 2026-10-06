# Scripts

Factory tooling for applying Linden to Framer project `gRmO0VwmSky5joyYsfug` with `npx @framer/agent`. Start with `apply.sh help`.

| Path | Role |
|-|-|
| `apply.sh` | Runner on the box: setup, session, steps, DSL, verify, critique gate, preview publish |
| `prelude.mjs` | Inlines `brand/*.json`, `ids.json`, `code/ContactSheet.tsx` and `lib/rules.mjs` into each exec script (the Framer exec sandbox has no `process.env` and limited `fs`) |
| `exec/*.js` | Framer exec scripts. Dry run unless `--apply`. Print `IDS_PATCH {json}` lines |
| `merge-ids.mjs` | Merges `IDS_PATCH` lines into `ids.json` |
| `ids.json` | Project ids discovered or created on the box (pages, styles, components, collections, images, verify, preview) |
| `dsl/*.dsl` | Home-first DSL drafts with `{{copy:…}}`, `{{color:…}}`, `{{text:…}}`, `{{id:…}}` placeholders. See `dsl/README.md` |
| `render-dsl.mjs` | Renders a DSL template; fails on unresolved placeholders |
| `check-package.mjs` | Local release-gate lint (`npm run check`) |
| `build-copy-md.mjs` | Regenerates `brand/copy.md` from `brand/copy.json` |
| `lib/rules.mjs` | Copy rules, anti-slop bans, palette, contrast and Home-structure checks, shared by the local lint and the live verify |

Exec steps: `00_inventory` (read) → `10_color_tokens` → `11_text_presets` → `20_contact_sheet` → `30_images` → `40_cms` → `50_home_hide_legacy` → `60_verify_home` (read) → `95_publish_preview` (gated).

Local verification: `npm run verify` runs the lint, the TypeScript check and 34 tests, including every exec script against a mock `framer` with v1/v2 leftovers.
