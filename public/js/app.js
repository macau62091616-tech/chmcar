/* CHM Car — app shell, router, views, booking + payment-placeholder flow */
(function () {
  "use strict";
  const { t } = window.I18N;
  const D = window.DATA;
  const API = window.API || { online: false };
  const $ = (s, r) => (r || document).querySelector(s);
  const lang = () => window.I18N.lang;
  const pick = (o) => D.pick(o, lang());

  /* ---------------- state ---------------- */
  const ORDERS_KEY = "chmcar.orders";
  const state = {
    car: { from: "hk-hkia", to: "mo-cotai", date: "", time: "", pax: 2, lug: 2, cls: "comfort", estimated: false },
    hotel: { checkin: "", checkout: "", guests: 2, rooms: 1 },
    pending: null,
    pendingReq: null
  };

  /* ---------------- helpers ---------------- */
  const cur = () => t("common.currency");
  function money(n) { return cur() + " " + Math.round(n).toLocaleString("en-US"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function todayISO(offset) { const d = new Date(); d.setDate(d.getDate() + (offset || 0)); return d.toISOString().slice(0, 10); }
  function nextHour() { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d.toTimeString().slice(0, 5); }
  function nights() {
    const a = new Date(state.hotel.checkin), b = new Date(state.hotel.checkout);
    const n = Math.round((b - a) / 86400000);
    return n > 0 ? n : 1;
  }
  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(lang() === "en" ? "en-GB" : lang(), { year: "numeric", month: "short", day: "numeric" });
  }
  function getOrders() { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch (e) { return []; } }
  function saveOrders(a) { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(a)); } catch (e) {} }
  function orderNo() { return "CHM" + Date.now().toString(36).toUpperCase().slice(-6) + Math.floor(Math.random() * 90 + 10); }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.hidden = false; el.classList.add("toast--show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.classList.remove("toast--show"); setTimeout(() => (el.hidden = true), 250); }, 2200);
  }

  function locOptions(selected) {
    return D.REGIONS.map((r) => {
      const opts = D.LOCATIONS.filter((l) => l.region === r.id)
        .map((l) => `<option value="${l.id}" ${l.id === selected ? "selected" : ""}>${esc(pick(l.name))}</option>`).join("");
      return `<optgroup label="${r.flag} ${esc(pick(r.name))}">${opts}</optgroup>`;
    }).join("");
  }

  function gradientStyle(g) { return `background:linear-gradient(135deg, ${g[0]}, ${g[1]});`; }

  /* ---------------- views ---------------- */
  function viewHome() {
    const routeCards = D.POPULAR_ROUTES.slice(0, 6).map((r) => {
      const a = D.locById(r.from), b = D.locById(r.to);
      const est = D.estimateFare(a.region, b.region, "economy");
      return `<button class="route-card" data-action="quick-route" data-from="${r.from}" data-to="${r.to}">
        <div class="route-card__path">
          <span class="route-card__dot"></span>
          <span class="route-card__line"></span>
          <span class="route-card__pin">📍</span>
        </div>
        <div class="route-card__text">
          <div class="route-card__row"><b>${esc(pick(a.name))}</b></div>
          <div class="route-card__row route-card__row--muted">${esc(pick(b.name))}</div>
        </div>
        <div class="route-card__meta">
          ${r.badge ? `<span class="chip chip--hot">${esc(t("car.popularRoute"))}</span>` : ""}
          <span class="route-card__price">${t("common.from_price")} ${money(est.total)}</span>
        </div>
      </button>`;
    }).join("");

    const why = [1, 2, 3, 4].map((i) => `
      <div class="why">
        <div class="why__icon">${["🛂", "🏷️", "🌐", "🧳"][i - 1]}</div>
        <div><div class="why__t">${esc(t("home.why" + i + "T"))}</div>
        <div class="why__d">${esc(t("home.why" + i + "D"))}</div></div>
      </div>`).join("");

    const services = [
      { r: "#/car", k: "Car", icon: "🚗", g: ["#0B2A4A", "#1E6F8E"] },
      { r: "#/hotel", k: "Hotel", icon: "🏨", g: ["#3a1f4f", "#7a3f8e"] },
      { r: "#/concert", k: "Concert", icon: "🎤", g: ["#4a2e0f", "#D6A854"] }
    ].map((s) => `
      <button class="svc" data-link="${s.r}" style="${gradientStyle(s.g)}">
        <span class="svc__icon">${s.icon}</span>
        <span class="svc__t">${esc(t("home.svc" + s.k + "T"))}</span>
        <span class="svc__d">${esc(t("home.svc" + s.k + "D"))}</span>
      </button>`).join("");

    const regions = D.REGIONS.map((r) => `<span class="region-chip">${r.flag} ${esc(pick(r.name))}</span>`).join("");

    return `
      <section class="hero">
        <div class="hero__bg"></div>
        <div class="hero__inner">
          <span class="hero__badge">${esc(t("brand.tagline"))}</span>
          <h1 class="hero__title">${esc(t("home.heroTitle"))}</h1>
          <p class="hero__sub">${esc(t("home.heroSub"))}</p>
          <button class="btn btn--gold hero__cta" data-link="#/car">${esc(t("home.ctaCar"))} →</button>
          <div class="hero__regions">${regions}</div>
        </div>
      </section>

      <section class="section">
        <div class="svc-grid">${services}</div>
      </section>

      <section class="section">
        <div class="section__head"><h2>${esc(t("home.popularRoutes"))}</h2>
          <button class="link" data-link="#/car">${esc(t("common.viewAll"))} →</button></div>
        <div class="route-grid">${routeCards}</div>
      </section>

      <section class="section">
        <div class="section__head"><h2>${esc(t("home.whyTitle"))}</h2></div>
        <div class="why-grid">${why}</div>
      </section>

      <footer class="foot">CHM Car · chmcar.com · <span class="foot__demo">${esc(t("demo.badge"))}</span></footer>
    `;
  }

  function viewCar() {
    const c = state.car;
    let fareBlock = "";
    if (c.estimated) {
      const a = D.locById(c.from), b = D.locById(c.to);
      const rf = a ? a.region : "hk", rt = b ? b.region : "hk";
      const cards = D.VEHICLE_CLASSES.map((v) => {
        const est = D.estimateFare(rf, rt, v.id);
        const sel = v.id === c.cls;
        return `<button class="vclass ${sel ? "vclass--sel" : ""}" data-action="pick-class" data-cls="${v.id}">
          <span class="vclass__icon">${v.icon}</span>
          <span class="vclass__info">
            <b>${esc(t(v.nameKey))}</b>
            <small>${esc(t(v.descKey))} · ${t("car.eta")} ~${est.eta} min</small>
          </span>
          <span class="vclass__price">${money(est.total)}${est.isCross ? `<small>${esc(t("common.included"))} ${esc(t("car.crossFee"))}</small>` : ""}</span>
        </button>`;
      }).join("");
      const est = D.estimateFare(rf, rt, c.cls);
      fareBlock = `
        <div class="section__head"><h2>${esc(t("car.vehicle"))}</h2></div>
        <div class="vclass-list">${cards}</div>
        ${rf !== rt ? `<p class="note">ℹ️ ${esc(t("car.crossBorderNote"))}</p>` : ""}
        <div class="fare-breakdown">
          <div class="fare-row"><span>${esc(t("car.baseFare"))}</span><span>${money(est.ride)}</span></div>
          ${est.isCross ? `<div class="fare-row"><span>${esc(t("car.crossFee"))}</span><span>${money(est.crossFee)}</span></div>` : ""}
          <div class="fare-row fare-row--total"><span>${esc(t("common.total"))}</span><span>${money(est.total)}</span></div>
        </div>
        <button class="btn btn--primary btn--block" data-action="car-checkout">${esc(t("car.bookThis"))} · ${money(est.total)}</button>
      `;
    }

    return `
      <div class="page-head"><h1>${esc(t("car.title"))}</h1><p>${esc(t("car.sub"))}</p></div>
      <div class="card form">
        <label class="field">
          <span class="field__label">${esc(t("car.pickup"))}</span>
          <select class="input" data-field="car.from">${locOptions(c.from)}</select>
        </label>
        <button class="swap" data-action="swap" aria-label="${esc(t("car.swap"))}">⇅</button>
        <label class="field">
          <span class="field__label">${esc(t("car.dropoff"))}</span>
          <select class="input" data-field="car.to">${locOptions(c.to)}</select>
        </label>
        <div class="field-row">
          <label class="field"><span class="field__label">${esc(t("common.date"))}</span>
            <input class="input" type="date" data-field="car.date" value="${c.date}" min="${todayISO()}"></label>
          <label class="field"><span class="field__label">${esc(t("common.time"))}</span>
            <input class="input" type="time" data-field="car.time" value="${c.time}"></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="field__label">${esc(t("car.pax"))}</span>
            <input class="input" type="number" min="1" max="7" data-field="car.pax" value="${c.pax}"></label>
          <label class="field"><span class="field__label">${esc(t("car.luggage"))}</span>
            <input class="input" type="number" min="0" max="10" data-field="car.lug" value="${c.lug}"></label>
        </div>
        <button class="btn btn--primary btn--block" data-action="estimate">${esc(t("car.estimateBtn"))}</button>
      </div>
      ${fareBlock}
    `;
  }

  function viewHotelList() {
    ensureHotelDates();
    const h = state.hotel;
    const cards = D.HOTELS.map((ht) => {
      const min = Math.min.apply(null, ht.rooms.map((r) => r.price));
      return `<button class="hotel-card" data-link="#/hotel/${ht.id}">
        <div class="hotel-card__img" style="${gradientStyle(ht.g)}"><span>🏨</span></div>
        <div class="hotel-card__body">
          <div class="hotel-card__top">
            <b class="hotel-card__name">${esc(pick(ht.name))}</b>
            <span class="rating">★ ${ht.rating}</span>
          </div>
          <div class="hotel-card__area">📍 ${esc(pick(ht.area))} · ${ht.reviews.toLocaleString()} ★</div>
          <div class="hotel-card__foot">
            <span class="hotel-card__price">${t("common.from_price")} <b>${money(min)}</b><small>${esc(t("hotel.from"))}</small></span>
            <span class="chip">${esc(t("hotel.selectRoom"))} →</span>
          </div>
        </div>
      </button>`;
    }).join("");
    return `
      <div class="page-head"><h1>${esc(t("hotel.title"))}</h1><p>${esc(t("hotel.sub"))}</p></div>
      <div class="card form form--inline">
        <label class="field"><span class="field__label">${esc(t("hotel.checkin"))}</span>
          <input class="input" type="date" data-field="hotel.checkin" value="${h.checkin}" min="${todayISO()}"></label>
        <label class="field"><span class="field__label">${esc(t("hotel.checkout"))}</span>
          <input class="input" type="date" data-field="hotel.checkout" value="${h.checkout}" min="${todayISO(1)}"></label>
        <label class="field"><span class="field__label">${esc(t("hotel.guests"))}</span>
          <input class="input" type="number" min="1" max="6" data-field="hotel.guests" value="${h.guests}"></label>
      </div>
      <p class="muted-line">🌙 ${esc(t("hotel.nights").replace("{n}", nights()))}</p>
      <div class="hotel-list">${cards}</div>
    `;
  }

  function viewHotelDetail(id) {
    const ht = D.HOTELS.find((x) => x.id === id);
    if (!ht) return notFound();
    ensureHotelDates();
    const n = nights();
    const rooms = ht.rooms.map((r) => `
      <div class="room">
        <div class="room__info">
          <b>${esc(pick(r.name))}</b>
          <div class="room__perks">
            <span>👤 ${r.cap} ${esc(t("common.adult"))}</span>
            ${r.breakfast ? `<span class="ok">🍳 ${esc(t("hotel.breakfast"))}</span>` : ""}
            ${r.freeCancel ? `<span class="ok">✓ ${esc(t("hotel.freeCancel"))}</span>` : ""}
          </div>
          <div class="room__left">${esc(t("hotel.roomLeft").replace("{n}", r.left))}</div>
        </div>
        <div class="room__buy">
          <div class="room__price">${money(r.price)}<small>${esc(t("hotel.from"))}</small></div>
          <div class="room__total">${esc(t("hotel.totalFor").replace("{n}", n))} ${money(r.price * n)}</div>
          <button class="btn btn--primary btn--sm" data-action="book-room" data-hotel="${ht.id}" data-room="${r.id}">${esc(t("hotel.bookRoom"))}</button>
        </div>
      </div>`).join("");
    return `
      <button class="back" data-action="back">← ${esc(t("common.back"))}</button>
      <div class="detail-hero" style="${gradientStyle(ht.g)}"><span>🏨</span></div>
      <div class="page-head page-head--tight">
        <div class="detail-title"><h1>${esc(pick(ht.name))}</h1><span class="rating rating--lg">★ ${ht.rating}</span></div>
        <p>📍 ${esc(pick(ht.area))}</p>
      </div>
      <div class="card form--inline form--mini">
        <span>📅 ${fmtDate(state.hotel.checkin)} → ${fmtDate(state.hotel.checkout)}</span>
        <span>🌙 ${esc(t("hotel.nights").replace("{n}", n))}</span>
      </div>
      <div class="section__head"><h2>${esc(t("hotel.selectRoom"))}</h2></div>
      <div class="room-list">${rooms}</div>
    `;
  }

  function viewConcertList() {
    const cards = D.CONCERTS.map((c) => {
      const min = Math.min.apply(null, c.zones.map((z) => z.price));
      const on = c.status === "onsale";
      return `<button class="concert-card" data-link="#/concert/${c.id}">
        <div class="concert-card__img" style="${gradientStyle(c.g)}">
          <span class="concert-card__icon">🎤</span>
          <span class="badge ${on ? "badge--on" : "badge--soon"}">${esc(t(on ? "concert.onsale" : "concert.upcoming"))}</span>
        </div>
        <div class="concert-card__body">
          <b class="concert-card__name">${esc(pick(c.title))}</b>
          <div class="concert-card__meta">📅 ${fmtDate(c.date)}</div>
          <div class="concert-card__meta">📍 ${esc(pick(c.venue))}</div>
          <div class="concert-card__foot">
            <span>${esc(t("concert.from"))} <b>${money(min)}</b></span>
            <span class="chip">${esc(t("concert.selectZone"))} →</span>
          </div>
        </div>
      </button>`;
    }).join("");
    return `
      <div class="page-head"><h1>${esc(t("concert.title"))}</h1><p>${esc(t("concert.sub"))}</p></div>
      <div class="concert-list">${cards}</div>
    `;
  }

  function viewConcertDetail(id) {
    const c = D.CONCERTS.find((x) => x.id === id);
    if (!c) return notFound();
    const zones = c.zones.map((z, i) => {
      const so = z.soldout || z.left === 0 && c.status === "onsale";
      const disabled = so;
      return `<div class="zone ${disabled ? "zone--off" : ""}">
        <div class="zone__info"><b>${esc(pick(z.name))}</b>
          <small>${disabled ? esc(t("concert.soldout")) : (c.status === "onsale" ? esc(t("concert.zoneLeft").replace("{n}", z.left)) : esc(t("concert.upcoming")))}</small>
        </div>
        <div class="zone__price">${money(z.price)}</div>
        <button class="btn ${disabled ? "btn--ghost" : "btn--primary"} btn--sm" ${disabled || c.status !== "onsale" ? "disabled" : ""}
          data-action="pick-zone" data-concert="${c.id}" data-zone="${i}">
          ${disabled ? esc(t("concert.soldout")) : esc(t("common.select"))}
        </button>
      </div>`;
    }).join("");
    return `
      <button class="back" data-action="back">← ${esc(t("common.back"))}</button>
      <div class="detail-hero" style="${gradientStyle(c.g)}"><span>🎤</span></div>
      <div class="page-head page-head--tight">
        <h1>${esc(pick(c.title))}</h1>
        <p>📅 ${fmtDate(c.date)} · 📍 ${esc(pick(c.venue))}</p>
      </div>
      <div class="section__head"><h2>${esc(t("concert.selectZone"))}</h2></div>
      <div class="zone-list">${zones}</div>
    `;
  }

  function viewCheckout() {
    const p = state.pending;
    if (!p) { location.hash = "#/home"; return ""; }
    const methods = [
      { id: "card", icon: "💳" }, { id: "alipay", icon: "🅰️" }, { id: "wechat", icon: "💬" },
      { id: "applepay", icon: "" }, { id: "octopus", icon: "🐙" }
    ].map((m, i) => `
      <label class="pay ${i === 0 ? "pay--sel" : ""}">
        <input type="radio" name="pay" value="${m.id}" ${i === 0 ? "checked" : ""}>
        <span class="pay__icon">${m.icon || ""}</span>
        <span>${esc(t("checkout.method." + m.id))}</span>
      </label>`).join("");

    return `
      <button class="back" data-action="back">← ${esc(t("common.back"))}</button>
      <div class="page-head page-head--tight"><h1>${esc(t("checkout.title"))}</h1></div>

      <div class="section__head"><h2>${esc(t("checkout.summary"))}</h2></div>
      <div class="card summary">${summaryHTML(p)}</div>

      <div class="section__head"><h2>${esc(t("checkout.contact"))}</h2></div>
      <div class="card form">
        <label class="field"><span class="field__label">${esc(t("checkout.name"))} *</span>
          <input class="input" data-field="co.name" placeholder="${esc(t("checkout.namePh"))}"></label>
        <div class="field-row">
          <label class="field"><span class="field__label">${esc(t("checkout.phone"))} *</span>
            <input class="input" type="tel" data-field="co.phone" placeholder="${esc(t("checkout.phonePh"))}"></label>
          <label class="field"><span class="field__label">${esc(t("checkout.email"))} *</span>
            <input class="input" type="email" data-field="co.email" placeholder="${esc(t("checkout.emailPh"))}"></label>
        </div>
        <label class="field"><span class="field__label">${esc(t("checkout.remarks"))}</span>
          <textarea class="input" rows="2" data-field="co.remarks" placeholder="${esc(t("checkout.remarksPh"))}"></textarea></label>
      </div>

      <div class="section__head"><h2>${esc(t("checkout.payment"))}</h2></div>
      <div class="pay-list">${methods}</div>
      <p class="note note--warn">🔒 ${esc(!API.online ? t("checkout.payNote") : (API.stripe === "mock" ? t("checkout.payNoteMock") : t("checkout.payNoteTest")))}</p>

      <label class="agree"><input type="checkbox" data-field="co.agree"><span>${esc(t("checkout.agree"))}</span></label>

      <div class="pay-bar">
        <div class="pay-bar__total"><small>${esc(t("common.total"))}</small><b>${money(p.total)}</b></div>
        <button class="btn btn--gold pay-bar__btn" data-action="pay">${esc(t("checkout.payNow"))}</button>
      </div>
    `;
  }

  function summaryHTML(p) {
    if (p.type === "car") {
      return `<div class="sum-line"><span class="sum-icon">🚗</span><div>
          <b>${esc(p.title)}</b>
          <div class="sum-sub">${esc(p.sub)}</div>
          <div class="sum-sub">${esc(p.sub2 || "")}</div>
        </div></div>
        <div class="fare-breakdown fare-breakdown--flat">
          <div class="fare-row"><span>${esc(t("car.baseFare"))}</span><span>${money(p.ride)}</span></div>
          ${p.crossFee ? `<div class="fare-row"><span>${esc(t("car.crossFee"))}</span><span>${money(p.crossFee)}</span></div>` : ""}
          <div class="fare-row fare-row--total"><span>${esc(t("common.total"))}</span><span>${money(p.total)}</span></div>
        </div>`;
    }
    if (p.type === "hotel") {
      return `<div class="sum-line"><span class="sum-icon">🏨</span><div>
          <b>${esc(p.title)}</b>
          <div class="sum-sub">${esc(p.sub)}</div>
          <div class="sum-sub">${esc(p.sub2)}</div>
        </div></div>
        <div class="fare-breakdown fare-breakdown--flat">
          <div class="fare-row"><span>${money(p.unit)} × ${p.qty} ${esc(t("common.night"))}</span><span>${money(p.total)}</span></div>
          <div class="fare-row fare-row--total"><span>${esc(t("common.total"))}</span><span>${money(p.total)}</span></div>
        </div>`;
    }
    // concert
    return `<div class="sum-line"><span class="sum-icon">🎤</span><div>
        <b>${esc(p.title)}</b>
        <div class="sum-sub">${esc(p.sub)}</div>
        <div class="sum-sub">${esc(p.sub2)}</div>
      </div></div>
      <div class="fare-breakdown fare-breakdown--flat">
        <div class="fare-row"><span>${money(p.unit)} × ${p.qty}</span><span>${money(p.total)}</span></div>
        <div class="fare-row fare-row--total"><span>${esc(t("common.total"))}</span><span>${money(p.total)}</span></div>
      </div>`;
  }

  function viewSuccess() {
    const o = state.lastOrder;
    if (!o) { location.hash = "#/orders"; return ""; }
    return `<div class="success">
      <div class="success__check">✓</div>
      <h1>${esc(t("success.title"))}</h1>
      <p>${esc(t("success.sub"))}</p>
      <div class="success__no">${esc(t("success.orderNo"))}<br><b>${esc(o.no)}</b></div>
      <div class="card summary">${summaryHTML(o)}</div>
      <p class="note note--warn">🔒 ${esc(t("success.demoNote"))}</p>
      <button class="btn btn--primary btn--block" data-link="#/orders">${esc(t("success.viewOrders"))}</button>
      <button class="btn btn--ghost btn--block" data-link="#/home">${esc(t("success.backHome"))}</button>
    </div>`;
  }

  function viewOrders() {
    const orders = getOrders();
    if (!orders.length) {
      return `<div class="page-head"><h1>${esc(t("orders.title"))}</h1></div>
        <div class="empty"><div class="empty__icon">🧾</div>
          <b>${esc(t("orders.empty"))}</b><p>${esc(t("orders.emptySub"))}</p>
          <button class="btn btn--primary" data-link="#/home">${esc(t("orders.browse"))}</button>
        </div>`;
    }
    const icon = { car: "🚗", hotel: "🏨", concert: "🎤" };
    const list = orders.slice().reverse().map((o) => `
      <div class="order-card">
        <div class="order-card__icon">${icon[o.type]}</div>
        <div class="order-card__body">
          <div class="order-card__top"><b>${esc(o.title)}</b><span class="chip chip--ok">${esc(t("orders.status.confirmed"))}</span></div>
          <div class="sum-sub">${esc(o.sub)}</div>
          <div class="order-card__foot"><span class="order-card__no">${esc(o.no)}</span><b>${money(o.total)}</b></div>
        </div>
      </div>`).join("");
    return `<div class="page-head"><h1>${esc(t("orders.title"))}</h1></div>
      <div class="order-list">${list}</div>
      <button class="btn btn--ghost btn--block" data-action="clear-orders">${esc(t("orders.clear"))}</button>`;
  }

  function notFound() { return `<div class="empty"><div class="empty__icon">🔍</div><b>404</b><button class="btn btn--primary" data-link="#/home">${esc(t("common.back"))}</button></div>`; }

  /* ---------------- builders for pending orders ---------------- */
  function buildCarPending() {
    const c = state.car;
    const a = D.locById(c.from), b = D.locById(c.to);
    const est = D.estimateFare(a.region, b.region, c.cls);
    const vc = D.VEHICLE_CLASSES.find((v) => v.id === c.cls);
    const when = (c.date ? fmtDate(c.date) : t("car.now")) + (c.time ? " " + c.time : "");
    return {
      type: "car",
      title: pick(a.name) + " → " + pick(b.name),
      sub: t(vc.nameKey) + " · " + c.pax + " " + t("common.pax") + " · 🧳 " + c.lug,
      sub2: "🕑 " + when,
      ride: est.ride, crossFee: est.crossFee, total: est.total
    };
  }
  function buildHotelPending(hotelId, roomId) {
    const ht = D.HOTELS.find((x) => x.id === hotelId);
    const r = ht.rooms.find((x) => x.id === roomId);
    const n = nights();
    return {
      type: "hotel",
      title: pick(ht.name),
      sub: pick(r.name) + " · " + fmtDate(state.hotel.checkin) + " → " + fmtDate(state.hotel.checkout),
      sub2: "🌙 " + t("hotel.nights").replace("{n}", n) + " · 👤 " + state.hotel.guests,
      unit: r.price, qty: n, total: r.price * n
    };
  }
  function buildConcertPending(concertId, zoneIdx, qty) {
    const c = D.CONCERTS.find((x) => x.id === concertId);
    const z = c.zones[zoneIdx];
    return {
      type: "concert",
      title: pick(c.title),
      sub: pick(z.name) + " × " + qty,
      sub2: "📅 " + fmtDate(c.date) + " · 📍 " + pick(c.venue),
      unit: z.price, qty: qty, total: z.price * qty
    };
  }

  /* ---------------- router ---------------- */
  function parseHash() {
    const raw = (location.hash || "#/home").replace(/^#\/?/, "");
    const [pathPart, queryPart] = raw.split("?");
    const [name, param] = pathPart.split("/");
    const query = {};
    if (queryPart) new URLSearchParams(queryPart).forEach((v, k) => (query[k] = v));
    return { name: name || "home", param, query };
  }

  function render() {
    const { name, param, query } = parseHash();
    const app = $("#app");
    // async (server-backed) views
    if (name === "success" && API.online && query.order) { setActiveTab(name); renderSuccessServer(query.order); return; }
    if (name === "orders" && API.online && API.user) { setActiveTab(name); renderOrdersServer(); return; }
    let html = "";
    switch (name) {
      case "home": html = viewHome(); break;
      case "car": html = viewCar(); break;
      case "hotel": html = param ? viewHotelDetail(param) : viewHotelList(); break;
      case "concert": html = param ? viewConcertDetail(param) : viewConcertList(); break;
      case "checkout": html = viewCheckout(); break;
      case "success": html = viewSuccess(); break;
      case "orders": html = viewOrders(); break;
      default: html = notFound();
    }
    app.innerHTML = html;
    app.scrollTop = 0; window.scrollTo(0, 0);
    setActiveTab(name);
  }

  /* server-backed success + orders */
  function serverOrderToView(o) {
    const d = o.details || {};
    const base = { type: o.type, title: o.title, sub: o.sub, sub2: o.sub2, total: o.amount, no: o.id, status: o.status };
    if (o.type === "car") { base.ride = d.ride; base.crossFee = d.crossFee; }
    else { base.unit = d.unit; base.qty = d.qty || d.nights || 1; }
    return base;
  }
  function payStateNote() {
    if (!API.online) return t("success.demoNote");
    return API.stripe === "mock" ? t("checkout.payNoteMock") : t("checkout.payNoteTest");
  }
  function renderSuccessServer(orderId, isRetry) {
    const app = $("#app");
    app.innerHTML = `<div class="success"><div class="splash__spinner" style="margin:40px auto"></div></div>`;
    window.scrollTo(0, 0);
    API.getOrder(orderId).then(({ order }) => {
      const v = serverOrderToView(order);
      const paidish = ["paid", "assigned", "completed"].includes(order.status);
      // Stripe webhook may lag a moment — retry once
      if (!paidish && !isRetry) { setTimeout(() => renderSuccessServer(orderId, true), 1600); }
      app.innerHTML = `<div class="success">
        <div class="success__check">✓</div>
        <h1>${esc(t("success.title"))}</h1>
        <p>${esc(t("success.sub"))}</p>
        <div class="success__no">${esc(t("success.orderNo"))}<br><b>${esc(order.id)}</b></div>
        <div class="card summary">${summaryHTML(v)}</div>
        <p class="note note--warn">🔒 ${esc(payStateNote())}</p>
        <button class="btn btn--primary btn--block" data-link="#/orders">${esc(t("success.viewOrders"))}</button>
        <button class="btn btn--ghost btn--block" data-link="#/home">${esc(t("success.backHome"))}</button>
      </div>`;
    }).catch(() => { app.innerHTML = viewSuccess(); });
  }
  function statusChip(s) {
    if (["paid", "assigned", "completed"].includes(s)) return `<span class="chip chip--ok">${esc(t("orders.status.confirmed"))}</span>`;
    return `<span class="chip">${esc(s)}</span>`;
  }
  function renderOrdersServer() {
    const app = $("#app");
    app.innerHTML = `<div class="page-head"><h1>${esc(t("orders.title"))}</h1></div><div class="splash__spinner" style="margin:30px auto"></div>`;
    window.scrollTo(0, 0);
    API.listMine().then(({ orders }) => {
      if (!orders.length) { app.innerHTML = viewOrders(); return; }
      const icon = { car: "🚗", hotel: "🏨", concert: "🎤" };
      const list = orders.map((o) => `
        <div class="order-card">
          <div class="order-card__icon">${icon[o.type] || "🧾"}</div>
          <div class="order-card__body">
            <div class="order-card__top"><b>${esc(o.title)}</b>${statusChip(o.status)}</div>
            <div class="sum-sub">${esc(o.sub || "")}</div>
            <div class="order-card__foot"><span class="order-card__no">${esc(o.id)}</span><b>${money(o.amount)}</b></div>
          </div>
        </div>`).join("");
      app.innerHTML = `<div class="page-head"><h1>${esc(t("orders.title"))}</h1><p>${esc(t("account.hello").replace("{name}", API.user.name || API.user.email))}</p></div>
        <div class="order-list">${list}</div>`;
    }).catch(() => { app.innerHTML = viewOrders(); });
  }

  function setActiveTab(name) {
    document.querySelectorAll(".tab").forEach((tb) => {
      tb.classList.toggle("tab--active", tb.getAttribute("data-tab") === name);
    });
  }

  function ensureHotelDates() {
    if (!state.hotel.checkin) state.hotel.checkin = todayISO(7);
    if (!state.hotel.checkout) state.hotel.checkout = todayISO(9);
  }

  /* ---------------- event delegation ---------------- */
  function onInput(e) {
    const el = e.target.closest("[data-field]");
    if (!el) return;
    const path = el.getAttribute("data-field");
    let val = el.type === "checkbox" ? el.checked : el.value;
    if (el.type === "number") val = parseInt(val || "0", 10);
    const [grp, key] = path.split(".");
    if (grp === "co") { (state.co = state.co || {})[key] = val; updatePayMethodHighlight(e); return; }
    if (state[grp]) state[grp][key] = val;
    // live update hotel nights line
    if (grp === "hotel" && (key === "checkin" || key === "checkout")) {
      const line = $(".muted-line"); if (line) line.textContent = "🌙 " + t("hotel.nights").replace("{n}", nights());
    }
  }

  function updatePayMethodHighlight(e) {
    if (e.target.name !== "pay") return;
    document.querySelectorAll(".pay").forEach((p) => p.classList.remove("pay--sel"));
    const lab = e.target.closest(".pay"); if (lab) lab.classList.add("pay--sel");
  }

  function onClick(e) {
    const link = e.target.closest("[data-link]");
    if (link) { location.hash = link.getAttribute("data-link"); return; }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.getAttribute("data-action");

    if (a === "back") { history.length > 1 ? history.back() : (location.hash = "#/home"); return; }
    if (a === "swap") { const c = state.car; const tmp = c.from; c.from = c.to; c.to = tmp; render(); return; }
    if (a === "estimate") { state.car.estimated = true; render(); return; }
    if (a === "pick-class") { state.car.cls = act.getAttribute("data-cls"); render(); return; }
    if (a === "quick-route") {
      state.car.from = act.getAttribute("data-from");
      state.car.to = act.getAttribute("data-to");
      state.car.estimated = true;
      location.hash = "#/car"; render(); return;
    }
    if (a === "car-checkout") {
      const c = state.car;
      state.pending = buildCarPending();
      state.pendingReq = { type: "car", from: c.from, to: c.to, vehicleClass: c.cls, date: c.date, time: c.time, pax: c.pax, lug: c.lug };
      state.co = prefillContact(); location.hash = "#/checkout"; return;
    }
    if (a === "book-room") {
      const hid = act.getAttribute("data-hotel"), rid = act.getAttribute("data-room");
      state.pending = buildHotelPending(hid, rid);
      state.pendingReq = { type: "hotel", hotelId: hid, roomId: rid, checkin: state.hotel.checkin, checkout: state.hotel.checkout, guests: state.hotel.guests };
      state.co = prefillContact(); location.hash = "#/checkout"; return;
    }
    if (a === "pick-zone") {
      const cid = act.getAttribute("data-concert"); const zi = +act.getAttribute("data-zone");
      openQtyPrompt(cid, zi); return;
    }
    if (a === "clear-orders") { saveOrders([]); render(); toast("✓"); return; }
    if (a === "pay") { doPay(); return; }
  }

  function openQtyPrompt(cid, zi) {
    // simple inline quantity via prompt-less stepper sheet
    const host = $("#sheetHost");
    const c = D.CONCERTS.find((x) => x.id === cid); const z = c.zones[zi];
    const maxQ = Math.min(6, z.left || 6);
    host.hidden = false;
    host.innerHTML = `<div class="sheet-backdrop" data-action="sheet-close"></div>
      <div class="sheet">
        <h3>${esc(pick(z.name))}</h3>
        <p class="sum-sub">${esc(pick(c.title))} · ${money(z.price)}</p>
        <div class="stepper">
          <button class="stepper__btn" data-action="qty-dec">−</button>
          <span class="stepper__val" id="qtyVal">1</span>
          <button class="stepper__btn" data-action="qty-inc">+</button>
        </div>
        <p class="sum-sub">${esc(t("concert.zoneLeft").replace("{n}", z.left))} · ${esc(t("common.total"))} <b id="qtyTotal">${money(z.price)}</b></p>
        <button class="btn btn--primary btn--block" data-action="qty-confirm" data-concert="${cid}" data-zone="${zi}">${esc(t("concert.buyTickets"))}</button>
        <button class="btn btn--ghost btn--block" data-action="sheet-close">${esc(t("common.cancel"))}</button>
      </div>`;
    let q = 1;
    const setQ = (nq) => { q = Math.max(1, Math.min(maxQ, nq)); $("#qtyVal").textContent = q; $("#qtyTotal").textContent = money(z.price * q); host._q = q; };
    host._q = 1;
    host.onclick = (ev) => {
      const t2 = ev.target.closest("[data-action]"); if (!t2) return;
      const aa = t2.getAttribute("data-action");
      if (aa === "qty-inc") setQ(q + 1);
      else if (aa === "qty-dec") setQ(q - 1);
      else if (aa === "sheet-close") closeSheet();
      else if (aa === "qty-confirm") {
        state.pending = buildConcertPending(cid, zi, q);
        state.pendingReq = { type: "concert", concertId: cid, zoneIdx: zi, qty: q };
        state.co = prefillContact();
        closeSheet(); location.hash = "#/checkout";
      }
    };
  }
  function closeSheet() { const host = $("#sheetHost"); host.hidden = true; host.innerHTML = ""; host.onclick = null; }

  function prefillContact() {
    const u = API.user;
    return u ? { name: u.name || "", phone: u.phone || "", email: u.email || "" } : {};
  }
  function errMsg(e) { const k = "err." + (e && e.code); const m = t(k); return m === k ? t("err.generic") : m; }

  async function doPay() {
    const co = state.co || {};
    if (!co.name || !co.phone || !co.email) { toast(t("checkout.fillRequired")); return; }
    if (!co.agree) { toast(t("checkout.mustAgree")); return; }
    const btn = document.querySelector('[data-action="pay"]');
    const resetBtn = () => { if (btn) { btn.disabled = false; btn.textContent = t("checkout.payNow"); } };
    if (btn) { btn.disabled = true; btn.textContent = t("checkout.processing"); }

    // ---- API mode: real backend order + checkout session (Stripe or mock gateway) ----
    if (API.online && state.pendingReq) {
      try {
        const payload = Object.assign({}, state.pendingReq, {
          lang: lang(),
          contact: { name: co.name, phone: co.phone, email: co.email, remarks: co.remarks || "" }
        });
        const { order } = await API.createOrder(payload);
        const sess = await API.checkoutSession(order.id, lang());
        if (btn) btn.textContent = t("checkout.redirecting");
        window.location.assign(sess.url); // returns to #/success?order=ID (mock auto-confirms; Stripe via webhook)
      } catch (e) { resetBtn(); toast(errMsg(e)); }
      return;
    }

    // ---- offline mode: local simulated gateway ----
    setTimeout(() => {
      const p = state.pending;
      const order = Object.assign({}, p, {
        no: orderNo(), at: Date.now(), contact: { name: co.name, phone: co.phone, email: co.email },
        method: (document.querySelector('input[name="pay"]:checked') || {}).value || "card"
      });
      const orders = getOrders(); orders.push(order); saveOrders(orders);
      state.lastOrder = order; state.pending = null;
      location.hash = "#/success";
    }, 900);
  }

  /* ---------------- language switch ---------------- */
  function buildLangMenu() {
    const menu = $("#langMenu");
    menu.innerHTML = window.I18N.LANGS.map((l) =>
      `<li role="option" data-lang="${l.code}" class="lang-switch__item ${l.code === lang() ? "is-active" : ""}">${l.full}</li>`).join("");
    $("#langCurrent").textContent = (window.I18N.LANGS.find((l) => l.code === lang()) || {}).label || "繁中";
  }
  function setupLangSwitch() {
    const btn = $("#langBtn"), menu = $("#langMenu");
    btn.addEventListener("click", () => {
      const open = !menu.hidden; menu.hidden = open; btn.setAttribute("aria-expanded", String(!open));
    });
    menu.addEventListener("click", (e) => {
      const li = e.target.closest("[data-lang]"); if (!li) return;
      window.I18N.setLang(li.getAttribute("data-lang"));
      menu.hidden = true; btn.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#langSwitch")) { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------------- PWA install prompt ---------------- */
  let deferredPrompt = null;
  function setupInstall() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault(); deferredPrompt = e;
      let b = $("#installBtn");
      if (!b) {
        b = document.createElement("button");
        b.id = "installBtn"; b.className = "install-btn"; b.type = "button"; b.textContent = "⤓";
        b.title = "Install"; b.setAttribute("aria-label", "Install app");
        $(".appbar__actions").prepend(b);
        b.addEventListener("click", async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; b.remove(); });
      }
    });
  }

  /* ---------------- service worker ---------------- */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ---------------- member accounts ---------------- */
  function setupAccount() {
    const btn = $("#acctBtn");
    if (!btn) return;
    btn.addEventListener("click", () => { if (!API.online) return; API.user ? openAccountMenu() : openAuthSheet("login"); });
    refreshAccountUI();
  }
  function refreshAccountUI() {
    const btn = $("#acctBtn"), lbl = $("#acctLabel");
    if (!btn) return;
    if (!API.online) { btn.style.display = "none"; return; }
    btn.style.display = "";
    if (API.user) { const nm = (API.user.name || API.user.email || "·").trim(); lbl.textContent = nm ? nm[0].toUpperCase() : "·"; btn.classList.add("acct-btn--in"); }
    else { lbl.textContent = t("account.login"); btn.classList.remove("acct-btn--in"); }
  }
  function openAuthSheet(mode) {
    mode = mode || "login";
    const host = $("#sheetHost"); host.hidden = false;
    const title = mode === "login" ? t("account.loginTitle") : t("account.registerTitle");
    host.innerHTML = `<div class="sheet-backdrop" data-ac="close"></div>
      <div class="sheet">
        <h3>${esc(title)}</h3>
        <div class="form" style="margin-top:14px">
          ${mode === "register" ? `<label class="field"><span class="field__label">${esc(t("account.name"))}</span><input class="input" id="ac-name"></label>
          <label class="field"><span class="field__label">${esc(t("account.phone"))}</span><input class="input" id="ac-phone" type="tel"></label>` : ""}
          <label class="field"><span class="field__label">${esc(t("account.email"))}</span><input class="input" id="ac-email" type="email" autocomplete="email"></label>
          <label class="field"><span class="field__label">${esc(t("account.password"))}</span><input class="input" id="ac-pass" type="password"></label>
        </div>
        <button class="btn btn--primary btn--block" data-ac="submit">${esc(title)}</button>
        <button class="btn btn--ghost btn--block" data-ac="toggle">${esc(mode === "login" ? t("account.toRegister") : t("account.toLogin"))}</button>
        <p class="note" style="text-align:center">${esc(t("account.memberNote"))}</p>
      </div>`;
    host.onclick = async (ev) => {
      const el = ev.target.closest("[data-ac]"); if (!el) return;
      const ac = el.getAttribute("data-ac");
      if (ac === "close") return closeSheet();
      if (ac === "toggle") return openAuthSheet(mode === "login" ? "register" : "login");
      if (ac === "submit") {
        const email = ($("#ac-email").value || "").trim(), pass = $("#ac-pass").value || "";
        try {
          el.disabled = true; el.textContent = t("checkout.processing");
          if (mode === "register") await API.register({ email, password: pass, name: ($("#ac-name").value || "").trim(), phone: ($("#ac-phone").value || "").trim() });
          else await API.login({ email, password: pass });
          closeSheet(); refreshAccountUI();
          toast(t("account.welcome").replace("{name}", API.user.name || API.user.email));
          if (parseHash().name === "orders") render();
        } catch (e) { el.disabled = false; el.textContent = title; toast(errMsg(e)); }
      }
    };
  }
  function openAccountMenu() {
    const host = $("#sheetHost"); host.hidden = false;
    host.innerHTML = `<div class="sheet-backdrop" data-ac="close"></div>
      <div class="sheet">
        <h3>${esc(t("account.hello").replace("{name}", API.user.name || API.user.email))}</h3>
        <p class="sum-sub">${esc(API.user.email)}${API.user.role === "admin" ? " · admin" : ""}</p>
        <button class="btn btn--primary btn--block" data-ac="orders">${esc(t("success.viewOrders"))}</button>
        <button class="btn btn--ghost btn--block" data-ac="logout">${esc(t("account.logout"))}</button>
      </div>`;
    host.onclick = (ev) => {
      const el = ev.target.closest("[data-ac]"); if (!el) return;
      const ac = el.getAttribute("data-ac");
      if (ac === "close") return closeSheet();
      if (ac === "orders") { closeSheet(); location.hash = "#/orders"; return; }
      if (ac === "logout") { API.logout(); closeSheet(); refreshAccountUI(); toast("✓"); if (parseHash().name === "orders") render(); }
    };
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    window.I18N.init();
    state.car.date = todayISO(); state.car.time = nextHour();
    ensureHotelDates();
    try { await API.detect(); if (API.online) await API.loadData(); } catch (e) { API.online = false; }
    buildLangMenu();
    window.I18N.applyStatic();
    setupLangSwitch();
    setupAccount();
    setupInstall();
    registerSW();

    document.addEventListener("input", onInput);
    document.addEventListener("change", onInput);
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", render);
    document.addEventListener("langchange", () => { buildLangMenu(); refreshAccountUI(); render(); });

    if (!location.hash) location.hash = "#/home";
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
