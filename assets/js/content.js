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
   * id        … ページのURLに使う名前（半角英数字とハイフン。例: downloads.html#datapack ）
   * text      … 短い紹介（カードとアイコンの説明に出る）
   * about     … ダウンロードページの紹介文（改行は \n）
   * pv        … 紹介PVのYouTube（IDでもURLでもOK。空ならアイコンの絵を出す）
   * iconImage … ダウンロードページのアイコン画像（正方形。空ならドット絵のアイコン）
   * versions  … ダウンロードできるファイル（1行に1ファイル）。ページではプルダウンで選ぶ
   *             label    … バージョン（Minecraftなら対応バージョン。例: "1.21" ）
   *             loader   … MODローダーなど（Minecraftの作品だけ。例: "Fabric" / "Forge" / "NeoForge" / "Paper" ）。なくてもOK
   *             platform … 対応機種（ゲームだけ。"windows" / "mac" / "ios" / "android" ）。なくてもOK
   *             file     … ファイルの場所（例: "downloads/datapack/rafu-pack-1.21.zip" ）。
   *                        大きいファイルや iOS・Android はURLでもOK（App Store / Google Play のURLならストアのボタンになる）
   *             size / date … 表示用（例: "2.4MB" / "2026-10-30" ）。空でもOK。date は「新しい順」の並びにも使う
   *             file が空のものは「準備中」になる。対応していない機種・バージョンは行ごと消す
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
      id: "datapack", cat: "データパック", title: "Minecraft データパック", icon: "datapack", color: "#1f9d4c",
      text: "Minecraft用のデータパック。",
      about: "Minecraft用のデータパックです。",
      image: "", iconImage: "", pv: "",
      versions: [
        { label: "1.21", file: "", size: "", date: "" },
        { label: "1.20.4", file: "", size: "", date: "" },
      ],
      howto: ["ダウンロードした zip を、ワールドフォルダの datapacks に入れる", "ゲーム内で /reload を実行する"],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
    {
      id: "mod", cat: "MOD", title: "Minecraft MOD", icon: "mod", color: "#2f5fd0",
      text: "Minecraft用のMOD。",
      about: "Minecraft用のMODです。",
      image: "", iconImage: "", pv: "",
      versions: [
        { label: "1.21", loader: "Fabric", file: "", size: "", date: "" },
        { label: "1.21", loader: "NeoForge", file: "", size: "", date: "" },
        { label: "1.20.1", loader: "Forge", file: "", size: "", date: "" },
      ],
      howto: ["対応するMODローダーを入れる", "ダウンロードした jar を mods フォルダに入れて起動する"],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
    {
      id: "plugin", cat: "プラグイン", title: "サーバープラグイン", icon: "plugin", color: "#7a44c9",
      text: "サーバー用のプラグイン。",
      about: "Minecraftサーバー用のプラグインです。",
      image: "", iconImage: "", pv: "",
      versions: [
        { label: "1.21", loader: "Paper", file: "", size: "", date: "" },
      ],
      howto: ["ダウンロードした jar をサーバーの plugins フォルダに入れる", "サーバーを再起動する"],
      discord: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
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
