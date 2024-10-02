import {
  ArrowRight01Icon,
  LockPasswordIcon,
  MailAtSign01Icon,
  UserAccountIcon,
  UserIcon,
} from "@/components/icons/hugeicons";
import { UserAccount } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/")({
  component: EditProfilePage,
});

function EditProfilePage() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

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
      </div>
    </div>
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
      className="flex w-full items-center justify-between rounded-lg border border-muted-foreground/10 p-3 data-[disable=true]:cursor-not-allowed data-[disable=true]:opacity-50 data-[disable=false]:hover:bg-muted-foreground/10 dark:border-muted-foreground/15 data-[disable=false]:dark:hover:bg-muted-foreground/15"
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
