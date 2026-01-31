---
paths:
  - "src/routes/**/*.tsx"
---

# TanStack Router 規約（公式ガイドライン準拠）

> 参照: [TanStack Router LLM Support](https://tanstack.com/router/v1/docs/framework/react/llm-support)

## 公式ルールのインストール（推奨）

TanStack は vibe-rules を通じて公式ルールを配布しています：

```bash
# vibe-rules をインストール
pnpm add -g vibe-rules

# Claude Code 用にルールをインストール
vibe-rules install --editor claude-code
```

## ファイルベースルーティング

### ❌ 間違い: createRoute を使う

```tsx
// ファイルベースルーティングでは使わない
import { createRoute } from "@tanstack/react-router";
const route = createRoute({ ... });
```

### ✅ 正解: createFileRoute を使う

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});
```

## ルートファイルの構造

```
src/routes/
├── __root.tsx          # ルートレイアウト
├── index.tsx           # / (ホーム)
├── dashboard.tsx       # /dashboard
└── books/
    ├── index.tsx       # /books
    └── $bookId/
        ├── index.tsx   # /books/:bookId
        └── settings.tsx # /books/:bookId/settings
```

## パスパラメータ

```tsx
// ファイル: src/routes/books/$bookId/index.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$bookId/")({
  component: BookPage,
});

function BookPage() {
  // Route.useParams() でパラメータ取得
  const { bookId } = Route.useParams();
  return <div>Book ID: {bookId}</div>;
}
```

## ナビゲーション

### 宣言的（Link コンポーネント）

```tsx
import { Link } from "@tanstack/react-router";

// 静的パス
<Link to="/dashboard">Dashboard</Link>

// 動的パス（params 必須）
<Link to="/books/$bookId" params={{ bookId: "123" }}>
  View Book
</Link>

// 検索パラメータ付き
<Link to="/books" search={{ sort: "title" }}>
  Books
</Link>
```

### プログラマティック（useNavigate）

```tsx
import { useNavigate } from "@tanstack/react-router";

function BookCard({ bookId }: { bookId: string }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: "/books/$bookId", params: { bookId } });
  };

  return <button onClick={handleClick}>View</button>;
}
```

## ルートレイアウト

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />  {/* 子ルートがここにレンダリング */}
      </main>
      <Footer />
    </>
  );
}
```

## データローディング（loader）

```tsx
export const Route = createFileRoute("/books/$bookId/")({
  loader: async ({ params }) => {
    // ルートレンダリング前にデータ取得
    return await fetchBook(params.bookId);
  },
  component: BookPage,
});

function BookPage() {
  // loader で取得したデータを使用
  const book = Route.useLoaderData();
  return <div>{book.title}</div>;
}
```

## 検索パラメータ（Search Params）

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// 検索パラメータのスキーマを定義
const searchSchema = z.object({
  sort: z.enum(["title", "date"]).optional(),
  page: z.number().optional().default(1),
});

export const Route = createFileRoute("/books/")({
  validateSearch: searchSchema,
  component: BooksPage,
});

function BooksPage() {
  const { sort, page } = Route.useSearch();
  // sort と page が型安全に使える
}
```

## ページコンポーネント構造（このプロジェクト）

```tsx
// 薄いページコンポーネント
function DashboardPage() {
  return (
    <>
      <SignedOut>
        <Navigate to="/" />
      </SignedOut>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
    </>
  );
}

// 実際のコンテンツは分離
function DashboardContent() {
  const { isSignedIn } = useAuth();
  const data = useQuery(api.xxx, isSignedIn ? {} : "skip");
  // ...
}
```

## 主要ファイル

| ファイル | 説明 |
|---------|------|
| `src/routes/` | ルートファイル（ファイルベース） |
| `src/routes/__root.tsx` | ルートレイアウト |
| `src/routeTree.gen.ts` | 自動生成されるルートツリー（編集不可） |

## 型安全性

TanStack Router は完全な型安全性を提供：

- `to` プロパティは有効なルートのみ許可
- `params` は必要なパラメータのみ要求
- `search` は定義されたスキーマに基づく

```tsx
// 型エラー: /invalid-route は存在しない
<Link to="/invalid-route">Error</Link>

// 型エラー: bookId が不足
<Link to="/books/$bookId">Error</Link>

// OK
<Link to="/books/$bookId" params={{ bookId: "123" }}>OK</Link>
```
