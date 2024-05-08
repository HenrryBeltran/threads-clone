import { ThreadsCloneLogo } from "@/components/ui/custom-icons";
import { userAuthQueryOptions } from "@/lib/api";
import { RouteSectionProps, useLocation, useNavigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Match, Switch, createEffect, onMount } from "solid-js";

const authRoutes = ["/", "/login", "/sign-up", "/forgotten-password"];

export default function RootLayout({ children }: RouteSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = createQuery(() => userAuthQueryOptions);

  onMount(() => {
    console.log("~ root layout mounted");
  });

  createEffect(() => {
    if (query.isPending) {
      return;
    }

    if (
      !query.isSuccess &&
      !authRoutes.includes(location.pathname) &&
      !location.pathname.startsWith("/@")
    ) {
      console.log("~ move to login", window.location.origin + location.pathname);
      navigate(`/login?next=${window.location.origin + location.pathname}`, {
        replace: true,
      });
    }

    /// TODO: check if this is working
    if (
      query.isSuccess &&
      authRoutes.includes(location.pathname) &&
      location.pathname !== "/"
    ) {
      console.log("~ move to home from", location.pathname);
      navigate("/", { replace: true });
    }
  });

  return (
    <>
      <Switch>
        <Match when={query.isPending}>
          <section class="flex min-h-svh flex-col items-center justify-center gap-16">
            <ThreadsCloneLogo class="h-32 w-32" />
            <h1 class="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 via-65% to-orange-400 bg-clip-text text-[6vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[3vw]">
              Threads Clone
            </h1>
          </section>
        </Match>
        <Match when={query.isPending === false}>{children}</Match>
      </Switch>
    </>
  );
}
