import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/saved")({
  component: Saved,
});

function Saved() {
  return <div className="flex min-h-svh items-center justify-center">Saved</div>;
}
