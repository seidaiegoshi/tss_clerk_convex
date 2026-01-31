# プロジェクト指示

## 技術スタック

- **Framework**: TanStack Start / Router
- **Backend/DB**: Convex
- **Auth**: Clerk
- **UI**: shadcn/ui + Tailwind CSS v4
- **Lint/Format**: Biome

## 必須コマンド

変更後は必ず実行：

```bash
npm run check  # 型チェック + Lint
```

## コーディングルール

`.claude/rules/` に詳細ルールを配置。パスに応じて自動適用される：

| ファイル                  | 適用対象                                         | 参照元                                                                           |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `clerk-auth.md`           | `src/**/*.{ts,tsx}`                              | [Clerk 公式](https://clerk.com/docs/guides/development/ai-prompts)               |
| `convex-backend.md`       | `convex/**/*.ts`                                 | [Convex 公式](https://docs.convex.dev/ai)                                        |
| `convex-frontend.md`      | `src/**/*.{ts,tsx}`                              | [Convex 公式](https://docs.convex.dev/ai)                                        |
| `tanstack-router.md`      | `src/routes/**/*.tsx`                            | [TanStack 公式](https://tanstack.com/router/v1/docs/framework/react/llm-support) |
| `react-best-practices.md` | `src/**/*.{ts,tsx}`                              | [Vercel 公式](https://github.com/vercel/react-best-practices)                    |
| `shadcn-ui.md`            | `src/components/**/*.tsx`                        | -                                                                                |
| `layout-css.md`           | `src/routes/**/*.tsx`, `src/components/**/*.tsx` | -                                                                                |
| `convex-migration.md`     | `convex/schema.ts`, `convex/migrations.ts`       | -                                                                                |

## 参考ドキュメント

- 各技術詳細: `.claude/rules/`
