import SearchForm from "@/components/forms/search-form";
import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { SearchHistory } from "@/components/search-history";
import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useLocation } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/search")({
  component: Search,
});

async function fetcher() {
  const res = await safeTry(api.search.history.$get());

  if (res.error) return null;
  if (!res.result.ok) return null;

  const { result: data } = await safeTry(res.result.json());

  if (!data) return null;

  return data;
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
    const res = await safeTry(api.threads.posts.search.$get({ query: { page: pageParam.toString(), q } }));

    if (res.error) throw new Error("Something went wrong");
    if (!res.result.ok) throw new Error("Something went wrong");

    const { error, result } = await safeTry(res.result.json());

    if (error) throw new Error("Something went wrong");

    return result;
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
