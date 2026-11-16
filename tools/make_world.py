"""ワールドの写真（PNG・JPG）から、サイト用の軽い画像を3つ作る。

使い方:  python tools/make_world.py 元の画像.png assets/img/world/world-04
  → world-04.webp（横2560）・world-04-m.webp（横1600）・world-04-s.webp（横800）ができる
  そのあと content.js の server.world に { image: "assets/img/world/world-04.webp", caption: "…" } を足す。
Pillow が必要（pip install pillow）。
"""
import sys
from pathlib import Path

from PIL import Image

SIZES = (("", 2560, 80), ("-m", 1600, 80), ("-s", 800, 78))


def main(src: str, out: str) -> None:
    im = Image.open(src).convert("RGB")
    base = Path(out).with_suffix("")
    base.parent.mkdir(parents=True, exist_ok=True)
    for suffix, width, quality in SIZES:
        w = min(width, im.width)
        h = round(im.height * w / im.width)
        dst = base.parent / f"{base.name}{suffix}.webp"
        (im if w == im.width else im.resize((w, h), Image.LANCZOS)).save(dst, "WEBP", quality=quality, method=6)
        print(f"{dst}  {w}x{h}  {dst.stat().st_size // 1024}KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
