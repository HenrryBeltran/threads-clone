import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { LinkThreadNotFound } from "@/components/link-thread-not-found";
import { Replies } from "@/components/replies";
import { Thread } from "@/components/thread";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createLazyFileRoute("/_main-layout/$username/post/$postId")({
  component: Post,
  notFoundComponent: PostNotFound,
});

async function getPost(username: string, postId: string) {
  const res = await safeTry(api.threads.post[":username"][":postId"].$get({ param: { username, postId } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error(JSON.stringify({ message: "Something went wrong", status: res.result.status }));

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

async function getPostById(id: string) {
  const res = await safeTry(api.threads.post[":id"].$get({ param: { id } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error(JSON.stringify({ status: res.result.status, message: "Something went wrong" }));

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

function Post() {
  const { username: rawUsername, postId } = Route.useParams();
  const username = rawUsername.slice(1);
  const currentThreadQuery = useQuery({
    queryKey: ["thread", username, postId],
    queryFn: () => getPost(username, postId),
    staleTime: Infinity,
    retry: false,
  });

  const parentId = currentThreadQuery.data?.parentId ?? null;

  const parentThreadQuery = useQuery({
    queryKey: ["thread", "post", parentId],
    queryFn: () => getPostById(parentId!),
    staleTime: Infinity,
    enabled: parentId !== null,
    retry: false,
  });

  const rootId =
    currentThreadQuery.data?.rootId === currentThreadQuery.data?.id ? null : (currentThreadQuery.data?.rootId ?? null);

  const rootThreadQuery = useQuery({
    queryKey: ["thread", "root", rootId],
    queryFn: () => getPostById(rootId!),
    staleTime: Infinity,
    enabled: rootId !== null,
  });

  useEffect(() => {
    if (currentThreadQuery.data === undefined) return;
    const thread = document.querySelector(`#${username}-thread`);
    if (thread !== null) {
      thread.scrollIntoView({ behavior: "instant", block: "center" });
    }
  }, [currentThreadQuery]);

  if (currentThreadQuery.error !== null) {
    const { status } = JSON.parse(currentThreadQuery.error.message) as { message: string; status: number };
    if (status === 404) {
      return <PostNotFound />;
    }
  }

  return (
    <>
      <div className="space-y-4 before:block before:h-[74px] before:w-full before:content-['']">
        <div className="mx-auto max-w-[620px] px-6">
          {(currentThreadQuery.isFetching || currentThreadQuery.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
          {rootId && rootId !== parentId && <LinkThreadNotFound error={rootThreadQuery.error} />}
          {rootThreadQuery.data && rootId && rootId !== parentId && (
            <div className="relative">
              <Thread {...rootThreadQuery.data} />
              <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/40" />
            </div>
          )}
          {<LinkThreadNotFound error={parentThreadQuery.error} />}
          {parentThreadQuery.data && (
            <div className="relative">
              <Thread {...parentThreadQuery.data} />
              <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/40" />
            </div>
          )}
          {currentThreadQuery.data && (
            <div className="border-b border-muted-foreground/30 pb-2">
              <Thread {...currentThreadQuery.data} elementId={`${username}-thread`} style="main" />
            </div>
          )}
          {currentThreadQuery.data && <Replies id={currentThreadQuery.data.id} />}
        </div>
      </div>
    </>
  );
}

function PostNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="font-bold leading-none">Sorry, this thread isn&apos;t available</h1>
      <p className="max-w-sm text-center text-base font-light text-muted-foreground">
        The thread that you followed may be broken or have been removed.{" "}
      </p>
      <Button
        type="button"
        className="rounded-xl transition-all focus-visible:ring-blue-500 active:scale-95 focus-visible:dark:ring-blue-400"
        variant="outline"
        onClick={() => navigate({ to: "/", replace: true })}
      >
        Back
      </Button>
    </div>
  );
}
