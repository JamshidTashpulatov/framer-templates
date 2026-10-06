#!/usr/bin/env node
// Reads Framer exec output on stdin, passes it through, and deep-merges every
// `IDS_PATCH {json}` line into scripts/ids.json.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const idsPath = process.env.LINDEN_IDS_PATH ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "ids.json")

export function deepMerge(target, patch) {
    if (Array.isArray(patch) || patch === null || typeof patch !== "object") return patch
    const out = { ...(target && typeof target === "object" && !Array.isArray(target) ? target : {}) }
    for (const [k, v] of Object.entries(patch)) out[k] = deepMerge(out[k], v)
    return out
}

export function applyPatchLines(ids, text) {
    let next = ids
    let count = 0
    for (const line of text.split("\n")) {
        const m = line.match(/IDS_PATCH (\{.*\})\s*$/)
        if (!m) continue
        next = deepMerge(next, JSON.parse(m[1]))
        count++
    }
    if (count) next = { ...next, updatedAt: new Date().toISOString() }
    return { ids: next, count }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    let input = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => {
        input += chunk
        process.stdout.write(chunk)
    })
    process.stdin.on("end", () => {
        const ids = JSON.parse(fs.readFileSync(idsPath, "utf8"))
        const { ids: next, count } = applyPatchLines(ids, input)
        if (count) {
            fs.writeFileSync(idsPath, JSON.stringify(next, null, 2) + "\n")
            process.stderr.write(`ids.json: merged ${count} patch(es)\n`)
        }
    })
}
