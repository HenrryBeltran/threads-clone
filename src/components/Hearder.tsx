"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import { ThreadsCloneLogo } from "./NavbarSVGs";
import Menu from "./Menu";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/sign-up") {
    return <></>;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-10 mx-auto grid h-[74px] w-full grid-cols-3 grid-rows-1 items-center sm:grid-cols-[1fr_max-content_1fr] md:max-w-screen-xl">
      <Link
        href="/"
        className="group col-start-2 ml-4 flex h-12 w-12 items-center justify-center justify-self-center sm:col-start-1 sm:justify-self-start"
      >
        <ThreadsCloneLogo className="h-8 w-8 transition duration-200 group-hover:scale-110 group-active:scale-100 dark:fill-white" />
      </Link>
      <div className="hidden w-full max-w-lg px-16 sm:block md:max-w-screen-sm">
        <Navbar />
      </div>
      <Menu />
    </header>
  );
}
