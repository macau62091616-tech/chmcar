"use strict";
/* Order lifecycle + inventory holds. Server is authoritative for prices & stock. */
const { db, tx, J } = require("./db");
const store = require("./store");
const { httpErr } = require("./auth");

const HOLD_TTL_MS = parseInt(process.env.HOLD_TTL_MS || String(15 * 60 * 1000), 10); // 15 min
const pick = (o, lang) => (o && (o[lang] != null ? o[lang] : o.en)) || "";

function genOrderNo() {
  for (let i = 0; i < 5; i++) {
    const no = "CHM" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 900 + 100);
    if (!db.prepare("SELECT 1 FROM orders WHERE id=?").get(no)) return no;
  }
  return "CHM" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 9000 + 1000);
}

function fmtDate(iso, lang) {
  if (!iso) return "";
  try { return new Date(iso + "T00:00:00").toLocaleDateString(lang === "en" ? "en-GB" : lang, { year: "numeric", month: "short", day: "numeric" }); }
  catch (_) { return iso; }
}
function nights(checkin, checkout) {
  const n = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  return n > 0 ? n : 1;
}

/* ---------- create ---------- */
function createOrder(user, body) {
  const lang = body.lang || "zh-Hant";
  const contact = body.contact || {};
  if (!contact.name || !contact.phone || !contact.email) throw httpErr(400, "CONTACT_REQUIRED");

  const base = {
    id: genOrderNo(),
    user_id: user ? user.id : null,
    currency: store.currency(),
    status: "pending_payment",
    contact_name: contact.name, contact_phone: contact.phone, contact_email: contact.email,
    remarks: contact.remarks || "",
    created_at: new Date().toISOString()
  };

  if (body.type === "car") return createCar(base, body, lang);
  if (body.type === "hotel") return createHotel(base, body, lang);
  if (body.type === "concert") return createConcert(base, body, lang);
  throw httpErr(400, "BAD_TYPE");
}

function insertOrder(o, details) {
  db.prepare(`INSERT INTO orders
    (id,user_id,type,title,sub,sub2,currency,amount,status,contact_name,contact_phone,contact_email,remarks,details,created_at)
    VALUES (@id,@user_id,@type,@title,@sub,@sub2,@currency,@amount,@status,@contact_name,@contact_phone,@contact_email,@remarks,@details,@created_at)`)
    .run(Object.assign({ details: J.str(details || {}) }, o));
}

function createCar(base, body, lang) {
  const { from, to, vehicleClass = "comfort", date = "", time = "", pax = 1, lug = 0 } = body;
  const rf = store.locationRegion(from), rt = store.locationRegion(to);
  if (!rf || !rt) throw httpErr(400, "UNKNOWN_LOCATION");
  if (!store.vehicleClass(vehicleClass)) throw httpErr(400, "UNKNOWN_VEHICLE");
  const est = store.estimateFare(rf, rt, vehicleClass);

  const cat = store.getCatalog();
  const locName = (id) => { const l = cat.locations.find((x) => x.id === id); return l ? pick(l.name, lang) : id; };
  const vcName = pick((cat.vehicleClasses.find((v) => v.id === vehicleClass) || {}).name, lang);

  const o = Object.assign(base, {
    type: "car", amount: est.total,
    title: locName(from) + " → " + locName(to),
    sub: vcName + " · " + pax + "p · 🧳" + lug,
    sub2: (date ? fmtDate(date, lang) : "") + (time ? " " + time : "")
  });
  return tx(() => { insertOrder(o, { from, to, vehicleClass, date, time, pax, lug, ride: est.ride, crossFee: est.crossFee, isCross: est.isCross, eta: est.eta }); return readOrder(o.id); });
}

function createHotel(base, body, lang) {
  const { hotelId, roomId, checkin, checkout, guests = 2 } = body;
  if (!checkin || !checkout) throw httpErr(400, "DATES_REQUIRED");
  const hotel = store.getHotel(hotelId);
  const room = store.getRoom(hotelId, roomId);
  if (!hotel || !room) throw httpErr(404, "ROOM_NOT_FOUND");
  const n = nights(checkin, checkout);
  const amount = room.price * n;
  const hName = pick(hotel.name, lang);
  const rName = pick(J.parse(room.name_i18n), lang);

  return tx(() => {
    const upd = db.prepare("UPDATE rooms SET qty = qty - 1 WHERE hotel_id=? AND id=? AND qty >= 1").run(hotelId, roomId);
    if (upd.changes !== 1) throw httpErr(409, "SOLD_OUT");
    const o = Object.assign(base, {
      type: "hotel", amount,
      title: hName,
      sub: rName + " · " + fmtDate(checkin, lang) + " → " + fmtDate(checkout, lang),
      sub2: "🌙 " + n + " · 👤 " + guests
    });
    insertOrder(o, { hotelId, roomId, checkin, checkout, guests, nights: n, unit: room.price });
    db.prepare("INSERT INTO holds(order_id,kind,hotel_id,room_id,qty,expires_at) VALUES(?,?,?,?,?,?)")
      .run(o.id, "room", hotelId, roomId, 1, Date.now() + HOLD_TTL_MS);
    return readOrder(o.id);
  });
}

function createConcert(base, body, lang) {
  const { concertId, qty = 1 } = body;
  const concert = store.getConcert(concertId);
  if (!concert) throw httpErr(404, "CONCERT_NOT_FOUND");
  if (concert.status !== "onsale") throw httpErr(409, "NOT_ON_SALE");
  const zone = (body.zoneId != null) ? store.getZoneById(body.zoneId) : store.getZoneByIdx(concertId, body.zoneIdx);
  if (!zone || zone.concert_id !== concertId) throw httpErr(404, "ZONE_NOT_FOUND");
  const q = Math.max(1, Math.min(6, parseInt(qty, 10) || 1));
  const amount = zone.price * q;
  const zName = pick(J.parse(zone.name_i18n), lang);

  return tx(() => {
    const upd = db.prepare("UPDATE zones SET qty = qty - ? WHERE id=? AND qty >= ?").run(q, zone.id, q);
    if (upd.changes !== 1) throw httpErr(409, "SOLD_OUT");
    const o = Object.assign(base, {
      type: "concert", amount,
      title: pick(concert.title, lang),
      sub: zName + " × " + q,
      sub2: "📅 " + fmtDate(concert.date, lang) + " · 📍 " + pick(concert.venue, lang)
    });
    insertOrder(o, { concertId, zoneId: zone.id, zoneIdx: zone.idx, qty: q, unit: zone.price });
    db.prepare("INSERT INTO holds(order_id,kind,zone_id,qty,expires_at) VALUES(?,?,?,?,?)")
      .run(o.id, "zone", zone.id, q, Date.now() + HOLD_TTL_MS);
    return readOrder(o.id);
  });
}

/* ---------- read ---------- */
function readOrder(id) {
  const o = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
  if (!o) return null;
  o.details = J.parse(o.details, {});
  return o;
}
function listUserOrders(userId) {
  return db.prepare("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC").all(userId)
    .map((o) => (o.details = J.parse(o.details, {}), o));
}

/* ---------- payment transition ---------- */
function markPaid(orderId, { method, ref }) {
  return tx(() => {
    const o = db.prepare("SELECT * FROM orders WHERE id=?").get(orderId);
    if (!o) throw httpErr(404, "ORDER_NOT_FOUND");
    if (o.status === "paid" || o.status === "assigned" || o.status === "completed") return readOrder(orderId); // idempotent
    if (o.status !== "pending_payment") throw httpErr(409, "ORDER_NOT_PAYABLE");
    db.prepare("UPDATE orders SET status='paid', paid_at=?, payment_method=?, payment_ref=? WHERE id=?")
      .run(new Date().toISOString(), method || null, ref || null, orderId);
    db.prepare("DELETE FROM holds WHERE order_id=?").run(orderId); // confirmed: stock stays decremented
    return readOrder(orderId);
  });
}

/* ---------- holds sweep (release expired, unpaid) ---------- */
function sweepExpiredHolds() {
  const now = Date.now();
  const expired = db.prepare("SELECT * FROM holds WHERE expires_at < ?").all(now);
  if (!expired.length) return 0;
  let released = 0;
  for (const h of expired) {
    tx(() => {
      const o = db.prepare("SELECT status FROM orders WHERE id=?").get(h.order_id);
      if (o && o.status === "pending_payment") {
        if (h.kind === "room") db.prepare("UPDATE rooms SET qty = qty + ? WHERE hotel_id=? AND id=?").run(h.qty, h.hotel_id, h.room_id);
        else if (h.kind === "zone") db.prepare("UPDATE zones SET qty = qty + ? WHERE id=?").run(h.qty, h.zone_id);
        db.prepare("UPDATE orders SET status='expired' WHERE id=?").run(h.order_id);
        released++;
      }
      db.prepare("DELETE FROM holds WHERE id=?").run(h.id);
    });
  }
  return released;
}

module.exports = { createOrder, readOrder, listUserOrders, markPaid, sweepExpiredHolds, HOLD_TTL_MS, pick };
