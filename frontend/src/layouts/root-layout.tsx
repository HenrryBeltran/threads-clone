import { ThreadsCloneLogo } from "@/components/ui/custom-icons";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { RouteSectionProps } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";

async function getAuthUser() {
  const res = await safeTry(api.auth.user.$get());

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (!res.result.ok) {
    throw new Error("Server error");
  }

  return res.result.json();
}

export default function RootLayout({ children }: RouteSectionProps) {
  const query = createQuery(() => ({
    queryKey: ["auth", "user"],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  }));

  return (
    <>
      <Switch>
        <Match when={query.isFetching}>
          (
          <section class="flex min-h-svh flex-col items-center justify-center gap-16">
            <ThreadsCloneLogo class="h-32 w-32" />
            <h1 class="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 via-65% to-orange-400 bg-clip-text text-[6vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[3vw]">
              Threads Clone
            </h1>
          </section>
          )
        </Match>
        <Match when={query.isFetched}>{children}</Match>
      </Switch>
    </>
  );
}
