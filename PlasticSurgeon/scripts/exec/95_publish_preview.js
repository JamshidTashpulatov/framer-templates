// 95 · Preview publish for Jamshid's reaction. Never Marketplace, never a custom domain.
// Refuses unless: --apply, the operator typed PREVIEW in apply.sh, and 60_verify_home passed.
// Check the signature first with `npx @framer/agent@latest docs` (framer.agent.publish is @alpha).

if (!APPLY || !PKG.flags?.previewConfirmed) {
    console.log("Preview publish not confirmed. Use: scripts/apply.sh publish-preview")
    throw new Error("not confirmed")
}
if (!PKG.ids.verify?.passed) {
    console.log("60_verify_home has not passed. Fix the listed problems and run scripts/apply.sh verify.")
    throw new Error("verify not passed")
}
if (!PKG.ids.critique) {
    console.log("logs/v3_ic_critique.md is not recorded. Write the four-lens critique and facet scores first.")
    throw new Error("critique missing")
}

const result = await framer.agent.publish()
console.log(JSON.stringify(result, null, 2))
const url = result?.url ?? result?.deployment?.url ?? result?.hostnames?.[0]?.url ?? null
patchIds({ preview: { url, at: new Date().toISOString() } })
console.log(url ? `Preview: ${url}` : "Published; copy the preview URL from the output into HANDOFF.md.")
