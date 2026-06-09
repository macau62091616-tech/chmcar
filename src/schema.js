"use strict";
/* Idempotent schema creation. */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);

CREATE TABLE IF NOT EXISTS regions (id TEXT PRIMARY KEY, flag TEXT, name_i18n TEXT, sort INTEGER);
CREATE TABLE IF NOT EXISTS locations (id TEXT PRIMARY KEY, region TEXT, name_i18n TEXT, sort INTEGER);
CREATE TABLE IF NOT EXISTS pair_fares (pair_key TEXT PRIMARY KEY, fare INTEGER, eta INTEGER);
CREATE TABLE IF NOT EXISTS vehicle_classes (id TEXT PRIMARY KEY, mult REAL, seats INTEGER, bags INTEGER, icon TEXT, name_i18n TEXT, sort INTEGER);
CREATE TABLE IF NOT EXISTS popular_routes (id INTEGER PRIMARY KEY AUTOINCREMENT, from_id TEXT, to_id TEXT, badge INTEGER);

CREATE TABLE IF NOT EXISTS hotels (id TEXT PRIMARY KEY, name_i18n TEXT, area_i18n TEXT, rating REAL, reviews INTEGER, gradient TEXT, tags TEXT, sort INTEGER);
CREATE TABLE IF NOT EXISTS rooms (
  hotel_id TEXT, id TEXT, name_i18n TEXT, price INTEGER, cap INTEGER,
  breakfast INTEGER, free_cancel INTEGER, qty INTEGER, sort INTEGER,
  PRIMARY KEY (hotel_id, id)
);

CREATE TABLE IF NOT EXISTS concerts (id TEXT PRIMARY KEY, title_i18n TEXT, artist_i18n TEXT, venue_i18n TEXT, date TEXT, city TEXT, status TEXT, gradient TEXT, sort INTEGER);
CREATE TABLE IF NOT EXISTS zones (id INTEGER PRIMARY KEY AUTOINCREMENT, concert_id TEXT, idx INTEGER, name_i18n TEXT, price INTEGER, qty INTEGER);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL, pass_hash TEXT NOT NULL,
  name TEXT, phone TEXT, role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, phone TEXT, regions TEXT, cross_border INTEGER, vehicle_class TEXT,
  active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  type TEXT NOT NULL,                 -- car | hotel | concert
  title TEXT, sub TEXT, sub2 TEXT,
  currency TEXT NOT NULL DEFAULT 'HK$',
  amount INTEGER NOT NULL,            -- server-computed total
  status TEXT NOT NULL,               -- pending_payment | paid | assigned | completed | cancelled | expired
  payment_method TEXT, payment_ref TEXT,
  contact_name TEXT, contact_phone TEXT, contact_email TEXT, remarks TEXT,
  details TEXT,                       -- JSON snapshot of the booking
  driver_id INTEGER,
  created_at TEXT NOT NULL, paid_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS holds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  kind TEXT NOT NULL,                 -- room | zone
  hotel_id TEXT, room_id TEXT, zone_id INTEGER,
  qty INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,        -- epoch ms
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE INDEX IF NOT EXISTS idx_holds_expires ON holds(expires_at);
`;

function initSchema(db) { db.exec(SCHEMA); }
module.exports = { initSchema };
