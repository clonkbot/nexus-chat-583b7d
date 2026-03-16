import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("serverMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const servers = await Promise.all(
      memberships.map(async (m) => {
        const server = await ctx.db.get(m.serverId);
        return server;
      })
    );

    return servers.filter(Boolean);
  },
});

export const get = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.serverId);
  },
});

export const create = mutation({
  args: { name: v.string(), icon: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const serverId = await ctx.db.insert("servers", {
      name: args.name,
      icon: args.icon,
      ownerId: userId,
      createdAt: Date.now(),
    });

    // Add creator as owner member
    await ctx.db.insert("serverMembers", {
      serverId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    // Create default category and channels
    const categoryId = await ctx.db.insert("categories", {
      serverId,
      name: "Text Channels",
      order: 0,
    });

    await ctx.db.insert("channels", {
      serverId,
      categoryId,
      name: "general",
      type: "text",
      order: 0,
      createdAt: Date.now(),
    });

    await ctx.db.insert("channels", {
      serverId,
      categoryId,
      name: "welcome",
      type: "text",
      order: 1,
      createdAt: Date.now(),
    });

    return serverId;
  },
});

export const join = mutation({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("serverMembers")
      .withIndex("by_server_and_user", (q) =>
        q.eq("serverId", args.serverId).eq("userId", userId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("serverMembers", {
      serverId: args.serverId,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });
  },
});

export const getMembers = query({
  args: { serverId: v.id("servers") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("serverMembers")
      .withIndex("by_server", (q) => q.eq("serverId", args.serverId))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .first();
        const presence = await ctx.db
          .query("userPresence")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .first();
        return {
          ...member,
          user,
          profile,
          presence,
        };
      })
    );

    return membersWithProfiles;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("servers").collect();
  },
});
