import { zValidator } from "@hono/zod-validator";
import { $ } from "bun";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { UploadResponse } from "imagekit/dist/libs/interfaces";
import { insertUserProfileSchema } from "../common/schemas/user";
import { db } from "../db";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";
import { getUser } from "../middleware/getUser";

export const account = new Hono()
  .get("/user", getUser, async (ctx) => {
    const user = ctx.get("user");

    return ctx.json(user, 200);
  })
  .put("/user", zValidator("json", insertUserProfileSchema), getUser, async (ctx) => {
    const body = ctx.req.valid("json");
    const user = ctx.get("user");

    const { profilePicture, ...validBody } = body;
    let profilePictureUrl: string | undefined;

    if (profilePicture) {
      const uploadResponse = await safeTry<UploadResponse>(
        $`
          curl -X POST "${process.env.IMAGEKIT_URL_API_ENDPOINT}" \
          -u ${process.env.IMAGEKIT_PRIVATE_KEY}: \
          -F 'file=${profilePicture.base64.split(";base64,")[1]}' \
          -F 'fileName=${profilePicture.name}' \
          -F 'folder=/profile_pictures'
          -F 'tags=profile'
        `
          .nothrow()
          .json(),
      );

      if (uploadResponse.error) {
        return ctx.json(uploadResponse.error);
      }

      profilePictureUrl = uploadResponse.result.url;
    }

    const newData = { ...user, ...validBody, profilePictureUrl };

    const { error } = await safeTry(db.update(users).set(newData).where(eq(users.id, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200, 200);
  })
  .delete("/user", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error } = await safeTry(db.delete(users).where(eq(users.id, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200);
  });
