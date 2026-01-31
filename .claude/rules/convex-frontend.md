---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# Convex フロントエンド規約（公式ガイドライン準拠）

> 参照: [Convex AI Code Generation](https://docs.convex.dev/ai)

## クエリ

### ❌ 間違い: 引数を省略

```tsx
// BAD: 引数なしはエラー
const books = useQuery(api.books.listMyBooks);
```

### ✅ 正解: 必ず引数を渡す

```tsx
// GOOD: 空でも {} を渡す
const books = useQuery(api.books.listMyBooks, {});

// GOOD: 条件付きスキップ（認証チェック）
import { useAuth } from "@clerk/clerk-react";

const { isSignedIn } = useAuth();
const books = useQuery(api.books.listMyBooks, isSignedIn ? {} : "skip");
```

### ローディング状態

```tsx
const books = useQuery(api.books.listMyBooks, {});

// undefined = ローディング中
if (books === undefined) {
  return <p>読み込み中...</p>;
}

// 空配列 = データなし
if (books.length === 0) {
  return <p>データがありません</p>;
}

// データあり
return books.map((book) => <div key={book._id}>{book.title}</div>);
```

## ミューテーション

```tsx
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const createBook = useMutation(api.books.createBook);

const handleCreate = async () => {
  try {
    const bookId = await createBook({ title: "新しい本" });
    console.log("Created:", bookId);
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

## 型の使い方

### ✅ Convex 生成型を使う

```tsx
import type { Id, Doc } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

// ID 型
function handleBookClick(bookId: Id<"books">) {
  // ...
}

// State の型
const [selectedBook, setSelectedBook] = useState<Id<"books"> | null>(null);

// ドキュメント型
const [book, setBook] = useState<Doc<"books"> | null>(null);
```

### ❌ 間違い: any や型アサーション

```tsx
// BAD
const bookId = params.bookId as any;
const data = response as BookData;
```

### ✅ 正解: 適切な型を使用

```tsx
// GOOD
const bookId = params.bookId as Id<"books">;  // Convex ID 型
```

## インポートパス

```tsx
// API（関数参照）
import { api } from "../../convex/_generated/api";

// 型
import type { Id, Doc } from "../../convex/_generated/dataModel";

// フック
import { useQuery, useMutation } from "convex/react";
```

## ページネーション

```tsx
import { usePaginatedQuery } from "convex/react";

function MessageList() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.list,
    { channelId },
    { initialNumItems: 20 }
  );

  return (
    <div>
      {results.map((msg) => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(20)}>もっと読み込む</button>
      )}
      {status === "LoadingMore" && <p>読み込み中...</p>}
    </div>
  );
}
```

## リアルタイム更新

Convex クエリは自動的にリアルタイム更新される。追加の設定は不要。

```tsx
// このクエリは自動的にリアルタイム更新される
const messages = useQuery(api.messages.list, { channelId });
```

## アクション呼び出し

```tsx
import { useAction } from "convex/react";

const generateReport = useAction(api.reports.generate);

const handleGenerate = async () => {
  const result = await generateReport({ type: "monthly" });
};
```

## ファイルアップロード

```tsx
import { useMutation } from "convex/react";

const generateUploadUrl = useMutation(api.files.generateUploadUrl);

const handleUpload = async (file: File) => {
  // 1. アップロード URL を取得
  const url = await generateUploadUrl();

  // 2. ファイルをアップロード
  const result = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await result.json();
  return storageId;
};
```

## エラーハンドリング

```tsx
const createBook = useMutation(api.books.createBook);

const handleCreate = async () => {
  try {
    await createBook({ title });
  } catch (error) {
    if (error instanceof Error) {
      // Convex からのエラーメッセージ
      alert(error.message);
    }
  }
};
```
