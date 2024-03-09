"use client";

import Navbar from "./Navbar";
import useScreenSize from "@/hooks/useScreenSize";

export default function BottomNavbar() {
  const { width } = useScreenSize();

  return <>{width < 640 && <Navbar />}</>;
}
