import { SITE } from "../constants/site";
import {
  LAST_DAY,
  ProIncludes,
  START_DAY,
  SignOff,
  plansUrl,
} from "./_black-friday";
import { CtaButton, EmailLayout, Paragraph, unsubscribeLink } from "./_layout";

// Black Friday draft 1 of 4, sent the Wednesday before the sale. Says the sale
// is coming and when, not how much: naming the discount early makes people
// wait for it. See _black-friday.tsx.

export const blackFridayTeaserSubject = `Black Friday week at ${SITE.NAME} starts ${START_DAY}`;

const BlackFridayTeaserEmail = () => (
  <EmailLayout
    heading="Black Friday week is coming"
    preview={`The one time this year ${SITE.NAME} Pro and Business go on sale.`}
    reason="You received this because you have an account on"
    footer={unsubscribeLink}
  >
    <Paragraph>Hi {"{{{FIRST_NAME|there}}}"},</Paragraph>
    <Paragraph>
      On {START_DAY}, {SITE.NAME} starts Black Friday week: the one time this
      year Pro and Business go on sale. It runs through Cyber Monday, {LAST_DAY}
      .
    </Paragraph>
    <Paragraph>
      If you’ve been meaning to try Pro, that’s the week. Here’s what it
      unlocks:
    </Paragraph>
    <ProIncludes />
    <Paragraph>I’ll email you the morning it opens.</Paragraph>
    <CtaButton href={plansUrl("teaser")}>See what’s in Pro</CtaButton>
    <SignOff />
  </EmailLayout>
);

export default BlackFridayTeaserEmail;
