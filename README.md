# nica家タロットアプリ

nica家の大アルカナ22枚をもとにした、六芒星スプレッド中心のタロットリーディングアプリです。  
現在は「過去 / 現在 / 未来 / 手段 / マインドセット / 全体運勢」の6枚読みを軸に、ローカル読解だけでも動き、必要なら OpenAI API で文章だけ強化できます。

## できること

- 六芒星スプレッドで6つの位置から流れを読む
- nica家メンバー対応のカスタム大アルカナ22枚を表示する
- 総合コメントを最上部に出して、結論から読み始められる
- 読解結果をブラウザ内履歴に保存する
- 共有画像を書き出す
- OpenAI API をつないだ時だけ、文章の自然さや説得力を強化する

## まずはローカルだけで動かす

### 1. 必要なもの

- Node.js
- npm

Node.js を入れたら、プロジェクトフォルダで次を実行します。

```bash
npm install
```

### 2. 開発サーバーを起動する

通常はこれです。

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

## AI文章強化つきで動かす

### 1. OpenAI APIキーを用意する

- [OpenAI Platform](https://platform.openai.com/) にログイン
- APIキーを作成
- 課金設定が未設定なら有効化

このアプリは、カード抽選や基本解釈はローカルで行い、文章だけを OpenAI API に送って整える構成です。  
そのため、APIがなくても動きますが、文章品質を担保したいなら API 連携がおすすめです。

### 2. `.env` を設定する

`.env.example` を参考に、プロジェクト直下に `.env` を置きます。

```env
VITE_ENABLE_AI=true
OPENAI_API_KEY=あなたのAPIキー
OPENAI_MODEL=gpt-5.4-mini
```

補足:

- `VITE_ENABLE_AI=true` でフロント側の AI トグルが有効になります
- `OPENAI_API_KEY` は公開しないでください
- `OPENAI_MODEL` は必要に応じて変更できます

### 3. APIサーバーを起動する

フロントとは別ターミナルで次を実行します。

```bash
npm run dev:api
```

### 4. フロントを起動する

別ターミナルで次を実行します。

```bash
npm run dev
```

アプリ上で `AI文章強化を使う` をオンにすると、ローカル抽選結果をもとに文章だけ AI が整えます。

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
- `src/components/ResultPanel.tsx`
  - 六芒星表示と結果表示
- `src/components/HistoryPanel.tsx`
  - 履歴表示
- `src/components/TarotCardFace.tsx`
  - カード面の描画
- `src/lib/readingEngine.ts`
  - ローカル読解ロジック
- `src/lib/ai.ts`
  - AI文章強化のフロント側処理
- `server.mjs`
  - OpenAI Responses API への接続

## よくあるつまずき

### `カードを引いて読む` が押せない

- 質問欄が空だと押せません
- まず質問を1文入れてください

### `AI連携に失敗したため、ローカル読解で表示しています` と出る

次のどれかです。

- `.env` の `OPENAI_API_KEY` が未設定
- `VITE_ENABLE_AI=true` になっていない
- `npm run dev:api` を起動していない
- APIの課金設定や利用上限の問題

この場合でも、ローカル読解だけでアプリ自体は使えます。

### PowerShellで `npm run dev` が動かない

次で代用できます。

```bash
cmd /c npm run dev
```

## 補足

- 読解履歴はブラウザのローカルストレージに保存されます
- APIキーは `.env` に入れ、公開リポジトリへは絶対に上げないでください
- 現在の主力スプレッドは六芒星スプレッドです
