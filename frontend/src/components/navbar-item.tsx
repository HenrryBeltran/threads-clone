import { A } from "@solidjs/router";
import { JSXElement } from "solid-js";

type Props = {
  href: string;
  children: JSXElement;
  pathname?: string;
  username?: string;
};

export function NavbarLinkItem({ href, children, pathname, username }: Props) {
  return (
    <>
      <div class="relative h-full transition-transform active:scale-95 sm:h-auto">
        <div class="relative h-full sm:h-auto">
          <A
            href={href}
            class="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5"
          >
            <div
              aria-selected={
                (pathname === href && pathname !== undefined) ||
                (username !== undefined &&
                  pathname?.includes(`/@${username}`) &&
                  href === "/[username]")
              }
              class="group z-10 fill-none text-neutral-400 transition-transform duration-200 aria-selected:fill-foreground aria-selected:text-foreground dark:text-neutral-500 aria-selected:dark:text-foreground"
            >
              {children}
            </div>
            <div class="bg-transparen absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90 dark:group-hover:bg-neutral-900 sm:m-0 sm:h-full sm:w-full" />
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

export function NavbarItem({ children }: { children: JSXElement }) {
  return (
    <>
      <div class="relative h-full sm:h-auto">
        <div class="relative h-full sm:h-auto">
          <div class="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg transition-transform active:scale-95 sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5">
            <button class="group z-10 fill-none text-neutral-400 transition-transform duration-200 aria-selected:fill-foreground dark:text-neutral-500">
              {children}
            </button>
            <div class="bg-transparen absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90 dark:group-hover:bg-neutral-900 sm:m-0 sm:h-full sm:w-full" />
          </div>
        </div>
        <div
          hidden
          class="absolute bottom-2 left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500 sm:top-2"
        />
      </div>
    </>
  );
}
