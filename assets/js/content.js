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
   * 自作ゲーム（「自作ゲーム」の欄に大きく並びます。上から順に左右交互）
   * image   … ゲームの画面やキービジュアル（空なら仮の絵）。例: "assets/img/games/mygame.jpg"
   * trailer … 紹介動画のYouTube ID（入れると「紹介動画を見る」ボタンが出る）
   * points  … 特徴を3つくらい（空なら出ない）。例: [{ title: "走る", text: "…" }]
   */
  games: [
    {
      title: "自作ゲーム",
      maker: "RedHub",
      catch: "自分で作ったゲームを、Discordで配布中。",
      text: "RedHubで作ったゲーム。Discordの配布チャンネルで公開しています。",
      image: "",
      trailer: "",
      points: [],
      url: "https://discord.com/channels/911549273294925865/1168026049288863844",
    },
  ],

  /*
   * Minecraftの配布物（Minecraftの欄のカード）
   * icon  … "datapack" / "mod" / "plugin" / "game"
   * image … カードの絵を画像にしたいときだけパスを書く（空ならアイコン）
   */
  works: [
    { cat: "データパック", title: "Minecraft データパック", text: "Minecraft用のデータパック。Discordの配布チャンネルで公開中。", icon: "datapack", color: "#1f9d4c", image: "", url: "https://discord.com/channels/911549273294925865/1168026049288863844" },
    { cat: "MOD",          title: "Minecraft MOD",          text: "Minecraft用のMOD。Discordの配布チャンネルで公開中。",       icon: "mod",      color: "#2f5fd0", image: "", url: "https://discord.com/channels/911549273294925865/1168026049288863844" },
    { cat: "プラグイン",   title: "サーバープラグイン",     text: "サーバー用のプラグイン。Discordの配布チャンネルで公開中。",   icon: "plugin",   color: "#7a44c9", image: "", url: "https://discord.com/channels/911549273294925865/1168026049288863844" },
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
