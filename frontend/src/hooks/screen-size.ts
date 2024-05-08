import { createSignal, onCleanup, onMount } from "solid-js";

export function useScreenSize() {
  const [screenSize, setScreenSize] = createSignal<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  function handler() {
    setScreenSize({ height: window.innerHeight, width: window.innerWidth });
  }

  onMount(() => {
    window.addEventListener("resize", handler);
  });

  onCleanup(() => {
    window.removeEventListener("resize", handler);
  });

  return screenSize;
}
