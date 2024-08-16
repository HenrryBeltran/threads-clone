import { z } from "zod";

export const postThreadSchema = z.object({
  text: z.string().max(500),
  resources: z.array(z.string()).optional(),
});

export const replyThreadSchema = z.object({
  rootId: z.string().length(21),
  parentId: z.string().length(21),
  text: z.string().max(500),
  resources: z.array(z.string()).optional(),
});
