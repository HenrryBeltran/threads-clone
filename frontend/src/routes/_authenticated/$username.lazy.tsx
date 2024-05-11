import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/$username")({
  component: Profile,
});

function Profile() {
  const { username } = Route.useParams();
  const queryClient = useQueryClient();
  const { user } = queryClient.getQueryData(["auth", "user"]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1>Profile page {username}</h1>
      <code>{JSON.stringify(user, null, 2)}</code>
    </div>
  );
}
