# CHM Car 上線指南（chmcar.com）

全端 PWA：Node + Express + SQLite（`node:sqlite` 內建，無需編譯）。一個服務同時提供 **API** 同 **PWA 前端**，並接 **Stripe**（一個整合涵蓋 信用卡 / 支付寶 / 微信）。

---

## 一、本機試行（5 分鐘）

```bash
cd chmcar-fullstack
npm install
cp .env.example .env      # 可改 ADMIN_PASSWORD / JWT_SECRET
npm start                 # http://localhost:3000
```

- 未填 `STRIPE_SECRET_KEY` 時，付款行**模擬金流**（mock，不會扣款），整個下單流程照樣行得通。
- 管理後台：`http://localhost:3000/admin.html`（用 `.env` 內 `ADMIN_EMAIL / ADMIN_PASSWORD` 登入）。
- 跑測試：`npm test`（後端）、`node test/fe_offline.test.js`、`node test/fe_online.test.js`。

資料庫會在首次啟動時自動建立並載入示範資料（地點、車型、6 間酒店、6 場演唱會、4 位司機、admin 帳戶）。

---

## 二、推上 GitHub

```bash
git init && git add . && git commit -m "CHM Car full-stack"
git branch -M main
git remote add origin https://github.com/<你>/chmcar.git
git push -u origin main
```

（`.gitignore` 已排除 `node_modules`、`.env`、`data/`。）

---

## 三、部署到 Render

1. Render → **New ➜ Blueprint** → 揀你個 repo（已含 `render.yaml`）。
2. Render 會建立一個 web service `chmcar`，並掛 1GB 持久磁碟（存 SQLite）。
3. 在 **Environment** 填以下 secret（`render.yaml` 標咗 `sync:false`）：
   - `ADMIN_PASSWORD` — 你嘅管理員密碼
   - `STRIPE_SECRET_KEY` — 先用 `sk_test_...`（見第五節）
   - `STRIPE_WEBHOOK_SECRET` — `whsec_...`（建好 webhook 後填）
   - `JWT_SECRET` 由 Render 自動產生，唔使填。
4. Deploy。完成後會有一條 `https://chmcar.onrender.com` 試用網址。

> **磁碟提示**：`starter`（付費）方案先支援持久磁碟，資料先唔會喺重新部署時消失。想免費試，可將 `render.yaml` 的 `plan` 改 `free`，但 SQLite 資料會喺每次 deploy 重置。長遠建議升 Postgres（見第七節）。
> **Node 版本**：本專案用 Node 22 內建 `node:sqlite`。若部署日誌出現「SQLite is experimental，需要 flag」，將 `startCommand` 改成 `node --experimental-sqlite server.js` 即可。

---

## 四、綁定 chmcar.com（你有 DNS 管理權）

1. Render service → **Settings ➜ Custom Domains ➜ Add** → 輸入 `chmcar.com` 同 `www.chmcar.com`。
2. Render 會俾你 DNS 目標值。去你嘅網域商（DNS 設定）加：
   - 根網域 `chmcar.com`：用 Render 提供的 `A` 記錄（或 `ALIAS/ANAME`，視乎你 DNS 商）。
   - `www`：加 `CNAME` 指向 Render 提供的 `*.onrender.com` 目標。
3. 等 DNS 生效（數分鐘至數小時）。Render 會自動簽發 **HTTPS（Let's Encrypt）**。
4. 生效後 `https://chmcar.com` 即可安裝為 PWA、離線使用。

---

## 五、Stripe 測試金流（先試，後收真錢）

1. 開 Stripe 帳戶，切到 **Test mode**。
2. **Developers ➜ API keys** 複製 `Secret key`（`sk_test_...`）→ 填入 Render 的 `STRIPE_SECRET_KEY`。
3. **Developers ➜ Webhooks ➜ Add endpoint**：
   - URL：`https://chmcar.com/api/webhook/stripe`
   - 事件：`checkout.session.completed`（建議加 `checkout.session.async_payment_succeeded`）
   - 建好後複製 **Signing secret**（`whsec_...`）→ 填入 Render 的 `STRIPE_WEBHOOK_SECRET`。
4. 重新 deploy。結帳會跳轉去 Stripe Checkout（測試卡 `4242 4242 4242 4242`、任意未來日期、任意 CVC）。付款成功後 webhook 會把訂單標記為已付款。

> 支付寶 / 微信：Stripe Checkout 已內建呢兩種付款方式（`alipay`、`wechat_pay`），同卡一齊喺結帳頁出現，毋須另外整合。喺 Stripe Dashboard 啟用對應 payment method 即可。

---

## 六、切換真實收款

1. Stripe 帳戶完成商戶驗證（公司 / 銀行資料）。
2. 切到 **Live mode**，複製 `sk_live_...` 同新嘅 live webhook secret。
3. 將 Render 的 `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET` 換成 live 值，重新 deploy。
4. 完成。之後就係真實扣款。

---

## 七、注意事項與下一步

- **資料庫持久性**：SQLite 適合中小流量。流量上升或要多實例時，建議轉 **PostgreSQL**（Render 有託管 Postgres）。`src/db.js` 是唯一資料層接口，改一處即可。
- **安全**：上線前務必設強 `JWT_SECRET` 同 `ADMIN_PASSWORD`；admin 帳戶只俾內部用。
- **房況 / 票務**：目前以「數量」扣減並有 15 分鐘 hold 自動釋放（防超賣）。若要按日曆日期管理房況，可擴充 `rooms` 為每日庫存表。
- **車隊調度**：`admin.html` 可指派司機、更新訂單狀態（已付款 → 已派車 → 完成）。司機資料喺 `drivers` 表。

---

## API 一覽（前綴 `/api`）

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/health` | 健康檢查（顯示金流模式） |
| GET | `/catalog` | 地區、地點、車型、車資、熱門路線 |
| POST | `/quote` | 車資估算 `{from,to,vehicleClass}` |
| GET | `/hotels`、`/hotels/:id` | 酒店與房況 |
| GET | `/concerts`、`/concerts/:id` | 演唱會與票區餘量 |
| POST | `/auth/register`、`/auth/login`、GET `/me` | 會員 |
| POST | `/orders` | 建立訂單（伺服器驗價 + 扣庫存 + hold） |
| GET | `/orders`、`/orders/:id` | 查訂單 |
| POST | `/checkout/session` | 建立 Stripe / mock 結帳 |
| POST | `/webhook/stripe` | Stripe webhook（確認付款） |
| GET | `/admin/orders`、`/admin/drivers`、`/admin/stats` | 管理（需 admin） |
| POST | `/admin/orders/:id/assign`、`/admin/orders/:id/status` | 派車 / 改狀態 |
