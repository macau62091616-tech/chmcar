"use strict";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret-change-me";
if (!process.env.JWT_SECRET) console.warn("[auth] JWT_SECRET not set — using insecure dev secret. Set it in production!");
const TOKEN_TTL = "30d";

const publicUser = (u) => u && { id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role };

function signToken(u) { return jwt.sign({ uid: u.id, role: u.role }, JWT_SECRET, { expiresIn: TOKEN_TTL }); }
function getUserById(id) { return db.prepare("SELECT * FROM users WHERE id=?").get(id); }

function register({ email, password, name, phone }) {
  email = String(email || "").trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) throw httpErr(400, "INVALID_EMAIL");
  if (!password || String(password).length < 6) throw httpErr(400, "WEAK_PASSWORD");
  if (db.prepare("SELECT id FROM users WHERE email=?").get(email)) throw httpErr(409, "EMAIL_TAKEN");
  const hash = bcrypt.hashSync(String(password), 10);
  const info = db.prepare("INSERT INTO users(email,pass_hash,name,phone,role,created_at) VALUES(?,?,?,?,'member',?)")
    .run(email, hash, name || "", phone || "", new Date().toISOString());
  const u = getUserById(Number(info.lastInsertRowid));
  return { token: signToken(u), user: publicUser(u) };
}

function login({ email, password }) {
  email = String(email || "").trim().toLowerCase();
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u || !bcrypt.compareSync(String(password || ""), u.pass_hash)) throw httpErr(401, "BAD_CREDENTIALS");
  return { token: signToken(u), user: publicUser(u) };
}

function parseToken(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  try { return jwt.verify(m[1], JWT_SECRET); } catch (_) { return null; }
}

// attaches req.user if a valid token is present (does not block)
function attachUser(req, _res, next) {
  const p = parseToken(req);
  if (p) req.user = getUserById(p.uid) || null;
  next();
}
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "AUTH_REQUIRED" });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "ADMIN_REQUIRED" });
  next();
}

function httpErr(status, code) { const e = new Error(code); e.status = status; e.code = code; return e; }

module.exports = { register, login, attachUser, requireAuth, requireAdmin, publicUser, getUserById, signToken, httpErr };
