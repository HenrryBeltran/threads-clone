import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { InputPassword } from "@/components/ui/input-password";
import { api, UserAccount } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@server/common/schemas/auth";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-password")({
  component: ChangePassword,
});

type ChangePasswordSchema = z.infer<typeof resetPasswordSchema>;

function ChangePassword() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordSchema) {
    const res = await safeTry(api.account.user.password.$post({ json: data }));

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      const { message } = await res.result.json();

      form.setError("root", { message });
      return;
    }

    navigate({ to: `/@${user?.username}` });
    toast("Your password has been updated successfully!", {
      duration: 6000,
      position: "bottom-center",
      classNames: {
        title:
          "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
        toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
      },
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center text-center">
      <div className="w-full max-w-sm">
        <div className="mx-auto max-w-sm md:max-w-lg">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Change Password</h2>
          <p className="mb-8 mt-2 text-pretty text-center text-sm text-muted-foreground">
            Write your new password two times to update it.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="mx-auto max-w-sm space-y-2 pb-16">
            <InputPassword
              {...form.register("newPassword")}
              error={form.formState.errors.newPassword?.message}
              placeholder="New Password"
            />
            <InputPassword
              {...form.register("confirmNewPassword")}
              error={form.formState.errors.confirmNewPassword?.message}
              placeholder="Confirm password"
            />
            <Button
              type="submit"
              aria-disabled={
                form.watch("newPassword") === "" ||
                form.watch("confirmNewPassword") === "" ||
                form.formState.isSubmitting
              }
              className="!mt-8 w-full rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
              onClick={(e) => {
                if (e.currentTarget.ariaDisabled === "true") {
                  e.preventDefault();
                  return;
                }
              }}
            >
              {form.formState.isSubmitting ? (
                <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-secondary" />
              ) : (
                "Save"
              )}
            </Button>
            {Object.values(form.formState.errors).find((value) => value.message !== undefined) && (
              <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
                {form.formState.errors.root && (
                  <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.root.message}</span>
                )}
                {form.formState.errors.newPassword && (
                  <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.newPassword.message}</span>
                )}
                {form.formState.errors.confirmNewPassword && (
                  <span className="text-pretty text-sm font-medium">
                    ⓧ {form.formState.errors.confirmNewPassword.message}
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
