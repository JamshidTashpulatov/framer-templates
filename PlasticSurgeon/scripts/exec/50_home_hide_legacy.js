// 50 · Hide v1/v2 Home sections before the Linden sections go in. Hidden, not deleted: Framer also
// branches agent edits, and deletion waits until Jamshid has reacted to the new Home.
// Header and footer instances stay visible; 21–23 restyle them in place.

const legacy = PKG.ids.homeLegacySections ?? []
const keep = (s) => /header|nav|footer/i.test(s.name ?? "")
const linden = new Set(["Hero", "Contact Sheet", "Procedures", "Surgeon", "Pricing", "Notes", "FAQ", "Consult", "Consult Strip"])
const targets = legacy.filter((s) => !keep(s) && !linden.has(s.name))

console.log(`Hide legacy Home sections · ${mode}`)
for (const s of legacy) console.log(`  ${targets.includes(s) ? "hide" : "keep"} ${s.id}  ${s.name}`)

if (APPLY && targets.length) {
    const dsl = targets.map((s) => `SET ${s.id} visible=false;`).join("\n")
    const result = await framer.agent.applyChanges(dsl, { pagePath: "/" })
    if (result) console.log(JSON.stringify(result).slice(0, 400))
    console.log(`Hid ${targets.length} section(s).`)
}
