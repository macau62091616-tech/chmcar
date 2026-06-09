/* CHM Car — API client. Talks to the backend; the app falls back to offline mock if unreachable. */
(function (global) {
  "use strict";
  const CFG = global.CHM_CONFIG || { apiBase: "" };
  const BASE = (CFG.apiBase || "") + "/api";
  const TKEY = "chmcar.token", UKEY = "chmcar.user";

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
    del(k) { try { localStorage.removeItem(k); } catch (_) {} }
  };

  const API = {
    online: false,
    token: ls.get(TKEY) || null,
    user: (function () { try { return JSON.parse(ls.get(UKEY)); } catch (_) { return null; } })()
  };

  function setSession(token, user) {
    API.token = token; API.user = user;
    ls.set(TKEY, token); ls.set(UKEY, JSON.stringify(user));
  }
  function clearSession() { API.token = null; API.user = null; ls.del(TKEY); ls.del(UKEY); }

  async function req(method, path, body, opts) {
    opts = opts || {};
    const headers = {};
    if (body) headers["content-type"] = "application/json";
    if (API.token && opts.auth !== false) headers.authorization = "Bearer " + API.token;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), opts.timeout || 12000);
    let res;
    try {
      res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal });
    } finally { clearTimeout(timer); }
    let data = null; try { data = await res.json(); } catch (_) {}
    if (!res.ok) { const e = new Error((data && data.error) || ("HTTP_" + res.status)); e.code = (data && data.error) || ("HTTP_" + res.status); e.status = res.status; throw e; }
    return data;
  }

  API.detect = async function () {
    try { const h = await req("GET", "/health", null, { auth: false, timeout: 1800 }); API.online = !!(h && h.ok); API.stripe = h && h.stripe; }
    catch (_) { API.online = false; }
    return API.online;
  };

  // fetch catalog + hotels + concerts and rebuild the global DATA object in place
  API.loadData = async function () {
    const [cat, hotels, concerts] = await Promise.all([
      req("GET", "/catalog", null, { auth: false }),
      req("GET", "/hotels", null, { auth: false }),
      req("GET", "/concerts", null, { auth: false })
    ]);
    const d = {
      currency: cat.currency, CROSS_FEE: cat.crossFee, PAIR: cat.pairs,
      REGIONS: cat.regions, LOCATIONS: cat.locations,
      VEHICLE_CLASSES: cat.vehicleClasses, POPULAR_ROUTES: cat.popularRoutes,
      HOTELS: hotels, CONCERTS: concerts
    };
    const nd = global.CHM_buildData(d);
    // mutate existing DATA object in place so existing references stay valid
    Object.keys(nd).forEach((k) => { global.DATA[k] = nd[k]; });
    return global.DATA;
  };

  API.register = async function (payload) { const r = await req("POST", "/auth/register", payload, { auth: false }); setSession(r.token, r.user); return r; };
  API.login = async function (payload) { const r = await req("POST", "/auth/login", payload, { auth: false }); setSession(r.token, r.user); return r; };
  API.logout = function () { clearSession(); };

  API.createOrder = function (payload) { return req("POST", "/orders", payload); };
  API.getOrder = function (id) { return req("GET", "/orders/" + encodeURIComponent(id)); };
  API.listMine = function () { return req("GET", "/orders"); };
  API.checkoutSession = function (orderId, lang) { return req("POST", "/checkout/session", { orderId, lang }); };

  // admin
  API.admin = {
    stats: () => req("GET", "/admin/stats"),
    drivers: () => req("GET", "/admin/drivers"),
    orders: (q) => req("GET", "/admin/orders" + (q ? "?" + new URLSearchParams(q) : "")),
    assign: (id, driverId) => req("POST", "/admin/orders/" + id + "/assign", { driverId }),
    status: (id, status) => req("POST", "/admin/orders/" + id + "/status", { status })
  };

  global.API = API;
})(window);
