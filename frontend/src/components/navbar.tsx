import {
  FavouriteIcon,
  Home06Icon,
  PencilEdit02Icon,
  Search01Icon,
  UserIcon,
} from "@/components/ui/hugeicons";
import { useLocation } from "@solidjs/router";
import { JSX } from "solid-js";
import { NavbarItem, NavbarLinkItem } from "./navbar-item";

const menuIconsProps: JSX.SvgSVGAttributes<SVGSVGElement> = {
  class: "relative fill-inherit w-[28px] h-[26px]",
  width: 26,
  height: 26,
  "stroke-width": 2,
};

export default function Navbar() {
  const { pathname } = useLocation();
  const username = "user";

  return (
    <nav class="fixed bottom-0 left-0 z-30 grid h-[68px] w-full grid-cols-5 grid-rows-1 items-center bg-background/50 backdrop-blur-md sm:static sm:h-full sm:bg-transparent sm:backdrop-blur-0">
      <NavbarLinkItem href="/" pathname={pathname}>
        <Home06Icon {...menuIconsProps} />
      </NavbarLinkItem>
      <NavbarLinkItem href="/search" pathname={pathname}>
        <Search01Icon {...menuIconsProps} class="relative z-10 !fill-none" />
      </NavbarLinkItem>
      <NavbarItem>
        <PencilEdit02Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarLinkItem href="/activity" pathname={pathname}>
        <FavouriteIcon {...menuIconsProps} />
      </NavbarLinkItem>
      <NavbarLinkItem href={`/@${username}`} pathname={pathname} username={username}>
        <UserIcon {...menuIconsProps} />
      </NavbarLinkItem>
    </nav>
  );
}
