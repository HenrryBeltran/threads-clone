import { ErrorComponent } from "@/components/error";
import { NotFound } from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { userAccountQueryOptions } from "@/lib/api";
import { accountVerificationQueryOptions } from "@/lib/api/get-account-verification-query";
import { safeTry } from "@server/lib/safe-try";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const authRoutes = ["/login", "/sign-up", "/forgotten-password", "/account/reset-password"];

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient;

    const { error, result: user } = await safeTry(queryClient.fetchQuery(userAccountQueryOptions));

    if (error) {
      // throw new Error("Something went wrong.");
      queryClient.setQueryData(["user", "account"], null);
    }

    const allowedRoutes = () =>
      location.pathname !== "/" && !location.pathname.startsWith("/@") && !authRoutes.includes(location.pathname);

    if (user === null) {
      queryClient.setQueryData(["user", "account"], null);
    }

    if (user === null && allowedRoutes()) {
      throw redirect({ to: "/login" });
    }

    if (user && user.emailVerified === null && location.pathname !== "/account/verification") {
      const { token } = await queryClient.fetchQuery(accountVerificationQueryOptions);

      throw redirect({
        to: "/account/verification",
        search: { token },
        replace: true,
      });
    }

    if (user && user.name === "" && user.emailVerified && location.pathname !== "/account/complete-profile") {
      throw redirect({ to: "/account/complete-profile" });
    }

    if (user && user.name !== "" && user.emailVerified && location.pathname === "/account/complete-profile") {
      throw redirect({ to: "/" });
    }

    if (user && authRoutes.includes(location.pathname)) {
      throw redirect({ to: "/", replace: true });
    }

    return { user };
  },
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
      {/* <TanStackRouterDevtools initialIsOpen={false} /> */}
    </>
  );
}
