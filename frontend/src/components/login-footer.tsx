import { LinkButton } from "@/components/ui/link-button";
import { Link } from "@tanstack/react-router";

export default function LoginFooter() {
  return (
    <div className="w-full max-w-sm">
      <Link
        to="/forgotten-password"
        className="mt-8 inline-block w-full text-center text-[.9375rem] text-muted-foreground"
      >
        Forgotten password?
      </Link>
      <div className="mt-8 grid w-full grid-cols-[1fr_min-content_1fr] grid-rows-1 items-center gap-4">
        <div className="h-px bg-muted-foreground/70" />
        <span className="text-muted-foreground/70">or</span>
        <div className="h-px bg-muted-foreground/70" />
      </div>
      <LinkButton
        navigateOptions={{ to: "/sign-up" }}
        type="button"
        variant="secondary"
        className="mt-8 w-full rounded-xl py-7 text-base"
      >
        Sign up
      </LinkButton>
    </div>
  );
}
