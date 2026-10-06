// 38 · Private consult CTA on Brand/Ink. The quietest section on the page: heading, one sentence, one
// primary button (Primary On Ink), the phone number as a secondary link, and the reply-time note.
// Left edge matches every other section. No illustration, no gradient, no background photo.
// Ink consult band → Ink Raised footer: different tokens, so both keep their padding.

+FrameNode consultSection parent={{id:pages.homeDesktop}};
SET consultSection name="Consult" layout="stack" stackDirection="vertical" stackAlignment="center" width="100%" height="fit-content" padding="128px 40px 128px 40px" backgroundColor={{color:Brand/Ink}};

+FrameNode consultContainer parent=consultSection;
SET consultContainer name="Container" layout="stack" stackDirection="vertical" gap="24px" width="100%" maxWidth={{px:section.maxWidth}};

+TextNode consultTitle parent=consultContainer;
SET consultTitle name="H2" text={{copy:home.consult.h2}} inlineTextStyle={{text:Heading/H2 On Ink}};

+TextNode consultBody parent=consultContainer;
SET consultBody name="Body" text={{copy:home.consult.body}} inlineTextStyle={{text:Text/Lead On Ink}} maxWidth="560px";

+FrameNode consultActions parent=consultContainer;
SET consultActions name="Actions" layout="stack" stackDirection="horizontal" stackAlignment="center" gap="24px" stackWrapEnabled=true padding="8px 0px 0px 0px";

+ComponentInstanceNode consultCta parent=consultActions;
SET consultCta name="Primary" componentIdentifier={{id:components.button.identifier}} link={{copy:global.ctaHref}} $control__{{raw:components.button.labelControl}}={{copy:home.consult.cta}};
// Variant: Primary On Ink.

+TextNode consultPhone parent=consultActions;
SET consultPhone name="Phone" text={{copy:home.consult.ctaSecondary}} link={{copy:home.consult.ctaSecondaryHref}} inlineTextStyle={{text:Text/Body On Ink}};
// Apply link preset Link/On Ink to consultPhone.

+TextNode consultNote parent=consultContainer;
SET consultNote name="Note" text={{copy:home.consult.note}} inlineTextStyle={{text:Text/Label On Ink}};
