# Linden DSL templates (Home-first)

These files are **drafts for `npx @framer/agent@latest apply-changes`**. They have not been applied: this package was written without a live Framer session.

## What is verified and what is not

Verified against the published `@framer/agent@0.0.46` package (CLI source and bundled API types):

- `apply-changes -s <session> -p <pagePath> -e "<dsl>"` is the command, and it calls `framer.agent.applyChanges(dsl, { pagePath })`.
- Statement form from Framer’s static recipes: `+<NodeType> <localName> parent="<id>";` then `SET <ref> attr=value attr=value;`.
- Attribute names are the plugin API node attributes: `name`, `layout`, `stackDirection`, `stackDistribution`, `stackAlignment`, `stackWrapEnabled`, `gap`, `padding`, `width`, `height`, `maxWidth`, `minHeight`, `aspectRatio`, `backgroundColor`, `backgroundImage`, `border`, `borderRadius`, `overflow`, `position`, `visible`, `link`, `inlineTextStyle`, `text`, `gridColumnCount`, `gridItemColumnSpan`, `componentIdentifier`, `controls`.

Not verifiable offline (the grammar file is generated per project at `session new`):

- How styles are referenced inside DSL (id vs path). Every reference goes through `formatStyleRef()` in `scripts/render-dsl.mjs`, so fixing it is a one-line change.
- Collection List, breakpoint override, component-variant and icon statements. These are written as `//` notes with exact values; translate them with the generated `prompt/updating-the-project.md`, `recipes.md` § Responsive breakpoints, and the **CMS Collection Lists**, **Buttons** and **Navigations** guides.
- Sibling ordering. New sections are created under the Desktop frame; move each one above the footer instance using the grammar’s ordering form.

## Rules for the builder

1. Read the generated `projects/<id>/index.md` task map first (Anything row + Pages + CMS + Components + Responsive).
2. Render one file: `node scripts/render-dsl.mjs 31_home_hero` (fails on any unresolved placeholder).
3. Apply one file at a time: `scripts/apply.sh dsl 31_home_hero`. Read back with `serialize` and screenshot before the next file.
4. Never type copy into a DSL file. Add it to `brand/copy.json`, run `npm run check`, then reference it with `{{copy:…}}`.
5. Lines starting with `//` are notes and are stripped before applying.

## Files, in order

| File | Builds |
|-|-|
| `21_buttons.dsl` | Button component variants restyled in place |
| `22_header.dsl` | Header (nav) + phone menu sheet |
| `23_footer.dsl` | Footer on Ink Raised |
| `31_home_hero.dsl` | Photo-led hero |
| `32_home_contact_sheet.dsl` | Signature section with the ContactSheet code component |
| `33_home_procedures.dsl` | Zone chips + six procedure cards |
| `34_home_surgeon.dsl` | Surgeon letter on Ink |
| `35_home_pricing.dsl` | Three starting-price facts on Mist |
| `36_home_notes.dsl` | Three patient notes |
| `37_home_faq.dsl` | FAQ accordion (Show on Home) |
| `38_home_consult.dsl` | Private consult CTA on Ink |
| `39_home_consult_strip.dsl` | Phone-only sticky consult strip |
