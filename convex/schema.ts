import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Servers (Discord guilds)
  servers: defineTable({
    name: v.string(),
    icon: v.optional(v.string()),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  // Server members
  serverMembers: defineTable({
    serverId: v.id("servers"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_server", ["serverId"])
    .index("by_user", ["userId"])
    .index("by_server_and_user", ["serverId", "userId"]),

  // Categories within servers
  categories: defineTable({
    serverId: v.id("servers"),
    name: v.string(),
    order: v.number(),
  }).index("by_server", ["serverId"]),

  // Channels within servers
  channels: defineTable({
    serverId: v.id("servers"),
    categoryId: v.optional(v.id("categories")),
    name: v.string(),
    type: v.union(v.literal("text"), v.literal("voice")),
    topic: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_server", ["serverId"])
    .index("by_category", ["categoryId"]),

  // Messages in channels
  messages: defineTable({
    channelId: v.id("channels"),
    userId: v.id("users"),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
    edited: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_user", ["userId"]),

  // Direct message conversations
  dmConversations: defineTable({
    participantIds: v.array(v.id("users")),
    createdAt: v.number(),
  }),

  // Direct messages
  directMessages: defineTable({
    conversationId: v.id("dmConversations"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  // User presence/status
  userPresence: defineTable({
    userId: v.id("users"),
    status: v.union(v.literal("online"), v.literal("idle"), v.literal("dnd"), v.literal("offline")),
    customStatus: v.optional(v.string()),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]),

  // User profiles
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
