import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/liked")({
  component: Liked,
});

function Liked() {
  return (
    <main>
      <LikedResult />
    </main>
  );
}

function LikedResult() {
  async function getSearchThreads({ pageParam }: { pageParam: number }) {
    const res = await safeTry(api.threads.liked.posts.$get({ query: { page: pageParam.toString() } }));

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
          Liked
        </h2>
      </div>
      <ThreadsInfiniteScroll
        queryKey={["threads", "liked"]}
        queryFn={getSearchThreads}
        threadsNotFoundMessage="No liked threads found."
      />
    </>
  );
}
