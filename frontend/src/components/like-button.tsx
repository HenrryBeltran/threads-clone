import { Button } from "@/components/ui/button";
import { UserAccount, api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { FavouriteIcon } from "./icons/hugeicons";

type Props = {
  threadId: string;
  likesCount: number;
  userData: UserAccount | null;
};

export function LikeButton({ threadId, likesCount, userData }: Props) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const likeQuery = useQuery({
    queryKey: ["like", threadId],
    queryFn: async () => {
      const res = await safeTry(api.thread.post.like[":threadId"].$get({ param: { threadId } }));

      if (res.error) throw new Error("Something went wrong");
      if (!res.result.ok) throw new Error("Something went wrong");

      const data = await res.result.json();
      return data;
    },
  });
  const likeMutation = useMutation({
    mutationKey: ["like", threadId],
    mutationFn: async () => {
      const res = await safeTry(
        api.thread.post.like[":threadId"].$post({
          param: { threadId },
        }),
      );

      if (res.error) throw new Error("Something went wrong");
      if (!res.result.ok) throw new Error("Something went wrong");

      const data = await res.result.json();
      return data;
    },
    onMutate: () => {
      queryClient.setQueryData(["like", threadId], { like: true });
    },
    onError: () => {
      queryClient.setQueryData(["like", threadId], { like: false });

      toast("Like action failded try again.", {
        position: "bottom-center",
        classNames: {
          title:
            "text-base dark:text-red-400 text-destructive text-center font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/15 bg-white dark:bg-neutral-900 rounded-xl",
          toast: "pointer-events-none !bg-transparent p-0 flex justify-center border-none !shadow-none",
        },
      });
    },
    onSettled: () => router.invalidate(),
  });
  const unlikeMutation = useMutation({
    mutationKey: ["like", threadId],
    mutationFn: async () => {
      const res = await safeTry(
        api.thread.post.unlike[":threadId"].$post({
          param: { threadId },
        }),
      );

      if (res.error) throw new Error("Something went wrong");
      if (!res.result.ok) throw new Error("Something went wrong");

      const data = await res.result.json();
      return data;
    },
    onMutate: () => {
      queryClient.setQueryData(["like", threadId], { like: false });
    },
    onError: () => {
      queryClient.setQueryData(["like", threadId], { like: true });

      toast("Like action failded try again.", {
        position: "bottom-center",
        classNames: {
          title:
            "text-base dark:text-red-400 text-destructive text-center font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/15 bg-white dark:bg-neutral-900 rounded-xl",
          toast: "pointer-events-none !bg-transparent p-0 flex justify-center border-none !shadow-none",
        },
      });
    },
    onSettled: () => router.invalidate(),
  });

  return (
    <Button
      variant="ghost"
      className="h-9 space-x-1 rounded-full px-2 text-foreground/60"
      onClick={() => {
        if (userData === null) {
          navigate({ to: "/login" });
          return;
        }

        if (likeQuery.data?.like) {
          unlikeMutation.mutate();
        } else {
          likeMutation.mutate();
        }
      }}
    >
      <FavouriteIcon
        width={20}
        height={20}
        strokeWidth={1.5}
        data-like={likeQuery.data?.like ?? false}
        className="data-[like=true]:fill-red-500 data-[like=true]:text-red-500"
      />
      {likesCount > 0 && <span>{likesCount}</span>}
    </Button>
  );
}
