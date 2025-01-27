import { Backdrop } from "@/components/backdrop";
import { CreateThread } from "@/components/create-thread";
import { ErrorComponent } from "@/components/error";
import { NotFound } from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { api, userAccountQueryOptions } from "@/lib/api";
import { accountVerificationQueryOptions } from "@/lib/api/get-account-verification-query";
import { safeTry } from "@server/lib/safe-try";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, redirect } from "@tanstack/react-router";

const nonAuthRoutes = ["/login", "/sign-up", "/forgotten-password", "/account/reset-password"];

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
  beforeLoad: async ({ context, location }) => {
    const queryClient = context.queryClient;

    const { error, result: user } = await safeTry(queryClient.fetchQuery(userAccountQueryOptions));

    if (error) {
      queryClient.setQueryData(["user", "account"], null);
    }

    const routeAuthChecker =
      location.pathname !== "/" && !location.pathname.startsWith("/@") && !nonAuthRoutes.includes(location.pathname);
    const editAuthRouth = location.pathname.split("/").includes("edit");

    if (user === null) {
      queryClient.setQueryData(["user", "account"], null);
    }

    if (user === null && routeAuthChecker) {
      throw redirect({ to: "/login" });
    }

    if (user === null && editAuthRouth) {
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

    if (user && nonAuthRoutes.includes(location.pathname)) {
      throw redirect({ to: "/", replace: true });
    }

    const isAProfile = location.pathname.startsWith("/@");
    const profilePageUsername = location.pathname.split("/")[1].slice(1);

    if (user && isAProfile && user.username !== profilePageUsername && editAuthRouth) {
      throw redirect({ to: `/@${user.username}/edit`, replace: true });
    }

    return { user };
  },
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootLayout() {
  const queryClient = useQueryClient();
  useQuery({
    queryKey: ["sync"],
    queryFn: async () => {
      const res = await safeTry(api.account.user.sync.$post());

      if (res.error !== null) return Error("Something went wrong");
      if (!res.result.ok) return Error("Something went wrong");

      const { error, result } = await safeTry(res.result.json());

      if (error !== null) return Error("Something went wrong");

      queryClient.invalidateQueries({ queryKey: ["user", "account"] });
      return result;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      <Outlet />
      <Toaster />
      <CreateThread />
      <Backdrop />
    </>
  );
}
