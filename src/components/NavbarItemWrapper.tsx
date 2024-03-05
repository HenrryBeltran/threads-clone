"use client";

import { usePathname } from "next/navigation";

export default function NavbarItemWrapper({
  children,
  selectedPathname,
}: {
  children: React.ReactNode;
  selectedPathname?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      aria-selected={pathname === selectedPathname}
      className="group relative mx-0.5 my-1 flex justify-center rounded-md fill-none px-8 py-5 aria-selected:fill-foreground aria-selected:text-foreground"
    >
      {children}
      <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
    </div>
  );
}
