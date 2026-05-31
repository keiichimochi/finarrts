# Fainal Fantasy RTS: Skyfront

NEOFAMI向けの架空1991年ファンタジーRTS RPG MVPです。

- `fainalfantasyrts.neofami/`: NEOFAMIカートリッジ作業ディレクトリ
- `fainalfantasyrts.neofami.zip`: ZIP化した提出用カートリッジ
- `preview/`: ブラウザで遊べる確認用Canvas版。NEOFAMI提出物ではなく、操作感確認用の簡易ランタイムです。

## 操作

- 矢印キー: ルート/コマンド選択
- `Z` または `Enter`: Aボタン
- `X` または `Backspace`: Bボタン
- `Space`: START

## MVP内容

分岐マップから接敵し、味方3体と敵3体の半自動バトルに入ります。FIGHT / MAGIC / WAIT / RETREAT、白魔道士の回復詠唱、騎士の防御、敵マジシャンのCAST GAUGE、勝利/敗北/撤退結果を実装しています。

## Hardware Spec

`files/NEOFAMI_proposal.md` に基づき、グラフィック仕様を NEOFAMI v0.2 / SMS+ 16-color mode へ更新しました。

- 256x240固定、8x8パターン基準
- 16x16マップチップは8x8パターン4枚で構成
- 1スプライト/1BGチップあたり16色まで
- 各スプライト独自パレット
- NES 54色 + SMS 64色 + RGBの拡張パレット
- 強化グラフィック: `fainalfantasyrts.neofami/assets/enhanced/sms_skylands/`

## Third-Party Font

UIフォントには8x8ドット日本語フォント「美咲フォント」PNG版を使用しています。

- 配布元: https://littlelimit.net/misaki.htm
- Copyright(C) 2002-2021 Num Kadoma
- ライセンス文書: `third_party/misaki/misaki.txt`
