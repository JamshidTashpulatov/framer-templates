// 11 · Text presets. Five sizes (H1, H2, Lead, Body, Label) × colour variants, three breakpoints.
// Source Serif 4 for Display/H1 only; Outfit for everything else. Same in-place rename logic as
// 10_color_tokens. Run 10 first so presets bind to colour styles instead of raw values.

const T = PKG.tokens
const BP = T.breakpoints
const existing = await framer.getTextStyles()
const colorStyles = await framer.getColorStyles()
const colorByName = Object.fromEntries(colorStyles.map((s) => [s.name, s]))
const explicit = { ...(PKG.ids.styles?.legacyTextMap ?? {}) }
const lindenNames = new Set(Object.keys(T.textPresets))
const claimed = new Set()

const fontCache = new Map()
const fontFor = async (key, weight) => {
    const family = T.fonts[key].family
    const cacheKey = `${family}@${weight}`
    if (!fontCache.has(cacheKey)) fontCache.set(cacheKey, await framer.getFont(family, { weight }))
    return fontCache.get(cacheKey)
}

const missingFonts = []
for (const preset of Object.values(T.textPresets)) {
    if (!(await fontFor(preset.font, preset.weight))) missingFonts.push(`${T.fonts[preset.font].family} ${preset.weight}`)
}
if (missingFonts.length) {
    console.log(`STOP: fonts not available in this project: ${[...new Set(missingFonts)].join(", ")}.`)
    console.log("Add Source Serif 4 and Outfit from Google Fonts in Framer, then re-run. Never substitute a banned font.")
    throw new Error("missing fonts")
}

const sizeAttrs = ([size, lineHeight, letterSpacing]) => ({
    fontSize: `${size}px`,
    lineHeight: `${lineHeight}em`,
    letterSpacing,
})

const attrsFor = async (name, preset) => {
    const sizes = T.typeSizes[preset.size]
    const colorName = preset.color
    return {
        name,
        tag: preset.tag,
        font: await fontFor(preset.font, preset.weight),
        color:
            colorByName[colorName] ??
            (T.alpha[colorName]
                ? hexToRgba(T.color[T.alpha[colorName].base].hex, T.alpha[colorName].opacity)
                : hexToRgba(T.color[colorName].hex, 1)),
        balance: Boolean(preset.balance),
        minWidth: BP.desktop,
        ...sizeAttrs(sizes.desktop),
        breakpoints: [
            { minWidth: BP.desktop, ...sizeAttrs(sizes.desktop) },
            { minWidth: BP.tablet, ...sizeAttrs(sizes.tablet) },
            { minWidth: BP.phone, ...sizeAttrs(sizes.phone) },
        ],
    }
}

const plan = []
for (const [name, preset] of Object.entries(T.textPresets)) {
    let style = existing.find((s) => s.name === name)
    let action = "update"
    if (!style) {
        const legacyName = Object.keys(explicit).find((k) => explicit[k] === name)
        style = legacyName ? existing.find((s) => s.name === legacyName && !claimed.has(s.id)) : undefined
        const hint = T.legacyTextHints.find((h) => h.to === name)
        if (!style && hint) {
            const re = new RegExp(hint.match, "i")
            style = existing.find((s) => !claimed.has(s.id) && !lindenNames.has(s.name) && re.test(s.name))
        }
        action = style ? "rename" : "create"
    }
    if (style) claimed.add(style.id)
    plan.push({ action, name, from: style?.name ?? null, style, preset })
}
const leftovers = existing.filter((s) => !claimed.has(s.id))

console.log(`Text presets · ${mode}`)
for (const step of plan) {
    const [d, , ] = T.typeSizes[step.preset.size].desktop
    const [p] = T.typeSizes[step.preset.size].phone
    const family = T.fonts[step.preset.font].family
    const from = step.action === "rename" ? ` (from “${step.from}”)` : ""
    console.log(`  ${step.action.padEnd(6)} ${step.name}${from}: ${family} ${step.preset.weight}, ${d}px → ${p}px, ${step.preset.color}`)
}
const sizes = new Set(Object.values(T.typeSizes).map((s) => s.desktop[0]))
console.log(`Distinct desktop sizes: ${[...sizes].join(", ")} (${sizes.size} of max 5)`)
if (sizes.size > 5) throw new Error("type scale exceeds five sizes")
if (leftovers.length) {
    console.log("Legacy text styles left untouched (rebind, then remove after 60_verify_home passes):")
    for (const s of leftovers) console.log(`  ${s.name}  ${s.font?.family ?? ""}`)
}
console.log("Manual in Framer (not in the plugin API): tabular figures on Text/Label and Heading/Fact; link presets:")
for (const [name, l] of Object.entries(T.linkPresets)) {
    console.log(`  ${name}: ${l.color}, hover ${l.hover}, ${l.decoration} offset ${l.offset} thickness ${l.thickness}`)
}

const ids = {}
if (APPLY) {
    for (const step of plan) {
        const attrs = await attrsFor(step.name, step.preset)
        if (step.action === "create") ids[step.name] = (await framer.createTextStyle(attrs)).id
        else ids[step.name] = (await step.style.setAttributes(attrs))?.id ?? step.style.id
    }
    patchIds({ styles: { text: ids } })
    console.log(`Applied ${plan.length} text preset(s).`)
}
state.textPlan = plan.map(({ style, ...rest }) => rest)
