import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const Route = createLazyFileRoute("/_main-layout/activity")({
  component: Activity,
});

async function getAllNotifications() {
  const res = await safeTry(api.account.activity.all.$get());

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

async function markAsRead() {
  const res = await safeTry(api.account.activity["mark-as-read"].$post());

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

function Activity() {
  const queryClient = useQueryClient();
  const allActivity = useQuery({ queryKey: ["activity"], queryFn: getAllNotifications });
  const mutation = useMutation({
    mutationKey: ["activity"],
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    },
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      mutation.mutate();
    }
  }, [inView]);

  return (
    <div className="pt-[74px]">
      <div ref={ref} className="mx-auto max-w-[620px] px-6">
        <h2 className="mt-2 font-medium">Unread</h2>
        {allActivity.data &&
          allActivity.data.unread.map((unread, i) => (
            <div key={i}>
              <strong>{unread.senderInfo.username} </strong>
              <span className="font-medium">{unread.message}</span>
            </div>
          ))}
        <h2 className="mt-2 font-medium">Read</h2>
        {allActivity.data &&
          allActivity.data.read.map((read, i) => (
            <div key={i}>
              <strong className="font-medium">{read.senderInfo.username} </strong>
              <span>{read.message}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
