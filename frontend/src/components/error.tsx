import { Button } from "./ui/button";

export function ErrorComponent() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center space-y-4">
      <h1 className="font-bold">Sorry, something went wrong.</h1>
      <Button
        type="button"
        className="rounded-xl transition-all focus-visible:ring-blue-500 active:scale-95 focus-visible:dark:ring-blue-400"
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Reset
      </Button>
    </main>
  );
}
