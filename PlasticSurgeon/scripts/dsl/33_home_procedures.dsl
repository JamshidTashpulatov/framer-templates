// 33 · Procedures teaser. Day. Heading + intro, then zone chips, then six CMS cards.
// Chips are links into /procedures zone anchors. They are navigation, not a filter toy, so the Contact
// Sheet stays the only signature interaction. Chip: pill 999, padding 8 16, Text/Label, border
// 1px Alpha/Ink 14; hover fill Alpha/Ink 10; “All” uses Accent/Oxide text + Alpha/Ink 10 fill.
// Cards (Collection List of Procedures, limit 6, sort by a manual order field if present):
//   card: Surface/White, radius 16, border 1px Alpha/Ink 14, padding 4, gap 16, link /procedures/:slug
//   image: radius 12 (16 − 4 inset), aspect 3:2, inset hairline, bound to Image
//   body (padding 0 16 16 16, gap 8): Zone (Text/Label Muted) · Name (Text/Card Title) ·
//   fact row “From $4,800 · Downtime 7–10 days” (Text/Label, tabular) · “Read the plan” (Link/Oxide)
//   hover: border Alpha/Ink 14 → Brand/Ink at 24%, image scale 1.02 over the spring; pressed 0.99
//   focus: ring as Buttons on the card link
// Grid: 3 cols desktop, 2 tablet, 1 phone; gap 24. Stagger card reveal 40ms (opacity + 8px y).

+FrameNode procSection parent={{id:pages.homeDesktop}};
SET procSection name="Procedures" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 128px 40px" backgroundColor={{color:Background/Day}};

+FrameNode procContainer parent=procSection;
SET procContainer name="Container" layout="stack" stackDirection="vertical" gap="32px" width="100%" maxWidth={{px:section.maxWidth}};

+FrameNode procHeader parent=procContainer;
SET procHeader name="Header" layout="stack" stackDirection="vertical" gap="16px" width="100%";

+TextNode procTitle parent=procHeader;
SET procTitle name="H2" text={{copy:home.procedures.h2}} inlineTextStyle={{text:Heading/H2}};

+TextNode procIntro parent=procHeader;
SET procIntro name="Intro" text={{copy:home.procedures.intro}} inlineTextStyle={{text:Text/Body Muted}} maxWidth="560px";

+FrameNode procChips parent=procContainer;
SET procChips name="Zones" layout="stack" stackDirection="horizontal" gap="8px" stackWrapEnabled=true;

+TextNode chip0 parent=procChips;
SET chip0 name="Chip All" text={{copy:home.procedures.chips.0}} link={{copy:home.procedures.chipHrefs.0}} inlineTextStyle={{text:Text/Label}};
+TextNode chip1 parent=procChips;
SET chip1 name="Chip Eyes" text={{copy:home.procedures.chips.1}} link={{copy:home.procedures.chipHrefs.1}} inlineTextStyle={{text:Text/Label}};
+TextNode chip2 parent=procChips;
SET chip2 name="Chip Nose" text={{copy:home.procedures.chips.2}} link={{copy:home.procedures.chipHrefs.2}} inlineTextStyle={{text:Text/Label}};
+TextNode chip3 parent=procChips;
SET chip3 name="Chip Jaw" text={{copy:home.procedures.chips.3}} link={{copy:home.procedures.chipHrefs.3}} inlineTextStyle={{text:Text/Label}};
+TextNode chip4 parent=procChips;
SET chip4 name="Chip Breast" text={{copy:home.procedures.chips.4}} link={{copy:home.procedures.chipHrefs.4}} inlineTextStyle={{text:Text/Label}};
+TextNode chip5 parent=procChips;
SET chip5 name="Chip Body" text={{copy:home.procedures.chips.5}} link={{copy:home.procedures.chipHrefs.5}} inlineTextStyle={{text:Text/Label}};
// Wrap each chip text in a pill frame (padding 8px 16px, radius 999, border 1px Alpha/Ink 14) once the
// grammar for wrapping is known; or build one “Chip” component with Default / Hover / Active variants.

// Collection List: collection {{id:collections.procedures}}, limit 6, grid 3 / 2 / 1, gap 24px.
// Card link label: home.procedures.cardLink. Fact prefix: home.procedures.downtimeLabel.
