#!/usr/bin/env node
// Writes brand/copy.md, a readable view of brand/copy.json for Jamshid. Never edit copy.md by hand.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { typeForKey } from "./lib/rules.mjs"

const pkg = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const copy = JSON.parse(fs.readFileSync(path.join(pkg, "brand/copy.json"), "utf8"))

const lines = [
    "# Linden copy (generated)",
    "",
    "Generated from `brand/copy.json` by `npm run copy:md`. Edit the JSON, not this file. Type tags show which punctuation rule applies (see `brand/voice.md`).",
    "",
]

const show = (value, key, depth) => {
    const indent = "  ".repeat(Math.max(depth - 1, 0))
    const type = typeForKey(key)
    if (type === "raw") return
    if (typeof value === "string") {
        lines.push(`${indent}- \`${key}\` (${type}): ${value}`)
    } else if (Array.isArray(value)) {
        if (value.every((v) => typeof v === "string")) {
            lines.push(`${indent}- \`${key}\` (${type}):`)
            value.forEach((v) => lines.push(`${indent}  - ${v}`))
        } else {
            value.forEach((v, i) => {
                lines.push(`${indent}- \`${key}\` ${i + 1}:`)
                for (const [k, vv] of Object.entries(v)) show(vv, k, depth + 1)
            })
        }
    } else if (value && typeof value === "object") {
        if (depth <= 1) lines.push("", `${"#".repeat(depth + 2)} ${key}`, "")
        else lines.push(`${indent}- \`${key}\`:`)
        for (const [k, v] of Object.entries(value)) show(v, k, depth + 1)
    }
}

for (const [key, value] of Object.entries(copy)) {
    if (key.startsWith("$")) continue
    lines.push("", `## ${key}`, "")
    for (const [k, v] of Object.entries(value)) show(v, k, 1)
}

fs.writeFileSync(path.join(pkg, "brand/copy.md"), lines.join("\n").replace(/\n{3,}/g, "\n\n") + "\n")
console.log("brand/copy.md written")
