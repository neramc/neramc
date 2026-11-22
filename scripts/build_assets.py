#!/usr/bin/env python3
"""Generate the pixel-art SVGs used by the profile README.

Run from anywhere:  python3 scripts/build_assets.py
Every file under assets/ is written by this script, so change the data
here (texts, projects, colours) and re-run it rather than editing SVGs.
No third-party packages are needed.
"""

from __future__ import annotations

import random
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

# ── palette: netherite greys + ember orange ───────────────────────────────
EMBER = "#ff7a3d"
EMBER_SOFT = "#ff9a63"
AMBER = "#f2b84b"
GLOW = "#ffd08a"
INK = "#141012"
COAL = "#1b1517"
SLATE = "#2e2629"
STONE = "#5a5155"
ASH = "#8a8186"
FOG = "#a39a9e"
BONE = "#d8d1cc"
CHALK = "#f1ebe6"

MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
SANS = ("Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', "
        "'Noto Sans CJK KR', system-ui, sans-serif")

# ── 5×7 pixel font (glyphs may be narrower; advance = width + 1) ──────────
FONT: dict[str, list[str]] = {
    "A": [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    "B": ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
    "C": [" ####", "#    ", "#    ", "#    ", "#    ", "#    ", " ####"],
    "D": ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
    "E": ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
    "F": ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
    "G": [" ####", "#    ", "#    ", "#  ##", "#   #", "#   #", " ####"],
    "H": ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    "I": ["###", " # ", " # ", " # ", " # ", " # ", "###"],
    "J": ["  ###", "    #", "    #", "    #", "#   #", "#   #", " ### "],
    "K": ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
    "L": ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
    "M": ["#   #", "## ##", "# # #", "# # #", "#   #", "#   #", "#   #"],
    "N": ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
    "O": [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
    "P": ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
    "Q": [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"],
    "R": ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
    "S": [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
    "T": ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
    "U": ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
    "V": ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
    "W": ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
    "X": ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
    "Y": ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
    "Z": ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
    "0": [" ### ", "#   #", "#  ##", "# # #", "##  #", "#   #", " ### "],
    "1": [" # ", "## ", " # ", " # ", " # ", " # ", "###"],
    "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
    "3": ["#### ", "    #", "    #", " ### ", "    #", "    #", "#### "],
    "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
    "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
    "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
    "7": ["#####", "    #", "   # ", "  #  ", "  #  ", "  #  ", "  #  "],
    "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
    "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
    "-": ["    ", "    ", "    ", "####", "    ", "    ", "    "],
    ".": [" ", " ", " ", " ", " ", " ", "#"],
    ":": [" ", " ", "#", " ", " ", "#", " "],
    "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
    "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
    "#": ["     ", " # # ", "#####", " # # ", "#####", " # # ", "     "],
    "+": ["     ", "  #  ", "  #  ", "#####", "  #  ", "  #  ", "     "],
    "!": ["#", "#", "#", "#", "#", " ", "#"],
    "·": [" ", " ", " ", "#", " ", " ", " "],
    " ": ["   "] * 7,
}


def num(v: float) -> str:
    return f"{v:.2f}".rstrip("0").rstrip(".")


def text_width(text: str, scale: float) -> float:
    cols = sum(len(FONT[ch][0]) + 1 for ch in text) - 1
    return cols * scale


def pixel_text(text: str, x: float, y: float, scale: float, fill: str,
               highlight: str | None = None, extra: str = "") -> str:
    """Pixel-font text as <path>s; optional lighter top row for a bevel."""
    body, top = [], []
    cx = x
    for ch in text:
        glyph = FONT[ch]
        for r, row in enumerate(glyph):
            c = 0
            while c < len(row):
                if row[c] != "#":
                    c += 1
                    continue
                start = c
                while c < len(row) and row[c] == "#":
                    c += 1
                run = (f"M{num(cx + start * scale)} {num(y + r * scale)}"
                       f"h{num((c - start) * scale)}v{num(scale)}"
                       f"h{num(-(c - start) * scale)}z")
                body.append(run)
                if r == 0 or (r > 0 and glyph[r - 1][start:c].strip() == ""):
                    top.append(f"M{num(cx + start * scale)} {num(y + r * scale)}"
                               f"h{num((c - start) * scale)}v{num(scale / 2)}"
                               f"h{num(-(c - start) * scale)}z")
        cx += (len(glyph[0]) + 1) * scale
    out = f'<path fill="{fill}" d="{"".join(body)}"{extra}/>'
    if highlight:
        out += f'<path fill="{highlight}" d="{"".join(top)}"{extra}/>'
    return out


# ── 16×16 icons (original pixel art) ───────────────────────────────────────
ICONS: dict[str, tuple[list[str], dict[str, str]]] = {
    "pickaxe": ([
        "................",
        "....kkkkkk......",
        "...kmmllllkk....",
        "....kkkmmmmlk...",
        "........kkmmlk..",
        "........kbkmmk..",
        ".......kbk.kmlk.",
        "......kbk...kmk.",
        ".....kbk....kmk.",
        "....kbk......kk.",
        "...kbk..........",
        "..kbk...........",
        ".kbk............",
        ".kk.............",
        "................",
        "................",
    ], {"k": INK, "m": "#6e6468", "l": "#b9b0b4", "b": "#9a6a3c"}),
    "penguin": ([
        "................",
        "......kkkk......",
        ".....kkkkkk.....",
        "....kkwkkwkk....",
        "....kkkyykkk....",
        "....kkyyyykk....",
        "...kkwwwwwwkk...",
        "...kwwwwwwwwk...",
        "..kkwwwwwwwwkk..",
        "..kkwwwwwwwwkk..",
        "..kkwwwwwwwwkk..",
        "...kwwwwwwwwk...",
        "...kkwwwwwwkk...",
        "...yyykkkkyyy...",
        "..yyyy....yyyy..",
        "................",
    ], {"k": "#1e1a1c", "w": "#f4f1ec", "y": AMBER}),
    "trash": ([
        "................",
        "......kkkk......",
        ".....kmmmmk.....",
        "..kkkkkkkkkkkk..",
        "..keeeeeeeeeek..",
        "..kkkkkkkkkkkk..",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kmmlmmlmmk...",
        "...kddddddddk...",
        "....kkkkkkkk....",
        "................",
    ], {"k": INK, "m": "#7a7276", "l": "#b9b0b4", "d": "#4a4044", "e": EMBER}),
    "quill": ([
        "...............k",
        ".............kkw",
        "............kwwk",
        "...........kwwlk",
        "..........kwwlk.",
        ".........kwwlk..",
        "........kwwlk...",
        ".......kwwlk....",
        "......kwwlk.....",
        ".....kwwlk......",
        "....kwwlk.......",
        "....kwlk........",
        "...kllk.........",
        "...kkk..........",
        "..kk............",
        ".e..............",
    ], {"k": INK, "w": "#f4f1ec", "l": "#c9c1bd", "e": EMBER}),
    "page": ([
        "..kkkkkkkkkk....",
        "..kwwwwwwwwkk...",
        "..kwwwwwwwwklk..",
        "..kwwwwwwwwkkkk.",
        "..kwwwwwwwwwwwk.",
        "..kwkwwwkwwkwwk.",
        "..kwkkwkkwwkwwk.",
        "..kwkwkwkwwkwwk.",
        "..kwkwwwkwkkkwk.",
        "..kwkwwwkwwkwwk.",
        "..kwwwwwwwwwwwk.",
        "..kwllllllllwwk.",
        "..kwwwwwwwwwwwk.",
        "..kwlllllwwwwwk.",
        "..kkkkkkkkkkkkk.",
        "................",
    ], {"k": INK, "w": "#ece7e0", "l": "#b9b0b4"}),
    "ticket": ([
        "................",
        "................",
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kyyyyyyykyyyyk.",
        ".kyykykyyyyyyyk.",
        ".kykkkkkykyllyk.",
        ".kyykykyyyyyyyk.",
        ".kykkkkkykyllyk.",
        ".kyykykyyyyyyyk.",
        ".kyyyyyyykyyyyk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
        "................",
    ], {"k": INK, "y": AMBER, "l": "#b7791f"}),
    "globe": ([
        "................",
        ".....kkkkkk.....",
        "...kkbbbggbkk...",
        "..kbbbgggggbbk..",
        "..kbbgggggbbbk..",
        ".kbbbbggbbbbbbk.",
        ".kbbbbbgbbbggbk.",
        ".kbbbbbbbbgggbk.",
        ".kbbgbbbbbgggbk.",
        ".kbgggbbbbbggbk.",
        "..kbgggbbbbbbk..",
        "..kbbggbbbbbbk..",
        "...kkbbbbbbkk...",
        ".....kkkkkk.....",
        "................",
        "................",
    ], {"k": INK, "b": "#5b8fd6", "g": "#7fb069"}),
    "window": ([
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kmmmmmmmmlleek.",
        ".kkkkkkkkkkkkkk.",
        ".kwwwwwwwwwwwwk.",
        ".kwddddwwwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kwddddddwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kwdddwwwwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
        "................",
    ], {"k": INK, "m": "#5a5155", "l": "#a39a9e", "e": EMBER, "w": "#ece7e0", "d": "#b9b0b4"}),
    "monitor": ([
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kbbbbbbbbbbbbk.",
        ".kbwwbbbbbbbbbk.",
        ".kbwbbbbbbbbbbk.",
        ".kbbbbbbbbbbbbk.",
        ".kbbbbbbbbbbbbk.",
        ".kbbbbbbbbbbbbk.",
        ".kbbbbbbbbbbbbk.",
        ".kkkkkkkkkkkkkk.",
        "......kkkk......",
        "......kmmk......",
        "....kkkkkkkk....",
        "....kmmmmmmk....",
        "....kkkkkkkk....",
        "................",
    ], {"k": INK, "b": "#3d6fb0", "w": "#9cc0ee", "m": "#7a7276"}),
    "server": ([
        "................",
        "..kkkkkkkkkkkk..",
        "..kmmmmmmmmmmk..",
        "..kmgmmmmllllk..",
        "..kmmmmmmmmmmk..",
        "..kkkkkkkkkkkk..",
        "..kmmmmmmmmmmk..",
        "..kmemmmmllllk..",
        "..kmmmmmmmmmmk..",
        "..kkkkkkkkkkkk..",
        "..kmmmmmmmmmmk..",
        "..kmgmmmmllllk..",
        "..kmmmmmmmmmmk..",
        "..kkkkkkkkkkkk..",
        "....kk....kk....",
        "................",
    ], {"k": INK, "m": "#6e6468", "l": "#3b3337", "g": "#7fd16b", "e": EMBER}),
    "stopwatch": ([
        "................",
        "......kkkk......",
        ".......kk.......",
        ".....kkkkkk.....",
        "...kkwwwwwwkk...",
        "..kwwwwkwwwwwk..",
        "..kwwwwkwwwwwk..",
        ".kwwwwwkwwwwwwk.",
        ".kwwwwwkkkkwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        "..kwwwwwwwwwwk..",
        "..kwwwwwwwwwwk..",
        "...kkwwwwwwkk...",
        ".....kkkkkk.....",
        "................",
    ], {"k": INK, "w": "#f1ebe6"}),
    "shield": ([
        "................",
        "..kkkkkkkkkkkk..",
        "..keeeeeeeeeek..",
        "..keeeeeeeewek..",
        "..keeeeeeewwek..",
        "..keweeeewweek..",
        "..kewweewweeek..",
        "..keewwwweeeek..",
        "...keewweeeek...",
        "...keeeeeeeek...",
        "....keeeeeek....",
        ".....keeeek.....",
        "......kkkk......",
        "................",
        "................",
        "................",
    ], {"k": INK, "e": EMBER, "w": "#fff4ea"}),
    "checklist": ([
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kwwwwwwwwwwwwk.",
        ".kwkkkwwwwwwwwk.",
        ".kwkgkwllllllwk.",
        ".kwkkkwwwwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kwkkkwwwwwwwwk.",
        ".kwkgkwllllllwk.",
        ".kwkkkwwwwwwwwk.",
        ".kwwwwwwwwwwwwk.",
        ".kwkkkwwwwwwwwk.",
        ".kwkgkwllllllwk.",
        ".kwkkkwwwwwwwwk.",
        ".kkkkkkkkkkkkkk.",
        "................",
    ], {"k": INK, "w": "#ece7e0", "g": "#5fb84a", "l": "#b9b0b4"}),
    "cog": ([
        "................",
        ".......kk.......",
        "...kk.keek.kk...",
        "...keekeekeek...",
        "....keeeeeek....",
        ".kkkeekkkkeekkk.",
        ".keeeek..keeeek.",
        "..keek....keek..",
        "..keek....keek..",
        ".keeeek..keeeek.",
        ".kkkeekkkkeekkk.",
        "....keeeeeek....",
        "...keekeekeek...",
        "...kk.keek.kk...",
        ".......kk.......",
        "................",
    ], {"k": INK, "e": "#b9b0b4"}),
    "terminal": ([
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kmmmmmmmmmmmmk.",
        ".kkkkkkkkkkkkkk.",
        ".kddddddddddddk.",
        ".kdeddddddddddk.",
        ".kddedddddddddk.",
        ".kdddeddddddddk.",
        ".kddedddddddddk.",
        ".kdedddwwwwdddk.",
        ".kddddddddddddk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
        "................",
    ], {"k": INK, "m": "#5a5155", "d": "#1b1517", "e": EMBER, "w": "#f1ebe6"}),
    "picture": ([
        "................",
        ".kkkkkkkkkkkkkk.",
        ".kbbbbbbbbbbybk.",
        ".kbbbbbbbbbyyyk.",
        ".kbbbbbbbbbbybk.",
        ".kbbbbbbbbbbbbk.",
        ".kbbbbbgbbbbbbk.",
        ".kbbbbgggbbbbbk.",
        ".kbbbgggggbgbbk.",
        ".kbbgggggggggbk.",
        ".kbgggggggggggk.",
        ".kkkkkkkkkkkkkk.",
        "................",
        "................",
        "................",
        "................",
    ], {"k": INK, "b": "#9cc0ee", "y": AMBER, "g": "#6a9a52"}),
    "snake": ([
        "................",
        "................",
        "..........kkkk..",
        ".........keeeek.",
        ".........kekeek.",
        ".........keeeek.",
        "..kkkkk...keek..",
        ".keeeeek..keek..",
        ".kekkkeek.keek..",
        ".kek..keekkeek..",
        ".kek...keeeek...",
        ".kek....kkkk....",
        ".kek............",
        "..k.............",
        "................",
        "................",
    ], {"k": INK, "e": EMBER}),
}


def icon(name: str, x: float, y: float, scale: float) -> str:
    rows, pal = ICONS[name]
    assert len(rows) == 16 and all(len(r) == 16 for r in rows), name
    runs: dict[str, list[str]] = {}
    for r, row in enumerate(rows):
        c = 0
        while c < 16:
            ch = row[c]
            if ch == ".":
                c += 1
                continue
            start = c
            while c < 16 and row[c] == ch:
                c += 1
            runs.setdefault(ch, []).append(
                f"M{num(x + start * scale)} {num(y + r * scale)}"
                f"h{num((c - start) * scale)}v{num(scale)}h{num(-(c - start) * scale)}z")
    return "".join(f'<path fill="{pal[k]}" d="{"".join(v)}"/>' for k, v in runs.items())


def frame(x: float, y: float, w: float, h: float, t: float, color: str) -> str:
    """A border with notched (pixel) corners."""
    return (f'<path fill="{color}" d="M{num(x + t)} {num(y)}h{num(w - 2 * t)}v{num(t)}h{num(-(w - 2 * t))}z'
            f'M{num(x + t)} {num(y + h - t)}h{num(w - 2 * t)}v{num(t)}h{num(-(w - 2 * t))}z'
            f'M{num(x)} {num(y + t)}h{num(t)}v{num(h - 2 * t)}h{num(-t)}z'
            f'M{num(x + w - t)} {num(y + t)}h{num(t)}v{num(h - 2 * t)}h{num(-t)}z"/>')


def svg(w: int, h: int, title: str, body: str, style: str = "", defs: str = "") -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" role="img" aria-labelledby="title">'
            f'<title id="title">{escape(title)}</title>'
            f'<defs>{defs}<style>{style}</style></defs>{body}</svg>\n')


REDUCED = "@media (prefers-reduced-motion: reduce){*{animation:none!important}}"


# ── header ────────────────────────────────────────────────────────────────
def header(dark: bool) -> str:
    W, H = 900, 240
    rnd = random.Random(7)
    if dark:
        base, light, veil, veil_op = "#141012", "#2c2528", "#141012", 0.55
        letters, top, shadow, shadow_op, sub = "#e2dbd6", "#fffaf5", EMBER, 0.45, ASH
    else:
        base, light, veil, veil_op = "#ece8e2", "#f7f4ef", "#ece8e2", 0.25
        letters, top, shadow, shadow_op, sub = "#2e2629", "#6a6064", "#2e2629", 0.22, "#7a7074"

    defs = (f'<filter id="paper" x="0" y="0" width="100%" height="100%">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="4" seed="11" result="n"/>'
            f'<feDiffuseLighting in="n" lighting-color="{light}" surfaceScale="2.6">'
            f'<feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting></filter>')

    # wordmark geometry
    s = 12
    wx, wy = 270, 46
    ww = text_width("NERAMC", s)
    px, py, ps = 148, 42, 6                       # pickaxe
    pivot = (px + 2 * ps, py + 13 * ps)
    sub_text = "WEB APPS · DESKTOP TOOLS"
    ss = 3
    sx = wx + (ww - text_width(sub_text, ss)) / 2

    style = [
        f"@keyframes swing{{0%{{transform:rotate(0)}}55%{{transform:rotate(-28deg)}}"
        f"72%{{transform:rotate(10deg)}}82%{{transform:rotate(4deg)}}100%{{transform:rotate(0)}}}}",
        f".pick{{transform-origin:{pivot[0]}px {pivot[1]}px;animation:swing 1.8s ease-in-out infinite}}",
        "@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}",
        ".cur{animation:blink 1.1s steps(1) infinite}",
        "@keyframes spark{0%,70%{opacity:0;transform:translate(0,0)}72%{opacity:1}"
        "100%{opacity:0;transform:translate(var(--dx),var(--dy))}}",
    ]
    body = [f'<rect width="{W}" height="{H}" fill="{base}"/>',
            f'<rect width="{W}" height="{H}" filter="url(#paper)"/>',
            f'<rect width="{W}" height="{H}" fill="{veil}" opacity="{veil_op}"/>']

    # rising embers (behind everything else)
    for i in range(18):
        size = rnd.choice([4, 6, 6, 8])
        x = rnd.randint(40, W - 40)
        rise = rnd.randint(110, 210)
        drift = rnd.randint(-30, 30)
        dur = rnd.uniform(3.8, 7.5)
        delay = -rnd.uniform(0, dur)
        color = rnd.choice([EMBER, EMBER, AMBER, GLOW])
        style.append(f"@keyframes e{i}{{0%{{opacity:0;transform:translate(0,0)}}15%{{opacity:.9}}"
                     f"100%{{opacity:0;transform:translate({drift}px,-{rise}px)}}}}"
                     f".e{i}{{animation:e{i} {dur:.2f}s linear {delay:.2f}s infinite}}")
        body.append(f'<rect class="e{i}" x="{x}" y="{H - 8}" width="{size}" height="{size}" fill="{color}"/>')

    # wordmark: shadow, letters, bevel
    body.append(pixel_text("NERAMC", wx + s / 2, wy + s / 2, s, shadow, extra=f' opacity="{shadow_op}"'))
    body.append(pixel_text("NERAMC", wx, wy, s, letters, top))
    # blinking underscore cursor
    body.append(f'<rect class="cur" x="{num(wx + ww + s)}" y="{wy + 6 * s}" width="{4 * s}" height="{s}" fill="{EMBER}"/>')
    # subtitle
    body.append(pixel_text(sub_text, sx, wy + 7 * s + 30, ss, sub))

    # pickaxe striking the N, with sparks on impact
    body.append(f'<g class="pick">{icon("pickaxe", px, py, ps)}</g>')
    hit = (wx - 4, wy + 3 * s)
    for i, (dx, dy) in enumerate([(-34, -30), (-18, -44), (-40, 6), (-10, -22), (-26, 24)]):
        body.append(f'<rect x="{hit[0]}" y="{hit[1] + i * 4}" width="6" height="6" fill="{GLOW if i % 2 else EMBER}" '
                    f'style="--dx:{dx}px;--dy:{dy}px;animation:spark 1.8s ease-out infinite"/>')

    style.append(REDUCED)
    return svg(W, H, "NERAMC — web apps · desktop tools", "".join(body), "".join(style), defs)


# ── typing terminal ───────────────────────────────────────────────────────
def terminal() -> str:
    W, H = 900, 300
    fs, cw, lh = 18, 10.8, 30
    x0, y0 = 30, 84
    cmd_color, dim = CHALK, ASH

    lines: list[tuple[str, list[tuple[str, str]]]] = [
        ("cmd", [("whoami", cmd_color)]),
        ("out", [("neramc", EMBER_SOFT), ("  # web apps & native desktop tools", dim)]),
        ("cmd", [("ls ~/projects", cmd_color)]),
        ("out", [("linuxhub/", AMBER), ("  ", dim), ("app-deleter/", AMBER), ("  ", dim),
                 ("quill/", FOG), ("  ", dim), ("markdown-studio/", FOG), ("  ", dim),
                 ("connection-verify/", FOG)]),
        ("cmd", [("cat ~/.motto", cmd_color)]),
        ("out", [("make it fast. make it safe. then make it pretty.", BONE)]),
        ("end", []),
    ]

    style = ["@keyframes show{to{opacity:1}}", "@keyframes hide{to{opacity:0}}",
             "@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}",
             ".ln{opacity:0}",
             f"text{{font-family:{MONO};font-size:{fs}px;white-space:pre}}"]
    body = [f'<rect x="4" y="4" width="{W - 8}" height="{H - 8}" fill="{INK}"/>',
            frame(0, 0, W, H, 4, "#3b3337"),
            f'<rect x="4" y="4" width="{W - 8}" height="36" fill="{SLATE}"/>',
            f'<rect x="20" y="16" width="12" height="12" fill="{EMBER}"/>',
            f'<rect x="40" y="16" width="12" height="12" fill="{ASH}"/>',
            f'<rect x="60" y="16" width="12" height="12" fill="{STONE}"/>',
            f'<text x="{W / 2}" y="28" text-anchor="middle" fill="{FOG}" style="font-size:14px">neramc@github: ~</text>']

    t = 0.4
    for i, (kind, segs) in enumerate(lines):
        y = y0 + i * lh
        parts = []
        x = x0
        if kind in ("cmd", "end"):
            parts.append(f'<text x="{x}" y="{y}" fill="{EMBER}">$</text>')
            x += 2 * cw
        cmd_x = x
        for text, color in segs:
            parts.append(f'<text x="{num(x)}" y="{y}" fill="{color}" textLength="{num(len(text) * cw)}" '
                         f'lengthAdjust="spacing">{escape(text)}</text>')
            x += len(text) * cw
        style.append(f".l{i}{{animation:show .01s linear {t:.2f}s forwards}}")
        if kind == "cmd":
            n = len(segs[0][0])
            start, dur = t + 0.35, n * 0.085
            end = start + dur
            style.append(f"@keyframes t{i}{{to{{transform:translateX({num(n * cw)}px)}}}}"
                         f".c{i}{{animation:t{i} {dur:.2f}s steps({n}) {start:.2f}s forwards,"
                         f"hide .01s linear {end + 0.3:.2f}s forwards}}")
            parts.append(f'<g class="cv c{i}"><rect x="{num(cmd_x)}" y="{y - fs}" width="{num((n + 1) * cw + 6)}" '
                         f'height="{lh - 2}" fill="{INK}"/><rect x="{num(cmd_x)}" y="{y - fs + 2}" '
                         f'width="{num(cw - 1)}" height="{fs + 2}" fill="{EMBER}"/></g>')
            t = end + 0.45
        elif kind == "out":
            t += 0.55
        else:
            style.append(f".blinker{{animation:blink 1.1s steps(1) {t:.2f}s infinite}}")
            parts.append(f'<rect class="blinker" x="{num(cmd_x)}" y="{y - fs + 2}" width="{num(cw - 1)}" '
                         f'height="{fs + 2}" fill="{EMBER}"/>')
        body.append(f'<g class="ln l{i}">{"".join(parts)}</g>')

    style.append("@media (prefers-reduced-motion: reduce){*{animation:none!important}"
                 ".ln{opacity:1}.cv{display:none}}")
    return svg(W, H, "$ whoami → neramc · $ ls ~/projects · $ cat ~/.motto",
               "".join(body), "".join(style))


# ── inventory cards ───────────────────────────────────────────────────────
PROJECTS = [
    # slug, name, icon, active, Korean tagline, stack, release
    ("linuxhub", "LINUXHUB", "penguin", True,
     "리눅스 배포판 50여 개, 설치까지 한곳에", "Astro · TypeScript · Bun", ""),
    ("app-deleter", "APP DELETER", "trash", True,
     "찌꺼기까지 지우는 Windows 앱 삭제기", "Rust · Slint · Win32", "v2.0.0"),
    ("quill", "QUILL", "quill", False,
     "Rust 엔진으로 도는 마크다운 IDE", "Rust · Kotlin · Compose", "v1.3.0"),
    ("markdown-studio", "MARKDOWN STUDIO", "page", False,
     "브라우저 없이 그리는 마크다운 편집기", "C# · .NET 10 · Avalonia", "v2.3.1"),
    ("connection-verify", "CONNECTION VERIFY", "ticket", False,
     "서버 접속마다 번호표를 주는 플러그인", "Java · Paper", "v2.1.3"),
]


def card(name: str, icon_name: str, active: bool, tagline: str, stack: str, release: str,
         seed: int) -> str:
    W, H = 420, 124
    border = EMBER if active else STONE
    title_color = EMBER_SOFT if active else BONE
    sx, sy, ss = 18, 18, 88

    defs = (f'<clipPath id="slot"><rect x="{sx + 4}" y="{sy + 4}" width="{ss - 8}" height="{ss - 8}"/></clipPath>'
            '<filter id="dim"><feColorMatrix type="saturate" values="0.2"/></filter>')
    style = [f"text{{white-space:pre}}"]
    body = [f'<rect x="4" y="4" width="{W - 8}" height="{H - 8}" fill="{COAL}"/>',
            frame(0, 0, W, H, 4, border),
            frame(4, 4, W - 8, H - 8, 2, "#2a2124"),
            # inventory slot with inset bevel
            f'<rect x="{sx}" y="{sy}" width="{ss}" height="{ss}" fill="#241d20"/>',
            f'<path fill="#0d0a0b" d="M{sx} {sy}h{ss}v4h-{ss - 4}v{ss - 4}h-4z"/>',
            f'<path fill="#3d3438" d="M{sx + ss} {sy + ss}h-{ss}v-4h{ss - 4}v-{ss - 4}h4z"/>']
    art = icon(icon_name, sx + 4, sy + 4, 5)
    body.append(art if active else f'<g filter="url(#dim)" opacity="0.8">{art}</g>')

    if active:
        delay = (seed * 1.3) % 4
        style.append("@keyframes glint{0%{transform:translateX(0)}22%,100%{transform:translateX(175px)}}"
                     f".glint{{animation:glint 4.5s ease-in-out {delay:.1f}s infinite}}")
        body.append(f'<g clip-path="url(#slot)"><polygon class="glint" points="-22,18 -6,18 -46,106 -62,106" '
                    f'fill="#ffffff" opacity="0.35"/></g>')
        # a couple of idle sparkles on the slot corner
        style.append("@keyframes tw{0%,60%,100%{opacity:0}70%,85%{opacity:1}}"
                     ".tw1{animation:tw 2.6s steps(1) infinite}.tw2{animation:tw 2.6s steps(1) 1.3s infinite}")
        body.append(f'<rect class="tw1" x="{sx + ss - 14}" y="{sy + 8}" width="4" height="4" fill="{GLOW}"/>'
                    f'<rect class="tw2" x="{sx + 10}" y="{sy + ss - 16}" width="4" height="4" fill="{GLOW}"/>')

    tx = sx + ss + 18
    body.append(pixel_text(name, tx, 20, 2.5, title_color))
    tag = "ACTIVE" if active else "ARCHIVED"
    tag_w = text_width(tag, 1.5) + 12
    body.append(f'<rect x="{tx}" y="46" width="{num(tag_w)}" height="16" fill="{EMBER if active else "#4a4044"}"/>')
    body.append(pixel_text(tag, tx + 6, 48.75, 1.5, COAL if active else BONE))
    if release:
        body.append(f'<text x="{num(tx + tag_w + 10)}" y="59" fill="{FOG}" '
                    f'style="font-family:{MONO};font-size:13px">{escape(release)}</text>')
    body.append(f'<text x="{tx}" y="88" fill="{CHALK}" style="font-family:{SANS};font-size:14.5px">'
                f'{escape(tagline)}</text>')
    body.append(f'<text x="{tx}" y="110" fill="{ASH}" style="font-family:{MONO};font-size:12.5px">'
                f'{escape(stack)}</text>')
    style.append(REDUCED)
    return svg(W, H, f"{name.title()} — {tagline}", "".join(body), "".join(style), defs)


# ── the mine shaft: entrance, strata bands, gear panel, bedrock ───────────
# Scrolling the README is a descent: each section starts with a band of rock
# that gets darker the deeper it is, with the same ladder running down the
# shaft on the left.
SHAFT_X, SHAFT_W = 16, 56            # shaft column
RAILS = (26, 58)                      # ladder rails (x), 4px wide
WOOD, WOOD_DARK = "#9a6a3c", "#6b4826"

SECTIONS = [
    # key, English title, Korean title, depth
    ("about", "ABOUT", "소개", 12),
    ("inventory", "INVENTORY", "인벤토리", 24),
    ("gear", "GEAR", "장비", 36),
    ("workshop", "WORKSHOP", "작업실", 48),
    ("logs", "LOGS", "기록", 60),
]
STRATA = {
    False: ["#d9d0c5", "#b8aca3", "#938689", "#6a5f63", "#433a3e"],   # light mode
    True: ["#3d3438", "#332b2f", "#2a2326", "#211b1e", "#181315"],    # dark mode
}
ORES = [  # (colour, glows) by depth tier
    [("#3b3337", False), ("#c87f4a", False)],
    [("#3b3337", False), ("#c87f4a", False), ("#d8c3b0", False)],
    [("#c87f4a", False), ("#d8c3b0", False), (AMBER, False)],
    [("#d8c3b0", False), (AMBER, False), (EMBER, True)],
    [(AMBER, False), (EMBER, True), (GLOW, True)],
]


def shade(hex_color: str, amount: float) -> str:
    """Lighten (amount > 0) or darken (amount < 0) a #rrggbb colour."""
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (1, 3, 5))
    if amount >= 0:
        r, g, b = (round(c + (255 - c) * amount) for c in (r, g, b))
    else:
        r, g, b = (round(c * (1 + amount)) for c in (r, g, b))
    return f"#{r:02x}{g:02x}{b:02x}"


def is_light(hex_color: str) -> bool:
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (1, 3, 5))
    return (0.299 * r + 0.587 * g + 0.114 * b) > 140


def ladder(y0: float, y1: float, phase: float = 0) -> str:
    """Two rails and rungs every 16px; `phase` keeps rungs aligned across images."""
    h = y1 - y0
    out = [f'<rect x="{RAILS[0]}" y="{y0}" width="4" height="{h}" fill="{WOOD}"/>',
           f'<rect x="{RAILS[1]}" y="{y0}" width="4" height="{h}" fill="{WOOD}"/>']
    y = y0 + ((8 - phase) % 16)
    while y + 4 <= y1:
        out.append(f'<rect x="{RAILS[0] + 4}" y="{num(y)}" width="{RAILS[1] - RAILS[0] - 4}" height="4" fill="{WOOD}"/>'
                   f'<rect x="{RAILS[0] + 4}" y="{num(y + 4)}" width="{RAILS[1] - RAILS[0] - 4}" height="2" fill="{WOOD_DARK}"/>')
        y += 16
    return "".join(out)


def rock(rnd: random.Random, W: int, H: int, base: str, avoid: list[tuple[float, float]],
         ores: list[tuple[str, bool]], ore_count: int, style: list[str]) -> str:
    """Strata texture: veins, speckles and ore clusters, kept off `avoid` x-ranges."""
    out = [f'<rect width="{W}" height="{H}" fill="{base}"/>',
           f'<rect width="{W}" height="2" fill="{shade(base, 0.12)}"/>',
           f'<rect y="{H - 4}" width="{W}" height="4" fill="{shade(base, -0.18)}"/>']

    def free(x: float, w: float) -> bool:
        return all(x + w < a or x > b for a, b in avoid)

    # two wavy veins
    for k, amount in enumerate((-0.12, 0.08)):
        y = rnd.choice([16, 24, 40, 48]) + k * 8
        d = ""
        for x in range(SHAFT_X + SHAFT_W, W, 32):
            y = max(6, min(H - 10, y + rnd.choice([-4, 0, 0, 4])))
            d += f"M{x} {y}h32v4h-32z"
        out.append(f'<path fill="{shade(base, amount)}" d="{d}"/>')
    # speckles on an 8px grid
    for _ in range(46):
        x = rnd.randrange(SHAFT_X + SHAFT_W, W - 8, 4)
        y = rnd.randrange(4, H - 8, 4)
        w = rnd.choice([4, 4, 8])
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="4" fill="{shade(base, rnd.choice([-0.1, 0.07]))}"/>')
    # ore clusters
    for i in range(ore_count):
        for _ in range(40):
            x = rnd.randrange(SHAFT_X + SHAFT_W + 8, W - 24, 6)
            if free(x - 6, 30):
                break
        y = rnd.randrange(8, H - 20, 6)
        color, glows = rnd.choice(ores)
        cells = [(0, 0), (6, 0), (0, 6), (6, 6), (12, 6), (6, 12)]
        rnd.shuffle(cells)
        cls = f' class="g{i % 3}"' if glows else ""
        d = "".join(f"M{x + cx} {y + cy}h6v6h-6z" for cx, cy in cells[:rnd.randint(3, 5)])
        out.append(f'<path fill="{shade(color, -0.35)}" d="{d}" transform="translate(1 1)"/>'
                   f'<path{cls} fill="{color}" d="{d}"/>')
    style.append("@keyframes glow{0%,100%{opacity:1}50%{opacity:.45}}"
                 ".g0{animation:glow 2.8s ease-in-out infinite}.g1{animation:glow 3.4s ease-in-out .7s infinite}"
                 ".g2{animation:glow 4.1s ease-in-out 1.6s infinite}")
    return "".join(out)


def shaft(base: str, H: int) -> str:
    return (f'<rect x="{SHAFT_X}" y="0" width="{SHAFT_W}" height="{H}" fill="{shade(base, -0.45)}"/>'
            f'<rect x="{SHAFT_X}" y="0" width="4" height="{H}" fill="{shade(base, -0.6)}"/>'
            f'<rect x="{SHAFT_X + SHAFT_W - 4}" y="0" width="4" height="{H}" fill="{shade(base, -0.25)}"/>')


def band(index: int, key: str, title: str, title_ko: str, depth: int, dark: bool) -> str:
    W, H = 900, 72
    rnd = random.Random(f"{key}-{dark}")
    base = STRATA[dark][index]
    light = is_light(base)
    ink = "#2e2629" if light else "#f1ebe6"
    sub = "#4a4044" if light else "#c9c1bd"
    accent = "#9a3412" if light else "#ff9a63"

    ts = 4
    tx, ty = SHAFT_X + SHAFT_W + 24, (H - 7 * ts) / 2
    tw = text_width(title, ts)
    label = f"-{depth}M"
    ls = 3
    lw = text_width(label, ls)
    lx = W - 24 - lw
    ko_x = tx + tw + 16
    ko_w = len(title_ko) * 19
    style: list[str] = []
    body = [rock(rnd, W, H, base, [(tx - 12, ko_x + ko_w + 12), (lx - 36, W)], ORES[index], 4 + index, style),
            shaft(base, H), ladder(0, H)]
    body.append(pixel_text(title, tx + 3, ty + 3, ts, shade(base, -0.4)))
    body.append(pixel_text(title, tx, ty, ts, ink))
    body.append(f'<text x="{num(ko_x)}" y="{num(H / 2 + 6)}" fill="{sub}" '
                f'style="font-family:{SANS};font-size:17px;font-weight:700">{escape(title_ko)}</text>')
    # depth meter: a small down arrow and the depth
    ax, ay = lx - 22, H / 2 - 5
    body.append(f'<path fill="{accent}" d="M{ax} {ay}h12v3h-12zM{ax + 3} {ay + 3}h6v3h-6zM{ax + 5} {ay + 6}h2v3h-2z"/>')
    body.append(pixel_text(label, lx, (H - 7 * ls) / 2, ls, accent))
    style.append(REDUCED)
    return svg(W, H, f"-{depth}m · {title_ko} ({title.title()})", "".join(body), "".join(style))


def entrance(dark: bool) -> str:
    """The ground surface with the top of the ladder sticking out of the shaft."""
    W, H = 900, 64
    rnd = random.Random(f"entrance-{dark}")
    soil = STRATA[dark][0]
    grass = "#7d8c5a" if not dark else "#4a5638"
    text = "#7a7074" if not dark else ASH
    gy = 36                                       # ground line
    body = [f'<rect y="{gy}" width="{W}" height="{H - gy}" fill="{soil}"/>']
    # ragged grass edge on an 8px grid
    d = ""
    for x in range(0, W, 8):
        if SHAFT_X <= x < SHAFT_X + SHAFT_W:
            continue
        h = rnd.choice([4, 4, 8, 8, 12])
        d += f"M{x} {gy - (h - 4)}h8v{h}h-8z"
    body.append(f'<path fill="{grass}" d="{d}"/>')
    body.append(f'<rect y="{gy + 8}" width="{W}" height="4" fill="{shade(soil, -0.1)}"/>')
    body.append(f'<rect x="{SHAFT_X}" y="{gy}" width="{SHAFT_W}" height="{H - gy}" fill="{shade(soil, -0.45)}"/>')
    body.append(ladder(gy - 28, H, phase=(gy - 28) % 16))
    msg = "SCROLL DOWN"
    mx = SHAFT_X + SHAFT_W + 24
    body.append(pixel_text(msg, mx, 10, 2, text))
    body.append(f'<text x="{num(mx + text_width(msg, 2) + 14)}" y="22" fill="{text}" '
                f'style="font-family:{SANS};font-size:14px">아래로 내려갈수록 깊어집니다</text>')
    style = ("@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}"
             ".arrow{animation:bob 1.2s steps(2) infinite}" + REDUCED)
    ax = W - 40
    body.append(f'<path class="arrow" fill="{EMBER}" d="M{ax} 8h16v4h-16zM{ax + 4} 12h8v4h-8zM{ax + 6} 16h4v4h-4z"/>')
    return svg(W, H, "아래로 내려갈수록 깊어집니다", "".join(body), style)


GEAR = [
    ("언어", "Languages", EMBER, ["RUST", "TYPESCRIPT", "C#", "KOTLIN", "JAVA"]),
    ("프레임워크", "Frameworks", AMBER, ["REMIX", "ASTRO", ".NET", "AVALONIA", "SLINT", "COMPOSE MULTIPLATFORM"]),
    ("도구", "Tools", "#8a8186", ["BUN", "VITE", "GRADLE", "MAVEN", "GITHUB ACTIONS", "VERCEL", "PLAYWRIGHT"]),
    ("라이브러리", "Libraries", "#5b8fd6", ["RAYON", "ROPEY", "MARKDIG", "SKIASHARP", "TEXTMATESHARP", "NITRO", "PAPER API"]),
]


def gear_panel() -> str:
    W = 900
    s = 2
    chip_h = 7 * s + 16
    pad_x, label_w = 24, 150
    x0 = pad_x + label_w
    rows: list[tuple[int, str]] = []          # (y, svg)
    y = 28
    body: list[str] = []
    for label, label_en, color, items in GEAR:
        body.append(f'<text x="{pad_x}" y="{y + 19}" fill="{CHALK}" '
                    f'style="font-family:{SANS};font-size:16px;font-weight:700">{escape(label)}</text>')
        body.append(f'<text x="{pad_x}" y="{y + 38}" fill="{ASH}" '
                    f'style="font-family:{MONO};font-size:12px">{escape(label_en)}</text>')
        x = x0
        for item in items:
            w = text_width(item, s) + 20
            if x + w > W - pad_x:
                x = x0
                y += chip_h + 12
            body.append(f'<rect x="{num(x)}" y="{y}" width="{num(w)}" height="{chip_h}" fill="{SLATE}"/>')
            body.append(frame(x - 3, y - 3, w + 6, chip_h + 6, 3, color))
            body.append(f'<rect x="{num(x)}" y="{y + chip_h - 3}" width="{num(w)}" height="3" fill="{shade(SLATE, -0.3)}"/>')
            body.append(pixel_text(item, x + 10, y + 8, s, CHALK))
            x += w + 16
        y += chip_h + 30
    H = y
    out = [f'<rect x="4" y="4" width="{W - 8}" height="{H - 8}" fill="{COAL}"/>', frame(0, 0, W, H, 4, "#3b3337")]
    alt = " · ".join(f"{label}: {', '.join(items)}" for label, _, _, items in GEAR)
    return svg(W, H, alt, "".join(out + body), REDUCED)


# ── pictures that replace long README prose ───────────────────────────────
def panel(W: int, H: int) -> list[str]:
    return [f'<rect x="4" y="4" width="{W - 8}" height="{H - 8}" fill="{COAL}"/>', frame(0, 0, W, H, 4, "#3b3337")]


def slot(x: float, y: float, size: float, icon_name: str, dim: bool = False) -> str:
    inner = size - 8
    scale = inner / 16
    art = icon(icon_name, x + 4, y + 4, scale)
    if dim:
        art = f'<g opacity="0.22" filter="url(#gray)">{art}</g>'
    return (f'<rect x="{num(x)}" y="{num(y)}" width="{size}" height="{size}" fill="#241d20"/>'
            f'<path fill="#0d0a0b" d="M{num(x)} {num(y)}h{size}v4h-{size - 4}v{size - 4}h-4z"/>'
            f'<path fill="#3d3438" d="M{num(x + size)} {num(y + size)}h-{size}v-4h{size - 4}v-{size - 4}h4z"/>'
            + art)


def label(x: float, y: float, text: str, size: float = 15, color: str = BONE, anchor: str = "start",
          weight: int = 700) -> str:
    return (f'<text x="{num(x)}" y="{num(y)}" fill="{color}" text-anchor="{anchor}" '
            f'style="font-family:{SANS};font-size:{size}px;font-weight:{weight}">{escape(text)}</text>')


def chip(x: float, y: float, text: str, color: str, scale: float = 1.5, fill: str = SLATE) -> tuple[str, float]:
    h = 7 * scale + 12
    w = text_width(text, scale) + 16
    out = (f'<rect x="{num(x)}" y="{num(y)}" width="{num(w)}" height="{num(h)}" fill="{fill}"/>'
           + frame(x - 3, y - 3, w + 6, h + 6, 3, color)
           + pixel_text(text, x + 8, y + 6, scale, CHALK))
    return out, w


ABOUT_ROWS = [
    ("만드는 것", [
        ("globe", None, "웹 사이트"),
        ("window", None, "Windows 앱"),
        ("monitor", None, "데스크톱 편집기"),
        ("server", None, "게임 서버 플러그인"),
    ]),
    ("일하는 방식", [
        ("stopwatch", "52MS", "숫자로 확인"),
        ("shield", "SAFE", "되돌릴 수 있게"),
        ("checklist", "CI", "빌드가 검증"),
        ("cog", "AUTO", "반복은 자동화"),
    ]),
]


def about_panel() -> str:
    W = 900
    col_w = (W - 48) / 4
    body: list[str] = []
    y = 28
    for row_label, tiles in ABOUT_ROWS:
        body.append(label(28, y + 14, row_label, 15, ASH))
        y += 30
        for i, (ic, token, caption) in enumerate(tiles):
            cx = 24 + col_w * i + col_w / 2
            body.append(slot(cx - 44, y, 88, ic))
            ty = y + 104
            if token:
                tw = text_width(token, 2)
                body.append(pixel_text(token, cx - tw / 2, ty, 2, EMBER_SOFT))
                ty += 26
            body.append(label(cx, ty + 12, caption, 15, CHALK, "middle"))
        y += 104 + (26 if any(t[1] for t in tiles) else 0) + 40
    H = int(y)
    alt = "만드는 것: 웹 사이트, Windows 앱, 데스크톱 편집기, 게임 서버 플러그인 · 일하는 방식: 숫자로 확인, 되돌릴 수 있게, 빌드가 검증, 반복은 자동화"
    return svg(W, H, alt, "".join(panel(W, H) + body), REDUCED)


CHART = [
    # icon, name, active, platforms(web, desktop, server), metrics, release
    ("penguin", "LINUXHUB", True, (1, 0, 0), ["50 DISTROS", "6H SYNC", "2 LANGS"], ""),
    ("trash", "APP DELETER", True, (0, 1, 0), ["WIN 11", "1 EXE", ".REG BACKUP"], "V2.0.0"),
    ("quill", "QUILL", False, (0, 1, 0), ["8 DIALECTS", "14 CHECKS", "7 EXPORTS"], "V1.3.0"),
    ("page", "MARKDOWN STUDIO", False, (0, 1, 0), ["52MS", "7 LANGS", "3 OS"], "V2.3.1"),
    ("ticket", "CONNECTION VERIFY", False, (0, 0, 1), ["5 EDITIONS", "TXT JSON", "2 LANGS"], "V2.1.3"),
]


def project_chart() -> str:
    W = 900
    row_h = 84
    head = 52
    x_plat, x_metric = 404, 538
    body = [label(28, 34, "프로젝트", 13, ASH, weight=400),
            label(x_plat, 34, "플랫폼", 13, ASH, weight=400),
            label(x_metric, 34, "숫자로 보기", 13, ASH, weight=400)]
    for i, (ic, name, active, plats, metrics, release) in enumerate(CHART):
        y = head + i * row_h
        if i:
            body.append(f'<rect x="24" y="{y - 2}" width="{W - 48}" height="2" fill="#2a2124"/>')
        body.append(slot(24, y + 10, 64, ic, dim=False))
        body.append(pixel_text(name, 104, y + 18, 2.2, EMBER_SOFT if active else CHALK))
        tag = "ACTIVE" if active else "ARCHIVED"
        tw = text_width(tag, 1.2) + 10
        body.append(f'<rect x="104" y="{y + 44}" width="{num(tw)}" height="14" fill="{EMBER if active else "#4a4044"}"/>')
        body.append(pixel_text(tag, 109, y + 46.8, 1.2, COAL if active else BONE))
        if release:
            body.append(pixel_text(release, 104 + tw + 10, y + 46.8, 1.2, FOG))
        for k, (pic, on) in enumerate(zip(("globe", "monitor", "server"), plats)):
            body.append(slot(x_plat + k * 40, y + 22, 36, pic, dim=not on))
        x = x_metric
        for metric in metrics:
            out, w = chip(x, y + 26, metric, EMBER if active else STONE)
            assert x + w <= W - 24, (name, metric)
            body.append(out)
            x += w + 14
    H = head + len(CHART) * row_h + 12
    defs = '<filter id="gray"><feColorMatrix type="saturate" values="0"/></filter>'
    alt = " · ".join(f"{name.title()}: {', '.join(m.lower() for m in metrics)}" for _, name, _, _, metrics, _ in CHART)
    return svg(W, H, alt, "".join(panel(W, H) + body), REDUCED, defs)


PIPELINE = [
    ("그림", [("icon", "terminal", "PYTHON"), ("icon", "picture", "SVG"), ("icon", "page", "README"),
              ("icon", "globe", "SITE")]),
    ("웹 사이트", [("chip", None, "REMIX 3"), ("chip", None, "VITE"), ("chip", None, "NITRO"),
                 ("chip", None, "VERCEL"), ("icon", "globe", "LIVE")]),
    ("기여 뱀", [("icon", "cog", "DAILY"), ("chip", None, "ACTIONS"), ("icon", "snake", "SNAKE"),
               ("chip", None, "OUTPUT")]),
]


def arrow(x0: float, x1: float, y: float, color: str = STONE) -> str:
    return (f'<rect x="{num(x0)}" y="{num(y - 2)}" width="{num(x1 - x0 - 8)}" height="4" fill="{color}"/>'
            f'<path fill="{color}" d="M{num(x1 - 10)} {num(y - 8)}h4v16h-4zM{num(x1 - 6)} {num(y - 5)}h3v10h-3zM{num(x1 - 3)} {num(y - 2)}h3v4h-3z"/>')


def pipeline() -> str:
    W = 900
    lane_h = 104
    x0 = 150
    body: list[str] = []
    style = ["@keyframes flow{0%{transform:translateX(0);opacity:0}15%,85%{opacity:1}100%{transform:translateX(var(--d));opacity:0}}"]
    for li, (lane, nodes) in enumerate(PIPELINE):
        y = 24 + li * lane_h
        cy = y + 30
        body.append(label(28, cy + 6, lane, 15, CHALK))
        # measure nodes
        widths = []
        for kind, ic, text in nodes:
            widths.append(56 if kind == "icon" else text_width(text, 1.8) + 18)
        gap = (W - 28 - x0 - sum(widths)) / (len(nodes) - 1)
        x = x0
        centers = []
        for (kind, ic, text), w in zip(nodes, widths):
            if kind == "icon":
                body.append(slot(x, cy - 28, 56, ic))
                tw = text_width(text, 1.2)
                body.append(pixel_text(text, x + 28 - tw / 2, cy + 36, 1.2, FOG))
            else:
                h = 7 * 1.8 + 14
                body.append(f'<rect x="{num(x)}" y="{num(cy - h / 2)}" width="{num(w)}" height="{num(h)}" fill="{SLATE}"/>')
                body.append(frame(x - 3, cy - h / 2 - 3, w + 6, h + 6, 3, EMBER if li == 1 else STONE))
                body.append(pixel_text(text, x + 9, cy - 7 * 1.8 / 2, 1.8, CHALK))
            centers.append((x, x + w))
            x += w + gap
        for (a0, a1), (b0, _), (_, _, text) in zip(centers, centers[1:], nodes[1:]):
            if li == 0 and text == "SITE":   # the same pixel data also feeds the site
                mid = (a1 + b0) / 2
                body.append(f'<path fill="{STONE}" d="M{num(mid - 2)} {num(cy - 10)}h4v20h-4zM{num(mid - 10)} {num(cy - 2)}h20v4h-20z"/>')
            else:
                body.append(arrow(a1 + 8, b0 - 6, cy))
        # a pixel travelling along the lane
        span = centers[-1][0] - centers[0][1]
        style.append(f".f{li}{{--d:{num(span)}px;animation:flow {3 + li * 0.6:.1f}s linear {li * 0.8:.1f}s infinite}}")
        body.append(f'<rect class="f{li}" x="{num(centers[0][1])}" y="{num(cy - 3)}" width="6" height="6" fill="{GLOW}"/>')
    H = 24 + len(PIPELINE) * lane_h
    style.append(REDUCED)
    alt = ("그림: Python 스크립트 → SVG → README와 사이트 · 웹 사이트: Remix 3 → Vite → Nitro → Vercel → 배포 · "
           "기여 뱀: 매일 → GitHub Actions → 뱀 애니메이션 → output 브랜치")
    return svg(W, H, alt, "".join(panel(W, H) + body), "".join(style))


# ── player card: avatar + one-line intro, under the header ────────────────
AVATAR = ASSETS / "avatar.png"   # a copy of the GitHub avatar; replace the file to update it


def player_card() -> str:
    import base64

    W, H = 900, 216
    rnd = random.Random("player")
    body = panel(W, H)
    style = ["@keyframes rise{0%{opacity:0;transform:translate(0,0)}20%{opacity:.9}"
             "100%{opacity:0;transform:translate(var(--dx),-70px)}}",
             "@keyframes tw{0%,60%,100%{opacity:0}70%,85%{opacity:1}}",
             ".tw1{animation:tw 2.6s steps(1) infinite}.tw2{animation:tw 2.6s steps(1) 1.3s infinite}"]

    # avatar in an inventory slot
    sx, sy, ss = 28, 24, 168
    body.append(f'<rect x="{sx}" y="{sy}" width="{ss}" height="{ss}" fill="#241d20"/>'
                f'<path fill="#0d0a0b" d="M{sx} {sy}h{ss}v6h-{ss - 6}v{ss - 6}h-6z"/>'
                f'<path fill="#3d3438" d="M{sx + ss} {sy + ss}h-{ss}v-6h{ss - 6}v-{ss - 6}h6z"/>')
    if AVATAR.exists():
        data = base64.b64encode(AVATAR.read_bytes()).decode()
        body.append(f'<image x="{sx + 12}" y="{sy + 12}" width="{ss - 24}" height="{ss - 24}" '
                    f'style="image-rendering:pixelated" href="data:image/png;base64,{data}"/>')
    body.append(f'<rect class="tw1" x="{sx + ss - 18}" y="{sy + 12}" width="5" height="5" fill="{GLOW}"/>'
                f'<rect class="tw2" x="{sx + 14}" y="{sy + ss - 20}" width="5" height="5" fill="{GLOW}"/>')

    # name plate and the intro
    tx = sx + ss + 32
    body.append(pixel_text("NERAMC", tx, 34, 3, EMBER_SOFT))
    tag = "PLAYER 1"
    tw = text_width(tag, 1.5) + 12
    nx = tx + text_width("NERAMC", 3) + 14
    body.append(f'<rect x="{num(nx)}" y="36" width="{num(tw)}" height="16" fill="{EMBER}"/>')
    body.append(pixel_text(tag, nx + 6, 38.75, 1.5, COAL))
    body.append(label(tx, 94, "웹과 데스크톱 앱을 만듭니다.", 27, CHALK, weight=800))
    body.append(label(tx, 122, "I build web apps and native desktop tools.", 15, FOG, weight=400))
    body.append(f'<text x="{tx}" y="150" fill="{EMBER_SOFT}" '
                f'style="font-family:{MONO};font-size:14px">“빠르게, 안전하게, 그다음에 예쁘게.”</text>')

    # inventory count (5 public projects: 2 active, 3 archived)
    x = tx
    for ic, text, color in (("pickaxe", "ITEMS 5", BONE), ("penguin", "ACTIVE 2", EMBER_SOFT),
                            ("quill", "ARCHIVED 3", FOG)):
        body.append(icon(ic, x, 166, 1.5))
        body.append(pixel_text(text, x + 30, 171, 1.5, color))
        x += 30 + text_width(text, 1.5) + 28

    # a few embers drifting up on the right
    for i in range(9):
        ex = rnd.randrange(W - 260, W - 30, 4)
        ey = rnd.randrange(120, H - 20, 4)
        dur = rnd.uniform(3.2, 6.0)
        style.append(f".e{i}{{--dx:{rnd.randint(-16, 16)}px;animation:rise {dur:.1f}s linear -{rnd.uniform(0, dur):.1f}s infinite}}")
        body.append(f'<rect class="e{i}" x="{ex}" y="{ey}" width="{rnd.choice([4, 6])}" height="{rnd.choice([4, 6])}" '
                    f'fill="{rnd.choice([EMBER, AMBER, GLOW])}" opacity="0"/>')
    style.append(REDUCED)
    return svg(W, H, "neramc — 웹과 데스크톱 앱을 만듭니다. I build web apps and native desktop tools.",
               "".join(body), "".join(style))


BUTTONS = [
    ("portfolio", "웹 포트폴리오", "globe", True),
    ("inventory", "인벤토리", "pickaxe", False),
    ("workshop", "작업실", "cog", False),
]


def button(text: str, icon_name: str, primary: bool) -> str:
    h = 48
    w = 64 + len(text) * 16 + 24
    fill = EMBER if primary else SLATE
    ink = COAL if primary else CHALK
    edge = COAL if primary else "#5a5155"
    body = [f'<rect x="4" y="4" width="{w - 8}" height="{h - 8}" fill="{fill}"/>',
            frame(0, 0, w, h, 4, edge),
            f'<rect x="4" y="{h - 10}" width="{w - 8}" height="6" fill="{shade(fill, -0.25)}"/>',
            icon(icon_name, 16, 10, 1.5),
            label(48, 30, text, 16, ink, weight=800)]
    return svg(w, h, text, "".join(body))


def bedrock() -> str:
    """The bottom of the shaft, with the thank-you line."""
    W, H = 900, 132
    rnd = random.Random("bedrock")
    body = [f'<rect width="{W}" height="{H}" fill="#0d0a0b"/>']
    for _ in range(170):
        x = rnd.randrange(0, W, 8)
        y = rnd.randrange(0, H, 8)
        body.append(f'<rect x="{x}" y="{y}" width="{rnd.choice([8, 16])}" height="8" '
                    f'fill="{rnd.choice(["#1b1517", "#2e2629", "#161113", "#3b3337"])}"/>')
    style = ["@keyframes glow{0%,100%{opacity:1}50%{opacity:.35}}",
             ".v{animation:glow 3s ease-in-out infinite}.v2{animation:glow 3s ease-in-out 1.5s infinite}"]
    for i in range(7):  # ember veins
        x = rnd.randrange(SHAFT_X + SHAFT_W + 16, W - 40, 4)
        y = rnd.choice([8, 100, 112])
        d = "".join(f"M{x + k * 4} {y + rnd.choice([0, 4])}h4v4h-4z" for k in range(rnd.randint(3, 7)))
        body.append(f'<path class="{"v" if i % 2 else "v2"}" fill="{EMBER}" d="{d}"/>')
    body.append(f'<rect x="{SHAFT_X}" y="0" width="{SHAFT_W}" height="44" fill="#050404"/>')
    body.append(ladder(0, 40))
    body.append(f'<rect x="{SHAFT_X - 4}" y="40" width="{SHAFT_W + 8}" height="6" fill="#2e2629"/>')
    body.append(pixel_text("-64M BEDROCK", SHAFT_X + SHAFT_W + 24, 22, 2, "#6e6468"))

    s = 3
    main, xp = "THANKS FOR VISITING!", "+1 XP"
    total = text_width(main, s) + 24 + text_width(xp, s)
    x = (W - total) / 2
    body.append(pixel_text(main, x, 62, s, BONE))
    body.append(f'<g class="xp">{pixel_text(xp, x + text_width(main, s) + 24, 62, s, EMBER)}</g>')
    style.append("@keyframes xp{0%{opacity:0;transform:translateY(10px)}20%,70%{opacity:1;transform:translateY(0)}"
                 "100%{opacity:0;transform:translateY(-14px)}}.xp{animation:xp 2.4s ease-out infinite}")
    style.append(REDUCED)
    return svg(W, H, "-64m 기반암 · Thanks for visiting! +1 XP", "".join(body), "".join(style))


# ── portfolio site exports ────────────────────────────────────────────────
PORTFOLIO = ROOT / "portfolio"


def pixel_art_module() -> str:
    """The font and icons as a TypeScript module for the Remix site."""
    import json

    font = ",\n".join(f"  {json.dumps(ch, ensure_ascii=False)}: {json.dumps(rows)}"
                      for ch, rows in FONT.items())
    icons = ",\n".join(
        f"  {json.dumps(name)}: {{\n    rows: {json.dumps(rows)},\n    palette: {json.dumps(pal)},\n  }}"
        for name, (rows, pal) in ICONS.items())
    return ("// Generated by scripts/build_assets.py from the same data as the README art.\n"
            "// Edit the Python data and re-run it instead of editing this file.\n\n"
            "export interface PixelArt {\n  rows: readonly string[]\n  palette: Readonly<Record<string, string>>\n}\n\n"
            f"export const FONT: Readonly<Record<string, readonly string[]>> = {{\n{font},\n}}\n\n"
            f"export const ICONS = {{\n{icons},\n}} satisfies Record<string, PixelArt>\n\n"
            "export type IconName = keyof typeof ICONS\n")


def favicon() -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">'
            f'<rect width="16" height="16" fill="{COAL}"/>{icon("pickaxe", 0, 1, 1)}</svg>\n')


def main() -> None:
    (ASSETS / "cards").mkdir(parents=True, exist_ok=True)
    (ASSETS / "shaft").mkdir(parents=True, exist_ok=True)
    (ASSETS / "buttons").mkdir(parents=True, exist_ok=True)
    out = {
        "header-light.svg": header(dark=False),
        "header-dark.svg": header(dark=True),
        "terminal.svg": terminal(),
        "gear.svg": gear_panel(),
        "about.svg": about_panel(),
        "player.svg": player_card(),
        "projects.svg": project_chart(),
        "pipeline.svg": pipeline(),
        "shaft/entrance-light.svg": entrance(dark=False),
        "shaft/entrance-dark.svg": entrance(dark=True),
        "shaft/bedrock.svg": bedrock(),
    }
    for key, text, ic, primary in BUTTONS:
        out[f"buttons/{key}.svg"] = button(text, ic, primary)
    for i, (key, title, title_ko, depth) in enumerate(SECTIONS):
        for dark in (False, True):
            mode = "dark" if dark else "light"
            out[f"shaft/{i + 1}-{key}-{mode}.svg"] = band(i, key, title, title_ko, depth, dark)
    for i, (slug, name, ic, active, tagline, stack, release) in enumerate(PROJECTS):
        out[f"cards/{slug}.svg"] = card(name, ic, active, tagline, stack, release, i)
    for rel, content in out.items():
        (ASSETS / rel).write_text(content, encoding="utf-8")
        print(f"wrote assets/{rel} ({len(content):,} bytes)")

    if PORTFOLIO.is_dir():
        site = {
            "app/ui/pixel-art.ts": pixel_art_module(),
            "public/favicon.svg": favicon(),
        }
        for rel, content in site.items():
            (PORTFOLIO / rel).write_text(content, encoding="utf-8")
            print(f"wrote portfolio/{rel} ({len(content):,} bytes)")


if __name__ == "__main__":
    main()
