"use strict";
/* Read helpers + server-authoritative fare pricing. */
const { db, J } = require("./db");

function setting(key, dflt) {
  const r = db.prepare("SELECT value FROM settings WHERE key=?").get(key);
  return r ? r.value : dflt;
}
const crossFee = () => parseInt(setting("cross_fee", "380"), 10);
const currency = () => setting("currency", "HK$");

/* ---- catalog ---- */
function getCatalog() {
  const regions = db.prepare("SELECT * FROM regions ORDER BY sort").all()
    .map((r) => ({ id: r.id, flag: r.flag, name: J.parse(r.name_i18n) }));
  const locations = db.prepare("SELECT * FROM locations ORDER BY sort").all()
    .map((l) => ({ id: l.id, region: l.region, name: J.parse(l.name_i18n) }));
  const vehicleClasses = db.prepare("SELECT * FROM vehicle_classes ORDER BY sort").all()
    .map((v) => ({ id: v.id, mult: v.mult, seats: v.seats, bags: v.bags, icon: v.icon, name: J.parse(v.name_i18n) }));
  const popularRoutes = db.prepare("SELECT from_id, to_id, badge FROM popular_routes ORDER BY id").all()
    .map((r) => ({ from: r.from_id, to: r.to_id, badge: !!r.badge }));
  const pairs = {};
  db.prepare("SELECT pair_key, fare, eta FROM pair_fares").all().forEach((p) => (pairs[p.pair_key] = { fare: p.fare, eta: p.eta }));
  return { regions, locations, vehicleClasses, popularRoutes, pairs, crossFee: crossFee(), currency: currency() };
}

function locationRegion(id) {
  const r = db.prepare("SELECT region FROM locations WHERE id=?").get(id);
  return r ? r.region : null;
}
function vehicleClass(id) {
  return db.prepare("SELECT * FROM vehicle_classes WHERE id=?").get(id);
}
function pairKey(a, b) { return [a, b].sort().join("|"); }

/* server-authoritative estimate; mirrors the front-end formula */
function estimateFare(regionFrom, regionTo, classId) {
  const vc = vehicleClass(classId) || vehicleClass("economy");
  const pk = pairKey(regionFrom, regionTo);
  const pair = db.prepare("SELECT fare, eta FROM pair_fares WHERE pair_key=?").get(pk) || { fare: 1000, eta: 80 };
  const isCross = regionFrom !== regionTo;
  const ride = Math.round((pair.fare * vc.mult) / 10) * 10;
  const cf = isCross ? crossFee() : 0;
  return { ride, crossFee: cf, total: ride + cf, eta: pair.eta, isCross, vehicleClass: vc.id };
}

/* ---- hotels ---- */
function listHotels() {
  return db.prepare("SELECT * FROM hotels ORDER BY sort").all().map(hotelRow);
}
function getHotel(id) {
  const h = db.prepare("SELECT * FROM hotels WHERE id=?").get(id);
  return h ? hotelRow(h) : null;
}
function hotelRow(h) {
  const rooms = db.prepare("SELECT * FROM rooms WHERE hotel_id=? ORDER BY sort").all(h.id).map((r) => ({
    id: r.id, name: J.parse(r.name_i18n), price: r.price, cap: r.cap,
    breakfast: !!r.breakfast, freeCancel: !!r.free_cancel, left: r.qty
  }));
  return {
    id: h.id, g: J.parse(h.gradient), rating: h.rating, reviews: h.reviews,
    name: J.parse(h.name_i18n), area: J.parse(h.area_i18n), tags: J.parse(h.tags, []), rooms
  };
}
function getRoom(hotelId, roomId) {
  return db.prepare("SELECT * FROM rooms WHERE hotel_id=? AND id=?").get(hotelId, roomId);
}

/* ---- concerts ---- */
function listConcerts() {
  return db.prepare("SELECT * FROM concerts ORDER BY sort").all().map(concertRow);
}
function getConcert(id) {
  const c = db.prepare("SELECT * FROM concerts WHERE id=?").get(id);
  return c ? concertRow(c) : null;
}
function concertRow(c) {
  const zones = db.prepare("SELECT * FROM zones WHERE concert_id=? ORDER BY idx").all(c.id).map((z) => ({
    id: z.id, idx: z.idx, name: J.parse(z.name_i18n), price: z.price, left: z.qty, soldout: z.qty <= 0
  }));
  return {
    id: c.id, g: J.parse(c.gradient), status: c.status, date: c.date, city: c.city,
    title: J.parse(c.title_i18n), artist: J.parse(c.artist_i18n), venue: J.parse(c.venue_i18n), zones
  };
}
function getZoneByIdx(concertId, idx) {
  return db.prepare("SELECT * FROM zones WHERE concert_id=? AND idx=?").get(concertId, idx);
}
function getZoneById(zoneId) {
  return db.prepare("SELECT * FROM zones WHERE id=?").get(zoneId);
}

module.exports = {
  crossFee, currency, getCatalog, locationRegion, vehicleClass, estimateFare,
  listHotels, getHotel, getRoom, listConcerts, getConcert, getZoneByIdx, getZoneById
};
