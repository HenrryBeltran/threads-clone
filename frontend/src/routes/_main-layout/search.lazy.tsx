import SearchForm from "@/components/forms/search-form";
import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { SearchHistory } from "@/components/search-history";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

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
  const query = useQuery({ queryKey: ["user", "history"], queryFn: fetcher });

  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center px-6 pt-24 sm:px-0">
      <div className="relative w-full">
        <SearchForm />
        {query.isLoading && <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} />}
        {query.data && <SearchHistory result={query.data} />}
      </div>
    </main>
  );
}
