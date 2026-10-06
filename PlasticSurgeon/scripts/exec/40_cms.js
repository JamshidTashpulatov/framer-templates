// 40 · CMS. Keeps the existing collections (found by 00_inventory), adds the fields Linden needs,
// and upserts Linden sample items by slug. Legacy items not in brand/copy.json are listed, not deleted.
// Item writes use the DSL form from Framer's static recipes:
//   +CollectionItemNode x parent="<collectionId>"; SET x $control__slug="..." $control__<fieldId>="...";
// Field creation uses the collection API; verify with `npx @framer/agent@latest docs Collection.addFields`.

const SPEC = {
    cases: {
        fields: [
            ["Name", "string"], ["Zone", "string"], ["Featured", "boolean"], ["Meta", "string"], ["Note", "string"],
            ...[0, 1, 6, 12].flatMap((w) => [[`Week ${w} Image`, "image"], [`Week ${w} Caption`, "string"], [`Week ${w} Detail`, "string"]]),
        ],
        items: PKG.copy.cms.cases.map((c) => ({
            slug: c.slug,
            values: {
                Name: c.name, Zone: c.zone, Featured: c.featured, Meta: c.meta, Note: c.note,
                ...Object.fromEntries(
                    c.frames.flatMap((f, i) => {
                        const w = [0, 1, 6, 12][i]
                        const img = PKG.ids.images?.[`case.${c.slug}.week${w}`]
                        return [[`Week ${w} Caption`, f.caption], [`Week ${w} Detail`, f.detail], ...(img ? [[`Week ${w} Image`, img]] : [])]
                    }),
                ),
            },
        })),
    },
    procedures: {
        fields: [["Name", "string"], ["Zone", "string"], ["Price", "string"], ["Downtime", "string"], ["Summary", "string"], ["Suits", "string"], ["Image", "image"]],
        items: PKG.copy.cms.procedures.map((p) => ({
            slug: p.slug,
            values: {
                Name: p.name, Zone: p.zone, Price: p.price, Downtime: p.downtime, Summary: p.summary, Suits: p.suits,
                ...(PKG.ids.images?.[`procedure.${p.slug}`] ? { Image: PKG.ids.images[`procedure.${p.slug}`] } : {}),
            },
        })),
    },
    faq: {
        fields: [["Question", "string"], ["Answer", "string"], ["Show on Home", "boolean"]],
        items: PKG.copy.cms.faq.map((f, i) => ({
            slug: `faq-${String(i + 1).padStart(2, "0")}-${f.question.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)}`,
            values: { Question: f.question, Answer: f.answer, "Show on Home": f.showOnHome },
        })),
    },
    notes: {
        fields: [["Quote", "string"], ["Person", "string"], ["Zone", "string"], ["Weeks", "string"]],
        items: PKG.copy.cms.notes.map((n) => ({
            slug: n.person.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, ""),
            values: { Quote: n.quote, Person: n.person, Zone: n.zone, Weeks: n.weeks },
        })),
    },
    guides: {
        fields: [["Title", "string"], ["Summary", "string"]],
        items: PKG.copy.cms.guides.map((g) => ({ slug: g.slug, values: { Title: g.title, Summary: g.summary } })),
    },
}

const ALIASES = { Name: ["Title"], Title: ["Name"], Quote: ["Text", "Body"], Person: ["Author", "Name"], Answer: ["Body"] }
const findField = (fields, name) => {
    const want = [name, ...(ALIASES[name] ?? [])].map((n) => n.toLowerCase())
    return Object.entries(fields).find(([n]) => want.includes(n.toLowerCase()))?.[1] ?? null
}

const nodes = await framer.agent.getNodesOfTypes({ types: ["CollectionNode"] })
const known = PKG.ids.collections ?? {}
console.log(`CMS · ${mode}`)

for (const [key, spec] of Object.entries(SPEC)) {
    const ref = known[key]
    const node = ref ? nodes.find((n) => n.id === ref.id) : null
    if (!node) {
        console.log(`  ${key}: no collection mapped. Run 00_inventory, or create “${key[0].toUpperCase() + key.slice(1)}” in Framer, then re-run.`)
        continue
    }
    let fields = Object.fromEntries((node.variables ?? []).map((v) => [v.name, { id: v.id, type: v.type }]))
    const missing = spec.fields.filter(([name]) => !findField(fields, name))
    console.log(`  ${key} → ${node.name}: ${missing.length ? `add ${missing.map(([n, t]) => `${n} (${t})`).join(", ")}` : "fields ok"}`)

    if (APPLY && missing.length) {
        const collection = await framer.getCollection(node.id)
        if (typeof collection?.addFields !== "function") throw new Error("Collection.addFields missing; check `docs Collection.addFields`")
        await collection.addFields(missing.map(([name, type]) => ({ name, type })))
        const refreshed = (await framer.agent.getNodesOfTypes({ types: ["CollectionNode"] })).find((n) => n.id === node.id)
        fields = Object.fromEntries((refreshed?.variables ?? []).map((v) => [v.name, { id: v.id, type: v.type }]))
    }

    const tree = await framer.agent.serialize({ id: node.id, depth: 1 })
    const items = tree?.children ?? []
    const slugOf = (item) => item.$control__slug ?? item.attributes?.$control__slug ?? item.slug
    const lines = []
    const ourSlugs = new Set(spec.items.map((i) => i.slug))
    spec.items.forEach((item, idx) => {
        const hit = items.find((it) => slugOf(it) === item.slug)
        const refName = hit ? hit.id : `${key}_${idx}`
        if (!hit) lines.push(`+CollectionItemNode ${refName} parent=${JSON.stringify(node.id)};`)
        const sets = [`$control__slug=${JSON.stringify(item.slug)}`]
        for (const [fieldName, value] of Object.entries(item.values)) {
            const field = findField(fields, fieldName)
            if (!field) continue
            sets.push(`$control__${field.id}=${typeof value === "boolean" ? String(value) : JSON.stringify(value)}`)
        }
        lines.push(`SET ${refName} ${sets.join(" ")};`)
    })
    const legacy = items.filter((it) => !ourSlugs.has(slugOf(it)))
    console.log(`    upsert ${spec.items.length} item(s); ${legacy.length} legacy item(s) kept: ${legacy.map(slugOf).join(", ") || "none"}`)
    if (legacy.length) console.log("    Rewrite or draft legacy items in Linden voice before publishing; they still carry v1/v2 copy.")

    if (APPLY) {
        const result = await framer.agent.applyChanges(lines.join("\n"))
        if (result) console.log(JSON.stringify(result).slice(0, 400))
        patchIds({ collections: { [key]: { id: node.id, name: node.name, fields } } })
    } else {
        console.log(lines.map((l) => `    ${l}`).join("\n").slice(0, 1200))
    }
}
