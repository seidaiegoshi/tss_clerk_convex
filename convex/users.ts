import { internalQuery, mutation, query } from './_generated/server'
import { v } from 'convex/values'

// ユーザーのバリデータ
const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  imageUrl: v.optional(v.string()),
  preferences: v.optional(v.object({
    theme: v.optional(v.string()),
    language: v.optional(v.string()),
  })),
  lastSeenAt: v.optional(v.number()),
})

export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  returns: v.union(userValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * 現在認証されているユーザーを取得または作成
 * クライアントアプリ起動時に自動的に呼び出される
 */
export const getCurrentUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    // tokenIdentifier で既存ユーザーを検索
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.subject))
      .unique()

    if (existingUser) {
      // 最終アクセス時刻を更新
      await ctx.db.patch(existingUser._id, {
        lastSeenAt: Date.now(),
        // 名前やメールが変更されている場合は更新
        name: identity.name ?? existingUser.name,
        email: identity.email ?? existingUser.email,
        imageUrl: identity.pictureUrl,
      })
      return existingUser._id
    }

    // 新規ユーザーを作成
    const userId = await ctx.db.insert('users', {
      tokenIdentifier: identity.subject,
      name: identity.name ?? 'Anonymous',
      email: identity.email ?? '',
      imageUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    })

    return userId
  },
})

/**
 * 現在のユーザー情報を取得（query版）
 */
export const getCurrentUserProfile = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return null
    }

    return await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.subject))
      .unique()
  },
})

/**
 * ユーザー設定を更新
 */
export const updateUserPreferences = mutation({
  args: {
    preferences: v.object({
      theme: v.optional(v.string()),
      language: v.optional(v.string()),
    }),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) => q.eq('tokenIdentifier', identity.subject))
      .unique()

    if (!user) {
      throw new Error('User not found')
    }

    await ctx.db.patch(user._id, {
      preferences: args.preferences,
    })

    return user._id
  },
})
