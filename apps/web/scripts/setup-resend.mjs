// Idempotent Resend setup for MotionVideo announcements. The Resend team is
// shared with other brands, so everything here is prefixed "MotionVideo".
//
//   pnpm resend:setup     (RESEND_API_KEY from .env, users from the remote D1)
//
// 1. Segment "MotionVideo users", holding every account's email as a Contact.
//    Re-running adds accounts created since; existing Contacts (and their
//    unsubscribes) are left as they are.
// 2. Template "MotionVideo Pro launch" (alias motionvideo-pro-launch), rendered
//    from src/emails/pro-launch.tsx and created only if missing, so edits made
//    in the Resend editor are never overwritten.
// 3. Draft Broadcast "MotionVideo Pro launch" to that segment, same HTML.
//    Nothing is sent: review and send it from the Broadcasts page.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import nodePath from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const API = "https://api.resend.com";
const FROM = '"Aniket @ MotionVideo" <hello@motionvideo.xyz>';
const SEGMENT_NAME = "MotionVideo users";
const TEMPLATE_ALIAS = "motionvideo-pro-launch";
const TEMPLATE_NAME = "MotionVideo Pro launch";
// Keep in sync with proLaunchSubject in src/emails/pro-launch.tsx.
const SUBJECT = "MotionVideo Pro is here";

const KEY = process.env.RESEND_API_KEY;
if (!KEY) {
  throw new Error("RESEND_API_KEY is not set (.env)");
}

// Resend allows a few requests per second per team; space them out and retry
// once on 429. Sequential on purpose, hence the awaits in loops below.
const resend = async (method, path, body) => {
  for (let attempt = 0; ; attempt += 1) {
    const init = {
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      method,
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    // oxlint-disable-next-line no-await-in-loop -- rate limit spacing
    await sleep(300);
    // oxlint-disable-next-line no-await-in-loop -- one request at a time
    const res = await fetch(`${API}${path}`, init);
    if (res.status === 429 && attempt === 0) {
      // oxlint-disable-next-line no-await-in-loop -- back off before the retry
      await sleep(1500);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- the loop only retries once
    const data = await res.json().catch(() => ({}));
    return { data, ok: res.ok, status: res.status };
  }
};

const must = async (method, path, body) => {
  const res = await resend(method, path, body);
  if (!res.ok) {
    throw new Error(
      `${method} ${path}: ${res.status} ${JSON.stringify(res.data)}`
    );
  }
  return res.data;
};

const users = () => {
  const out = execFileSync(
    "pnpm",
    [
      "-s",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--remote",
      "--json",
      "--command",
      "SELECT email, name FROM user ORDER BY created_at",
    ],
    { encoding: "utf-8" }
  );
  return JSON.parse(out)[0].results;
};

const ensureSegment = async () => {
  const { data } = await must("GET", "/segments");
  const found = data.find((segment) => segment.name === SEGMENT_NAME);
  if (found) {
    return found.id;
  }
  const created = await must("POST", "/segments", { name: SEGMENT_NAME });
  console.error(`Created segment ${SEGMENT_NAME}`);
  return created.id;
};

const syncContacts = async (segmentId) => {
  let added = 0;
  for (const { email, name } of users()) {
    const firstName = name?.trim().split(/\s+/u)[0] || undefined;
    // oxlint-disable-next-line no-await-in-loop -- rate limit: one contact at a time
    const created = await resend("POST", "/contacts", {
      email,
      first_name: firstName,
      segments: [{ id: segmentId }],
    });
    if (created.ok) {
      added += 1;
      continue;
    }
    // Already a Contact (another brand, or an earlier run): only make sure it
    // is in this segment.
    // oxlint-disable-next-line no-await-in-loop -- rate limit: one contact at a time
    await must(
      "POST",
      `/contacts/${encodeURIComponent(email)}/segments/${segmentId}`
    );
  }
  console.error(`Contacts: ${added} new in ${SEGMENT_NAME}`);
};

// src/emails/pro-launch.tsx rendered to HTML by the React Email CLI.
const renderProLaunch = () => {
  const outDir = mkdtempSync(nodePath.join(tmpdir(), "motionvideo-email-"));
  try {
    execFileSync(
      "pnpm",
      ["-s", "email", "export", "--dir", "src/emails", "--outDir", outDir],
      { stdio: ["ignore", "ignore", "inherit"] }
    );
    return readFileSync(nodePath.join(outDir, "pro-launch.html"), "utf-8");
  } finally {
    rmSync(outDir, { force: true, recursive: true });
  }
};

const HTML = renderProLaunch();

// Broadcasts take the inline fallback (`{{{FIRST_NAME|there}}}`); Templates
// reject the pipe, and FIRST_NAME is a reserved Contact variable they can't
// declare a fallback for, so the template copy uses the bare variable.
const TEMPLATE_HTML = HTML.replaceAll(
  "{{{FIRST_NAME|there}}}",
  "{{{FIRST_NAME}}}"
);

const ensureTemplate = async () => {
  const existing = await resend("GET", `/templates/${TEMPLATE_ALIAS}`);
  if (existing.ok) {
    console.error(`Template ${TEMPLATE_NAME} exists; left unchanged`);
    return;
  }
  const created = await must("POST", "/templates", {
    alias: TEMPLATE_ALIAS,
    from: FROM,
    html: TEMPLATE_HTML,
    name: TEMPLATE_NAME,
    subject: SUBJECT,
  });
  await must("POST", `/templates/${created.id}/publish`);
  console.error(`Created template ${TEMPLATE_NAME}`);
};

const ensureBroadcast = async (segmentId) => {
  const { data } = await must("GET", "/broadcasts");
  if (data.some((broadcast) => broadcast.name === TEMPLATE_NAME)) {
    console.error(`Broadcast ${TEMPLATE_NAME} exists; left unchanged`);
    return;
  }
  await must("POST", "/broadcasts", {
    from: FROM,
    html: HTML,
    name: TEMPLATE_NAME,
    reply_to: "hello@motionvideo.xyz",
    segment_id: segmentId,
    subject: SUBJECT,
  });
  console.error(`Created draft broadcast ${TEMPLATE_NAME} (not sent)`);
};

const segmentId = await ensureSegment();
await syncContacts(segmentId);
await ensureTemplate();
await ensureBroadcast(segmentId);
