// 32 · Contact Sheet (the signature). Mist band. Heading and intro share the hero’s left edge.
// The ContactSheet code component (20_contact_sheet) sits inside a Collection List of Cases
// filtered Featured = true, limit 1, so the buyer changes the featured case in CMS, not on canvas.
// Bind props: caseName ← Name, caseMeta ← Meta, note ← Note, weekNImage/Caption/Detail ← Week N fields,
// link ← /results/:slug (or /results). Keep Week labels at component defaults.
// Desktop: component full container width (stage 7fr | sheet + caption 5fr). Tablet: same.
// Phone (<760 container): component stacks itself (stage, 4-up strip, caption). Nothing to override.
// Live-tune in preview: Spring time 0.30–0.40, bounce 0–0.15. Record final values in HANDOFF.
// Empty state is built in: no images → “Add Week 0, 1, 6 and 12 photos…” on Mist.
// Anchor id “recovery” so the hero’s “See recovery weeks” link scrolls here.

+FrameNode sheetSection parent={{id:pages.homeDesktop}};
SET sheetSection name="Contact Sheet" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 128px 40px" backgroundColor={{color:Surface/Mist}};

+FrameNode sheetContainer parent=sheetSection;
SET sheetContainer name="Container" layout="stack" stackDirection="vertical" gap="48px" width="100%" maxWidth={{px:section.maxWidth}};

+FrameNode sheetHeader parent=sheetContainer;
SET sheetHeader name="Header" layout="stack" stackDirection="vertical" gap="16px" width="100%";

+TextNode sheetTitle parent=sheetHeader;
SET sheetTitle name="H2" text={{copy:home.contactSheet.h2}} inlineTextStyle={{text:Heading/H2}};

+TextNode sheetIntro parent=sheetHeader;
SET sheetIntro name="Intro" text={{copy:home.contactSheet.intro}} inlineTextStyle={{text:Text/Body Muted On Mist}} maxWidth="560px";

// Collection List: collection {{id:collections.cases}}, filter Featured is true, limit 1, no pagination.
// Inside the list item: one ContactSheet instance, width 100%, props bound as above.
// Code component identifier comes from 20_contact_sheet (ids.json → components.contactSheet).
