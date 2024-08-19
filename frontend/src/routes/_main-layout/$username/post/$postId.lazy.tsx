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

function Post() {
  const { username: rawUsername, postId } = Route.useParams();
  const username = rawUsername.slice(1);
  const query = useQuery({
    queryKey: ["thread", username, postId],
    queryFn: () => getPost(username, postId),
    staleTime: Infinity,
  });

  return (
    <>
      <div className="space-y-4 before:block before:h-[74px] before:w-full before:content-['']">
        <div className="mx-auto max-w-[620px] px-6">
          {(query.isFetching || query.isRefetching) && (
            <div className="py-3">
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
            </div>
          )}
          {query.data && <Thread {...query.data} />}
        </div>
      </div>
    </>
  );
}
