import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserImage } from "./user-image";

type Props = {
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
};

export function TestAccountsPopover({ setUsername, setPassword }: Props) {
  const [open, setOpen] = useState(false);
  const testAccounts = useQuery({
    queryKey: ["test", "accounts"],
    queryFn: async () => {
      const res = await safeTry(api.user["test-accounts"].$get());

      if (res.error !== null) return null;
      if (!res.result.ok) return null;

      const { error, result } = await safeTry(res.result.json());

      if (error !== null) return null;

      return result;
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  function fillForm(username: string, password: string) {
    setUsername(username);
    setPassword(password);
  }

  return (
    <Popover open={open} onOpenChange={(value) => setOpen(value)}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="cool-border !mt-4 w-full rounded-[.7125rem] bg-background py-7 text-base hover:bg-background/90 dark:text-white"
        >
          Log in with test accounts
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-2 w-fit rounded-xl p-6">
        <div className="space-y-1.5 text-center">
          <h3 className="text-xl font-bold leading-none tracking-tight">Test Accounts</h3>
          <p className="leading-tight text-muted-foreground">Select one account to fill the form and login.</p>
        </div>
        <div className="mt-4 grid w-fit grid-flow-row grid-cols-3 gap-4">
          {testAccounts.data &&
            testAccounts.data.map((account) => (
              <button
                key={account.username}
                className="flex w-[156px] flex-col items-center rounded-xl border-4 border-neutral-200/50 bg-background p-4 transition-colors hover:border-neutral-300/70 hover:bg-neutral-100/90 dark:border-neutral-900 hover:dark:border-neutral-700/70 hover:dark:bg-neutral-900/90"
                onClick={() => {
                  fillForm(account.username, account.password);
                  setOpen(false);
                }}
              >
                <UserImage
                  username={account.username}
                  profilePictureId={account.profilePictureId}
                  width={64}
                  height={64}
                  fetchPriority="high"
                  loading="lazy"
                  className="mb-4 aspect-square w-16"
                />
                <span className="font-bold leading-tight">{account.username}</span>
                <span className="leading-none text-muted-foreground">{account.name}</span>
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
