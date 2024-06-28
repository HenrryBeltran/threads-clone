import { ThreadsInfinityScroll } from "@/components/threads-infinity-scroll";
import { Button } from "@/components/ui/button";
import { UserImage } from "@/components/user-image";
import { UserAccount } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/")({
  component: Index,
});

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
      <ThreadsInfinityScroll />
    </>
  );
}
