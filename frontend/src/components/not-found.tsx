import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center space-y-4">
      <h1 className="font-bold">Sorry, this page isn&apos;t available</h1>
      <p className="max-w-sm text-center text-base font-light text-muted-foreground">
        The link that you followed may be broken or the page may have been removed.{" "}
      </p>
      <Button
        type="button"
        className="rounded-xl transition-all focus-visible:ring-blue-500 active:scale-95 focus-visible:dark:ring-blue-400"
        variant="outline"
        onClick={() => navigate({ to: "/", replace: true })}
      >
        Back
      </Button>
    </main>
  );
}
