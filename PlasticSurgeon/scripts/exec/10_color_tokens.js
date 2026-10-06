// 10 · Colour tokens. Upserts the Linden palette as colour styles, in place.
// Order of preference per token: existing style with the Linden name → explicit legacy map
// (ids.json → styles.legacyColorMap) → hint match on a v1/v2 style → create new.
// Renaming a legacy style keeps every existing binding, so old sections flip to Linden colours
// instead of keeping orphaned Theatre / Suture / sage fills. Nothing is ever deleted here.

const norm = (c) => String(c ?? "").replace(/\s+/g, "").toLowerCase()
const existing = await framer.getColorStyles()
const explicit = { ...(PKG.ids.styles?.legacyColorMap ?? {}) }
const lindenNames = new Set([...Object.keys(PKG.tokens.color), ...Object.keys(PKG.tokens.alpha)])
const claimed = new Set()
const hintFor = (name) => PKG.tokens.legacyColorHints.find((h) => h.to === name)

const targets = [
    ...Object.entries(PKG.tokens.color).map(([name, t]) => ({ name, light: hexToRgba(t.hex, 1) })),
    ...Object.entries(PKG.tokens.alpha).map(([name, t]) => ({
        name,
        light: hexToRgba(PKG.tokens.color[t.base].hex, t.opacity),
    })),
]

const plan = []
for (const { name, light } of targets) {
    let style = existing.find((s) => s.name === name)
    let action = "update"
    if (!style) {
        const legacyName = Object.keys(explicit).find((k) => explicit[k] === name)
        style = legacyName ? existing.find((s) => s.name === legacyName && !claimed.has(s.id)) : undefined
        if (!style && hintFor(name)) {
            const re = new RegExp(hintFor(name).match, "i")
            style = existing.find((s) => !claimed.has(s.id) && !lindenNames.has(s.name) && re.test(s.name))
        }
        action = style ? "rename" : "create"
    }
    if (style) claimed.add(style.id)
    const unchanged = action === "update" && norm(style.light) === norm(light)
    plan.push({ action: unchanged ? "keep" : action, name, from: style?.name ?? null, style, light })
}
const leftovers = existing.filter((s) => !claimed.has(s.id))

console.log(`Colour tokens · ${mode}`)
for (const step of plan) {
    const from = step.action === "rename" ? ` (from “${step.from}”)` : ""
    console.log(`  ${step.action.padEnd(6)} ${step.name}${from} → ${step.light}`)
}
if (leftovers.length) {
    console.log("Legacy colour styles left untouched (remove only after 60_verify_home passes):")
    for (const s of leftovers) console.log(`  ${s.name}  ${s.light}`)
}

const ids = {}
if (APPLY) {
    for (const step of plan) {
        if (step.action === "keep") ids[step.name] = step.style.id
        else if (step.action === "update") ids[step.name] = (await step.style.setAttributes({ light: step.light }))?.id ?? step.style.id
        else if (step.action === "rename")
            ids[step.name] = (await step.style.setAttributes({ name: step.name, light: step.light }))?.id ?? step.style.id
        else ids[step.name] = (await framer.createColorStyle({ name: step.name, light: step.light })).id
    }
    patchIds({ styles: { color: ids } })
    console.log(`Applied ${plan.filter((s) => s.action !== "keep").length} colour change(s).`)
}
state.colorPlan = plan.map(({ style, ...rest }) => rest)
