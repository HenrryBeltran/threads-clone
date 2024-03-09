"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function UpdateTheme() {
  const { theme, systemTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const themeColor = document.querySelector("meta[name=theme-color]");

    if (themeColor) {
      if (theme === "system") {
        themeColor.setAttribute(
          "content",
          systemTheme === "light" ? "#FFFFFF" : "#242526",
        );
      } else {
        themeColor.setAttribute("content", theme === "light" ? "#FFFFFF" : "#242526");
      }
    }
  }, [theme, systemTheme, pathname]);

  return <></>;
}
