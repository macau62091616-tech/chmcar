"use strict";
/* SQLite layer on Node's built-in node:sqlite (no native build).
   DB path is configurable via env DB_PATH (default ./data/chm.db). */
const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "chm.db");
if (DB_PATH !== ":memory:") fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA busy_timeout = 5000;");

/* run fn inside a transaction; rolls back on throw. */
function tx(fn) {
  db.exec("BEGIN");
  try {
    const r = fn();
    db.exec("COMMIT");
    return r;
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch (_) {}
    throw e;
  }
}

const J = {
  parse: (s, d) => { try { return s == null ? d : JSON.parse(s); } catch (_) { return d; } },
  str: (o) => JSON.stringify(o)
};

module.exports = { db, tx, J, DB_PATH };
