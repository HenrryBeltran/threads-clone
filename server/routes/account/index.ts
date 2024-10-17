import { zValidator } from "@hono/zod-validator";
import { v2 as cloudinary } from "cloudinary";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { and, count, eq } from "drizzle-orm";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { deleteCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { z } from "zod";
import { COOKIE_SESSION, cookieOptions } from "../../common/cookie-options";
import { resetPasswordSchema } from "../../common/schemas/auth";
import { insertUserProfileSchema } from "../../common/schemas/user";
import { db } from "../../db";
import { follows } from "../../db/schemas/follows";
import { sessions } from "../../db/schemas/sessions";
import { users } from "../../db/schemas/users";
import { verifyEmail } from "../../db/schemas/verify-email";
import { ConfirmNewEmail } from "../../email/confirm-new-email";
import { NewEmailConfirmation } from "../../email/new-email-confirmation";
import { safeTry } from "../../lib/safe-try";
import { getSession } from "../../middleware/getSession";
import { getUser } from "../../middleware/getUser";

dayjs.extend(utc);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
const resend = new Resend(process.env.RESEND_API_KEY);

const limiter = rateLimiter({
  windowMs: 2 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-6",
  keyGenerator: (_) => process.env.RL_KEY!,
});

export const accountUser = new Hono()
  .get("/", getUser, async (ctx) => {
    const user = ctx.get("user");

    return ctx.json(user, 200);
  })
  .put("/", zValidator("json", insertUserProfileSchema), getUser, async (ctx) => {
    const body = ctx.req.valid("json");
    const user = ctx.get("user");

    const { profilePicture, ...validBody } = body;
    let profilePictureId: string | null = null;

    if (user.name.length > 0 && user.profilePictureId !== null && user.profilePictureId !== profilePictureId) {
      await cloudinary.uploader.destroy(user.profilePictureId);
    }

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
  .delete("/", getSession, getUser, async (ctx) => {
    const user = ctx.get("user");
    const session = ctx.get("session");

    if (user.roles === "viewer") {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    const deleteSession = await safeTry(db.delete(sessions).where(eq(sessions.id, session.id)));

    if (deleteSession.error) {
      return ctx.json(deleteSession.error, 500);
    }

    deleteCookie(ctx, COOKIE_SESSION, cookieOptions);

    const { error } = await safeTry(db.delete(users).where(eq(users.id, user.id)));

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json(200);
  })
  .post("/email", limiter, getUser, zValidator("json", z.object({ newEmail: z.string().email() })), async (ctx) => {
    const { newEmail } = ctx.req.valid("json");
    const user = ctx.get("user");

    if (user.roles === "viewer") {
      const a = ctx.json({ message: "Unauthorized" }, 401);
      return a;
    }

    if (newEmail === user.email) {
      return ctx.json({ message: "This is your current email" }, 409);
    }

    const duplicateWithNewEmail = await safeTry(
      db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, newEmail) }),
    );

    if (duplicateWithNewEmail.error !== null) {
      return ctx.json(duplicateWithNewEmail.error, 500);
    }

    if (duplicateWithNewEmail.result !== undefined) {
      return ctx.json({ message: "This email is already in use" }, 409);
    }

    const duplicateRequest = await safeTry(
      db.query.verifyEmail.findFirst({ columns: { id: true }, where: eq(verifyEmail.oldEmail, user.email) }),
    );

    if (duplicateRequest.error !== null) {
      return ctx.json(duplicateRequest.error, 500);
    }

    const verificationToken = nanoid(32);
    const expires = dayjs.utc().add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");

    if (duplicateRequest.result === undefined) {
      const insertVerifyEmail = await safeTry(
        db.insert(verifyEmail).values({
          id: nanoid(),
          oldEmail: user.email,
          newEmail: newEmail,
          expires,
          token: verificationToken,
        }),
      );

      if (insertVerifyEmail.error !== null) {
        return ctx.json(insertVerifyEmail.error, 500);
      }
    } else {
      const updateVerifyEmail = await safeTry(
        db
          .update(verifyEmail)
          .set({
            newEmail: newEmail,
            expires,
            token: verificationToken,
          })
          .where(eq(verifyEmail.id, duplicateRequest.result.id)),
      );

      if (updateVerifyEmail.error !== null) {
        return ctx.json(updateVerifyEmail.error, 500);
      }
    }

    const newEmailLink = `${process.env.SITE_URL}/@${user.username}/edit/change-email/confirm?temporal_token=${verificationToken}`;

    const { error } = await safeTry(
      resend.emails.send({
        from:
          process.env.NODE_ENV === "development"
            ? "Threads Clone <onboarding@resend.dev>"
            : "Threads Clone <noreply@threads-clone.henrry.site>",
        to: [newEmail],
        subject: "New Email Address Confirmation",
        html: ConfirmNewEmail(user.username, newEmailLink),
      }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "Request sended successfully" }, 200);
  })
  .post("/email/verification", getUser, zValidator("query", z.object({ token: z.string() })), async (ctx) => {
    const user = ctx.get("user");
    const verificationToken = ctx.req.query("token");

    if (verificationToken === undefined) {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    if (user.roles === "viewer") {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    const verifyEmailQuery = await safeTry(
      db.query.verifyEmail.findFirst({
        where: and(eq(verifyEmail.token, verificationToken), eq(verifyEmail.oldEmail, user.email)),
      }),
    );

    if (verifyEmailQuery.error !== null) {
      return ctx.json(verifyEmailQuery.error, 500);
    }

    if (verifyEmailQuery.result === undefined) {
      return ctx.json({ message: "Invalid token" }, 401);
    }

    const deleteVerifyEmail = await safeTry(
      db.delete(verifyEmail).where(eq(verifyEmail.id, verifyEmailQuery.result.id)),
    );

    if (deleteVerifyEmail.error !== null) {
      return ctx.json(deleteVerifyEmail.error, 500);
    }

    const now = dayjs.utc();
    const expires = dayjs.utc(verifyEmailQuery.result.expires);

    if (now.isAfter(expires)) {
      return ctx.json({ message: "Token already expired." }, { status: 498 });
    }

    const { error } = await safeTry(
      db
        .update(users)
        .set({
          email: verifyEmailQuery.result.newEmail,
          emailVerified: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, user.id)),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    await safeTry(
      resend.emails.send({
        from:
          process.env.NODE_ENV === "development"
            ? "Threads Clone <onboarding@resend.dev>"
            : "Threads Clone <noreply@threads-clone.henrry.site>",
        to: [verifyEmailQuery.result.newEmail],
        subject: "Email Address Updated Successfully",
        html: NewEmailConfirmation(user.username),
      }),
    );

    return ctx.json({ message: "New email updated successfully" }, 200);
  })
  .post("/username", getUser, zValidator("json", z.object({ newUsername: z.string() })), async (ctx) => {
    const user = ctx.get("user");
    const { newUsername } = ctx.req.valid("json");

    if (user.roles === "viewer") {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    if (newUsername === user.username) {
      return ctx.json({ message: "You are already using this username", path: "username" }, 409);
    }

    const duplicateUsername = await safeTry(
      db.query.users.findFirst({ columns: { id: true }, where: eq(users.username, newUsername) }),
    );

    if (duplicateUsername.error !== null) {
      return ctx.json(duplicateUsername.error, 500);
    }

    if (duplicateUsername.result !== undefined) {
      return ctx.json({ message: "Username already taken", path: "username" }, 409);
    }

    const { error } = await safeTry(
      db
        .update(users)
        .set({ username: newUsername, updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss") })
        .where(eq(users.id, user.id)),
    );

    if (error !== null) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "New username updated successfully" }, 200);
  })
  .post("/password", getUser, zValidator("json", resetPasswordSchema), async (ctx) => {
    const user = ctx.get("user");
    const body = ctx.req.valid("json");

    if (user.roles === "viewer") {
      return ctx.json({ message: "Unauthorized" }, 401);
    }

    const account = await safeTry(
      db.query.users.findFirst({ columns: { password: true }, where: eq(users.id, user.id) }),
    );

    if (account.error !== null) {
      return ctx.json(account.error, 500);
    }

    if (account.result === undefined) {
      return ctx.json({ message: "Account not found" }, 400);
    }

    const passwordMatch = await safeTry(Bun.password.verify(body.newPassword, account.result.password));

    if (passwordMatch.error) {
      return ctx.json(passwordMatch.error, 500);
    }

    if (passwordMatch.result) {
      return ctx.json({ message: "Your new password must be different.", path: "password" }, 400);
    }

    const { error: hashedNewPasswordError, result: hashedNewPassword } = await safeTry(
      Bun.password.hash(body.newPassword, "bcrypt"),
    );

    if (hashedNewPasswordError) {
      return ctx.json(hashedNewPasswordError, 500);
    }

    const { error } = await safeTry(
      db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, user.id)),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    return ctx.json({ message: "New password updated successfully" }, 200);
  })
  .post("/sync", getUser, async (ctx) => {
    const user = ctx.get("user");

    const followersCountQuery = await safeTry(
      db.select({ count: count() }).from(follows).where(eq(follows.targetId, user.id)),
    );
    const followingsCountQuery = await safeTry(
      db.select({ count: count() }).from(follows).where(eq(follows.userId, user.id)),
    );

    if (followersCountQuery.error !== null) {
      return ctx.json(followersCountQuery.error, 500);
    }
    if (followingsCountQuery.error !== null) {
      return ctx.json(followingsCountQuery.error, 500);
    }

    const followersCount = followersCountQuery.result[0].count;
    const followingsCount = followingsCountQuery.result[0].count;

    if (user.followersCount !== followersCount || user.followingsCount !== followingsCount) {
      const { error } = await safeTry(
        db.update(users).set({ followersCount, followingsCount }).where(eq(users.id, user.id)),
      );

      if (error !== null) {
        return ctx.json(error, 500);
      }

      return ctx.json({ message: "Account synchronized" }, 200);
    }

    return ctx.json({ message: "Account already up to date" }, 200);
  });
