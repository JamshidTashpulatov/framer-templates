// 31 · Hero. Photo-led. The portrait is the focal point; the copy is a margin note beside it, set
// low, like a caption on a print. Not a Swiss left headline + right index, not a trust strip.
// Desktop 1200: 12-col grid, gap 32. Photo cols 1–7 (aspect 4:5, radius 16, image inset hairline).
// Copy block cols 8–12 with a 48px inset from the photo, aligned to the bottom of the photo: H1, lead,
// CTA row, then a hairline and the proof line. Top padding 32 (the header already gives air), bottom 128.
// Tablet 810: photo cols 1–7 of 12 keeps, copy below on phone only. Phone 390: photo full width
// (gutter 20, aspect 4:5), copy below, gap 24, CTA full width, secondary link under it.
// Intro motion (storyboard, ms): 0 photo fades 0→1 over the spring; 120 H1; 200 lead; 260 CTA row.
// Opacity + 8px y only, spring 0.35 / 0.1. Reduced motion: everything visible at 0.

+FrameNode hero parent={{id:pages.homeDesktop}};
SET hero name="Hero" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="32px 40px 128px 40px" backgroundColor={{color:Background/Day}};

+FrameNode heroGrid parent=hero;
SET heroGrid name="Container" layout="grid" gridColumnCount=12 gap="32px" width="100%" maxWidth={{px:section.maxWidth}};

+FrameNode heroPhoto parent=heroGrid;
SET heroPhoto name="Sitting portrait" gridItemColumnSpan=7 width="100%" aspectRatio=0.8 borderRadius="16px" overflow="hidden" backgroundImage={{image:hero}};

+FrameNode heroCopy parent=heroGrid;
SET heroCopy name="Copy" gridItemColumnSpan=5 layout="stack" stackDirection="vertical" stackDistribution="end" gap="24px" height="100%" padding="0px 0px 0px 48px";

+TextNode heroTitle parent=heroCopy;
SET heroTitle name="H1" text={{copy:home.hero.h1}} inlineTextStyle={{text:Display/H1}};

+TextNode heroLead parent=heroCopy;
SET heroLead name="Lead" text={{copy:home.hero.lead}} inlineTextStyle={{text:Text/Lead}} maxWidth="440px";

+FrameNode heroActions parent=heroCopy;
SET heroActions name="Actions" layout="stack" stackDirection="horizontal" stackAlignment="center" gap="24px" stackWrapEnabled=true;

+ComponentInstanceNode heroCta parent=heroActions;
SET heroCta name="Primary" componentIdentifier={{id:components.button.identifier}} link={{copy:global.ctaHref}} $control__{{raw:components.button.labelControl}}={{copy:home.hero.cta}};
// Variant: Primary (Buttons guide).

+TextNode heroSecondary parent=heroActions;
SET heroSecondary name="Secondary" text={{copy:home.hero.ctaSecondary}} link={{copy:home.hero.ctaSecondaryHref}} inlineTextStyle={{text:Text/Body}};
// Apply link preset Link/Oxide to heroSecondary.

+FrameNode heroRule parent=heroCopy;
SET heroRule name="Hairline" width="100%" height="1px" backgroundColor={{color:Alpha/Ink 14}};

+TextNode heroProof parent=heroCopy;
SET heroProof name="Proof" text={{copy:home.hero.proof}} inlineTextStyle={{text:Text/Label Muted}};
