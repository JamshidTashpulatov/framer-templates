// 22 · Header. Restyle the existing header component in place (ids.json → components.header.*).
// Desktop/Tablet: wordmark left, five links centred, Ink pill right. Height 72, padding 0 40 (32 tablet).
// Phone: wordmark + “Menu” button (Phosphor List, light, 20px). Menu sheet: full-height Day panel,
// links at Lead size on one left edge, full-width primary CTA, note line, Close (Phosphor X).
// States: link hover Accent/Oxide; current page link Brand/Ink with a 1px Oxide underline; focus ring
// as Buttons. Menu open/close: opacity + 8px y, spring 0.35 / 0.1; reduced motion jumps.
// No sticky blur glass. On scroll the bar stays flat Day with a 1px Alpha/Ink 14 bottom border.

SET {{id:components.header.root}} backgroundColor={{color:Background/Day}} padding="0px 40px 0px 40px" height="72px" border="0px 0px 1px 0px solid rgba(26, 34, 44, 0.14)";
SET {{id:components.header.wordmark}} text={{copy:global.footer.wordmark}} inlineTextStyle={{text:Text/Card Title}};
SET {{id:components.header.link0}} text={{copy:global.nav.0}} link={{copy:global.navHrefs.0}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.header.link1}} text={{copy:global.nav.1}} link={{copy:global.navHrefs.1}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.header.link2}} text={{copy:global.nav.2}} link={{copy:global.navHrefs.2}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.header.link3}} text={{copy:global.nav.3}} link={{copy:global.navHrefs.3}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.header.link4}} text={{copy:global.nav.4}} link={{copy:global.navHrefs.4}} inlineTextStyle={{text:Text/Body}};
SET {{id:components.header.cta}} link={{copy:global.ctaHref}};
SET {{id:components.header.ctaLabel}} text={{copy:global.cta}};
SET {{id:components.header.menuNote}} text={{copy:global.menu.note}} inlineTextStyle={{text:Text/Label Muted}};
