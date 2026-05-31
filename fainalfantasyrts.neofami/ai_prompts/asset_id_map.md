# Asset ID Map

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

## Enhanced SMS+ Pack: assets/enhanced/sms_skylands/

NEOFAMI v0.2 / SMS+ 16-color assets imported from `sms_skylands_master_system_pack`.

- `tiles/sms_skylands_mapchips_16.png`: 16x16 mapchips, each composed from 8x8 patterns.
- `tiles/sms_skylands_patterns_8x8.png`: hardware pattern source.
- `sprites/sms_skylands_sprites_atlas.png`: structures, units, cursor atlas.
- `maps/sms_skylands_sample_map.png`: enhanced route-map backdrop used by the preview.
- `palettes/sms_skylands_palettes.json`: SMS 64-color 16-entry palette sets.
- `validation/palette_validation.json`: confirms all tiles/sprites are within 16 colors and SMS 64-color approximation.
- Runtime composite ID: `sms_skylands_route_map` draws the sample route-map image into the 256x240 field area.

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
