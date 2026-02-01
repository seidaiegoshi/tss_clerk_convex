---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# React ベストプラクティス（Vercel 公式ガイドライン準拠）

> 参照: [Vercel React Best Practices](https://github.com/vercel/react-best-practices)

## 1. Waterfalls の排除（CRITICAL）

### Promise.all で並列実行

```tsx
// ❌ BAD: 順次実行（3 round trips）
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// ✅ GOOD: 並列実行（1 round trip）
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

### await は必要な時点まで遅延

```tsx
// ❌ BAD: 早期 await で不要なブロック
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId);
  if (skipProcessing) return { skipped: true };
  return processUserData(userData);
}

// ✅ GOOD: 必要な分岐でのみ await
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) return { skipped: true };
  const userData = await fetchUserData(userId);
  return processUserData(userData);
}
```

## 2. バンドルサイズ最適化（CRITICAL）

### barrel file（index.ts）からのインポートに注意

```tsx
// lucide-react は tree-shaking 対応済みのため named import で OK
import { Check, X, Menu } from "lucide-react";

// tree-shaking 非対応のライブラリでは deep import を検討
// import SomeIcon from "some-lib/dist/esm/icons/some-icon";
```

### 重いコンポーネントは lazy import

```tsx
// ❌ BAD: 初期バンドルに含まれる
import { MonacoEditor } from "./monaco-editor";

// ✅ GOOD: オンデマンドでロード
import { lazy, Suspense } from "react";
const MonacoEditor = lazy(() => import("./monaco-editor"));

// 使用時は Suspense で囲む
<Suspense fallback={<div>読み込み中...</div>}>
  <MonacoEditor />
</Suspense>;
```

## 3. 再レンダリング最適化（MEDIUM）

### 関数型 setState を使う

```tsx
// ❌ BAD: items を依存配列に含める必要あり
const addItems = useCallback(
  (newItems: Item[]) => {
    setItems([...items, ...newItems]);
  },
  [items],
);

// ✅ GOOD: 依存配列不要、stale closure を防止
const addItems = useCallback((newItems: Item[]) => {
  setItems((curr) => [...curr, ...newItems]);
}, []);
```

### Lazy State Initialization

```tsx
// ❌ BAD: 毎レンダリングで実行
const [settings, setSettings] = useState(
  JSON.parse(localStorage.getItem("settings") || "{}"),
);

// ✅ GOOD: 初回のみ実行
const [settings, setSettings] = useState(() => {
  const stored = localStorage.getItem("settings");
  return stored ? JSON.parse(stored) : {};
});
```

### Effect の依存を絞る

```tsx
// ❌ BAD: user オブジェクト全体で再実行
useEffect(() => {
  console.log(user.id);
}, [user]);

// ✅ GOOD: 必要なプロパティのみ
useEffect(() => {
  console.log(user.id);
}, [user.id]);
```

## 4. レンダリングパフォーマンス（MEDIUM）

### 静的 JSX を hoist

```tsx
// ❌ BAD: 毎レンダリングで再生成
function Container() {
  return (
    <div>{loading && <div className="animate-pulse h-20 bg-gray-200" />}</div>
  );
}

// ✅ GOOD: モジュールレベルで定義
const loadingSkeleton = <div className="animate-pulse h-20 bg-gray-200" />;

function Container() {
  return <div>{loading && loadingSkeleton}</div>;
}
```

### 条件付きレンダリングは明示的に

```tsx
// ❌ BAD: count が 0 のとき "0" がレンダリングされる
{
  count && <span>{count}</span>;
}

// ✅ GOOD: 明示的な条件
{
  count > 0 ? <span>{count}</span> : null;
}
```

## 5. JavaScript パフォーマンス（LOW-MEDIUM）

### Set/Map で O(1) ルックアップ

```tsx
// ❌ BAD: O(n) per check
const allowedIds = ["a", "b", "c"];
items.filter((item) => allowedIds.includes(item.id));

// ✅ GOOD: O(1) per check
const allowedIds = new Set(["a", "b", "c"]);
items.filter((item) => allowedIds.has(item.id));
```

### 複数の filter/map を1ループにまとめる

```tsx
// ❌ BAD: 3回イテレーション
const admins = users.filter((u) => u.isAdmin);
const testers = users.filter((u) => u.isTester);
const inactive = users.filter((u) => !u.isActive);

// ✅ GOOD: 1回のイテレーション
const admins: User[] = [];
const testers: User[] = [];
const inactive: User[] = [];
for (const user of users) {
  if (user.isAdmin) admins.push(user);
  if (user.isTester) testers.push(user);
  if (!user.isActive) inactive.push(user);
}
```

## 6. イベントリスナー

### Passive Event Listeners

```tsx
// ❌ BAD: スクロール遅延の原因
document.addEventListener("wheel", handleWheel);

// ✅ GOOD: 即座にスクロール開始
document.addEventListener("wheel", handleWheel, { passive: true });
```

## 7. localStorage / sessionStorage

### バージョン管理とエラーハンドリング

```tsx
const VERSION = "v2";

function saveConfig(config: Config) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config));
  } catch {
    // incognito/private browsing, quota exceeded
  }
}

function loadConfig(): Config | null {
  try {
    const data = localStorage.getItem(`userConfig:${VERSION}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
```

## 8. コンポーネント設計原則

| 原則               | 説明                      |
| ------------------ | ------------------------- |
| 単一責任           | 1 コンポーネント = 1 責任 |
| Props で制御       | 内部状態を最小限に        |
| コンポジション優先 | 継承より合成              |
| 早期リターン       | ガード節でネストを減らす  |

## このプロジェクト固有のルール

- ページコンポーネントは薄く（認証ガード + レイアウトのみ）
- ロジックは `src/hooks/` に抽出
- UI プリミティブは `src/components/ui/`
- 機能コンポーネントは `src/components/`
