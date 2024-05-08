import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <div class="flex min-h-svh flex-col items-center justify-center space-y-4">
      <h1 class="font-bold leading-none">Sorry, this page isn&apos;t available</h1>
      <p class="max-w-sm text-center text-base font-light text-muted-foreground">
        The link that you followed may be broken or the page may have been removed.{" "}
      </p>
      <A
        href="/"
        class="rounded-lg border border-muted-foreground/30 px-5 py-3 font-medium leading-none transition-all hover:bg-muted focus:ring-blue-500 active:scale-95 focus:dark:ring-blue-400"
      >
        Back
      </A>
    </div>
  );
}
