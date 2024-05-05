import { zValidator } from "@hono/zod-validator";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import { cookieOptions } from "../common/cookie-options";
import { loginSchema } from "../common/schemas";
import { db } from "../db";
import { sessions } from "../db/schemas/sessions";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";

dayjs.extend(utc);

const COOKIE_SESSION = "st";

export const authSession = new Hono()
  .get("/session", async (ctx) => {
    const sessionToken = getCookie(ctx, COOKIE_SESSION);

    if (!sessionToken) {
      return ctx.json({ message: "Session token not found." }, 404);
    }

    const session = await safeTry(
      db.query.sessions.findFirst({
        columns: { id: true, userId: true, token: true, expires: true },
        where: eq(sessions.token, sessionToken),
      }),
    );

    if (session.error) {
      return ctx.json(session.error, 500);
    }

    if (!session.result) {
      return ctx.json({ message: "Session not found." }, 404);
    }

    const now = dayjs.utc();
    const expires = dayjs.utc(session.result.expires);

    if (now.isAfter(expires)) {
      const { error: logoutError } = await safeTry(
        db.delete(sessions).where(eq(sessions.id, session.result.id)),
      );

      if (logoutError) {
        return ctx.json(logoutError, 500);
      }

      deleteCookie(ctx, COOKIE_SESSION, cookieOptions);

      return ctx.redirect("/login", 301);
    }

    return ctx.json({ user: session.result.userId });
  })
  .post("/session", zValidator("json", loginSchema), async (ctx) => {
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
        return ctx.json(
          {
            message: "Email not register.",
            path: "username",
          },
          404,
        );
      } else {
        return ctx.json(
          {
            message: "Username not found.",
            path: "username",
          },
          404,
        );
      }
    }

    const passwordMatch = await safeTry(
      Bun.password.verify(password, foundUser.password!, "bcrypt"),
    );

    if (passwordMatch.error) {
      return ctx.json(passwordMatch.error, 500);
    }

    if (!passwordMatch.result) {
      return ctx.json(
        {
          message: "Wrong password.",
          path: "password",
        },
        401,
      );
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

    /// TODO: Add the email verification

    // if (!foundUser.emailVerified && !foundUser.roles.includes("viewer")) {
    //   const { result: verifiedUser } = await Try(
    //     db.query.verifyUser.findFirst({
    //       columns: { token: true },
    //       where: eq(verifyUser.email, foundUser.email),
    //     }),
    //   );
    //
    //   if (!verifiedUser) {
    //     const { error: emailError, result: emailResult } = await Try(
    //       emailVerification({
    //         id: foundUser.id,
    //         username: foundUser.username,
    //         email: foundUser.email,
    //       }),
    //     );
    //
    //     if (emailError) {
    //       console.error(emailError.message);
    //       redirect("/account/verification");
    //     }
    //
    //     redirect(`/account/verification?utk=${emailResult.verificationToken}`);
    //   }
    //
    //   redirect(`/account/verification?utk=${verifiedUser.token}`);
    // }

    return ctx.redirect("/", 301);
  });

export const authUser = new Hono().get("/user", async (ctx) => {
  const sessionToken = getCookie(ctx, COOKIE_SESSION);

  if (!sessionToken) {
    return ctx.json({ message: "Session token not found." }, 404);
  }

  const session = await safeTry(
    db.query.sessions.findFirst({
      columns: { id: true, token: true, expires: true },
      with: {
        userId: {
          columns: {
            username: true,
            email: true,
            roles: true,
            name: true,
            bio: true,
            profilePictureUrl: true,
            link: true,
            emailVerified: true,
            updatedAt: true,
          },
        },
      },
      where: eq(sessions.token, sessionToken),
    }),
  );

  if (session.error) {
    return ctx.json(session.error, 500);
  }

  if (!session.result) {
    return ctx.json({ message: "Session not found." }, 404);
  }

  const now = dayjs.utc();
  const expires = dayjs.utc(session.result.expires);

  if (now.isAfter(expires)) {
    const { error: logoutError } = await safeTry(
      db.delete(sessions).where(eq(sessions.id, session.result.id)),
    );

    if (logoutError) {
      return ctx.json(logoutError, 500);
    }

    deleteCookie(ctx, COOKIE_SESSION, cookieOptions);

    return ctx.redirect("/login");
  }

  return ctx.json({ user: session.result.userId });
});
