import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-username")({
  component: ChangeUsername,
});

function ChangeUsername() {
  return <div>Hello /_main-layout/$username/edit/change-username!</div>;
}
