import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: "page",
      source: "blog/**/*.md",
      schema: z.object({
        date: z.string(),
      }),
    }),

    others: defineCollection({
      type: "page",
      source: "others/*.md",
      schema: z.object({
        date: z.string(),
      }),
    }),
  },
});
