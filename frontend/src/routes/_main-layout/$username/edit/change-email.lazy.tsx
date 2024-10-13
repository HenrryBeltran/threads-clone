import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-email")({
  component: ChangeEmail,
});

function ChangeEmail() {
  return (
    <div className="flex min-h-svh items-center justify-center text-center">
      Hello /_main-layout/$username/edit/change-email!
    </div>
  );
}
