import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/saved")({
  component: Search,
});

function Search() {
  return <div className="flex min-h-svh items-center justify-center">Saved</div>;
}
