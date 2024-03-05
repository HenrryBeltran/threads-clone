"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const html = document.querySelector("html");

  useEffect(() => {
    const cn = html?.className;
    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      themeColor.setAttribute("content", cn!);
    } else {
      const meta = document.createElement("meta");

      meta.name = "theme-color";
      meta.content = cn!;
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  }, [html]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
