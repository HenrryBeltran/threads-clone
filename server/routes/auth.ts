import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { COOKIE_SESSION, cookieOptions } from "../common/cookie-options";
import { inputOTPSchema, loginSchema, signUpSchema } from "../common/schemas/auth";
import { db } from "../db";
import { sessions } from "../db/schemas/sessions";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";
import { getSession } from "../middleware/getSession";
import { getUser } from "../middleware/getUser";
import { verifyUser } from "../db/schemas/verify-user";
import { emailVerification } from "../lib/email-verification";

dayjs.extend(utc);

/// TODO: Add the resend email feature.

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

    const passwordMatch = await safeTry(
      Bun.password.verify(password, foundUser.password!),
    );

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

    if (!foundUser.emailVerified && !foundUser.roles.includes("viewer")) {
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
      return ctx.json(
        { message: `Username ${username} is already taken.`, path: "username" },
        409,
      );
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

    const { error: hashedPasswordError, result: hashedPassword } = await safeTry(
      Bun.password.hash(password, "bcrypt"),
    );

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
        {
          message:
            "User created now you can login, but something went wrong trying to login after sign up.",
        },
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

    const deleteSession = await safeTry(
      db.delete(sessions).where(eq(sessions.id, session.id)),
    );

    if (deleteSession.error) {
      return ctx.json(deleteSession.error, 500);
    }

    deleteCookie(ctx, COOKIE_SESSION, cookieOptions);

    return ctx.json(200);
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
      return ctx.json(
        { message: "Your verification code is already expired." },
        { status: 498 },
      );
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
  });

/// TODO: Add the forgotten-password, reset password and update password via unique link.
