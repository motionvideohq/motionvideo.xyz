import { Heading } from "react-email";

import { ROUTES } from "../constants/routes";
import { SITE } from "../constants/site";
import { SITE_ORIGIN } from "../constants/url";
import {
  CtaButton,
  EmailLayout,
  INK,
  InlineLink,
  Item,
  List,
  Paragraph,
  unsubscribeLink,
} from "./_layout";

export const proLaunchSubject = `${SITE.NAME} Pro is here`;

// The Pro launch announcement. Not sent by the app: `pnpm resend:setup`
// renders it and uploads it to Resend as a template and a draft Broadcast.
// `{{{FIRST_NAME|there}}}` and `{{{RESEND_UNSUBSCRIBE_URL}}}` are filled in by
// Resend per Contact.

const url = (path: string) => `${SITE_ORIGIN}${path}`;

const ProLaunchEmail = () => (
  <EmailLayout
    heading={proLaunchSubject}
    preview="The Moves library, every prompt template, the Pro agent skill and Pro MCP tools."
    reason="You received this because you have an account on"
    footer={unsubscribeLink}
  >
    <Paragraph>Hi {"{{{FIRST_NAME|there}}}"},</Paragraph>
    <Paragraph>
      {SITE.NAME} Pro is live. It turns the gallery into something you can build
      with:
    </Paragraph>
    <List>
      <Item>
        Every move in the{" "}
        <InlineLink href={url(ROUTES.MOVES)}>Moves library</InlineLink>, with
        its copy-ready prompt
      </Item>
      <Item>
        Every{" "}
        <InlineLink href={url(ROUTES.TEMPLATES)}>prompt template</InlineLink>,
        with its full prompt and the customizer
      </Item>
      <Item>
        The Pro agent skill: {SITE.NAME}’s motion-design knowledge for Claude
        Code, Cursor and other agents
      </Item>
      <Item>
        Pro MCP tools: search moves and pull full prompts by signing in with
        your account
      </Item>
      <Item>Every future move, template, skill and MCP update, free</Item>
    </List>
    <Paragraph>
      Monthly, annual and lifetime plans, and a Business plan with seats for
      teams.
    </Paragraph>
    <CtaButton href={url(ROUTES.PRO)}>See {SITE.NAME} Pro</CtaButton>
    <Heading
      as="h2"
      style={{
        color: INK,
        fontSize: 20,
        fontWeight: 600,
        margin: "32px 0 16px",
      }}
    >
      Also new
    </Heading>
    <List>
      <Item>A page for every model and for prompt or skill videos</Item>
      <Item>One filter control for the gallery, a drawer on phones</Item>
      <Item>Prompts translated into every supported language</Item>
    </List>
    <Paragraph>
      Everything else is in the{" "}
      <InlineLink href={url(ROUTES.CHANGELOG)}>changelog</InlineLink>.
    </Paragraph>
    <Paragraph>
      Questions or ideas? Just reply, it comes straight to me.
    </Paragraph>
    <Paragraph>— Aniket</Paragraph>
  </EmailLayout>
);

export default ProLaunchEmail;
