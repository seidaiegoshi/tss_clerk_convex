---
paths:
  - "src/routes/**/*.tsx"
  - "src/components/**/*.tsx"
---

# レイアウト・CSS ルール

## 全画面レイアウトの高さ指定

ページコンポーネントは `__root.tsx` の `<main>` 内にレンダリングされる。

```
__root.tsx:
div (h-dvh, flex flex-col, overflow-hidden)
├── Header (h-12, sticky)
└── main (flex-1, overflow-y-auto)
    └── <Outlet /> ← ページはここに入る
```

### モバイルキーボード対応

- viewport メタタグに `interactive-widget=resizes-content` を指定済み
- ルートコンテナは `h-dvh`（dynamic viewport height）を使用
- キーボード表示時にレイアウトが自動的にリサイズされる
- `h-screen`（= `100vh`）はキーボード表示時にリサイズされないため使わない

- ページに `h-[100dvh]` を直接指定してはいけない。Header 分はみ出して `<main>` がスクロール可能になり、ヘッダー固定が壊れる
- 代わりに `h-full` を使い、`<main>` の高さにフィットさせる
- `h-full` が機能するには親に明示的な `height` が必要。`min-h-screen` だけでは `height` が伝播しない

## スクロール領域の設計

- スクロール領域は `flex-1 min-h-0 overflow-y-auto` で作る
- 固定ヘッダーはスクロール領域の外に `flex-none` で配置する
- スクロール内で固定したい要素は `sticky top-0` を使う

## Popover / Portal のスクロール伝播

Radix の Popover は Portal で `<body>` 直下にレンダリングされる。

- Popover 上でのホイールスクロールはブラウザのスクロールチェインにより背景に伝播する
- `stopPropagation()` はスクロールチェインには効かない（DOM イベント伝播とは別の仕組み）
- `preventDefault()` を使ってブラウザのデフォルトスクロール動作を阻止する

## レイアウト修正時のチェックリスト

1. `__root.tsx` のルートレイアウトから高さ伝播チェーンを確認する
2. 該当ページが `<main>` 内のどこにレンダリングされるか確認する
3. `height: 100%` が機能するには親に明示的な `height` が必要であることを忘れない
4. 修正後、他のページへの影響がないか確認する
