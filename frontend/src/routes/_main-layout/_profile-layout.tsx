import { FollowButton } from "@/components/follow-button";
import { NotFound } from "@/components/not-found";
import { ProfileBio } from "@/components/profile-bio";
import { ProfileFollowersCount } from "@/components/profile-followers-count";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileLink } from "@/components/profile-link";
import { Button } from "@/components/ui/button";
import { UserAccount, api } from "@/lib/api";
import { resetInfiniteQueryPagination } from "@/lib/reset-infinity-query";
import { useThreadModalStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
  useNavigate,
  useRouteContext,
} from "@tanstack/react-router";

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
    console.error("Fail to parse data.");
    return null;
  }

  return data.result;
}

async function getFollowStatus(targetUsername: string) {
  const res = await safeTry(api.account.profile.follow[":targetUsername"].$get({ param: { targetUsername } }));

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
    console.error("Fail to parse data.");
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
    const paths = location.pathname.split("/");
    const username = paths[1].slice(1);

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
  const queryClient = useQueryClient();
  const { username }: { username: string } = Route.useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const profileUsername = username.slice(1);

  const userData = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const followData = queryClient.getQueryData<{ follow: boolean } | null>(["follow", profileUsername]);
  const ctx = useRouteContext({ from: "/_main-layout/_profile-layout" });

  const showThreadModal = useThreadModalStore((state) => state.show);

  if (typeof ctx.profile === "number") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <h1>Profile acccount not found.</h1>
      </div>
    );
  }

  const profile = (ctx.user as UserAccount | null) ?? ctx.profile;

  if (!profile) {
    throw new Error("Something went wrong");
  }

  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="mx-auto w-full max-w-[620px] px-6 pt-20 sm:pt-24">
        <ProfileHeader username={profile.username} name={profile.name} profilePictureId={profile.profilePictureId} />
        <ProfileBio text={profile.bio} />
        <div className="flex min-h-8 items-center gap-1.5">
          <ProfileFollowersCount
            username={profile.username}
            followersCount={profile.followersCount}
            followingsCount={profile.followingsCount}
            profilePictureIdOne={profile.targetId[0] ? profile.targetId[0].userId.profilePictureId : null}
            profilePictureIdTwo={profile.targetId[1] ? profile.targetId[1].userId.profilePictureId : null}
            targetId={profile.id}
          />
          <ProfileLink link={profile.link} />
        </div>
        {userData && userData.username === profileUsername && (
          <Button
            onClick={() => navigate({ to: `/@${profileUsername}/edit` })}
            variant="outline"
            className="my-4 w-full rounded-xl border-muted-foreground/40"
          >
            Edit profile
          </Button>
        )}
        {followData && userData && userData.username !== profileUsername && (
          <div className="flex gap-4">
            <FollowButton targetUsername={profile.username} />
            <Button
              variant="outline"
              className="my-4 w-full rounded-xl border-muted-foreground/40"
              onClick={() => showThreadModal()}
            >
              Mention
            </Button>
          </div>
        )}
      </div>
      <div
        data-tab={pathname.split("/").length > 2 ? "replies" : "threads"}
        className="group mx-auto mb-1 mt-3 grid w-full max-w-[620px] grid-cols-2 grid-rows-1 place-items-center border-b border-b-muted-foreground/30 font-medium"
      >
        <Link
          className="flex w-full translate-y-px justify-center py-2 group-data-[tab=threads]:border-b-2 group-data-[tab=threads]:border-b-foreground group-data-[tab=replies]:text-muted-foreground/80"
          to={`/@${profileUsername}`}
          onClick={() => {
            resetInfiniteQueryPagination(queryClient, [profileUsername, "threads"]);
            queryClient.invalidateQueries({ queryKey: [profileUsername, "threads"] });
          }}
        >
          Threads
        </Link>
        <Link
          className="flex w-full translate-y-px justify-center py-2 group-data-[tab=replies]:border-b-2 group-data-[tab=replies]:border-b-foreground group-data-[tab=threads]:text-muted-foreground/80"
          to={`/@${profileUsername}/replies`}
          onClick={() => {
            resetInfiniteQueryPagination(queryClient, [profileUsername, "threads", "replies"]);
            queryClient.invalidateQueries({ queryKey: [profileUsername, "threads", "replies"] });
          }}
        >
          Replies
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
