import { FollowButton } from "@/components/follow-button";
import { ProfileBio } from "@/components/profile-bio";
import { ProfileFollowersCount } from "@/components/profile-followers-count";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileLink } from "@/components/profile-link";
import { Button } from "@/components/ui/button";
import { type UserAccount } from "@/lib/api";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username")({
  component: Profile,
});

function Profile() {
  const ctx = useRouteContext({ from: "/_main-layout/_profile-layout" });

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
      <div className="mx-auto w-full max-w-screen-sm px-6 pt-20 sm:pt-24">
        <ProfileHeader username={profile.username} name={profile.name} profilePictureId={profile.profilePictureId} />
        <ProfileBio text={profile.bio} />
        <div className="flex min-h-8 items-center gap-1.5">
          <ProfileFollowersCount
            followersCount={profile.followersCount}
            profilePictureIdOne={profile.targetId[0] ? profile.targetId[0].userId.profilePictureId : null}
            profilePictureIdTwo={profile.targetId[1] ? profile.targetId[1].userId.profilePictureId : null}
          />
          <ProfileLink link={profile.link} />
        </div>
        {ctx.follow !== null &&
          ((profile as UserAccount).id ? (
            <Button variant="outline" className="my-4 w-full rounded-xl border-muted-foreground/40">
              Edit profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <FollowButton targetUsername={profile.username} />
              <Button variant="outline" className="my-4 w-full rounded-xl border-muted-foreground/40">
                Mention
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
