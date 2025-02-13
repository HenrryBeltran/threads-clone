import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { Thread } from "./thread";
import { ThreadsSkeleton } from "./threads-skeleton";

async function getReplies(pageParam: number, parentId: string) {
  const res = await safeTry(
    api.threads.replies[":parentId"].$get({ query: { offset: pageParam.toString() }, param: { parentId } }),
  );

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

export function Replies({ id }: { id: string }) {
  const query = useInfiniteQuery({
    queryKey: ["thread", "replies", id],
    queryFn: ({ pageParam }) => getReplies(pageParam, id),
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
    <div className="divide-y divide-muted-foreground/30 pb-6">
      <span className="inline-block py-3 font-bold">Replies</span>
      <div className="flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 pb-16">
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
      </div>
      {query.data?.pages[0] && query.data.pages[0].length !== 0 && <div ref={ref} className="h-px w-full" />}
    </div>
  );
}
