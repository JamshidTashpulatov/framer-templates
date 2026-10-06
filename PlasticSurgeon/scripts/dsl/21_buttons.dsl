// 21 · Buttons. Restyle the existing v1 Button component in place (ids from project-inventory.md →
// ids.json → components.button.*). One primary, one outline, one on-Ink primary. Secondary actions
// that are links use the Link/Oxide preset, not a button.
//
// Variant set (translate with the generated Buttons guide):
//   Primary         fill Brand/Ink, label Text/On Ink, radius 999, padding 14px 24px
//   Primary Hover   fill Brand/Ink Raised
//   Primary Pressed scale 0.98 (spring 0.35 / 0.1)
//   Primary Focus   ring 0 0 0 2px Background/Day, 0 0 0 4px Accent/Oxide
//   Primary On Ink  fill Fixed/White, label Brand/Ink; hover fill Surface/Mist
//   Outline         transparent, border 1px Alpha/Ink 14, label Brand/Ink; hover fill Alpha/Ink 10
//   Size Small      padding 10px 18px (header)
// Label is Outfit 500 at Body size (17 / 16 phone). No icons inside buttons. No period on labels.

SET {{id:components.button.variants.primary}} backgroundColor={{color:Brand/Ink}} borderRadius="999px" padding="14px 24px 14px 24px";
SET {{id:components.button.variants.primaryHover}} backgroundColor={{color:Brand/Ink Raised}} borderRadius="999px" padding="14px 24px 14px 24px";
SET {{id:components.button.variants.primaryOnInk}} backgroundColor={{color:Fixed/White}} borderRadius="999px" padding="14px 24px 14px 24px";
SET {{id:components.button.variants.outline}} backgroundColor={{color:Background/Day}} border="1px solid rgba(26, 34, 44, 0.14)" borderRadius="999px" padding="14px 24px 14px 24px";
SET {{id:components.button.labels.primary}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.button.labels.primaryOnInk}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.button.labels.outline}} inlineTextStyle={{text:Text/Body}};
