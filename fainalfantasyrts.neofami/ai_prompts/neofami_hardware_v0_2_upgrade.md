# NEOFAMI Hardware v0.2 Upgrade Notes

Source: `files/NEOFAMI_proposal.md`

## Upgrade Summary

The cartridge now targets NEOFAMI v0.2 graphics:

- Logical screen remains `256x240`.
- Rendering keeps 8x8 hardware pattern tiles.
- Mapchips are 16x16, composed from four 8x8 patterns.
- Sprites may be 8x8, 16x16, or larger tile composites.
- Each sprite may own an independent 16-color palette.
- Each BG tile/mapchip may use up to 16 visible colors.
- Master palette model is extended: NES 54 + SMS 64 + RGB.
- Sprite count, horizontal sprite count, BG layers, and tileset capacity remain unlimited.
- Retro hardware limits are optional challenge settings only, not required behavior.

## Graphics Mode

`manifest.json` declares:

```json
{
  "palette": "extended",
  "graphics": {
    "mode": "sms_plus_16",
    "patternTileSize": [8, 8],
    "mapchipSize": [16, 16],
    "spriteColorLimit": 16,
    "bgTileColorLimit": 16,
    "perSpritePalettes": true,
    "perTilePalettes": true,
    "masterPalettes": ["nes54", "sms64", "rgb"]
  }
}
```

## Enhanced Asset Pack

The upgraded graphics pack is stored at:

```text
assets/enhanced/sms_skylands/
```

Important files:

- `sms_skylands_assets_bundle.json`
- `tiles/sms_skylands_mapchips_16.png`
- `tiles/sms_skylands_patterns_8x8.png`
- `sprites/sms_skylands_sprites_atlas.png`
- `maps/sms_skylands_sample_map.png`
- `palettes/sms_skylands_palettes.json`
- `validation/palette_validation.json`

The validation file reports that all supplied mapchips and sprites are within 16 colors and SMS 64-color approximation.

## Runtime Assumptions

- The NEOFAMI runtime may render the SMS+ pack directly from the bundle JSON.
- Preview HTML uses the enhanced sample map as the route-map backdrop.
- Battle UI remains 256x240 and uses Japanese Misaki font labels.
- Existing NES-style assets are retained for compatibility and fallback.
