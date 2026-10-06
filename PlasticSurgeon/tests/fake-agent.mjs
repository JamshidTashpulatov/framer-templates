#!/usr/bin/env node
// Stand-in for `npx @framer/agent` in tests: `exec -s <id>` runs stdin against a mock project that
// still carries v1 Mark-Up / v2 Solenne leftovers. `apply-changes` echoes the DSL it would send.
const args = process.argv.slice(2)
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor

const style = (id, name, light) => ({ id, name, light, setAttributes: async (a) => ({ id, ...a }) })
const project = {
    pages: [
        { id: "pg_home", path: "/" },
        { id: "pg_book", path: "/book" },
    ],
    home: {
        id: "pg_home",
        children: [
            {
                id: "bp_desktop",
                name: "Desktop",
                width: "1200px",
                children: [
                    { id: "sec_header", name: "Header", type: "ComponentInstanceNode" },
                    { id: "sec_theatre", name: "Theatre Hero", type: "FrameNode" },
                    { id: "sec_zone", name: "Zone Map", type: "FrameNode" },
                    { id: "sec_footer", name: "Footer", type: "ComponentInstanceNode" },
                ],
            },
        ],
    },
    colorStyles: [style("cs1", "Theatre", "rgba(20, 20, 20, 1)"), style("cs2", "Suture", "rgba(240, 110, 90, 1)")],
    textStyles: [{ id: "ts1", name: "Hero Title", font: { family: "Instrument Serif" } }],
    codeFiles: [{ id: "cf1", name: "ZoneMap.tsx" }],
    collections: [{ id: "col1", name: "Procedures", $itemCount: 6, variables: [{ id: "f1", name: "Name", type: "string" }] }],
}

const framer = {
    agent: {
        getNodesOfTypes: async ({ types }) => (types[0] === "WebPageNode" ? project.pages : project.collections),
        serialize: async ({ id }) => (id === "pg_home" ? project.home : { children: [] }),
        applyChanges: async (dsl) => ({ ok: true, statements: dsl.split(";").length - 1 }),
    },
    getColorStyles: async () => project.colorStyles,
    getTextStyles: async () => project.textStyles,
    getCodeFiles: async () => project.codeFiles,
}

if (args[0] === "exec") {
    let code = ""
    process.stdin.setEncoding("utf8")
    for await (const chunk of process.stdin) code += chunk
    try {
        await new AsyncFunction("framer", "state", "console", code)(framer, {}, console)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
} else if (args[0] === "apply-changes") {
    console.log(`fake apply-changes ${args.join(" ").slice(0, 200)}`)
} else {
    console.log(`fake-agent: ${args.join(" ")}`)
}
