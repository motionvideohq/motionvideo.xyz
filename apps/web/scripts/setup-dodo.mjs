// Idempotent Dodo Payments setup for MotionVideo: brand, products, GitHub
// repository entitlement, and webhook endpoint. Re-running
// finds what already exists by name or URL and only creates the rest (and
// replaces a product whose price changed).
//
//   pnpm dodo:setup            test mode (DODO_PAYMENTS_API_KEY), writes IDs to .env
//   pnpm dodo:setup --live     live mode (DODO_PAYMENTS_LIVE_API_KEY), writes IDs to wrangler.jsonc
//   pnpm dodo:setup --test-webhook-url=https://<tunnel>/api/webhook/dodo
//                              also registers a test-mode webhook at a public tunnel URL
//   pnpm -s dodo:setup --live --print-secret=webhook-key | pnpm wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY
//   pnpm -s dodo:setup --live --print-secret=api-key | pnpm wrangler secret put DODO_PAYMENTS_API_KEY
//                              pipe a live secret straight into wrangler without displaying it
//
// Progress goes to stderr; stdout carries only a secret requested with
// --print-secret. Other brands in the business are never modified.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import DodoPayments from "dodopayments";

const ENV_FILE = ".env";
const WRANGLER_FILE = "wrangler.jsonc";
const SITE_URL = "https://motionvideo.xyz";
const LIVE_WEBHOOK_URL = `${SITE_URL}/api/webhook/dodo`;
const GITHUB_REPO = "motionvideohq/motionvideo-skill";

const BRAND = {
  description:
    "MotionVideo: a gallery and directory of AI-made motion videos, and MotionVideo Pro, a library of motion techniques and an agent skill that writes motion videos in code.",
  name: "MotionVideo",
  statement_descriptor: "MOTIONVIDEO",
  support_email: "hello@motionvideo.xyz",
  url: SITE_URL,
};

const ENTITLEMENT_NAME = "MotionVideo Skill repository";

// A renewing subscription billed every `interval`. The subscription period is
// longer than any billing cycle so it renews until cancelled.
const recurringPrice = (cents, interval) => ({
  currency: "USD",
  payment_frequency_count: 1,
  payment_frequency_interval: interval,
  price: cents,
  purchasing_power_parity: false,
  subscription_period_count: 20,
  subscription_period_interval: "Year",
  tax_inclusive: false,
  type: "recurring_price",
});

const oneTimePrice = (cents) => ({
  currency: "USD",
  price: cents,
  purchasing_power_parity: false,
  tax_inclusive: false,
  type: "one_time_price",
});

const PRO_SUMMARY =
  "MotionVideo Pro: the full Moves library of motion techniques with copy-ready prompts, every prompt template (full prompts and the template customizer), the Pro agent skill (read-only access to a private GitHub repository), the Pro tools of the MotionVideo MCP server (sign in with your account), every future update, and a commercial license.";
const BUSINESS_SUMMARY = `MotionVideo Business: everything in MotionVideo Pro for a team of 3 seats (the buyer plus 2 invited members), with a commercial license.`;

const PRODUCTS = [
  // Retired: the one-time Skill Bundle is no longer sold. Its ID is kept
  // (looked up, never created or repriced) because its buyers keep their
  // repository access and are recognized by their payments for it.
  {
    envKey: "DODO_PRODUCT_SKILL",
    name: "MotionVideo Skill Bundle",
    retired: true,
  },
  // MotionVideo Pro and Business. Keep in sync with PLAN_PRICE_CENTS and
  // BUSINESS_SEATS in src/constants/plans.ts.
  {
    envKey: "DODO_PRODUCT_PRO_MONTHLY",
    name: "MotionVideo Pro — Monthly",
    description: `${PRO_SUMMARY} Billed monthly; cancel anytime.`,
    price: recurringPrice(900, "Month"),
  },
  {
    envKey: "DODO_PRODUCT_PRO_ANNUAL",
    name: "MotionVideo Pro — Annual",
    description: `${PRO_SUMMARY} Billed yearly; cancel anytime.`,
    price: recurringPrice(7900, "Year"),
  },
  {
    envKey: "DODO_PRODUCT_PRO_LIFETIME",
    name: "MotionVideo Pro — Lifetime",
    description: `${PRO_SUMMARY} One-time payment; nothing renews.`,
    price: oneTimePrice(14_900),
  },
  {
    envKey: "DODO_PRODUCT_BUSINESS_MONTHLY",
    name: "MotionVideo Business — Monthly",
    description: `${BUSINESS_SUMMARY} Billed monthly; cancel anytime.`,
    price: recurringPrice(2900, "Month"),
  },
  {
    envKey: "DODO_PRODUCT_BUSINESS_ANNUAL",
    name: "MotionVideo Business — Annual",
    description: `${BUSINESS_SUMMARY} Billed yearly; cancel anytime.`,
    price: recurringPrice(24_900, "Year"),
  },
  // Sponsorships, per tier: monthly (a renewing subscription) or one 30-day
  // run, both at the same price. Keep in sync with SPONSOR_PRICE_USD.
  ...[
    ["DIAMOND", "Diamond", 25_000],
    ["GOLD", "Gold", 15_000],
    ["SILVER", "Silver", 10_000],
  ].flatMap(([key, tier, cents]) => [
    {
      envKey: `DODO_PRODUCT_SPONSOR_${key}`,
      name: `MotionVideo Sponsor — ${tier}`,
      description: `${tier} sponsorship of motionvideo.xyz: a labelled sponsored placement, billed monthly. Cancel anytime.`,
      price: recurringPrice(cents, "Month"),
    },
    {
      envKey: `DODO_PRODUCT_SPONSOR_${key}_ONCE`,
      name: `MotionVideo Sponsor — ${tier} (30 days)`,
      description: `${tier} sponsorship of motionvideo.xyz: a labelled sponsored placement for 30 days from approval. One-time payment; nothing renews.`,
      price: oneTimePrice(cents),
    },
  ]),
  ...[
    ["STANDARD", "Standard", 9900],
    ["FEATURED", "Featured", 19_900],
  ].map(([key, plan, cents]) => ({
    envKey: `DODO_PRODUCT_JOB_${key}`,
    name: `MotionVideo Job Post — ${plan}`,
    description: `${plan} job listing on motionvideo.xyz/jobs for 30 days from approval. One-time payment; nothing renews.`,
    price: oneTimePrice(cents),
  })),
];

const WEBHOOK_EVENTS = [
  "payment.succeeded",
  "payment.failed",
  "refund.succeeded",
  "dispute.opened",
  "subscription.active",
  "subscription.renewed",
  "subscription.on_hold",
  "subscription.past_due",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
  "subscription.plan_changed",
  "subscription.updated",
  "entitlement_grant.delivered",
  "entitlement_grant.failed",
  "entitlement_grant.revoked",
];

const args = process.argv.slice(2);
const live = args.includes("--live");
const flag = (name) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const printSecret = flag("print-secret");
const testWebhookUrl = flag("test-webhook-url");

const log = (...parts) => console.error(...parts);

process.loadEnvFile(ENV_FILE);
const apiKey = live
  ? process.env.DODO_PAYMENTS_LIVE_API_KEY
  : process.env.DODO_PAYMENTS_API_KEY;
if (!apiKey) {
  throw new Error(
    `Set ${live ? "DODO_PAYMENTS_LIVE_API_KEY" : "DODO_PAYMENTS_API_KEY"} in ${ENV_FILE}`
  );
}
const environment = live ? "live_mode" : "test_mode";
const dodo = new DodoPayments({ bearerToken: apiKey, environment });

const collect = async (page) => {
  const items = [];
  for await (const item of page) {
    items.push(item);
  }
  return items;
};

const findWebhook = async (url) => {
  const hooks = await collect(dodo.webhooks.list());
  return hooks.find((hook) => hook.url === url);
};

if (printSecret) {
  if (!live) {
    throw new Error("--print-secret is only for live secrets");
  }
  if (printSecret === "api-key") {
    process.stdout.write(apiKey);
  } else if (printSecret === "webhook-key") {
    const hook = await findWebhook(LIVE_WEBHOOK_URL);
    if (!hook) {
      throw new Error("Run `pnpm dodo:setup --live` first");
    }
    const { secret } = await dodo.webhooks.retrieveSecret(hook.id);
    process.stdout.write(secret);
  } else {
    throw new Error("--print-secret must be api-key or webhook-key");
  }
  process.exit(0);
}

log(`Dodo Payments setup (${environment})\n`);

// Brand
const { items: brands } = await dodo.brands.list();
let brand = brands.find((item) => item.name === BRAND.name);
if (brand) {
  log(`brand     found    ${brand.brand_id}`);
} else {
  brand = await dodo.brands.create(BRAND);
  log(`brand     created  ${brand.brand_id}`);
}
const brandId = brand.brand_id;

// Products (searched only within the MotionVideo brand)
const existingProducts = await collect(
  dodo.products.list({ archived: false, brand_id: brandId })
);
const productEntries = await Promise.all(
  PRODUCTS.map(async (product) => {
    const match = existingProducts.find((item) => item.name === product.name);
    if (product.retired) {
      if (!match) {
        // Left out of the IDs below, so a configured ID is never blanked.
        log(`product   retired  not found  ${product.name}`);
        return null;
      }
      log(`product   retired  ${match.product_id}  ${product.name}`);
      return [product.envKey, match.product_id];
    }
    if (match) {
      const current = await dodo.products.retrieve(match.product_id);
      if (current.brand_id !== brandId) {
        throw new Error(
          `${product.name} (${match.product_id}) is not in the MotionVideo brand`
        );
      }
      if (current.price.price === product.price.price) {
        log(`product   found    ${match.product_id}  ${product.name}`);
        return [product.envKey, match.product_id];
      }
      // Dodo can't reprice a product: archive it (existing customers keep
      // their terms) and create the new price below. The site only sells
      // and recognizes the product IDs written at the end of this run.
      await dodo.products.archive(match.product_id);
      log(
        `product   archived ${match.product_id}  ${product.name} (was ${current.price.price}, now ${product.price.price})`
      );
    }
    const created = await dodo.products.create({
      brand_id: brandId,
      description: product.description,
      name: product.name,
      price: product.price,
      tax_category: "digital_products",
    });
    log(`product   created  ${created.product_id}  ${product.name}`);
    return [product.envKey, created.product_id];
  })
);
const productIds = Object.fromEntries(productEntries.filter(Boolean));

// Adds an entitlement to each product, keeping the ones it already has. Each
// product's entitlement list is read and rewritten independently.
const attachEntitlement = (label, entitlement, products) =>
  Promise.all(
    products.map(async ({ envKey, name }) => {
      const productId = productIds[envKey];
      const product = await dodo.products.retrieve(productId);
      const attached = (product.entitlements ?? []).map((item) => item.id);
      if (attached.includes(entitlement)) {
        log(`${label.padEnd(9)} attached to ${name}`);
        return;
      }
      await dodo.products.update(productId, {
        entitlements: [...attached, entitlement].map((id) => ({
          entitlement_id: id,
        })),
      });
      log(`${label.padEnd(9)} attached to ${name} (now)`);
    })
  );

// Every Pro and Business product.
const PLAN_PRODUCTS = PRODUCTS.filter(
  (product) =>
    productIds[product.envKey] &&
    /^DODO_PRODUCT_(?<plan>PRO|BUSINESS)_/u.test(product.envKey)
);
const entitlements = await collect(dodo.entitlements.list());

// GitHub repository access (the Pro agent skill) for every Pro and Business
// product, and for the retired bundle so its buyers keep theirs. Requires the
// Dodo Payments GitHub App on the motionvideohq organization, which is a
// dashboard OAuth step.
const GITHUB_PRODUCTS = [
  ...PRODUCTS.filter(
    (product) => product.retired && productIds[product.envKey]
  ),
  ...PLAN_PRODUCTS,
];
let entitlementId = null;
try {
  let entitlement = entitlements.find(
    (item) =>
      item.integration_type === "github" && item.name === ENTITLEMENT_NAME
  );
  if (entitlement) {
    log(`github    found    ${entitlement.id}`);
  } else {
    entitlement = await dodo.entitlements.create({
      integration_config: { permission: "pull", target_id: GITHUB_REPO },
      integration_type: "github",
      name: ENTITLEMENT_NAME,
    });
    log(`github    created  ${entitlement.id}`);
  }
  entitlementId = entitlement.id;
  await attachEntitlement("github", entitlementId, GITHUB_PRODUCTS);
} catch (error) {
  log(`github    skipped  ${error.status ?? ""} ${error.message}`);
  log(
    `          Dashboard (${environment}): Entitlements → + → GitHub Access → Connect GitHub,\n` +
      `          install the app on motionvideohq, pick ${GITHUB_REPO} with "pull",\n` +
      `          name it "${ENTITLEMENT_NAME}", then attach it to every MotionVideo Pro\n` +
      "          and Business product and the retired MotionVideo Skill Bundle\n" +
      "          (or re-run this script once GitHub is connected)."
  );
}

// Webhook endpoint. Endpoints are business-wide, so this one also receives
// events for other brands; the route only acknowledges verified deliveries.
const webhookUrl = live ? LIVE_WEBHOOK_URL : testWebhookUrl;
let webhookId = null;
let webhookSecret = null;
if (webhookUrl) {
  let hook = await findWebhook(webhookUrl);
  if (hook) {
    // Existing endpoints keep their filter; add events introduced since. An
    // empty filter already receives every event.
    const filter = hook.filter_types ?? [];
    const missing = WEBHOOK_EVENTS.filter((type) => !filter.includes(type));
    if (filter.length > 0 && missing.length > 0) {
      hook = await dodo.webhooks.update(hook.id, {
        filter_types: [...filter, ...missing],
      });
      log(`webhook   updated  ${hook.id}  +${missing.join(" +")}`);
    } else {
      log(`webhook   found    ${hook.id}  ${hook.url}`);
    }
  } else {
    hook = await dodo.webhooks.create({
      description: "MotionVideo",
      filter_types: WEBHOOK_EVENTS,
      url: webhookUrl,
    });
    log(`webhook   created  ${hook.id}  ${hook.url}`);
  }
  webhookId = hook.id;
  ({ secret: webhookSecret } = await dodo.webhooks.retrieveSecret(hook.id));
} else {
  log(
    "webhook   skipped  test mode has no public URL; pass --test-webhook-url=<tunnel>/api/webhook/dodo to register one"
  );
}

const ids = productIds;

if (live) {
  // Non-secret production config lives in wrangler.jsonc `vars`.
  let wrangler = readFileSync(WRANGLER_FILE, "utf-8");
  for (const [key, value] of Object.entries(ids)) {
    const pattern = new RegExp(`("${key}":\\s*)"[^"]*"`, "u");
    if (!pattern.test(wrangler)) {
      throw new Error(`Add "${key}" to vars in ${WRANGLER_FILE}`);
    }
    wrangler = wrangler.replace(pattern, `$1"${value}"`);
  }
  writeFileSync(WRANGLER_FILE, wrangler);
  log(`\nWrote live IDs to ${WRANGLER_FILE} vars.`);
} else {
  // Local development overrides wrangler.jsonc vars from .env.
  const values = { DODO_PAYMENTS_ENVIRONMENT: "test_mode", ...ids };
  let file = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf-8") : "";
  const currentKey = file.match(/^DODO_PAYMENTS_WEBHOOK_KEY=(?<key>.+)$/mu)
    ?.groups?.key;
  // Without a test endpoint, a local key still lets /api/webhook/dodo verify
  // sample deliveries signed with it.
  values.DODO_PAYMENTS_WEBHOOK_KEY =
    webhookSecret ??
    currentKey ??
    `whsec_${randomBytes(24).toString("base64")}`;
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "mu");
    file = pattern.test(file)
      ? file.replace(pattern, line)
      : `${file.replace(/\n*$/u, "\n")}${line}\n`;
  }
  writeFileSync(ENV_FILE, file);
  log(`\nWrote test IDs and DODO_PAYMENTS_WEBHOOK_KEY to ${ENV_FILE}.`);
}

log("\nIDs");
log(`  brand        ${brandId}`);
for (const [key, value] of Object.entries(ids)) {
  log(`  ${key.padEnd(30)} ${value}`);
}
log(`  github entitlement             ${entitlementId ?? "not created"}`);
log(`  webhook endpoint               ${webhookId ?? "not created"}`);

if (live) {
  log(
    "\nSet the production secrets (values are piped, never displayed):\n" +
      "  pnpm -s dodo:setup --live --print-secret=api-key | pnpm wrangler secret put DODO_PAYMENTS_API_KEY\n" +
      "  pnpm -s dodo:setup --live --print-secret=webhook-key | pnpm wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY"
  );
}
