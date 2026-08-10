import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { type ThreadRow } from "@/lib/api";
import { get } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/saved")({
  component: Saved,
});

function Saved() {
  return (
    <main>
      <SavedResult />
    </main>
  );
}

function SavedResult() {
  async function getSavedThreads({ pageParam }: { pageParam: number }) {
    const response = await safeTry(get<ThreadRow[]>("/threads/saved/posts", { page: pageParam }));

    if (response.error) throw new Error("Something went wrong");
    if (!response.result.ok) throw new Error("Something went wrong");

    return response.result.data;
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[620px] flex-col pt-24">
        <h2 className="mx-6 mb-2 border-b border-b-muted-foreground/30 pb-2 text-lg font-semibold tracking-tight">
          Saved
        </h2>
      </div>
      <div className="w-full">
        <ThreadsInfiniteScroll
          queryKey={["threads", "saved"]}
          queryFn={getSavedThreads}
          threadsNotFoundMessage="No saved threads found."
        />
      </div>
    </>
  );
}
