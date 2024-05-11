import {
  FavouriteIcon,
  Home06Icon,
  PencilEdit02Icon,
  Search01Icon,
  UserIcon,
} from "@/components/icons/hugeicons";
import { useLocation } from "@tanstack/react-router";
import { NavbarItem } from "./navbar-item";

const menuIconsProps: React.SVGProps<SVGSVGElement> = {
  className: "relative fill-inherit w-[28px] h-[26px]",
  width: 26,
  height: 26,
  strokeWidth: 2,
};

type Props = {
  username?: string;
};

export default function Navbar({ username }: Props) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 z-10 grid h-[68px] w-full grid-cols-5 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:static sm:z-auto sm:h-full sm:bg-transparent sm:backdrop-blur-0">
      <NavbarItem href="/" pathname={location.pathname} username={username}>
        <Home06Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/search" pathname={location.pathname} username={username}>
        <Search01Icon {...menuIconsProps} className="relative z-10 !fill-none" />
      </NavbarItem>
      <NavbarItem username={username}>
        <PencilEdit02Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/activity" pathname={location.pathname} username={username}>
        <FavouriteIcon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem
        href={`/@${username ?? ""}`}
        pathname={location.pathname}
        username={username}
      >
        <UserIcon {...menuIconsProps} />
      </NavbarItem>
    </nav>
  );
}
