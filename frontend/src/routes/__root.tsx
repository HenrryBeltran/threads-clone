import { ErrorComponent } from "@/components/error";
import { NotFound } from "@/components/not-found";
import { userAccountQueryOptions } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, redirect } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const authRoutes = ["/login", "/sign-up", "/forgotten-password"];

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient;

    const { error, result: user } = await safeTry(
      queryClient.fetchQuery(userAccountQueryOptions),
    );

    if (error) {
      throw new Error("Something went wrong.");
    }

    const allowedRoutes = () =>
      location.pathname !== "/" && !location.pathname.startsWith("/@");

    if (user === null) {
      queryClient.setQueryData(["user", "account"], null);
    }

    if (user === null && allowedRoutes()) {
      throw redirect({ to: "/login" });
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
      {/* <TanStackRouterDevtools /> */}
    </>
  );
}
