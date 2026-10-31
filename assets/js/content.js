/*
 * サイトに載せる中身（文章・リンク・動画・画像）はこのファイルだけ直せば反映されます。
 * 画像や動画は assets/ の中に置いて、ここにパスを書いてください。
 * 例: 背景動画を assets/video/hero.mp4 に置いたら hero.video に "assets/video/hero.mp4" と書く。
 */
window.RAFU_CONTENT = {
  /* トップの大きな画面 */
  hero: {
    image: "",                              // 1枚絵のキービジュアル（入れると赤い集中線の背景と入れ替わる）。例: "assets/img/kv/key-visual.jpg"
    video: "",                              // 背景動画（画像より優先）。例: "assets/video/hero.mp4"
    poster: "",                             // 動画の読み込み前に出す画像。例: "assets/video/hero.jpg"
    mascot: "assets/img/logo-sticker.webp", // 真ん中のキャラ画像（立ち絵などに差し替え可）
  },

  /*
   * ニュース（上から新しい順。トップの下に並びます）
   * tag … "お知らせ" / "配信" / "Discord" / "更新" など自由に。色は main.js の NEWS_TAG で決まります
   * url … 押したときに開くページ（空なら押せない行になる。"discord" / "youtube" と書くと下のリンクを使う）
   * 日付が2週間以内のものには自動で「NEW」が付きます
   */
  news: [
    { date: "2026-10-30", tag: "お知らせ", title: "公式サイトをリニューアルしました", url: "" },
    { date: "2026-10-30", tag: "Discord",  title: "Discordサーバーが 日本語・English・Русский の3言語に対応しました", url: "discord" },
    { date: "2026-09-20", tag: "配信",     title: "配信「東京から消える漢」のアーカイブを公開中", url: "https://www.youtube.com/watch?v=01DwgkXvCWc" },
  ],

  /* 投稿スケジュール（ニュースの横に出ます） */
  schedule: [
    { label: "Shorts",   value: "月・金・日 15:00" },
    { label: "切り抜き", value: "隔週 土 18:00" },
    { label: "配信",     value: "気まぐれ（Discordでお知らせ）" },
  ],

  /*
   * 配信・切り抜き・Shorts（上から順に並びます。先頭がモニターに最初に映る動画）
   * id   … YouTubeの動画ID（URLの v= のあと、Shortsなら /shorts/ のあと）
   * kind … "live"（配信） / "clip"（切り抜き） / "shorts"
   * thumb… サムネを自分の画像にしたいときだけパスを書く（空ならYouTubeのサムネ）
   */
  videos: [
    { id: "01DwgkXvCWc", kind: "live",   date: "2026-09-20", title: "東京から消える漢" },
    { id: "pODARRmGiCo", kind: "live",   date: "2026-09-18", title: "初めて東京にきた漢" },
    { id: "TlreEy-PJgw", kind: "live",   date: "2026-09-17", title: "【ポケモンレジェンズZ-A】初見漢がやる ＃１５" },
    { id: "xxgSUu2noWs", kind: "shorts", date: "2026-03-29", title: "スマホロトムの安全装置を使いこなせない漢【ポケモンZA】" },
  ],

  /* Minecraftサーバー */
  server: {
    address: "rafuserver.duckdns.org",
    bedrockPort: "19132",                   // 統合版のポート
    editions: "Java版・統合版 どちらもOK",
    version: "1.18.1 以上",
    versionNote: "今後変わることがあります",
    showStatus: true,                       // サーバーのオンライン状態を表示する
  },

  /*
   * 配布物（ダウンロードページ downloads.html に並びます）
   * games … トップの「自作ゲーム」の欄にも大きく出ます
   * works … トップの「Minecraft」の欄のカードにも出ます
   *
   * id        … ページのURLに使う名前（半角英数字とハイフン。例: downloads.html#clear-xp ）
   * series    … 「第一弾」などのラベル（なくてもOK）
   * edition   … 「Java版」など（Minecraftの作品だけ。対応の横に出る。なくてもOK）
   * text      … 短い紹介（カードとアイコンの説明に出る）
   * about     … ダウンロードページの紹介文（改行は \n。`/reload` のように ` で囲むとコマンドの見た目、【 】だけの行は小見出しになる）
   * pv        … 紹介PVや、作品を使った動画のYouTube（IDでもURLでもOK。空ならアイコンの絵を出す）
   * pvLabel   … 動画の左上に出す名前（空なら "PV"。例: "使用した動画" ）
   * pvNote    … 動画の下に出す一言（例: "2022年10月19日に投稿した動画で使ったデータパックです" ）
   * iconImage … アイコン画像（正方形。ダウンロードページとトップのカードに出る。空ならドット絵のアイコン）
   * versions  … ダウンロードできるファイル（1行に1ファイル）。ページではプルダウンで選ぶ
   *             label    … バージョン。Minecraftなら対応バージョン（例: "1.21" ）。
   *                        "1.18.2〜1.20.6" のように範囲でもOK（下の mcVersions の中のバージョンが全部選べるようになる。
   *                        "1.18〜" のように後ろを空けると、いちばん新しいバージョンまで）
   *             version  … 作品のバージョン（例: "2.0" ）。書くと「作品のバージョン」も選べる・表示される。なくてもOK
   *             loader   … MODローダーなど（Minecraftの作品だけ。例: "Fabric" / "Forge" / "NeoForge" / "Paper" ）。なくてもOK
   *             platform … 対応機種（ゲームだけ。"windows" / "mac" / "ios" / "android" ）。なくてもOK
   *             file     … ファイルの場所（例: "downloads/clear-xp/Clear_XP.zip" ）。
   *                        大きいファイルや iOS・Android はURLでもOK（App Store / Google Play のURLならストアのボタンになる）
   *             size / date … 表示用（例: "2.4MB" / "2026-10-30" ）。空でもOK。date は「新しい順」の並びにも使う
   *             file が空のものは「準備中」になる。対応していない機種・バージョンは行ごと消す
   * updates   … アップデートの履歴（上から新しい順）。書くと、ページに「UPDATE」の矢印のリボンが出て
   *             いちばん上の title を短く見せる（押すと notes と昔の版も見られる）。最初の版も残したいときは いちばん下に書く
   *             version … 作品のバージョン / date … 日付 / title … ひとことで / notes … くわしい内容（1行ずつ）
   * howto     … 導入のしかた（1行ずつ。空なら出ない）
   * discord   … Discordの配布チャンネル（ダウンロードページの予備のリンク）
   */
  games: [
    {
      id: "game",
      title: "自作ゲーム",
      maker: "RedHub",
      catch: "自分で作ったゲームを、ここから配布中。",
      text: "RedHubで作ったゲーム。",
      about: "RedHubで作っているゲームです。",
      image: "",                // トップの「自作ゲーム」の欄に出す画面写真
      iconImage: "",
      trailer: "",              // 紹介PV（トップとダウンロードページの両方に出る）
      points: [],               // 特徴を3つくらい。例: [{ title: "走る", text: "…" }]
      versionLabel: "バージョン",
      versions: [
        { platform: "windows", label: "最新版", file: "", size: "", date: "" },
        { platform: "mac",     label: "最新版", file: "", size: "", date: "" },
        { platform: "ios",     label: "最新版", file: "", size: "", date: "" },
        { platform: "android", label: "最新版", file: "", size: "", date: "" },
      ],
      howto: [],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
  ],

  works: [
    {
      id: "clear-xp", series: "第一弾", cat: "データパック", edition: "Java版",
      title: "Clear_XP", icon: "datapack", color: "#2fa84f",
      text: "XPにほんの少しでも触れると、インベントリのアイテムが全部消える。XPから逃げろ！",
      about: "XPから逃げろ！！！\n" +
        "XPにほんの少しでも触れた瞬間、インベントリのアイテムはすべて消されます。このデータパックを入れると、XPはレベル1にギリギリならないくらいの所で止まります。\n" +
        "個人的に、killされるよりclearされる方がかなりメンタルにくるので、今回はclearにしました。いいね\n" +
        "【ちょっぴり楽しく遊べるモード】\n" +
        "`/function death:1death` と入力すると、デスゲームモードが始まります。始まってから30秒の間にXPを取るとkillされ、すべてのプレイヤーにエンチャントビンが3個配られる、恐怖のデスゲームです。",
      image: "", iconImage: "assets/img/works/clear-xp.webp",
      pv: "https://youtu.be/BHGJ7f7yhqk", pvLabel: "使用した動画",
      pvNote: "2022年10月19日に投稿した動画で使ったデータパックです",
      versions: [
        { label: "1.18.2〜1.20.6", file: "downloads/clear-xp/Clear_XP.zip", size: "9.7KB", date: "2022-10-19" },
      ],
      howto: [
        "ダウンロードした zip を解凍せずに、ワールドのフォルダ（.minecraft/saves/ワールドの名前）の中の datapacks に入れる",
        "ゲーム内で `/reload` を実行する（ワールドに入り直してもOK）",
        "チャットに [Clear_XP] のメッセージが出たら準備OK",
      ],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
    {
      id: "bomb-animals", series: "第二弾", cat: "データパック", edition: "Java版",
      title: "Bomb_Animals", icon: "datapack", color: "#d4730b",
      text: "動物がスポーンしてから30秒たつと、その場で爆散する。スポーンエッグのレシピつき。",
      about: "半年以上ぶりに戻ってきた \"Bomb_Animals\"！ ver1.0のときよりも大幅にアップデートされてるぞ！\n" +
        "動物はスポーンしてから30秒たつと、その場で爆散します。（前回に引き続き、爆散する瞬間に一匹ずつ許可をもらってるからな！）\n" +
        "【超楽しい最高の要素たち】\n" +
        "入れると、動物のスポーンエッグを作るレシピが追加されます。うまくタイミングを合わせれば、ほかのプレイヤーにドッキリを仕掛けられるかも！ レシピは zip の中の「レシピ一覧」フォルダに画像で入っています。\n" +
        "※ロバ・ラバ・ヤマネコ・ヤギ・ラマ・イカ・ヒカリイカ・コウモリ・ウーパールーパーのレシピはありません。\n" +
        "※1.19以降に追加された動物（カエルなど）は爆発しません。",
      image: "", iconImage: "assets/img/works/bomb-animals.webp",
      pv: "https://youtu.be/bZliv1P1ghg", pvLabel: "使用した動画",
      pvNote: "2022年12月15日に投稿した動画で使ったデータパックです（動画で使ったのは ver1.0）",
      versions: [
        { label: "1.18〜1.20.4", version: "2.0", file: "downloads/bomb-animals/Bomb_Animals_v2.0.zip", size: "181KB", date: "2023-09-09" },
      ],
      updates: [
        {
          version: "2.0", date: "2023-09-09",
          title: "動物ごとに、スポーンから30秒で爆散するように",
          notes: [
            "動物がスポーンしてから、それぞれ30秒たつと爆散するように変更（前は30秒たつと、すべての動物が同時に爆散していた）",
            "爆散したあとに、動物の死骸が飛び散るのを修正",
          ],
        },
        { version: "1.0", date: "2022-12-15", title: "最初の版（動画で使ったもの）" },
      ],
      howto: [
        "ダウンロードした zip を解凍せずに、ワールドのフォルダ（.minecraft/saves/ワールドの名前）の中の datapacks に入れる",
        "ゲーム内で `/reload` を実行する（ワールドに入り直してもOK）",
        "チャットに「導入に成功しました」と出たら準備OK",
      ],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
    {
      id: "lost-ozon", series: "第三弾", cat: "データパック", edition: "Java版",
      title: "Lost_Ozon", icon: "datapack", color: "#7a44c9",
      text: "オゾン層が消えて、外に出るだけでダメージを受ける。頭の上にブロックがあれば安全。",
      about: "地球のオゾン層が消えてしまった！\n" +
        "直接ふりそそぐ紫外線に注意しよう。空の下にいると、毒と衰弱でどんどんダメージを受けます。ちなみに、頭の上にブロックがあれば紫外線はすべて防がれます。\n" +
        "※入れると、作物や草が育つ速さ（randomTickSpeed）が 1 になります。元に戻すときは `/gamerule randomTickSpeed 3`",
      image: "", iconImage: "assets/img/works/lost-ozon.webp",
      pv: "", pvLabel: "使用した動画",
      pvNote: "2022年12月23日に撮影した動画で使ったデータパックです（動画はお蔵入り）",
      versions: [
        { label: "1.18.2〜1.20.6", version: "1.0", file: "downloads/lost-ozon/Lost_Ozon_v1.0.zip", size: "11.4KB", date: "2023-09-09" },
      ],
      howto: [
        "ダウンロードした zip を解凍せずに、ワールドのフォルダ（.minecraft/saves/ワールドの名前）の中の datapacks に入れる",
        "ゲーム内で `/reload` を実行する（ワールドに入り直してもOK）",
        "チャットに「導入に成功しました」と出たら準備OK",
      ],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
  ],

  /*
   * Minecraft（Java版）のバージョンの一覧（古い順）。versions の label に "1.18.2〜1.20.6" のような範囲を書くと、ここから選ばれる
   * 新しいバージョンが出たら後ろに足す
   */
  mcVersions: [
    "1.13", "1.13.1", "1.13.2",
    "1.14", "1.14.1", "1.14.2", "1.14.3", "1.14.4",
    "1.15", "1.15.1", "1.15.2",
    "1.16", "1.16.1", "1.16.2", "1.16.3", "1.16.4", "1.16.5",
    "1.17", "1.17.1",
    "1.18", "1.18.1", "1.18.2",
    "1.19", "1.19.1", "1.19.2", "1.19.3", "1.19.4",
    "1.20", "1.20.1", "1.20.2", "1.20.3", "1.20.4", "1.20.5", "1.20.6",
    "1.21", "1.21.1", "1.21.2", "1.21.3", "1.21.4", "1.21.5", "1.21.6", "1.21.7", "1.21.8", "1.21.9", "1.21.10", "1.21.11",
  ],

  /* SNS（フッターとトップのアイコンに出ます） */
  sns: [
    { key: "youtube", name: "YouTube", handle: "@Rafu_",            url: "https://www.youtube.com/@Rafu_",          color: "#ff0033" },
    { key: "twitch",  name: "Twitch",  handle: "rafu_2",            url: "https://www.twitch.tv/rafu_2",            color: "#9146ff" },
    { key: "tiktok",  name: "TikTok",  handle: "@rafu_gs",          url: "https://www.tiktok.com/@rafu_gs",         color: "#fe2c55" },
    { key: "x",       name: "X",       handle: "@Rafu121",          url: "https://x.com/Rafu121",                   color: "#e7e9ea" },
    { key: "discord", name: "Discord", handle: "RafuDiscordServer", url: "https://discord.com/invite/wyUbqVpvfe",    color: "#5865f2" },
  ],

  discord: "https://discord.com/invite/wyUbqVpvfe",
  youtube: "https://www.youtube.com/@Rafu_",
};
