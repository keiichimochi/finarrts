from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "fainalfantasyrts.neofami" / "assets"
GENERATED = ROOT / "generated_assets"

NES = {
    "black": "#000000",
    "navy": "#002E98",
    "blue": "#0064F4",
    "sky": "#4AA5FF",
    "cyan": "#2BC9D0",
    "white": "#FFFFFF",
    "silver": "#ABABAB",
    "dark_silver": "#4B4B4B",
    "gold": "#F8D6A8",
    "yellow": "#E2E095",
    "green": "#359000",
    "light_green": "#7BD200",
    "red": "#CF231C",
    "ruby": "#FF52C5",
    "purple": "#B362FF",
    "lavender": "#CCD2FF",
    "stone": "#626262",
    "dark_stone": "#3B3600",
}


def rect(d, xy, c):
    d.rectangle(xy, fill=NES[c])


def line(d, xy, c):
    d.line(xy, fill=NES[c])


def tri(d, pts, c):
    d.polygon(pts, fill=NES[c])


def unit_sheet():
    img = Image.new("RGBA", (96, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    x = 0
    rect(d, (x + 3, 4, x + 12, 14), "blue")
    rect(d, (x + 5, 1, x + 12, 5), "gold")
    line(d, (x + 12, 8, x + 20, 4), "white")
    rect(d, (x + 1, 12, x + 6, 15), "navy")

    x = 16
    rect(d, (x + 4, 3, x + 13, 15), "blue")
    rect(d, (x + 5, 0, x + 13, 5), "gold")
    rect(d, (x + 11, 5, x + 16, 14), "gold")
    line(d, (x + 15, 6, x + 15, 13), "white")

    x = 32
    rect(d, (x + 5, 2, x + 11, 14), "white")
    rect(d, (x + 3, 6, x + 13, 15), "lavender")
    rect(d, (x + 6, 0, x + 11, 4), "gold")
    line(d, (x + 13, 1, x + 13, 15), "gold")
    rect(d, (x + 12, 0, x + 15, 3), "cyan")

    x = 48
    rect(d, (x + 4, 5, x + 14, 13), "green")
    rect(d, (x + 6, 2, x + 13, 7), "light_green")
    rect(d, (x + 2, 8, x + 6, 11), "gold")
    line(d, (x + 1, 6, x + 9, 0), "white")

    x = 64
    rect(d, (x + 5, 4, x + 13, 15), "purple")
    tri(d, [(x + 2, 5), (x + 9, 0), (x + 16, 5)], "purple")
    rect(d, (x + 7, 7, x + 9, 9), "yellow")
    line(d, (x + 2, 5, x - 1, 1), "gold")

    x = 80
    rect(d, (x + 5, 5, x + 12, 15), "blue")
    tri(d, [(x + 2, 6), (x + 8, 0), (x + 15, 6)], "yellow")
    line(d, (x + 13, 7, x + 16, 3), "white")

    img.save(OUT / "sprites" / "units.png")


def nearest_nes_color(rgb):
    colors = []
    for value in NES.values():
        value = value.lstrip("#")
        colors.append(tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)))
    return min(colors, key=lambda c: sum((rgb[i] - c[i]) ** 2 for i in range(3)))


def quantize_to_nes(img):
    src = img.convert("RGBA")
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    pixels = []
    for r, g, b, a in src.getdata():
        if a < 16:
            pixels.append((0, 0, 0, 0))
        else:
            nr, ng, nb = nearest_nes_color((r, g, b))
            pixels.append((nr, ng, nb, a))
    out.putdata(pixels)
    return out


def generated_pixel_assets():
    GENERATED.mkdir(exist_ok=True)
    src_sheet = Path("/Users/k/.codex/generated_images/019e7b75-da98-7b70-9ba3-2d9fa09770b3/ig_0754cc81e117ec49016a1b886615c481919afe0f3d783e6dfe.png")
    src_screen = Path("/Users/k/.codex/generated_images/019e7b75-da98-7b70-9ba3-2d9fa09770b3/ig_0754cc81e117ec49016a1b88a0e6a481919cdf5a361488104f.png")
    if not src_sheet.exists() or not src_screen.exists():
        return

    sheet = Image.open(src_sheet).convert("RGBA")
    key = (255, 0, 255)
    transparent = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    out_px = []
    for r, g, b, a in sheet.getdata():
        if abs(r - key[0]) < 28 and abs(g - key[1]) < 28 and abs(b - key[2]) < 28:
            out_px.append((0, 0, 0, 0))
        else:
            out_px.append((r, g, b, a))
    transparent.putdata(out_px)
    transparent.save(GENERATED / "sprite_sheet_hd_transparent.png")
    transparent.save(OUT / "sprites" / "units_hd.png")

    # Manual crop windows from the generated sheet, then reduce to runtime-sized
    # 16x16 sprites. The HD sheet remains available for richer previews.
    crops = [
        (82, 101, 290, 323),    # warrior
        (370, 90, 608, 323),    # knight
        (664, 104, 889, 330),   # white mage
        (1011, 130, 1192, 323), # goblin
        (1271, 134, 1456, 323), # goblin alt
        (78, 447, 275, 669),    # magician
        (687, 429, 898, 653),   # flag
        (1075, 484, 1305, 674), # cursor
        (152, 800, 240, 922),   # heal particle
        (1230, 813, 1422, 941), # spell orb
    ]
    runtime = Image.new("RGBA", (160, 32), (0, 0, 0, 0))
    preview = Image.new("RGBA", (320, 64), (0, 0, 0, 0))
    for i, box in enumerate(crops):
        crop = transparent.crop(box)
        crop.thumbnail((30, 30), Image.Resampling.LANCZOS)
        tile = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        tile.alpha_composite(crop, ((32 - crop.width) // 2, 32 - crop.height))
        preview.alpha_composite(tile, (i * 32, 16 if i >= 6 else 0))
        small = tile.resize((16, 16), Image.Resampling.LANCZOS)
        runtime.alpha_composite(quantize_to_nes(small), (i * 16, 0))
    runtime.save(OUT / "sprites" / "units.png")
    preview.save(OUT / "sprites" / "units_preview_32.png")

    screen = Image.open(src_screen).convert("RGB")
    screen.thumbnail((384, 256), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (256, 240), NES["black"])
    # The generated image is 4:3-ish but taller UI. Center-crop to NEOFAMI.
    crop_w, crop_h = 256, 240
    sx = max(0, (screen.width - crop_w) // 2)
    sy = max(0, (screen.height - crop_h) // 2)
    fitted = screen.crop((sx, sy, sx + crop_w, sy + crop_h))
    quantize_to_nes(fitted.convert("RGBA")).convert("RGB").save(OUT / "bg" / "battle_mock.png")
    fitted.save(GENERATED / "battle_screen_reference_256.png")


def bg_tiles():
    img = Image.new("RGBA", (128, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for y in range(0, 64, 8):
        for x in range(0, 128, 8):
            rect(d, (x, y, x + 7, y + 7), "stone" if (x // 8 + y // 8) % 2 else "silver")
            line(d, (x, y + 7, x + 7, y + 7), "dark_silver")
            line(d, (x + 7, y, x + 7, y + 7), "dark_silver")
    img.save(OUT / "bg" / "skyroad_tiles.png")


def cloud_layers():
    img = Image.new("RGBA", (128, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for x, y, w in [(2, 4, 28), (40, 7, 34), (82, 3, 38)]:
        d.ellipse((x, y, x + w, y + 7), fill=NES["white"])
        d.ellipse((x + 10, y - 4, x + w - 4, y + 6), fill=NES["white"])
        d.ellipse((x + 16, y + 3, x + w + 12, y + 10), fill=NES["lavender"])
    for x, y, w in [(7, 22, 36), (55, 18, 45), (102, 23, 32)]:
        d.ellipse((x, y, x + w, y + 8), fill=NES["white"])
        d.ellipse((x + 9, y - 5, x + w - 4, y + 7), fill=NES["white"])
        d.ellipse((x + 18, y + 3, x + w + 12, y + 11), fill=NES["lavender"])
    img.save(OUT / "bg" / "cloud_layers.png")


def battle_field_tiles():
    img = Image.new("RGBA", (128, 96), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # sky bands
    rect(d, (0, 0, 7, 7), "blue")
    rect(d, (8, 0, 15, 7), "sky")
    rect(d, (16, 0, 23, 7), "cyan")
    # stone road variants
    for i, (x, y) in enumerate([(0, 8), (8, 8), (16, 8), (24, 8), (32, 8)]):
        rect(d, (x, y, x + 7, y + 7), "stone" if i % 2 else "silver")
        line(d, (x, y + 7, x + 7, y + 7), "dark_silver")
        line(d, (x + 7, y, x + 7, y + 7), "dark_silver")
        if i == 1:
            rect(d, (x + 2, y + 5, x + 4, y + 6), "green")
        if i == 2:
            line(d, (x + 1, y + 1, x + 6, y + 5), "dark_silver")
        if i == 3:
            rect(d, (x + 5, y + 2, x + 6, y + 3), "dark_stone")
    # grass / island / cliff tiles
    rect(d, (0, 16, 7, 23), "green")
    rect(d, (8, 16, 15, 23), "light_green")
    rect(d, (16, 16, 23, 23), "dark_stone")
    tri(d, [(24, 16), (28, 31), (32, 16)], "dark_stone")
    # fort/magic fragments
    rect(d, (0, 32, 7, 39), "stone")
    rect(d, (8, 32, 15, 39), "silver")
    tri(d, [(16, 39), (20, 25), (24, 39)], "purple")
    rect(d, (24, 32, 31, 39), "black")
    # sign pieces
    rect(d, (0, 48, 7, 55), "dark_stone")
    rect(d, (8, 48, 23, 55), "dark_stone")
    # mountain / snow / clouds
    tri(d, [(0, 71), (8, 56), (16, 71)], "lavender")
    tri(d, [(16, 71), (24, 56), (32, 71)], "purple")
    tri(d, [(32, 71), (40, 58), (48, 71)], "stone")
    rect(d, (48, 56, 63, 63), "white")
    rect(d, (48, 64, 71, 71), "lavender")
    img.save(OUT / "bg" / "battle_field_tiles.png")


def thumbnail():
    img = Image.new("P", (256, 240))
    palette = []
    for value in NES.values():
        value = value.lstrip("#")
        palette.extend([int(value[i:i + 2], 16) for i in (0, 2, 4)])
    palette.extend([0, 0, 0] * (256 - len(NES)))
    img.putpalette(palette)
    d = ImageDraw.Draw(img)
    for y in range(14, 137):
        color = 1 if y < 70 else 3
        d.line((0, y, 256, y), fill=color)
    d.ellipse((14, 45, 236, 116), fill=10)
    d.ellipse((23, 55, 218, 103), fill=11)
    d.line((36, 101, 72, 84, 116, 92, 156, 65, 211, 76), fill=8, width=5)
    d.rectangle((0, 137, 255, 239), fill=0)
    d.rectangle((2, 141, 84, 236), outline=6)
    d.rectangle((87, 141, 157, 236), outline=6)
    d.rectangle((160, 141, 254, 236), outline=6)
    d.text((13, 146), "ALLIED SQUAD", fill=9)
    d.text((101, 151), "> FIGHT", fill=9)
    d.text((101, 167), "  MAGIC", fill=5)
    d.text((173, 146), "ENEMY SQUAD", fill=12)
    img.convert("RGB").save(OUT / "bg" / "thumb.png")


def ui_tiles():
    img = Image.new("RGBA", (64, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rect(d, (0, 0, 7, 7), "black")
    rect(d, (8, 0, 15, 7), "dark_silver")
    rect(d, (16, 0, 23, 7), "cyan")
    rect(d, (24, 0, 31, 7), "red")
    rect(d, (32, 0, 39, 7), "purple")
    rect(d, (40, 0, 47, 7), "black")
    line(d, (40, 0, 47, 0), "silver")
    line(d, (40, 7, 47, 7), "silver")
    rect(d, (0, 8, 63, 15), "black")
    line(d, (0, 15, 63, 15), "gold")
    rect(d, (0, 16, 63, 31), "black")
    line(d, (0, 16, 63, 16), "silver")
    line(d, (0, 31, 63, 31), "silver")
    img.save(OUT / "bg" / "ui_tiles.png")


def font_tiles():
    misaki = ROOT / "third_party" / "misaki" / "misaki_4x8.png"
    if misaki.exists():
        src = Image.open(misaki).convert("RGBA")
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/-> "
        cols = 16
        rows = (len(chars) + cols - 1) // cols
        img = Image.new("RGBA", (cols * 8, rows * 8), (0, 0, 0, 0))
        for i, ch in enumerate(chars):
            code = ord(ch)
            sx = (code & 0x0F) * 4
            sy = (code >> 4) * 8
            glyph = src.crop((sx, sy, sx + 4, sy + 8))
            # Misaki PNG is 1-bit; use white opaque pixels on transparent bg.
            rgba = Image.new("RGBA", (4, 8), (0, 0, 0, 0))
            data = []
            for r, g, b, a in glyph.getdata():
                data.append((255, 255, 255, 255) if r < 128 else (0, 0, 0, 0))
            rgba.putdata(data)
            img.alpha_composite(rgba, ((i % cols) * 8 + 2, (i // cols) * 8))
        img.save(OUT / "sprites" / "font_tiles.png")
        return

    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/-> "
    cols = 16
    rows = (len(chars) + cols - 1) // cols
    img = Image.new("RGBA", (cols * 8, rows * 8), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, ch in enumerate(chars):
        x = (i % cols) * 8
        y = (i // cols) * 8
        d.text((x + 1, y), ch, fill=NES["white"])
    img.save(OUT / "sprites" / "font_tiles.png")


def jis0208_pos(ch):
    b = ch.encode("euc_jp")
    if len(b) != 2:
        return None
    return b[0] - 0xA1, b[1] - 0xA1


def japanese_font_tiles():
    misaki = ROOT / "third_party" / "misaki" / "misaki_gothic.png"
    if not misaki.exists():
        return
    chars = "時刻資金部隊混沌味方敵戦魔法待機退却詠唱回復行動接触指揮勝利敗北撤前衛後白黒剣士騎道う失敗防御選択攻撃"
    chars = "".join(dict.fromkeys(chars))
    src = Image.open(misaki).convert("RGBA")
    cols = 16
    rows = (len(chars) + cols - 1) // cols
    img = Image.new("RGBA", (cols * 8, rows * 8), (0, 0, 0, 0))
    for i, ch in enumerate(chars):
        pos = jis0208_pos(ch)
        if pos is None:
            continue
        row, col = pos
        glyph = src.crop((col * 8, row * 8, col * 8 + 8, row * 8 + 8))
        rgba = Image.new("RGBA", (8, 8), (0, 0, 0, 0))
        data = []
        for r, g, b, a in glyph.getdata():
            data.append((255, 255, 255, 255) if r < 128 else (0, 0, 0, 0))
        rgba.putdata(data)
        img.alpha_composite(rgba, ((i % cols) * 8, (i // cols) * 8))
    img.save(OUT / "sprites" / "font_tiles_jp.png")
    mapping = "\n".join(f"{ch} {i % cols * 8} {i // cols * 8}" for i, ch in enumerate(chars))
    (OUT / "sprites" / "font_tiles_jp.map.txt").write_text(mapping + "\n", encoding="utf-8")


def asset_map():
    data = """# Asset ID Map

Runtime tile/sprite IDs are mapped by the NEOFAMI loader to these 8px-aligned PNG regions.

## Sprites: assets/sprites/units.png

- ally_warrior: x=0 y=0 w=16 h=16
- ally_knight: x=16 y=0 w=16 h=16
- ally_white_mage: x=32 y=0 w=16 h=16
- enemy_goblin: x=48 y=0 w=16 h=16
- enemy_magician: x=64 y=0 w=16 h=16
- map_allied_squad: x=80 y=0 w=16 h=16
- heal_particles: x=32 y=16 w=16 h=16
- enemy_spell_orb: x=64 y=16 w=16 h=16
- map_enemy_flag: x=48 y=16 w=16 h=16
- cursor_box: x=80 y=16 w=16 h=16

## BG: assets/bg/skyroad_tiles.png

- bg_battle_skyroad, bg_route_sky, route_island, route_path, fork_sign, hud_bar, ui_lower_frame are composite background/tilemap IDs assembled from this 8x8 tilesheet by the host runtime.

## BG: assets/bg/cloud_layers.png

- cloud_layer_far: x=0 y=0 w=128 h=16
- cloud_layer_near: x=0 y=16 w=128 h=16
- In battle scenes, these are drawn on separate scrolled layers for horizontal parallax.

## BG: assets/bg/battle_field_tiles.png

8x8 tile source for composing the battlefield background:

- sky bands, stone road variants, grass/island edges, floating-island cliff pieces
- fort/magic tower fragments, sign pieces, mountain/snow/cloud fragments
- Used to keep the field background tile-composed instead of relying on a one-piece screenshot.

## UI: assets/bg/ui_tiles.png

- bar_empty: x=8 y=0 w=8 h=8
- bar_cyan: x=16 y=0 w=8 h=8
- bar_red: x=24 y=0 w=8 h=8
- bar_purple: x=32 y=0 w=8 h=8

## Font: assets/sprites/font_tiles.png

- font_A..font_Z, font_0..font_9, font_colon, font_slash, font_cursor, font_space.

## Japanese Font: assets/sprites/font_tiles_jp.png

- Extracted from Misaki Gothic 8x8 for the current Japanese menu/HUD labels.
- Coordinates are listed in assets/sprites/font_tiles_jp.map.txt.
- Source files are retained as assets/sprites/misaki_4x8.png and assets/sprites/misaki_gothic.png.
"""
    (ROOT / "fainalfantasyrts.neofami" / "ai_prompts" / "asset_id_map.md").write_text(data, encoding="utf-8")


def main():
    (OUT / "sprites").mkdir(parents=True, exist_ok=True)
    (OUT / "bg").mkdir(parents=True, exist_ok=True)
    unit_sheet()
    generated_pixel_assets()
    bg_tiles()
    cloud_layers()
    battle_field_tiles()
    thumbnail()
    ui_tiles()
    font_tiles()
    japanese_font_tiles()
    asset_map()


if __name__ == "__main__":
    main()
