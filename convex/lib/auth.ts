import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * 認証済みユーザーを取得するヘルパー
 * 認証されていない場合はエラーをスロー
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error('Not authenticated')
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.subject))
    .unique()

  if (!user) {
    throw new Error('User not found. Please sign in again.')
  }

  return user
}

/**
 * オプショナルな認証ユーザー取得
 * 認証されていない場合は null を返す
 */
export async function getOptionalUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    return null
  }

  return await ctx.db
    .query('users')
    .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.subject))
    .unique()
}
