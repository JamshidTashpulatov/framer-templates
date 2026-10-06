// 20 · Contact Sheet code component. Creates or updates ContactSheet.tsx from code/ContactSheet.tsx
// (inlined by the prelude), type-checks it in Framer first, and refuses to write on type errors.
// Verify method names with `npx @framer/agent@latest docs CodeFile` if this throws.

const NAME = "ContactSheet.tsx"
const source = PKG.contactSheetSource
const files = await framer.getCodeFiles()
const current = files.find((f) => (f.name ?? f.path ?? "").endsWith(NAME))

let diagnostics = []
try {
    diagnostics = (await framer.typecheckCode(NAME, source)) ?? []
} catch (error) {
    console.log(`WARN typecheck unavailable: ${error?.message ?? error}`)
}
const errors = diagnostics.filter((d) => (d.category ?? d.severity ?? "error") === "error" || d.category === 1)
console.log(`Contact Sheet · ${mode}`)
console.log(`  ${current ? "update" : "create"} ${NAME} (${source.length} chars), ${diagnostics.length} diagnostic(s)`)
for (const d of diagnostics) console.log(`  ${d.category ?? d.severity ?? ""} ${d.message ?? d.messageText ?? JSON.stringify(d)}`)

if (APPLY) {
    if (errors.length) throw new Error(`ContactSheet.tsx has ${errors.length} type error(s); not writing`)
    let file
    if (current) {
        if (typeof current.setFileContent !== "function") throw new Error("CodeFile.setFileContent missing; check `docs CodeFile`")
        file = (await current.setFileContent(source)) ?? current
    } else {
        file = await framer.createCodeFile(NAME, source)
    }
    patchIds({ components: { contactSheet: { codeFileId: file.id, name: NAME } } })
    console.log("Written. Insert it on Home via scripts/dsl/32_home_contact_sheet.dsl and bind props to the featured Case.")
}
