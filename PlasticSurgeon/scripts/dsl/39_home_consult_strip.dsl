// 39 · Phone-only consult strip. Quiet support, not a second signature. Hidden on Desktop and Tablet.
// Fixed to the bottom with 12px margins, Surface/White, radius 16, shadow.raised (the only shadow on
// Home), padding 12 12 12 20. Note left (Text/Label Muted), small Primary button right.
// Appears once the hero has scrolled out (Framer scroll appear: opacity + 16px y, spring 0.35 / 0.1),
// hides while the menu sheet is open and over the Consult section and footer.
// Static availability copy only: no live counter, no clock, no “3 slots left”.

+FrameNode consultStrip parent={{id:pages.homeDesktop}};
SET consultStrip name="Consult Strip" visible=false position="fixed" layout="stack" stackDirection="horizontal" stackDistribution="space-between" stackAlignment="center" gap="16px" padding="12px 12px 12px 20px" borderRadius="16px" backgroundColor={{color:Surface/White}};

+TextNode consultStripNote parent=consultStrip;
SET consultStripNote name="Note" text={{copy:global.consultStrip.note}} inlineTextStyle={{text:Text/Label Muted}};

+ComponentInstanceNode consultStripCta parent=consultStrip;
SET consultStripCta name="Primary" componentIdentifier={{id:components.button.identifier}} link={{copy:global.ctaHref}} $control__{{raw:components.button.labelControl}}={{copy:global.consultStrip.cta}};
// Variant: Primary, size Small. Phone breakpoint override: visible=true, bottom 12, left 12, right 12.
