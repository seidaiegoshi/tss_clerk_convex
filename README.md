# Base Template

TanStack Start + Clerk + Convex + shadcn/ui によるWebアプリケーションテンプレート。

TODO:
@clerk/tanstack-react-startがリリースされたら切り替え。

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして値を設定：

```bash
cp .env.example .env.local
```

- `VITE_CLERK_PUBLISHABLE_KEY`: [Clerk Dashboard](https://dashboard.clerk.com) から取得
- `CLERK_JWT_ISSUER_DOMAIN`: Clerk の JWT Issuer Domain
- `CLERK_SECRET_KEY`: Clerk の Secret Key

### 3. Convex サーバーの起動

```bash
npx convex dev
```

初回実行時に `CONVEX_DEPLOYMENT` と `VITE_CONVEX_URL` が `.env.local` に自動追記されます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 技術スタック

- **Framework**: [TanStack Start](https://tanstack.com/start) / [Router](https://tanstack.com/router)
- **Backend/DB**: [Convex](https://convex.dev/)
- **Authentication**: [Clerk](https://clerk.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) / [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Development**: [TypeScript](https://www.typescriptlang.org/) / [Biome](https://biomejs.dev/)

## アーキテクチャ

- **Logic の分離**: ビジネスロジックやデータ取得は `src/hooks` 配下のカスタムフックに集約
- **ユーティリティ**: 共通処理は `src/lib` にまとめる
- **ファイルベースルーティング**: `src/routes` 内の構造がそのままアプリケーションのパスに

## 開発・品質管理

- `npm run check`: 型チェック + Lint を一括実行（変更後に必ず実行）
- `npm run format`: コードの自動整形
- `npm run test`: Vitest によるテスト実行

## デプロイ (Railway)

`railway.json` に設定済み。Railway 上で以下の環境変数を設定してください：

- `CONVEX_SELF_HOSTED_URL`
- `CONVEX_SELF_HOSTED_ADMIN_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CLERK_SECRET_KEY`
- `VITE_CONVEX_URL`
