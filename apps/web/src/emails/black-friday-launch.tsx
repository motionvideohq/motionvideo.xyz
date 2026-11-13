import { SITE } from "../constants/site";
import {
  BLACK_FRIDAY,
  FinePrint,
  LAST_DAY,
  PRO_ANNUAL_SALE_PRICE,
  ProIncludes,
  SalePrices,
  SignOff,
  plansUrl,
} from "./_black-friday";
import { CtaButton, EmailLayout, Paragraph, unsubscribeLink } from "./_layout";

// Black Friday draft 2 of 4, sent the morning the sale opens (Monday). See
// _black-friday.tsx.

export const blackFridayLaunchSubject = `${BLACK_FRIDAY.percentOff}% off ${SITE.NAME} Pro, through Cyber Monday`;

const BlackFridayLaunchEmail = () => (
  <EmailLayout
    heading="The Black Friday sale is on"
    preview={`Annual plans and Pro Lifetime are ${BLACK_FRIDAY.percentOff}% off through Cyber Monday.`}
    reason="You received this because you have an account on"
    footer={unsubscribeLink}
  >
    <Paragraph>Hi {"{{{FIRST_NAME|there}}}"},</Paragraph>
    <Paragraph>
      From today until the end of Cyber Monday, {LAST_DAY} (Pacific time),
      annual plans and Pro Lifetime are {BLACK_FRIDAY.percentOff}% off:
    </Paragraph>
    <SalePrices />
    <Paragraph>Pro gives your agent:</Paragraph>
    <ProIncludes />
    <CtaButton href={plansUrl("launch")}>
      Get Pro for {PRO_ANNUAL_SALE_PRICE} a year
    </CtaButton>
    <FinePrint />
    <SignOff />
  </EmailLayout>
);

export default BlackFridayLaunchEmail;
