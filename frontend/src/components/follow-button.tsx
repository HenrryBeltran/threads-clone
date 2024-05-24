import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
// import { followAction } from "@/lib/follow/follow-action";
// import { Try } from "@/lib/safe-try";
import clsx from "clsx";
// import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

type Props = {
  follow: boolean;
  className?: string;
  targetUsername: string;
  pathToRevalidate: string;
};

// type Follow = {
//   follow: boolean;
// };

export default function FollowActionButton({
  follow,
  className,
  targetUsername,
  // pathToRevalidate
}: Props) {
  const followMutation = useMutation({
    mutationKey: ["follow", targetUsername],
    mutationFn: async () => {
      const res = await api.account.profile.follow[":target-username"].$post({
        param: { "target-username": targetUsername },
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const { follow } = await res.json();
      return follow;
    },
  });
  const unfollowMutation = useMutation({
    mutationKey: ["unfollow", targetUsername],
    mutationFn: async () => {
      const res = await api.account.profile.unfollow[":target-username"].$delete({
        param: { "target-username": targetUsername },
      });

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const { follow } = await res.json();
      return follow;
    },
    onSuccess: () => {
      toast("Unfollow", {
        position: "bottom-center",
        classNames: {
          title:
            "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
          toast: "!bg-transparent p-0 flex justify-center border-none !shadow-none",
        },
      });
    },
  });
  // const [optimisticFollow, addOptimisticFollow] = useOptimistic<Follow, boolean>(
  //   following,
  //   (state, newFollow) => ({ ...state, follow: newFollow }),
  // );
  // const [_, startTransition] = useTransition();

  /// TODO: Invalidate the follow query

  return (
    <Button
      type="button"
      variant={follow ? "outline" : "default"}
      className={clsx("my-4 w-full rounded-xl border-muted-foreground/40", className)}
      onClick={() => {
        if (follow) {
          unfollowMutation.mutate();
        } else {
          followMutation.mutate();
        }
        // startTransition(() => {
        //   addOptimisticFollow(!following.follow);
        // });
        // const { error, result } = await Try(followAction(targetUsername, pathToRevalidate));
        //
        // if (error) {
        //   toast("Follow action failded try again.", {
        //     position: "bottom-center",
        //     classNames: {
        //       title:
        //         "text-base dark:text-red-500 text-red-400 text-center font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/15 dark:bg-white bg-neutral-900 rounded-xl",
        //       toast: "!bg-transparent p-0 flex justify-center border-none !shadow-none",
        //     },
        //   });
        // }

        // if (result === false) {
        // }
      }}
    >
      {follow ? "Following" : "Follow"}
    </Button>
  );
}
