// 00 · Inventory (read-only). Maps what v1 Mark-Up and v2 Solenne left in the project so every
// later step rebuilds in place instead of adding a second set of styles, sections or collections.
// Prelude provides: APPLY, PKG, patchIds, rule helpers.

const safe = async (label, fn) => {
    try {
        return await fn()
    } catch (error) {
        console.log(`WARN ${label}: ${error?.message ?? error}`)
        return null
    }
}
const attr = (node, key) => node?.[key] ?? node?.attributes?.[key] ?? node?.[`$${key}`]
const kids = (node) => node?.children ?? []

const COLLECTION_ALIASES = {
    procedures: /procedure|treatment|service/i,
    cases: /case|result|before|gallery/i,
    faq: /faq|question/i,
    notes: /note|testimonial|review|stor(y|ies)|quote/i,
    guides: /guide|blog|journal|article|post|insight/i,
}
const PAGE_KEYS = {
    "/": "home",
    "/procedures": "procedures",
    "/results": "results",
    "/surgeon": "surgeon",
    "/pricing": "pricing",
    "/guides": "guides",
    "/book": "book",
    "/imprint": "imprint",
    "/404": "notFound",
    "/styleguide": "styleguide",
}

const pages = (await safe("pages", () => framer.agent.getNodesOfTypes({ types: ["WebPageNode"] }))) ?? []
const pageMap = {}
for (const page of pages) {
    const p = attr(page, "path") ?? attr(page, "name")
    if (PAGE_KEYS[p]) pageMap[PAGE_KEYS[p]] = page.id
}
console.log(`Pages (${pages.length}):`, pages.map((p) => attr(p, "path") ?? attr(p, "name")).join(", "))
const missingPages = Object.entries(PAGE_KEYS).filter(([, key]) => !pageMap[key]).map(([p]) => p)
if (missingPages.length) console.log("Missing pages (create later, Home first):", missingPages.join(", "))

let homeSections = []
if (pageMap.home) {
    const tree = await safe("home tree", () => framer.agent.serialize({ id: pageMap.home, depth: 3 }))
    // A page holds one frame per breakpoint; sections are the children of the widest one.
    const breakpoints = kids(tree)
    const primary =
        breakpoints.find((b) => /desktop/i.test(attr(b, "name") ?? "")) ??
        breakpoints.slice().sort((a, b) => (parseFloat(attr(b, "width")) || 0) - (parseFloat(attr(a, "width")) || 0))[0]
    if (primary) pageMap.homeDesktop = primary.id
    homeSections = kids(primary).map((n) => ({ id: n.id, name: attr(n, "name") ?? n.type, type: n.type }))
    console.log(`Home sections on ${attr(primary, "name") ?? "primary breakpoint"} (${homeSections.length}):`)
    for (const s of homeSections) console.log(`  ${s.id}  ${s.name}`)
}

const colorStyles = (await safe("color styles", () => framer.getColorStyles())) ?? []
const textStyles = (await safe("text styles", () => framer.getTextStyles())) ?? []
const lindenColors = new Set([...Object.keys(PKG.tokens.color), ...Object.keys(PKG.tokens.alpha)])
const lindenText = new Set(Object.keys(PKG.tokens.textPresets))

const suggest = (styles, linden, hints) => {
    const claimed = new Set()
    const out = {}
    for (const hint of hints) {
        const re = new RegExp(hint.match, "i")
        const hit = styles.find((s) => !linden.has(s.name) && !claimed.has(s.id) && re.test(s.name))
        if (hit) {
            claimed.add(hit.id)
            out[hit.name] = hint.to
        }
    }
    return out
}
const colorSuggestions = suggest(colorStyles, lindenColors, PKG.tokens.legacyColorHints)
const textSuggestions = suggest(textStyles, lindenText, PKG.tokens.legacyTextHints)
console.log(`Colour styles (${colorStyles.length}):`, colorStyles.map((s) => s.name).join(", "))
console.log("Suggested legacy colour renames (review, then copy into ids.json → styles.legacyColorMap):", colorSuggestions)
console.log(`Text styles (${textStyles.length}):`, textStyles.map((s) => s.name).join(", "))
console.log("Suggested legacy text renames (review, then copy into ids.json → styles.legacyTextMap):", textSuggestions)

const banned = (name) => BANNED_FONTS.some((f) => new RegExp(`^${f}$`, "i").test(name ?? ""))
const fontsInUse = [...new Set(textStyles.map((s) => s.font?.family).filter(Boolean))]
console.log("Fonts in text styles:", fontsInUse.join(", ") || "(none)")
const bannedInUse = fontsInUse.filter(banned)
if (bannedInUse.length) console.log("BANNED fonts still in use (11_text_presets replaces them):", bannedInUse.join(", "))

const codeFiles = (await safe("code files", () => framer.getCodeFiles())) ?? []
const codeNames = codeFiles.map((f) => f.name ?? f.path)
console.log("Code files:", codeNames.join(", ") || "(none)")
const zoneMap = codeFiles.find((f) => /zone ?map/i.test(f.name ?? f.path ?? ""))
const contactSheet = codeFiles.find((f) => /contactsheet/i.test(f.name ?? f.path ?? ""))
if (zoneMap) console.log("ZoneMap code file exists. Keep it off Home; it is not a signature in v3.")

const collectionNodes = (await safe("collections", () => framer.agent.getNodesOfTypes({ types: ["CollectionNode"] }))) ?? []
const collections = {}
for (const [key, re] of Object.entries(COLLECTION_ALIASES)) {
    const hit = collectionNodes.find((c) => re.test(c.name ?? ""))
    if (!hit) {
        console.log(`Collection “${key}”: not found (40_cms will report what to create)`)
        continue
    }
    const fields = Object.fromEntries((hit.variables ?? []).map((v) => [v.name, { id: v.id, type: v.type }]))
    collections[key] = { id: hit.id, name: hit.name, itemCount: hit.$itemCount ?? null, fields }
    console.log(`Collection “${key}” → ${hit.name} (${hit.$itemCount ?? "?"} items): ${Object.keys(fields).join(", ")}`)
}

state.inventory = { pageMap, homeSections, colorSuggestions, textSuggestions, collections }

patchIds({
    pages: pageMap,
    homeLegacySections: homeSections,
    styles: {
        color: Object.fromEntries(colorStyles.filter((s) => lindenColors.has(s.name)).map((s) => [s.name, s.id])),
        text: Object.fromEntries(textStyles.filter((s) => lindenText.has(s.name)).map((s) => [s.name, s.id])),
        suggestedLegacyColorMap: colorSuggestions,
        suggestedLegacyTextMap: textSuggestions,
    },
    components: {
        zoneMap: zoneMap ? { codeFileId: zoneMap.id, name: zoneMap.name } : null,
        contactSheet: contactSheet ? { codeFileId: contactSheet.id, name: contactSheet.name } : null,
    },
    collections,
})
console.log("Inventory done. Read project-inventory.md for components (Button, Header, Footer) and add their ids to ids.json → components.")
