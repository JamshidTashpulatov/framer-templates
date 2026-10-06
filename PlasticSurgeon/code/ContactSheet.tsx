import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

/**
 * Linden Contact Sheet. The template's one signature interaction.
 * Four recovery frames (Week 0 / 1 / 6 / 12) from a CMS Case; selecting a frame
 * swaps the stage print and the caption. Bind each prop to the Cases collection.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1120
 */

type Img = { src?: string; srcSet?: string; alt?: string } | undefined

export interface ContactSheetProps {
    caseName: string
    caseMeta: string
    note: string
    linkLabel: string
    link: string
    week0Label: string
    week0Image: Img
    week0Caption: string
    week0Detail: string
    week1Label: string
    week1Image: Img
    week1Caption: string
    week1Detail: string
    week6Label: string
    week6Image: Img
    week6Caption: string
    week6Detail: string
    week12Label: string
    week12Image: Img
    week12Caption: string
    week12Detail: string
    initialWeek: number
    springDuration: number
    springBounce: number
    stackBelow: number
    style?: React.CSSProperties
}

const C = {
    day: "#EEF1F4",
    white: "#FFFFFF",
    mist: "#D8DEE5",
    ink: "#1A222C",
    oxide: "#4A6670",
    // Ink at 72%: 5.4:1 on the Mist band this sits on, 6.3:1 on Day. Text/Muted is only 4.3:1 on Mist.
    muted: "rgba(26, 34, 44, 0.72)",
    hairline: "rgba(26, 34, 44, 0.14)",
    imageInset: "inset 0 0 0 1px rgba(26, 34, 44, 0.08)",
}

const FONT = "Outfit, system-ui, sans-serif"

export const DEFAULTS = {
    caseName: "Upper eyelid lift",
    caseMeta: "Patient, 52. Day surgery with local anesthetic and light sedation.",
    note: "Shown with patient consent. Individual results vary.",
    linkLabel: "See all results",
    link: "/results",
    frames: [
        {
            label: "Week 0",
            caption: "The sitting.",
            detail: "Marked, measured and photographed before surgery. Every later frame is compared to this one.",
        },
        {
            label: "Week 1",
            caption: "Swelling and stitches.",
            detail: "Bruising peaks around day three and stitches come out on day six. Most people work from home this week.",
        },
        {
            label: "Week 6",
            caption: "Back to routine.",
            detail: "Swelling is mostly gone and the scar sits in the natural crease. Light makeup and the gym are fine again.",
        },
        {
            label: "Week 12",
            caption: "Settled.",
            detail: "The final shape is visible. Scars keep fading for up to a year, and we photograph you again at month twelve.",
        },
    ],
}

type Frame = { label: string; image: Img; caption: string; detail: string }

function framesFrom(p: ContactSheetProps): Frame[] {
    return [
        { label: p.week0Label, image: p.week0Image, caption: p.week0Caption, detail: p.week0Detail },
        { label: p.week1Label, image: p.week1Image, caption: p.week1Caption, detail: p.week1Detail },
        { label: p.week6Label, image: p.week6Image, caption: p.week6Caption, detail: p.week6Detail },
        { label: p.week12Label, image: p.week12Image, caption: p.week12Caption, detail: p.week12Detail },
    ]
}

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"

function usePrefersReducedMotion() {
    const [reduce, setReduce] = React.useState(
        () => typeof window !== "undefined" && Boolean(window.matchMedia?.(REDUCE_QUERY).matches),
    )
    React.useEffect(() => {
        const mq = typeof window !== "undefined" ? window.matchMedia?.(REDUCE_QUERY) : undefined
        if (!mq) return
        const onChange = () => setReduce(mq.matches)
        onChange()
        mq.addEventListener?.("change", onChange)
        return () => mq.removeEventListener?.("change", onChange)
    }, [])
    return reduce
}

/** Reduced motion: no presence animation at all, the new frame simply replaces the old one. */
function Swap({ reduce, mode, children }: { reduce: boolean; mode?: "sync" | "popLayout"; children: React.ReactNode }) {
    if (reduce) return <>{children}</>
    return (
        <AnimatePresence initial={false} mode={mode}>
            {children}
        </AnimatePresence>
    )
}

function useWidth(ref: React.RefObject<HTMLElement>) {
    const [width, setWidth] = React.useState(0)
    React.useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        setWidth(el.getBoundingClientRect().width)
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
        ro.observe(el)
        return () => ro.disconnect()
    }, [ref])
    return width
}

export default function ContactSheet(props: Partial<ContactSheetProps>) {
    const p = { ...DEFAULT_PROPS, ...props } as ContactSheetProps
    const frames = framesFrom(p)
    const [active, setActive] = React.useState(() => Math.min(Math.max(p.initialWeek ?? 0, 0), 3))
    const reduce = usePrefersReducedMotion()
    const rootRef = React.useRef<HTMLDivElement>(null)
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])
    const width = useWidth(rootRef)
    const stacked = width > 0 && width < p.stackBelow
    const uid = React.useId().replace(/:/g, "")
    const hasAnyImage = frames.some((f) => f.image?.src)

    const spring = reduce
        ? { duration: 0 }
        : { type: "spring" as const, visualDuration: p.springDuration, bounce: p.springBounce }

    React.useEffect(() => {
        if (typeof window === "undefined") return
        for (const f of frames) {
            if (!f.image?.src) continue
            const img = new window.Image()
            img.src = f.image.src
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [p.week0Image?.src, p.week1Image?.src, p.week6Image?.src, p.week12Image?.src])

    const select = (i: number, focus = false) => {
        const next = (i + frames.length) % frames.length
        setActive(next)
        if (focus) tabRefs.current[next]?.focus()
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        const map: Record<string, number> = {
            ArrowRight: active + 1,
            ArrowDown: active + 1,
            ArrowLeft: active - 1,
            ArrowUp: active - 1,
            Home: 0,
            End: frames.length - 1,
        }
        if (!(e.key in map)) return
        e.preventDefault()
        select(map[e.key], true)
    }

    const current = frames[active]
    const lead = stacked ? 18 : 20
    const body = stacked ? 16 : 17

    return (
        <div
            ref={rootRef}
            className={`ls-${uid}`}
            style={{
                ...p.style,
                width: "100%",
                display: "grid",
                gridTemplateColumns: stacked ? "1fr" : "minmax(0, 7fr) minmax(0, 5fr)",
                gap: stacked ? 16 : 32,
                alignItems: "start",
                fontFamily: FONT,
                color: C.ink,
            }}
        >
            <style>{`
                .ls-${uid} .ls-tab { outline: none; }
                .ls-${uid} .ls-tab:focus-visible { box-shadow: 0 0 0 2px ${C.day}, 0 0 0 4px ${C.oxide}; }
                .ls-${uid} .ls-tab .ls-thumb { opacity: 0.72; transition: opacity 150ms cubic-bezier(0.25, 0.1, 0.25, 1); }
                .ls-${uid} .ls-tab:hover .ls-thumb, .ls-${uid} .ls-tab[aria-selected="true"] .ls-thumb { opacity: 1; }
                .ls-${uid} .ls-link { color: ${C.oxide}; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
                .ls-${uid} .ls-link:hover { color: ${C.ink}; }
                .ls-${uid} .ls-link:focus-visible { outline: 2px solid ${C.oxide}; outline-offset: 2px; border-radius: 4px; }
                @media (prefers-reduced-motion: reduce) { .ls-${uid} .ls-tab .ls-thumb { transition: none; } }
            `}</style>

            {/* Stage: isolated so the plus-lighter crossfade keeps constant brightness. */}
            <div
                style={{
                    position: "relative",
                    aspectRatio: "4 / 5",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: C.mist,
                    boxShadow: C.imageInset,
                }}
            >
                <div style={{ position: "absolute", inset: 0, isolation: "isolate" }}>
                    <Swap reduce={reduce}>
                        {current.image?.src ? (
                            <motion.img
                                key={`stage-${active}`}
                                src={current.image.src}
                                srcSet={current.image.srcSet}
                                alt={current.image.alt || `${p.caseName}, ${current.label}`}
                                initial={reduce ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    mixBlendMode: "plus-lighter",
                                }}
                            />
                        ) : (
                            <motion.div
                                key={`empty-${active}`}
                                role="img"
                                aria-label={`No ${current.label} photo yet`}
                                initial={reduce ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={spring}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "grid",
                                    placeItems: "center",
                                    padding: 24,
                                    textAlign: "center",
                                    fontSize: 13,
                                    lineHeight: 1.4,
                                    color: C.muted,
                                }}
                            >
                                {hasAnyImage
                                    ? `No ${current.label} photo yet.`
                                    : "Add Week 0, 1, 6 and 12 photos to this case in the Cases collection."}
                            </motion.div>
                        )}
                    </Swap>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: stacked ? 24 : 32 }}>
                {/* The sheet: one white mat, four prints. Mat 16 / inset 4 / prints 12. */}
                <LayoutGroup id={`sheet-${uid}`}>
                    <div
                        role="tablist"
                        aria-label={`${p.caseName}, recovery weeks`}
                        aria-orientation="horizontal"
                        onKeyDown={onKeyDown}
                        style={{
                            display: "grid",
                            gridTemplateColumns: stacked ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
                            gap: 4,
                            padding: 4,
                            background: C.white,
                            borderRadius: 16,
                            border: `1px solid ${C.hairline}`,
                        }}
                    >
                        {frames.map((f, i) => {
                            const selected = i === active
                            return (
                                <motion.button
                                    key={i}
                                    ref={(el) => {
                                        tabRefs.current[i] = el
                                    }}
                                    type="button"
                                    role="tab"
                                    className="ls-tab"
                                    id={`ls-${uid}-tab-${i}`}
                                    aria-selected={selected}
                                    aria-controls={`ls-${uid}-panel`}
                                    tabIndex={selected ? 0 : -1}
                                    onClick={() => select(i)}
                                    whileTap={reduce ? undefined : { scale: 0.98 }}
                                    transition={spring}
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        padding: 0,
                                        paddingBottom: 8,
                                        margin: 0,
                                        border: "none",
                                        borderRadius: 12,
                                        background: "transparent",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        font: "inherit",
                                        color: "inherit",
                                        WebkitTapHighlightColor: "transparent",
                                    }}
                                >
                                    <span
                                        className="ls-thumb"
                                        aria-hidden="true"
                                        style={{
                                            display: "block",
                                            aspectRatio: "4 / 5",
                                            borderRadius: 12,
                                            overflow: "hidden",
                                            background: C.mist,
                                            boxShadow: C.imageInset,
                                        }}
                                    >
                                        {f.image?.src ? (
                                            <img
                                                src={f.image.src}
                                                srcSet={f.image.srcSet}
                                                alt=""
                                                loading="lazy"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                            />
                                        ) : null}
                                    </span>
                                    <span
                                        style={{
                                            paddingInline: 8,
                                            fontSize: 13,
                                            lineHeight: 1.4,
                                            letterSpacing: "0.01em",
                                            fontWeight: selected ? 600 : 500,
                                            fontVariantNumeric: "tabular-nums",
                                            color: selected ? C.ink : C.muted,
                                        }}
                                    >
                                        {f.label}
                                    </span>
                                    {selected ? (
                                        <motion.span
                                            layoutId="ring"
                                            aria-hidden="true"
                                            transition={spring}
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                borderRadius: 12,
                                                boxShadow: `inset 0 0 0 2px ${C.oxide}`,
                                                pointerEvents: "none",
                                            }}
                                        />
                                    ) : null}
                                </motion.button>
                            )
                        })}
                    </div>
                </LayoutGroup>

                <div
                    role="tabpanel"
                    id={`ls-${uid}-panel`}
                    aria-labelledby={`ls-${uid}-tab-${active}`}
                    aria-live="polite"
                    style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: "46ch" }}
                >
                    <div style={{ fontSize: 13, lineHeight: 1.4, fontWeight: 500, color: C.muted }}>
                        {p.caseName}
                    </div>
                    <Swap reduce={reduce} mode="popLayout">
                        <motion.div
                            key={`caption-${active}`}
                            initial={reduce ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={spring}
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                            <div
                                style={{
                                    fontSize: 13,
                                    lineHeight: 1.4,
                                    fontWeight: 600,
                                    color: C.oxide,
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {current.label}
                            </div>
                            <p style={{ margin: 0, fontSize: lead, lineHeight: 1.6, fontWeight: 500, textWrap: "balance" } as React.CSSProperties}>
                                {current.caption}
                            </p>
                            <p
                                style={{ margin: 0, fontSize: body, lineHeight: 1.65, color: C.muted, textWrap: "pretty" } as React.CSSProperties}
                            >
                                {current.detail}
                            </p>
                        </motion.div>
                    </Swap>
                    <div style={{ height: 1, background: C.hairline }} />
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: C.muted }}>{p.caseMeta}</p>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4, color: C.muted }}>{p.note}</p>
                    {p.link ? (
                        <a className="ls-link" href={p.link} style={{ fontSize: body, lineHeight: 1.65, alignSelf: "flex-start" }}>
                            {p.linkLabel}
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

const DEFAULT_PROPS: Partial<ContactSheetProps> = {
    caseName: DEFAULTS.caseName,
    caseMeta: DEFAULTS.caseMeta,
    note: DEFAULTS.note,
    linkLabel: DEFAULTS.linkLabel,
    link: DEFAULTS.link,
    week0Label: DEFAULTS.frames[0].label,
    week0Caption: DEFAULTS.frames[0].caption,
    week0Detail: DEFAULTS.frames[0].detail,
    week1Label: DEFAULTS.frames[1].label,
    week1Caption: DEFAULTS.frames[1].caption,
    week1Detail: DEFAULTS.frames[1].detail,
    week6Label: DEFAULTS.frames[2].label,
    week6Caption: DEFAULTS.frames[2].caption,
    week6Detail: DEFAULTS.frames[2].detail,
    week12Label: DEFAULTS.frames[3].label,
    week12Caption: DEFAULTS.frames[3].caption,
    week12Detail: DEFAULTS.frames[3].detail,
    initialWeek: 0,
    springDuration: 0.35,
    springBounce: 0.1,
    stackBelow: 760,
}

const weekControls = (key: "week0" | "week1" | "week6" | "week12", i: number) => ({
    [`${key}Label`]: { type: ControlType.String, title: `${DEFAULTS.frames[i].label} label`, defaultValue: DEFAULTS.frames[i].label },
    [`${key}Image`]: { type: ControlType.ResponsiveImage, title: `${DEFAULTS.frames[i].label} photo` },
    [`${key}Caption`]: { type: ControlType.String, title: `${DEFAULTS.frames[i].label} caption`, defaultValue: DEFAULTS.frames[i].caption },
    [`${key}Detail`]: {
        type: ControlType.String,
        title: `${DEFAULTS.frames[i].label} detail`,
        defaultValue: DEFAULTS.frames[i].detail,
        displayTextArea: true,
    },
})

addPropertyControls(ContactSheet, {
    caseName: { type: ControlType.String, title: "Case", defaultValue: DEFAULTS.caseName },
    caseMeta: { type: ControlType.String, title: "Case meta", defaultValue: DEFAULTS.caseMeta, displayTextArea: true },
    ...weekControls("week0", 0),
    ...weekControls("week1", 1),
    ...weekControls("week6", 2),
    ...weekControls("week12", 3),
    note: { type: ControlType.String, title: "Consent note", defaultValue: DEFAULTS.note },
    linkLabel: { type: ControlType.String, title: "Link label", defaultValue: DEFAULTS.linkLabel },
    link: { type: ControlType.Link, title: "Link" },
    initialWeek: {
        type: ControlType.Enum,
        title: "Start on",
        options: [0, 1, 2, 3],
        optionTitles: DEFAULTS.frames.map((f) => f.label),
        defaultValue: 0,
    },
    springDuration: {
        type: ControlType.Number,
        title: "Spring time",
        defaultValue: 0.35,
        min: 0.2,
        max: 0.6,
        step: 0.05,
        unit: "s",
    },
    springBounce: { type: ControlType.Number, title: "Spring bounce", defaultValue: 0.1, min: 0, max: 0.3, step: 0.05 },
    stackBelow: { type: ControlType.Number, title: "Stack below", defaultValue: 760, min: 480, max: 1000, step: 20, unit: "px" },
})
