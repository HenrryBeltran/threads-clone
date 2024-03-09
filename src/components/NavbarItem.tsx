import Link from "next/link";

export function NavbarLinkItem({
  href,
  children,
  pathname,
}: {
  href: string;
  children: React.ReactNode;
  pathname?: string;
}) {
  return (
    <>
      <div className="relative h-full sm:h-auto">
        <div className="relative h-full sm:h-auto">
          <Link
            href={href}
            className="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5"
          >
            <div
              aria-selected={pathname === href && pathname !== undefined}
              className="group z-10 fill-none transition-transform duration-200 aria-selected:fill-foreground aria-selected:text-foreground"
            >
              {children}
            </div>
            <div className="bg-transparen absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90 dark:group-hover:bg-neutral-900 sm:m-0 sm:h-full sm:w-full" />
          </Link>
        </div>
        <div
          hidden
          className="absolute left-1/2 top-2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500"
        />
      </div>
    </>
  );
}

export function NavbarItem({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="relative h-full sm:h-auto">
        <div className="relative h-full sm:h-auto">
          <div className="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5">
            <div className="group z-10 fill-none transition-transform duration-200 aria-selected:fill-foreground aria-selected:text-foreground">
              {children}
            </div>
            <div className="bg-transparen absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90 dark:group-hover:bg-neutral-900 sm:m-0 sm:h-full sm:w-full" />
          </div>
        </div>
        <div
          hidden
          className="absolute left-1/2 top-2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500"
        />
      </div>
    </>
  );
}
