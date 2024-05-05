import { ThreadsCloneLogo } from "@/components/ui/custom-icons";
import { A } from "@solidjs/router";
import Menu from "./menu";
import Navbar from "./navbar";

export default function Header() {
  return (
    <header class="fixed left-0 right-0 top-0 z-30 mx-auto grid h-16 w-full grid-cols-3 grid-rows-1 items-center bg-background/50 backdrop-blur-md sm:h-[74px] sm:grid-cols-[1fr_max-content_1fr] md:max-w-screen-xl">
      <A
        href="/"
        class="group col-start-2 ml-4 flex h-12 w-12 items-center justify-center justify-self-center sm:col-start-1 sm:justify-self-start"
      >
        <ThreadsCloneLogo class="h-8 w-8 transition duration-200 group-hover:scale-110 group-active:scale-100 dark:fill-white" />
      </A>
      <div class="hidden w-full max-w-lg px-16 sm:block md:max-w-screen-sm">
        <Navbar />
      </div>
      <Menu />
    </header>
  );
}
