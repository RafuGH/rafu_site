/*
 * サイトに載せる中身（文章・リンク・動画・画像）はこのファイルだけ直せば反映されます。
 * 画像や動画は assets/ の中に置いて、ここにパスを書いてください。
 * 例: 背景動画を assets/video/hero.mp4 に置いたら hero.video に "assets/video/hero.mp4" と書く。
 */
window.RAFU_CONTENT = {
  /* トップの大きな画面 */
  hero: {
    video: "",                              // 背景動画（空なら赤い集中線の演出）。例: "assets/video/hero.mp4"
    poster: "",                             // 動画の読み込み前に出す画像。例: "assets/video/hero.jpg"
    mascot: "assets/img/logo-sticker.webp", // 真ん中のキャラ画像（立ち絵などに差し替え可）
  },

  /* 投稿スケジュール（配信と切り抜きの欄に出ます） */
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
   * 作ったもの（カード）
   * icon  … "game" / "datapack" / "mod" / "plugin"
   * image … カードの絵を画像にしたいときだけパスを書く（空ならアイコン）
   */
  works: [
    { cat: "ゲーム",       title: "自作ゲーム",             text: "RedHubで作ったゲーム。Discordの配布チャンネルで公開中。", icon: "game",     color: "#e5121b", image: "", url: "https://discord.com/channels/911549273294925865/1168026049288863844" },
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
