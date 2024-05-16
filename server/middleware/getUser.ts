import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { COOKIE_SESSION, cookieOptions } from "../common/cookie-options";
import { db } from "../db";
import { sessions } from "../db/schemas/sessions";
import { users } from "../db/schemas/users";
import { safeTry } from "../lib/safe-try";

dayjs.extend(utc);

const selectUserSchema = createSelectSchema(users);
const authUserSchema = selectUserSchema.omit({ password: true });

export type User = z.infer<typeof authUserSchema>;
export type AuthUser = {
  sessionId: string;
  data: User;
};

type Env = {
  Variables: {
    user: AuthUser;
  };
};

export const getUser = createMiddleware<Env>(async (ctx, next) => {
  const sessionToken = getCookie(ctx, COOKIE_SESSION);

  if (!sessionToken) {
    console.warn("~ Session not found.");
    return ctx.json(null, 204);
  }

  const session = await safeTry(
    db.query.sessions.findFirst({
      columns: { id: true, userId: true, token: true, expires: true },
      with: { userId: { columns: { password: false } } },
      where: eq(sessions.token, sessionToken),
    }),
  );

  if (session.error) {
    return ctx.json(session.error, 500);
  }

  if (!session.result) {
    console.warn("~ Session not found.");
    return ctx.json(null, 204);
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

    return ctx.json({ message: "Session expired" }, { status: 498 });
  }

  ctx.set("user", { sessionId: session.result.id, data: session.result.userId });
  await next();
});
