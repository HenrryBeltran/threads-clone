import { NewPostThread } from "@/components/new-post-thread";
import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { Button } from "@/components/ui/button";
import { UserImage } from "@/components/user-image";
import { UserAccount, type ThreadRow } from "@/lib/api";
import { get } from "@/lib/api/client";
import { useThreadModalStore } from "@/store";
import { safeTry } from "@/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/")({
  component: Index,
});

async function postsFetcher({ pageParam }: { pageParam: number }) {
  const response = await safeTry(get<ThreadRow[]>("/threads/posts", { page: pageParam }));

  if (response.error) throw new Error("Something went wrong");
  if (!response.result.ok) throw new Error("Something went wrong");

  return response.result.data;
}

function Index() {
  const showThreadModal = useThreadModalStore((state) => state.show);
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount | null>(["user", "account"]);

  return (
    <div className="pt-[74px]">
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
              onClick={() => showThreadModal()}
            >
              What's new?
            </button>
            <span className="block cursor-not-allowed">
              <Button
                variant="outline"
                className="rounded-xl border-muted-foreground/30 font-semibold transition-transform duration-200 active:scale-95"
                onClick={() => showThreadModal()}
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
    </div>
  );
}
