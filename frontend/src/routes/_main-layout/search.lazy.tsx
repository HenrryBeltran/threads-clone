import SearchForm from "@/components/forms/search-form";
import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { SearchHistory, type SearchHistoryResult } from "@/components/search-history";
import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { type ThreadRow } from "@/lib/api";
import { get } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useLocation } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/search")({
  component: Search,
});

async function fetcher() {
  const response = await safeTry(get<SearchHistoryResult[]>("/search/history"));

  if (response.error) return null;
  if (!response.result.ok) return null;

  return response.result.data;
}

function Search() {
  const { search } = useLocation();
  const query = useQuery({
    queryKey: ["user", "history"],
    queryFn: fetcher,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {search.q === undefined ? (
        <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center px-6 pt-24 sm:px-0">
          <div className="relative w-full">
            <SearchForm />
            <div className="h-24 w-full" />
            {query.isLoading && <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto" />}
            {query.data && <SearchHistory result={query.data} />}
          </div>
        </main>
      ) : (
        <main>
          <SearchResult q={search.q} />
        </main>
      )}
    </>
  );
}

function SearchResult({ q }: { q: string }) {
  async function getSearchThreads({ pageParam }: { pageParam: number }) {
    const response = await safeTry(get<ThreadRow[]>("/threads/posts/search", { page: pageParam, q }));

    if (response.error) throw new Error("Something went wrong");
    if (!response.result.ok) throw new Error("Something went wrong");

    return response.result.data;
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[620px] flex-col pt-24">
        <h2 className="mx-6 mb-2 border-b border-b-muted-foreground/30 pb-2 text-lg font-semibold tracking-tight">
          Results
        </h2>
      </div>
      <ThreadsInfiniteScroll
        queryKey={["threads", "search"]}
        queryFn={getSearchThreads}
        threadsNotFoundMessage="No result found."
        noMorePostsMessage="No more threads found."
      />
    </>
  );
}
