"use strict";
/* Front-end OFFLINE mode (no backend reachable) — verifies the refactored data.js + app.js
   still drive all flows locally via localStorage. */
const fs = require("fs"), path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");
const PUB = path.join(__dirname, "..", "public");
const html = fs.readFileSync(path.join(PUB, "index.html"), "utf8");
const files = ["js/i18n.js", "js/i18n-extra.js", "js/config.js", "js/data.js", "js/api.js", "js/app.js"];
const code = files.map((f) => fs.readFileSync(path.join(PUB, f), "utf8"));

const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push(String(e.detail || e.message || e)));
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc });
const win = dom.window; win.scrollTo = () => {};
// NOTE: deliberately NOT providing fetch/AbortController -> API.detect fails -> offline mode
for (const c of code) { const s = win.document.createElement("script"); s.textContent = c; win.document.body.appendChild(s); }

const $ = (s) => win.document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = (h) => { win.location.hash = h; win.dispatchEvent(new win.Event("hashchange")); };
const click = (s) => { const e = typeof s === "string" ? $(s) : s; e.dispatchEvent(new win.window.MouseEvent("click", { bubbles: true })); };
const set = (s, v, c) => { const e = $(s); if (c) e.checked = v; else e.value = v; e.dispatchEvent(new win.window.Event(c ? "change" : "input", { bubbles: true })); };
let pass = 0, fail = 0; const ck = (n, c) => { c ? pass++ : (fail++, console.log("FAIL " + n)); };

(async () => {
  await sleep(120); // boot (async; detect rejects fast -> offline)
  ck("offline: API.online false", win.API && win.API.online === false);
  ck("boot: home rendered", !!$(".hero__title"));
  ck("data.build: DATA helpers present", typeof win.DATA.estimateFare === "function" && win.DATA.HOTELS.length === 6);
  ck("offline: account button hidden", $("#acctBtn").style.display === "none");

  for (const L of ["zh-Hant", "zh-Hans", "en", "ja", "ko"]) {
    win.I18N.setLang(L);
    for (const r of ["#/home", "#/car", "#/hotel", "#/concert", "#/orders", "#/hotel/h-lumina", "#/concert/c-aurora"]) {
      nav(r); ck(`render ${L} ${r}`, $("#app").innerHTML.length > 60);
    }
  }
  win.I18N.setLang("zh-Hant");

  // car -> checkout -> pay (offline local) -> success
  nav("#/car"); click('[data-action="estimate"]'); click('[data-action="car-checkout"]'); nav("#/checkout");
  set('[data-field="co.name"]', "A"); set('[data-field="co.phone"]', "1"); set('[data-field="co.email"]', "a@b.com"); set('[data-field="co.agree"]', true, true);
  click('[data-action="pay"]'); await sleep(1100);
  ck("offline car order saved", JSON.parse(win.localStorage.getItem("chmcar.orders") || "[]").length === 1);

  // hotel
  nav("#/hotel"); click(win.document.querySelector('[data-link^="#/hotel/"]')); nav(win.location.hash); click('[data-action="book-room"]'); nav("#/checkout");
  set('[data-field="co.name"]', "A"); set('[data-field="co.phone"]', "1"); set('[data-field="co.email"]', "a@b.com"); set('[data-field="co.agree"]', true, true);
  click('[data-action="pay"]'); await sleep(1100);
  ck("offline hotel order saved", JSON.parse(win.localStorage.getItem("chmcar.orders") || "[]").length === 2);

  // concert
  nav("#/concert"); click(win.document.querySelector('[data-link^="#/concert/"]')); nav(win.location.hash);
  click(win.document.querySelector('[data-action="pick-zone"]:not([disabled])')); click('[data-action="qty-confirm"]'); nav("#/checkout");
  set('[data-field="co.name"]', "A"); set('[data-field="co.phone"]', "1"); set('[data-field="co.email"]', "a@b.com"); set('[data-field="co.agree"]', true, true);
  click('[data-action="pay"]'); await sleep(1100);
  ck("offline concert order saved", JSON.parse(win.localStorage.getItem("chmcar.orders") || "[]").length === 3);

  nav("#/orders"); ck("offline orders list shows 3", win.document.querySelectorAll(".order-card").length === 3);

  console.log(`\noffline frontend: ${pass} passed, ${fail} failed`);
  if (errors.length) { console.log("runtime errors:"); errors.slice(0, 8).forEach((e) => console.log("  " + e)); }
  process.exit(fail || errors.length ? 1 : 0);
})().catch((e) => { console.error("CRASH", e); process.exit(2); });
