"use strict";
/* Seed catalog. Multilingual fields are objects keyed by lang code. */
const ml = (hant, hans, en, ja, ko) => ({ "zh-Hant": hant, "zh-Hans": hans, en, ja, ko });

const REGIONS = [
  { id: "hk", flag: "🇭🇰", name: ml("香港", "香港", "Hong Kong", "香港", "홍콩") },
  { id: "mo", flag: "🇲🇴", name: ml("澳門", "澳门", "Macau", "マカオ", "마카오") },
  { id: "cn", flag: "🇨🇳", name: ml("大陸", "大陆", "Mainland", "本土", "본토") }
];

const LOCATIONS = [
  { id: "hk-hkia", region: "hk", name: ml("香港國際機場", "香港国际机场", "Hong Kong Intl Airport", "香港国際空港", "홍콩 국제공항") },
  { id: "hk-central", region: "hk", name: ml("中環", "中环", "Central", "セントラル", "센트럴") },
  { id: "hk-tst", region: "hk", name: ml("尖沙咀", "尖沙咀", "Tsim Sha Tsui", "チムサーチョイ", "침사추이") },
  { id: "hk-disney", region: "hk", name: ml("香港迪士尼", "香港迪士尼", "Hong Kong Disneyland", "香港ディズニー", "홍콩 디즈니랜드") },
  { id: "hk-hzmb", region: "hk", name: ml("港珠澳大橋香港口岸", "港珠澳大桥香港口岸", "HZMB Hong Kong Port", "港珠澳大橋 香港口岸", "강주아오 대교 홍콩 항구") },
  { id: "hk-szbay", region: "hk", name: ml("深圳灣口岸（香港側）", "深圳湾口岸（香港侧）", "Shenzhen Bay Port (HK)", "深圳湾口岸（香港側）", "선전만 항구 (홍콩)") },
  { id: "mo-airport", region: "mo", name: ml("澳門國際機場", "澳门国际机场", "Macau Intl Airport", "マカオ国際空港", "마카오 국제공항") },
  { id: "mo-ferry", region: "mo", name: ml("外港客運碼頭", "外港客运码头", "Outer Harbour Ferry Terminal", "外港フェリーターミナル", "외항 페리 터미널") },
  { id: "mo-cotai", region: "mo", name: ml("路氹金光大道", "路氹金光大道", "Cotai Strip", "コタイ・ストリップ", "코타이 스트립") },
  { id: "mo-border", region: "mo", name: ml("關閘口岸", "关闸口岸", "Border Gate (Portas do Cerco)", "国境ゲート", "국경 게이트") },
  { id: "mo-hzmb", region: "mo", name: ml("港珠澳大橋澳門口岸", "港珠澳大桥澳门口岸", "HZMB Macau Port", "港珠澳大橋 マカオ口岸", "강주아오 대교 마카오 항구") },
  { id: "cn-sz", region: "cn", name: ml("深圳市區", "深圳市区", "Shenzhen City", "深圳市内", "선전 시내") },
  { id: "cn-gongbei", region: "cn", name: ml("珠海拱北口岸", "珠海拱北口岸", "Zhuhai Gongbei Port", "珠海・拱北口岸", "주하이 궁베이 항구") },
  { id: "cn-gz", region: "cn", name: ml("廣州市區", "广州市区", "Guangzhou City", "広州市内", "광저우 시내") },
  { id: "cn-dg", region: "cn", name: ml("東莞", "东莞", "Dongguan", "東莞", "둥관") },
  { id: "cn-zs", region: "cn", name: ml("中山", "中山", "Zhongshan", "中山", "중산") }
];

// region-pair base fares (economy, HK$) + ETA minutes
const PAIR = {
  "hk|hk": { fare: 300, eta: 35 }, "mo|mo": { fare: 200, eta: 25 }, "cn|cn": { fare: 260, eta: 40 },
  "hk|mo": { fare: 1180, eta: 75 }, "hk|cn": { fare: 880, eta: 70 }, "mo|cn": { fare: 520, eta: 55 }
};
const CROSS_FEE = 380;

const VEHICLE_CLASSES = [
  { id: "economy", mult: 1.0, seats: 4, bags: 2, icon: "🚗", name: ml("經濟轎車", "经济轿车", "Economy Sedan", "エコノミー", "이코노미") },
  { id: "comfort", mult: 1.35, seats: 4, bags: 3, icon: "🚙", name: ml("舒適商務", "舒适商务", "Comfort", "コンフォート", "컴포트") },
  { id: "business", mult: 1.9, seats: 4, bags: 3, icon: "🚘", name: ml("豪華商務", "豪华商务", "Business", "ビジネス", "비즈니스") },
  { id: "van", mult: 2.2, seats: 7, bags: 5, icon: "🚐", name: ml("7人商務車", "7人商务车", "Van (7-seat)", "バン（7人）", "밴(7인승)") }
];

const POPULAR_ROUTES = [
  { from: "hk-hkia", to: "mo-cotai", badge: 1 },
  { from: "hk-central", to: "cn-sz", badge: 1 },
  { from: "mo-cotai", to: "cn-gongbei", badge: 0 },
  { from: "hk-hzmb", to: "mo-hzmb", badge: 0 },
  { from: "hk-hkia", to: "hk-tst", badge: 0 },
  { from: "mo-airport", to: "mo-cotai", badge: 0 }
];

const HOTELS = [
  { id: "h-lumina", g: ["#10243f", "#1E6F8E"], rating: 4.8, reviews: 2143,
    name: ml("路氹 Lumina 渡假酒店", "路氹 Lumina 度假酒店", "Lumina Cotai Resort", "ルミナ・コタイ・リゾート", "루미나 코타이 리조트"),
    area: ml("路氹城", "路氹城", "Cotai", "コタイ", "코타이"), tags: ["pool", "casino", "spa"],
    rooms: [
      { id: "r1", price: 1380, cap: 2, breakfast: 1, freeCancel: 1, qty: 4, name: ml("豪華大床房", "豪华大床房", "Deluxe King", "デラックスキング", "디럭스 킹") },
      { id: "r2", price: 1680, cap: 3, breakfast: 1, freeCancel: 1, qty: 2, name: ml("行政雙床房", "行政双床房", "Executive Twin", "エグゼクティブツイン", "이그제큐티브 트윈") },
      { id: "r3", price: 2880, cap: 4, breakfast: 1, freeCancel: 0, qty: 1, name: ml("家庭套房", "家庭套房", "Family Suite", "ファミリースイート", "패밀리 스위트") }
    ] },
  { id: "h-pearl", g: ["#3a1f4f", "#7a3f8e"], rating: 4.6, reviews: 1576,
    name: ml("南灣明珠酒店", "南湾明珠酒店", "Praia Grande Pearl Hotel", "プライア・グランデ・パール", "프라이아 그란데 펄 호텔"),
    area: ml("澳門半島", "澳门半岛", "Macau Peninsula", "マカオ半島", "마카오 반도"), tags: ["seaview", "breakfast"],
    rooms: [
      { id: "r1", price: 880, cap: 2, breakfast: 1, freeCancel: 1, qty: 6, name: ml("海景雙人房", "海景双人房", "Sea-view Double", "海景ダブル", "오션뷰 더블") },
      { id: "r2", price: 1180, cap: 2, breakfast: 1, freeCancel: 1, qty: 3, name: ml("豪華海景房", "豪华海景房", "Deluxe Sea View", "デラックス海景", "디럭스 오션뷰") }
    ] },
  { id: "h-grandlisb", g: ["#4a2e0f", "#D6A854"], rating: 4.7, reviews: 3890,
    name: ml("金都會大酒店", "金都会大酒店", "Golden Metropolis Hotel", "ゴールデン・メトロポリス", "골든 메트로폴리스 호텔"),
    area: ml("澳門市中心", "澳门市中心", "Macau Downtown", "マカオ中心部", "마카오 중심가"), tags: ["casino", "central"],
    rooms: [
      { id: "r1", price: 1080, cap: 2, breakfast: 0, freeCancel: 1, qty: 8, name: ml("精緻客房", "精致客房", "Premier Room", "プレミアルーム", "프리미어 룸") },
      { id: "r2", price: 1980, cap: 2, breakfast: 1, freeCancel: 0, qty: 2, name: ml("貴賓套房", "贵宾套房", "VIP Suite", "VIPスイート", "VIP 스위트") }
    ] },
  { id: "h-venezia", g: ["#0f3a2e", "#1e8e6f"], rating: 4.9, reviews: 5021,
    name: ml("威尼斯水都酒店", "威尼斯水都酒店", "Aqua Venezia Hotel", "アクア・ヴェネツィア", "아쿠아 베네치아 호텔"),
    area: ml("路氹城", "路氹城", "Cotai", "コタイ", "코타이"), tags: ["pool", "shopping", "family"],
    rooms: [
      { id: "r1", price: 1580, cap: 3, breakfast: 1, freeCancel: 1, qty: 5, name: ml("運河景套房", "运河景套房", "Canal-view Suite", "運河ビュースイート", "운하뷰 스위트") },
      { id: "r2", price: 2280, cap: 4, breakfast: 1, freeCancel: 1, qty: 3, name: ml("貢多拉家庭套房", "贡多拉家庭套房", "Gondola Family Suite", "ゴンドラ・ファミリー", "곤돌라 패밀리 스위트") }
    ] },
  { id: "h-skyline", g: ["#1a1a2e", "#3f5f9e"], rating: 4.5, reviews: 982,
    name: ml("天際商務酒店", "天际商务酒店", "Skyline Business Hotel", "スカイライン・ビジネス", "스카이라인 비즈니스 호텔"),
    area: ml("澳門外港", "澳门外港", "Outer Harbour", "外港エリア", "외항"), tags: ["business", "ferry"],
    rooms: [
      { id: "r1", price: 720, cap: 2, breakfast: 0, freeCancel: 1, qty: 10, name: ml("標準商務房", "标准商务房", "Standard Business", "スタンダードビジネス", "스탠다드 비즈니스") },
      { id: "r2", price: 980, cap: 2, breakfast: 1, freeCancel: 1, qty: 4, name: ml("行政客房", "行政客房", "Executive Room", "エグゼクティブ", "이그제큐티브 룸") }
    ] },
  { id: "h-lotus", g: ["#4a0f2e", "#c8407a"], rating: 4.4, reviews: 1245,
    name: ml("蓮花精品酒店", "莲花精品酒店", "Lotus Boutique Hotel", "ロータス・ブティック", "로터스 부티크 호텔"),
    area: ml("氹仔舊城區", "氹仔旧城区", "Taipa Village", "タイパ旧市街", "타이파 빌리지"), tags: ["boutique", "foodie"],
    rooms: [
      { id: "r1", price: 660, cap: 2, breakfast: 1, freeCancel: 1, qty: 7, name: ml("精品雙人房", "精品双人房", "Boutique Double", "ブティックダブル", "부티크 더블") },
      { id: "r2", price: 940, cap: 3, breakfast: 1, freeCancel: 0, qty: 2, name: ml("閣樓三人房", "阁楼三人房", "Loft Triple", "ロフトトリプル", "로프트 트리플") }
    ] }
];

const CONCERTS = [
  { id: "c-aurora", g: ["#10243f", "#1E6F8E"], status: "onsale", date: "2026-07-18", city: "hk",
    title: ml("AURORA《極光》世界巡演 香港站", "AURORA《极光》世界巡演 香港站", "AURORA 'Polaris' World Tour — Hong Kong", "AURORA『極光』ワールドツアー 香港", "AURORA '오로라' 월드투어 — 홍콩"),
    artist: ml("AURORA", "AURORA", "AURORA", "AURORA", "AURORA"),
    venue: ml("香港體育館（紅館）", "香港体育馆（红馆）", "Hong Kong Coliseum", "香港コロシアム", "홍콩 콜로세움"),
    zones: [
      { name: ml("搖滾區 A", "摇滚区 A", "GA Pit A", "アリーナA", "스탠딩 A"), price: 1280, qty: 12 },
      { name: ml("看台 1 區", "看台 1 区", "Stand Sec 1", "スタンド1", "스탠드 1구역"), price: 880, qty: 40 },
      { name: ml("看台 3 區", "看台 3 区", "Stand Sec 3", "スタンド3", "스탠드 3구역"), price: 580, qty: 0 }
    ] },
  { id: "c-nova", g: ["#3a1f4f", "#9a3fbe"], status: "onsale", date: "2026-08-02", city: "mo",
    title: ml("NOVA 銀河演唱會 澳門", "NOVA 银河演唱会 澳门", "NOVA Galaxy Live — Macau", "NOVA ギャラクシー・ライブ マカオ", "NOVA 갤럭시 라이브 — 마카오"),
    artist: ml("NOVA", "NOVA", "NOVA", "NOVA", "NOVA"),
    venue: ml("澳門綜藝館", "澳门综艺馆", "Macau Forum", "マカオ・フォーラム", "마카오 포럼"),
    zones: [
      { name: ml("VIP 搖滾", "VIP 摇滚", "VIP Pit", "VIPアリーナ", "VIP 스탠딩"), price: 1880, qty: 6 },
      { name: ml("A 區座位", "A 区座位", "Seating A", "座席A", "좌석 A"), price: 1080, qty: 25 },
      { name: ml("B 區座位", "B 区座位", "Seating B", "座席B", "좌석 B"), price: 680, qty: 33 }
    ] },
  { id: "c-ember", g: ["#4a2e0f", "#D6A854"], status: "onsale", date: "2026-09-12", city: "hk",
    title: ml("Ember 不眠之夜 演唱會", "Ember 不眠之夜 演唱会", "Ember: Sleepless Night Live", "Ember 眠れない夜 ライブ", "Ember 잠 못 드는 밤 라이브"),
    artist: ml("Ember", "Ember", "Ember", "Ember", "Ember"),
    venue: ml("亞洲國際博覽館 Arena", "亚洲国际博览馆 Arena", "AsiaWorld-Expo Arena", "アジアワールド・エキスポ", "아시아월드 엑스포 아레나"),
    zones: [
      { name: ml("前排站區", "前排站区", "Front GA", "前方スタンディング", "앞열 스탠딩"), price: 1480, qty: 9 },
      { name: ml("樓上看台", "楼上看台", "Upper Stand", "上層スタンド", "상층 스탠드"), price: 720, qty: 50 }
    ] },
  { id: "c-lumi", g: ["#0f3a2e", "#1e8e6f"], status: "upcoming", date: "2026-10-04", city: "mo",
    title: ml("LUMI 星海之約 澳門站", "LUMI 星海之约 澳门站", "LUMI 'Sea of Stars' — Macau", "LUMI『星の海』マカオ", "LUMI '별의 바다' — 마카오"),
    artist: ml("LUMI", "LUMI", "LUMI", "LUMI", "LUMI"),
    venue: ml("澳門銀河綜合體育館", "澳门银河综合体育馆", "Galaxy Arena Macau", "ギャラクシー・アリーナ", "갤럭시 아레나 마카오"),
    zones: [
      { name: ml("全場 A", "全场 A", "Zone A", "ゾーンA", "A구역"), price: 1280, qty: 0 },
      { name: ml("全場 B", "全场 B", "Zone B", "ゾーンB", "B구역"), price: 880, qty: 0 }
    ] },
  { id: "c-pulse", g: ["#1a1a2e", "#4f5fae"], status: "onsale", date: "2026-08-23", city: "hk",
    title: ml("PULSE 電音嘉年華", "PULSE 电音嘉年华", "PULSE Electronic Carnival", "PULSE エレクトロ・カーニバル", "PULSE 일렉트로닉 카니발"),
    artist: ml("PULSE Collective", "PULSE Collective", "PULSE Collective", "PULSE Collective", "PULSE Collective"),
    venue: ml("中環海濱活動空間", "中环海滨活动空间", "Central Harbourfront", "セントラル・ハーバーフロント", "센트럴 하버프런트"),
    zones: [
      { name: ml("VIP 通行證", "VIP 通行证", "VIP Pass", "VIPパス", "VIP 패스"), price: 1680, qty: 18 },
      { name: ml("一日通", "一日通", "Day Pass", "1日券", "1일권"), price: 780, qty: 120 }
    ] },
  { id: "c-serene", g: ["#4a0f2e", "#c8407a"], status: "upcoming", date: "2026-11-15", city: "mo",
    title: ml("Serene 弦樂之夜", "Serene 弦乐之夜", "Serene: A Night of Strings", "Serene 弦楽の夜", "Serene 현악의 밤"),
    artist: ml("Serene Orchestra", "Serene Orchestra", "Serene Orchestra", "Serene Orchestra", "Serene Orchestra"),
    venue: ml("澳門文化中心綜合劇院", "澳门文化中心综合剧院", "Macau Cultural Centre", "マカオ文化センター", "마카오 문화센터"),
    zones: [
      { name: ml("堂座", "堂座", "Stalls", "1階席", "1층석"), price: 980, qty: 0 },
      { name: ml("樓座", "楼座", "Circle", "2階席", "2층석"), price: 580, qty: 0 }
    ] }
];

const DRIVERS = [
  { name: "陳師傅 Chan", phone: "+85290000001", regions: ["hk", "mo"], cross_border: 1, vehicle_class: "business" },
  { name: "李師傅 Lee", phone: "+85290000002", regions: ["hk"], cross_border: 0, vehicle_class: "comfort" },
  { name: "黃師傅 Wong", phone: "+85390000003", regions: ["mo", "cn"], cross_border: 1, vehicle_class: "van" },
  { name: "張師傅 Cheung", phone: "+8613900000004", regions: ["cn", "mo"], cross_border: 1, vehicle_class: "economy" }
];

module.exports = { ml, REGIONS, LOCATIONS, PAIR, CROSS_FEE, VEHICLE_CLASSES, POPULAR_ROUTES, HOTELS, CONCERTS, DRIVERS };
