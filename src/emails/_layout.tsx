import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

import { SITE } from "../constants/site";
import { SITE_ORIGIN } from "../constants/url";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const INK = "#111111";
const MUTED = "#6b6b6b";
const DOMAIN = new URL(SITE_ORIGIN).host;

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <Text
    style={{
      color: MUTED,
      fontSize: 17,
      lineHeight: "1.6",
      margin: "0 0 16px",
    }}
  >
    {children}
  </Text>
);

// Logo, heading, copy, pill button, fallback link, and a footer explaining
// why the email was sent. Email clients ignore web fonts and <style> blocks,
// so everything is inline with a system font stack.
export const EmailLayout = ({
  action,
  children,
  heading,
  preview,
  reason,
}: {
  action: { label: string; url: string };
  children: ReactNode;
  heading: string;
  preview: string;
  /** Why the recipient got this email; the domain link is appended. */
  reason: string;
}) => (
  <Html lang="en">
    <Head>
      <meta name="color-scheme" content="light only" />
      <meta name="supported-color-schemes" content="light only" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: "#ffffff", fontFamily: FONT, margin: 0 }}>
      <Container style={{ maxWidth: 520, padding: "48px 24px" }}>
        <Section style={{ paddingBottom: 40 }}>
          <Link
            href={SITE_ORIGIN}
            style={{ color: INK, textDecoration: "none" }}
          >
            <Img
              src={`${SITE_ORIGIN}/brand/motionvideo-logomark-black.png`}
              width="38"
              height="18"
              alt=""
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <span
              style={{
                display: "inline-block",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                marginLeft: 8,
                verticalAlign: "middle",
              }}
            >
              {SITE.NAME}
            </span>
          </Link>
        </Section>
        <Heading
          as="h1"
          style={{
            color: INK,
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: "1.2",
            margin: "0 0 16px",
          }}
        >
          {heading}
        </Heading>
        {children}
        <Section style={{ padding: "16px 0 32px" }}>
          <Button
            href={action.url}
            style={{
              // Landing CTA (`--color-cta-from/to` in styles.css). Clients
              // without gradient support fall back to the solid color.
              backgroundColor: "#ffc933",
              backgroundImage: "linear-gradient(180deg,#ffdd73,#ffbe25)",
              border: "1px solid #fac83e",
              borderRadius: 16,
              color: "#0a0a0a",
              fontSize: 16,
              fontWeight: 600,
              padding: "16px 28px",
            }}
          >
            {action.label}
          </Button>
        </Section>
        <Text
          style={{ color: MUTED, fontSize: 14, lineHeight: "1.6", margin: 0 }}
        >
          If the button doesn’t work, open this link:
          <br />
          <Link
            href={action.url}
            style={{
              color: INK,
              textDecoration: "underline",
              wordBreak: "break-all",
            }}
          >
            {action.url}
          </Link>
        </Text>
        <Hr style={{ borderColor: "#e5e5e5", margin: "40px 0 24px" }} />
        <Text
          style={{ color: MUTED, fontSize: 13, lineHeight: "1.6", margin: 0 }}
        >
          {reason}{" "}
          <Link
            href={SITE_ORIGIN}
            style={{ color: MUTED, textDecoration: "underline" }}
          >
            {DOMAIN}
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
);
