---
paths:
  - "convex/**/*.ts"
---

# Convex バックエンド規約（公式ガイドライン準拠）

> 参照: [Convex AI Code Generation](https://docs.convex.dev/ai)

## 関数構文

### ✅ 新しい関数構文を必ず使用

```ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const myQuery = query({
  args: { name: v.string() },
  returns: v.string(),  // 必ず returns を指定
  handler: async (ctx, args) => {
    return "Hello " + args.name;
  },
});
```

### ⚠️ 返り値がない場合も `returns: v.null()` を指定

```ts
export const doSomething = mutation({
  args: {},
  returns: v.null(),  // 必須
  handler: async (ctx, args) => {
    console.log("Done");
    return null;  // 明示的に null を返す
  },
});
```

## 関数の種類

| 関数 | 用途 | 公開範囲 |
|------|------|---------|
| `query` | 読み取り専用 | 公開 API |
| `mutation` | データ変更 | 公開 API |
| `action` | 外部 API 呼び出し | 公開 API |
| `internalQuery` | 内部読み取り | 非公開 |
| `internalMutation` | 内部変更 | 非公開 |
| `internalAction` | 内部アクション | 非公開 |

### 関数参照

```ts
import { api, internal } from "./_generated/api";

// 公開関数の参照
api.books.list

// 内部関数の参照
internal.books.processInternal
```

## バリデータ一覧（公式）

| Convex 型 | TypeScript 型 | バリデータ | 備考 |
|-----------|--------------|-----------|------|
| Id | string | `v.id("tableName")` | テーブル名を指定 |
| Null | null | `v.null()` | `undefined` は使用不可 |
| Int64 | bigint | `v.int64()` | `v.bigint()` は非推奨 |
| Float64 | number | `v.number()` | |
| Boolean | boolean | `v.boolean()` | |
| String | string | `v.string()` | |
| Bytes | ArrayBuffer | `v.bytes()` | |
| Array | Array | `v.array(v.string())` | 最大 8192 要素 |
| Object | Object | `v.object({...})` | 最大 1024 フィールド |
| Record | Record | `v.record(keys, values)` | |

### ⚠️ 存在しない・非推奨バリデータ

- ~~`v.integer()`~~ → `v.number()` または `v.int64()`
- ~~`v.date()`~~ → `v.number()` (Unix ミリ秒)
- ~~`v.bigint()`~~ → `v.int64()` を使用
- ~~`v.map()`~~, ~~`v.set()`~~ → サポート外

## スキーマ設計

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  })
    .index("by_email", ["email"]),  // インデックス名にフィールド名を含める

  books: defineTable({
    title: v.string(),
    ownerId: v.id("users"),
    sortOrder: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_sortOrder", ["ownerId", "sortOrder"]),
});
```

### システムフィールド（自動生成）

- `_id`: `v.id("tableName")` 型
- `_creationTime`: `v.number()` 型（Unix ミリ秒）

## クエリ

### ❌ 間違い: filter を使う

```ts
// BAD: フルスキャンになる
const books = await ctx.db
  .query("books")
  .filter((q) => q.eq(q.field("ownerId"), userId))
  .collect();
```

### ✅ 正解: withIndex を使う

```ts
// GOOD: インデックスを使用
const books = await ctx.db
  .query("books")
  .withIndex("by_owner", (q) => q.eq("ownerId", userId))
  .order("desc")
  .collect();
```

### 順序

- デフォルトは `_creationTime` 昇順
- `.order("asc")` または `.order("desc")` で指定

### 単一ドキュメント取得

```ts
// 一意のドキュメントを取得（複数あればエラー）
const user = await ctx.db
  .query("users")
  .withIndex("by_email", (q) => q.eq("email", email))
  .unique();

// ID で直接取得
const book = await ctx.db.get(bookId);
```

## ミューテーション

```ts
// 挿入
const id = await ctx.db.insert("books", { title: "新しい本", ownerId: user._id });

// 部分更新（マージ）
await ctx.db.patch(bookId, { title: "更新後のタイトル" });

// 完全置換
await ctx.db.replace(bookId, { title: "完全置換", ownerId: user._id });

// 削除
await ctx.db.delete(bookId);
```

### ⚠️ 削除は collect してループ

```ts
// Convex は .delete() をサポートしない
const entries = await ctx.db
  .query("diaryEntries")
  .withIndex("by_book", (q) => q.eq("bookId", bookId))
  .collect();

for (const entry of entries) {
  await ctx.db.delete(entry._id);
}
```

## 関数呼び出し

```ts
// クエリからクエリを呼ぶ
const result: string = await ctx.runQuery(api.example.myQuery, { name: "Bob" });

// ミューテーションからミューテーションを呼ぶ
await ctx.runMutation(api.example.myMutation, { id: someId });

// アクションからクエリ/ミューテーションを呼ぶ
await ctx.runQuery(api.example.myQuery, {});
await ctx.runMutation(api.example.myMutation, {});
```

## アクション（外部 API）

```ts
// Node.js モジュールを使う場合は先頭に追加
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const callExternalAPI = action({
  args: { prompt: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    // ⚠️ ctx.db は使用不可
    const response = await fetch("https://api.example.com/...");
    return await response.text();
  },
});
```

## 認証（このプロジェクト固有）

```ts
import { getAuthenticatedUser, getOptionalUser } from "./lib/auth";

// 認証必須
export const createBook = mutation({
  args: { title: v.string() },
  returns: v.id("books"),
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db.insert("books", {
      title: args.title,
      ownerId: user._id,
    });
  },
});

// 認証オプショナル
export const listMyBooks = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("books"),
    _creationTime: v.number(),
    title: v.string(),
    ownerId: v.id("users"),
  })),
  handler: async (ctx) => {
    const user = await getOptionalUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("books")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();
  },
});
```

## スキーママイグレーション

スキーマのフィールド追加・削除・型変更時は `.claude/rules/convex-migration.md` ルールに従う（`convex/schema.ts` / `convex/migrations.ts` 編集時に自動適用）。

## TypeScript 型

```ts
import { Id, Doc } from "./_generated/dataModel";

// ID 型
const bookId: Id<"books"> = ...;

// ドキュメント型
const book: Doc<"books"> = await ctx.db.get(bookId);

// Record 型
const map: Record<Id<"users">, string> = {};
```
