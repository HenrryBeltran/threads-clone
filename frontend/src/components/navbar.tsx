import {
  ArrowLeft02Icon,
  FavouriteIcon,
  Home06Icon,
  PencilEdit02Icon,
  Search01Icon,
  UserIcon,
} from "@/components/icons/hugeicons";
import { useThreadModalStore } from "@/store";
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
  const { pathname } = useLocation();
  const showThreadModal = useThreadModalStore((state) => state.show);

  return (
    <nav
      data-extra-button={pathname.split("/").length > 2}
      className="fixed bottom-0 left-0 z-10 grid h-[68px] w-full grid-cols-5 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:static sm:z-auto sm:h-full sm:bg-transparent sm:backdrop-blur-0 data-[extra-button=true]:sm:grid-cols-6"
    >
      {pathname.split("/").length > 2 && <BackButton />}
      <NavbarItem href="/" pathname={pathname} username={username}>
        <Home06Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/search" pathname={pathname} username={username}>
        <Search01Icon {...menuIconsProps} className="relative z-10 !fill-none" />
      </NavbarItem>
      <NavbarItem username={username} handleOnClick={() => showThreadModal()}>
        <PencilEdit02Icon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href="/activity" pathname={pathname} username={username}>
        <FavouriteIcon {...menuIconsProps} />
      </NavbarItem>
      <NavbarItem href={`/@${username ?? ""}`} pathname={pathname} username={username}>
        <UserIcon {...menuIconsProps} />
      </NavbarItem>
    </nav>
  );
}

function BackButton() {
  return (
    <div className="relative hidden h-full transition-transform active:scale-95 sm:block sm:h-auto">
      <div className="relative h-full sm:h-auto">
        <span
          className="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto cursor-pointer touch-manipulation items-center justify-center rounded-lg sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5"
          onClick={() => window.history.back()}
        >
          <div className="group z-10 fill-none text-neutral-400 transition-transform duration-200 [-webkit-transform:translateZ(0)] aria-selected:fill-foreground aria-selected:text-foreground dark:text-neutral-500 aria-selected:dark:text-foreground">
            <ArrowLeft02Icon {...menuIconsProps} className="!fill-none text-foreground" />
          </div>
          <div className="absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg bg-transparent transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-400/20 dark:group-hover:bg-neutral-600/20 sm:m-0 sm:h-full sm:w-full" />
        </span>
      </div>
    </div>
  );
}
