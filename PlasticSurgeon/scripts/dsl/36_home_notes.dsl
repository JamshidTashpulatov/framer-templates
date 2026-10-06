// 36 · Patient notes. Day. Three quotes from the Notes collection, no cards, no star ratings, no avatars.
// Each note: quote (Text/Lead, max 32ch), hairline, meta row “Maya R. · Eyes · Back at work in week 2”
// (person Text/Label, zone as Oxide chip, weeks Text/Label Muted). Section note at the bottom.
// Desktop 3 columns gap 32; tablet 2 + 1; phone stacked gap 40.
// Notes and FAQ are both Day: they share one gap, so Notes has bottom padding 64 and FAQ top padding 0.

+FrameNode notesSection parent={{id:pages.homeDesktop}};
SET notesSection name="Notes" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 64px 40px" backgroundColor={{color:Background/Day}};

+FrameNode notesContainer parent=notesSection;
SET notesContainer name="Container" layout="stack" stackDirection="vertical" gap="48px" width="100%" maxWidth={{px:section.maxWidth}};

+TextNode notesTitle parent=notesContainer;
SET notesTitle name="H2" text={{copy:home.notes.h2}} inlineTextStyle={{text:Heading/H2}};

// Collection List: collection {{id:collections.notes}}, limit 3, grid 3 / 2 / 1, gap 32px.
// Item: Quote ← Quote (Text/Lead), Person ← Person, Zone ← Zone, Weeks ← Weeks.

+TextNode notesNote parent=notesContainer;
SET notesNote name="Note" text={{copy:home.notes.note}} inlineTextStyle={{text:Text/Label Muted}};
