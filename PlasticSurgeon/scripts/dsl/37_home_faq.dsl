// 37 · FAQ. Day, top padding 0 (shares the gap with Notes). Desktop: heading + link in cols 1–4,
// accordion in cols 6–12. Phone: stacked.
// FAQ Item component (variants Closed / Open, Hover): 1px Alpha/Ink 14 top border; row padding 24 0;
// question Text/Lead weight 500 on the left edge, Phosphor Plus/Minus (light, 20px) centred vertically
// on the right. Answer Text/Body Muted, max 560px, height auto. Open/close: height + opacity, spring
// 0.35 / 0.1; reduced motion jumps. The whole row is the button; Enter and Space toggle; focus ring
// as Buttons. Collection List: FAQ, filter Show on Home is true, limit 5.

+FrameNode faqSection parent={{id:pages.homeDesktop}};
SET faqSection name="FAQ" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="0px 40px 128px 40px" backgroundColor={{color:Background/Day}};

+FrameNode faqGrid parent=faqSection;
SET faqGrid name="Container" layout="grid" gridColumnCount=12 gap="32px" width="100%" maxWidth={{px:section.maxWidth}} padding="64px 0px 0px 0px" border="1px 0px 0px 0px solid rgba(26, 34, 44, 0.14)";

+FrameNode faqHeader parent=faqGrid;
SET faqHeader name="Header" gridItemColumnSpan=4 layout="stack" stackDirection="vertical" gap="16px";

+TextNode faqTitle parent=faqHeader;
SET faqTitle name="H2" text={{copy:home.faq.h2}} inlineTextStyle={{text:Heading/H2}};

+TextNode faqLink parent=faqHeader;
SET faqLink name="Link" text={{copy:home.faq.link}} link={{copy:home.faq.linkHref}} inlineTextStyle={{text:Text/Body}};
// Apply link preset Link/Oxide to faqLink.

+FrameNode faqList parent=faqGrid;
SET faqList name="Questions" gridItemColumnSpan=7 layout="stack" stackDirection="vertical" gap="0px";
// Collection List inside faqList: collection {{id:collections.faq}}, Show on Home = true, limit 5,
// item = FAQ Item instance with Question / Answer bound. Offset the list one column (cols 6–12).
