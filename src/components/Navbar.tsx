"use client";

import { Heart, Home, Search, SquarePen, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavbarItem, NavbarLinkItem } from "./NavbarItem";

const menuIconsProps = {
  className: "relative fill-inherit w-[28px] h-[26px]",
  size: 26,
  absoluteStrokeWidth: true,
  strokeWidth: 2.5,
};

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 grid h-[68px] w-full grid-cols-5 grid-rows-1 items-center sm:static sm:h-full">
      <NavbarLinkItem href="/" pathname={pathname}>
        <Home {...menuIconsProps} />
      </NavbarLinkItem>
      <NavbarLinkItem href="/search" pathname={pathname}>
        <Search {...menuIconsProps} className="relative z-10 !fill-none" />
      </NavbarLinkItem>
      <NavbarItem>
        <SquarePen {...menuIconsProps} />
      </NavbarItem>
      <NavbarLinkItem href="/liked" pathname={pathname}>
        <Heart {...menuIconsProps} />
      </NavbarLinkItem>
      <NavbarLinkItem href="/@user" pathname={pathname}>
        <User {...menuIconsProps} />
      </NavbarLinkItem>
    </nav>
  );
}
