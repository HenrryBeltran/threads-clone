import { api } from "@/lib/api";
import { QueryFunction, useInfiniteQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono/client";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { Thread } from "./thread";
import { ThreadsSkeleton } from "./threads-skeleton";

export type Posts = InferResponseType<typeof api.threads.posts.$get>;

export type PostsPages = {
  pages: Posts[];
  pageParams: number[];
};

type Props = {
  queryKey: string[];
  queryFn: QueryFunction<Posts, string[], number> | undefined;
  noMorePostsMessage?: string;
};

export function ThreadsInfiniteScroll({ queryKey, queryFn, noMorePostsMessage }: Props) {
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
      <div className="flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 px-6">
        {query.isLoading && <ThreadsSkeleton />}
        {query.isRefetching === false &&
          query.data &&
          query.data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.map((thread) => (
                <Thread key={thread.postId} {...thread} />
              ))}
            </Fragment>
          ))}
        {(query.isFetchingNextPage || query.isRefetching) && (
          <div className="py-3">
            <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
          </div>
        )}
        {query.hasNextPage === false && noMorePostsMessage && query.isFetching === false && (
          <div className="flex justify-center py-6">
            <p className="text-muted-foreground">{noMorePostsMessage}</p>
          </div>
        )}
      </div>
      <div ref={ref} className="h-px w-full bg-transparent" />
    </div>
  );
}
