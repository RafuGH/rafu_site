# 背景動画の置き場所

トップ画面の後ろに流す動画をここに置きます。

## おすすめの書き出し設定（Premiere / Media Encoder）

- 形式: MP4（H.264）
- サイズ: 1920×1080
- 長さ: 8〜20秒のループ素材（最初と最後がつながると自然）
- 音声: なし（サイトでは常にミュート再生）
- ファイルサイズ: 10MB以下が目安（ビットレート 4〜6Mbps 程度）
- 文字やロゴは動画に入れない（サイト側の文字と重なるため）
- 左側は文字が乗るので暗め・情報少なめにすると読みやすい

## 使い方

1. 例: `hero.mp4` をこのフォルダに置く
2. 最初の1コマを `hero.jpg` として書き出して同じフォルダに置く（読み込み中に表示）
3. `assets/js/content.js` の `hero` を次のように書き換える

```js
hero: {
  video: "assets/video/hero.mp4",
  poster: "assets/video/hero.jpg",
  mascot: "assets/img/logo-sticker.webp",
},
```
