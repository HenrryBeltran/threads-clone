import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/liked")({
  component: Liked,
});

function Liked() {
  return <div className="flex min-h-svh items-center justify-center">Liked</div>;
}
