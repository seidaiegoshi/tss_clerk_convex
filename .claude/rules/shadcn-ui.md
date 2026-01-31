---
paths:
  - "src/components/**/*.tsx"
---

# shadcn/ui 規約

## コンポーネント追加

```bash
npx shadcn@latest add button
```

## ディレクトリ構成

- `src/components/ui/` — shadcn プリミティブ（button, input, dialog など）
- `src/components/` — アプリ固有コンポーネント

## スタイリング

- Tailwind CSS v4 を使用
- クラス合成には `cn()` ヘルパーを使う

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", condition && "conditional-class")} />
```

## コンポーネント設計原則

1. **UI コンポーネントは表示に特化** — ロジックは上位へ
2. **Props でカスタマイズ可能に** — className, variant など
3. **アクセシビリティを考慮** — Radix UI のプリミティブを活用

## よく使うコンポーネント

| コンポーネント | 用途 |
|---------------|------|
| `Button` | ボタン |
| `Card` | カード |
| `Dialog` | モーダル |
| `Input` | テキスト入力 |
| `Select` | セレクトボックス |
| `Table` | テーブル |
