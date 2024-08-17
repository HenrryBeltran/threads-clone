import { NewPostThread } from "@/components/new-post-thread";
import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { Button } from "@/components/ui/button";
import { UserImage } from "@/components/user-image";
import { UserAccount, api } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/")({
  component: Index,
});

async function postsFetcher({ pageParam }: { pageParam: number }) {
  const res = await safeTry(api.threads.posts.$get({ query: { offset: pageParam.toString() } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

function Index() {
  const showCreateThread = useCreateThreadStore((state) => state.show);
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount | null>(["user", "account"]);

  return (
    <>
      <div className="h-[74px] w-full"></div>
      {user && (
        <div className="mx-auto max-w-[620px] px-6">
          <div className="flex items-center justify-between border-b border-muted-foreground/20 py-4">
            <Link to={`/@${user.username}`}>
              <UserImage
                username={user.username}
                profilePictureId={user.profilePictureId}
                width={48}
                height={48}
                fetchPriority="high"
                loading="lazy"
                className="h-11 w-11"
              />
            </Link>
            <button
              className="flex-grow cursor-text self-stretch px-3 text-start text-muted-foreground/90"
              onClick={() => showCreateThread()}
            >
              Start a thread...
            </button>
            <span className="block cursor-not-allowed">
              <Button
                variant="outline"
                className="rounded-xl border-muted-foreground/30 font-semibold transition-transform duration-200 active:scale-95"
                onClick={() => showCreateThread()}
              >
                Post
              </Button>
            </span>
          </div>
        </div>
      )}
      <NewPostThread />
      <ThreadsInfiniteScroll
        queryKey={["main", "threads"]}
        queryFn={postsFetcher}
        noMorePostsMessage="No more posts for the moment."
      />
    </>
  );
}
