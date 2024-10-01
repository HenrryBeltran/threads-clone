import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-password")({
  component: ChangePassword,
});

function ChangePassword() {
  return <div>Hello /_main-layout/$username/edit/change-password!</div>;
}
