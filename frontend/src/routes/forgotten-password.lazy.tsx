import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/forgotten-password")({
  component: ForgottenPassword,
});

function ForgottenPassword() {
  return <div className="p-2">Forgotten password</div>;
}
