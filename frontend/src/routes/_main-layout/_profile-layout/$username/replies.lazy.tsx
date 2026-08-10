import { ReplyThread, ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { UserAccount } from "@/lib/api";
import { get } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username/replies")({
  component: ProfileReplies,
});

function ProfileReplies() {
  const ctx = useRouteContext({ from: "/_main-layout/_profile-layout" });

  if (typeof ctx.profile === "number") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <h1>Profile acccount not found.</h1>
      </div>
    );
  }

  const profile = (ctx.user as UserAccount | null) ?? ctx.profile;

  if (!profile) {
    throw new Error("Something went wrong");
  }

  async function profilePostsFetcher({ pageParam }: { pageParam: number }) {
    const response = await safeTry(get<ReplyThread[]>("/threads/replies/posts/" + profile?.id!, { page: pageParam }));

    if (response.error) throw new Error("Something went wrong");
    if (!response.result.ok) throw new Error("Something went wrong");

    return response.result.data;
  }

  return (
    <>
      <ThreadsInfiniteScroll
        queryKey={[profile.username, "threads", "replies"]}
        queryFn={profilePostsFetcher}
        type="reply"
      />
    </>
  );
}
