import { Heart, Home, Search, SquarePen, User } from "lucide-react";
import Link from "next/link";
import NavbarMenu from "./NavbarMenu";
import { ThreadsCloneLogo } from "./NavbarSVGs";

const menuIconsProps = {
  className: "relative z-10",
  size: 26,
  absoluteStrokeWidth: true,
  strokeWidth: 2.5,
};

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-10 mx-auto grid h-[74px] w-full grid-cols-[1fr_max-content_1fr] grid-rows-1 items-center md:max-w-screen-xl">
      <Link href="/" className="group ml-4 flex h-12 w-12 items-center justify-center">
        <ThreadsCloneLogo className="h-8 w-8 transition duration-200 group-hover:scale-110 dark:fill-white" />
      </Link>
      <ul className="grid grid-flow-col grid-rows-1 px-16 text-neutral-400">
        <NavbarItemWrapper>
          <Home {...menuIconsProps} />
        </NavbarItemWrapper>
        <NavbarItemWrapper>
          <Search {...menuIconsProps} />
        </NavbarItemWrapper>
        <NavbarItemWrapper>
          <SquarePen {...menuIconsProps} />
        </NavbarItemWrapper>
        <NavbarItemWrapper>
          <Heart {...menuIconsProps} />
        </NavbarItemWrapper>
        <NavbarItemWrapper>
          <User {...menuIconsProps} />
        </NavbarItemWrapper>
      </ul>
      <NavbarMenu />
    </nav>
  );
}

function NavbarItemWrapper({ children }: { children: React.ReactNode }) {
  return (
    <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
      {children}
      <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
    </li>
  );
}
