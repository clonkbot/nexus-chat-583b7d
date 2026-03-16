import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByServer = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const channels = await ctx.db
      .query("channels")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    return channels.sort((a, b) => a.order - b.order);
  },
});

export const get = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.channelId);
  },
});

export const create = mutation({
  args: {
    serverId: v.id("servers"),
    name: v.string(),
    type: v.union(v.literal("text"), v.literal("voice")),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingChannels = await ctx.db
      .query("channels")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    return await ctx.db.insert("channels", {
      serverId: args.serverId,
      categoryId: args.categoryId,
      name: args.name.toLowerCase().replace(/\s+/g, "-"),
      type: args.type,
      order: existingChannels.length,
      createdAt: Date.now(),
    });
  },
});

export const listCategories = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();
  },
});
