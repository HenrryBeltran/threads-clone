import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";
import { AuthUser, userAuthQueryOptions } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

const authRoutes = ["/login", "/sign-up", "/forgotten-password"];

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient;

    const data = await safeTry(queryClient.fetchQuery(userAuthQueryOptions));

    const allowedRoutes = () =>
      location.pathname !== "/" && !location.pathname.startsWith("/@");

    if ((data.error || data.result === null) && allowedRoutes()) {
      throw redirect({ to: `/login?next=${location.pathname}` });
    }

    /// TODO: make the auth routes not allowed when you already are sign in
    console.log("~ _authenticated", location.pathname);
    if (data.result && authRoutes.includes(location.pathname)) {
      throw redirect({ to: "/", replace: true });
    }

    return { auth: data.result };
  },
});

function AuthenticatedLayout() {
  const { auth } = Route.useRouteContext<{ queryClient: QueryClient; auth: AuthUser }>();

  return (
    <>
      <Header auth={auth} />
      <Outlet />
      <BottomNavbar auth={auth} />
    </>
  );
}
