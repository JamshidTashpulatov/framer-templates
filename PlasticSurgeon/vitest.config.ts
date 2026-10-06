import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
    resolve: {
        alias: { framer: fileURLToPath(new URL("./tests/stubs/framer.ts", import.meta.url)) },
    },
    esbuild: { jsx: "automatic" },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.{ts,tsx,mjs}"],
    },
})
