import { ArrowRight01Icon, Cancel01Icon, Loading03AnimatedIcon, Search01Icon } from "@/components/icons/hugeicons";
import { UserAccount, api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { ProfileRow } from "../profile-row";
import { useNavigate } from "@tanstack/react-router";
import { resetInfiniteQueryPagination } from "@/lib/reset-infinity-query";

export async function userSearch(userId?: string, keywords?: string) {
  if (!userId || !keywords) {
    console.error("User id or keywords are undefined");
    return null;
  }

  const res = await safeTry(api.search[":userId"][":keywords"].$get({ param: { userId, keywords } }));

  if (res.error) throw new Error(res.error.message);
  if (!res.result.ok) throw new Error("Fail to search user.");

  const { result: data } = await safeTry(res.result.json());

  if (!data) return null;

  return data;
}

async function addToHistory(targetId: string) {
  const res = await safeTry(api.search.history[":targetId"].$post({ param: { targetId } }));

  if (res.error) throw new Error(res.error.message);
  if (!res.result.ok) throw new Error("Fail to search user.");

  const { result: data } = await safeTry(res.result.json());

  if (!data) return null;

  return data;
}

export default function SearchForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  const [showResults, setShowResults] = useState(false);
  const [keywords, setKeywords] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [keywordsSearch] = useDebounce(keywords, 200);

  const search = useQuery({
    queryKey: ["search", keywordsSearch],
    queryFn: () => userSearch(user?.id, keywordsSearch),
    enabled: !!keywordsSearch && keywordsSearch.length > 0,
    staleTime: Infinity,
  });
  const mutation = useMutation({ mutationKey: ["user", "history"], mutationFn: addToHistory });

  return (
    <>
      <div
        data-typing={showResults}
        className="absolute left-0 top-0 z-10 hidden h-[calc(100svh-96px)] w-full bg-background/70 data-[typing=true]:block dark:bg-background/80"
        onClick={() => setShowResults(false)}
      ></div>
      <form
        className="absolute top-0 z-20 flex w-full flex-col items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          if (keywords.length === 0) return;
          navigate({ to: "/search", search: { q: keywords } });
          resetInfiniteQueryPagination(queryClient, ["threads", "search"]);
          queryClient.invalidateQueries({ queryKey: ["threads", "search"] });
        }}
      >
        <div
          data-typing={showResults}
          className="flex h-fit w-full flex-col rounded-2xl border border-neutral-200 bg-neutral-50 ring-1 ring-transparent transition-all has-[:focus]:border-neutral-300 has-[:active]:ring-transparent data-[typing=true]:w-[105%] data-[typing=true]:border-neutral-300 data-[typing=true]:shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:has-[:focus]:border-neutral-700"
          onClick={() => ref.current?.focus()}
        >
          <div className="peer flex">
            <div className="pl-5">
              <Search01Icon strokeWidth={2} width={20} height={20} className="h-full w-5 text-muted-foreground/60" />
            </div>
            <input
              ref={ref}
              name="q"
              type="text"
              autoFocus
              autoComplete="off"
              value={keywords}
              placeholder="Search"
              data-typing={showResults}
              className="flex-grow bg-transparent px-5 py-4 text-base outline-none"
              onChange={(e) => {
                setKeywords(e.target.value);
                if (e.target.value.length > 0) {
                  setShowResults(true);
                } else {
                  setShowResults(false);
                }
              }}
            />
            {keywords && keywords.length > 0 && (
              <div className="flex items-center pr-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowResults(false);
                    setKeywords("");
                  }}
                >
                  <Cancel01Icon
                    strokeWidth={3}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full bg-muted-foreground/50 p-1.5 text-secondary"
                  />
                </button>
              </div>
            )}
          </div>
          <div
            data-typing={showResults}
            data-not-found={(!!search.data && search.data.length === 0) || !search.data}
            className="h-0 max-h-[400px] overflow-scroll border-t border-t-transparent transition-all data-[typing=true]:h-[400px] data-[not-found=true]:max-h-[60px] data-[typing=false]:!border-t-transparent data-[typing=true]:border-t-muted-foreground/40 data-[typing=false]:p-0"
          >
            {showResults && (
              <button type="submit" className="flex w-full gap-5 py-4">
                <div className="ml-5 w-9">
                  <Search01Icon
                    strokeWidth={2}
                    width={20}
                    height={20}
                    className="h-full w-5 text-muted-foreground/60"
                  />
                </div>
                <span className="flex-grow text-start font-medium">Search for &quot;{keywords}&quot;</span>
                <div className="pr-5">
                  <ArrowRight01Icon
                    strokeWidth={2}
                    width={24}
                    height={24}
                    className="h-full w-6 text-muted-foreground/60"
                  />
                </div>
              </button>
            )}
            {showResults && search.isLoading ? (
              <div className="flex justify-center py-4">
                <Loading03AnimatedIcon strokeWidth={2} width={24} height={24} className="h-6 w-6" />
              </div>
            ) : (
              <>
                <div className="mt-2.5 space-y-5 px-5">
                  {search.data &&
                    search.data.map((result) => (
                      <ProfileRow
                        key={result.username}
                        username={result.username}
                        name={result.name}
                        profilePictureId={result.profilePictureId}
                        followStatus={result.followStatus}
                        isMyProfile={user?.id === result.id}
                        handleOnClick={() => mutation.mutate(result.id)}
                      />
                    ))}
                </div>
                {search.isFetching && search.data && search.data.length > 0 && (
                  <div className="flex justify-center py-4">
                    <Loading03AnimatedIcon strokeWidth={2} width={24} height={24} className="h-6 w-6" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
