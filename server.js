"use strict";
require("./src/loadenv");
const path = require("path");
const express = require("express");

const seed = require("./src/seed");
const store = require("./src/store");
const auth = require("./src/auth");
const ordersSvc = require("./src/orders");
const admin = require("./src/admin");
const payments = require("./src/payments");

// ensure schema + catalog + admin user exist on boot
seed.run();

const app = express();
app.set("trust proxy", true);

const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const origin = (req) => `${req.protocol}://${req.get("host")}`;

/* ---- Stripe webhook needs the RAW body, so mount it BEFORE express.json ---- */
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), (req, res) => {
  try {
    const parsed = payments.parseWebhook(req.body, req.headers["stripe-signature"]);
    if (parsed && !parsed.ignore && parsed.orderId) {
      ordersSvc.markPaid(parsed.orderId, { method: parsed.method, ref: parsed.ref });
    }
    res.json({ received: true });
  } catch (e) {
    console.error("[webhook] error", e.message);
    res.status(400).json({ error: "WEBHOOK_INVALID" });
  }
});

app.use(express.json());
app.use(auth.attachUser);

/* ---------------- public catalog ---------------- */
app.get("/api/health", (_req, res) => res.json({ ok: true, stripe: payments.CONFIGURED ? "live-keys" : "mock", time: new Date().toISOString() }));
app.get("/api/catalog", ah((_req, res) => res.json(store.getCatalog())));

app.post("/api/quote", ah((req, res) => {
  const { from, to, vehicleClass = "comfort" } = req.body || {};
  const rf = store.locationRegion(from), rt = store.locationRegion(to);
  if (!rf || !rt) throw auth.httpErr(400, "UNKNOWN_LOCATION");
  res.json(store.estimateFare(rf, rt, vehicleClass));
}));

app.get("/api/hotels", ah((_req, res) => res.json(store.listHotels())));
app.get("/api/hotels/:id", ah((req, res) => {
  const h = store.getHotel(req.params.id); if (!h) throw auth.httpErr(404, "NOT_FOUND"); res.json(h);
}));
app.get("/api/concerts", ah((_req, res) => res.json(store.listConcerts())));
app.get("/api/concerts/:id", ah((req, res) => {
  const c = store.getConcert(req.params.id); if (!c) throw auth.httpErr(404, "NOT_FOUND"); res.json(c);
}));

/* ---------------- auth ---------------- */
app.post("/api/auth/register", ah((req, res) => res.json(auth.register(req.body || {}))));
app.post("/api/auth/login", ah((req, res) => res.json(auth.login(req.body || {}))));
app.get("/api/me", auth.requireAuth, (req, res) => res.json({ user: auth.publicUser(req.user) }));

/* ---------------- orders ---------------- */
// guest or member may create an order (user attached if logged in)
app.post("/api/orders", ah((req, res) => {
  const order = ordersSvc.createOrder(req.user || null, req.body || {});
  res.status(201).json({ order });
}));
app.get("/api/orders", auth.requireAuth, ah((req, res) => res.json({ orders: ordersSvc.listUserOrders(req.user.id) })));
app.get("/api/orders/:id", ah((req, res) => {
  const o = ordersSvc.readOrder(req.params.id);
  if (!o) throw auth.httpErr(404, "ORDER_NOT_FOUND");
  // members can only read their own; guest orders (user_id null) readable by id (acts as claim code)
  if (o.user_id && (!req.user || (req.user.id !== o.user_id && req.user.role !== "admin"))) throw auth.httpErr(403, "FORBIDDEN");
  res.json({ order: o });
}));

/* ---------------- checkout / payment ---------------- */
app.post("/api/checkout/session", ah(async (req, res) => {
  const { orderId, lang } = req.body || {};
  const o = ordersSvc.readOrder(orderId);
  if (!o) throw auth.httpErr(404, "ORDER_NOT_FOUND");
  if (o.status !== "pending_payment") throw auth.httpErr(409, "ORDER_NOT_PAYABLE");
  const sess = await payments.createCheckoutSession(o, { origin: origin(req), lang });
  res.json(sess);
}));

// mock gateway: finalize order then redirect back to the app's success screen
app.get("/api/checkout/mock-pay", ah((req, res) => {
  const orderId = req.query.order;
  const o = ordersSvc.readOrder(orderId);
  if (!o) return res.status(404).send("Order not found");
  ordersSvc.markPaid(orderId, { method: "mock", ref: "mock_" + orderId });
  res.redirect(302, `${origin(req)}/index.html#/success?order=${encodeURIComponent(orderId)}`);
}));

/* ---------------- admin ---------------- */
app.get("/api/admin/stats", auth.requireAuth, auth.requireAdmin, ah((_req, res) => res.json(admin.stats())));
app.get("/api/admin/drivers", auth.requireAuth, auth.requireAdmin, ah((_req, res) => res.json({ drivers: admin.listDrivers() })));
app.get("/api/admin/orders", auth.requireAuth, auth.requireAdmin, ah((req, res) =>
  res.json({ orders: admin.listOrders({ status: req.query.status, type: req.query.type }) })));
app.post("/api/admin/orders/:id/assign", auth.requireAuth, auth.requireAdmin, ah((req, res) =>
  res.json({ order: admin.assignDriver(req.params.id, parseInt(req.body.driverId, 10)) })));
app.post("/api/admin/orders/:id/status", auth.requireAuth, auth.requireAdmin, ah((req, res) =>
  res.json({ order: admin.setStatus(req.params.id, req.body.status) })));

/* ---------------- static PWA ---------------- */
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
// SPA fallback for hash routes is automatic (single index.html); serve it at root
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

/* ---------------- error handler ---------------- */
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error("[error]", err);
  res.status(status).json({ error: err.code || "SERVER_ERROR" });
});

/* ---------------- boot ---------------- */
const PORT = process.env.PORT || 3000;
const SWEEP_MS = parseInt(process.env.SWEEP_MS || "60000", 10);
const sweepTimer = setInterval(() => {
  try { const n = ordersSvc.sweepExpiredHolds(); if (n) console.log(`[sweep] released ${n} expired hold(s)`); }
  catch (e) { console.error("[sweep]", e.message); }
}, SWEEP_MS);
if (sweepTimer.unref) sweepTimer.unref();

if (require.main === module) {
  app.listen(PORT, () => console.log(`CHM Car server on :${PORT}  (payments: ${payments.CONFIGURED ? "Stripe live keys" : "MOCK"})`));
}
module.exports = app;
