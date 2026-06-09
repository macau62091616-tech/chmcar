"use strict";
/* In-process end-to-end API tests (mock payment gateway). */
const fs = require("fs");
const assert = require("assert");

const DBP = "/tmp/chm_test.db";
for (const f of [DBP, DBP + "-wal", DBP + "-shm"]) { try { fs.rmSync(f, { force: true }); } catch (_) {} }
process.env.DB_PATH = DBP;
process.env.JWT_SECRET = "test-secret";
process.env.ADMIN_PASSWORD = "chmcar-admin";
delete process.env.STRIPE_SECRET_KEY; // force mock gateway
process.env.HOLD_TTL_MS = "900000";

const app = require("../server");
const { db } = require("../src/db");
const ordersSvc = require("../src/orders");

let base, server;
let passed = 0;
const ok = (n) => { passed++; console.log("✓ " + n); };

async function api(method, path, body, token) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = "Bearer " + token;
  const r = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
  let j = null; try { j = await r.json(); } catch (_) {}
  return { status: r.status, body: j, headers: r.headers };
}

(async function run() {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = "http://127.0.0.1:" + server.address().port;

  // 1. health + catalog
  let r = await api("GET", "/api/health");
  assert.equal(r.body.stripe, "mock"); ok("health: mock gateway active");
  r = await api("GET", "/api/catalog");
  assert.equal(r.body.regions.length, 3);
  assert.equal(r.body.locations.length, 16);
  assert.equal(r.body.vehicleClasses.length, 4);
  assert.equal(r.body.popularRoutes.length, 6);
  assert.equal(r.body.crossFee, 380); ok("catalog: regions/locations/classes/routes/crossFee");

  // 2. quote (cross-border)
  r = await api("POST", "/api/quote", { from: "hk-hkia", to: "mo-cotai", vehicleClass: "business" });
  assert.equal(r.body.isCross, true);
  assert.equal(r.body.crossFee, 380);
  assert.ok(r.body.total > r.body.ride && r.body.total === r.body.ride + 380); ok("quote: cross-border fare + surcharge");
  const carQuote = r.body;

  // 3. auth
  r = await api("POST", "/api/auth/register", { email: "Aiko@Example.com", password: "secret123", name: "Aiko", phone: "+85291112222" });
  assert.equal(r.status, 200); assert.ok(r.body.token); const aikoTok = r.body.token;
  assert.equal(r.body.user.email, "aiko@example.com"); ok("auth: register (email normalized)");
  r = await api("POST", "/api/auth/register", { email: "aiko@example.com", password: "x" });
  assert.equal(r.status, 400); ok("auth: weak password rejected");
  r = await api("POST", "/api/auth/login", { email: "aiko@example.com", password: "secret123" });
  assert.ok(r.body.token); const tok = r.body.token;
  r = await api("GET", "/api/me", null, tok); assert.equal(r.body.user.name, "Aiko"); ok("auth: login + /me");
  r = await api("POST", "/api/auth/login", { email: "aiko@example.com", password: "WRONG" });
  assert.equal(r.status, 401); ok("auth: bad credentials rejected");

  // 4. hotels list + detail
  r = await api("GET", "/api/hotels"); assert.equal(r.body.length, 6); ok("hotels: list 6");
  r = await api("GET", "/api/hotels/h-lumina");
  const famSuite = r.body.rooms.find((x) => x.id === "r3");
  assert.equal(famSuite.left, 1); ok("hotels: detail rooms + availability (r3 left=1)");

  // 5. hotel order + oversell + mock payment
  const hotelBody = { type: "hotel", hotelId: "h-lumina", roomId: "r3", checkin: "2026-07-01", checkout: "2026-07-03", guests: 2, lang: "zh-Hant", contact: { name: "Aiko", phone: "1", email: "a@b.com" } };
  r = await api("POST", "/api/orders", hotelBody, tok);
  assert.equal(r.status, 201);
  const ho = r.body.order;
  assert.equal(ho.status, "pending_payment");
  assert.equal(ho.amount, 2880 * 2); ok("order(hotel): created, amount = price × 2 nights");
  r = await api("GET", "/api/hotels/h-lumina");
  assert.equal(r.body.rooms.find((x) => x.id === "r3").left, 0); ok("inventory: room decremented to 0");
  r = await api("POST", "/api/orders", hotelBody, tok);
  assert.equal(r.status, 409); assert.equal(r.body.error, "SOLD_OUT"); ok("inventory: oversell blocked (409 SOLD_OUT)");
  // pay via mock
  r = await api("POST", "/api/checkout/session", { orderId: ho.id });
  assert.equal(r.body.provider, "mock"); assert.ok(r.body.url.includes("/api/checkout/mock-pay")); ok("checkout: mock session url");
  r = await api("GET", "/api/checkout/mock-pay?order=" + ho.id);
  assert.equal(r.status, 302); ok("checkout: mock-pay redirects (302)");
  r = await api("GET", "/api/orders/" + ho.id, null, tok);
  assert.equal(r.body.order.status, "paid"); assert.ok(r.body.order.paid_at); ok("payment: order marked paid");
  // access control: member's order not readable without the owner's token
  assert.equal((await api("GET", "/api/orders/" + ho.id)).status, 403); ok("access: member order requires owner token");

  // 6. concert oversell + order
  r = await api("GET", "/api/concerts/c-aurora");
  const soldZone = r.body.zones.find((z) => z.soldout);
  assert.ok(soldZone); ok("concerts: sold-out zone flagged");
  r = await api("POST", "/api/orders", { type: "concert", concertId: "c-aurora", zoneId: soldZone.id, qty: 1, lang: "en", contact: { name: "A", phone: "1", email: "a@b.com" } });
  assert.equal(r.status, 409); ok("concerts: cannot buy sold-out zone");
  const liveZone = (await api("GET", "/api/concerts/c-aurora")).body.zones.find((z) => !z.soldout && z.left >= 3);
  r = await api("POST", "/api/orders", { type: "concert", concertId: "c-aurora", zoneId: liveZone.id, qty: 3, lang: "en", contact: { name: "A", phone: "1", email: "a@b.com" } }, tok);
  assert.equal(r.status, 201); assert.equal(r.body.order.amount, liveZone.price * 3); ok("order(concert): qty×price");
  const before = liveZone.left;
  const after = (await api("GET", "/api/concerts/c-aurora")).body.zones.find((z) => z.id === liveZone.id).left;
  assert.equal(after, before - 3); ok("inventory: 3 tickets decremented");

  // 7. car order = quote, then pay
  r = await api("POST", "/api/orders", { type: "car", from: "hk-hkia", to: "mo-cotai", vehicleClass: "business", date: "2026-07-05", time: "09:30", pax: 2, lug: 2, lang: "zh-Hant", contact: { name: "Aiko", phone: "1", email: "a@b.com" } }, tok);
  assert.equal(r.status, 201); const carOrder = r.body.order;
  assert.equal(carOrder.amount, carQuote.total); ok("order(car): amount matches server quote");
  await api("GET", "/api/checkout/mock-pay?order=" + carOrder.id);
  assert.equal((await api("GET", "/api/orders/" + carOrder.id, null, tok)).body.order.status, "paid"); ok("order(car): paid via mock");

  // 8. member order listing
  r = await api("GET", "/api/orders", null, tok);
  assert.ok(r.body.orders.length >= 3); ok("orders: member sees own orders (" + r.body.orders.length + ")");

  // 9. admin: dispatch + status + stats
  r = await api("POST", "/api/auth/login", { email: "admin@chmcar.com", password: "chmcar-admin" });
  const adminTok = r.body.token; assert.ok(adminTok); assert.equal(r.body.user.role, "admin"); ok("admin: login");
  r = await api("GET", "/api/admin/orders", null, tok); assert.equal(r.status, 403); ok("admin: member blocked from admin API");
  r = await api("GET", "/api/admin/drivers", null, adminTok); assert.equal(r.body.drivers.length, 4); ok("admin: drivers list");
  const crossDriver = r.body.drivers.find((d) => d.crossBorder);
  r = await api("POST", "/api/admin/orders/" + carOrder.id + "/assign", { driverId: crossDriver.id }, adminTok);
  assert.equal(r.body.order.status, "assigned"); assert.equal(r.body.order.driver_id, crossDriver.id); ok("admin: assign driver → assigned");
  r = await api("POST", "/api/admin/orders/" + carOrder.id + "/status", { status: "completed" }, adminTok);
  assert.equal(r.body.order.status, "completed"); ok("admin: status → completed");
  r = await api("GET", "/api/admin/stats", null, adminTok);
  assert.ok(r.body.paidRevenue > 0); ok("admin: stats paidRevenue = " + r.body.currency + r.body.paidRevenue);

  // 10. hold expiry sweep releases unpaid inventory
  const pearl = (await api("GET", "/api/hotels/h-pearl")).body.rooms[0];
  const r2 = await api("POST", "/api/orders", { type: "hotel", hotelId: "h-pearl", roomId: pearl.id, checkin: "2026-08-01", checkout: "2026-08-02", guests: 2, lang: "en", contact: { name: "A", phone: "1", email: "a@b.com" } });
  const unpaid = r2.body.order;
  const leftAfterHold = (await api("GET", "/api/hotels/h-pearl")).body.rooms.find((x) => x.id === pearl.id).left;
  assert.equal(leftAfterHold, pearl.left - 1); ok("hold: room held on order create");
  db.prepare("UPDATE holds SET expires_at=0 WHERE order_id=?").run(unpaid.id); // force-expire
  const released = ordersSvc.sweepExpiredHolds();
  assert.ok(released >= 1);
  const leftAfterSweep = (await api("GET", "/api/hotels/h-pearl")).body.rooms.find((x) => x.id === pearl.id).left;
  assert.equal(leftAfterSweep, pearl.left); ok("hold: expired hold released, inventory restored");
  assert.equal((await api("GET", "/api/orders/" + unpaid.id)).body.order.status, "expired"); ok("hold: unpaid order marked expired");

  // 11. static PWA served
  const pager = await fetch(base + "/index.html");
  const html = await pager.text();
  assert.ok(html.includes("CHM")); ok("static: PWA index served by API server");

  console.log(`\n${passed} checks passed — backend OK`);
  server.close(); process.exit(0);
})().catch((e) => { console.error("\n✗ TEST FAILED:", e.message); console.error(e); if (server) server.close(); process.exit(1); });
