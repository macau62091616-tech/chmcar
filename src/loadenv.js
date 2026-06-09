"use strict";
/* Minimal .env loader (no dependency). Loads <projectRoot>/.env if present.
   Existing process.env values always win (so Render/host vars take precedence). */
const fs = require("fs");
const path = require("path");

const envPath = process.env.ENV_FILE || path.join(__dirname, "..", ".env");
try {
  const raw = fs.readFileSync(envPath, "utf8");
  for (let line of raw.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
} catch (_) { /* no .env — fine, use real env */ }
