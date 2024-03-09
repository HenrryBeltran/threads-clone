"use client";

import useScreenSize from "@/hooks/useScreenSize";
import Navbar from "./Navbar";

export default function BottomNavbar() {
  const { width } = useScreenSize();

  return <>{width && width < 640 && <Navbar />}</>;
}
