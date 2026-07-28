import type { CookieOptions } from "hono/utils/cookie";

export const COOKIE_SESSION = "st";

export const cookieOptions: CookieOptions = {
  path: "/",
  domain: Bun.env.COOKIE_DOMAIN,
  sameSite: "Strict",
  httpOnly: true,
  secure: Bun.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // Max age of 1 year
};
