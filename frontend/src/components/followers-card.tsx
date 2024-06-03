// import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ProfileRow } from "./profile-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loading03AnimatedIcon } from "./icons/hugeicons";

type Props = {
  followersCount: number;
  followingsCount: number;
  userId: string;
  targetId: string;
};

/// TODO: Fix the closing card popover when a make click to others profile

export function FollowersCard({ followersCount, followingsCount, userId, targetId }: Props) {
  return (
    <div className="max-h-[520px] w-full max-w-md rounded-2xl border border-muted-foreground/10 bg-background dark:bg-neutral-900">
      <Tabs defaultValue="followers" className="w-full">
        <TabsList className="grid h-16 w-full grid-cols-2 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="followers"
            className="flex h-full flex-col rounded-none border-b-2 border-b-muted-foreground/30 !bg-transparent p-0 ring-offset-transparent transition-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent data-[state=active]:border-b-foreground data-[state=active]:shadow-none"
          >
            <span className="text-base leading-tight">Followers</span>
            <span className="text-sm leading-none text-muted-foreground">{followersCount}</span>
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="flex h-full flex-col rounded-none border-b-2 border-b-muted-foreground/30 !bg-transparent p-0 ring-offset-transparent transition-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent data-[state=active]:border-b-foreground data-[state=active]:shadow-none"
          >
            <span className="text-base leading-tight">Following</span>
            <span className="text-sm leading-none text-muted-foreground">{followingsCount}</span>
          </TabsTrigger>
        </TabsList>
        <FollowersContent userId={userId} targetId={targetId} />
        <FollowingsContent userId={userId} targetId={targetId} />
      </Tabs>
    </div>
  );
}

type FollowsProps = {
  userId: string;
  targetId: string;
};

function FollowersContent({ userId, targetId }: FollowsProps) {
  const followers = useQuery({
    queryKey: ["followers", targetId],
    queryFn: async () => {
      const res = await api.account.profile.followers[":targetId"].$get({ param: { targetId } });
      const data = await res.json();
      return data;
    },
  });

  return (
    <TabsContent value="followers" className="m-0 h-[calc(512px-64px)] overflow-y-scroll p-5">
      {!followers.isLoading && (
        <div className="space-y-5">
          {followers.data &&
            (followers.data.length > 0 ? (
              followers.data.map((follower) => (
                <ProfileRow
                  key={follower.username}
                  name={follower.name}
                  username={follower.username}
                  profilePictureId={follower.profilePictureId}
                  followStatus={follower.followStatus}
                  isMyProfile={userId === follower.id}
                />
              ))
            ) : (
              <span className="inline-block w-full p-8 text-center font-light text-muted-foreground">
                Empty followers list.
              </span>
            ))}
        </div>
      )}
      {followers.isLoading && (
        <div className="flex items-center justify-center pt-4">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-foreground" />
        </div>
      )}
    </TabsContent>
  );
}
function FollowingsContent({ userId, targetId }: FollowsProps) {
  const followings = useQuery({
    queryKey: ["followings", targetId],
    queryFn: async () => {
      const res = await api.account.profile.followings[":targetId"].$get({ param: { targetId } });
      const data = await res.json();
      return data;
    },
  });

  return (
    <TabsContent value="following" className="m-0 h-[calc(512px-64px)] overflow-y-scroll p-5">
      {!followings.isLoading && (
        <div className="space-y-5">
          {followings.data &&
            (followings.data.length > 0 ? (
              followings.data.map((following) => (
                <ProfileRow
                  key={following.username}
                  name={following.name}
                  username={following.username}
                  profilePictureId={following.profilePictureId}
                  followStatus={following.followStatus}
                  isMyProfile={userId === following.id}
                />
              ))
            ) : (
              <span className="inline-block w-full p-8 text-center font-light text-muted-foreground">
                {userId === targetId ? "You are not following anyone yet." : "Not following anyone yet."}
              </span>
            ))}
        </div>
      )}
      {followings.isLoading && (
        <div className="flex items-center justify-center pt-4">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-foreground" />
        </div>
      )}
    </TabsContent>
  );
}
