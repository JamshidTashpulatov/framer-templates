#!/usr/bin/env node
// Local release-gate lint for the Linden package. Fails (exit 1) on any:
//   copy-rule violation in brand/copy.json and listing.md (Jamshid's punctuation rules, no emojis),
//   em dash, straight quote, banned term or banned font in shippable copy,
//   off-palette colour or banned font in code/, scripts/exec/, scripts/dsl/,
//   type scale above five sizes, or Contact Sheet defaults drifting from copy.json.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
    checkCopy,
    checkMarkdownCopy,
    checkString,
    findBannedFonts,
    findOffPaletteColors,
    paletteSet,
} from "./lib/rules.mjs"

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const read = (p) => fs.readFileSync(path.join(pkg, p), "utf8")
const list = (dir, ext) =>
    fs.existsSync(path.join(pkg, dir))
        ? fs.readdirSync(path.join(pkg, dir)).filter((f) => f.endsWith(ext)).map((f) => path.join(dir, f))
        : []

export function runChecks() {
    const problems = []
    const add = (where, items) => items.forEach((p) => problems.push(`${where}: ${p}`))

    const tokens = JSON.parse(read("brand/tokens.json"))
    const copy = JSON.parse(read("brand/copy.json"))
    const images = JSON.parse(read("brand/images.json"))

    add("brand/copy.json", checkCopy(copy))
    add("listing.md", checkMarkdownCopy(read("listing.md")))
    for (const [slot, spec] of Object.entries(images.slots)) {
        add(`brand/images.json ${slot}.alt`, checkString(spec.alt, "descriptor"))
    }

    const sizes = new Set(Object.values(tokens.typeSizes).map((s) => s.desktop[0]))
    if (sizes.size > 5) problems.push(`brand/tokens.json: ${sizes.size} type sizes, max 5`)
    for (const [name, preset] of Object.entries(tokens.textPresets)) {
        if (preset.font === "display" && !name.startsWith("Display/")) {
            problems.push(`brand/tokens.json: ${name} uses the display serif; reserve Source Serif 4 for H1`)
        }
        if (!tokens.color[preset.color] && !tokens.alpha[preset.color]) problems.push(`brand/tokens.json: ${name} colour ${preset.color} is not a token`)
    }
    for (const f of Object.values(tokens.fonts)) {
        if (!["Source Serif 4", "Outfit"].includes(f.family)) problems.push(`brand/tokens.json: font ${f.family} is not allowed`)
    }
    const temps = new Set([tokens.temperature])
    if (temps.size !== 1 || tokens.temperature !== "cool") problems.push("brand/tokens.json: neutral temperature must be cool")

    const palette = paletteSet(tokens)
    const shippable = [...list("code", ".tsx"), ...list("scripts/exec", ".js"), ...list("scripts/dsl", ".dsl")]
    for (const file of shippable) {
        const src = read(file)
        add(file, findOffPaletteColors(src, palette).map((c) => `off-palette colour ${c}`))
        add(file, findBannedFonts(src).map((f) => `banned font ${f}`))
        if (/[\u2014\u2015]/.test(src)) problems.push(`${file}: em dash`)
    }

    // Visible strings inside the Contact Sheet component follow the same copy rules.
    const sheet = read("code/ContactSheet.tsx")
    const featured = copy.cms.cases.find((c) => c.featured)
    const expectStrings = [featured.name, featured.meta, featured.note, copy.home.contactSheet.link, ...featured.frames.flatMap((f) => [f.week, f.caption, f.detail])]
    for (const s of expectStrings) {
        if (!sheet.includes(JSON.stringify(s))) problems.push(`code/ContactSheet.tsx: default “${s}” drifted from brand/copy.json`)
    }
    for (const s of ["No ${current.label} photo yet.", "Add Week 0, 1, 6 and 12 photos to this case in the Cases collection."]) {
        if (!sheet.includes(s)) problems.push(`code/ContactSheet.tsx: empty-state text “${s}” missing or changed`)
    }

    // Text/Muted is 4.3:1 on Mist (below AA). Mist bands must use the “Muted On Mist” presets.
    for (const file of list("scripts/dsl", ".dsl")) {
        const src = read(file)
        if (!/\{\{color:Surface\/Mist\}\}/.test(src)) continue
        for (const m of src.matchAll(/\{\{text:([^}]*Muted)\}\}/g)) problems.push(`${file}: ${m[1]} on a Mist band fails AA contrast; use “${m[1]} On Mist”`)
    }

    const dsl = list("scripts/dsl", ".dsl").map(read).join("\n")
    for (const m of dsl.matchAll(/text="([^"]*)"/g)) problems.push(`scripts/dsl: literal text “${m[1]}”; use {{copy:…}}`)

    return problems
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const problems = runChecks()
    if (problems.length) {
        console.error(`Linden package check: ${problems.length} problem(s)`)
        for (const p of problems) console.error(`  ${p}`)
        process.exit(1)
    }
    console.log("Linden package check: PASS (copy rules, no emojis, no em dashes, palette, fonts, type scale, DSL copy source)")
}
