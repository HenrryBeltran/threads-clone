import { AlertCircleIcon } from "@/components/icons/hugeicons";
import { api, UserAccount } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-email/confirm")({
  component: ChangeEmailConfirm,
});

function ChangeEmailConfirm() {
  const { temporal_token } = Route.useSearch<{ temporal_token: string }>();
  const navigate = useNavigate();
  const [isOk, setIsOk] = useState(true);
  const query = useQuery({
    queryKey: ["change-email"],
    queryFn: async () => {
      const { error, result } = await safeTry(
        api.account.user.email.verification.$post({ query: { token: temporal_token } }),
      );

      if (error !== null) return Error("Something went wrong");
      if (!result.ok) {
        setIsOk(false);
      }

      const { error: parseError, result: data } = await safeTry(result.json());

      if (parseError !== null) return Error("Something went wrong");

      return data;
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  useEffect(() => {
    if (user !== undefined && isOk && query.data !== undefined && query.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ["user", "account"] });
      navigate({ to: `/@${user.username}` });
      toast("New email updated successfully!", {
        duration: 6000,
        position: "bottom-center",
        classNames: {
          title:
            "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
          toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
        },
      });
    }
  }, [isOk, query]);

  return (
    <>
      {!isOk && (
        <div className="flex min-h-svh w-full items-center justify-center">
          {query.data?.message ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircleIcon width={30} height={30} strokeWidth={2} />
              <span className="text-xl font-semibold tracking-tight">{query.data.message}</span>
            </div>
          ) : (
            <div className="flex min-h-svh w-full items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="text-6xl font-bold text-muted-foreground">400</span>
                <span className="text-lg font-extrabold tracking-tight">Bad request</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
