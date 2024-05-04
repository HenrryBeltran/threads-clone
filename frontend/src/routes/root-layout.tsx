import { A, RouteSectionProps } from "@solidjs/router";

export default function RootLayout({ children }: RouteSectionProps) {
  return (
    <>
      <header class="flex w-full items-center justify-between border-b border-b-muted-foreground/30 px-6 py-4 sm:px-16">
        <h1 class="font-extrabold uppercase tracking-tighter">Navbar</h1>
        <div class="space-x-6 sm:space-x-8">
          <A href="/" class="hover:underline">
            Home
          </A>
          <A href="/about" class="hover:underline">
            about
          </A>
        </div>
      </header>
      {children}
    </>
  );
}
