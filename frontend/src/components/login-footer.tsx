import { LinkButton } from "@/components/ui/link-button";
import { A } from "@solidjs/router";

export default function LoginFooter() {
  return (
    <div class="w-full max-w-sm">
      <A
        href="/forgotten-password"
        class="mt-8 inline-block w-full text-center text-[.9375rem] text-muted-foreground"
      >
        Forgotten password?
      </A>
      <div class="mt-8 grid w-full grid-cols-[1fr_min-content_1fr] grid-rows-1 items-center gap-4">
        <div class="h-px bg-muted-foreground/70" />
        <span class="text-muted-foreground/70">or</span>
        <div class="h-px bg-muted-foreground/70" />
      </div>
      <LinkButton
        href="/sign-up"
        type="button"
        variant="secondary"
        class="mt-8 w-full rounded-xl py-7 text-base"
      >
        Sign up
      </LinkButton>
    </div>
  );
}
