import type { ReactNode } from "react";
import {
  Body,
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
export const INK = "#111111";
export const MUTED = "#6b6b6b";
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

// Logo, heading, copy, the sign-in code in a large box (when there is one), and
// a footer explaining why the email was sent. Email clients ignore web fonts
// and <style> blocks, so everything is inline with a system font stack.
export const EmailLayout = ({
  code,
  children,
  footer,
  heading,
  preview,
  reason,
}: {
  /** One-time sign-in code, shown large and easy to copy. */
  code?: string;
  children: ReactNode;
  /** Appended to the footer line, e.g. an unsubscribe link. */
  footer?: ReactNode;
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
        {code ? (
          <Section style={{ padding: "8px 0 24px" }}>
            <Text
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 16,
                color: INK,
                fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: "0.3em",
                margin: 0,
                padding: "20px 0",
                textAlign: "center",
              }}
            >
              {code}
            </Text>
          </Section>
        ) : null}
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
          .{footer ? <> {footer}</> : null}
        </Text>
      </Container>
    </Body>
  </Html>
);
