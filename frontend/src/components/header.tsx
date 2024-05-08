import { ThreadsCloneLogo } from "@/components/ui/custom-icons";
import { useScreenSize } from "@/hooks/screen-size";
import { animate } from "motion";
import { Match, Show, Switch } from "solid-js";
import Menu from "./menu";
import Navbar from "./navbar";
import { InferResponseType } from "hono/client";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/solid-query";
import { Button } from "./ui/button";
import { useNavigate } from "@solidjs/router";

type AuthUser = InferResponseType<typeof api.auth.user.$get>;

export default function Header() {
  const navigate = useNavigate();
  const screen = useScreenSize();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<AuthUser>(["auth", "user"]);

  return (
    <header class="fixed left-0 right-0 top-0 z-30 mx-auto grid h-[60px] w-full grid-cols-3 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:h-[74px] sm:grid-cols-[1fr_max-content_1fr] md:max-w-screen-xl">
      <button
        class="group col-start-2 ml-4 flex h-12 w-12 items-center justify-center justify-self-center sm:col-start-1 sm:justify-self-start"
        onClick={() => {
          if (window.scrollY < 100) {
            /// TODO: change to a refetch, invalidating threads fetch
            window.location.href = "/";
            return;
          }

          window.scrollTo({ top: 0, behavior: "instant" });
        }}
        onPointerOver={() => {
          animate("#header-logo", { scale: 1.1 }, { duration: 0.1, easing: "ease-out" });
        }}
        onPointerDown={() => {
          animate("#header-logo", { scale: 1 }, { duration: 0.1, easing: "ease-out" });
        }}
        onPointerOut={() => {
          animate("#header-logo", { scale: 1 }, { duration: 0.1, easing: "ease-out" });
        }}
      >
        <div id="header-logo h-fit w-fit">
          <ThreadsCloneLogo class="h-8 w-8 dark:fill-white" />
        </div>
      </button>
      <Show when={screen().width > 640}>
        <div class="w-full max-w-lg px-16 md:max-w-screen-sm">
          <Navbar />
        </div>
      </Show>
      <Switch>
        <Match when={data !== undefined}>
          <Menu />
        </Match>
        <Match when={data === undefined}>
          <div class="mr-5 flex justify-end">
            <Button
              class="h-9 w-fit rounded-xl text-base leading-none tracking-tight transition active:scale-95"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
          </div>
        </Match>
      </Switch>
    </header>
  );
}
