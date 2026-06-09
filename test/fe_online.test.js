"use strict";
/* Front-end ONLINE mode — boots the PWA against the live API server (mock gateway). */
const fs = require("fs"), path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const DBP = "/tmp/chm_fe_online.db";
for (const f of [DBP, DBP + "-wal", DBP + "-shm"]) { try { fs.rmSync(f, { force: true }); } catch (_) {} }
process.env.DB_PATH = DBP; process.env.JWT_SECRET = "fe-test"; delete process.env.STRIPE_SECRET_KEY;

const app = require("../server");
const PUB = path.join(__dirname, "..", "public");
const html = fs.readFileSync(path.join(PUB, "index.html"), "utf8");
const read = (f) => fs.readFileSync(path.join(PUB, f), "utf8");

let pass = 0, fail = 0; const ck = (n, c) => { c ? (pass++, 0) : (fail++, console.log("FAIL " + n)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const server = app.listen(0); await new Promise((r) => server.once("listening", r));
  const base = "http://127.0.0.1:" + server.address().port;

  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { const m = String(e.detail || e.message || e); if (!/Not implemented: navigation/.test(m)) errors.push(m); });

  const dom = new JSDOM(html, { url: base + "/index.html", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
  const win = dom.window;
  win.scrollTo = () => {};
  win.fetch = (...a) => global.fetch(...a);
  win.AbortController = global.AbortController; win.AbortSignal = global.AbortSignal;

  // inject scripts: i18n, extra, [config override -> point at live server], data, api, app
  const inject = (c) => { const s = win.document.createElement("script"); s.textContent = c; win.document.body.appendChild(s); };
  inject(read("js/i18n.js"));
  inject(read("js/i18n-extra.js"));
  inject(`window.CHM_CONFIG={apiBase:${JSON.stringify(base)},stripePublishableKey:""};`);
  inject(read("js/data.js"));
  inject(read("js/api.js"));
  inject(read("js/app.js"));

  const $ = (s) => win.document.querySelector(s);
  const nav = (h) => { win.location.hash = h; win.dispatchEvent(new win.Event("hashchange")); };
  const click = (s) => { const e = typeof s === "string" ? $(s) : s; e.dispatchEvent(new win.window.MouseEvent("click", { bubbles: true })); };
  const set = (s, v, c) => { const e = $(s); if (c) e.checked = v; else e.value = v; e.dispatchEvent(new win.window.Event(c ? "change" : "input", { bubbles: true })); };

  // wait for async boot (detect + loadData)
  for (let i = 0; i < 40 && !(win.API && win.API.online); i++) await sleep(75);
  ck("online: API.online true", win.API && win.API.online === true);
  ck("online: stripe mock flag", win.API.stripe === "mock");

  // DATA came from server (fresh DB -> known availability)
  ck("server DATA: regions/locations", win.DATA.REGIONS.length === 3 && win.DATA.LOCATIONS.length === 16);
  ck("server DATA: PAIR present", !!(win.DATA.PAIR && win.DATA.PAIR["hk|mo"]));
  const lumR3 = win.DATA.HOTELS.find((h) => h.id === "h-lumina").rooms.find((r) => r.id === "r3");
  ck("server DATA: hotel availability (r3 left=1)", lumR3.left === 1);

  win.I18N.setLang("en"); nav("#/hotel");
  ck("render: hotels from server", $("#app").innerHTML.includes("Lumina"));

  // register through the account UI sheet (verifies the auth sheet + chip update glue)
  click("#acctBtn");                         // opens login sheet
  click('[data-ac="toggle"]');               // switch to register
  set("#ac-name", "FE Tester"); set("#ac-email", "fe_" + Date.now() + "@ex.com"); set("#ac-pass", "secret123");
  click('[data-ac="submit"]');
  for (let i = 0; i < 25 && !win.API.user; i++) await sleep(75);
  ck("ui: registered via account sheet", !!win.API.token && !!win.API.user);
  ck("account UI: logged-in chip", $("#acctBtn").classList.contains("acct-btn--in"));

  const created = await win.API.createOrder({ type: "hotel", hotelId: "h-pearl", roomId: "r1", checkin: "2026-09-01", checkout: "2026-09-03", guests: 2, lang: "en", contact: { name: "FE", phone: "1", email: "a@b.com" } });
  ck("api: order created (pending)", created.order.status === "pending_payment" && created.order.amount === 880 * 2);
  const sess = await win.API.checkoutSession(created.order.id, "en");
  ck("api: mock checkout session", sess.provider === "mock" && /\/api\/checkout\/mock-pay/.test(sess.url));
  await global.fetch(sess.url, { redirect: "manual" }); // hit mock gateway
  const got = await win.API.getOrder(created.order.id);
  ck("api: order paid after mock gateway", got.order.status === "paid");

  // FULL DOM booking via doPay (spy checkoutSession to capture the redirect URL)
  const orig = win.API.checkoutSession.bind(win.API); let captured = null;
  win.API.checkoutSession = async (id, l) => { const r = await orig(id, l); captured = { id, url: r.url }; return r; };
  nav("#/hotel"); click(win.document.querySelector('[data-link^="#/hotel/"]')); nav(win.location.hash);
  click('[data-action="book-room"]'); nav("#/checkout");
  set('[data-field="co.name"]', "DOM User"); set('[data-field="co.phone"]', "123"); set('[data-field="co.email"]', "dom@ex.com"); set('[data-field="co.agree"]', true, true);
  click('[data-action="pay"]');
  for (let i = 0; i < 20 && !captured; i++) await sleep(75);
  ck("dom flow: doPay created order + mock checkout url", !!captured && /\/api\/checkout\/mock-pay/.test(captured.url));
  if (captured) { await global.fetch(captured.url, { redirect: "manual" }); const o2 = await win.API.getOrder(captured.id); ck("dom flow: order paid", o2.order.status === "paid"); }

  // my orders via API
  const mine = await win.API.listMine();
  ck("api: member sees own orders (>=2)", mine.orders.length >= 2);

  console.log(`\nonline frontend: ${pass} passed, ${fail} failed`);
  if (errors.length) { console.log("runtime errors:"); errors.slice(0, 8).forEach((e) => console.log("  " + e)); }
  server.close(); process.exit(fail || errors.length ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });
