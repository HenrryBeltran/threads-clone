import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/update-profile")({
  component: UpdateProfile,
});

function UpdateProfile() {
  return <div>Hello /_main-layout/$username/edit/update-profile!</div>;
}
