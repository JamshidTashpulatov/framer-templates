#!/usr/bin/env node
// Renders scripts/dsl/*.dsl templates into plain DSL for `npx @framer/agent apply-changes`.
//
// Placeholders:
//   {{copy:home.hero.h1}}      → quoted string from brand/copy.json (single source of copy)
//   {{color:Brand/Ink}}        → colour style reference (id from ids.json, written by 10_color_tokens)
//   {{text:Display/H1}}        → text style reference (id from ids.json, written by 11_text_presets)
//   {{id:pages.home}}          → quoted node id from ids.json
//   {{image:hero}}             → quoted image URL from ids.json → images (written by 30_images)
//   {{px:section.padY.desktop}}→ quoted pixel value from brand/tokens.json, e.g. "128px"
//   {{token:shadow.raised}}    → quoted raw token value
//   {{raw:components.button.labelControl}} → unquoted id from ids.json, for $control__<id> names
// Lines starting with // are notes for the builder and are stripped before applying.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const pkg = path.resolve(here, "..")
const dslDir = path.join(here, "dsl")

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(pkg, p), "utf8"))

const get = (obj, dotted) =>
    dotted.split(".").reduce((acc, key) => (acc == null ? undefined : acc[/^\d+$/.test(key) ? Number(key) : key]), obj)

/**
 * The one place to reconcile with the live grammar in prompt/updating-the-project.md.
 * If styles must be referenced by path instead of id, change this function only.
 */
export function formatStyleRef(kind, name, id) {
    return id ? JSON.stringify(id) : null
}

export function renderDsl(template, { copy, tokens, ids }, { allowUnresolved = false } = {}) {
    const unresolved = []
    const body = template
        .split("\n")
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n")
        .replace(/\{\{(\w+):([^}]+)\}\}/g, (whole, kind, key) => {
            let value = null
            switch (kind) {
                case "copy": {
                    const v = get(copy, key)
                    value = typeof v === "string" ? JSON.stringify(v) : null
                    break
                }
                case "color":
                    value = formatStyleRef("color", key, ids.styles?.color?.[key])
                    break
                case "text":
                    value = formatStyleRef("text", key, ids.styles?.text?.[key])
                    break
                case "id": {
                    const v = get(ids, key)
                    value = typeof v === "string" ? JSON.stringify(v) : v && typeof v.id === "string" ? JSON.stringify(v.id) : null
                    break
                }
                case "raw": {
                    const v = get(ids, key)
                    value = typeof v === "string" && /^[\w-]+$/.test(v) ? v : null
                    break
                }
                case "image": {
                    const v = ids.images?.[key]
                    value = typeof v === "string" ? JSON.stringify(v) : null
                    break
                }
                case "px": {
                    const v = get(tokens, key)
                    value = typeof v === "number" ? JSON.stringify(`${v}px`) : null
                    break
                }
                case "token": {
                    const v = get(tokens, key)
                    value = v == null ? null : JSON.stringify(String(v))
                    break
                }
                default:
                    value = null
            }
            if (value == null) {
                unresolved.push(whole)
                return allowUnresolved ? `<<${kind}:${key}>>` : whole
            }
            return value
        })
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    return { dsl: body + "\n", unresolved }
}

export function listTemplates() {
    return fs
        .readdirSync(dslDir)
        .filter((f) => f.endsWith(".dsl"))
        .sort()
}

export function loadContext({ idsPath = process.env.LINDEN_IDS_PATH } = {}) {
    const ids = idsPath ? JSON.parse(fs.readFileSync(idsPath, "utf8")) : readJson("scripts/ids.json")
    return { copy: readJson("brand/copy.json"), tokens: readJson("brand/tokens.json"), ids }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2)
    const allowUnresolved = args.includes("--allow-unresolved")
    const outIdx = args.indexOf("--out")
    const outDir = outIdx >= 0 ? args[outIdx + 1] : null
    const target = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out") ?? "all"
    const ctx = loadContext()
    const files = target === "all" ? listTemplates() : [target.endsWith(".dsl") ? target : `${target}.dsl`]
    let failed = false
    for (const file of files) {
        const tpl = fs.readFileSync(path.join(dslDir, file), "utf8")
        const { dsl, unresolved } = renderDsl(tpl, ctx, { allowUnresolved })
        if (unresolved.length && !allowUnresolved) {
            failed = true
            process.stderr.write(`${file}: ${unresolved.length} unresolved placeholder(s): ${[...new Set(unresolved)].join(" ")}\n`)
            continue
        }
        if (outDir) {
            fs.mkdirSync(outDir, { recursive: true })
            fs.writeFileSync(path.join(outDir, file), dsl)
            process.stderr.write(`rendered ${file}${unresolved.length ? ` (${unresolved.length} unresolved, allowed)` : ""}\n`)
        } else {
            process.stdout.write(dsl)
        }
    }
    if (failed) {
        process.stderr.write("Run the style, CMS and image steps first so ids.json has the ids these templates need.\n")
        process.exit(1)
    }
}
