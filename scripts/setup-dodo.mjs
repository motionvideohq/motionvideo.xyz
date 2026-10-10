// Idempotent Dodo Payments setup for MotionVideo: brand, products, launch
// discount, GitHub repository entitlement, and webhook endpoint. Re-running
// finds what already exists by name, code, or URL and only creates the rest.
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
    "MotionVideo: a gallery and directory of AI-made motion videos, and the MotionVideo Skill Bundle, an agent skill that writes motion videos in code.",
  name: "MotionVideo",
  statement_descriptor: "MOTIONVIDEO",
  support_email: "hello@motionvideo.xyz",
  url: SITE_URL,
};

// $49 regular price; the launch code takes $20 off for the first 100 buyers.
const SKILL_PRICE_CENTS = 4900;
const LAUNCH_DISCOUNT_CENTS = 2000;
const LAUNCH_LIMIT = 100;
const LAUNCH_CODE = "MOTIONVIDEOLAUNCH";
const ENTITLEMENT_NAME = "MotionVideo Skill repository";

const PRODUCTS = [
  {
    envKey: "DODO_PRODUCT_SKILL",
    name: "MotionVideo Skill Bundle",
    description:
      "An agent skill that writes motion videos in code. Delivered as read-only access to a private GitHub repository, including future updates. One-time purchase.",
    price: {
      currency: "USD",
      price: SKILL_PRICE_CENTS,
      purchasing_power_parity: false,
      tax_inclusive: false,
      type: "one_time_price",
    },
  },
  ...[
    ["DIAMOND", "Diamond", 50_000],
    ["GOLD", "Gold", 25_000],
    ["SILVER", "Silver", 15_000],
  ].map(([key, tier, cents]) => ({
    envKey: `DODO_PRODUCT_SPONSOR_${key}`,
    name: `MotionVideo Sponsor — ${tier}`,
    description: `${tier} sponsorship of motionvideo.xyz: a labelled sponsored placement, billed monthly. Cancel anytime.`,
    price: {
      currency: "USD",
      payment_frequency_count: 1,
      payment_frequency_interval: "Month",
      price: cents,
      purchasing_power_parity: false,
      // Longer than the billing cycle so the subscription renews until cancelled.
      subscription_period_count: 20,
      subscription_period_interval: "Year",
      tax_inclusive: false,
      type: "recurring_price",
    },
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
  "subscription.cancelled",
  "subscription.expired",
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
const productIds = Object.fromEntries(
  await Promise.all(
    PRODUCTS.map(async (product) => {
      const match = existingProducts.find((item) => item.name === product.name);
      if (match) {
        const current = await dodo.products.retrieve(match.product_id);
        if (current.brand_id !== brandId) {
          throw new Error(
            `${product.name} (${match.product_id}) is not in the MotionVideo brand`
          );
        }
        if (current.price.price !== product.price.price) {
          log(
            `warning: ${product.name} price is ${current.price.price}, expected ${product.price.price}`
          );
        }
        log(`product   found    ${match.product_id}  ${product.name}`);
        return [product.envKey, match.product_id];
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
  )
);
const skillId = productIds.DODO_PRODUCT_SKILL;

// Launch discount: $20 off the skill bundle, first 100 uses. Keep its ID
// stable: recreating it resets the redemption count the site displays.
const discounts = await collect(dodo.discounts.list());
let discount = discounts.find((item) => item.code === LAUNCH_CODE);
if (discount) {
  log(`discount  found    ${discount.discount_id}  ${discount.code}`);
  if (
    discount.restricted_to.length !== 1 ||
    discount.restricted_to[0] !== skillId
  ) {
    discount = await dodo.discounts.update(discount.discount_id, {
      restricted_to: [skillId],
    });
    log(`discount  updated  restricted to ${skillId}`);
  }
} else {
  discount = await dodo.discounts.create({
    amount: LAUNCH_DISCOUNT_CENTS,
    code: LAUNCH_CODE,
    currency_options: [
      {
        currency: "USD",
        is_default: true,
        max_amount_possible: LAUNCH_DISCOUNT_CENTS,
      },
    ],
    customer_eligibility: "any",
    metadata: { brand: BRAND.name, campaign: "launch" },
    name: "MotionVideo launch offer",
    restricted_to: [skillId],
    type: "flat",
    usage_limit: LAUNCH_LIMIT,
  });
  log(`discount  created  ${discount.discount_id}  ${discount.code}`);
}

// GitHub repository access for buyers. Requires the Dodo Payments GitHub App
// on the motionvideohq organization, which is a dashboard OAuth step.
let entitlementId = null;
try {
  const entitlements = await collect(dodo.entitlements.list());
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
  const skill = await dodo.products.retrieve(skillId);
  const attached = (skill.entitlements ?? []).map((item) => item.id);
  if (attached.includes(entitlementId)) {
    log("github    attached to the skill bundle");
  } else {
    await dodo.products.update(skillId, {
      entitlements: [...attached, entitlementId].map((id) => ({
        entitlement_id: id,
      })),
    });
    log("github    attached to the skill bundle (now)");
  }
} catch (error) {
  log(`github    skipped  ${error.status ?? ""} ${error.message}`);
  log(
    `          Dashboard (${environment}): Entitlements → + → GitHub Access → Connect GitHub,\n` +
      `          install the app on motionvideohq, pick ${GITHUB_REPO} with "pull",\n` +
      `          name it "${ENTITLEMENT_NAME}", then attach it to "MotionVideo Skill Bundle"\n` +
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
    log(`webhook   found    ${hook.id}  ${hook.url}`);
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

const ids = {
  ...productIds,
  DODO_LAUNCH_DISCOUNT_ID: discount.discount_id,
};

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
log(`  discount code                  ${discount.code}`);
log(`  github entitlement             ${entitlementId ?? "not created"}`);
log(`  webhook endpoint               ${webhookId ?? "not created"}`);

if (live) {
  log(
    "\nSet the production secrets (values are piped, never displayed):\n" +
      "  pnpm -s dodo:setup --live --print-secret=api-key | pnpm wrangler secret put DODO_PAYMENTS_API_KEY\n" +
      "  pnpm -s dodo:setup --live --print-secret=webhook-key | pnpm wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY"
  );
}
