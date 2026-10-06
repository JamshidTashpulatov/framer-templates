// 30 · Images. Queries stock photography per slot in brand/images.json and uploads with alt text.
// Case frames are never auto-picked: the four Contact Sheet frames must be one sitter, one light,
// one backdrop. Choose them by hand and put the URLs in ids.json → imagePicks, then re-run.

const slots = PKG.images.slots
const picks = PKG.ids.imagePicks ?? {}
const already = PKG.ids.images ?? {}
const chosen = {}
const todo = []

console.log(`Images · ${mode}`)
for (const [slot, spec] of Object.entries(slots)) {
    for (const p of checkString(spec.alt, "descriptor")) throw new Error(`alt text for ${slot}: ${p}`)
    if (already[slot] && !picks[slot]) {
        console.log(`  keep   ${slot}`)
        continue
    }
    let url = picks[slot] ?? null
    if (!url) {
        let results = []
        try {
            ;({ results = [] } = await framer.agent.queryImages({
                source: PKG.images.source,
                query: spec.query,
                count: 6,
                orientation: spec.orientation,
            }))
        } catch (error) {
            console.log(`  WARN ${slot}: queryImages failed (${error?.message ?? error})`)
        }
        console.log(`  ${slot}: ${results.length} candidate(s) for “${spec.query}”`)
        results.forEach((r, i) => console.log(`    [${i}] ${r.url}${r.author ? `  by ${r.author}` : ""}${r.description ? `  ${r.description}` : ""}`))
        if (!spec.autoPick) {
            todo.push(slot)
            continue
        }
        url = results[0]?.url ?? null
    }
    if (!url) {
        todo.push(slot)
        continue
    }
    if (APPLY) {
        const asset = await framer.uploadImage({ image: url, altText: spec.alt, name: `linden-${slot}` })
        chosen[slot] = asset?.url ?? url
    }
    console.log(`  ${APPLY ? "set" : "would set"} ${slot} ← ${url}`)
}
if (todo.length) console.log(`Hand-pick needed (ids.json → imagePicks): ${todo.join(", ")}`)
if (APPLY && Object.keys(chosen).length) patchIds({ images: chosen })
