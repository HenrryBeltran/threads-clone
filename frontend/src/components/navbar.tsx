import {
  FavouriteIcon,
  Home06Icon,
  PencilEdit02Icon,
  Search01Icon,
  UserIcon,
} from "@/components/ui/hugeicons";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/solid-query";
import { InferResponseType } from "hono/client";
import { JSX, onMount } from "solid-js";
import { NavbarItem } from "./navbar-item";

const menuIconsProps: JSX.SvgSVGAttributes<SVGSVGElement> = {
  class: "relative fill-inherit w-[28px] h-[26px]",
  width: 26,
  height: 26,
  "stroke-width": 2,
};

type AuthUser = InferResponseType<typeof api.auth.user.$get>;

export default function Navbar() {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<AuthUser>(["auth", "user"]);

  onMount(() => {
    console.log("~ navbar mounted");
    console.log("~ navbar query", data?.user);
    console.log("~ navbar username", data?.user.username);
  });

  return (
    <nav class="fixed bottom-0 left-0 z-30 grid h-[68px] w-full grid-cols-5 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:static sm:h-full sm:bg-transparent sm:backdrop-blur-0">
      <NavbarItem href="/" username={data?.user.username}>
        <Home06Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/search" username={data?.user.username}>
        <Search01Icon {...menuIconsProps} class="relative z-10 !fill-none" />
      </NavbarItem>
      <NavbarItem username={data?.user.username}>
        <PencilEdit02Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/activity" username={data?.user.username}>
        <FavouriteIcon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href={`/@${data?.user.username ?? ""}`} username={data?.user.username}>
        <UserIcon {...menuIconsProps} />
      </NavbarItem>
    </nav>
  );
}
