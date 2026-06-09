"use strict";
/* Admin: fleet dispatch, order management, stats. */
const { db, tx, J } = require("./db");
const { httpErr } = require("./auth");

function listDrivers() {
  return db.prepare("SELECT * FROM drivers ORDER BY id").all()
    .map((d) => ({ id: d.id, name: d.name, phone: d.phone, regions: J.parse(d.regions, []), crossBorder: !!d.cross_border, vehicleClass: d.vehicle_class, active: !!d.active }));
}

function listOrders({ status, type, limit = 200 } = {}) {
  let sql = `SELECT o.*, d.name AS driver_name FROM orders o LEFT JOIN drivers d ON d.id = o.driver_id`;
  const where = [], args = [];
  if (status) { where.push("o.status = ?"); args.push(status); }
  if (type) { where.push("o.type = ?"); args.push(type); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY o.created_at DESC LIMIT ?"; args.push(limit);
  return db.prepare(sql).all(...args).map((o) => (o.details = J.parse(o.details, {}), o));
}

function assignDriver(orderId, driverId) {
  return tx(() => {
    const o = db.prepare("SELECT * FROM orders WHERE id=?").get(orderId);
    if (!o) throw httpErr(404, "ORDER_NOT_FOUND");
    if (o.type !== "car") throw httpErr(400, "NOT_A_CAR_ORDER");
    if (!["paid", "assigned"].includes(o.status)) throw httpErr(409, "ORDER_NOT_ASSIGNABLE");
    const d = db.prepare("SELECT * FROM drivers WHERE id=? AND active=1").get(driverId);
    if (!d) throw httpErr(404, "DRIVER_NOT_FOUND");
    db.prepare("UPDATE orders SET driver_id=?, status='assigned' WHERE id=?").run(driverId, orderId);
    return getOrderForAdmin(orderId);
  });
}

const ALLOWED_STATUS = ["paid", "assigned", "completed", "cancelled"];
function setStatus(orderId, status) {
  if (!ALLOWED_STATUS.includes(status)) throw httpErr(400, "BAD_STATUS");
  return tx(() => {
    const o = db.prepare("SELECT * FROM orders WHERE id=?").get(orderId);
    if (!o) throw httpErr(404, "ORDER_NOT_FOUND");
    if (status === "cancelled") {
      const det = J.parse(o.details, {});
      if (o.type === "hotel") db.prepare("UPDATE rooms SET qty = qty + 1 WHERE hotel_id=? AND id=?").run(det.hotelId, det.roomId);
      else if (o.type === "concert") db.prepare("UPDATE zones SET qty = qty + ? WHERE id=?").run(det.qty || 1, det.zoneId);
      db.prepare("DELETE FROM holds WHERE order_id=?").run(orderId);
    }
    db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, orderId);
    return getOrderForAdmin(orderId);
  });
}

function getOrderForAdmin(orderId) {
  const o = db.prepare(`SELECT o.*, d.name AS driver_name FROM orders o LEFT JOIN drivers d ON d.id=o.driver_id WHERE o.id=?`).get(orderId);
  if (o) o.details = J.parse(o.details, {});
  return o;
}

function stats() {
  const byStatus = {};
  db.prepare("SELECT status, COUNT(*) c FROM orders GROUP BY status").all().forEach((r) => (byStatus[r.status] = r.c));
  const byType = {};
  db.prepare("SELECT type, COUNT(*) c FROM orders GROUP BY type").all().forEach((r) => (byType[r.type] = r.c));
  const rev = db.prepare("SELECT COALESCE(SUM(amount),0) s FROM orders WHERE status IN ('paid','assigned','completed')").get().s;
  return { byStatus, byType, paidRevenue: rev, currency: db.prepare("SELECT value FROM settings WHERE key='currency'").get()?.value || "HK$" };
}

module.exports = { listDrivers, listOrders, assignDriver, setStatus, getOrderForAdmin, stats };
