import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { COOKIE_SESSION, cookieOptions } from "../common/cookie-options";
import { db } from "../db";
import { sessions, type SelectSessions } from "../db/schemas/sessions";
import { safeTry } from "../lib/safe-try";

dayjs.extend(utc);

type Env = {
  Variables: {
    session: SelectSessions;
  };
};

export const getSession = createMiddleware<Env>(async (ctx, next) => {
  const sessionToken = getCookie(ctx, COOKIE_SESSION);

  if (!sessionToken) {
    return ctx.json({ message: "Session token not found." }, 404);
  }

  const session = await safeTry(
    db.query.sessions.findFirst({
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

    return ctx.json({ message: "Session expired." }, { status: 498 });
  }

  ctx.set("session", session.result);

  await next();
});
