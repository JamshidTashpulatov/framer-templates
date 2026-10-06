// 34 · Surgeon letter on Brand/Ink. First person, short. Portrait in a white mat, credential chips as a
// list (no periods), no logo wall.
// Desktop: 12-col grid. Mat cols 1–5: Fixed/White, radius 16, padding 4, image radius 12, aspect 4:5.
// Letter cols 7–12, vertically centred: H2 On Ink, two paragraphs (Text/Body On Ink, max 560px, gap 16),
// name (Text/Card Title in Text/On Ink), chips (pill, border 1px Alpha/On Ink 16, Text/Label On Ink),
// link (Link/On Ink). Tablet: 6 / 6. Phone: mat first, letter below, gap 32.

+FrameNode surgeonSection parent={{id:pages.homeDesktop}};
SET surgeonSection name="Surgeon" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 128px 40px" backgroundColor={{color:Brand/Ink}};

+FrameNode surgeonGrid parent=surgeonSection;
SET surgeonGrid name="Container" layout="grid" gridColumnCount=12 gap="32px" width="100%" maxWidth={{px:section.maxWidth}};

+FrameNode surgeonMat parent=surgeonGrid;
SET surgeonMat name="Portrait mat" gridItemColumnSpan=5 padding="4px 4px 4px 4px" borderRadius="16px" backgroundColor={{color:Fixed/White}};

+FrameNode surgeonPhoto parent=surgeonMat;
SET surgeonPhoto name="Portrait" width="100%" aspectRatio=0.8 borderRadius="12px" overflow="hidden" backgroundImage={{image:surgeon}};

+FrameNode surgeonLetter parent=surgeonGrid;
SET surgeonLetter name="Letter" gridItemColumnSpan=6 layout="stack" stackDirection="vertical" stackDistribution="center" gap="24px" padding="0px 0px 0px 48px";

+TextNode surgeonTitle parent=surgeonLetter;
SET surgeonTitle name="H2" text={{copy:home.surgeon.h2}} inlineTextStyle={{text:Heading/H2 On Ink}};

+TextNode surgeonP1 parent=surgeonLetter;
SET surgeonP1 name="Paragraph 1" text={{copy:home.surgeon.paragraphs.0}} inlineTextStyle={{text:Text/Body On Ink}} maxWidth="560px";

+TextNode surgeonP2 parent=surgeonLetter;
SET surgeonP2 name="Paragraph 2" text={{copy:home.surgeon.paragraphs.1}} inlineTextStyle={{text:Text/Body On Ink}} maxWidth="560px";

+TextNode surgeonName parent=surgeonLetter;
SET surgeonName name="Name" text={{copy:home.surgeon.name}} inlineTextStyle={{text:Text/Lead On Ink}};

+FrameNode surgeonChips parent=surgeonLetter;
SET surgeonChips name="Credentials" layout="stack" stackDirection="horizontal" gap="8px" stackWrapEnabled=true;

+TextNode cred0 parent=surgeonChips;
SET cred0 name="Credential" text={{copy:home.surgeon.chips.0}} inlineTextStyle={{text:Text/Label On Ink}};
+TextNode cred1 parent=surgeonChips;
SET cred1 name="Credential" text={{copy:home.surgeon.chips.1}} inlineTextStyle={{text:Text/Label On Ink}};
+TextNode cred2 parent=surgeonChips;
SET cred2 name="Credential" text={{copy:home.surgeon.chips.2}} inlineTextStyle={{text:Text/Label On Ink}};
+TextNode cred3 parent=surgeonChips;
SET cred3 name="Credential" text={{copy:home.surgeon.chips.3}} inlineTextStyle={{text:Text/Label On Ink}};

+TextNode surgeonLink parent=surgeonLetter;
SET surgeonLink name="Link" text={{copy:home.surgeon.link}} link={{copy:home.surgeon.linkHref}} inlineTextStyle={{text:Text/Body On Ink}};
// Apply link preset Link/On Ink to surgeonLink. Portrait alt text: home.surgeon.alt.
