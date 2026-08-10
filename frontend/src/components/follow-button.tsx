import { Button } from "@/components/ui/button";
import { post } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import clsx from "clsx";
import { toast } from "sonner";

type Props = {
  className?: string;
  targetUsername: string;
  followStatus?: boolean;
};

export function FollowButton({ className, targetUsername, followStatus }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryData = queryClient.getQueryData<{ follow: boolean }>(["follow", targetUsername]) ?? {
    follow: followStatus,
  };
  const followMutation = useMutation({
    mutationKey: ["follow", targetUsername],
    mutationFn: async () => {
      const response = await safeTry(post<{ follow: boolean }>("/account/profile/follow/" + targetUsername));

      if (response.error) throw new Error("Something went wrong");
      if (!response.result.ok) throw new Error("Something went wrong");

      return response.result.data;
    },
    onMutate: () => {
      queryClient.setQueryData(["follow", targetUsername], { follow: true });
    },
    onError: () => {
      queryClient.setQueryData(["follow", targetUsername], { follow: false });

      toast("Follow action failded try again.", {
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
  const unfollowMutation = useMutation({
    mutationKey: ["follow", targetUsername],
    mutationFn: async () => {
      const response = await safeTry(post<{ follow: boolean }>("/account/profile/unfollow" + targetUsername));

      if (response.error) throw new Error("Something went wrong");
      if (!response.result.ok) throw new Error("Something went wrong");

      return response.result.data;
    },
    onMutate: () => {
      queryClient.setQueryData(["follow", targetUsername], { follow: false });

      toast("Unfollow", {
        position: "bottom-center",
        classNames: {
          title:
            "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
          toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
        },
      });
    },
    onError: () => {
      queryClient.setQueryData(["follow", targetUsername], { follow: true });

      toast("Follow action failded try again.", {
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
      type="button"
      variant={queryData?.follow ? "outline" : "default"}
      className={clsx("my-4 w-full rounded-xl border-muted-foreground/40", className)}
      onClick={() => {
        if (queryData?.follow) {
          unfollowMutation.mutate();
        } else {
          followMutation.mutate();
        }
      }}
    >
      {queryData?.follow ? "Following" : "Follow"}
    </Button>
  );
}
