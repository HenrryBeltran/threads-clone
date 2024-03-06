"use client";

import { Heart, Home, Search, SquarePen, User } from "lucide-react";
import Link from "next/link";
import NavbarItemWrapper from "./NavbarItemWrapper";
import NavbarMenu from "./NavbarMenu";
import { ThreadsCloneLogo } from "./NavbarSVGs";
import RedirectButton from "./RedirectButton";
import { usePathname } from "next/navigation";

const menuIconsProps = {
  className: "relative z-10 fill-inherit",
  size: 26,
  absoluteStrokeWidth: true,
  strokeWidth: 2.5,
};

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/sign-up") {
    return <></>;
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-10 mx-auto grid h-[74px] w-full grid-cols-[1fr_max-content_1fr] grid-rows-1 items-center md:max-w-screen-xl">
      <Link href="/" className="group ml-4 flex h-12 w-12 items-center justify-center">
        <ThreadsCloneLogo className="h-8 w-8 transition duration-200 group-hover:scale-110 group-active:scale-100 dark:fill-white" />
      </Link>
      <div className="grid grid-flow-col grid-rows-1 px-16 text-neutral-400">
        <RedirectButton href="/">
          <NavbarItemWrapper pathname="/" currentPathname={pathname}>
            <Home {...menuIconsProps} />
          </NavbarItemWrapper>
        </RedirectButton>
        <RedirectButton href="/search">
          <NavbarItemWrapper pathname="/search" currentPathname={pathname}>
            <Search {...menuIconsProps} className="relative z-10 !fill-none" />
          </NavbarItemWrapper>
        </RedirectButton>
        <NavbarItemWrapper>
          <SquarePen {...menuIconsProps} />
        </NavbarItemWrapper>
        <RedirectButton href="/liked">
          <NavbarItemWrapper pathname="/liked" currentPathname={pathname}>
            <Heart {...menuIconsProps} />
          </NavbarItemWrapper>
        </RedirectButton>
        <RedirectButton href="/@user">
          <NavbarItemWrapper pathname="/@user" currentPathname={pathname}>
            <User {...menuIconsProps} />
          </NavbarItemWrapper>
        </RedirectButton>
      </div>
      <NavbarMenu />
    </nav>
  );
}
