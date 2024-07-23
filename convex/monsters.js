import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("monsters").order("desc").take(100);
  },
});

export const createMonster = mutation({
  args: {
    lat: v?.any(),
    lng: v?.any(),
    name: v?.any(),
    imageUrl: v?.any(),
    key: v?.string(),
  },
  handler: async (ctx, args) => {
    const newTaskId = await ctx.db.insert("monsters", {
      lat: args.lat,
      lng: args.lng,
      name: args.name,
      imageUrl: args.imageUrl,
      key: args.key,
    });
    return newTaskId;
  },
});
