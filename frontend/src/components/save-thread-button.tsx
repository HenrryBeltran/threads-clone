import { Button } from "@/components/ui/button";
import { UserAccount } from "@/lib/api";
import { safeTry } from "@/lib/safe-try";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bookmark02Icon } from "./icons/hugeicons";
import { get, post } from "@/lib/api/client";

type Props = {
  threadId: string;
  userData: UserAccount | null;
};

export function SaveThreadButton({ threadId, userData }: Props) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const saveQuery = useQuery({
    queryKey: ["saved", threadId],
    queryFn: async () => {
      const response = await safeTry(get<{ saved: boolean }>("/thread/post/save/" + threadId));

      if (response.error) throw new Error("Something went wrong");
      if (!response.result.ok) throw new Error("Something went wrong");

      return response.result.data;
    },
  });
  const saveMutation = useMutation({
    mutationKey: ["saved", threadId],
    mutationFn: async () => {
      const response = await safeTry(post<{ saved: boolean }>("/thread/post/save/" + threadId));

      if (response.error) throw new Error("Something went wrong");
      if (!response.result.ok) throw new Error("Something went wrong");

      return response.result.data;
    },
    onMutate: () => {
      queryClient.setQueryData(["saved", threadId], { saved: true });
    },
    onError: () => {
      queryClient.setQueryData(["saved", threadId], { saved: false });

      toast("Save action failded try again.", {
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
  const unsaveMutation = useMutation({
    mutationKey: ["saved", threadId],
    mutationFn: async () => {
      const response = await safeTry(post<{ saved: boolean }>("/thread/post/unsave/" + threadId));

      if (response.error) throw new Error("Something went wrong");
      if (!response.result.ok) throw new Error("Something went wrong");

      return response.result.data;
    },
    onMutate: () => {
      queryClient.setQueryData(["saved", threadId], { saved: false });
    },
    onError: () => {
      queryClient.setQueryData(["saved", threadId], { saved: true });

      toast("Save action failded try again.", {
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

        if (saveQuery.data?.saved) {
          unsaveMutation.mutate();
        } else {
          saveMutation.mutate();
        }
      }}
    >
      <Bookmark02Icon
        width={20}
        height={20}
        strokeWidth={1.5}
        data-save={saveQuery.data?.saved ?? false}
        className="data-[save=true]:fill-foreground"
      />
    </Button>
  );
}
