"use client";

export default function NavbarItemWrapper({
  children,
  pathname,
  currentPathname,
}: {
  children: React.ReactNode;
  pathname?: string;
  currentPathname?: string;
}) {
  return (
    <div
      aria-selected={pathname === currentPathname && pathname !== undefined}
      className="group relative mx-0.5 my-1 flex justify-center rounded-md fill-none px-8 py-5 transition-transform duration-200 active:scale-90 aria-selected:fill-foreground aria-selected:text-foreground"
    >
      {children}
      <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90 dark:group-hover:bg-neutral-900"></div>
    </div>
  );
}
