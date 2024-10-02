import { zValidator } from "@hono/zod-validator";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { insertUserProfileSchema } from "../../common/schemas/user";
import { db } from "../../db";
import { users } from "../../db/schemas/users";
import { safeTry } from "../../lib/safe-try";
import { getUser } from "../../middleware/getUser";

dayjs.extend(utc);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const accountUser = new Hono()
  .get("/", getUser, async (ctx) => {
    const user = ctx.get("user");

    return ctx.json(user, 200);
  })
  /// TODO: ensure if is and update should consider delete the old profile image from the bucket
  .put("/", zValidator("json", insertUserProfileSchema), getUser, async (ctx) => {
    const body = ctx.req.valid("json");
    const user = ctx.get("user");

    const { profilePicture, ...validBody } = body;
    let profilePictureId: string | undefined;

    if (profilePicture) {
      const uploadResult = await cloudinary.uploader.upload(
        profilePicture.base64,
        { folder: "/profile_pictures" },
        (error) => {
          if (error) {
            console.error(error);
            return ctx.json(error, 500);
          }
        },
      );

      profilePictureId = uploadResult.public_id;
    }

    const newData = {
      ...user,
      ...validBody,
      link: !validBody.link ? null : validBody.link.length > 0 ? validBody.link : null,
      profilePictureId: profilePictureId,
      updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    const { error } = await safeTry(db.update(users).set(newData).where(eq(users.id, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200, 200);
  })
  .delete("/", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error } = await safeTry(db.delete(users).where(eq(users.id, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200);
  });
