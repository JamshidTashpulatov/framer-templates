import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import copy from "../brand/copy.json"
import ContactSheet, { DEFAULTS } from "../code/ContactSheet"
import { registeredControls } from "./stubs/framer"

const img = (n: number) => ({ src: `https://example.com/w${n}.jpg`, alt: `Frame ${n}.` })
const withImages = {
    week0Image: img(0),
    week1Image: img(1),
    week6Image: img(6),
    week12Image: img(12),
}

let reduceMotion = false
beforeAll(() => {
    // jsdom has neither; Framer always does.
    globalThis.ResizeObserver = class {
        observe() {}
        disconnect() {}
        unobserve() {}
    } as unknown as typeof ResizeObserver
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce") ? reduceMotion : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
    }))
})
afterEach(() => {
    cleanup()
    reduceMotion = false
})

const featured = copy.cms.cases.find((c) => c.featured)!

describe("ContactSheet", () => {
    it("defaults match the featured case in brand/copy.json", () => {
        expect(DEFAULTS.caseName).toBe(featured.name)
        expect(DEFAULTS.caseMeta).toBe(featured.meta)
        expect(DEFAULTS.note).toBe(featured.note)
        expect(DEFAULTS.linkLabel).toBe(copy.home.contactSheet.link)
        expect(DEFAULTS.frames.map((f) => f.label)).toEqual(featured.frames.map((f) => f.week))
        expect(DEFAULTS.frames.map((f) => f.caption)).toEqual(featured.frames.map((f) => f.caption))
        expect(DEFAULTS.frames.map((f) => f.detail)).toEqual(featured.frames.map((f) => f.detail))
    })

    it("renders four week tabs as an accessible tablist, Week 0 selected", () => {
        render(<ContactSheet {...(withImages as any)} />)
        const tabs = screen.getAllByRole("tab")
        expect(tabs.map((t) => t.textContent)).toEqual(["Week 0", "Week 1", "Week 6", "Week 12"])
        expect(tabs[0].getAttribute("aria-selected")).toBe("true")
        expect(tabs[0].tabIndex).toBe(0)
        expect(tabs.slice(1).every((t) => t.tabIndex === -1)).toBe(true)
        const panel = screen.getByRole("tabpanel")
        expect(panel.getAttribute("aria-labelledby")).toBe(tabs[0].id)
        expect(panel.textContent).toContain("The sitting.")
    })

    it("click selects a frame and updates caption, detail and the stage image", async () => {
        render(<ContactSheet {...(withImages as any)} />)
        await act(async () => {
            fireEvent.click(screen.getByRole("tab", { name: "Week 6" }))
        })
        expect(screen.getByRole("tab", { name: "Week 6" }).getAttribute("aria-selected")).toBe("true")
        expect(screen.getByText("Back to routine.")).toBeTruthy()
        expect(screen.getByText(DEFAULTS.frames[2].detail)).toBeTruthy()
        const stage = screen.getAllByRole("img").find((el) => el.getAttribute("src") === img(6).src)
        expect(stage).toBeTruthy()
    })

    it("arrow keys, Home and End move selection and focus (roving tabindex)", async () => {
        render(<ContactSheet {...(withImages as any)} />)
        const tablist = screen.getByRole("tablist")
        const tabs = () => screen.getAllByRole("tab")
        await act(async () => {
            tabs()[0].focus()
            fireEvent.keyDown(tablist, { key: "ArrowRight" })
        })
        expect(tabs()[1].getAttribute("aria-selected")).toBe("true")
        expect(document.activeElement).toBe(tabs()[1])
        await act(async () => fireEvent.keyDown(tablist, { key: "End" }))
        expect(tabs()[3].getAttribute("aria-selected")).toBe("true")
        await act(async () => fireEvent.keyDown(tablist, { key: "ArrowRight" }))
        expect(tabs()[0].getAttribute("aria-selected")).toBe("true")
        await act(async () => fireEvent.keyDown(tablist, { key: "ArrowLeft" }))
        expect(tabs()[3].getAttribute("aria-selected")).toBe("true")
        await act(async () => fireEvent.keyDown(tablist, { key: "Home" }))
        expect(tabs()[0].getAttribute("aria-selected")).toBe("true")
        expect(tabs()[0].tabIndex).toBe(0)
    })

    it("shows a CMS empty state when the case has no photos", () => {
        render(<ContactSheet />)
        expect(screen.getByText("Add Week 0, 1, 6 and 12 photos to this case in the Cases collection.")).toBeTruthy()
    })

    it("shows a per-frame empty state when one week is missing", async () => {
        render(<ContactSheet {...({ ...withImages, week6Image: undefined } as any)} />)
        await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Week 6" })))
        expect(screen.getByText("No Week 6 photo yet.")).toBeTruthy()
    })

    it("reduced motion swaps the caption immediately, with no lingering exit", async () => {
        reduceMotion = true
        render(<ContactSheet {...(withImages as any)} />)
        await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Week 12" })))
        expect(screen.getByText("Settled.")).toBeTruthy()
        await act(async () => {
            await new Promise((r) => setTimeout(r, 30))
        })
        expect(screen.queryByText("The sitting.")).toBeNull()
    })

    it("stage images crossfade with plus-lighter inside an isolated group", () => {
        render(<ContactSheet {...(withImages as any)} />)
        const stage = screen.getAllByRole("img").find((el) => el.getAttribute("src") === img(0).src && el.tagName === "IMG" && el.getAttribute("alt") !== "")!
        expect(stage.style.mixBlendMode).toBe("plus-lighter")
        expect((stage.parentElement as HTMLElement).style.isolation).toBe("isolate")
    })

    it("exposes bounded spring controls so tuning cannot make it ugly", () => {
        const controls = registeredControls.get(ContactSheet) as Record<string, any>
        expect(controls.springDuration).toMatchObject({ min: 0.2, max: 0.6, defaultValue: 0.35 })
        expect(controls.springBounce).toMatchObject({ min: 0, max: 0.3, defaultValue: 0.1 })
        for (const key of ["week0Image", "week1Image", "week6Image", "week12Image"]) {
            expect(controls[key].type).toBe("ResponsiveImage")
        }
    })
})
