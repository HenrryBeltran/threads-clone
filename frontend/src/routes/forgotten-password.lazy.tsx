import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/forgotten-password")({
  component: Search,
});

function Search() {
  return <div className="p-2">Forgotten password</div>;
}
