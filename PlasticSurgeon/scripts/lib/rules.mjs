// Linden copy + anti-slop rules. No imports: scripts/prelude.mjs inlines this file
// into Framer exec scripts by stripping `export`, so it must stay dependency-free.

export const BANNED_FONTS = [
  "Inter", "Inter Tight", "Inter Display", "Funnel", "Funnel Display", "Funnel Sans", "Young Serif",
  "Dela Gothic", "Dela Gothic One", "Newsreader", "Syne", "Figtree", "Instrument Serif", "Instrument Sans",
  "Lexend", "Rethink Sans", "Plus Jakarta", "Plus Jakarta Sans", "Atkinson Hyperlegible",
];

export const ALLOWED_FONTS = ["Source Serif 4", "Outfit"];

export const BANNED_TERMS = [
  "Theatre", "Suture", "Caliper", "Solenne", "Mark-Up", "Zone Map", "sage", "trust strip",
  "before/after slider", "drag to compare", "world-class", "cutting-edge", "state-of-the-art",
  "transform your", "unlock", "elevate your", "seamless",
];

export const KEY_TYPES = {
  heading: ["h1", "h2", "heading", "title"],
  sentence: [
    "lead", "body", "intro", "detail", "answer", "paragraphs", "note", "success", "error",
    "contactHelper", "messageHelper", "summary", "suits", "seoDescription", "empty",
  ],
  descriptor: ["tagline", "description", "caption", "meta", "alt"],
  quote: ["quote"],
  question: ["question"],
  list: ["items", "chips", "hours", "proof", "downtime", "price", "weeks", "zone", "interestOptions", "modeOptions"],
  control: [
    "nav", "cta", "ctaSecondary", "link", "links", "cardLink", "button", "buttonClose", "submit", "submitting",
    "label", "nameLabel", "contactLabel", "interestLabel", "modeLabel", "messageLabel", "consentLabel",
    "addressLabel", "hoursLabel", "downtimeLabel", "week",
  ],
  name: ["name", "wordmark", "person"],
  raw: [
    "$rules", "$schema", "address", "email", "phone", "phoneHref", "emailHref", "seoTitle", "pageTitlePattern",
    "navHrefs", "ctaHref", "ctaSecondaryHref", "linkHref", "linkHrefs", "chipHrefs", "anchor", "slug",
    "featured", "showOnHome",
  ],
};

const TYPE_BY_KEY = Object.fromEntries(
  Object.entries(KEY_TYPES).flatMap(([type, keys]) => keys.map((k) => [k, type])),
);

export function typeForKey(key) {
  return TYPE_BY_KEY[key] ?? null;
}

const EM_DASH = /[\u2014\u2015]|--/;
const STRAIGHT_QUOTES = /['"]/;
const NUMBERED_ROW = /^\s*0[1-9](\b|\s|\.)/;
const TEXT_PRESENTATION_OK = new Set(["\u00A9", "\u00AE", "\u2122"]);

export function findEmoji(text) {
  const hits = [];
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const isPicto = /\p{Extended_Pictographic}/u.test(ch);
    const isFlag = /\p{Regional_Indicator}/u.test(ch);
    const forcedEmoji = chars[i + 1] === "\uFE0F";
    if (isFlag || (isPicto && (!TEXT_PRESENTATION_OK.has(ch) || forcedEmoji))) hits.push(ch);
    if (ch === "\u20E3") hits.push("keycap");
  }
  return hits;
}

const ENDS_PUNCT = /[.?!]$/;
const ENDS_SENTENCE = /[.?!]”?$/;
const ENDS_PERIOD = /\.$/;

/** Checks one string against the house rules. Returns a list of problem strings. */
export function checkString(text, type, { allowStraightQuotes = false } = {}) {
  const problems = [];
  if (typeof text !== "string") return problems;
  if (EM_DASH.test(text)) problems.push("em dash or double hyphen");
  const emoji = findEmoji(text);
  if (emoji.length) problems.push(`emoji: ${emoji.join(" ")}`);
  if (type === "raw") return problems;

  if (!allowStraightQuotes && STRAIGHT_QUOTES.test(text)) problems.push("straight quote, use “ ” ’");
  if (NUMBERED_ROW.test(text)) problems.push("numbered 01–09 row label");
  for (const term of BANNED_TERMS) {
    const re = new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([^a-z]|$)`, "i");
    if (re.test(text)) problems.push(`banned term “${term}”`);
  }
  for (const font of BANNED_FONTS) {
    if (new RegExp(`\\b${font}\\b`).test(text)) problems.push(`banned font “${font}”`);
  }

  const trimmed = text.trim();
  switch (type) {
    case "sentence":
    case "descriptor":
      if (!ENDS_SENTENCE.test(trimmed)) problems.push(`${type} must end with a period`);
      break;
    case "quote":
      if (!/^“/.test(trimmed) || !/[.?!]”$/.test(trimmed)) problems.push("quote must be “…” with the period inside");
      break;
    case "question":
      if (!/\?$/.test(trimmed)) problems.push("question must end with ?");
      break;
    case "list":
    case "control":
    case "name":
            // Abbreviation periods are not sentence periods: “Dr.”, or an initial as in “Maya R.”.
            if (ENDS_PERIOD.test(trimmed) && !/\b(Dr|St|Mr|Ms|Mrs|[A-Z])\.$/.test(trimmed)) {
        problems.push(`${type} must not end with a period`);
      }
      break;
    default:
      break;
  }
  return problems;
}

function headingScope(path) {
  if (path[0] === "pages" || path[0] === "cms") return `${path[0]}.${path[1]}`;
  return path[0];
}

/**
 * Walks brand/copy.json. Every key must be classified. Headings must be consistent
 * within a page scope, and Linden's policy is that every heading ends with a period.
 */
export function checkCopy(copy, { headingPolicy = "period" } = {}) {
  const problems = [];
  const headingsByScope = {};

  const visit = (value, path, inheritedType) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => visit(v, [...path, i], inheritedType));
      return;
    }
    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        const t = typeForKey(k);
        const isContainer = v && typeof v === "object" && !(Array.isArray(v) && v.every((x) => typeof x === "string"));
        if (!t && !isContainer) problems.push(`${[...path, k].join(".")}: unclassified copy key “${k}”`);
        visit(v, [...path, k], t ?? (isContainer ? null : inheritedType));
      }
      return;
    }
    if (typeof value !== "string") return;
    const where = path.join(".");
    const type = inheritedType;
    if (!type) return;
    for (const p of checkString(value, type)) problems.push(`${where}: ${p} → “${value}”`);
    if (type === "heading") {
      const scope = headingScope(path);
      (headingsByScope[scope] ??= []).push({ where, punctuated: ENDS_PUNCT.test(value.trim()), value });
    }
  };
  visit(copy, [], null);

  for (const [scope, headings] of Object.entries(headingsByScope)) {
    const styles = new Set(headings.map((h) => h.punctuated));
    if (styles.size > 1) {
      problems.push(`${scope}: headings mix periods and no periods (${headings.map((h) => `“${h.value}”`).join(", ")})`);
    }
    if (headingPolicy === "period") {
      for (const h of headings) if (!h.punctuated) problems.push(`${h.where}: Linden headings end with a period → “${h.value}”`);
    }
  }
  return problems;
}

/** Markdown copy (listing.md): heading consistency, bullets without periods, paragraphs with periods. */
export function checkMarkdownCopy(markdown) {
  const problems = [];
  const headingStyles = [];
  let inCode = false;
  markdown.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd();
    const n = i + 1;
    if (line.startsWith("```")) { inCode = !inCode; return; }
    if (inCode || !line.trim() || line.startsWith("|") || line.startsWith("<!--") || /^-{3,}$/.test(line)) return;
    for (const p of checkString(line, "raw")) problems.push(`line ${n}: ${p}`);
    const textOnly = line.replace(/`[^`]*`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    if (/['"]/.test(textOnly.replace(/^[#>*\-\s]+/, ""))) problems.push(`line ${n}: straight quote, use “ ” ’`);
    if (/^#{1,6}\s/.test(line)) {
      if (n === 1) return;
      headingStyles.push({ n, punctuated: ENDS_PUNCT.test(line) });
      return;
    }
    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      if (/\.$/.test(textOnly.trim())) problems.push(`line ${n}: list item must not end with a period`);
      return;
    }
    if (!/[.?!:]$/.test(textOnly.trim())) problems.push(`line ${n}: sentence or descriptive line must end with a period`);
  });
  if (new Set(headingStyles.map((h) => h.punctuated)).size > 1) {
    problems.push(`headings mix periods and no periods (lines ${headingStyles.map((h) => h.n).join(", ")})`);
  }
  return problems;
}

/** Colour discipline: every hex / rgb triplet in shippable code must be a palette colour. */
export function paletteSet(tokens) {
  const set = new Set();
  for (const { hex } of Object.values(tokens.color)) {
    const h = hex.toUpperCase();
    set.add(h);
    set.add(hexToRgbTriplet(h));
  }
  return set;
}

export function hexToRgbTriplet(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function hexToRgba(hex, alpha = 1) {
  return `rgba(${hexToRgbTriplet(hex).split(",").join(", ")}, ${alpha})`;
}

/** WCAG contrast of a hex colour at `alpha`, composited over an opaque hex background. */
export function contrastRatio(fgHex, bgHex, alpha = 1) {
    const rgb = (h) => hexToRgbTriplet(h).split(",").map(Number)
    const bg = rgb(bgHex)
    const fg = rgb(fgHex).map((v, i) => v * alpha + bg[i] * (1 - alpha))
    const lum = (c) => {
        const [r, g, b] = c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
}

export function findOffPaletteColors(source, palette) {
  const hits = [];
  for (const m of source.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
    const raw = m[0].toUpperCase();
    const full = raw.length === 4 ? `#${raw.slice(1).split("").map((c) => c + c).join("")}` : raw;
    if (!palette.has(full)) hits.push(m[0]);
  }
  for (const m of source.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    const t = `${m[1]},${m[2]},${m[3]}`;
    if (!palette.has(t) && t !== "0,0,0") hits.push(m[0]);
  }
  return hits;
}

export function findBannedFonts(source) {
  return BANNED_FONTS.filter((f) => new RegExp(`["'\`]\\s*${f}\\s*["',\`]|family:\\s*["']?${f}\\b`).test(source));
}

/** Facet-agnostic structure bans applied to a list of section names on the live Home. */
export function checkHomeStructure(sectionNames) {
  const problems = [];
  const expected = ["Hero", "Contact Sheet", "Procedures", "Surgeon", "Pricing", "Notes", "FAQ", "Consult"];
  const lower = sectionNames.map((s) => s.toLowerCase());
  let last = -1;
  for (const name of expected) {
    const idx = lower.findIndex((s) => s.includes(name.toLowerCase()));
    if (idx === -1) problems.push(`missing section “${name}”`);
    else if (idx < last) problems.push(`section “${name}” is out of order`);
    else last = idx;
  }
  for (const s of lower) {
    if (/trust|logo ?wall|zone ?map|index|process|steps|theatre|suture/.test(s)) problems.push(`banned section “${s}”`);
  }
  return problems;
}
