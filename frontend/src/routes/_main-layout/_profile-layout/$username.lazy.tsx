import { FollowButton } from "@/components/follow-button";
import { ProfileBio } from "@/components/profile-bio";
import { ProfileFollowersCount } from "@/components/profile-followers-count";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileLink } from "@/components/profile-link";
import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { Button } from "@/components/ui/button";
import { api, type UserAccount } from "@/lib/api";
import { useThreadModalStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useLocation, useRouteContext } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username")({
  component: Profile,
});

function Profile() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const username = location.pathname.slice(2);
  const userData = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const followData = queryClient.getQueryData<{ follow: boolean } | null>(["follow", username]);
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

  async function profilePostsFetcher({ pageParam }: { pageParam: number }) {
    const res = await safeTry(
      api.threads.posts[":userId"].$get({
        param: { userId: profile?.id! },
        query: { page: pageParam.toString() },
      }),
    );

    if (res.error) throw new Error("Something went wrong");
    if (!res.result.ok) throw new Error("Something went wrong");

    const { error, result } = await safeTry(res.result.json());

    if (error) throw new Error("Something went wrong");

    return result;
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
            userId={userData?.id}
            targetId={profile.id}
          />
          <ProfileLink link={profile.link} />
        </div>
        {userData && userData.username === username && (
          <Button variant="outline" className="my-4 w-full rounded-xl border-muted-foreground/40">
            Edit profile
          </Button>
        )}
        {followData && userData && userData.username !== username && (
          <div className="flex gap-4">
            <FollowButton targetUsername={profile.username} />
            <Button
              variant="outline"
              className="my-4 w-full rounded-xl border-muted-foreground/40"
              onClick={() => showThreadModal(`@${profile.username}`)}
            >
              Mention
            </Button>
          </div>
        )}
      </div>
      <ThreadsInfiniteScroll queryKey={[profile.username, "threads"]} queryFn={profilePostsFetcher} />
    </div>
  );
}
