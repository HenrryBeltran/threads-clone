import { api } from "@/lib/api";
import { QueryFunction, useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono/client";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { LinkThreadNotFound } from "./link-thread-not-found";
import { Thread } from "./thread";
import { ThreadsSkeleton } from "./threads-skeleton";

export type Posts = InferResponseType<typeof api.threads.posts.$get>;
const repliesEndpoint = api.threads.replies.posts[":userId"].$get;
export type Replies = InferResponseType<typeof repliesEndpoint>;

export type PostsPages = {
  pages: Posts[];
  pageParams: number[];
};

type Props = {
  queryKey: string[];
  queryFn: QueryFunction<Posts | Replies, string[], number> | undefined;
  threadsNotFoundMessage?: string;
  noMorePostsMessage?: string;
  type?: "thread" | "reply";
};

export function ThreadsInfiniteScroll({
  queryKey,
  queryFn,
  threadsNotFoundMessage,
  noMorePostsMessage,
  type = "thread",
}: Props) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn,
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
      query.fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[620px] flex-col pb-24">
      {query.isSuccess && query.data && query.data && query.data.pages[0] && query.data.pages[0].length === 0 && (
        <p className="pt-6 text-center text-muted-foreground">
          {threadsNotFoundMessage === undefined &&
            (type === "thread"
              ? "This account doesn't have any posts yet."
              : "This account doesn't have any replies yet.")}
          {threadsNotFoundMessage !== undefined && threadsNotFoundMessage}
        </p>
      )}
      <div className="flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 px-6">
        {query.isLoading && <ThreadsSkeleton />}
        {query.isRefetching === false &&
          query.data &&
          query.data.pages.map((group, i) => (
            <Fragment key={i}>
              {type === "reply" &&
                (group as Replies).map((thread, it) => (
                  <div key={it}>
                    <div className="relative">
                      {thread.parent === null ? <LinkThreadNotFound /> : <Thread {...thread.parent} />}
                      {thread.parent !== null && (
                        <div className="absolute left-5 top-[4.75rem] h-[calc(100%-76px)] w-0.5 bg-muted-foreground/40" />
                      )}
                    </div>
                    <Thread {...thread} style="main" />
                  </div>
                ))}
              {type === "thread" &&
                (group as Posts).map((thread, it) => (
                  <div key={it}>
                    <Thread {...thread} />
                  </div>
                ))}
            </Fragment>
          ))}
        {(query.isFetchingNextPage || query.isRefetching) && (
          <div className="py-3">
            <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
          </div>
        )}
        {query.data?.pages[0] &&
          query.data?.pages[0].length > 0 &&
          query.hasNextPage === false &&
          noMorePostsMessage &&
          query.isFetching === false && (
            <div className="flex justify-center py-6">
              <p className="text-muted-foreground">{noMorePostsMessage}</p>
            </div>
          )}
      </div>
      <div ref={ref} className="h-px w-full bg-transparent" />
    </div>
  );
}
