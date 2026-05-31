# Fainal Fantasy RTS Asset Plan

## 参照元

- `final-fantasy-rts-screen.png`: 戦闘画面モック。浮遊大陸の石畳、左右小隊、上部HUD、下部3分割コマンドUIが主な参照。
- `final-fantasy-rts-mmc5-rts (1).png`: ルートマップ画面モック。浮遊島、道、拠点、部隊アイコン、下部ステータス/行動UIが主な参照。
- `NEOFAMI_GAME_SPEC.md`: 256x240固定、8x8タイル基準、NES標準54色、スプライト/BG同時表示制限なし。
- `tools/generate_assets.py`: 既存の最小アセット生成元。NES色辞書、`units.png` 96x32、`skyroad_tiles.png` 128x64、`thumb.png` 256x240を出力。
- `fainalfantasyrts.neofami/ai_prompts/fainalfantasyrts.dsl.neofami`: 現在のDSL。味方3種、敵3種、skyfront battle、MMC5 BGMを定義済み。

## NEOFAMI/NES制約

- 論理画面は必ず256x240。モックの1536x1024密度をそのまま縮小せず、256x240で読める形に再構成する。
- スプライトとBGは8x8タイル単位。16x16は2x2タイル、32x32は4x4タイル、UI枠も8pxグリッドに揃える。
- `manifest.json` は `palette: "nes"` なので、色はNES標準54色内に収める。拡張256色は使わない。
- 1スプライトグループは透明+3色程度を基本にする。NEOFAMIでは同時表示制限はないが、ファミコンらしさのため1キャラごとの色数を絞る。
- 実機の横8スプライト制限やちらつきは再現しない。RTS小隊の複数ユニット表示は積極的に並べてよい。
- PNG寸法は8の倍数。生成先は `.neofami/assets/sprites/*.png`、`.neofami/assets/bg/*.png`、UIもPNGタイルとして扱う。

## 画面構成

### 戦闘画面

- 上部HUD: y=0..13。黒地、金/銀枠、青文字、白数字。`TIME`、`FUNDS`、`UNIT`、`CHAOS FRAME`を8pxフォント相当で表示。
- 戦場: y=14..136。青空、雲、遠景浮遊島、石畳の前景。中央に分岐看板、左に味方、右に敵。
- 下部UI: y=137..239。黒地に銀枠/金罫線。左は味方リスト、中央はコマンド、右は敵カード、詠唱ゲージ、ターン/補助ゲージ。

### ルートマップ画面

- 上部HUDは戦闘画面と共通。
- マップ: y=14..151程度。浮遊島を1画面に収め、道・城・塔・旗・部隊を視認できる密度にする。
- 下部UI: y=152..239。左はSQUAD、中央はLEADER詳細、右はFORMATION/行動アイコン。

## 色設計

| 用途 | 推奨NES色 | 備考 |
|---|---|---|
| 背景空 | `#0064F4`, `#4AA5FF`, `#2BC9D0`, `#FFFFFF` | 濃淡2段+雲白。広い面は青、ハイライトは白。 |
| 石畳/城 | `#626262`, `#ABABAB`, `#4B4B4B`, `#FFFFFF` | 影を黒に寄せすぎず、UIの銀枠と分離する。 |
| 草/島 | `#005B00`, `#359000`, `#7BD200`, `#E2E095` | 緑は2段、縁や道の明部に黄を少量。 |
| 土/崖/道 | `#3B3600`, `#766F00`, `#F8D6A8`, `#626262` | 道は明るい金、崖は暗褐色+灰。 |
| 味方 | `#002E98`, `#0064F4`, `#FFFFFF`, `#F8D6A8` | 青軍で統一。白魔道士は白多め、黒魔道士は青/黒/黄。 |
| 敵 | `#005B00`, `#7BD200`, `#3B3600`, `#CF231C` | ゴブリンは緑+茶+赤目/旗。魔術師は紫系。 |
| 魔法 | `#2BC9D0`, `#FFFFFF`, `#B362FF`, `#FF52C5` | 回復はシアン/白、敵詠唱は紫/ルビー。 |
| UI | `#000000`, `#4B4B4B`, `#ABABAB`, `#F8D6A8`, `#E2E095`, `#2BC9D0` | 黒地、銀枠、金の見出し、青の重要ラベル。 |

## 既存アセットの扱い

- `assets/sprites/units.png` は96x32で、16x16スプライト6体分の余地がある。現状は味方/敵の簡易シルエットなので、次段階では同じシート構成のまま読みやすい16x16へ清書する。
- `assets/bg/skyroad_tiles.png` は128x64で石畳のみ。戦闘BGには空、雲、遠景島、崖、看板、石畳バリエーションを追加した専用タイルセットが必要。
- `assets/bg/thumb.png` はMVPサムネイル。ゲーム内BGとして流用せず、256x240のカートリッジサムネイルとして維持する。

## スプライト計画

### 味方ユニット

| ID | サイズ | 色数目安 | 必要フレーム | 備考 |
|---|---:|---:|---|---|
| `ally_dragoon` | 16x16 | 透明+青+白+金 | idle, attack, map_icon | 兜角/槍で一目識別。既存 `warrior` 相当を置換候補。 |
| `ally_swordsman` | 16x16 | 透明+青+白+金 | idle, slash, map_icon | 剣を右上に出し、ドラグーンとの差を武器で作る。 |
| `ally_knight` | 16x16 | 透明+青+白+金 | guard, bash | 盾を大きく。戦闘コードの `ally_knight` に対応。 |
| `ally_white_mage` | 16x16 | 透明+白+青+金 | idle, cast, map_icon | ローブ白、杖先シアン。回復演出とセットで作る。 |
| `ally_black_mage` | 16x16 | 透明+青+黄+黒 | idle, cast, map_icon | 黄色帽子、青ローブ。次期FORMATION用。 |
| `ally_choco_rider` | 16x16 | 透明+黄+青+白 | idle, run, map_icon | ルートマップモックの機動枠。 |

### 敵ユニット

| ID | サイズ | 色数目安 | 必要フレーム | 備考 |
|---|---:|---:|---|---|
| `enemy_goblin` | 16x16 | 透明+緑+茶+赤 | idle, slash, hurt, map_icon | 剣と丸盾で前衛化。旗は別スプライトに分離。 |
| `enemy_red_soldier` | 16x16 | 透明+赤+黒+金 | idle, guard, map_icon | ルートマップ上の占領部隊用。 |
| `enemy_magician` | 16x16 | 透明+紫+黒+黄 | idle, cast, hurt | 顔は黒地に黄目、杖先に紫球。 |
| `enemy_flag_red` | 8x16 | 透明+赤+白+金 | still, wave_a, wave_b | 城/敵カード/部隊上の共通旗。 |

### エフェクト/カーソル

| ID | サイズ | 色数目安 | フレーム | 備考 |
|---|---:|---:|---|---|
| `heal_particles` | 24x24 | 透明+シアン+白+青 | 3 | 白魔道士周辺の星粒。8x8タイル3x3。 |
| `enemy_spell_orb` | 16x16 | 透明+紫+ルビー+白 | 3 | 敵魔術師の詠唱ゲージと連動。 |
| `slash_arc` | 16x16 | 透明+白+金+灰 | 2 | 近接攻撃の一瞬表示。 |
| `cursor_box` | 24x24 | 透明+シアン+白 | 2 | ルートマップ選択枠。角だけ描画して中は透明。 |
| `hand_pointer` | 8x16 | 透明+白+灰+黒 | 1 | メニュー選択用。モックの白い指。 |

## 背景計画

### `bg_battle_skyroad`

- 目標: 256x123相当の戦場背景をタイルで構成。上部HUD下から下部UI上まで。
- 必要タイル:
  - 空グラデーション風: 8x8を4種。実際のグラデーションではなく横帯の濃淡で表現。
  - 雲: 小雲/大雲/影付き雲を各2から4タイル。
  - 遠景浮遊島: 城島、塔島、崖下面、滝を8x8合成で配置。
  - 石畳: 既存の灰タイルを拡張し、割れ目、草、縁、崖落ちの端を追加。
  - 分岐看板: 支柱、左右矢印、文字は8x8内の疑似文字で `N`, `E` 程度に省略可。

### `bg_route_map`

- 目標: 256x138程度のルート画面背景。浮遊島全体を一枚のマップとして読ませる。
- 必要タイル:
  - 島本体: 草地、森、山、崖、浮遊島下面、滝。
  - 道: 直線、曲線、分岐、橋、階段。
  - 拠点: 城、魔法塔、廃墟、旗付き砦、クリスタル塔。16x16から32x32合成。
  - ノード: 味方/敵/中立の状態を8x8または16x16アイコンで表示。

## UI計画

### 共通HUD

- `hud_top_frame`: 256x16。黒ベース、金/銀の上下罫線、角飾り、区切り。
- `icon_hourglass`: 8x8または8x16。TIME用。
- `icon_coin`: 8x8。FUNDS用。
- `icon_unit`: 8x8。UNIT用の青兵。
- `icon_chaos`: 16x16。青い宝珠/羅針盤風。
- `font_small`: 8x8固定幅。英数字、大文字、記号 `/:%+-`。現状の `text:` 描画を実PNGフォントに置換する際に必要。

### 戦闘UI

- `ui_lower_frame`: 256x104。下部全体の枠。左84px、中央72px、右96px程度に分割。
- `panel_corner_gem`: 8x8。銀枠の接合飾り。
- `command_icons`: 8x8または16x16。FIGHT剣、MAGIC星、WAIT砂時計、RETREAT旗。
- `hp_bar_cyan`, `cast_bar_purple`, `timer_bar_red`: 8px高さのゲージ部品。枠、空、塗りを分ける。
- `enemy_card_frame`: 24x32または32x32。敵小カードと番号表示。

### ルートマップUI

- `ui_map_lower_frame`: 256x88。SQUAD/LEADER/FORMATIONの3分割。
- `action_icons`: MOVE旗、SCOUT羽根、MAGIC杖、CAMPテント、INFO巻物。各16x16。
- `formation_slot`: 24x24。番号とミニユニットを置く枠。
- `morale_star`: 8x8。点灯/消灯の2種。

## 生成優先度

1. `units.png` 清書: `ally_knight`, `ally_white_mage`, `enemy_goblin`, `enemy_magician` を現コードIDに合わせて16x16で作る。
2. 戦闘用 `bg_battle_skyroad_tiles.png`: 石畳、空、雲、遠景島、看板を追加し、256x240画面で背景の情報量を上げる。
3. `ui_battle.png`: 上部HUD、下部フレーム、コマンドアイコン、ゲージ、指カーソルを1シート化する。
4. ルートマップ用 `bg_route_map_tiles.png`: 島、道、拠点、橋、旗ノードを追加する。
5. 追加ユニット: `ally_dragoon`, `ally_swordsman`, `ally_black_mage`, `ally_choco_rider`, `enemy_red_soldier`。
6. エフェクト: 回復、敵詠唱、斬撃、選択枠の2から3フレームアニメ。
7. 実PNGフォント: 8x8固定幅大文字フォントを作り、`text:`疑似描画への依存を減らす。

## 推奨ファイル構成

```text
fainalfantasyrts.neofami/assets/sprites/units.png
fainalfantasyrts.neofami/assets/sprites/effects.png
fainalfantasyrts.neofami/assets/sprites/map_icons.png
fainalfantasyrts.neofami/assets/bg/battle_skyroad_tiles.png
fainalfantasyrts.neofami/assets/bg/route_map_tiles.png
fainalfantasyrts.neofami/assets/bg/ui_common.png
fainalfantasyrts.neofami/assets/bg/ui_battle.png
fainalfantasyrts.neofami/assets/bg/ui_route.png
fainalfantasyrts.neofami/assets/bg/font_8x8.png
```

## 生成プロンプト方針

- 「pixel art」ではなく「NES 8x8 tile based, 4 color sprite group, transparent background, hard 1px outlines, readable at 16x16」と明示する。
- 1536pxモックの装飾密度は参考に留め、16x16では武器・帽子・盾・杖などシルエット差を最優先にする。
- 背景は1枚絵ではなく、8x8タイルセットとして生成/清書する。重複利用できる石畳、草、崖、道、雲を先に作る。
- UIは黒地、銀枠、金罫線、青アクセントを共通化し、戦闘/ルートで同じ部品を使う。
- 生成後は必ずNESパレットへ減色し、透明色をRGBA alpha 0に統一する。

## 未確定事項

- ランタイム側のアセットID解決規則が未確定。現コードは `drawSprite("ally_knight")` などID参照なので、スプライトシート内の座標定義をどこで持つか決める必要がある。
- UI文字をランタイムの `text:` 疑似タイルで継続するか、8x8フォントPNGへ移行するかは未決定。
- マップ画面のユニット数はモックでは `08/12` だが、現DSL/実装はMVP小隊中心。追加ユニット生成時にFORMATION仕様と同期する。
