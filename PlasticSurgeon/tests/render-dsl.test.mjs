import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { listTemplates, loadContext, renderDsl } from "../scripts/render-dsl.mjs"

const root = path.resolve(import.meta.dirname, "..")

// Every id the templates can ask for, as the box would have after steps 00–40.
function fullIds(ctx) {
    const styles = {
        color: Object.fromEntries([...Object.keys(ctx.tokens.color), ...Object.keys(ctx.tokens.alpha)].map((n) => [n, `c_${n}`])),
        text: Object.fromEntries(Object.keys(ctx.tokens.textPresets).map((n) => [n, `t_${n}`])),
    }
    const handler = { get: (_t, key) => (typeof key === "string" ? `x_${key}` : undefined) }
    const deep = new Proxy({}, { get: (_t, key) => (typeof key === "string" ? new Proxy({ id: `x_${key}` }, handler) : undefined) })
    return {
        ...ctx.ids,
        styles,
        pages: { home: "page_home", homeDesktop: "frame_desktop" },
        images: { hero: "https://img/hero.jpg", surgeon: "https://img/surgeon.jpg" },
        collections: { cases: { id: "col_cases" }, procedures: { id: "col_proc" }, notes: { id: "col_notes" }, faq: { id: "col_faq" } },
        components: {
            button: { identifier: "btn", labelControl: "label01", variants: deep.variants, labels: deep.labels },
            header: deep.header,
            footer: deep.footer,
        },
    }
}

describe("render-dsl", () => {
    const ctx = loadContext({ idsPath: path.join(root, "scripts/ids.json") })
    const ids = fullIds(ctx)

    it("renders every Home template with no unresolved placeholders once ids exist", () => {
        for (const file of listTemplates()) {
            const tpl = fs.readFileSync(path.join(root, "scripts/dsl", file), "utf8")
            const { unresolved, dsl } = renderDsl(tpl, { ...ctx, ids })
            expect(unresolved, file).toEqual([])
            expect(dsl, file).not.toMatch(/\{\{|<<|^\s*\/\//m)
        }
    })

    it("pulls copy from copy.json, quoted and escaped", () => {
        const { dsl } = renderDsl('SET a text={{copy:home.hero.h1}};\nSET b text={{copy:cms.notes.0.quote}};', { ...ctx, ids })
        expect(dsl).toContain('text="A private sitting. A clear plan."')
        expect(dsl).toContain("“I came in expecting a sales pitch.")
    })

    it("refuses to render with missing ids unless explicitly allowed", () => {
        const tpl = fs.readFileSync(path.join(root, "scripts/dsl/31_home_hero.dsl"), "utf8")
        const strict = renderDsl(tpl, ctx)
        expect(strict.unresolved.length).toBeGreaterThan(0)
        const loose = renderDsl(tpl, ctx, { allowUnresolved: true })
        expect(loose.dsl).toContain("<<id:pages.homeDesktop>>")
    })

    it("Home templates create sections in the locked order", () => {
        const order = listTemplates()
            .filter((f) => f.startsWith("3"))
            .map((f) => fs.readFileSync(path.join(root, "scripts/dsl", f), "utf8").match(/SET \w+ name="([^"]+)"/)[1])
        expect(order).toEqual(["Hero", "Contact Sheet", "Procedures", "Surgeon", "Pricing", "Notes", "FAQ", "Consult", "Consult Strip"])
    })

    it("uses only Linden colour and text styles", () => {
        const all = listTemplates().map((f) => fs.readFileSync(path.join(root, "scripts/dsl", f), "utf8")).join("\n")
        for (const [, name] of all.matchAll(/\{\{color:([^}]+)\}\}/g)) expect(Object.keys({ ...ctx.tokens.color, ...ctx.tokens.alpha })).toContain(name)
        for (const [, name] of all.matchAll(/\{\{text:([^}]+)\}\}/g)) expect(Object.keys(ctx.tokens.textPresets)).toContain(name)
        const serif = [...all.matchAll(/\{\{text:(Display\/[^}]+)\}\}/g)]
        expect(serif.length).toBe(1)
    })
})
