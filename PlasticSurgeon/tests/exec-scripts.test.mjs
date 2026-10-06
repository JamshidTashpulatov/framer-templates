import fs from "node:fs"
import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { buildPrelude } from "../scripts/prelude.mjs"
import { applyPatchLines } from "../scripts/merge-ids.mjs"

const root = path.resolve(import.meta.dirname, "..")
const baseIds = JSON.parse(fs.readFileSync(path.join(root, "scripts/ids.json"), "utf8"))
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor

async function run(step, framer, { apply = false, ids = baseIds, flags = {}, globals = {} } = {}) {
    const code = buildPrelude({ apply, ids, flags }) + fs.readFileSync(path.join(root, "scripts/exec", `${step}.js`), "utf8")
    const lines = []
    const consoleMock = { log: (...a) => lines.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")) }
    const state = {}
    const names = ["framer", "state", "console", ...Object.keys(globals)]
    let error = null
    try {
        await new AsyncFunction(...names, code)(framer, state, consoleMock, ...Object.values(globals))
    } catch (e) {
        error = e
    }
    const out = lines.join("\n")
    return { out, state, error, ids: applyPatchLines(ids, out).ids }
}

function style(name, light, extra = {}) {
    const s = { id: `id-${name}`, name, light, ...extra }
    s.setAttributes = vi.fn(async (attrs) => Object.assign(s, attrs))
    return s
}

function legacyFramer() {
    const colorStyles = [
        style("Theatre", "rgba(20, 20, 20, 1)"),
        style("Suture", "rgba(240, 110, 90, 1)"),
        style("Linen", "rgba(245, 240, 232, 1)"),
        style("Solenne/Sage", "rgba(140, 160, 140, 1)"),
        style("Background/Day", "rgba(238, 241, 244, 1)"),
    ]
    const textStyles = [
        style("Hero Title", null, { font: { family: "Instrument Serif" } }),
        style("Body", null, { font: { family: "Inter" } }),
        style("Eyebrow Mono", null, { font: { family: "Inter" } }),
    ]
    return {
        colorStyles,
        textStyles,
        getColorStyles: vi.fn(async () => colorStyles),
        createColorStyle: vi.fn(async (a) => ({ id: `new-${a.name}`, ...a })),
        getTextStyles: vi.fn(async () => textStyles),
        createTextStyle: vi.fn(async (a) => ({ id: `new-${a.name}`, ...a })),
        getFont: vi.fn(async (family, { weight }) => ({ family, weight, selector: `GF;${family}-${weight}` })),
    }
}

describe("10_color_tokens", () => {
    it("dry run plans in-place renames of v1/v2 styles and writes nothing", async () => {
        const framer = legacyFramer()
        const { out, state, error } = await run("10_color_tokens", framer)
        expect(error).toBeNull()
        const byName = Object.fromEntries(state.colorPlan.map((p) => [p.name, p]))
        expect(byName["Brand/Ink"]).toMatchObject({ action: "rename", from: "Theatre" })
        expect(byName["Accent/Oxide"]).toMatchObject({ action: "rename", from: "Suture" })
        expect(byName["Background/Day"].action).toBe("keep")
        expect(byName["Accent/Oxide"].light).toBe("rgba(74, 102, 112, 1)")
        expect(out).toContain("DRY RUN")
        expect(framer.createColorStyle).not.toHaveBeenCalled()
        for (const s of framer.colorStyles) expect(s.setAttributes).not.toHaveBeenCalled()
    })

    it("apply renames legacy styles, creates the rest, never deletes, and records ids", async () => {
        const framer = legacyFramer()
        const { ids, error } = await run("10_color_tokens", framer, { apply: true })
        expect(error).toBeNull()
        const theatre = framer.colorStyles.find((s) => s.id === "id-Theatre")
        expect(theatre.setAttributes).toHaveBeenCalledWith({ name: "Brand/Ink", light: "rgba(26, 34, 44, 1)" })
        expect(ids.styles.color["Brand/Ink"]).toBe("id-Theatre")
        expect(ids.styles.color["Alpha/Ink 14"]).toBe("new-Alpha/Ink 14")
        expect(Object.keys(ids.styles.color)).toHaveLength(16)
        const created = framer.createColorStyle.mock.calls.map(([a]) => a.name)
        expect(created).not.toContain("Brand/Ink")
    })
})

describe("11_text_presets", () => {
    it("replaces banned fonts in place with Source Serif 4 (H1 only) and Outfit, five sizes, three breakpoints", async () => {
        const framer = legacyFramer()
        const { ids, error, out } = await run("11_text_presets", framer, { apply: true })
        expect(error).toBeNull()
        const hero = framer.textStyles.find((s) => s.id === "id-Hero Title")
        const attrs = hero.setAttributes.mock.calls[0][0]
        expect(attrs.name).toBe("Display/H1")
        expect(attrs.font.family).toBe("Source Serif 4")
        expect(attrs.breakpoints.map((b) => [b.minWidth, b.fontSize])).toEqual([[1200, "96px"], [810, "72px"], [0, "48px"]])
        const body = framer.textStyles.find((s) => s.id === "id-Body").setAttributes.mock.calls[0][0]
        expect(body).toMatchObject({ name: "Text/Body", fontSize: "17px", lineHeight: "1.65em" })
        expect(body.font.family).toBe("Outfit")
        const families = new Set(framer.getFont.mock.calls.map(([f]) => f))
        expect([...families].sort()).toEqual(["Outfit", "Source Serif 4"])
        expect(out).toContain("(5 of max 5)")
        expect(Object.keys(ids.styles.text)).toHaveLength(18)
    })

    it("stops before writing when a font is missing", async () => {
        const framer = legacyFramer()
        framer.getFont = vi.fn(async (family) => (family === "Outfit" ? null : { family }))
        const { error, out } = await run("11_text_presets", framer, { apply: true })
        expect(error?.message).toBe("missing fonts")
        expect(out).toContain("Never substitute a banned font")
        expect(framer.createTextStyle).not.toHaveBeenCalled()
    })
})

describe("40_cms", () => {
    it("adds missing fields and upserts Linden items by slug with the recipe DSL form", async () => {
        const fields = [{ id: "fName", name: "Name", type: "string" }, { id: "fZone", name: "Zone", type: "string" }]
        const node = { id: "colProc", name: "Procedures", variables: fields }
        const collection = {
            addFields: vi.fn(async (list) => {
                list.forEach((f, i) => fields.push({ id: `fNew${i}`, name: f.name, type: f.type }))
            }),
        }
        const applied = []
        const framer = {
            agent: {
                getNodesOfTypes: vi.fn(async () => [node]),
                serialize: vi.fn(async () => ({ children: [{ id: "itemOld", $control__slug: "rhinoplasty" }, { id: "itemV1", $control__slug: "caliper-zone-map" }] })),
                applyChanges: vi.fn(async (dsl) => applied.push(dsl)),
            },
            getCollection: vi.fn(async () => collection),
        }
        const ids = { ...baseIds, collections: { procedures: { id: "colProc" } } }
        const { out, error } = await run("40_cms", framer, { apply: true, ids })
        expect(error).toBeNull()
        expect(collection.addFields.mock.calls[0][0].map((f) => f.name)).toEqual(["Price", "Downtime", "Summary", "Suits", "Image"])
        const dsl = applied[0]
        expect(dsl).toContain('+CollectionItemNode procedures_0 parent="colProc";')
        expect(dsl).toContain('SET itemOld $control__slug="rhinoplasty" $control__fName="Rhinoplasty"')
        expect(dsl).not.toMatch(/\+CollectionItemNode procedures_1 /)
        expect(dsl).toContain('$control__fNew0="From $4,800"')
        expect(out).toContain("1 legacy item(s) kept: caliper-zone-map")
        expect(out).toContain("cases: no collection mapped")
    })
})

describe("50_home_hide_legacy", () => {
    it("hides v1 sections, keeps header and footer", async () => {
        const applied = []
        const framer = { agent: { applyChanges: vi.fn(async (dsl) => applied.push(dsl)) } }
        const ids = {
            ...baseIds,
            homeLegacySections: [
                { id: "s1", name: "Header" },
                { id: "s2", name: "Theatre Hero" },
                { id: "s3", name: "Zone Map" },
                { id: "s4", name: "Footer" },
            ],
        }
        await run("50_home_hide_legacy", framer, { apply: true, ids })
        expect(applied[0]).toBe("SET s2 visible=false;\nSET s3 visible=false;")
    })
})

describe("60_verify_home + 95_publish_preview gates", () => {
    const section = (name, texts, extra = {}) => ({
        type: "FrameNode",
        name,
        ...extra,
        children: texts.map((t) => ({ type: "TextNode", text: t, font: { family: "Outfit" } })),
    })

    it("fails a Home with a trust strip, an em dash, an emoji and a banned font", async () => {
        const tree = {
            children: [
                {
                    name: "Desktop",
                    children: [
                        section("Hero", ["A private sitting — a clear plan"]),
                        section("Trust strip", ["Rated 5 stars ⭐"]),
                        { type: "FrameNode", name: "Contact Sheet", children: [{ type: "TextNode", text: "Recovery.", font: { family: "Instrument Serif" } }] },
                    ],
                },
            ],
        }
        const framer = { agent: { serialize: vi.fn(async () => tree) } }
        const ids = { ...baseIds, pages: { home: "home" } }
        const { ids: next, out } = await run("60_verify_home", framer, { ids })
        expect(out).toContain("FAIL")
        const problems = next.verify.problems.join("\n")
        expect(problems).toContain("banned section “trust strip”")
        expect(problems).toContain("em dash")
        expect(problems).toContain("emoji")
        expect(problems).toContain("Instrument Serif")
        expect(problems).toContain("missing section “Pricing”")
        expect(next.verify.passed).toBe(false)
    })

    it("passes a Home in the locked order with clean copy", async () => {
        const c = JSON.parse(fs.readFileSync(path.join(root, "brand/copy.json"), "utf8")).home
        const tree = {
            children: [
                {
                    name: "Desktop",
                    children: [
                        section("Header", ["linden"]),
                        section("Hero", [c.hero.h1, c.hero.lead, c.hero.ctaSecondary, c.hero.proof]),
                        section("Contact Sheet", [c.contactSheet.h2, c.contactSheet.intro]),
                        section("Procedures", [c.procedures.h2, c.procedures.intro, ...c.procedures.chips]),
                        section("Surgeon", [c.surgeon.h2, ...c.surgeon.paragraphs, c.surgeon.name, ...c.surgeon.chips, c.surgeon.link]),
                        section("Pricing", [c.pricing.h2, ...c.pricing.facts.flatMap((f) => [f.label, f.price, f.description]), c.pricing.note, c.pricing.link]),
                        section("Notes", [c.notes.h2, c.notes.note]),
                        section("FAQ", [c.faq.h2, c.faq.link]),
                        section("Consult", [c.consult.h2, c.consult.body, c.consult.ctaSecondary, c.consult.note]),
                        section("Consult Strip", ["hidden"], { visible: false }),
                        section("Footer", ["linden"]),
                    ],
                },
            ],
        }
        const framer = { agent: { serialize: vi.fn(async () => tree) } }
        const { ids: next, out } = await run("60_verify_home", framer, { ids: { ...baseIds, pages: { home: "home" } } })
        expect(next.verify.problems).toEqual([])
        expect(next.verify.passed).toBe(true)
        expect(out).toContain("PASS")
        // Button labels live in component controls, not TextNodes, so they are the only drift warnings.
        expect(next.verify.warnings.join(" ")).toContain("Book a private consult")
    })

    it("publish refuses without confirmation, a passed verify, and a recorded critique", async () => {
        const framer = { agent: { publish: vi.fn(async () => ({ url: "https://preview.example" })) } }
        expect((await run("95_publish_preview", framer, { apply: true })).error?.message).toBe("not confirmed")
        const flags = { previewConfirmed: true }
        expect((await run("95_publish_preview", framer, { apply: true, flags })).error?.message).toBe("verify not passed")
        const verified = { ...baseIds, verify: { passed: true } }
        expect((await run("95_publish_preview", framer, { apply: true, flags, ids: verified })).error?.message).toBe("critique missing")
        expect(framer.agent.publish).not.toHaveBeenCalled()
        const ready = { ...verified, critique: { precise: 4, private: 5 } }
        const { ids } = await run("95_publish_preview", framer, { apply: true, flags, ids: ready })
        expect(framer.agent.publish).toHaveBeenCalledTimes(1)
        expect(ids.preview.url).toBe("https://preview.example")
    })
})
