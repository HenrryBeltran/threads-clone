import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { ProfileRow } from "./profile-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type Props = {
  followersCount: number;
  followingsCount: number;
  userId: string;
  targetId: string;
  handleOnClick?: () => void;
};

export function FollowersCard({ followersCount, followingsCount, userId, targetId, handleOnClick }: Props) {
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
        <FollowersContent userId={userId} targetId={targetId} handleOnClick={handleOnClick} />
        <FollowingsContent userId={userId} targetId={targetId} handleOnClick={handleOnClick} />
      </Tabs>
    </div>
  );
}

type FollowsProps = {
  userId: string;
  targetId: string;
  handleOnClick?: () => void;
};

function FollowersContent({ userId, targetId, handleOnClick }: FollowsProps) {
  const followers = useInfiniteQuery({
    queryKey: ["followers", targetId],
    queryFn: async ({ pageParam }) => {
      const res = await api.account.profile.followers[":targetId"].$get({
        param: { targetId },
        query: { page: pageParam.toString() },
      });
      const data = await res.json();
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      followers.fetchNextPage();
    }
  }, [inView]);

  return (
    <TabsContent value="followers" className="m-0 h-[calc(512px-64px)] overflow-y-scroll p-5">
      {!followers.isLoading && (
        <div className="space-y-5">
          {followers.data &&
            (followers.data.pages.length > 0 ? (
              followers.data.pages.map((group) =>
                group.map((follower) => (
                  <ProfileRow
                    key={follower.username}
                    name={follower.name}
                    username={follower.username}
                    profilePictureId={follower.profilePictureId}
                    followStatus={follower.followStatus}
                    isMyProfile={userId === follower.id}
                    handleOnClick={handleOnClick}
                  />
                )),
              )
            ) : (
              <span className="inline-block w-full p-8 text-center font-light text-muted-foreground">
                Empty followers list.
              </span>
            ))}
          {(followers.isFetchingNextPage || followers.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
        </div>
      )}
      {followers.isLoading && (
        <div className="flex items-center justify-center pt-4">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-foreground" />
        </div>
      )}
      <div ref={ref} className="h-px w-full" />
    </TabsContent>
  );
}

function FollowingsContent({ userId, targetId, handleOnClick: onClick }: FollowsProps) {
  const followings = useInfiniteQuery({
    queryKey: ["followings", targetId],
    queryFn: async ({ pageParam }) => {
      const res = await api.account.profile.followings[":targetId"].$get({
        param: { targetId },
        query: { page: pageParam.toString() },
      });
      const data = await res.json();
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      followings.fetchNextPage();
    }
  }, [inView]);

  return (
    <TabsContent value="following" className="m-0 h-[calc(512px-64px)] overflow-y-scroll p-5">
      {!followings.isLoading && (
        <div className="space-y-5">
          {followings.data &&
            (followings.data.pages.length > 0 ? (
              followings.data.pages.map((group) =>
                group.map((following) => (
                  <ProfileRow
                    key={following.username}
                    name={following.name}
                    username={following.username}
                    profilePictureId={following.profilePictureId}
                    followStatus={following.followStatus}
                    isMyProfile={userId === following.id}
                    handleOnClick={onClick}
                  />
                )),
              )
            ) : (
              <span className="inline-block w-full p-8 text-center font-light text-muted-foreground">
                {userId === targetId ? "You are not following anyone yet." : "Not following anyone yet."}
              </span>
            ))}
          {(followings.isFetchingNextPage || followings.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
        </div>
      )}
      {followings.isLoading && (
        <div className="flex items-center justify-center pt-4">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-foreground" />
        </div>
      )}
      <div ref={ref} className="h-px w-full" />
    </TabsContent>
  );
}
