// 60 · Verify the live Home (read-only). Runs the same rules as `npm run check`, but on what is
// actually on the canvas: section order and bans, fonts, type sizes, copy punctuation, emojis,
// em dashes, straight quotes, ZoneMap on Home, and drift from brand/copy.json.
// Records the result in ids.json → verify. 95_publish_preview refuses to run unless this passed.

const homeId = PKG.ids.pages?.home
if (!homeId) throw new Error("ids.json has no pages.home; run 00_inventory first")

const attr = (node, key) => node?.[key] ?? node?.attributes?.[key] ?? node?.[`$${key}`]
const tree = await framer.agent.serialize({ id: homeId, depth: 40 })
const breakpoints = tree?.children ?? []
const problems = []
const warnings = []

const textOf = (node) => {
    if (typeof getInnerText === "function") {
        try {
            return getInnerText(node)
        } catch {}
    }
    return attr(node, "text") ?? attr(node, "content") ?? ""
}

for (const bp of breakpoints) {
    const bpName = attr(bp, "name") ?? bp.id
    const visibleSections = (bp.children ?? []).filter((n) => attr(n, "visible") !== false)
    const names = visibleSections.map((n) => attr(n, "name") ?? "")
    for (const p of checkHomeStructure(names)) problems.push(`[${bpName}] ${p}`)

    const texts = []
    const fonts = new Set()
    const sizes = new Set()
    const walk = (node, hidden) => {
        const isHidden = hidden || attr(node, "visible") === false
        if (node.type === "TextNode" && !isHidden) {
            const t = textOf(node).trim()
            if (t) texts.push(t)
            const f = attr(node, "font")?.family
            if (f) fonts.add(f)
            const s = attr(node, "fontSize")
            if (s) sizes.add(String(s))
        }
        if (node.type === "ComponentInstanceNode" && !isHidden) {
            const ident = String(attr(node, "componentIdentifier") ?? attr(node, "componentName") ?? "")
            if (/zone ?map/i.test(ident)) problems.push(`[${bpName}] ZoneMap instance is visible on Home`)
        }
        for (const child of node.children ?? []) walk(child, isHidden)
    }
    walk(bp, false)

    for (const f of fonts) if (!ALLOWED_FONTS.includes(f)) problems.push(`[${bpName}] font “${f}” is not Source Serif 4 or Outfit`)
    if (sizes.size > 5) warnings.push(`[${bpName}] ${sizes.size} distinct inline font sizes (${[...sizes].join(", ")}); use presets`)
    for (const t of texts) {
        for (const p of checkString(t, "raw")) problems.push(`[${bpName}] ${p} → “${t.slice(0, 80)}”`)
        if (/['"]/.test(t)) problems.push(`[${bpName}] straight quote → “${t.slice(0, 80)}”`)
        for (const term of BANNED_TERMS) if (new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, "i").test(t)) problems.push(`[${bpName}] banned term “${term}” → “${t.slice(0, 80)}”`)
        if (/^\s*0[1-9](\s|\.|$)/.test(t)) problems.push(`[${bpName}] numbered row label “${t}”`)
    }

    // Every Home string in brand/copy.json should be on the canvas, word for word.
    // Alt text and raw values (hrefs, anchors) are not visible text; Contact Sheet strings live in CMS.
    const expected = []
    const collect = (value, key) => {
        if (typeof value === "string") {
            const type = typeForKey(key)
            if (type && type !== "raw" && key !== "alt") expected.push(value)
        } else if (Array.isArray(value)) value.forEach((v) => collect(v, key))
        else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) collect(v, k)
    }
    for (const [key, section] of Object.entries(PKG.copy.home)) {
        if (key === "contactSheet") collect({ h2: section.h2, intro: section.intro })
        else collect(section)
    }
    const onCanvas = new Set(texts)
    const missing = expected.filter((s) => !onCanvas.has(s))
    if (missing.length) warnings.push(`[${bpName}] ${missing.length} Home string(s) from copy.json not found verbatim: ${missing.slice(0, 6).map((s) => `“${s}”`).join(", ")}`)
}

console.log(`Verify Home · ${problems.length ? "FAIL" : "PASS"} · ${breakpoints.length} breakpoint(s)`)
for (const p of problems) console.log(`  FAIL ${p}`)
for (const w of warnings) console.log(`  WARN ${w}`)
console.log("Not machine-checkable, do by eye: facet scores, focus/hover/pressed states, mobile menu, 404, form states, IC critique.")
patchIds({ verify: { passed: problems.length === 0, at: new Date().toISOString(), problems, warnings } })
