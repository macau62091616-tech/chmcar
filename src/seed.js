"use strict";
/* Seed the database. Idempotent: only seeds catalog when empty.
   Run: `npm run seed`  (or `npm run reseed` to wipe + reseed everything). */
require("./loadenv");
const bcrypt = require("bcryptjs");
const { db, tx, J } = require("./db");
const { initSchema } = require("./schema");
const S = require("./seedData");

function nowISO() { return new Date().toISOString(); }

function seedCatalog(force) {
  const have = db.prepare("SELECT COUNT(*) c FROM regions").get().c;
  if (have > 0 && !force) return false;

  tx(() => {
    for (const t of ["popular_routes", "vehicle_classes", "pair_fares", "locations", "regions",
                     "zones", "concerts", "rooms", "hotels", "settings"]) {
      db.exec(`DELETE FROM ${t}`);
    }

    db.prepare("INSERT INTO settings(key,value) VALUES(?,?)").run("cross_fee", String(S.CROSS_FEE));
    db.prepare("INSERT INTO settings(key,value) VALUES(?,?)").run("currency", "HK$");

    const insRegion = db.prepare("INSERT INTO regions(id,flag,name_i18n,sort) VALUES(?,?,?,?)");
    S.REGIONS.forEach((r, i) => insRegion.run(r.id, r.flag, J.str(r.name), i));

    const insLoc = db.prepare("INSERT INTO locations(id,region,name_i18n,sort) VALUES(?,?,?,?)");
    S.LOCATIONS.forEach((l, i) => insLoc.run(l.id, l.region, J.str(l.name), i));

    const insPair = db.prepare("INSERT INTO pair_fares(pair_key,fare,eta) VALUES(?,?,?)");
    for (const k of Object.keys(S.PAIR)) insPair.run(k, S.PAIR[k].fare, S.PAIR[k].eta);

    const insVC = db.prepare("INSERT INTO vehicle_classes(id,mult,seats,bags,icon,name_i18n,sort) VALUES(?,?,?,?,?,?,?)");
    S.VEHICLE_CLASSES.forEach((v, i) => insVC.run(v.id, v.mult, v.seats, v.bags, v.icon, J.str(v.name), i));

    const insRoute = db.prepare("INSERT INTO popular_routes(from_id,to_id,badge) VALUES(?,?,?)");
    S.POPULAR_ROUTES.forEach((r) => insRoute.run(r.from, r.to, r.badge));

    const insHotel = db.prepare("INSERT INTO hotels(id,name_i18n,area_i18n,rating,reviews,gradient,tags,sort) VALUES(?,?,?,?,?,?,?,?)");
    const insRoom = db.prepare("INSERT INTO rooms(hotel_id,id,name_i18n,price,cap,breakfast,free_cancel,qty,sort) VALUES(?,?,?,?,?,?,?,?,?)");
    S.HOTELS.forEach((h, i) => {
      insHotel.run(h.id, J.str(h.name), J.str(h.area), h.rating, h.reviews, J.str(h.g), J.str(h.tags), i);
      h.rooms.forEach((r, j) => insRoom.run(h.id, r.id, J.str(r.name), r.price, r.cap, r.breakfast, r.freeCancel, r.qty, j));
    });

    const insConcert = db.prepare("INSERT INTO concerts(id,title_i18n,artist_i18n,venue_i18n,date,city,status,gradient,sort) VALUES(?,?,?,?,?,?,?,?,?)");
    const insZone = db.prepare("INSERT INTO zones(concert_id,idx,name_i18n,price,qty) VALUES(?,?,?,?,?)");
    S.CONCERTS.forEach((c, i) => {
      insConcert.run(c.id, J.str(c.title), J.str(c.artist), J.str(c.venue), c.date, c.city, c.status, J.str(c.g), i);
      c.zones.forEach((z, j) => insZone.run(c.id, j, J.str(z.name), z.price, z.qty));
    });
  });
  return true;
}

function seedDrivers(force) {
  const have = db.prepare("SELECT COUNT(*) c FROM drivers").get().c;
  if (have > 0 && !force) return;
  if (force) db.exec("DELETE FROM drivers");
  const ins = db.prepare("INSERT INTO drivers(name,phone,regions,cross_border,vehicle_class,active,created_at) VALUES(?,?,?,?,?,1,?)");
  for (const d of S.DRIVERS) ins.run(d.name, d.phone, J.str(d.regions), d.cross_border, d.vehicle_class, nowISO());
}

function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@chmcar.com").toLowerCase();
  const pass = process.env.ADMIN_PASSWORD || "chmcar-admin";
  const existing = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  const hash = bcrypt.hashSync(pass, 10);
  if (existing) {
    db.prepare("UPDATE users SET pass_hash=?, role='admin' WHERE id=?").run(hash, existing.id);
  } else {
    db.prepare("INSERT INTO users(email,pass_hash,name,phone,role,created_at) VALUES(?,?,?,?,?,?)")
      .run(email, hash, "Administrator", "", "admin", nowISO());
  }
  return email;
}

function run({ force = false } = {}) {
  initSchema(db);
  const seeded = seedCatalog(force);
  seedDrivers(force);
  const adminEmail = ensureAdmin();
  return { seeded, adminEmail };
}

if (require.main === module) {
  const force = process.argv.includes("--force");
  const r = run({ force });
  console.log(`[seed] catalog ${r.seeded ? "seeded" : "already present"}${force ? " (forced)" : ""}; admin = ${r.adminEmail}`);
  console.log(`[seed] hotels=${db.prepare("SELECT COUNT(*) c FROM hotels").get().c} rooms=${db.prepare("SELECT COUNT(*) c FROM rooms").get().c} concerts=${db.prepare("SELECT COUNT(*) c FROM concerts").get().c} zones=${db.prepare("SELECT COUNT(*) c FROM zones").get().c} drivers=${db.prepare("SELECT COUNT(*) c FROM drivers").get().c}`);
}

module.exports = { run };
