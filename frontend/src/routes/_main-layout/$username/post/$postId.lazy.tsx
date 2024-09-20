import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
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
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

async function getReplies(parentId: string) {
  const res = await safeTry(api.threads.replies[":parentId"].$get({ query: { offset: "0" }, param: { parentId } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

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
  });

  const parentId = currentThreadQuery.data?.parentId ?? null;

  const parentThreadQuery = useQuery({
    queryKey: ["thread", "post", parentId],
    queryFn: () => getPostById(parentId!),
    staleTime: Infinity,
    enabled: parentId !== null,
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
          {rootThreadQuery.data && rootId && rootId !== parentId && (
            <div className="relative">
              <Thread {...rootThreadQuery.data} />
              <div className="absolute bottom-0 left-5 h-[calc(100%-76px)] w-0.5 bg-muted-foreground/60" />
            </div>
          )}
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

function Replies({ id }: { id: string }) {
  const repliesQuery = useQuery({
    queryKey: ["thread", "replies", id],
    queryFn: () => getReplies(id),
    staleTime: Infinity,
  });

  return (
    <div className="divide-y divide-muted-foreground/30 pb-6">
      <span className="inline-block py-3 font-bold">Replies</span>
      <div className="flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30">
        {repliesQuery.data && repliesQuery.data.map((thread, i) => <Thread key={i} {...thread} />)}
      </div>
    </div>
  );
}
