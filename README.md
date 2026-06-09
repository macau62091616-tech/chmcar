# CHM Car · chmcar.com（全端版）

港・澳・大陸一站式旅遊出行平台。可安裝 PWA 前端 + Node 後端 + Stripe 金流。

## 功能
- **點對點叫車**：香港 / 澳門 / 大陸，跨境路線、車型、伺服器即時報價。
- **澳門酒店訂房**：房型、入住日期、房況庫存（防超賣，15 分鐘 hold 自動釋放）。
- **演唱會購票**：揀區、張數、票務庫存。
- **會員系統**：註冊 / 登入（JWT + bcrypt），訂單綁定帳戶。
- **金流**：Stripe Checkout（信用卡 / 支付寶 / 微信），未設 key 時自動用 mock 模擬。
- **車隊調度後台**：`/admin.html`，派司機、改訂單狀態、看收入統計。
- **5 語言**：繁中 / 简中 / English / 日本語 / 한국어。
- **離線可用**：後端連唔到時，前端自動退回本機示範資料（PWA 仍可瀏覽 + 模擬下單）。

## 技術
- 後端：Node 22（內建 `node:sqlite`，零原生編譯）、Express、bcryptjs、jsonwebtoken、stripe。
- 前端：原生 JS PWA（service worker + manifest），同一服務以 Express static 提供。
- 資料層集中喺 `src/db.js`、`src/store.js`，日後可換 Postgres。

## 快速開始
```bash
npm install
cp .env.example .env
npm start          # http://localhost:3000  ；後台 /admin.html
npm test           # 後端 API 端對端測試
```

## 目錄
```
server.js              Express：靜態前端 + /api
src/  loadenv db schema seed seedData store auth orders payments admin
public/  index.html admin.html  css/  js/(i18n i18n-extra config data api app)  icons/
test/  api.test.js  fe_offline.test.js  fe_online.test.js
render.yaml  Dockerfile  .env.example
```

詳細上線步驟（Render 部署、綁定 chmcar.com、Stripe 設定）見 **README-DEPLOY.md**。
