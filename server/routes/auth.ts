import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq, inArray, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { COOKIE_SESSION, cookieOptions } from "../common/cookie-options";
import { emailSchema, temporalTokenSchema } from "../common/schemas";
import { inputOTPSchema, loginSchema, resetPasswordSchema, signUpSchema } from "../common/schemas/auth";
import { db } from "../db";
import { resetPassword } from "../db/schemas/reset-password";
import { sessions } from "../db/schemas/sessions";
import { users } from "../db/schemas/users";
import { verifyUser } from "../db/schemas/verify-user";
import { ResetPasswordConfirmationTemplate } from "../email/reset-password-confirmation-template";
import { ResetPasswordTemplate } from "../email/reset-password-template";
import { emailVerification } from "../lib/email-verification";
import { safeTry } from "../lib/safe-try";
import { getSession } from "../middleware/getSession";
import { getUser } from "../middleware/getUser";

dayjs.extend(utc);

const resend = new Resend(process.env.RESEND_API_KEY);
const awaitTime = 60;

export const auth = new Hono()
  .post("/login", zValidator("json", loginSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const { password } = body;
    const username = body.username.toLowerCase();

    const { error: foundUserError, result: foundUser } = await safeTry(
      db.query.users.findFirst({
        columns: {
          id: true,
          email: true,
          username: true,
          password: true,
          emailVerified: true,
          roles: true,
        },
        where: or(eq(users.email, username), eq(users.username, username)),
      }),
    );

    if (foundUserError) {
      return ctx.json(foundUserError, 500);
    }

    if (!foundUser) {
      if (username.includes("@")) {
        return ctx.json({ message: "Email not found.", path: "username" }, 404);
      } else {
        return ctx.json({ message: "Username not found.", path: "username" }, 404);
      }
    }

    const passwordMatch = await safeTry(Bun.password.verify(password, foundUser.password!));

    if (passwordMatch.error) {
      return ctx.json(passwordMatch.error, 500);
    }

    if (!passwordMatch.result) {
      return ctx.json({ message: "Wrong password.", path: "password" }, 401);
    }

    const sessionToken = nanoid();
    const expires = dayjs.utc().add(1, "year").format("YYYY-MM-DD HH:mm:ss");

    const createSession = await safeTry(
      db.insert(sessions).values({
        id: nanoid(),
        token: sessionToken,
        expires,
        userId: foundUser.id,
      }),
    );

    if (createSession.error) {
      return ctx.json(createSession.error, 500);
    }

    setCookie(ctx, COOKIE_SESSION, sessionToken, cookieOptions);

    if (foundUser.emailVerified === null && !foundUser.roles.includes("viewer")) {
      const { result: verifiedUser } = await safeTry(
        db.query.verifyUser.findFirst({
          columns: { token: true },
          where: eq(verifyUser.email, foundUser.email),
        }),
      );

      if (!verifiedUser) {
        const { error: emailError, result: emailResult } = await safeTry(
          emailVerification({
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
          }),
        );

        if (emailError) {
          console.error(emailError.message);
          return ctx.json({ token: "" }, 307);
        }

        return ctx.json({ token: emailResult.verificationToken }, 307);
      }

      return ctx.json({ token: verifiedUser.token }, 307);
    }

    return ctx.json(200, 200);
  })
  .post("/sign-up", zValidator("json", signUpSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const { email, password } = body;
    const username = body.username.toLowerCase();

    const { error: foundUsernameError, result: foundUsername } = await safeTry(
      db.query.users.findFirst({
        columns: { id: true },
        where: eq(users.username, username),
      }),
    );

    if (foundUsernameError) {
      return ctx.json(foundUsernameError, 500);
    }

    if (foundUsername) {
      return ctx.json({ message: `Username ${username} is already taken.`, path: "username" }, 409);
    }

    const { error: foundEmailError, result: foundEmail } = await safeTry(
      db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, email) }),
    );

    if (foundEmailError) {
      return ctx.json(foundEmailError, 500);
    }

    if (foundEmail) {
      return ctx.json({ message: "This email is already register.", path: "email" }, 409);
    }

    const { error: hashedPasswordError, result: hashedPassword } = await safeTry(Bun.password.hash(password, "bcrypt"));

    if (hashedPasswordError) {
      return ctx.json(hashedPasswordError, 500);
    }

    const { error, result: newUser } = await safeTry(
      db
        .insert(users)
        .values({
          id: nanoid(),
          username,
          email,
          password: hashedPassword,
          name: "",
          bio: "",
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          emailVerified: users.emailVerified,
        }),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    const sessionToken = nanoid();
    const expires = dayjs.utc().add(1, "year").format("YYYY-MM-DD HH:mm:ss");

    const createSession = await safeTry(
      db.insert(sessions).values({
        id: nanoid(),
        token: sessionToken,
        expires,
        userId: newUser[0].id,
      }),
    );

    if (createSession.error) {
      return ctx.json(
        { message: "User created now you can login, but something went wrong trying to login after sign up." },
        417,
      );
    }

    setCookie(ctx, COOKIE_SESSION, sessionToken, cookieOptions);

    const { error: emailError, result: emailResult } = await safeTry(
      emailVerification({
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
      }),
    );

    if (emailError) {
      console.error(emailError.message);
      return ctx.json({ token: "" }, 307);
    }

    return ctx.json({ token: emailResult.verificationToken }, 201);
  })
  .post("/logout", getSession, async (ctx) => {
    const session = ctx.get("session");

    const deleteSession = await safeTry(db.delete(sessions).where(eq(sessions.id, session.id)));

    if (deleteSession.error) {
      return ctx.json(deleteSession.error, 500);
    }

    deleteCookie(ctx, COOKIE_SESSION, cookieOptions);

    return ctx.json(200);
  })
  .get("/reset-password/:temporal-token", async (ctx) => {
    const temporalToken = ctx.req.param("temporal-token");

    const validatedToken = temporalTokenSchema.safeParse(temporalToken);

    if (validatedToken.error) {
      return ctx.json({ message: validatedToken.error.issues.shift()?.message }, 400);
    }

    const { error, result } = await safeTry(
      db.query.resetPassword.findFirst({ where: eq(resetPassword.token, temporalToken) }),
    );

    if (error) {
      return ctx.json(error.message, 500);
    }

    if (!result) {
      return ctx.json({ message: "Invalid token." }, 400);
    }

    const now = dayjs.utc();
    const expires = dayjs.utc(result.expires);

    if (now.isAfter(expires)) {
      await safeTry(db.delete(resetPassword).where(eq(resetPassword.id, result.id)));

      return ctx.json({ message: "Token already expired." }, { status: 498 });
    }

    return ctx.json({ message: "Valid url." }, 200);
  })
  .post("/reset-password/:temporal-token", zValidator("json", resetPasswordSchema), async (ctx) => {
    const body = ctx.req.valid("json");
    const temporalToken = ctx.req.param("temporal-token");

    const { error: tokenError, result: tokenResult } = await safeTry(
      db.query.resetPassword.findFirst({ where: eq(resetPassword.token, temporalToken) }),
    );

    if (tokenError) {
      return ctx.json(tokenError, 500);
    }

    if (!tokenResult) {
      return ctx.json({ message: "Invalid token." }, 400);
    }

    const now = dayjs.utc();
    const expireToken = dayjs.utc(tokenResult.expires);

    if (now.isAfter(expireToken)) {
      return ctx.json({ message: "Your token is already expired." }, { status: 498 });
    }

    const { error: foundUserError, result: foundUser } = await safeTry(
      db.query.users.findFirst({
        columns: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
          password: true,
        },
        where: eq(users.email, tokenResult.email),
      }),
    );

    if (foundUserError) {
      return ctx.json(foundUser, 500);
    }

    if (!foundUser) {
      return ctx.json({ message: "Could not find the user account." }, 404);
    }

    const { error: hashedNewPasswordError, result: hashedNewPassword } = await safeTry(
      Bun.password.hash(body.newPassword, "bcrypt"),
    );

    if (hashedNewPasswordError) {
      return ctx.json(hashedNewPasswordError, 500);
    }

    const { error: deleteTokenError } = await safeTry(
      db.delete(resetPassword).where(eq(resetPassword.id, tokenResult.id)),
    );

    if (deleteTokenError) {
      return ctx.json(deleteTokenError, 500);
    }

    const { error } = await safeTry(
      db
        .update(users)
        .set({
          password: hashedNewPassword,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, foundUser.id)),
    );

    if (error) {
      return ctx.json(error, 500);
    }

    const newTemporalToken = nanoid(32);
    const expires = dayjs.utc().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");

    await safeTry(
      db.insert(resetPassword).values({
        id: nanoid(),
        email: foundUser.email,
        expires,
        token: newTemporalToken,
      }),
    );

    const { result: foundSessions } = await safeTry(
      db.select({ id: sessions.id }).from(sessions).where(eq(sessions.userId, foundUser.id)),
    );

    if (foundSessions && foundSessions.length > 0) {
      const ids = foundSessions.map((session) => session.id);
      await safeTry(db.delete(sessions).where(inArray(sessions.userId, ids)));
    }

    const resetPasswordLink = `${process.env.SITE_URL}/account/reset-password?temporal_token=${newTemporalToken}`;
    const shortResetPasswordLink = `${process.env.SITE_URL}/account/reset-password`;

    await safeTry(
      resend.emails.send({
        from:
          process.env.NODE_ENV === "development"
            ? "Threads Clone <onboarding@resend.dev>"
            : "Threads Clone <noreply@threads-clone.henrryb.site>",
        to: [foundUser.email!],
        subject: "Your Threads Clone password has been updated",
        html: ResetPasswordConfirmationTemplate(resetPasswordLink, shortResetPasswordLink),
      }),
    );

    return ctx.json({ message: "Reset password successfully" }, 200);
  })
  .post("/forgotten-password", zValidator("json", emailSchema), async (ctx) => {
    const body = ctx.req.valid("json");

    const { error: foundUserError, result: foundUser } = await safeTry(
      db.query.users.findFirst({
        columns: {
          id: true,
          username: true,
          email: true,
          password: true,
          emailVerified: true,
          roles: true,
        },
        where: eq(users.email, body.email),
      }),
    );

    if (foundUserError) {
      return ctx.json(foundUserError.message, 500);
    }

    if (!foundUser) {
      return ctx.json({ message: "Email not register.", path: "email" }, 404);
    }

    if (foundUser.roles.includes("viewer")) {
      return ctx.json({ message: "Invalid email.", path: "email" }, 400);
    }

    const temporalToken = nanoid(32);
    const expires = dayjs.utc().add(1, "hour").format("YYYY-MM-DD HH:mm:ss");

    const { error: resultError, result: resetResult } = await safeTry(
      db.query.resetPassword.findFirst({
        where: eq(resetPassword.email, foundUser.email),
      }),
    );

    if (resultError) {
      return ctx.json(resultError.message, 500);
    }

    if (resetResult) {
      const isFirstRequest = resetResult.createdAt === resetResult.updatedAt;
      const now = dayjs.utc();
      const cooldown = dayjs.utc(resetResult.updatedAt).add(120, "seconds");

      if (!isFirstRequest && now.isBefore(cooldown)) {
        return ctx.json({ message: "Failed to send email. Too many attempts try again later." }, 429);
      }

      await safeTry(
        db
          .update(resetPassword)
          .set({
            expires,
            token: temporalToken,
            updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
          })
          .where(eq(resetPassword.id, resetResult.id)),
      );
    } else {
      await safeTry(
        db.insert(resetPassword).values({
          id: nanoid(),
          email: foundUser.email,
          expires,
          token: temporalToken,
        }),
      );
    }

    const resetPasswordLink = `${process.env.SITE_URL}/account/reset-password?temporal_token=${temporalToken}`;

    await safeTry(
      resend.emails.send({
        from:
          process.env.NODE_ENV === "development"
            ? "Threads Clone <onboarding@resend.dev>"
            : "Threads Clone <noreply@threads-clone.henrryb.site>",
        to: [foundUser.email],
        subject: "Reset your Threads Clone password",
        html: ResetPasswordTemplate(foundUser.email, resetPasswordLink),
      }),
    );

    return ctx.json({ message: "Success! We've sent you an email to confirm your password change." }, 200);
  })
  .post("/verify-account", zValidator("json", inputOTPSchema), getUser, async (ctx) => {
    const body = ctx.req.valid("json");
    const user = ctx.get("user");

    const { error: verifyUserError, result: verifiedUser } = await safeTry(
      db.query.verifyUser.findFirst({ where: eq(verifyUser.email, user.email) }),
    );

    if (verifyUserError) {
      return ctx.json(verifyUserError.message, 500);
    }

    if (!verifiedUser) {
      return ctx.json({ message: "Verification linked to account not found." }, 404);
    }

    if (body.pin !== verifiedUser.code) {
      return ctx.json({ message: "Pin not valid." }, 406);
    }

    if (dayjs(verifiedUser.expires).format() < dayjs.utc().format()) {
      return ctx.json({ message: "Your verification code is already expired." }, { status: 498 });
    }

    const { error } = await safeTry(
      db
        .update(users)
        .set({
          emailVerified: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(users.id, user.id)),
    );

    if (error) {
      return ctx.json(error.message, 500);
    }

    await safeTry(db.delete(verifyUser).where(eq(verifyUser.id, verifiedUser.id)));

    return ctx.json("Account verify successfully", 200);
  })
  .get("/verify-account/token", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error, result } = await safeTry(
      db.query.verifyUser.findFirst({
        columns: { token: true },
        where: eq(verifyUser.email, user.email),
      }),
    );

    if (error) {
      return ctx.json("Server error", 500);
    }

    if (!result) {
      return ctx.json({ message: "Requested verification not found." }, 404);
    }

    return ctx.json({ token: result.token }, 200);
  })
  .get("/verify-account/resend", getUser, async (ctx) => {
    const user = ctx.get("user");

    const { error: verifyUserError, result: verifiedUser } = await safeTry(
      db.query.verifyUser.findFirst({ where: eq(verifyUser.email, user.email) }),
    );

    if (verifyUserError) {
      return ctx.json(verifyUserError.message, 500);
    }

    if (!verifiedUser) {
      return ctx.json({ message: "Account verification not found." }, 404);
    }

    const isFirstEmail = verifiedUser.createdAt === verifiedUser.updatedAt;
    const nowTime = dayjs.utc();
    const updatedAtTime = dayjs.utc(verifiedUser.updatedAt);
    const timeOffset = nowTime.diff(updatedAtTime, "seconds");

    if (timeOffset <= awaitTime && !isFirstEmail) {
      return ctx.json({ sended: false, timeLeft: awaitTime - timeOffset }, 200);
    }

    const { error: emailError, result: emailResult } = await safeTry(
      emailVerification({
        id: user.id,
        username: user.username,
        email: user.email,
      }),
    );

    if (emailError) {
      return ctx.json(emailError.message, 500);
    }

    const { error, result } = await safeTry(
      db
        .update(verifyUser)
        .set({
          code: emailResult.verificationCode,
          updatedAt: dayjs.utc().format("YYYY-MM-DD HH:mm:ss"),
        })
        .where(eq(verifyUser.id, verifiedUser.id)),
    );

    if (error) {
      return ctx.json(error.message, 500);
    }

    if (!result) {
      return ctx.json({ message: "Verify user not found." }, 404);
    }

    return ctx.json({ sended: true, timeLeft: awaitTime }, 200);
  });
