#!/usr/bin/env node
// Prints the JS prelude that apply.sh prepends to every Framer exec script.
// Exec scripts run inside the Framer CLI sandbox (no process.env, fs limited to cwd and /tmp),
// so everything they need is inlined here as constants.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const pkg = path.resolve(here, "..")

export function buildPrelude({ apply = false, flags = {}, ids = null } = {}) {
    const read = (p) => fs.readFileSync(path.join(pkg, p), "utf8")
    const PKG = {
        tokens: JSON.parse(read("brand/tokens.json")),
        copy: JSON.parse(read("brand/copy.json")),
        images: JSON.parse(read("brand/images.json")),
        ids: ids ?? JSON.parse(fs.readFileSync(process.env.LINDEN_IDS_PATH ?? path.join(pkg, "scripts/ids.json"), "utf8")),
        contactSheetSource: read("code/ContactSheet.tsx"),
        flags,
    }
    const rules = read("scripts/lib/rules.mjs").replace(/^export\s+/gm, "")
    return [
        `const APPLY = ${apply ? "true" : "false"};`,
        `const PKG = ${JSON.stringify(PKG)};`,
        rules,
        `const patchIds = (patch) => console.log("IDS_PATCH " + JSON.stringify(patch));`,
        `const mode = APPLY ? "APPLY" : "DRY RUN (nothing written; re-run with --apply)";`,
        "",
    ].join("\n")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const apply = process.argv.includes("--apply")
    const flags = {}
    for (const arg of process.argv) {
        const m = arg.match(/^--flag=(\w+)$/)
        if (m) flags[m[1]] = true
    }
    process.stdout.write(buildPrelude({ apply, flags }))
}
