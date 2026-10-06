// Minimal stand-in for Framer's runtime module so code components render under vitest.
export const ControlType = new Proxy({} as Record<string, string>, { get: (_t, key) => String(key) })

export const registeredControls = new Map<unknown, Record<string, unknown>>()

export function addPropertyControls(component: unknown, controls: Record<string, unknown>) {
    registeredControls.set(component, controls)
}
