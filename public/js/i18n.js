/* CHM Car — i18n (5 languages: 繁中 / 简中 / EN / 日本語 / 한국어) */
(function (global) {
  "use strict";

  const LANGS = [
    { code: "zh-Hant", label: "繁中", full: "繁體中文", htmlLang: "zh-Hant" },
    { code: "zh-Hans", label: "简中", full: "简体中文", htmlLang: "zh-Hans" },
    { code: "en",      label: "EN",   full: "English",  htmlLang: "en" },
    { code: "ja",      label: "日本語", full: "日本語",  htmlLang: "ja" },
    { code: "ko",      label: "한국어", full: "한국어",  htmlLang: "ko" }
  ];

  const DICT = {
    "zh-Hant": {
      "brand.tagline": "港澳大陸・一站式旅遊出行",
      "nav.home": "首頁", "nav.car": "叫車", "nav.hotel": "酒店", "nav.concert": "演唱會", "nav.orders": "訂單",

      "common.bookNow": "立即預訂", "common.book": "預訂", "common.search": "搜尋", "common.from": "出發地",
      "common.to": "目的地", "common.date": "日期", "common.time": "時間", "common.passengers": "乘客",
      "common.total": "總計", "common.confirm": "確認", "common.cancel": "取消", "common.back": "返回",
      "common.close": "關閉", "common.next": "下一步", "common.select": "選擇", "common.selected": "已選",
      "common.details": "詳情", "common.from_price": "起", "common.perNight": "／晚", "common.night": "晚",
      "common.guests": "住客", "common.adult": "成人", "common.room": "房", "common.price": "價格",
      "common.continue": "繼續", "common.viewAll": "查看全部", "common.popular": "熱門", "common.required": "必填",
      "common.optional": "選填", "common.currency": "HK$", "common.estPrice": "預估價格", "common.included": "已含",
      "common.seeMore": "更多", "common.apply": "套用", "common.pax": "人", "common.day": "天",

      "home.heroTitle": "港・澳・大陸　點對點專車",
      "home.heroSub": "旅行社級可靠車隊，跨境直達。酒店與演唱會門票，一個 App 搞掂。",
      "home.ctaCar": "立即叫車",
      "home.svcCarT": "點對點叫車", "home.svcCarD": "香港・澳門・大陸跨境專車，固定車資無隱藏收費。",
      "home.svcHotelT": "澳門酒店", "home.svcHotelD": "精選澳門酒店房間，即訂即確認。",
      "home.svcConcertT": "演唱會門票", "home.svcConcertD": "港澳熱門演唱會，揀區揀飛一步到位。",
      "home.whyTitle": "點解揀 CHM Car",
      "home.why1T": "持牌跨境車隊", "home.why1D": "正規旅行社營運，司機持兩地牌照。",
      "home.why2T": "固定車資", "home.why2D": "落單即知總價，無跳錶、無隱藏附加費。",
      "home.why3T": "24小時客服", "home.why3D": "中／英／日／韓多語支援，全程跟進。",
      "home.why4T": "一站式行程", "home.why4D": "用車、住宿、娛樂，行程一次過安排妥當。",
      "home.regionsTitle": "服務地區",
      "home.popularRoutes": "熱門路線",

      "car.title": "點對點叫車", "car.sub": "選擇路線與車型，即時報價",
      "car.region": "服務區域", "car.regionCross": "跨境", "car.pickup": "上車地點", "car.dropoff": "落車地點",
      "car.pickupPh": "輸入或選擇上車點", "car.dropoffPh": "輸入或選擇落車點", "car.swap": "對調",
      "car.when": "用車時間", "car.now": "即時", "car.schedule": "預約", "car.pax": "乘客人數", "car.luggage": "行李件數",
      "car.vehicle": "選擇車型", "car.estimate": "車資估算", "car.estimateBtn": "估算車資 / 預訂",
      "car.crossBorderNote": "跨境路線含過關手續費及司機跨境附加費。",
      "car.seats": "座", "car.bags": "行李", "car.eta": "預計需時", "car.popularRoute": "熱門",
      "car.fareBreakdown": "車資明細", "car.baseFare": "基本車資", "car.crossFee": "跨境附加費", "car.bookThis": "預訂此程",
      "car.classEconomy": "經濟轎車", "car.classComfort": "舒適商務", "car.classBusiness": "豪華商務", "car.classVan": "7人商務車",
      "car.classEconomyD": "4座 · 2件行李", "car.classComfortD": "4座 · 3件行李", "car.classBusinessD": "4座 · 3件行李", "car.classVanD": "7座 · 5件行李",

      "hotel.title": "澳門酒店", "hotel.sub": "精選澳門酒店，即訂即確認",
      "hotel.checkin": "入住", "hotel.checkout": "退房", "hotel.guests": "住客/房間", "hotel.searchBtn": "搜尋房間",
      "hotel.from": "每晚", "hotel.rating": "評分", "hotel.amenities": "設施", "hotel.selectRoom": "選擇房型",
      "hotel.roomLeft": "僅餘 {n} 間", "hotel.breakfast": "含早餐", "hotel.freeCancel": "免費取消",
      "hotel.nights": "{n} 晚", "hotel.bookRoom": "預訂房型", "hotel.totalFor": "{n} 晚共",

      "concert.title": "演唱會門票", "concert.sub": "港澳熱門演出，即時揀區購票",
      "concert.venue": "場館", "concert.date": "日期", "concert.selectZone": "選擇票區", "concert.soldout": "售罄",
      "concert.zoneLeft": "餘 {n} 張", "concert.qty": "張數", "concert.buyTickets": "購買門票",
      "concert.from": "票價由", "concert.upcoming": "即將開售", "concert.onsale": "發售中",

      "checkout.title": "確認訂單", "checkout.summary": "訂單摘要", "checkout.contact": "聯絡資料",
      "checkout.name": "姓名", "checkout.namePh": "聯絡人姓名", "checkout.phone": "電話", "checkout.phonePh": "手提電話號碼",
      "checkout.email": "電郵", "checkout.emailPh": "your@email.com", "checkout.remarks": "備註", "checkout.remarksPh": "其他要求（選填）",
      "checkout.payment": "付款方式", "checkout.payNow": "確認並付款", "checkout.payNote": "示範版本：付款接口已預留，未連接真實收款。",
      "checkout.method.card": "信用卡", "checkout.method.alipay": "支付寶", "checkout.method.wechat": "微信支付",
      "checkout.method.applepay": "Apple Pay", "checkout.method.octopus": "八達通",
      "checkout.agree": "我已閱讀並同意服務條款及退改政策。",
      "checkout.processing": "處理中…", "checkout.fillRequired": "請填寫所有必填欄位",
      "checkout.mustAgree": "請先同意服務條款",

      "success.title": "預訂成功！", "success.sub": "確認詳情已透過電郵發送（示範）。", "success.orderNo": "訂單編號",
      "success.viewOrders": "查看我的訂單", "success.backHome": "返回首頁", "success.demoNote": "此為示範訂單，未產生實際收費。",

      "orders.title": "我的訂單", "orders.empty": "尚未有訂單", "orders.emptySub": "你的預訂會顯示喺呢度。",
      "orders.browse": "去逛逛", "orders.status.confirmed": "已確認", "orders.type.car": "叫車", "orders.type.hotel": "酒店", "orders.type.concert": "演唱會",
      "orders.clear": "清除全部紀錄",

      "demo.badge": "示範版", "lang.title": "語言"
    },

    "zh-Hans": {
      "brand.tagline": "港澳大陆・一站式旅游出行",
      "nav.home": "首页", "nav.car": "叫车", "nav.hotel": "酒店", "nav.concert": "演唱会", "nav.orders": "订单",

      "common.bookNow": "立即预订", "common.book": "预订", "common.search": "搜索", "common.from": "出发地",
      "common.to": "目的地", "common.date": "日期", "common.time": "时间", "common.passengers": "乘客",
      "common.total": "合计", "common.confirm": "确认", "common.cancel": "取消", "common.back": "返回",
      "common.close": "关闭", "common.next": "下一步", "common.select": "选择", "common.selected": "已选",
      "common.details": "详情", "common.from_price": "起", "common.perNight": "／晚", "common.night": "晚",
      "common.guests": "住客", "common.adult": "成人", "common.room": "房", "common.price": "价格",
      "common.continue": "继续", "common.viewAll": "查看全部", "common.popular": "热门", "common.required": "必填",
      "common.optional": "选填", "common.currency": "HK$", "common.estPrice": "预估价格", "common.included": "已含",
      "common.seeMore": "更多", "common.apply": "应用", "common.pax": "人", "common.day": "天",

      "home.heroTitle": "港・澳・大陆　点对点专车",
      "home.heroSub": "旅行社级可靠车队，跨境直达。酒店与演唱会门票，一个 App 全搞定。",
      "home.ctaCar": "立即叫车",
      "home.svcCarT": "点对点叫车", "home.svcCarD": "香港・澳门・大陆跨境专车，固定车费无隐藏收费。",
      "home.svcHotelT": "澳门酒店", "home.svcHotelD": "精选澳门酒店房间，即订即确认。",
      "home.svcConcertT": "演唱会门票", "home.svcConcertD": "港澳热门演唱会，选区选票一步到位。",
      "home.whyTitle": "为什么选 CHM Car",
      "home.why1T": "持牌跨境车队", "home.why1D": "正规旅行社运营，司机持两地牌照。",
      "home.why2T": "固定车费", "home.why2D": "下单即知总价，不跳表、无隐藏附加费。",
      "home.why3T": "24小时客服", "home.why3D": "中／英／日／韩多语支持，全程跟进。",
      "home.why4T": "一站式行程", "home.why4D": "用车、住宿、娱乐，行程一次安排妥当。",
      "home.regionsTitle": "服务地区",
      "home.popularRoutes": "热门路线",

      "car.title": "点对点叫车", "car.sub": "选择路线与车型，实时报价",
      "car.region": "服务区域", "car.regionCross": "跨境", "car.pickup": "上车地点", "car.dropoff": "下车地点",
      "car.pickupPh": "输入或选择上车点", "car.dropoffPh": "输入或选择下车点", "car.swap": "对调",
      "car.when": "用车时间", "car.now": "即时", "car.schedule": "预约", "car.pax": "乘客人数", "car.luggage": "行李件数",
      "car.vehicle": "选择车型", "car.estimate": "车费估算", "car.estimateBtn": "估算车费 / 预订",
      "car.crossBorderNote": "跨境路线含过关手续费及司机跨境附加费。",
      "car.seats": "座", "car.bags": "行李", "car.eta": "预计用时", "car.popularRoute": "热门",
      "car.fareBreakdown": "车费明细", "car.baseFare": "基本车费", "car.crossFee": "跨境附加费", "car.bookThis": "预订此程",
      "car.classEconomy": "经济轿车", "car.classComfort": "舒适商务", "car.classBusiness": "豪华商务", "car.classVan": "7人商务车",
      "car.classEconomyD": "4座 · 2件行李", "car.classComfortD": "4座 · 3件行李", "car.classBusinessD": "4座 · 3件行李", "car.classVanD": "7座 · 5件行李",

      "hotel.title": "澳门酒店", "hotel.sub": "精选澳门酒店，即订即确认",
      "hotel.checkin": "入住", "hotel.checkout": "退房", "hotel.guests": "住客/房间", "hotel.searchBtn": "搜索房间",
      "hotel.from": "每晚", "hotel.rating": "评分", "hotel.amenities": "设施", "hotel.selectRoom": "选择房型",
      "hotel.roomLeft": "仅剩 {n} 间", "hotel.breakfast": "含早餐", "hotel.freeCancel": "免费取消",
      "hotel.nights": "{n} 晚", "hotel.bookRoom": "预订房型", "hotel.totalFor": "{n} 晚共",

      "concert.title": "演唱会门票", "concert.sub": "港澳热门演出，实时选区购票",
      "concert.venue": "场馆", "concert.date": "日期", "concert.selectZone": "选择票区", "concert.soldout": "售罄",
      "concert.zoneLeft": "余 {n} 张", "concert.qty": "张数", "concert.buyTickets": "购买门票",
      "concert.from": "票价由", "concert.upcoming": "即将开售", "concert.onsale": "发售中",

      "checkout.title": "确认订单", "checkout.summary": "订单摘要", "checkout.contact": "联系资料",
      "checkout.name": "姓名", "checkout.namePh": "联系人姓名", "checkout.phone": "电话", "checkout.phonePh": "手机号码",
      "checkout.email": "邮箱", "checkout.emailPh": "your@email.com", "checkout.remarks": "备注", "checkout.remarksPh": "其他要求（选填）",
      "checkout.payment": "付款方式", "checkout.payNow": "确认并付款", "checkout.payNote": "演示版本：付款接口已预留，未连接真实收款。",
      "checkout.method.card": "信用卡", "checkout.method.alipay": "支付宝", "checkout.method.wechat": "微信支付",
      "checkout.method.applepay": "Apple Pay", "checkout.method.octopus": "八达通",
      "checkout.agree": "我已阅读并同意服务条款及退改政策。",
      "checkout.processing": "处理中…", "checkout.fillRequired": "请填写所有必填栏位",
      "checkout.mustAgree": "请先同意服务条款",

      "success.title": "预订成功！", "success.sub": "确认详情已通过邮箱发送（演示）。", "success.orderNo": "订单编号",
      "success.viewOrders": "查看我的订单", "success.backHome": "返回首页", "success.demoNote": "此为演示订单，未产生实际收费。",

      "orders.title": "我的订单", "orders.empty": "暂无订单", "orders.emptySub": "你的预订会显示在这里。",
      "orders.browse": "去逛逛", "orders.status.confirmed": "已确认", "orders.type.car": "叫车", "orders.type.hotel": "酒店", "orders.type.concert": "演唱会",
      "orders.clear": "清除全部记录",

      "demo.badge": "演示版", "lang.title": "语言"
    },

    "en": {
      "brand.tagline": "HK · Macau · Mainland — All-in-one travel",
      "nav.home": "Home", "nav.car": "Ride", "nav.hotel": "Hotels", "nav.concert": "Concerts", "nav.orders": "Orders",

      "common.bookNow": "Book now", "common.book": "Book", "common.search": "Search", "common.from": "From",
      "common.to": "To", "common.date": "Date", "common.time": "Time", "common.passengers": "Passengers",
      "common.total": "Total", "common.confirm": "Confirm", "common.cancel": "Cancel", "common.back": "Back",
      "common.close": "Close", "common.next": "Next", "common.select": "Select", "common.selected": "Selected",
      "common.details": "Details", "common.from_price": "from", "common.perNight": "/night", "common.night": "night",
      "common.guests": "Guests", "common.adult": "adult", "common.room": "room", "common.price": "Price",
      "common.continue": "Continue", "common.viewAll": "View all", "common.popular": "Popular", "common.required": "Required",
      "common.optional": "Optional", "common.currency": "HK$", "common.estPrice": "Estimated price", "common.included": "Included",
      "common.seeMore": "See more", "common.apply": "Apply", "common.pax": "pax", "common.day": "day",

      "home.heroTitle": "Point-to-point rides across HK, Macau & the Mainland",
      "home.heroSub": "Agency-grade fleet for cross-border trips. Plus Macau hotels and concert tickets — one app.",
      "home.ctaCar": "Book a ride",
      "home.svcCarT": "Point-to-point rides", "home.svcCarD": "Cross-border cars for HK, Macau & Mainland — flat fares, no hidden fees.",
      "home.svcHotelT": "Macau hotels", "home.svcHotelD": "Hand-picked Macau rooms with instant confirmation.",
      "home.svcConcertT": "Concert tickets", "home.svcConcertD": "Top HK & Macau shows — pick your zone in seconds.",
      "home.whyTitle": "Why CHM Car",
      "home.why1T": "Licensed cross-border fleet", "home.why1D": "Run by a registered agency; drivers hold dual-region permits.",
      "home.why2T": "Flat fares", "home.why2D": "See the total at booking — no meter, no surprise surcharges.",
      "home.why3T": "24h support", "home.why3D": "Multilingual support in EN / 中 / 日 / 한, end to end.",
      "home.why4T": "One trip, sorted", "home.why4D": "Rides, stays and entertainment — arranged in one place.",
      "home.regionsTitle": "Service areas",
      "home.popularRoutes": "Popular routes",

      "car.title": "Point-to-point ride", "car.sub": "Pick a route and class for an instant quote",
      "car.region": "Service area", "car.regionCross": "Cross-border", "car.pickup": "Pickup", "car.dropoff": "Drop-off",
      "car.pickupPh": "Enter or pick a pickup point", "car.dropoffPh": "Enter or pick a drop-off point", "car.swap": "Swap",
      "car.when": "When", "car.now": "Now", "car.schedule": "Schedule", "car.pax": "Passengers", "car.luggage": "Luggage",
      "car.vehicle": "Choose a vehicle", "car.estimate": "Fare estimate", "car.estimateBtn": "Estimate / Book",
      "car.crossBorderNote": "Cross-border routes include border clearance and a driver cross-border surcharge.",
      "car.seats": "seats", "car.bags": "bags", "car.eta": "Est. time", "car.popularRoute": "Popular",
      "car.fareBreakdown": "Fare breakdown", "car.baseFare": "Base fare", "car.crossFee": "Cross-border surcharge", "car.bookThis": "Book this ride",
      "car.classEconomy": "Economy Sedan", "car.classComfort": "Comfort", "car.classBusiness": "Business", "car.classVan": "Van (7-seat)",
      "car.classEconomyD": "4 seats · 2 bags", "car.classComfortD": "4 seats · 3 bags", "car.classBusinessD": "4 seats · 3 bags", "car.classVanD": "7 seats · 5 bags",

      "hotel.title": "Macau hotels", "hotel.sub": "Hand-picked stays, instantly confirmed",
      "hotel.checkin": "Check-in", "hotel.checkout": "Check-out", "hotel.guests": "Guests/Rooms", "hotel.searchBtn": "Search rooms",
      "hotel.from": "per night", "hotel.rating": "Rating", "hotel.amenities": "Amenities", "hotel.selectRoom": "Select room",
      "hotel.roomLeft": "Only {n} left", "hotel.breakfast": "Breakfast included", "hotel.freeCancel": "Free cancellation",
      "hotel.nights": "{n} nights", "hotel.bookRoom": "Book room", "hotel.totalFor": "Total for {n} nights",

      "concert.title": "Concert tickets", "concert.sub": "Top HK & Macau shows, pick your zone live",
      "concert.venue": "Venue", "concert.date": "Date", "concert.selectZone": "Select a zone", "concert.soldout": "Sold out",
      "concert.zoneLeft": "{n} left", "concert.qty": "Quantity", "concert.buyTickets": "Buy tickets",
      "concert.from": "Tickets from", "concert.upcoming": "Coming soon", "concert.onsale": "On sale",

      "checkout.title": "Confirm order", "checkout.summary": "Order summary", "checkout.contact": "Contact details",
      "checkout.name": "Name", "checkout.namePh": "Contact name", "checkout.phone": "Phone", "checkout.phonePh": "Mobile number",
      "checkout.email": "Email", "checkout.emailPh": "your@email.com", "checkout.remarks": "Remarks", "checkout.remarksPh": "Other requests (optional)",
      "checkout.payment": "Payment method", "checkout.payNow": "Confirm & pay", "checkout.payNote": "Demo build: payment interface is reserved but not connected to a live gateway.",
      "checkout.method.card": "Credit card", "checkout.method.alipay": "Alipay", "checkout.method.wechat": "WeChat Pay",
      "checkout.method.applepay": "Apple Pay", "checkout.method.octopus": "Octopus",
      "checkout.agree": "I have read and agree to the terms and the refund/change policy.",
      "checkout.processing": "Processing…", "checkout.fillRequired": "Please fill in all required fields",
      "checkout.mustAgree": "Please agree to the terms first",

      "success.title": "Booking confirmed!", "success.sub": "Confirmation details sent by email (demo).", "success.orderNo": "Order no.",
      "success.viewOrders": "View my orders", "success.backHome": "Back to home", "success.demoNote": "This is a demo order; no real charge was made.",

      "orders.title": "My orders", "orders.empty": "No orders yet", "orders.emptySub": "Your bookings will appear here.",
      "orders.browse": "Start browsing", "orders.status.confirmed": "Confirmed", "orders.type.car": "Ride", "orders.type.hotel": "Hotel", "orders.type.concert": "Concert",
      "orders.clear": "Clear all records",

      "demo.badge": "DEMO", "lang.title": "Language"
    },

    "ja": {
      "brand.tagline": "香港・マカオ・本土　旅の総合プラットフォーム",
      "nav.home": "ホーム", "nav.car": "配車", "nav.hotel": "ホテル", "nav.concert": "コンサート", "nav.orders": "注文",

      "common.bookNow": "今すぐ予約", "common.book": "予約", "common.search": "検索", "common.from": "出発地",
      "common.to": "目的地", "common.date": "日付", "common.time": "時間", "common.passengers": "乗客",
      "common.total": "合計", "common.confirm": "確認", "common.cancel": "キャンセル", "common.back": "戻る",
      "common.close": "閉じる", "common.next": "次へ", "common.select": "選択", "common.selected": "選択済み",
      "common.details": "詳細", "common.from_price": "〜", "common.perNight": "／泊", "common.night": "泊",
      "common.guests": "宿泊者", "common.adult": "大人", "common.room": "室", "common.price": "料金",
      "common.continue": "続ける", "common.viewAll": "すべて表示", "common.popular": "人気", "common.required": "必須",
      "common.optional": "任意", "common.currency": "HK$", "common.estPrice": "概算料金", "common.included": "込み",
      "common.seeMore": "もっと見る", "common.apply": "適用", "common.pax": "名", "common.day": "日",

      "home.heroTitle": "香港・マカオ・本土をつなぐ　ポイント間専用車",
      "home.heroSub": "旅行社品質の越境フリート。ホテルとコンサートチケットも、ひとつのアプリで。",
      "home.ctaCar": "配車を予約",
      "home.svcCarT": "ポイント間配車", "home.svcCarD": "香港・マカオ・本土の越境専用車。定額・追加料金なし。",
      "home.svcHotelT": "マカオのホテル", "home.svcHotelD": "厳選したマカオの客室を即時確定で。",
      "home.svcConcertT": "コンサートチケット", "home.svcConcertD": "香港・マカオの人気公演。エリア選択も数秒で。",
      "home.whyTitle": "CHM Car が選ばれる理由",
      "home.why1T": "認可された越境フリート", "home.why1D": "正規旅行社が運営。ドライバーは両地域の免許を保有。",
      "home.why2T": "定額料金", "home.why2D": "予約時に総額が確定。メーターも追加料金もなし。",
      "home.why3T": "24時間サポート", "home.why3D": "日／英／中／韓の多言語で最後までサポート。",
      "home.why4T": "旅程をまとめて", "home.why4D": "移動・宿泊・エンタメを一括で手配。",
      "home.regionsTitle": "対応エリア",
      "home.popularRoutes": "人気ルート",

      "car.title": "ポイント間配車", "car.sub": "ルートと車種を選んで即見積もり",
      "car.region": "対応エリア", "car.regionCross": "越境", "car.pickup": "乗車地", "car.dropoff": "降車地",
      "car.pickupPh": "乗車地を入力または選択", "car.dropoffPh": "降車地を入力または選択", "car.swap": "入替",
      "car.when": "利用時間", "car.now": "今すぐ", "car.schedule": "予約", "car.pax": "乗客数", "car.luggage": "荷物数",
      "car.vehicle": "車種を選択", "car.estimate": "料金見積もり", "car.estimateBtn": "見積もり / 予約",
      "car.crossBorderNote": "越境ルートは通関手数料とドライバー越境追加料金を含みます。",
      "car.seats": "席", "car.bags": "荷物", "car.eta": "所要時間", "car.popularRoute": "人気",
      "car.fareBreakdown": "料金内訳", "car.baseFare": "基本料金", "car.crossFee": "越境追加料金", "car.bookThis": "この便を予約",
      "car.classEconomy": "エコノミー", "car.classComfort": "コンフォート", "car.classBusiness": "ビジネス", "car.classVan": "バン（7人）",
      "car.classEconomyD": "4席 · 荷物2", "car.classComfortD": "4席 · 荷物3", "car.classBusinessD": "4席 · 荷物3", "car.classVanD": "7席 · 荷物5",

      "hotel.title": "マカオのホテル", "hotel.sub": "厳選の宿を即時確定で",
      "hotel.checkin": "チェックイン", "hotel.checkout": "チェックアウト", "hotel.guests": "宿泊者/室", "hotel.searchBtn": "客室を検索",
      "hotel.from": "1泊あたり", "hotel.rating": "評価", "hotel.amenities": "設備", "hotel.selectRoom": "客室を選択",
      "hotel.roomLeft": "残り {n} 室", "hotel.breakfast": "朝食付き", "hotel.freeCancel": "無料キャンセル",
      "hotel.nights": "{n} 泊", "hotel.bookRoom": "客室を予約", "hotel.totalFor": "{n} 泊の合計",

      "concert.title": "コンサートチケット", "concert.sub": "香港・マカオの人気公演をその場でエリア選択",
      "concert.venue": "会場", "concert.date": "日付", "concert.selectZone": "エリアを選択", "concert.soldout": "完売",
      "concert.zoneLeft": "残り {n} 枚", "concert.qty": "枚数", "concert.buyTickets": "チケット購入",
      "concert.from": "料金", "concert.upcoming": "販売予定", "concert.onsale": "販売中",

      "checkout.title": "注文確認", "checkout.summary": "注文内容", "checkout.contact": "連絡先",
      "checkout.name": "氏名", "checkout.namePh": "ご連絡先氏名", "checkout.phone": "電話", "checkout.phonePh": "携帯電話番号",
      "checkout.email": "メール", "checkout.emailPh": "your@email.com", "checkout.remarks": "備考", "checkout.remarksPh": "その他のご要望（任意）",
      "checkout.payment": "お支払い方法", "checkout.payNow": "確認して支払う", "checkout.payNote": "デモ版：決済インターフェースは用意済みですが、実際の決済には接続していません。",
      "checkout.method.card": "クレジットカード", "checkout.method.alipay": "Alipay", "checkout.method.wechat": "WeChat Pay",
      "checkout.method.applepay": "Apple Pay", "checkout.method.octopus": "Octopus",
      "checkout.agree": "利用規約および返金・変更規定に同意します。",
      "checkout.processing": "処理中…", "checkout.fillRequired": "必須項目をすべて入力してください",
      "checkout.mustAgree": "先に利用規約へ同意してください",

      "success.title": "予約完了！", "success.sub": "確認内容をメールで送信しました（デモ）。", "success.orderNo": "注文番号",
      "success.viewOrders": "注文を見る", "success.backHome": "ホームへ", "success.demoNote": "これはデモ注文です。実際の請求は発生していません。",

      "orders.title": "注文履歴", "orders.empty": "注文はまだありません", "orders.emptySub": "ご予約はここに表示されます。",
      "orders.browse": "見てみる", "orders.status.confirmed": "確定", "orders.type.car": "配車", "orders.type.hotel": "ホテル", "orders.type.concert": "コンサート",
      "orders.clear": "履歴をすべて削除",

      "demo.badge": "デモ", "lang.title": "言語"
    },

    "ko": {
      "brand.tagline": "홍콩・마카오・본토　올인원 여행 플랫폼",
      "nav.home": "홈", "nav.car": "차량호출", "nav.hotel": "호텔", "nav.concert": "콘서트", "nav.orders": "주문",

      "common.bookNow": "지금 예약", "common.book": "예약", "common.search": "검색", "common.from": "출발지",
      "common.to": "목적지", "common.date": "날짜", "common.time": "시간", "common.passengers": "승객",
      "common.total": "합계", "common.confirm": "확인", "common.cancel": "취소", "common.back": "뒤로",
      "common.close": "닫기", "common.next": "다음", "common.select": "선택", "common.selected": "선택됨",
      "common.details": "상세", "common.from_price": "부터", "common.perNight": "／박", "common.night": "박",
      "common.guests": "투숙객", "common.adult": "성인", "common.room": "객실", "common.price": "가격",
      "common.continue": "계속", "common.viewAll": "전체 보기", "common.popular": "인기", "common.required": "필수",
      "common.optional": "선택", "common.currency": "HK$", "common.estPrice": "예상 요금", "common.included": "포함",
      "common.seeMore": "더 보기", "common.apply": "적용", "common.pax": "명", "common.day": "일",

      "home.heroTitle": "홍콩・마카오・본토를 잇는　지점 간 전용 차량",
      "home.heroSub": "여행사급 국경 간 차량. 마카오 호텔과 콘서트 티켓까지 앱 하나로.",
      "home.ctaCar": "차량 예약",
      "home.svcCarT": "지점 간 차량호출", "home.svcCarD": "홍콩・마카오・본토 국경 간 차량. 정액 요금, 숨은 비용 없음.",
      "home.svcHotelT": "마카오 호텔", "home.svcHotelD": "엄선한 마카오 객실을 즉시 확정.",
      "home.svcConcertT": "콘서트 티켓", "home.svcConcertD": "홍콩・마카오 인기 공연. 구역 선택도 몇 초면 끝.",
      "home.whyTitle": "CHM Car를 선택하는 이유",
      "home.why1T": "허가받은 국경 간 차량", "home.why1D": "정식 여행사가 운영하며 기사는 양 지역 면허 보유.",
      "home.why2T": "정액 요금", "home.why2D": "예약 시 총액 확정. 미터기도 추가 요금도 없음.",
      "home.why3T": "24시간 지원", "home.why3D": "한／영／중／일 다국어로 끝까지 지원.",
      "home.why4T": "여정을 한 번에", "home.why4D": "이동・숙박・엔터테인먼트를 한곳에서 정리.",
      "home.regionsTitle": "서비스 지역",
      "home.popularRoutes": "인기 노선",

      "car.title": "지점 간 차량호출", "car.sub": "노선과 차종을 선택하면 즉시 견적",
      "car.region": "서비스 지역", "car.regionCross": "국경 간", "car.pickup": "탑승지", "car.dropoff": "하차지",
      "car.pickupPh": "탑승지를 입력 또는 선택", "car.dropoffPh": "하차지를 입력 또는 선택", "car.swap": "교환",
      "car.when": "이용 시간", "car.now": "지금", "car.schedule": "예약", "car.pax": "승객 수", "car.luggage": "수하물 수",
      "car.vehicle": "차종 선택", "car.estimate": "요금 견적", "car.estimateBtn": "견적 / 예약",
      "car.crossBorderNote": "국경 간 노선은 통관 수수료와 기사 국경 간 추가 요금을 포함합니다.",
      "car.seats": "석", "car.bags": "수하물", "car.eta": "예상 소요", "car.popularRoute": "인기",
      "car.fareBreakdown": "요금 내역", "car.baseFare": "기본 요금", "car.crossFee": "국경 간 추가 요금", "car.bookThis": "이 차편 예약",
      "car.classEconomy": "이코노미", "car.classComfort": "컴포트", "car.classBusiness": "비즈니스", "car.classVan": "밴(7인승)",
      "car.classEconomyD": "4석 · 수하물 2", "car.classComfortD": "4석 · 수하물 3", "car.classBusinessD": "4석 · 수하물 3", "car.classVanD": "7석 · 수하물 5",

      "hotel.title": "마카오 호텔", "hotel.sub": "엄선한 숙소를 즉시 확정",
      "hotel.checkin": "체크인", "hotel.checkout": "체크아웃", "hotel.guests": "투숙객/객실", "hotel.searchBtn": "객실 검색",
      "hotel.from": "1박당", "hotel.rating": "평점", "hotel.amenities": "편의시설", "hotel.selectRoom": "객실 선택",
      "hotel.roomLeft": "{n}실 남음", "hotel.breakfast": "조식 포함", "hotel.freeCancel": "무료 취소",
      "hotel.nights": "{n}박", "hotel.bookRoom": "객실 예약", "hotel.totalFor": "{n}박 합계",

      "concert.title": "콘서트 티켓", "concert.sub": "홍콩・마카오 인기 공연을 실시간 구역 선택",
      "concert.venue": "공연장", "concert.date": "날짜", "concert.selectZone": "구역 선택", "concert.soldout": "매진",
      "concert.zoneLeft": "{n}석 남음", "concert.qty": "매수", "concert.buyTickets": "티켓 구매",
      "concert.from": "티켓 가격", "concert.upcoming": "오픈 예정", "concert.onsale": "판매 중",

      "checkout.title": "주문 확인", "checkout.summary": "주문 요약", "checkout.contact": "연락처",
      "checkout.name": "이름", "checkout.namePh": "예약자 이름", "checkout.phone": "전화", "checkout.phonePh": "휴대폰 번호",
      "checkout.email": "이메일", "checkout.emailPh": "your@email.com", "checkout.remarks": "비고", "checkout.remarksPh": "기타 요청 (선택)",
      "checkout.payment": "결제 수단", "checkout.payNow": "확인 및 결제", "checkout.payNote": "데모 버전: 결제 인터페이스는 준비되어 있으나 실제 결제에 연결되어 있지 않습니다.",
      "checkout.method.card": "신용카드", "checkout.method.alipay": "Alipay", "checkout.method.wechat": "WeChat Pay",
      "checkout.method.applepay": "Apple Pay", "checkout.method.octopus": "옥토퍼스",
      "checkout.agree": "이용약관 및 환불／변경 정책에 동의합니다.",
      "checkout.processing": "처리 중…", "checkout.fillRequired": "필수 항목을 모두 입력해 주세요",
      "checkout.mustAgree": "먼저 이용약관에 동의해 주세요",

      "success.title": "예약 완료!", "success.sub": "확인 내역을 이메일로 보냈습니다 (데모).", "success.orderNo": "주문 번호",
      "success.viewOrders": "내 주문 보기", "success.backHome": "홈으로", "success.demoNote": "데모 주문이며 실제 청구는 발생하지 않았습니다.",

      "orders.title": "내 주문", "orders.empty": "주문이 없습니다", "orders.emptySub": "예약 내역이 여기에 표시됩니다.",
      "orders.browse": "둘러보기", "orders.status.confirmed": "확정", "orders.type.car": "차량", "orders.type.hotel": "호텔", "orders.type.concert": "콘서트",
      "orders.clear": "전체 기록 삭제",

      "demo.badge": "DEMO", "lang.title": "언어"
    }
  };

  const STORE_KEY = "chmcar.lang";
  let current = "zh-Hant";

  function detect() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved && DICT[saved]) return saved;
    } catch (e) {}
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("zh")) return /(hk|tw|hant|mo)/.test(nav) ? "zh-Hant" : "zh-Hans";
    if (nav.startsWith("ja")) return "ja";
    if (nav.startsWith("ko")) return "ko";
    if (nav.startsWith("en")) return "en";
    return "zh-Hant";
  }

  function t(key, vars) {
    const table = DICT[current] || DICT["zh-Hant"];
    let s = (key in table) ? table[key] : (DICT["en"][key] != null ? DICT["en"][key] : key);
    if (vars) for (const k in vars) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    return s;
  }

  function setLang(code) {
    if (!DICT[code]) return;
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) {}
    const meta = LANGS.find((l) => l.code === code);
    document.documentElement.lang = meta ? meta.htmlLang : code;
    applyStatic();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { code } }));
  }

  // translate any element with data-i18n / data-i18n-ph attributes
  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    (root || document).querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    (root || document).querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
  }

  function extend(code, obj) { if (!DICT[code]) DICT[code] = {}; Object.assign(DICT[code], obj); }

  global.I18N = {
    LANGS,
    t,
    setLang,
    applyStatic,
    extend,
    get lang() { return current; },
    init() { current = detect(); const m = LANGS.find((l) => l.code === current); document.documentElement.lang = m ? m.htmlLang : current; }
  };
})(window);
