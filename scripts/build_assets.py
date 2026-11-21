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


# ── footer ────────────────────────────────────────────────────────────────
def footer() -> str:
    W, H = 900, 90
    s = 3
    main, xp = "THANKS FOR VISITING!", "+1 XP"
    total = text_width(main, s) + 24 + text_width(xp, s)
    x = (W - total) / 2
    y = 44
    style = ("@keyframes xp{0%{opacity:0;transform:translateY(10px)}20%,70%{opacity:1;transform:translateY(0)}"
             "100%{opacity:0;transform:translateY(-14px)}}.xp{animation:xp 2.4s ease-out infinite}" + REDUCED)
    body = (pixel_text(main, x, y, s, ASH)
            + f'<g class="xp">{pixel_text(xp, x + text_width(main, s) + 24, y, s, EMBER)}</g>')
    return svg(W, H, "Thanks for visiting! +1 XP", body, style)


def main() -> None:
    (ASSETS / "cards").mkdir(parents=True, exist_ok=True)
    out = {
        "header-light.svg": header(dark=False),
        "header-dark.svg": header(dark=True),
        "terminal.svg": terminal(),
        "footer.svg": footer(),
    }
    for i, (slug, name, ic, active, tagline, stack, release) in enumerate(PROJECTS):
        out[f"cards/{slug}.svg"] = card(name, ic, active, tagline, stack, release, i)
    for rel, content in out.items():
        (ASSETS / rel).write_text(content, encoding="utf-8")
        print(f"wrote assets/{rel} ({len(content):,} bytes)")


if __name__ == "__main__":
    main()
