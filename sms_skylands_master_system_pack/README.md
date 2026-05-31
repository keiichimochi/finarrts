# SMS Skylands Original Mapchip Pack

元画像からの切り抜きではなく、新規に描いた Master System 風の空中島マップチップ一式です。

## 仕様

- マップチップ: 16 x 16 px
- ハードウェアパターン単位: 8 x 8 px
- 16 x 16 チップは 8 x 8 パターン4枚の組み合わせとして JSON に記録
- 可視色: Sega Master System 風の 64 色、RGB 各チャンネル 0/85/170/255
- 1チップ / 1スプライトあたり 16色以内
- 透明色: パレット index 0 相当

## 主要ファイル

- `sms_skylands_assets_bundle.json`: 実装用まとめ JSON
- `tiles/sms_skylands_mapchips_16.png`: 16pxマップチップ
- `tiles/sms_skylands_mapchips_16.tsj`: Tiled用タイルセット
- `tiles/sms_skylands_patterns_8x8.png`: 8pxパターンシート
- `sprites/sms_skylands_sprites_atlas.png`: 建物・ユニット・UIのスプライトアトラス
- `maps/sms_skylands_sample_map.json`: サンプルマップ
- `maps/sms_skylands_sample_map.tmj`: Tiled互換サンプル
- `validation/palette_validation.json`: 16色制限チェック結果

## 使い方

Tiled では `maps/sms_skylands_sample_map.tmj` を開いてください。
ゲーム実装では `sms_skylands_assets_bundle.json` を読み、`tileset.tiles[].sheet_rect` と `sprites.sprites[].atlas_frame` を参照してください。

## 検証結果

- タイル数: 80
- スプライト数: 15
- タイルは全て16色以内: True
- スプライトは全て16色以内: True
- タイルはSMS 64色近似内: True
- スプライトはSMS 64色近似内: True
