import {
  ArrowRight01Icon,
  Delete02Icon,
  LockPasswordIcon,
  MailAtSign01Icon,
  UserAccountIcon,
  UserIcon,
} from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, UserAccount } from "@/lib/api";
import { DialogDescription } from "@radix-ui/react-dialog";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  const mutation = useMutation({
    mutationKey: ["user", "account", "delete"],
    mutationFn: async () => {
      const res = await safeTry(api.account.user.$delete());

      if (res.error !== null) return Error("Something went wrong");
      if (!res.result.ok) return Error("Something went wrong");

      const { error, result } = await safeTry(res.result.json());

      if (error !== null) return Error("Something went wrong");

      return result;
    },
    onSuccess: () => {
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-[620px] space-y-3 px-6">
        <h1 className="mb-6 text-center text-lg font-semibold tracking-tight">Edit Account</h1>
        <EditLink
          to={`/@${user?.username}/edit/update-profile`}
          title="Update Profile"
          subTitle="Edit your profile info like name, bio, link and profile photo."
          icon={<UserAccountIcon width={24} height={24} strokeWidth={1.5} />}
        />
        <EditLink
          to={`/@${user?.username}/edit/change-email`}
          title="Email"
          subTitle="Change your account email to a new one."
          icon={<MailAtSign01Icon width={24} height={24} strokeWidth={1.5} />}
          forbbiden={user?.roles === "viewer"}
        />
        <EditLink
          to={`/@${user?.username}/edit/change-username`}
          title="Username"
          subTitle="Change your username."
          icon={<UserIcon width={24} height={24} strokeWidth={1.5} />}
          forbbiden={user?.roles === "viewer"}
        />
        <EditLink
          to={`/@${user?.username}/edit/change-password`}
          title="Password"
          subTitle="Change to a new password."
          icon={<LockPasswordIcon width={24} height={24} strokeWidth={1.5} />}
          forbbiden={user?.roles === "viewer"}
        />
        {user && user.roles !== "viewer" && <DeleteAccountButton deleteHandler={() => mutation.mutate()} />}
      </div>
    </div>
  );
}

function DeleteAccountButton({ deleteHandler }: { deleteHandler: () => void }) {
  const [openWarning, setOpenWarning] = useState(false);

  return (
    <>
      <div className="!my-12 h-px w-full bg-muted-foreground/30" />
      <button
        className="!mt-0 flex w-full items-center justify-between rounded-lg border border-red-300 p-3 text-red-500 dark:border-red-400 dark:text-red-400"
        onClick={() => setOpenWarning(true)}
      >
        <div className="flex items-center gap-3">
          <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-muted-foreground/10 dark:bg-muted-foreground/15">
            <Delete02Icon width={24} height={24} strokeWidth={1.5} />
          </div>
          <span>Delete Account</span>
        </div>
        <div className="flex">
          <ArrowRight01Icon width={24} height={24} strokeWidth={2} className="text-red-400 dark:text-red-300/80" />
        </div>
      </button>
      {openWarning && (
        <Dialog open={openWarning} onOpenChange={(value) => setOpenWarning(value)}>
          <DialogContent className="max-w-[328px] gap-0 divide-y divide-muted-foreground/30 !rounded-2xl border border-muted-foreground/30 p-0">
            <DialogHeader className="space-y-4 p-6">
              <DialogTitle className="text-balance text-center text-xl font-medium tracking-tight">
                Are you sure you want to delete your account?
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                This Action will delete all your account data. Once deleted this action can not be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-0 divide-x divide-muted-foreground/30">
              <DialogClose asChild className="basis-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-none rounded-bl-2xl text-base focus-visible:ring-blue-500"
                >
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild className="basis-1/2" autoFocus>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-none rounded-br-2xl text-base text-destructive hover:text-destructive focus-visible:ring-blue-500 dark:text-red-400 hover:dark:text-red-400"
                  onClick={() => deleteHandler()}
                >
                  Delete Account
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

type EditLinkProps = {
  to: string;
  title: string;
  subTitle: string;
  icon: React.ReactNode;
  forbbiden?: boolean;
};

function EditLink({ to, title, subTitle, icon, forbbiden = false }: EditLinkProps) {
  return (
    <Link
      to={to}
      data-disable={forbbiden}
      onClick={(e) => {
        if (forbbiden === true) {
          e.preventDefault();
        }
      }}
      className="flex w-full items-center justify-between rounded-lg border border-muted-foreground/20 p-3 data-[disable=true]:cursor-not-allowed data-[disable=true]:opacity-50 data-[disable=false]:hover:bg-muted-foreground/10 dark:border-muted-foreground/15 data-[disable=false]:dark:hover:bg-muted-foreground/15"
    >
      <div className="flex w-full items-center gap-3">
        <div className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-muted-foreground/10 dark:bg-muted-foreground/15">
          {icon}
        </div>
        <div className="flex w-full max-w-[70%] flex-col justify-center gap-1">
          <span className="font-semibold leading-tight">{title}</span>
          <span className="text-pretty leading-tight text-muted-foreground">{subTitle}</span>
          {forbbiden && (
            <span className="text-pretty font-medium leading-tight">Test account cannot access to this feature.</span>
          )}
        </div>
      </div>
      <div className="flex">
        <ArrowRight01Icon width={24} height={24} strokeWidth={2} className="text-muted-foreground" />
      </div>
    </Link>
  );
}
