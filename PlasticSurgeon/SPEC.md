# Plastic Surgeon v3 · SPEC (The Sitting / Linden)

Build spec for the Home-first rebuild on Framer project `gRmO0VwmSky5joyYsfug`, in place. Direction is locked in `DIRECTION.md`; this file says exactly what to build. Copy lives in `brand/copy.json`, tokens in `brand/tokens.json`, images in `brand/images.json`. Status: specified and packaged, **not applied** (no live Framer session in the authoring run).

## 1. Facets → where each one is earned

| Facet | Target | Earned by |
|-|-|-|
| Precise | 5 | From-prices on every card and the pricing band; downtime ranges with en dashes; week numerals in tabular figures; Oxide used only for links, active chips, the week ring and focus |
| Private | 5 | “Camera off by default” in the hero proof line, menu, FAQ, consult CTA and phone strip; consent note on every case; booking form asks for one contact method; no recording, no live counters |
| Editorial | 4 | Photo is the hero’s focal point; Source Serif 4 only on H1; one left edge per page; body measure ≤ 66ch; curly punctuation |
| Daylit | 4 | One cool neutral family (Day, Mist, White, Ink); hairlines instead of grey cards; one shadow on the whole Home (phone strip) |
| Steady | 4 | One signature (Contact Sheet); one spring (0.35 / 0.1) used everywhere; no scroll-jacking, parallax or marquee |

## 2. System summary

- **Type:** five sizes. H1 96/72/48 Source Serif 4 600. H2 48/40/32 Outfit 500. Lead 20/20/18. Body 17/17/16. Label 13. Card titles use Lead; prices use H2 size (`Heading/Fact`); the footer wordmark uses H1 size in Outfit 600.
- **Colour:** 12 palette tokens + 4 alpha tokens (`Alpha/Ink 10` hover fill, `Alpha/Ink 14` hairline, `Alpha/Ink 72` secondary text on Mist, `Alpha/On Ink 16` hairline on Ink). Cool only; alphas are Ink or On Ink at opacity, so they inherit the same tint.
- **Radius:** 999 (primary button, chips), 16 (cards, mats, stage), 12 (images inset 4px inside a 16 card). Concentric: inner = outer − inset.
- **Space:** 8pt rhythm. Sections 128 / 96 / 64 vertical, gutters 40 / 32 / 20, container 1200. Same-colour neighbours share one gap (Notes → FAQ).
- **Borders:** 1px `rgba(26, 34, 44, 0.14)` on light, `rgba(238, 241, 244, 0.16)` on Ink. Images get a 1px inset at 8%.
- **Motion:** spring `visualDuration 0.35, bounce 0.1`; hover 150ms; stagger 40ms; reduced motion jumps with no fades.
- **Icons:** Phosphor Light 20px, only List / X (menu) and Plus / Minus (FAQ).

## 3. Range before depth (≥5 structurally different concepts per key section)

Logged so the builder knows what was rejected and does not drift back. The pick is in bold.

**Hero**
1. **Print + margin note:** 7-col portrait, copy block set low in the 5-col margin like a caption beside a print. Photo is the focal point.
2. Full-bleed portrait with the H1 overlaid: rejected, text on faces reads as spa advertising and hurts contrast.
3. Centred serif statement with a photo below: rejected, headline-first is the v2 calm-clinic default.
4. Left H1 + right list of procedures: banned (Swiss index).
5. Contact sheet as the hero itself: rejected, it would make the signature the first thing to tune out; the hero should promise it, the next band delivers it.

**Nav**
1. **Flat Day bar: wordmark, five centred links, Ink pill.** Phone: Menu button + full-height Day sheet.
2. Left vertical rail: rejected, unconventional for an appointment business.
3. Floating glass pill: rejected, glass breaks the one-material rule.
4. Split nav with phone number centred: rejected, phone is in the consult band and footer already.
5. Hidden-until-scroll nav: rejected, buyers expect a visible booking action.

**Contact Sheet**
1. **Large stage print + 2×2 sheet of four prints + caption panel** (stacks to stage, 4-up strip, caption on phone).
2. Horizontal timeline with week nodes on a line: rejected, a line chart metaphor, colder than photographs.
3. Four equal frames in a row, caption below: rejected, frames too small to judge a result.
4. Scroll-driven sequence (scroll changes the week): rejected, scroll-jacking violates Steady.
5. Drag before/after slider: banned.

**Footer**
1. **Ink Raised with info columns and a giant `linden` wordmark on the bottom edge.**
2. Minimal one-line footer: rejected, clinics need address and hours visible.
3. Map embed footer: rejected, third-party map styling breaks the palette.
4. Newsletter-led footer: rejected, a surgery clinic is not a content business.
5. Footer as a second CTA band: rejected, the Consult band already does this job.

Hero ideas for future iterations can come from Jamshid’s optional hero library at [supahero.io](https://supahero.io/) (layout ideas only, never brand, copy or media). It was not a research pass for this package.

## 4. Home, section by section

Order is fixed and checked by `scripts/apply.sh verify`: Header → Hero → Contact Sheet → Procedures → Surgeon → Pricing → Notes → FAQ → Consult → Footer (+ phone-only Consult Strip). DSL for each section: `scripts/dsl/3x_*.dsl`.

### 4.1 Header (`22_header.dsl`)
- Day bar, 72px, 1px hairline bottom border. Wordmark `linden` (Outfit 500 Lead size), links Body, Ink pill “Private consult” (Small).
- States: link hover Oxide; current page Ink with 1px Oxide underline; focus ring 2px Day + 4px Oxide.
- Phone: Menu button (List icon + “Menu”), sheet with links at Lead size, full-width primary, note “Consults are camera-off by default.”, Close (X). Sheet opens with opacity + 8px y on the spring.

### 4.2 Hero (`31_home_hero.dsl`) · Day
- Desktop: 12-col grid, gap 32. Portrait cols 1–7, aspect 4:5, radius 16, inset hairline. Copy cols 8–12, 48px inset, bottom-aligned to the photo.
- Copy stack (gap 24): H1 “A private sitting. A clear plan.” → Lead (max 440px) → actions (primary “Book a private consult” → `/book`; Oxide link “See recovery weeks” → `#recovery`) → hairline → proof “Camera off by default · Board-certified” (Label Muted).
- Tablet: same grid, H1 72. Phone: photo full width, copy below, primary full width, link under it.
- Intro storyboard: 0ms photo, 120ms H1, 200ms lead, 260ms actions. Opacity + 8px y. Reduced motion: all visible at 0.

### 4.3 Contact Sheet (`32_home_contact_sheet.dsl`) · Mist · anchor `recovery`
- H2 “Recovery, week by week.” + intro (Body Muted, max 560px), gap 48 to the component.
- Collection List of Cases, `Featured = true`, limit 1, containing one `ContactSheet` instance at 100% width. Bindings in §5.

### 4.4 Procedures (`33_home_procedures.dsl`) · Day
- H2 “Procedures, plainly priced.” + intro. Zone chips (All, Eyes, Nose, Jaw, Breast, Body) link to `/procedures` anchors.
- Six cards from Procedures: White, radius 16, hairline, inset 4 → image radius 12 aspect 3:2 → body: zone (Label Muted), name (Card Title), facts “From $4,800 · Downtime 7–10 days” (Label, tabular), “Read the plan” (Link/Oxide). Whole card links to `/procedures/:slug`.
- States: hover border to 24% Ink + image scale 1.02; pressed 0.99; focus ring. Grid 3 / 2 / 1, gap 24, 40ms stagger.

### 4.5 Surgeon (`34_home_surgeon.dsl`) · Ink
- Portrait in a White mat (cols 1–5, inset 4). Letter (cols 7–12): H2 “A note from Dr. Osman.”, two first-person paragraphs, name, four credential chips (outline pills, no periods), “Meet Dr. Osman” (Link/On Ink).

### 4.6 Pricing (`35_home_pricing.dsl`) · Mist
- H2 “Starting prices, before the exam.” One scoreboard of three facts divided by hairlines (not three cards): Consult $250, Face from $4,800, Body from $5,200, each with a one-line description with a period. Written-quote note + “See full pricing”.

### 4.7 Notes (`36_home_notes.dsl`) · Day
- H2 “Patient notes.” Three quotes from Notes (Lead), hairline, meta row: person · zone chip · “Back at work in week N”. No stars, no avatars. Note “Shared with permission. Names are shortened.” Bottom padding 64 (shares the gap with FAQ).

### 4.8 FAQ (`37_home_faq.dsl`) · Day
- Top padding 0, hairline above. H2 “Questions before the consult.” + “Read the guides” in cols 1–4; accordion cols 6–12, FAQ where `Show on Home = true`, limit 5.
- FAQ Item variants Closed / Open / Hover. Whole row is the button; Enter / Space toggle; Plus / Minus icon; height + opacity on the spring.

### 4.9 Consult (`38_home_consult.dsl`) · Ink
- H2 “Camera off. Door closed.” + one sentence (Lead On Ink) + Primary On Ink “Book a private consult” + phone link + note “We reply within one working day.”

### 4.10 Footer (`23_footer.dsl`) · Ink Raised
- Visit / Hours / Contact / Nav columns, giant `linden` wordmark, © note. Imprint and Styleguide links last.

### 4.11 Consult Strip (`39_home_consult_strip.dsl`) · phone only
- Fixed bottom with 12px margins, White, radius 16, the only shadow on Home. “Consults most weekday mornings, camera off.” + small primary. Appears after the hero, hides over the menu, Consult band and footer. Static copy only.

## 5. Signature: Contact Sheet (`code/ContactSheet.tsx`)

- **Structure:** stage print (4:5, radius 16) | 2×2 sheet on a White mat (radius 16, inset 4, prints radius 12) + caption panel. Stacks below 760px container width: stage, 4-up strip, caption.
- **Interaction:** tabs pattern. Click, tap, ←/→/↑/↓, Home, End; roving tabindex; automatic activation; `aria-live="polite"` panel.
- **Motion:** stage crossfade uses `mix-blend-mode: plus-lighter` inside an isolated group, so brightness does not dip mid-fade. Selection ring is a shared layout element that glides between prints. Caption swaps with `popLayout` (opacity + 4px y). Press scale 0.98. One spring, live-tunable within 0.2–0.6s and bounce 0–0.3 (bounded so a buyer cannot make it ugly).
- **Reduced motion:** own `matchMedia` hook (Framer Motion’s global cache can miss changes); no presence animation, the frame and caption simply replace.
- **Care:** next images preloaded; per-frame empty state (“No Week 6 photo yet.”) and whole-case empty state pointing at the Cases collection; consent note always visible; thumbnails `alt=""` (decorative), stage carries the alt text.
- **CMS binding (Cases):** `caseName ← Name`, `caseMeta ← Meta`, `note ← Note`, `weekNImage ← Week N Image`, `weekNCaption ← Week N Caption`, `weekNDetail ← Week N Detail` for N = 0, 1, 6, 12; `link ← /results/:slug`.
- **Tested** (`tests/contact-sheet.test.tsx`): defaults equal the featured case in `copy.json`; tablist semantics; click and keyboard; both empty states; reduced motion; plus-lighter isolation; bounded controls.

## 6. Components and states

| Component | Variants / states |
|-|-|
| Button | Primary, Primary Hover, Primary Pressed, Primary Focus, Primary On Ink, Outline, Size Small. Labels have no period |
| Chip | Default, Hover (Alpha/Ink 10), Active (Oxide text) |
| Procedure Card | Default, Hover, Pressed, Focus |
| FAQ Item | Closed, Open, Hover, Focus |
| Header | Desktop, Tablet, Phone closed, Phone menu open |
| Booking form (`/book`) | Idle, Field focus, Field error (“Please add an email or phone number so we can reply.”), Submitting (“Sending…”), Success (“Thank you. We will reply within one working day from hello@linden.example.”) |
| 404 | “This page is out of frame.” + three breadcrumb links (Procedures, Results, Book a private consult) |
| Results empty | “No cases in this zone yet. Ask about it at your consult.” |

## 7. CMS schema (keep existing collections; `40_cms` adds fields)

| Collection | Fields |
|-|-|
| Cases | Name, Slug, Zone, Featured (bool), Meta, Note, Week 0/1/6/12 Image, Caption, Detail |
| Procedures | Name, Slug, Zone, Price, Downtime, Summary, Suits, Image |
| FAQ | Question, Answer, Show on Home (bool) |
| Notes | Quote, Person, Zone, Weeks |
| Guides | Title, Slug, Summary |

Legacy v1/v2 items are listed by `40_cms`, never deleted; rewrite or draft them before publish.

## 8. Other pages (after Home)

Same IA as DIRECTION §6. Page titles and leads are in `copy.json → pages`. Every page uses Display/H1 once, then Outfit. SEO titles follow `<Page> | Plastic Surgeon Framer Template`.

## 9. Industry bar

Compare on the box against Medix, Solace Clinic and AETHERIA before the gate (not viewed in the authoring run). Intended differences to confirm: a named recovery signature instead of a before/after slider; from-prices and downtime on every card; camera-off privacy as a booking option; one serif moment per page instead of serif everywhere; cool daylight instead of beige spa.

## 10. Accessibility

Contrast (computed, WCAG 2): Ink on Day 14.2:1 · Muted on Day 5.1:1 · Muted on White 5.8:1 · Oxide on Day 5.4:1 · Oxide on Mist 4.5:1 · On Ink on Ink 14.2:1 · On Ink Muted on Ink 7.5:1 · On Ink Muted on Ink Raised 5.9:1.

**Mist rule:** `Text/Muted` on Mist is only 4.3:1, below AA. Mist bands (Contact Sheet, Pricing) use `Text/Body Muted On Mist` / `Text/Label Muted On Mist`, coloured `Alpha/Ink 72` (5.4:1, same cool tint). The Contact Sheet component uses the same value for its secondary text. `npm run check` and `tests/rules.test.mjs` fail on any muted preset on Mist or any Home text pair under 4.5:1.

Focus rings on every interactive element. Tabs, accordion and menu are keyboard-operable. Reduced motion respected everywhere.
