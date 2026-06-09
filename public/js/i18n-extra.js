/* CHM Car — extra i18n strings for member accounts, errors, and live-payment notes (5 languages). */
(function () {
  "use strict";
  if (!window.I18N || !window.I18N.extend) return;
  const E = window.I18N.extend;

  E("zh-Hant", {
    "account.login": "登入", "account.register": "註冊", "account.logout": "登出", "account.guest": "訪客",
    "account.loginTitle": "會員登入", "account.registerTitle": "建立帳戶", "account.email": "電郵", "account.password": "密碼",
    "account.name": "姓名", "account.phone": "電話", "account.toRegister": "未有帳戶?註冊", "account.toLogin": "已有帳戶?登入",
    "account.hello": "你好,{name}", "account.memberNote": "登入後可同步訂單到帳戶。", "account.welcome": "歡迎,{name}!",
    "checkout.payNoteTest": "測試模式:已接通 Stripe 測試金流(含信用卡/支付寶/微信),不會真實扣款。",
    "checkout.payNoteMock": "示範模式:付款接口已預留,確認即模擬付款成功(不會扣款)。",
    "checkout.redirecting": "前往付款頁…",
    "err.SOLD_OUT": "已售罄,請選其他", "err.NOT_ON_SALE": "尚未發售", "err.CONTACT_REQUIRED": "請填寫聯絡資料",
    "err.ORDER_NOT_PAYABLE": "訂單狀態不可付款", "err.EMAIL_TAKEN": "此電郵已註冊", "err.BAD_CREDENTIALS": "電郵或密碼錯誤",
    "err.WEAK_PASSWORD": "密碼至少 6 位", "err.INVALID_EMAIL": "電郵格式不正確", "err.generic": "出錯,請再試", "err.network": "連線失敗"
  });
  E("zh-Hans", {
    "account.login": "登录", "account.register": "注册", "account.logout": "登出", "account.guest": "访客",
    "account.loginTitle": "会员登录", "account.registerTitle": "创建账户", "account.email": "邮箱", "account.password": "密码",
    "account.name": "姓名", "account.phone": "电话", "account.toRegister": "没有账户?注册", "account.toLogin": "已有账户?登录",
    "account.hello": "你好,{name}", "account.memberNote": "登录后可同步订单到账户。", "account.welcome": "欢迎,{name}!",
    "checkout.payNoteTest": "测试模式:已接通 Stripe 测试金流(含信用卡/支付宝/微信),不会真实扣款。",
    "checkout.payNoteMock": "演示模式:付款接口已预留,确认即模拟付款成功(不会扣款)。",
    "checkout.redirecting": "前往付款页…",
    "err.SOLD_OUT": "已售罄,请选其他", "err.NOT_ON_SALE": "尚未发售", "err.CONTACT_REQUIRED": "请填写联系资料",
    "err.ORDER_NOT_PAYABLE": "订单状态不可付款", "err.EMAIL_TAKEN": "此邮箱已注册", "err.BAD_CREDENTIALS": "邮箱或密码错误",
    "err.WEAK_PASSWORD": "密码至少 6 位", "err.INVALID_EMAIL": "邮箱格式不正确", "err.generic": "出错,请重试", "err.network": "连接失败"
  });
  E("en", {
    "account.login": "Log in", "account.register": "Sign up", "account.logout": "Log out", "account.guest": "Guest",
    "account.loginTitle": "Member login", "account.registerTitle": "Create account", "account.email": "Email", "account.password": "Password",
    "account.name": "Name", "account.phone": "Phone", "account.toRegister": "No account? Sign up", "account.toLogin": "Have an account? Log in",
    "account.hello": "Hi, {name}", "account.memberNote": "Log in to sync orders to your account.", "account.welcome": "Welcome, {name}!",
    "checkout.payNoteTest": "Test mode: connected to Stripe test payments (card / Alipay / WeChat). No real charge.",
    "checkout.payNoteMock": "Demo mode: payment interface reserved; confirming simulates a successful payment (no charge).",
    "checkout.redirecting": "Going to payment…",
    "err.SOLD_OUT": "Sold out — pick another", "err.NOT_ON_SALE": "Not on sale yet", "err.CONTACT_REQUIRED": "Please fill in contact details",
    "err.ORDER_NOT_PAYABLE": "Order can't be paid", "err.EMAIL_TAKEN": "Email already registered", "err.BAD_CREDENTIALS": "Wrong email or password",
    "err.WEAK_PASSWORD": "Password needs 6+ characters", "err.INVALID_EMAIL": "Invalid email", "err.generic": "Something went wrong", "err.network": "Connection failed"
  });
  E("ja", {
    "account.login": "ログイン", "account.register": "新規登録", "account.logout": "ログアウト", "account.guest": "ゲスト",
    "account.loginTitle": "会員ログイン", "account.registerTitle": "アカウント作成", "account.email": "メール", "account.password": "パスワード",
    "account.name": "氏名", "account.phone": "電話", "account.toRegister": "未登録?新規登録", "account.toLogin": "登録済み?ログイン",
    "account.hello": "こんにちは、{name}", "account.memberNote": "ログインすると注文がアカウントに同期されます。", "account.welcome": "ようこそ、{name}!",
    "checkout.payNoteTest": "テストモード:Stripeテスト決済（カード/Alipay/WeChat）に接続。実際の請求なし。",
    "checkout.payNoteMock": "デモモード:決済インターフェースは用意済み。確認すると成功を模擬（請求なし）。",
    "checkout.redirecting": "決済ページへ…",
    "err.SOLD_OUT": "完売しました", "err.NOT_ON_SALE": "販売前です", "err.CONTACT_REQUIRED": "連絡先を入力してください",
    "err.ORDER_NOT_PAYABLE": "この注文は支払えません", "err.EMAIL_TAKEN": "登録済みのメールです", "err.BAD_CREDENTIALS": "メールまたはパスワードが違います",
    "err.WEAK_PASSWORD": "パスワードは6文字以上", "err.INVALID_EMAIL": "メール形式が不正", "err.generic": "エラーが発生しました", "err.network": "接続に失敗しました"
  });
  E("ko", {
    "account.login": "로그인", "account.register": "회원가입", "account.logout": "로그아웃", "account.guest": "게스트",
    "account.loginTitle": "회원 로그인", "account.registerTitle": "계정 만들기", "account.email": "이메일", "account.password": "비밀번호",
    "account.name": "이름", "account.phone": "전화", "account.toRegister": "계정이 없나요? 가입", "account.toLogin": "이미 있나요? 로그인",
    "account.hello": "안녕하세요, {name}", "account.memberNote": "로그인하면 주문이 계정에 동기화됩니다.", "account.welcome": "환영합니다, {name}!",
    "checkout.payNoteTest": "테스트 모드: Stripe 테스트 결제(카드/Alipay/WeChat) 연결. 실제 청구 없음.",
    "checkout.payNoteMock": "데모 모드: 결제 인터페이스 준비됨. 확인 시 성공을 모의(청구 없음).",
    "checkout.redirecting": "결제 페이지로…",
    "err.SOLD_OUT": "매진 — 다른 항목 선택", "err.NOT_ON_SALE": "아직 판매 전", "err.CONTACT_REQUIRED": "연락처를 입력하세요",
    "err.ORDER_NOT_PAYABLE": "결제할 수 없는 주문", "err.EMAIL_TAKEN": "이미 가입된 이메일", "err.BAD_CREDENTIALS": "이메일 또는 비밀번호 오류",
    "err.WEAK_PASSWORD": "비밀번호는 6자 이상", "err.INVALID_EMAIL": "이메일 형식 오류", "err.generic": "오류가 발생했습니다", "err.network": "연결 실패"
  });
})();
