# Linden voice and copy rules

Linden sounds like a careful surgeon writing a short note by hand: plain, specific, quiet, and honest about recovery. It never sells. It tells you what changes, what it costs, how long it takes, and when the answer is “not yet”.

## Voice

- **Specific over soothing.** “Stitches come out on day six.” beats “A gentle recovery journey.”
- **Private by default.** Mention camera-off, closed doors and consent where they help a decision, not as decoration.
- **Short sentences.** One idea each. Most lines under 20 words.
- **First person only in the surgeon letter.** Everywhere else, “we” for the practice and “you” for the patient.
- **No hype words.** Never “transform”, “elevate”, “unlock”, “world-class”, “cutting-edge”, “state-of-the-art”, “seamless”, “journey”, “glow-up”.
- **No theatre or mark-up metaphors** (v1), no spa calm (v2). The concept is a documented sitting: chair, light, angle, notes.
- **Numbers are exact.** Prices as “From $4,800”, ranges with an en dash (“7–10 days”), weeks as numerals (“week 6”).

## Punctuation rules (Jamshid, standing)

These apply to all PlasticSurgeon brand copy: Home, every page, the listing, SEO, alt text and CMS sample text. `npm run check` enforces them on `brand/copy.json` and `listing.md`; `scripts/apply.sh verify` checks the live Home.

| Copy type | Rule | Examples | Keys in `copy.json` |
|-|-|-|-|
| Headings | Periods or none, consistent within a page. **Linden: every heading ends with a period.** Question headings end with “?” | “A private sitting. A clear plan.” · “Patient notes.” | `h1`, `h2`, `heading`, `title` |
| Full sentences and paragraphs | Always end with a period | “We reply within one working day.” | `lead`, `body`, `intro`, `detail`, `answer`, `paragraphs`, `note`, `summary`, `suits`, `success`, `error`, `empty`, `*Helper`, `seoDescription` |
| Standalone descriptive text | Period, even when short | Taglines, subtitles, tier descriptions, captions (“Settled.”), card summaries, alt text | `tagline`, `description`, `caption`, `meta`, `alt` |
| List items | **No period** (the only place periods are omitted) | Pricing bullets, credential chips, footer hours, fact rows, “Camera off by default · Board-certified” | `items`, `chips`, `hours`, `proof`, `downtime`, `price`, `weeks`, `zone`, `*Options` |
| Quotes | Curly quotes, period inside | “The one I had was enough.” | `quote` |
| Questions | End with “?” | “Who sees my photos?” | `question` |
| Controls *(interpretation, Jamshid can veto)* | No period: nav links, buttons, filter chips, week tabs, form field labels | “Book a private consult” · “Week 6” · “Email or phone” | `nav`, `cta`, `link`, `button`, `submit`, `*Label`, `week` |
| Names *(interpretation)* | No period: procedure names on cards, people, the wordmark | “Upper eyelid lift” · “Maya R.” · “linden” | `name`, `person`, `wordmark` |

Always:

- **No emojis anywhere** in UI text, CMS, alt text, SEO or listing. “©” is fine as a text symbol.
- **No em dashes.** Use a comma, a period, or an en dash for ranges.
- **Real punctuation:** “ ” ‘ ’ … and the middle dot · for inline lists. No straight typewriter quotes in UI copy.
- **Sentence case** everywhere, including labels. No ALL-CAPS eyebrows.
- **No numbered 01–06 rows.**

## Adding copy

1. Add the string to `brand/copy.json` under a key whose name sets its type (table above). Unknown keys fail the check, so every string has a rule.
2. Run `npm run check`, then `npm run copy:md` to refresh `brand/copy.md`.
3. Reference it from DSL with `{{copy:path.to.key}}`. DSL files never contain literal copy.
