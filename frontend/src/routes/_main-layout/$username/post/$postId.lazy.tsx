import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Thread } from "@/components/thread";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

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
  const parentThreadQuery = useQuery({
    queryKey: ["thread", username, postId],
    queryFn: () => getPost(username, postId),
    staleTime: Infinity,
  });

  return (
    <>
      <div className="space-y-4 before:block before:h-[74px] before:w-full before:content-['']">
        <div className="mx-auto max-w-[620px] px-6">
          {(parentThreadQuery.isFetching || parentThreadQuery.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
          {parentThreadQuery.data && <Thread {...parentThreadQuery.data} />}
          {parentThreadQuery.data && <Replies id={parentThreadQuery.data.id} />}
        </div>
      </div>
    </>
  );
}

/// TODO: posting multiple threads are broken and also the carusel preview in the create-threads are also broken
function Replies({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const repliesQuery = useQuery({
    queryKey: ["thread", "replies"],
    queryFn: () => getReplies(id),
    staleTime: Infinity,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["thread", "replies"] });
    queryClient.setQueryData(["thread", "replies"], null);
  }, []);
  // useEffect(() => {
  //   queryClient.invalidateQueries({queryKey: ["thread", "replies"]})
  // }, [])

  return <>{repliesQuery.data && repliesQuery.data.map((thread, i) => <Thread key={i} {...thread} />)}</>;
}
