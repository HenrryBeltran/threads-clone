import { NotFound } from "@/components/not-found";
import { UserAccount, api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

async function getProfile(username: string) {
  const res = await safeTry(api.user.profile[":username"].$get({ param: { username } }));

  if (res.error) {
    console.error("Unexpected error.");
    return null;
  }

  if (!res.result.ok) {
    if (res.result.status === 404) {
      console.error("Profile account not found.");
      return 404;
    }
    console.error("Something went wrong.");
    return null;
  }

  const data = await safeTry(res.result.json());

  if (data.error) {
    console.log("Fail to parse data.");
    return null;
  }

  return data.result;
}

async function getFollowStatus(targetUsername: string) {
  const res = await safeTry(
    api.account.profile.follow[":target-username"].$get({ param: { "target-username": targetUsername } }),
  );

  if (res.error) {
    console.error("Unexpected error.");
    return null;
  }

  if (!res.result.ok) {
    console.error("Something went wrong.");
    return null;
  }

  const data = await safeTry(res.result.json());

  if (data.error) {
    console.log("Fail to parse data.");
    return null;
  }

  return data.result;
}

const profileFetchOptions = (username: string) =>
  queryOptions({
    queryKey: ["profile", username],
    queryFn: () => getProfile(username),
    refetchOnWindowFocus: false,
  });

const followStatusFetchOptions = (targetUsername: string) =>
  queryOptions({
    queryKey: ["follow", targetUsername],
    queryFn: () => getFollowStatus(targetUsername),
    refetchOnWindowFocus: false,
  });

export const Route = createFileRoute("/_main-layout/_profile-layout")({
  component: ProfileLayout,
  beforeLoad: async ({ location, context }) => {
    if (!location.pathname.includes("@")) {
      throw redirect({ to: `/@${location.pathname.slice(1)}`, replace: true });
    }

    const queryClient = context.queryClient;
    const user = queryClient.getQueryData(["user", "account"]) as UserAccount;
    const username = location.pathname.slice(2);

    if (user && location.pathname.slice(2) === user.username) {
      return { user, profile: null, follow: null };
    }

    const profile = await queryClient.fetchQuery(profileFetchOptions(username));

    if (user) {
      const followStatus = await queryClient.fetchQuery(followStatusFetchOptions(username));

      return { user: null, profile, ...followStatus };
    }

    return { user: null, profile, follow: null };
  },
  notFoundComponent: NotFound,
});

function ProfileLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}
