import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const cookieOptions: Partial<ResponseCookie> = {
  path: "/",
  domain: process.env.COOKIE_DOMAIN,
  sameSite: "none",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 30 * 12, // Max age of 1 year
};
