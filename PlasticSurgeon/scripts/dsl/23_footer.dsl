// 23 · Footer on Brand/Ink Raised. Restyle in place (ids.json → components.footer.*).
// Desktop: 12-col grid. Row 1: Visit (cols 1–3), Hours (4–6), Contact (7–9), Nav (10–12), labels in
// Text/Label On Ink, values in Text/Body On Ink, hours as a list (no periods). Row 2: giant wordmark
// “linden” (Heading/Wordmark, Outfit 600 at H1 size), full width, sitting on the bottom edge.
// Row 3: © note in Text/Label On Ink. Padding 96 40 40. Tablet: 2×2 columns. Phone: one column.
// Links hover Text/On Ink Muted with Link/On Ink underline. No social icon row, no newsletter box.

SET {{id:components.footer.root}} backgroundColor={{color:Brand/Ink Raised}} padding="96px 40px 40px 40px" gap="64px";
SET {{id:components.footer.addressLabel}} text={{copy:global.footer.addressLabel}} inlineTextStyle={{text:Text/Label On Ink}};
SET {{id:components.footer.address}} text={{copy:brand.address}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.hoursLabel}} text={{copy:global.footer.hoursLabel}} inlineTextStyle={{text:Text/Label On Ink}};
SET {{id:components.footer.hours0}} text={{copy:global.footer.hours.0}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.hours1}} text={{copy:global.footer.hours.1}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.hours2}} text={{copy:global.footer.hours.2}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.contactLabel}} text={{copy:global.footer.contactLabel}} inlineTextStyle={{text:Text/Label On Ink}};
SET {{id:components.footer.email}} text={{copy:brand.email}} link={{copy:brand.emailHref}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.phone}} text={{copy:brand.phone}} link={{copy:brand.phoneHref}} inlineTextStyle={{text:Text/Body On Ink}};
SET {{id:components.footer.wordmark}} text={{copy:global.footer.wordmark}} inlineTextStyle={{text:Heading/Wordmark}};
SET {{id:components.footer.note}} text={{copy:global.footer.note}} inlineTextStyle={{text:Text/Label On Ink}};
// Footer nav: eight links from copy global.footer.nav / navHrefs, Text/Body On Ink, one column on
// desktop, two columns on phone. Imprint and Styleguide are the last two.
