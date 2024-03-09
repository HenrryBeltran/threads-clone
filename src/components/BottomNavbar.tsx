"use client";

import useScreenSize from "@/hooks/useScreenSize";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function BottomNavbar() {
  const { width } = useScreenSize();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/sign-up") {
    return <></>;
  }

  return <>{width && width < 640 && <Navbar />}</>;
}
