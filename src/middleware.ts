import { NextRequest } from "next/server";

const authRoutes = ["/login", "/sign-up"];

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // if (isApiAuthRoute) {
  //   return;
  // }

  // if (isLoggedIn && isAuthRoute) {
  //   return Response.redirect(new URL("/", nextUrl));
  // }
  //
  // if (!isLoggedIn && !isAuthRoute) {
  //   return Response.redirect(new URL("/login", nextUrl));
  // }

  return;
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api)(.*)"],
};
