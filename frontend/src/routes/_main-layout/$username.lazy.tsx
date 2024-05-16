import { UserAccount } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username")({
  component: Profile,
});

function Profile() {
  const { username } = Route.useParams();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <h1>Profile page {username}</h1>
      <code>{JSON.stringify(user, null, 2)}</code>
    </div>
  );
}
