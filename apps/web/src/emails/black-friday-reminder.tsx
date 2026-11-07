import { SITE } from "../constants/site";
import {
  BLACK_FRIDAY,
  FinePrint,
  LAST_DAY,
  PRO_ANNUAL_SALE_PRICE,
  SalePrices,
  SignOff,
  plansUrl,
} from "./_black-friday";
import { CtaButton, EmailLayout, Paragraph, unsubscribeLink } from "./_layout";

// Black Friday draft 3 of 4, sent on Black Friday itself. Short: the launch
// email already explained Pro. See _black-friday.tsx.

export const blackFridayReminderSubject = `It’s Black Friday: ${BLACK_FRIDAY.percentOff}% off ${SITE.NAME} Pro`;

const BlackFridayReminderEmail = () => (
  <EmailLayout
    heading={`It’s Black Friday: ${BLACK_FRIDAY.percentOff}% off Pro`}
    preview={`Annual plans and Pro Lifetime, until the end of Cyber Monday, ${LAST_DAY}.`}
    reason="You received this because you have an account on"
    footer={unsubscribeLink}
  >
    <Paragraph>Hi {"{{{FIRST_NAME|there}}}"},</Paragraph>
    <Paragraph>
      A quick reminder: {SITE.NAME}’s Black Friday prices run until the end of
      Cyber Monday, {LAST_DAY} (Pacific time).
    </Paragraph>
    <SalePrices />
    <CtaButton href={plansUrl("reminder")}>
      Get Pro for {PRO_ANNUAL_SALE_PRICE} a year
    </CtaButton>
    <FinePrint />
    <SignOff />
  </EmailLayout>
);

export default BlackFridayReminderEmail;
