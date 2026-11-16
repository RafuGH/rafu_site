#!/usr/bin/env python3
"""YouTubeチャンネルの新しい動画の一覧（videos.json）を作る。

.github/workflows/videos.yml が決まった時間ごとに動かし、できたファイルを data ブランチに置く。
サイトはそのファイルを読んで、動画の欄・ピックアップ・トップの「最新の動画を見る」に出す
（assets/js/content.js の videoFeed）。

使い方:  python3 tools/fetch_videos.py 出力先.json [前回の一覧.json]

チャンネルのページ（動画・ショート・ライブの3つのタブ）を、ログインなしで読む。APIキーは要らない。
- 種類は、どのタブに並んでいるかで決まる（タイトルに「切り抜き」と入った動画は「切り抜き」）
- 公開日はタブには出ていないので、初めて見る動画だけ、その動画のページから読む。
  前回の一覧にある動画は、そこに書いてある日付をそのまま使う
- 読めなかったタブの動画は、前回の一覧のものを残す。3つとも読めなかったときは何も書かずに終わる
  （サイトには前の一覧がそのまま出る）

YouTubeがページの作りを変えると読めなくなることがある。そのときは Actions の記録に
「読めませんでした」と出るので、下の「ページから取り出す」のところを直す。
"""
import gzip
import json
import re
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

CHANNEL_ID = "UCieN24BfOliRfW28lrkupuQ"   # YouTube @Rafu_
PER_KIND = 15                             # 種類ごとにファイルへ入れる数（サイトに並べる数は content.js の videoFeed.max）
TIME_LIMIT = 150                          # 公開日を読みに行くのに使う時間の上限（秒）。間に合わなかった動画は次の回に入る
JST = timezone(timedelta(hours=9))
TABS = [("live", "streams"), ("shorts", "shorts"), ("video", "videos")]   # 種類と、チャンネルのページのタブ
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept-Language": "ja",
    "Accept-Encoding": "gzip",
    "Cookie": "PREF=hl=ja&tz=Asia.Tokyo",   # 日付を日本時間・日本語でもらう
}
# まだ始まっていない配信・公開前の動画・メンバー限定は載せない
SKIP_WORDS = ("予定", "待機", "近日公開", "プレミア公開", "メンバー限定")
ID_RE = re.compile(r"[\w-]{6,20}")


def log(*a):
    print(*a, file=sys.stderr)


def fetch(url, tries=2):
    """ページを読む。読めなければ None"""
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as res:
                raw = res.read()
                if res.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                return raw.decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001  通信の失敗はどれも同じ扱い
            log(f"  読めませんでした（{i + 1}回目）: {url} : {e}")
            if i + 1 < tries:
                time.sleep(3)
    return None


# ---------- ページから取り出す ----------

def page_data(html):
    """ページに埋め込まれているデータ（ytInitialData）"""
    m = re.search(r"var ytInitialData\s*=\s*(\{.*?\});\s*</script>", html or "", re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except ValueError:
        return None


def walk(o, key):
    """入れ子の中から、名前が key のものを上から順に全部取り出す"""
    if isinstance(o, dict):
        for k, v in o.items():
            if k == key:
                yield v
            else:
                yield from walk(v, key)
    elif isinstance(o, list):
        for v in o:
            yield from walk(v, key)


def texts(o):
    """入れ子の中の文字を全部つなげる（「公開予定」などの言葉を探すため）"""
    if isinstance(o, dict):
        return " ".join(texts(v) for v in o.values())
    if isinstance(o, list):
        return " ".join(texts(v) for v in o)
    return o if isinstance(o, str) else ""


def clean_title(s):
    s = re.sub(r"\s*[#＃]shorts?(?![0-9A-Za-z_])", "", str(s or ""), flags=re.I)   # 「#shorts」はサイトでは要らない
    return re.sub(r"\s+", " ", s).strip()


def tab_items(data):
    """タブに並んでいる動画を、上から（新しい順に） [{id, title, note}] で返す"""
    out = []
    for v in walk(data, "lockupViewModel"):              # 動画・ライブのタブ
        if not isinstance(v, dict) or v.get("contentType") != "LOCKUP_CONTENT_TYPE_VIDEO":
            continue
        meta = (v.get("metadata") or {}).get("lockupMetadataViewModel") or {}
        title = (meta.get("title") or {}).get("content")
        out.append({"id": v.get("contentId"), "title": title, "note": texts(meta.get("metadata")) + " " + texts(v.get("contentImage"))})
    for v in walk(data, "shortsLockupViewModel"):        # ショートのタブ
        if not isinstance(v, dict):
            continue
        ep = ((v.get("onTap") or {}).get("innertubeCommand") or {}).get("reelWatchEndpoint") or {}
        title = ((v.get("overlayMetadata") or {}).get("primaryText") or {}).get("content")
        out.append({"id": ep.get("videoId"), "title": title, "note": ""})
    good, seen = [], set()
    for it in out:
        vid, title = it["id"], clean_title(it["title"])
        if not isinstance(vid, str) or not ID_RE.fullmatch(vid) or not title or vid in seen:
            continue
        seen.add(vid)
        good.append({"id": vid, "title": title, "note": it["note"]})
    return good


def to_date(text, now):
    """「2026/11/12」「2026/09/20 にライブ配信」「3 時間前」などから日付（日本時間）を作る。わからなければ None"""
    text = text or ""
    m = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", text)
    if m:
        try:
            return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)), tzinfo=JST).date()
        except ValueError:
            return None
    m = re.search(r"(\d+)\s*(秒|分|時間|日)前", text)
    if m:
        n = int(m.group(1))
        delta = {"秒": timedelta(seconds=n), "分": timedelta(minutes=n), "時間": timedelta(hours=n), "日": timedelta(days=n)}[m.group(2)]
        return (now - delta).date()
    return None


def watch_date(vid, now):
    """動画のページから公開日を読む"""
    data = page_data(fetch("https://www.youtube.com/watch?v=" + vid, tries=1))
    if data is None:
        return None
    for d in walk(data, "dateText"):
        day = to_date(texts(d), now)
        if day:
            return day
    return None


# ---------- 一覧を作る ----------

def load_prev(path):
    """前回の一覧を {id: 動画} で返す"""
    if not path:
        return {}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return {v["id"]: v for v in data.get("videos", [])
                if isinstance(v, dict) and isinstance(v.get("id"), str) and re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(v.get("date", "")))}
    except (OSError, ValueError, AttributeError, KeyError, TypeError):
        return {}


def build(prev=None, now=None):
    prev = prev or {}
    now = now or datetime.now(JST)
    today = now.date().isoformat()
    found = {}        # id → {id, kind, title, note, order}
    failed = set()    # 読めなかったタブの種類
    for order, (kind, tab) in enumerate(TABS):
        data = page_data(fetch(f"https://www.youtube.com/channel/{CHANNEL_ID}/{tab}"))
        items = tab_items(data) if data is not None else []
        if not items:
            # 1本も無いのか、読めなかったのかは区別できないので、前回の一覧にこの種類があれば残す
            log(f"  {tab} のタブから動画を取り出せませんでした")
            failed.add(kind)
            continue
        for i, it in enumerate(items[:PER_KIND]):
            if any(w in it["note"] for w in SKIP_WORDS):
                continue
            found.setdefault(it["id"], {**it, "kind": kind, "order": order * 1000 + i})
    if len(failed) == len(TABS):
        return None

    videos, late = [], 0
    started = time.monotonic()
    # どの種類も新しいものから先に公開日を読む（時間切れになっても、新しい動画は入るように）
    for v in sorted(found.values(), key=lambda v: (v["order"] % 1000, v["order"])):
        old = prev.get(v["id"])
        if old:
            date = old["date"]
        else:
            if time.monotonic() - started > TIME_LIMIT:
                late += 1
                continue
            day = watch_date(v["id"], now) or to_date(v["note"], now)
            time.sleep(0.4)
            if not day:
                log(f"  公開日が読めなかったので、今回は入れません: {v['id']} {v['title']}")
                continue
            date = day.isoformat()
        if date > today:
            continue   # まだ公開されていない
        kind = "clip" if v["kind"] == "video" and "切り抜き" in v["title"] else v["kind"]
        videos.append({"id": v["id"], "kind": kind, "date": date, "title": v["title"], "_o": v["order"]})
    if late:
        log(f"  時間切れで、{late}本は次の回に回します")
    # 読めなかったタブの動画は、前回の一覧のものを残す
    have = {v["id"] for v in videos}
    for i, old in enumerate(prev.values()):
        base = "video" if old.get("kind") == "clip" else old.get("kind")
        if base in failed and old["id"] not in have and old.get("title"):
            videos.append({"id": old["id"], "kind": old["kind"], "date": old["date"], "title": old["title"], "_o": 9000 + i})

    videos.sort(key=lambda v: v["_o"])
    videos.sort(key=lambda v: v["date"], reverse=True)   # 新しい順（同じ日は、タブに並んでいた順）
    for v in videos:
        del v["_o"]
    return videos


def main():
    if len(sys.argv) not in (2, 3):
        print(__doc__)
        return 2
    videos = build(load_prev(sys.argv[2] if len(sys.argv) == 3 else None))
    if not videos:
        log("チャンネルのページが読めなかったので、一覧は前のままにします")
        return 0
    with open(sys.argv[1], "w", encoding="utf-8") as f:
        json.dump({"channel": CHANNEL_ID, "videos": videos}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(videos)}本を書き出しました")
    for v in videos:
        print(f"  {v['date']} {v['kind']:<6} {v['id']} {v['title']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
