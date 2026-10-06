// 35 · Starting prices on Surface/Mist. Three facts in one row, divided by hairlines, no cards: one
// scoreboard, not three stat cards. Label (Text/Label Muted On Mist) → price (Heading/Fact, tabular) →
// description (Text/Body Muted On Mist). Plain Text/Muted fails AA on Mist. Below: the written-quote note and a Link/Oxide link.
// Desktop: 3 columns, 1px Alpha/Ink 14 left border on columns 2 and 3, padding-left 32.
// Tablet: 3 columns at H2 tablet size. Phone: stacked, hairline top border between facts, gap 24.

+FrameNode priceSection parent={{id:pages.homeDesktop}};
SET priceSection name="Pricing" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 128px 40px" backgroundColor={{color:Surface/Mist}};

+FrameNode priceContainer parent=priceSection;
SET priceContainer name="Container" layout="stack" stackDirection="vertical" gap="48px" width="100%" maxWidth={{px:section.maxWidth}};

+TextNode priceTitle parent=priceContainer;
SET priceTitle name="H2" text={{copy:home.pricing.h2}} inlineTextStyle={{text:Heading/H2}};

+FrameNode priceFacts parent=priceContainer;
SET priceFacts name="Facts" layout="grid" gridColumnCount=3 gap="32px" width="100%";

+FrameNode fact0 parent=priceFacts;
SET fact0 name="Fact Consult" layout="stack" stackDirection="vertical" gap="8px";
+TextNode fact0Label parent=fact0;
SET fact0Label name="Label" text={{copy:home.pricing.facts.0.label}} inlineTextStyle={{text:Text/Label Muted On Mist}};
+TextNode fact0Price parent=fact0;
SET fact0Price name="Price" text={{copy:home.pricing.facts.0.price}} inlineTextStyle={{text:Heading/Fact}};
+TextNode fact0Desc parent=fact0;
SET fact0Desc name="Description" text={{copy:home.pricing.facts.0.description}} inlineTextStyle={{text:Text/Body Muted On Mist}};

+FrameNode fact1 parent=priceFacts;
SET fact1 name="Fact Face" layout="stack" stackDirection="vertical" gap="8px" padding="0px 0px 0px 32px" border="0px 0px 0px 1px solid rgba(26, 34, 44, 0.14)";
+TextNode fact1Label parent=fact1;
SET fact1Label name="Label" text={{copy:home.pricing.facts.1.label}} inlineTextStyle={{text:Text/Label Muted On Mist}};
+TextNode fact1Price parent=fact1;
SET fact1Price name="Price" text={{copy:home.pricing.facts.1.price}} inlineTextStyle={{text:Heading/Fact}};
+TextNode fact1Desc parent=fact1;
SET fact1Desc name="Description" text={{copy:home.pricing.facts.1.description}} inlineTextStyle={{text:Text/Body Muted On Mist}};

+FrameNode fact2 parent=priceFacts;
SET fact2 name="Fact Body" layout="stack" stackDirection="vertical" gap="8px" padding="0px 0px 0px 32px" border="0px 0px 0px 1px solid rgba(26, 34, 44, 0.14)";
+TextNode fact2Label parent=fact2;
SET fact2Label name="Label" text={{copy:home.pricing.facts.2.label}} inlineTextStyle={{text:Text/Label Muted On Mist}};
+TextNode fact2Price parent=fact2;
SET fact2Price name="Price" text={{copy:home.pricing.facts.2.price}} inlineTextStyle={{text:Heading/Fact}};
+TextNode fact2Desc parent=fact2;
SET fact2Desc name="Description" text={{copy:home.pricing.facts.2.description}} inlineTextStyle={{text:Text/Body Muted On Mist}};

+FrameNode priceFooter parent=priceContainer;
SET priceFooter name="Note" layout="stack" stackDirection="vertical" gap="16px";
+TextNode priceNote parent=priceFooter;
SET priceNote name="Note" text={{copy:home.pricing.note}} inlineTextStyle={{text:Text/Body}} maxWidth="640px";
+TextNode priceLink parent=priceFooter;
SET priceLink name="Link" text={{copy:home.pricing.link}} link={{copy:home.pricing.linkHref}} inlineTextStyle={{text:Text/Body}};
// Apply link preset Link/Oxide to priceLink.
