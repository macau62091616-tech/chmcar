"use strict";
/* Stripe Checkout integration with an automatic mock gateway when no keys are set.
   Stripe Checkout covers card + Alipay + WeChat Pay through a single integration. */
const SECRET = process.env.STRIPE_SECRET_KEY || "";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const CONFIGURED = SECRET.startsWith("sk_");
let stripe = null;
if (CONFIGURED) { stripe = require("stripe")(SECRET); }
else { console.warn("[payments] STRIPE_SECRET_KEY not set — using MOCK gateway (no real charges)."); }

// HK$ -> cents (Stripe smallest currency unit; HKD uses 2 decimals)
const toMinor = (hkd) => Math.round(hkd * 100);

/* Create a checkout session for an order. Returns { provider, url, ref }. */
async function createCheckoutSession(order, { origin, lang = "zh-Hant" }) {
  const successUrl = `${origin}/index.html#/success?order=${encodeURIComponent(order.id)}`;
  const cancelUrl = `${origin}/index.html#/checkout?cancelled=1&order=${encodeURIComponent(order.id)}`;

  if (!CONFIGURED) {
    // Mock gateway: a backend endpoint marks the order paid, then redirects back to the app.
    return { provider: "mock", url: `${origin}/api/checkout/mock-pay?order=${encodeURIComponent(order.id)}`, ref: "mock_" + order.id };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "alipay", "wechat_pay"],
    payment_method_options: { wechat_pay: { client: "web" } },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "hkd",
        unit_amount: toMinor(order.amount),
        product_data: { name: order.title || "CHM Car order", description: order.sub || undefined }
      }
    }],
    locale: lang === "zh-Hant" ? "zh-HK" : (lang === "zh-Hans" ? "zh" : lang),
    customer_email: order.contact_email || undefined,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return { provider: "stripe", url: session.url, ref: session.id };
}

/* Parse + verify a Stripe webhook. Returns { type, orderId, ref } or null. */
function parseWebhook(rawBody, signature) {
  if (!CONFIGURED || !WEBHOOK_SECRET) return null;
  const event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const s = event.data.object;
    return { type: event.type, orderId: (s.metadata && s.metadata.orderId) || s.client_reference_id, ref: s.id, method: "stripe" };
  }
  return { type: event.type, ignore: true };
}

module.exports = { createCheckoutSession, parseWebhook, CONFIGURED, WEBHOOK_SECRET };
