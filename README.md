# rafu_site

Rafu の公式サイト（GitHub Pages）。

- 公開URL: https://rafugh.github.io/rafu_site/
- 更新は `main` に入ると数分で反映されます
- ビルド不要。`index.html` をブラウザで直接開いても確認できます

## ファイル構成

```
index.html              ページの骨組み（見出し・説明文など、ほとんど変わらない部分）
assets/js/content.js    ★ 載せる中身はここだけ直せばOK（動画リスト・作品・SNS・サーバー情報・背景動画）
assets/js/main.js       演出（ローディング、グリッチ、TV切り替え、パララックス、効果音など）
assets/css/style.css    デザイン
assets/img/             ロゴ・ファビコン・SNS共有画像（og.png）
assets/img/logo/        受け取ったロゴの元データ（1024px）
assets/video/           背景動画を置く場所
```

## よくある更新

| やりたいこと | 直す場所 |
| --- | --- |
| 新しい配信・切り抜き・Shortsを載せる | `content.js` の `videos` の先頭に1行足す（`id` はYouTubeの動画ID） |
| トップに背景動画を流す | 動画を `assets/video/` に置き、`content.js` の `hero.video` にパスを書く |
| 真ん中のキャラ画像を変える | 画像を `assets/img/` に置き、`hero.mascot` にパスを書く |
| 作品カードに画像を付ける | 画像を `assets/img/` に置き、`works` の `image` にパスを書く |
| サーバーのバージョンが変わった | `server.version` を書き換える |
| 投稿スケジュールが変わった | `schedule` を書き換える |

## 演出メモ

- ローディングは同じタブで1回だけ。2回目以降と「視差効果を減らす」設定の人には出ません
- 効果音は初期状態OFF。右上の SOUND ボタンでON（合成音なので音声ファイルは不要）
- Minecraftサーバーのオンライン表示は api.mcsrvstat.us を使用（数分遅れることがあります）
- トマトを押すと笑います
