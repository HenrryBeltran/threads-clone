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
