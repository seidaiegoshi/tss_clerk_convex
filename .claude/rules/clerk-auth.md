---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# Clerk 認証規約（公式ガイドライン準拠）

> 参照: [Clerk AI Prompts](https://clerk.com/docs/guides/development/ai-prompts)

## セットアップ

### パッケージ

```bash
npm install @clerk/clerk-react@latest
```

### 環境変数

```env
# .env.local
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

⚠️ Vite では `VITE_` プレフィックスが必須

### プロバイダー設定

```tsx
// src/integrations/clerk/provider.tsx
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
```

## 認証状態の判定

### ❌ 間違い: useUser で認証判定

```tsx
// BAD: useUser は非同期ロードで初期値が不安定
const { user } = useUser();
const data = useQuery(api.books.list, user ? {} : "skip");
```

### ✅ 正解: useAuth の isSignedIn を使う

```tsx
// GOOD: isSignedIn は認証状態を正確に反映
import { useAuth } from "@clerk/clerk-react";

const { isSignedIn } = useAuth();
const data = useQuery(api.books.list, isSignedIn ? {} : "skip");
```

## 認証ガード（ページ保護）

### ❌ 間違い: useEffect でリダイレクト

```tsx
// BAD: チラつきが発生する
function ProtectedPage() {
  const { isSignedIn } = useAuth();
  useEffect(() => {
    if (!isSignedIn) navigate({ to: "/" });
  }, [isSignedIn]);
  return <div>...</div>;
}
```

### ✅ 正解: Clerk コンポーネントで宣言的にガード

```tsx
// GOOD: SignedIn/SignedOut で宣言的に制御
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navigate } from "@tanstack/react-router";

function ProtectedPage() {
  return (
    <>
      <SignedOut>
        <Navigate to="/" />
      </SignedOut>
      <SignedIn>
        <ProtectedContent />
      </SignedIn>
    </>
  );
}
```

## 主要コンポーネント

| コンポーネント | 用途 |
|---------------|------|
| `<SignedIn>` | 認証済みユーザーにのみ表示 |
| `<SignedOut>` | 未認証ユーザーにのみ表示 |
| `<SignInButton>` | サインインボタン |
| `<SignUpButton>` | サインアップボタン |
| `<UserButton>` | ユーザーメニュー（アバター + ドロップダウン） |
| `<SignIn>` | サインインフォーム |
| `<SignUp>` | サインアップフォーム |

## 主要フック

| フック | 用途 | 返り値例 |
|--------|------|---------|
| `useAuth()` | 認証状態 | `{ isSignedIn, userId, getToken }` |
| `useUser()` | ユーザー情報 | `{ user, isLoaded }` |
| `useClerk()` | Clerk インスタンス | `{ signOut, openSignIn }` |
| `useSession()` | セッション情報 | `{ session, isLoaded }` |

### 使い分け

```tsx
// 認証状態の判定には useAuth
const { isSignedIn } = useAuth();

// ユーザー名やメールの表示には useUser
const { user } = useUser();
const name = user?.firstName;

// サインアウト処理には useClerk
const { signOut } = useClerk();
await signOut();
```

## ⚠️ 禁止事項（公式）

- ~~`frontendApi`~~ の使用 → `publishableKey` を使う
- ~~`REACT_APP_CLERK_*`~~ 環境変数 → `VITE_CLERK_*` を使う
- `ClerkProvider` をレイアウトの深い階層に配置しない → ルート近くに配置

## このプロジェクトの構成

```
src/integrations/clerk/
├── provider.tsx      # ClerkProvider 設定
└── header-user.tsx   # ヘッダーのユーザー UI
```

## Convex との連携

```tsx
// src/integrations/convex/provider.tsx
import { useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

export default function AppConvexProvider({ children }) {
  return (
    <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

Convex 側での認証確認は `convex/lib/auth.ts` の `getAuthenticatedUser` / `getOptionalUser` を使用。
