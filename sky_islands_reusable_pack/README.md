# Sky Islands Reusable Asset Pack

添付された架空ゲーム画面をもとに、別マップで再利用しやすいように分離・再構成した素材一式です。

## 主な内容

- `terrain/sky_islands_reusable_terrain_tileset_64.png`  
  64pxタイル。草地・森・山・崖・島端・道・橋・マーカーを収録。
- `terrain/sky_islands_reusable_terrain_tileset_64.tsj`  
  Tiled用タイルセット定義。`walkable`、`move_cost`、`collision`付き。
- `sprites/sky_islands_sprites_atlas.png` / `.json`  
  建物・ユニット・橋オブジェクトを透明背景で分離した可変サイズアトラス。
- `sprites/sky_islands_sprites_sheet_192.png` / `.tsj`  
  Tiledで配置しやすい192px固定セルのスプライトシート。
- `source_layers/source_layered_map.json`  
  元画像上の建物・ユニット・橋の配置情報。
- `source_layers/source_field_ground_clean_inpainted.png`  
  元画像から建物・ユニット・橋を除去した地形のみの参考画像。
- `maps/sky_islands_sample_reusable.tmj`  
  分離素材で組んだサンプルマップ。

## レイヤー構成の推奨

1. `terrain_base` : 不透明の地形タイル
2. `route_overlay` : 透明背景の道オーバーレイ
3. `bridge_overlay` : 透明背景の橋オーバーレイ
4. `objects` : 建物・遺跡・塔
5. `units` : ユニット
6. `ui_overlay` : 選択カーソルなど

## 注意

元画像1枚からの分離のため、建物やユニットの背後に隠れていた地形は推定・補完です。  
ただし、別マップで使う地形タイルは新規にシームレス生成しており、繰り返し配置に対応しています。

## 追加: 建物strict版

- `sprites/sky_islands_structures_only_atlas.png` / `.json`  
  土台・地形をできるだけ除いた建物構造物寄りのstrict版です。見た目重視の配置には通常アトラス、完全分離寄りにはstrict版を使ってください。
