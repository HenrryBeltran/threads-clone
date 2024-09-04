import { z } from "zod";

export const postThreadSchema = z.object({
  rootId: z.string().length(21).nullable(),
  parentId: z.string().length(21).nullable(),
  body: z
    .object({
      text: z.string().max(500),
      resources: z.array(z.string()).nullable(),
    })
    .array(),
});

/// TODO: Remove this when I eliminate the reply end point.
export const replyThreadSchema = z.object({
  rootId: z.string().length(21),
  parentId: z.string().length(21),
  text: z.string().max(500),
  resources: z.array(z.string()).optional(),
});
