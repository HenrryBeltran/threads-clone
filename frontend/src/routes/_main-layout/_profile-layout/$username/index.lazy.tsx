import { ThreadsInfiniteScroll } from "@/components/threads-infinite-scroll";
import { UserAccount, api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username/")({
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
    const res = await safeTry(
      api.threads.posts[":userId"].$get({
        param: { userId: profile?.id! },
        query: { page: pageParam.toString() },
      }),
    );

    if (res.error) throw new Error("Something went wrong");
    if (!res.result.ok) throw new Error("Something went wrong");

    const { error, result } = await safeTry(res.result.json());

    if (error) throw new Error("Something went wrong");

    return result;
  }

  return (
    <>
      <ThreadsInfiniteScroll queryKey={[profile.username, "threads"]} queryFn={profilePostsFetcher} />
    </>
  );
}
