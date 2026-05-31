# NEOFAMI ゲーム制作仕様書 v1.0

> **このドキュメントは AI コードジェネレータ（Codex / Claude 等）が NEOFAMI 向けゲームを生成する際に必ず参照・遵守するマスター仕様書である。**
> 迷ったらこのドキュメントが最優先のルールブック。ここに書かれた制約・API・命名・フォーマットから逸脱してはならない。

---

## 0. このドキュメントの読み方（AIエージェント向け指示）

- **MUST / MUST NOT / SHOULD / MAY** はRFC 2119準拠で解釈すること。
- コードを書く前に、必ず該当章（グラフィック→§3、サウンド→§4、API→§6、DSL→§7、カートリッジ→§8）を確認すること。
- 「ファミコンっぽさ」は **見た目とサウンドの制約** で表現する。内部実装（FPS・スプライト数・レイヤー数）は自由。この線引きを絶対に混同しないこと。
- 生成物は **必ず `.neofami` カートリッジ構造**（§8）に収まる形で出力すること。
- 不明点を勝手に creative に埋めず、`manifest.json` の `notes` フィールドに「仮定したこと」を必ず記録すること。

---

## 1. NEOFAMIとは（前提）

NEOFAMIは6502を**エミュレートしない**。ゲームロジックは **TypeScript/JavaScript** で書く。
ファミコンの"魂"＝**見た目とサウンドの美学**だけを再現し、ハードウェア制約からは解放された仮想機である。

| 観点 | ルール |
|---|---|
| 見た目 | **ファミコン準拠の制約あり**（解像度・パレット・タイル）。これは MUST。 |
| サウンド | **2A03 + 拡張音源チップの音色に準拠**。これは MUST。 |
| 内部実装 | **制約なし**（120FPS可、スプライト無制限、レイヤー無制限、TS自由）。 |

---

## 2. 必ず守る「画面の枠」（MUST）

| 項目 | 値 | 区分 |
|---|---|---|
| 内部解像度 | **256 × 240 px 固定** | MUST |
| アスペクト比 | 表示は拡大可。ただし論理座標は常に 256×240 | MUST |
| 座標原点 | 左上 (0,0)、右下 (255,239) | MUST |
| 論理フレームレート | 60FPS互換のゲームロジック（`update(dt)` は 1/60 基準） | SHOULD |
| 描画フレームレート | 最大120FPS（補間描画はエンジン任せ） | MAY |

> ゲームロジックを書くときは **256×240の世界** で考えること。それ以外の解像度を前提にしたコードを書いてはならない。

---

## 3. グラフィック仕様（必ず守る）

### 3.1 タイル
- スプライト・BGの最小単位は **8×8ピクセルタイル**（MUST）。
- 大きなキャラは 8×8 タイルの **合成** で作る（例：16×16 = 2×2 タイル、32×32 = 4×4 タイル）。MUST。
- タイルは PNG で供給される。読み込み単位は必ず 8 の倍数の幅・高さであること（MUST）。

### 3.2 カラーパレット
- 基本色は **NES標準54色パレット**（後述 §3.4）を使うこと（MUST）。
- 1キャラ（スプライトグループ）あたりの推奨色数は **4色（うち1色は透明）**。これはファミコンらしさのための SHOULD。
- 拡張256色パレットは **オプション**。使う場合は `manifest.json` の `palette: "extended"` を明示すること（MUST when used）。
- 同時表示色数の制限は **撤廃**（無制限）。だが「らしさ」を出すため、1タイルセット内は色を絞ることを SHOULD とする。

### 3.3 スプライト / BG（解放された部分）
| 項目 | NES実機 | NEOFAMI |
|---|---|---|
| 同時表示スプライト数 | 64 | **無制限** |
| 横並び制限 | 8個まで | **なし**（チラつき再現しない） |
| BG層 | 1層 | **無制限（パララックス自由）** |
| タイルセット容量 | 8KB | **無制限（PNG自由）** |

> ⚠️ AIは「スプライトが消える」「8個制限」などの**実機バグを再現してはならない**。NEOFAMIはそれらから解放されている。

### 3.4 NES標準54色パレット（参照テーブル）
インデックスは NES の `$00`〜`$3F` 配列に準拠。生成時は16進カラーで指定してよいが、**この54色の範囲内に収める**こと（SHOULD、`palette:"nes"`時はMUST）。

```
$00 #626262  $01 #002E98  $02 #0C11C2  $03 #3B00C2  $04 #650098  $05 #7D004E
$06 #7D0000  $07 #651900  $08 #3B3600  $09 #0C4F00  $0A #005B00  $0B #005900
$0C #00494E  $0D #000000  $0E #000000  $0F #000000
$10 #ABABAB  $11 #0064F4  $12 #353CFF  $13 #761BFF  $14 #AE0AF4  $15 #CF0C8F
$16 #CF231C  $17 #AE4700  $18 #766F00  $19 #359000  $1A #00A100  $1B #009E4E
$1C #00888F  $1D #000000  $1E #000000  $1F #000000
$20 #FFFFFF  $21 #4AA5FF  $22 #7B85FF  $23 #B362FF  $24 #F250FF  $25 #FF52C5
$26 #FF6A60  $27 #F28D17  $28 #B3AE00  $29 #7BD200  $2A #4ADE33  $2B #2BDE85
$2C #2BC9D0  $2D #4B4B4B  $2E #000000  $2F #000000
$30 #FFFFFF  $31 #B6E0FF  $32 #CCD2FF  $33 #E2C2FF  $34 #F8B8FF  $35 #FFBCEB
$36 #FFC5C2  $37 #F8D6A8  $38 #E2E095  $39 #CCEC97  $3A #B6F3AC  $3B #ACF3CC
$3C #ACEEED  $3D #B6B6B6  $3E #000000  $3F #000000
```
> `$0D/$0E/$0F` 等の黒は使用注意（実機では表示崩れの原因。NEOFAMIでは `$0F #000000` を黒として使うこと）。

---

## 4. サウンド仕様（必ず守る音色ルール）

NEOFAMIのサウンドは **チャンネル＝音色** が紐づく。AIはBGM/SEを生成するとき、必ず以下のチャンネル割り当てに従うこと（MUST）。

### 4.1 標準チャンネル（2A03互換APU・常時利用可）
| ch名 | 波形 | 用途 | 制約 |
|---|---|---|---|
| `pulse1` | 矩形波 | 主旋律 | デューティ比 12.5/25/50/75% |
| `pulse2` | 矩形波 | 副旋律・ハモリ | 同上 |
| `triangle` | 三角波 | ベース | 音量固定（ファミコン準拠） |
| `noise` | ノイズ | ドラム・SE | 16段のノイズ周期 |
| `dpcm` | サンプリング | ボイス・キック | 1bit DPCMサンプル |

### 4.2 拡張音源（オプション・`manifest.json`で宣言して使う）
| チップ | 追加チャンネル | 音のイメージ | 宣言キー |
|---|---|---|---|
| **VRC6** | 矩形波×2 + 鋸波 | 悪魔城伝説 | `"vrc6"` |
| **MMC5** | 矩形波×2 + PCM | パワフルな矩形 | `"mmc5"` |
| **N163** | 波形メモリ最大8ch | コナミの澄んだ音 | `"n163"` |
| **FDS** | FM風波形1ch | ディスクシステムの柔らかい音 | `"fds"` |

- 拡張音源を使う場合、`manifest.json` の `audio.extensions: ["vrc6", ...]` に必ず列挙すること（MUST）。
- 宣言せずに拡張チャンネルを鳴らすコードを書いてはならない（MUST NOT）。

### 4.3 実装制約
- サウンドエンジンは **Web Audio API + AudioWorklet** 前提。AIは生波形を直接Float配列で出力するのではなく、**ノート列（後述）またはNSF**で記述すること（SHOULD）。
- `.nsf` ファイルのインポートに対応。BGMは `.nsf` か NEOFAMI独自ノート形式（§7.2）で供給する。

---

## 5. CPU / RETRO LOCK（任意制約モード）

- 6502エミュレーションは**しない**（MUST NOT 実装）。
- `RETRO LOCK` は**オプション**のチャレンジモード。有効時は1フレーム内の処理を仮想クロックで制限する。
- AIは通常 `RETRO LOCK` を**前提にしない**コードを書くこと。ただし `manifest.json` の `retroLock: true` 指定時は、重い処理を分割フレーム化するなど配慮すること（SHOULD when enabled）。

---

## 6. NEOFAMI ランタイムAPI（コード生成の契約）

> Codexはゲームロジックを以下のAPI契約に沿って書くこと。**APIシグネチャを勝手に発明しない**。未定義の機能が必要なら `manifest.json` の `notes` に要望として記載する。

### 6.1 エントリポイント
各シーンは以下のライフサイクルを実装する（MUST）：

```ts
export interface Scene {
  init(ctx: NeofamiContext): void;        // 1回だけ。アセット参照取得
  update(input: Input, dt: number): void; // 毎フレーム。dt は 1/60 基準
  render(gfx: Gfx): void;                  // 毎フレーム。描画のみ
  dispose?(): void;                        // シーン破棄時
}
```

### 6.2 グラフィックAPI（`Gfx`）
```ts
interface Gfx {
  // 背景レイヤー（無制限）。zは奥行き、小さいほど奥
  drawTile(tileId: string, x: number, y: number, opts?: TileOpts): void;
  drawSprite(spriteId: string, x: number, y: number, opts?: SpriteOpts): void;
  setLayer(z: number): void;            // 以降の描画を指定zレイヤーへ
  setScroll(z: number, sx: number, sy: number): void; // パララックス
  setPalette(name: string): void;       // "nes" | "extended" | カスタム名
  clear(colorIndex: number): void;      // 背景色（パレットindex）
}
type TileOpts   = { flipX?: boolean; flipY?: boolean; palette?: number };
type SpriteOpts = TileOpts & { rotate?: 0|90|180|270; alpha?: number };
```
- 座標は 256×240 の論理ピクセル（MUST）。
- `flipX/flipY` でタイルを反転（実機準拠の表現手法）。

### 6.3 サウンドAPI（`Sfx`）
```ts
interface Sfx {
  playBgm(trackId: string, opts?: { loop?: boolean }): void;
  stopBgm(): void;
  playSe(seId: string): void;            // noiseまたはdpcmチャンネル想定
  setChannelVolume(ch: ChannelName, vol01: number): void;
}
type ChannelName = "pulse1"|"pulse2"|"triangle"|"noise"|"dpcm"
                 | "vrc6_pulse1"|"vrc6_pulse2"|"vrc6_saw"
                 | "mmc5_pulse1"|"mmc5_pulse2"|"mmc5_pcm"
                 | `n163_${1|2|3|4|5|6|7|8}` | "fds";
```

### 6.4 入力API（`Input`）
ファミコン互換の論理ボタンに**正規化**すること（MUST）。Gamepad / キーボード / タッチ仮想パッドはエンジンが吸収する。
```ts
interface Input {
  up: boolean; down: boolean; left: boolean; right: boolean;
  a: boolean; b: boolean; start: boolean; select: boolean;
  // 押した瞬間だけtrue（エッジ検出）
  pressed(btn: "up"|"down"|"left"|"right"|"a"|"b"|"start"|"select"): boolean;
}
```
> 物理キーやマウス座標を直接参照するコードを書いてはならない（MUST NOT）。必ずこの8ボタン論理入力を使う。

### 6.5 ストレージAPI
```ts
interface Save {
  load<T>(key: string): T | null;   // IndexedDB / OPFS をエンジンが抽象化
  save<T>(key: string, value: T): void;
}
```

---

## 7. NEOFAMI Prompt DSL（生成指示の中間表現）

AIは自然言語の要望を、まずこのDSLに落としてからコード/アセットを生成すること（SHOULD）。DSLは仕様の単一ソースになる。

### 7.1 アセットDSL文法
```neofami
@sprite <id> {
  style: "<NES制約の説明。色数・トーン>"
  frames: [<frame名のリスト>]
  size: <W>x<H>           // 8の倍数。例 16x16 (2x2 tiles)
}

@bg <id> {
  theme: "<情景>"
  tiles: <枚数>
  palette: nes | extended
}

@bgm <id> {
  mood: "<雰囲気>"
  channels: [pulse1, pulse2, triangle, noise, ...]  // §4のch名のみ
  length: <秒>s
  loop: true | false
}

@se <id> {
  channel: noise | dpcm
  desc: "<効果音の説明>"
}

@level <id> {
  theme: "<情景>"
  length: short | medium | long
  enemies: [<enemy_id> [xN], ...]
  boss: <boss_id> | none
}
```

### 7.2 NEOFAMI ノート形式（BGM/SEの軽量記述）
NSFを使わない場合のBGMはこの形式（JSON）で出力すること：
```json
{
  "bpm": 150,
  "channels": {
    "pulse1": [{"note":"C4","dur":4,"duty":2}, {"note":"E4","dur":4}],
    "triangle": [{"note":"C2","dur":8}],
    "noise": [{"note":0,"dur":2}, {"note":0,"dur":2,"rest":true}]
  },
  "loop": true
}
```
- `note`: 音名（"C4"等）または noise周期インデックス。`dur`: 16分音符単位の長さ。`rest`: 休符。

---

## 8. `.neofami` カートリッジ仕様（出力フォーマット契約）

ゲーム1本 = 1個の `.neofami`（実体はZIP）。AIの最終出力は**必ずこの構造**に収めること（MUST）。

```
mygame.neofami  (ZIP)
├── manifest.json        # メタデータ＋宣言（必須）
├── code/
│   ├── main.ts          # エントリ。最初のSceneをexport
│   └── scenes/*.ts      # 各シーン
├── assets/
│   ├── sprites/*.png     # 8×8タイル基準
│   ├── bg/*.png
│   └── audio/*.{nsf,json,wav}
└── ai_prompts/          # 生成に使ったDSL/プロンプト履歴（追加開発用）
```

### 8.1 `manifest.json` スキーマ（必須フィールド）
```json
{
  "neofamiVersion": "1.0",
  "title": "ゲームタイトル",
  "author": "作者名",
  "thumbnail": "assets/bg/thumb.png",
  "entry": "code/main.ts",
  "palette": "nes",                  // "nes" | "extended"
  "audio": { "extensions": [] },      // 例 ["vrc6"]
  "retroLock": false,
  "input": ["up","down","left","right","a","b","start","select"],
  "notes": "AIが仮定したこと・未確定事項をここに残す"
}
```
- `neofamiVersion`, `title`, `entry` は **必須**（MUST）。欠けたカートリッジを出力してはならない。
- `palette` と `audio.extensions` は §3.2 / §4.2 と整合させること（MUST）。

---

## 9. 生成チェックリスト（AIは出力前に自己検証）

提出前に以下をすべて満たすか確認すること：

- [ ] 解像度 256×240 を前提にコードを書いた（§2）
- [ ] スプライト/BGは8×8タイル基準（§3.1）
- [ ] 色は宣言したパレット範囲内（§3.2 / §3.4）
- [ ] 実機バグ（スプライト消失・8個制限）を**再現していない**（§3.3）
- [ ] サウンドのチャンネル名は §4 の定義のみを使用
- [ ] 拡張音源を使うなら `manifest.json` に宣言済み（§4.2）
- [ ] APIシグネチャ（Scene/Gfx/Sfx/Input/Save）を勝手に変更していない（§6）
- [ ] 入力は8ボタン論理入力のみ（§6.4）
- [ ] 出力は `.neofami` 構造に収まっている（§8）
- [ ] `manifest.json` の必須フィールドが揃っている（§8.1）
- [ ] 仮定・未確定事項を `notes` に記録した（§0）

---

## 10. やってはいけないこと（MUST NOT 集約）

1. 256×240以外の解像度を前提にする
2. 8×8タイルを無視した任意ビットマップ前提のロジック
3. 実機のスプライト消失・8個横並び制限を再現する
4. §4以外のチャンネル名・未宣言の拡張音源を鳴らす
5. §6のAPIシグネチャを勝手に改変・新設する
6. 物理キー/マウス座標を直接読む（必ず論理8ボタン入力経由）
7. `.neofami` 以外の構造で最終成果物を出す
8. `manifest.json` の必須フィールドを省略する
9. 6502/CPUエミュレーションを実装する

---

*NEOFAMI GAME SPEC v1.0 — 令和ファミコンプロジェクト / Powered by AILE × AXLab*
