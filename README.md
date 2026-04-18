# nica家タロットアプリ

nica家の大アルカナ22枚をもとにした、六芒星スプレッド中心のタロットリーディングアプリです。  
現在は `過去 / 現在 / 未来 / 手段 / マインドセット / 全体運勢` の6枚読みを軸に、ローカル読解だけで完結する公開版として動いています。

## できること

- 六芒星スプレッドで6つの位置から流れを読む
- 裏向きカードから1枚を選ぶ儀式ステップを挟んで結果へ進む
- nica家対応のカスタム大アルカナ22枚を表示する
- 総合コメントを上部に出して、結論から読み始められる
- 共有画像を書き出す
- 効果音とBGMの ON / OFF を切り替える

## 起動方法

### 1. 必要なもの

- Node.js
- npm

### 2. 依存関係を入れる

プロジェクトフォルダで次を実行します。

```bash
npm install
```

### 3. 開発サーバーを起動する

```bash
npm run dev
```

PowerShell で `npm.ps1` の実行エラーが出る場合は、次のどちらかで起動できます。

```bash
cmd /c npm run dev
```

または

```bash
npm.cmd run dev
```

起動後、表示された `http://localhost:5173` をブラウザで開けば使えます。

## 品質確認コマンド

```bash
npm run lint
npm run test
npm run build
```

## 現在の構成

- `src/App.tsx`
  - 画面全体の状態管理
- `src/components/InputPanel.tsx`
  - 入力フォーム
- `src/components/CardSelectionStage.tsx`
  - 一枚選ぶ儀式ステップ
- `src/components/ResultPanel.tsx`
  - 六芒星表示と結果表示
- `src/components/HistoryPanel.tsx`
  - この画面を開いている間の履歴表示
- `src/components/TarotCardFace.tsx`
  - カード面の描画
- `src/lib/readingEngine.ts`
  - ローカル読解ロジック
- `src/lib/share.ts`
  - 共有画像の生成
- `src/lib/useSoundEffects.ts`
  - 効果音とBGMの制御

## よくあるつまずき

### `カードを引いて読む` が押せない

- 質問欄が空だと押せません
- まず質問を1文入れてください

### 履歴が次に開いた時に残らない

現在の公開版では、履歴はこの画面を開いている間だけ保持されます。  
ページ再読み込み後も残す保存機能は、まだ入れていません。

### PowerShellで `npm run dev` が動かない

次で代用できます。

```bash
cmd /c npm run dev
```

または

```bash
npm.cmd run dev
```

## 補足

- この公開版は非AI版です
- APIキーやサーバー設定なしでそのまま動きます
- 現在の主力スプレッドは六芒星スプレッドです
