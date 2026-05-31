# Final Fantasy　RTS

作成日時: 2026/5/31 9:34:43

## 確定ゲーム画面

![白魔道士の回復詠唱と前衛防衛](http://100.91.120.40:12345/files/generated/4768a5494b2341dab899b9017f8fb4c5.png)

- 画面名: 白魔道士の回復詠唱と前衛防衛
- 画像ID: 4768a5494b2341dab899b9017f8fb4c5
- 画像URL: http://100.91.120.40:12345/files/generated/4768a5494b2341dab899b9017f8fb4c5.png

## 元アイデア

ファミコン時代、ファイナルファンタジーのRTSゲームが1991年発売された世界線で、伝説のオウガバトルの簡易版のシステム。8bitのフィールド画面。味方ユニット、敵ユニットは１６x１６ドット、MMC５チップを使い、画面上部はフィールド、画面下はステータス画面

## Codex App Server生成 企画書

## コンセプト

「Final Fantasy RTS」は、1991年にファミコン向けに発売された架空のファンタジーRTS RPGという設定の小隊指揮ゲーム。

プレイヤーは空中大陸を進軍する複数の小隊を管理し、分岐ルート上の砦・塔・遺跡を巡りながら敵勢力と接敵する。戦闘は完全なアクション操作ではなく、簡易RTSと半自動RPGバトルの中間。プレイヤーは小隊の進路、陣形、行動方針、コマンド選択を指示し、ユニットごとの行動は時間経過とゲージで進行する。

確定画面は「白魔道士の回復詠唱と前衛防衛」。前衛の戦士と騎士が敵ゴブリンを抑え、後衛の白魔道士が回復を詠唱する場面を中核イメージとする。敵後衛マジシャンは強力な魔法を溜めており、プレイヤーに攻防の優先判断を迫る。

## プレイヤー体験

プレイヤーに感じさせたい体験は「小さなドットキャラの戦況を読み、限られた命令で部隊を勝たせる指揮官感」。

画面上部では、味方と敵の小隊が空中大陸の街道上でぶつかる。ユニットは小さいが、前衛・後衛・詠唱・防御・攻撃の役割が一目で分かるようにする。画面下部ではHP、行動コマンド、敵編成、詠唱ゲージ、行動順を確認できる。

プレイヤーは常に以下を判断する。

- 前衛が耐えている間に白魔道士の回復を通すか
- 敵マジシャンの詠唱を妨害するために攻撃を集中するか
- HPが削られたユニットを守るためにWAITやRETREATを選ぶか
- 分岐マップ上で次にどの拠点へ進軍するか

操作量は多すぎず、判断は明確にする。リアルタイム進行だが、コマンド入力時は短い入力猶予を設け、ファミコン時代のRPG操作感を保つ。

## コアループ

1. 空中大陸の分岐マップで小隊を目的地へ進軍させる
2. 敵小隊、拠点、防衛ラインと接触する
3. 戦闘画面へ切り替わり、前衛・後衛の陣形で半自動バトルが始まる
4. プレイヤーはFIGHT / MAGIC / WAIT / RETREATを選び、戦況を調整する
5. HP、詠唱ゲージ、行動順を見ながら勝利または撤退を判断する
6. 戦闘結果に応じて資金、部隊状態、CHAOS FRAME、ルート支配状況が変化する
7. 次の分岐、拠点攻略、部隊再編へ進む

戦闘単体では短時間の判断を重視し、キャンペーン全体では「どの道を進むか」「どの小隊をどこに送るか」による戦略性を持たせる。

## 画面仕様

画面は4:3比率を基本とする。構成は上下2分割。

上部は戦闘フィールド。空中大陸の石畳、雲海、崩れた橋、分岐標識、遠景の砦や魔法塔を配置し、バトル中でもルートマップ上の遭遇戦であることを示す。

下部はステータス・コマンド領域。黒背景に銀青のフレーム、金色の罫線を使用し、視認性を最優先する。

確定画面の配置は以下。

- 左側: 味方小隊
- 右側: 敵小隊
- 味方前衛左: 戦士
- 味方前衛右: 騎士
- 味方後衛: 白魔道士
- 敵前衛: ゴブリン2体
- 敵後衛: マジシャン
- 背景中央: 分岐標識
- 遠景左: 砦ノード
- 遠景右: 魔法塔または浮遊島

戦闘中の演出として、白魔道士の周囲にシアン白の回復粒子を表示する。騎士は盾を構え、戦士は前傾姿勢で攻撃中。敵マジシャンは赤紫の魔法球を保持し、危険な詠唱中であることを示す。

## UI/HUD仕様

上部HUDには以下を表示する。

- TIME: マップ内時間
- FUNDS: 所持資金
- UNIT: 現在選択中の小隊番号と最大小隊数
- CHAOS FRAME: 世界評価、秩序・混沌傾向
- カーソル: 現在選択対象を示す点滅アイコン

下部左パネルは味方小隊情報。

- 小隊名: ALLIED SQUAD
- ユニット番号
- クラス名
- 小型スプライト
- HP数値
- HPバー
- 装備種別アイコン

下部中央パネルはコマンド。

- FIGHT: 通常攻撃を優先
- MAGIC: 魔法または回復を使用
- WAIT: 行動を温存し、防御・詠唱待ち
- RETREAT: 戦闘から離脱を試みる

選択中コマンドにはカーソルを表示し、下部に短い説明文を出す。

下部右パネルは敵情報。

- ENEMY SQUAD
- 敵ユニットの小型表示
- CAST GAUGE
- TURN ORDER
- 各ユニットの行動メーター

CAST GAUGEは敵または味方の強力な魔法詠唱進行を示す。確定画面では敵マジシャンの赤紫魔法、味方白魔道士の回復詠唱の両方を戦況要素として扱う。

## 操作とルール

基本操作はファミコン想定。

- 十字キー: コマンド選択、対象選択、マップ上の移動先指定
- Aボタン: 決定
- Bボタン: キャンセル
- START: 一時停止、全体状況確認
- SELECT: 小隊情報切り替え

戦闘はリアルタイム進行だが、コマンド選択中は進行速度を低下させる。完全停止にはしないことでRTSらしい緊張感を残す。

小隊は基本3体編成。

- 前衛: 敵の攻撃を受けやすいが、物理攻撃や防御に優れる
- 後衛: 被弾しにくいが、前衛崩壊時に狙われやすい
- 回復役: 味方HPを維持する要
- 魔法役: 詠唱時間後に高威力または範囲効果を発動

確定画面の味方小隊ルール。

- 戦士は前衛攻撃役
- 騎士は防御役で、一定確率で後衛への攻撃をかばう
- 白魔道士はMAGIC選択時、最もHP割合が低い味方へ回復を詠唱する

敵小隊ルール。

- ゴブリンは前衛から近接攻撃
- 敵マジシャンはCAST GAUGEが満タンになると魔法攻撃
- マジシャンの詠唱中に前衛ゴブリンを倒すと、後衛へ攻撃が届きやすくなる

勝利条件は敵小隊の全滅。敗北条件は味方小隊の全滅。RETREAT成功時はマップ上の直前ノードへ後退するが、資金やCHAOS FRAMEにペナルティが発生する場合がある。

## ステージ/分岐マップ

ステージは空中大陸を舞台にしたルート制マップ。

各ノードは以下の役割を持つ。

- 砦: 敵小隊の拠点、防衛戦が発生
- 魔法塔: 魔法系ユニットや特殊イベント
- 遺跡: アイテム、資金、隠し分岐
- 街道: 通常遭遇戦
- 橋・崩落路: 進軍制限、迂回ルート
- 分岐標識: プレイヤーの進路選択地点

マップ上では複数の味方小隊を動かせるが、MVPでは選択可能な小隊数を絞る。敵もルート上を巡回し、接触すると戦闘画面に移行する。

CHAOS FRAMEは、街や砦の解放順、撤退回数、倒した敵、イベント選択で変動する。高い場合は秩序寄りの支援や報酬、低い場合は混沌寄りの強力な選択肢が出現する。

## アートとサウンド方針

アートは「ファミコンMMC5で拡張された、1991年の高密度ドットRPG」を目指す。ただし実装上は16-bit風の見やすさを優先する。

ビジュアル方針。

- ユニットは16x16ドット基準
- 前衛・後衛の識別を最優先
- 味方は青、白、金を中心に識別
- 敵は緑、赤、紫を中心に識別
- UIは黒背景、銀青フレーム、金色アクセント
- 回復魔法はシアン白
- 敵魔法は赤紫
- 背景はコバルト空、白雲、ラベンダー灰の石畳

サウンド方針。

- BGMは短いループのファンタジー進軍曲
- 戦闘中はテンポを少し上げた小隊戦テーマ
- 回復魔法は高音のアルペジオ
- 敵魔法詠唱は低く不安定なパルス音
- コマンド選択は短い矩形波SE
- HP低下時は控えめな警告音

音数はファミコン風に制限し、BGMとSEが干渉しすぎないようにする。

## MVPスコープ

MVPでは、確定画面の体験を再現することを最優先とする。

実装対象。

- 4:3の戦闘画面レイアウト
- 上部フィールド、下部ステータスUI
- 味方3体、敵3体の固定編成
- FIGHT / MAGIC / WAIT / RETREATの基本コマンド
- HPバー
- 行動順表示
- CAST GAUGE
- 白魔道士の回復詠唱
- 騎士の防御・かばう挙動
- 敵マジシャンの詠唱攻撃
- 1ステージ分の空中大陸分岐マップ
- 砦ノード、街道ノード、魔法塔ノード
- 戦闘勝利、敗北、撤退の結果処理

MVPでは以下は簡略化する。

- 小隊編成の自由度
- 装備変更
- 複雑なクラスチェンジ
- 複数章のキャンペーン
- CHAOS FRAMEの大規模分岐
- 多数ユニット同時進軍

まずは「分岐マップで接敵し、3対3の半自動バトルで白魔道士の回復と前衛防衛が機能する」状態を完成基準とする。

## 未決事項

- 実際の解像度をファミコン準拠に寄せるか、現代向けに拡大前提で設計するか
- 戦闘中のコマンド選択時に時間を完全停止するか、低速化に留めるか
- MAGICをユニット別に選ばせるか、小隊方針としてまとめて選ばせるか
- 白魔道士の回復対象を自動選択にするか、手動指定可能にするか
- 騎士のかばう発動条件
- 敵マジシャンの魔法が単体攻撃か範囲攻撃か
- RETREAT失敗時のペナルティ
- CHAOS FRAMEの具体的な変動条件
- 小隊数の上限
- 1ステージあたりの標準プレイ時間
- クラス名や世界観用語をどこまで独自化するか
- 8bit風と16bit風の最終的なアート基準
- 実装時に本物の低解像度ドット素材を使うか、高解像度のピクセルアート風素材を使うか

## 生成と相談の経緯

## Route 1: MMC5 空中大陸ルート選択RTS
kind: root
prompt:
16-bit game UI mockup of an alternate-history 1991 Famicom fantasy RTS, Final Fantasy-like world map as a real-time strategy game, simplified Legendary Ogre Battle mechanics. Screen composition: upper field area displays floating continent terrain in 8-bit tiles, cloud gaps, mountain passes, magic towers, ruins, and multiple branching paths that feel like a campaign route map. Blue allied 16x16 pixel units stand at crossroads with tiny chocobo cavalry, black mage, warrior, and dragoon silhouettes; red enemy 16x16 pixel units guard fortress nodes and patrol branch routes. Lower screen is a large status window with black background, silver-blue pixel frame, selected squad list, leader class, HP/MP values, formation slots, morale star icons, and destination command. HUD at top edge: TIME 12:40, FUNDS, UNIT, CHAOS FRAME, and a flashing square cursor. Colors: cobalt sky, pale clouds, lavender mountains, gold UI accents, ruby enemy flags, cyan magic highlights. Genre: retro tactical RTS RPG field command screen, Famicom MMC5 enhanced sprite density, sharp pixel art, authentic 4:3 game screenshot.

Create a polished game screen mockup, 16-bit console RPG/action UI, pixel-art inspired interface, visible HUD, readable menu/status elements, branching route map motif, no real brand logos, high detail, cohesive game screenshot composition.
consultations:
  - Q: このゲームの戦闘画面を生成したいのでプロンプト作って。ファミコンなのでユニットは３体で構成、前衛に戦士、騎士、後衛に白魔道士。敵もユニットで前衛にゴブリン２体、後衛にマジシャン１体。MMC５チップの仕様で下にステータス、画面上部はゲーム画面
    A: 戦闘画面は「RTSマップから接敵して、半自動バトルに切り替わった瞬間」が一番フックになります。ファミコン風に寄せるなら、キャラは小さくても陣形と役割が一目で分かることが重要です。

画面構成案:

上部ゲーム画面は、横向きの小さな戦闘フィールド。左に味方3体、右に敵3体を配置。味方は前衛に戦士と騎士、後衛に白魔道士。敵は前衛にゴブリン2体、後衛にマジシャン。各キャラは16x16ドット程度で、前後列が分かるように少し斜め配置にすると読みやすいです。

背景は空中大陸の街道、雲海、崩れた石橋、魔法塔の遠景などにすると、元のマップ画面との連続感が出ます。戦闘中でも「分岐マップの途中で遭遇した」感じが残ります。

下部ステータスは黒背景＋銀青フレーム。左側に味方3人のHPバー、中央に選択中コマンド、右側に敵ユニット情報やターン/行動ゲージを置くと、RTS寄りの忙しさが出ます。ファミコン想定なら情報量は絞り、「FIGHT / MAGIC / WAIT / RETREAT」くらいが読みやすいです。

見せ場としては、白魔道士が後列から回復魔法を詠唱していて、騎士が盾で前線を支え、戦士がゴブリンへ斬りかかる瞬間が良いです。敵マジシャンは後列で赤紫の魔法を溜めていると、プレイヤーに「早く後衛を潰したい」と思わせられます。

プロンプトの方向性としては、元画像より少し画面密度を下げ、戦闘UIの読みやすさを優先すると実装イメージに使いやすくなります。

次の編集指示案:

1. ファミコンMMC5風の16-bit戦闘画面、上部に空中大陸の街道で3対3の小隊バトル、左に味方の戦士・騎士・白魔道士、右に敵のゴブリン2体・マジシャン、下部に黒背景のHPステータスUI

2. 1991年発売の架空ファンタジーRTS RPG戦闘画面、16x16ドットの小型ユニット、前衛後衛の陣形が分かる横向きバトル、白魔道士が回復詠唱、敵マジシャンが魔法を溜める、読みやすいファミコン風HUD

3. 空中大陸ルート上で接敵した戦闘シーン、上画面は雲海と石畳の戦場、味方3人編成と敵3体編成の半自動バトル、下画面にHPバー・行動コマンド・小隊名を表示、銀青フレームと金色アクセントのレトロゲームUI

## Route 2: 白魔道士の回復詠唱と前衛防衛
kind: branch
prompt:
Polished 16-bit console RPG/action UI mockup, alternate-history 1991 Famicom fantasy real-time strategy RPG battle scene, simplified squad mechanics, no real brand logos. The upper half is a clean side-view tactical battle field on an aerial continent route: stone-paved road tiles, clouds drifting under the battlefield, broken bridge edge, forked road sign in the background, small fortress node and magic tower silhouette to imply a branching route map encounter. Allied party on the left uses tiny 16x16 pixel sprites with clear formation spacing: front-left warrior lunging toward a goblin, front-right knight bracing with shield, rear white mage raising a staff with cyan-white healing particles. Enemy party on the right: two goblins in the front row, rear magician holding a red-purple spell orb. The lower half is a readable black status screen with silver-blue frame: ally HP bars stacked on the left, selected command window in the center with FIGHT / MAGIC / WAIT / RETREAT, right panel shows ENEMY SQUAD, CAST gauge, and small turn/action meters. Top HUD: TIME 12:40, FUNDS, UNIT 03, CHAOS, and flashing cursor. Color palette: cobalt and teal sky, pale cloud whites, lavender-gray stone, gold UI trim, ruby enemy flags, cyan healing magic. Genre: retro RTS RPG battle command screen, Famicom MMC5 enhanced sprite density, 4:3 pixel-art screenshot, lower visual density for strong UI readability.

Create a polished game screen mockup, 16-bit console RPG/action UI, pixel-art inspired interface, visible HUD, readable menu/status elements, branching route map motif, no real brand logos, high detail, cohesive game screenshot composition.
consultations: none
