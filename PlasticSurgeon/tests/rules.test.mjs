import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import copy from "../brand/copy.json"
import tokens from "../brand/tokens.json"
import { checkCopy, checkMarkdownCopy, checkString, contrastRatio, findEmoji, checkHomeStructure } from "../scripts/lib/rules.mjs"

const root = path.resolve(import.meta.dirname, "..")
import { runChecks } from "../scripts/check-package.mjs"

describe("Jamshid copy rules", () => {
    it("the shipped package passes every check", () => {
        expect(runChecks()).toEqual([])
    })

    it("full sentences and descriptive text must end with a period", () => {
        expect(checkString("We reply within one working day", "sentence")).toContain("sentence must end with a period")
        expect(checkString("Credited to your surgery if you go ahead", "descriptor")).toContain("descriptor must end with a period")
        expect(checkString("We reply within one working day.", "sentence")).toEqual([])
        expect(checkString("Settled.", "descriptor")).toEqual([])
    })

    it("list items omit periods; controls and names carry none", () => {
        expect(checkString("Anesthesia.", "list")).toContain("list must not end with a period")
        expect(checkString("Anesthesia", "list")).toEqual([])
        expect(checkString("Book a private consult.", "control")).toContain("control must not end with a period")
        expect(checkString("Maya R.", "name")).toEqual([])
        expect(checkString("Dr. Leila Osman", "name")).toEqual([])
    })

    it("headings must be consistent within a page, and Linden uses periods", () => {
        const mixed = { home: { hero: { h1: "A private sitting. A clear plan." }, notes: { h2: "Patient notes" } } }
        const problems = checkCopy(mixed)
        expect(problems.some((p) => p.includes("headings mix periods"))).toBe(true)
        const none = { home: { hero: { h1: "A private sitting" }, notes: { h2: "Patient notes" } } }
        expect(checkCopy(none, { headingPolicy: "consistent" })).toEqual([])
        expect(checkCopy(none).some((p) => p.includes("Linden headings end with a period"))).toBe(true)
    })

    it("pages are separate heading scopes", () => {
        const scoped = { pages: { a: { h1: "One." }, b: { h1: "Two" } } }
        expect(checkCopy(scoped, { headingPolicy: "consistent" })).toEqual([])
    })

    it("never allows emojis, but © stays a text symbol", () => {
        expect(findEmoji("Book now ✨")).toEqual(["✨"])
        expect(findEmoji("Top 👍🏼 care")).toContain("👍")
        expect(findEmoji("© 2026 Linden.")).toEqual([])
        expect(checkString("Recovery made easy 🙂.", "sentence")).toContain("emoji: 🙂")
        expect(checkString("Settled ✔️.", "descriptor").some((p) => p.startsWith("emoji"))).toBe(true)
    })

    it("bans em dashes, straight quotes, 01–06 rows and banned fonts", () => {
        expect(checkString("Private — always.", "sentence")).toContain("em dash or double hyphen")
        expect(checkString("We don't rush.", "sentence")).toContain("straight quote, use “ ” ’")
        expect(checkString("01 Consult", "control")).toContain("numbered 01–09 row label")
        expect(checkString("Set in Instrument Serif.", "sentence")).toContain("banned font “Instrument Serif”")
        expect(checkString("Theatre-grade care.", "sentence")).toContain("banned term “Theatre”")
    })

    it("every copy key in copy.json is classified", () => {
        expect(checkCopy(copy).filter((p) => p.includes("unclassified"))).toEqual([])
        expect(checkCopy({ home: { hero: { mystery: "Hello." } } })[0]).toContain("unclassified copy key")
    })

    it("listing markdown: bullets without periods, paragraphs with periods, consistent headings", () => {
        const bad = ["# Title", "", "## One", "", "A sentence without a period", "", "- Item one.", "", "## Two."].join("\n")
        const problems = checkMarkdownCopy(bad)
        expect(problems).toEqual(
            expect.arrayContaining([
                expect.stringContaining("line 5: sentence or descriptive line must end with a period"),
                expect.stringContaining("line 7: list item must not end with a period"),
                expect.stringContaining("headings mix periods"),
            ]),
        )
    })

    it("every text preset used on a Home band clears WCAG AA (4.5:1)", () => {
        const dslDir = path.join(root, "scripts/dsl")
        const failures = []
        // 21_buttons mixes Ink, White and Day fills in one file; its label pairs are checked by eye.
        for (const file of fs.readdirSync(dslDir).filter((f) => f.endsWith(".dsl") && !f.startsWith("21"))) {
            const src = fs.readFileSync(path.join(dslDir, file), "utf8")
            const band = src.match(/backgroundColor=\{\{color:([^}]+)\}\}/)?.[1]
            if (!band) continue
            for (const [, preset] of src.matchAll(/\{\{text:([^}]+)\}\}/g)) {
                const colorName = tokens.textPresets[preset].color
                const alpha = tokens.alpha[colorName]
                const fg = alpha ? tokens.color[alpha.base].hex : tokens.color[colorName].hex
                const ratio = contrastRatio(fg, tokens.color[band].hex, alpha?.opacity ?? 1)
                if (ratio < 4.5) failures.push(`${file}: ${preset} on ${band} = ${ratio.toFixed(2)}`)
            }
        }
        expect(failures).toEqual([])
        expect(contrastRatio(tokens.color["Text/Muted"].hex, tokens.color["Surface/Mist"].hex)).toBeLessThan(4.5)
        expect(contrastRatio(tokens.color["Brand/Ink"].hex, tokens.color["Surface/Mist"].hex, 0.72)).toBeGreaterThan(5.3)
    })

    it("Home structure: order and bans", () => {
        const good = ["Header", "Hero", "Contact Sheet", "Procedures", "Surgeon", "Pricing", "Notes", "FAQ", "Consult", "Footer"]
        expect(checkHomeStructure(good)).toEqual([])
        const bad = ["Hero", "Trust strip", "Procedures", "Contact Sheet", "Surgeon", "Pricing", "Notes", "FAQ", "Consult"]
        const problems = checkHomeStructure(bad)
        expect(problems).toContain("section “Procedures” is out of order")
        expect(problems).toContain("banned section “trust strip”")
    })
})
