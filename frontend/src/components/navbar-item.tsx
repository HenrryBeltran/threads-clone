import { openLoginModal } from "@/lib/login-store";
import { A } from "@solidjs/router";
import { JSXElement, createSignal } from "solid-js";

type Props = {
  children: JSXElement;
  href?: string;
  username?: string;
};

const [current, setCurrent] = createSignal(window.location.pathname);

export function NavbarItem({ children, href, username }: Props) {
  const selected = () => current() === href;
  let iconDiv: HTMLDivElement | undefined;

  return (
    <>
      <div class="relative h-full sm:h-auto">
        <div class="relative h-full sm:h-auto">
          <A
            href={href ?? ""}
            class="group relative z-0 flex h-full min-h-0 w-full min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg transition-transform active:scale-95 sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5"
            onClick={(e) => {
              if (!username) {
                e.preventDefault();
                e.stopPropagation();

                openLoginModal();
                return;
              }

              if (!href) {
                e.preventDefault();
                e.stopPropagation();

                alert("Works as a button");
                return;
              }

              setCurrent(href);
            }}
          >
            <div
              ref={iconDiv}
              aria-selected={selected()}
              class="group z-10 fill-none text-neutral-400 transition-transform duration-200 aria-selected:fill-foreground aria-selected:text-foreground dark:text-neutral-500 dark:aria-selected:text-foreground"
            >
              {children}
            </div>
            <div class="absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg bg-transparent transition-all group-hover:scale-100 group-hover:bg-neutral-400/15 dark:group-hover:bg-neutral-600/20 sm:m-0 sm:h-full sm:w-full" />
          </A>
        </div>
        <div
          hidden
          class="absolute bottom-2 left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500 sm:top-2"
        />
      </div>
    </>
  );
}
