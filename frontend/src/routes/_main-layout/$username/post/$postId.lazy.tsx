import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Replies } from "@/components/replies";
import { Thread } from "@/components/thread";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/post/$postId")({
  component: Post,
});

async function getPost(username: string, postId: string) {
  const res = await safeTry(api.threads.post[":username"][":postId"].$get({ param: { username, postId } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

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
    currentThreadQuery.data?.rootId === currentThreadQuery.data?.id ? null : currentThreadQuery.data?.rootId ?? null;

  const rootThreadQuery = useQuery({
    queryKey: ["thread", "root", rootId],
    queryFn: () => getPostById(rootId!),
    staleTime: Infinity,
    enabled: rootId !== null,
  });

  return (
    <>
      <div className="space-y-4 before:block before:h-[74px] before:w-full before:content-['']">
        <div className="mx-auto max-w-[620px] px-6">
          {(currentThreadQuery.isFetching || currentThreadQuery.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
          {rootId && rootId !== parentId && notFoundLinkThread(rootThreadQuery.error)}
          {rootThreadQuery.data && rootId && rootId !== parentId && (
            <div className="relative">
              <Thread {...rootThreadQuery.data} />
              <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/60" />
            </div>
          )}
          {notFoundLinkThread(parentThreadQuery.error)}
          {parentThreadQuery.data && (
            <div className="relative">
              <Thread {...parentThreadQuery.data} />
              <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/60" />
            </div>
          )}
          {currentThreadQuery.data && (
            <div className="border-b border-muted-foreground/30 pb-2">
              <Thread {...currentThreadQuery.data} style="main" />
            </div>
          )}
          {currentThreadQuery.data && <Replies id={currentThreadQuery.data.id} />}
        </div>
      </div>
    </>
  );
}

function notFoundLinkThread(error: Error | null) {
  return (
    <>
      {error !== null && JSON.parse(error.message).status === 404 && (
        <div className="relative">
          <div className="group flex flex-col pt-4">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-11 w-11 rounded-full bg-muted-foreground/20" />
              <div className="h-5 w-16 rounded-md bg-muted-foreground/20" />
            </div>
            <div className="flex-grow">
              <div className="ml-8 px-6">
                <div className="flex h-32 text-muted-foreground w-full items-center justify-center rounded-md bg-muted-foreground/10 p-6">
                  This thread has been deleted.
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/60" />
        </div>
      )}
    </>
  );
}
