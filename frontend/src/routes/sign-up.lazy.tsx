import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sign-up")({
  component: Search,
});

function Search() {
  return <div className="p-2">Sign up</div>;
}
