import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-email")({
  component: ChangeEmail,
});

function ChangeEmail() {
  console.log("~ change-email");
  return <div className="min-h-svh text-center">Hello /_main-layout/$username/edit/change-email!</div>;
}
