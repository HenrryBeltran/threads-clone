import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/activity")({
  component: Activity,
});

function Activity() {
  return <div className="flex min-h-svh items-center justify-center">Activity</div>;
}
