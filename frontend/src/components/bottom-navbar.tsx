import { useScreenSize } from "@/hooks/screen-size";
import Navbar from "./navbar";
import { Show } from "solid-js";

export default function BottomNavbar() {
  const screen = useScreenSize();

  return (
    <Show when={screen().width !== 0 && screen().width < 640}>
      <Navbar />
    </Show>
  );
}
