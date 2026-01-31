import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    // Clerk の tokenIdentifier (JWT の subject)
    tokenIdentifier: v.string(),

    // 基本プロフィール
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),

    // アプリ固有の設定
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        language: v.optional(v.string()),
      }),
    ),

    // メタデータ
    lastSeenAt: v.optional(v.number()),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_email', ['email']),
})
