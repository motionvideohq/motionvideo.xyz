import { SITE } from "../constants/site";
import {
  BLACK_FRIDAY,
  FinePrint,
  PRO_ANNUAL_SALE_PRICE,
  SalePrices,
  SignOff,
  plansUrl,
} from "./_black-friday";
import { CtaButton, EmailLayout, Paragraph, unsubscribeLink } from "./_layout";

// Black Friday draft 4 of 4, sent the morning of Cyber Monday, the last day.
// See _black-friday.tsx.

export const blackFridayLastCallSubject = `Last day: ${BLACK_FRIDAY.percentOff}% off ${SITE.NAME} Pro ends tonight`;

const BlackFridayLastCallEmail = () => (
  <EmailLayout
    heading="Last day of the Black Friday sale"
    preview={`${BLACK_FRIDAY.percentOff}% off annual plans and Pro Lifetime ends at midnight, Pacific time.`}
    reason="You received this because you have an account on"
    footer={unsubscribeLink}
  >
    <Paragraph>Hi {"{{{FIRST_NAME|there}}}"},</Paragraph>
    <Paragraph>
      Today is the last day of {SITE.NAME}’s Black Friday sale. At midnight
      Pacific time tonight, prices go back to normal until next year.
    </Paragraph>
    <SalePrices />
    <CtaButton href={plansUrl("last-call")}>
      Get Pro for {PRO_ANNUAL_SALE_PRICE} a year
    </CtaButton>
    <FinePrint />
    <SignOff />
  </EmailLayout>
);

export default BlackFridayLastCallEmail;
