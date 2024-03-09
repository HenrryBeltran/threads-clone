"use client";

import useScreenSize from "@/hooks/useScreenSize";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function BottomNavbar() {
  const { width } = useScreenSize();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/sign-up") {
    return <></>;
  }

  return <>{(width === undefined || width < 640) && <Navbar />}</>;
}
