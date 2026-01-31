---
paths:
  - "convex/schema.ts"
  - "convex/migrations.ts"
---

# Convex スキーママイグレーション規約

Railway セルフホスト環境での Convex スキーマ変更手順。

## 前提

- `@convex-dev/migrations` コンポーネント導入済み
- Railway のビルドコマンドに `npx convex run migrations:run` を組み込み済み

## フィールドの追加

### optional フィールド → 1回のプッシュで完了

```typescript
// schema.ts に追加するだけ
newField: v.optional(v.string()),
```

### required フィールド → 2回のプッシュが必要

#### Push 1

1. スキーマに optional で追加
2. マイグレーション関数でデフォルト値を設定
3. コードは optional として扱う

```typescript
// convex/migrations.ts
export const addDefaultNewField = migrations.define({
  table: "tableName",
  migrateOne: (_ctx, doc) => {
    if (doc.newField !== undefined) return
    return { newField: "default" }
  },
})
```

#### Push 2（マイグレーション完了後）

1. スキーマを required に変更
2. マイグレーション関数を削除

## フィールドの削除

### 2回のプッシュが必要

#### Push 1

1. スキーマでフィールドを optional に変更
2. マイグレーション関数でフィールドを削除（`undefined` を返す）
3. コードからフィールドの参照を除去

```typescript
// convex/migrations.ts
export const removeOldField = migrations.define({
  table: "tableName",
  migrateOne: () => ({
    oldField: undefined as FieldType | undefined,
  }),
})
```

#### Push 2（マイグレーション完了後）

1. スキーマからフィールド定義を削除
2. マイグレーション関数を削除

## フィールドのリネーム / 型変更

### 2回のプッシュが必要

#### Push 1

1. 新フィールドを optional でスキーマに追加
2. 旧フィールドを optional に変更
3. マイグレーション関数で旧→新の変換 + 旧フィールド削除
4. コードで `resolveXxx()` のようなフォールバック関数を使う

```typescript
// convex/migrations.ts
export const renameField = migrations.define({
  table: "tableName",
  migrateOne: (_ctx, doc) => {
    if (doc.newField !== undefined) return
    return {
      newField: convertValue(doc.oldField),
      oldField: undefined as OldType | undefined,
    }
  },
})
```

#### Push 2（マイグレーション完了後）

1. 新フィールドを required に変更
2. 旧フィールドをスキーマから削除
3. フォールバック関数を削除
4. マイグレーション関数を削除

## Railway デプロイの流れ

```
git push
  └→ Railway ビルド開始
       ├→ npx convex deploy (スキーマ + 関数をデプロイ)
       ├→ npx convex run migrations:run (マイグレーション実行)
       └→ npm run build (フロントエンドビルド)
```

`migrations:run` は全マイグレーションを順次実行する。
実行済みのマイグレーションは自動スキップされる。

## ブランチ運用ルール（重要）

Railway セルフホスト環境では、Push 1 と Push 2 を**必ず別PRに分ける**。

### なぜ分ける必要があるか

develop ブランチで Push 1 → Push 2 を順に行っても、main にマージするときは
1回のプッシュにまとめられる。main の DB はまだマイグレーション前のため、
Push 2 のスキーマ（required フィールド、旧フィールド削除）でデプロイが失敗する。

### 正しいフロー

```
PR1: 中間スキーマ + マイグレーション + フォールバックコード
  ├→ develop マージ → デプロイ → マイグレーション実行
  └→ main マージ → デプロイ → マイグレーション実行
      （中間スキーマは旧データと互換性があるため成功する）

── main のビルドログでマイグレーション成功を確認 ──

PR2: クリーンアップ（別PR）
  ├→ 新フィールドを required に変更
  ├→ 旧フィールドをスキーマから削除
  ├→ resolveXxx() フォールバック関数を削除
  └→ マイグレーション関数を削除
```

### PR1 に含めるもの

| 変更 | 目的 |
|------|------|
| スキーマで旧フィールドを optional に変更 | 旧データとの互換性 |
| スキーマに新フィールドを optional で追加 | 新データとの互換性 |
| マイグレーション関数を定義 | データ変換 |
| `resolveXxx()` フォールバック関数 | マイグレーション前後の両方で動作 |
| クエリ/ミューテーションでフォールバック使用 | ランタイム互換性 |

### PR2 に含めるもの

| 変更 | 目的 |
|------|------|
| 新フィールドを required に変更 | スキーマ正規化 |
| 旧フィールドをスキーマから削除 | 不要フィールド除去 |
| `resolveXxx()` 関数を削除 | フォールバック不要 |
| マイグレーション関数を削除 | 実行済みのため不要 |
| レガシーフォールバッククエリを削除 | 旧データなし |

## Push 2 のタイミング

Railway のビルドログで以下を確認してから Push 2（別PR）を作成する：

1. `convex deploy` 成功
2. マイグレーションのログ出力（件数など）
3. `npm run build` 成功
4. アプリの動作確認

## マイグレーション関数の書き方

```typescript
// convex/migrations.ts
import { Migrations } from "@convex-dev/migrations"
import { components } from "./_generated/api"
import { internal } from "./_generated/api"
import type { DataModel } from "./_generated/dataModel"

export const migrations = new Migrations<DataModel>(components.migrations)

// runner() には実行対象のマイグレーションを明示的に渡す
export const run = migrations.runner(
  internal.migrations.myMigration,
)

// 個別マイグレーション定義
export const myMigration = migrations.define({
  table: "tableName",
  migrateOne: (_ctx, doc) => {
    // undefined を返す → スキップ
    // オブジェクトを返す → db.patch() として適用
    // undefined 値のフィールド → そのフィールドを削除
  },
})
```

## 注意事項

- Convex はデプロイ時に全ドキュメントをスキーマと照合する。一致しないとデプロイ失敗
- `db.patch({ field: undefined })` でフィールドを物理削除できる
- マイグレーションコンポーネントはバッチ処理・再開・進捗管理を自動化する
- `schemaValidation: false` は全バリデーションを無効化するため非推奨
