import { useEffect } from "react";

export function useLockScrolling(state: boolean) {
  const body = document.querySelector("body");

  useEffect(() => {
    if (!body) return;

    if (state) {
      body.style.height = "100svh";
      body.style.overflow = "hidden";
    } else {
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  }, [state]);
}
