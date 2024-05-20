import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@server/common/schemas/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputPassword } from "../ui/input-password";
import { safeTry } from "@server/lib/safe-try";
import { api } from "@/lib/api";
import { Link } from "@tanstack/react-router";

type Props = {
  temporalToken: string;
};

export default function ResetPasswordForm({ temporalToken }: Props) {
  const [successfullyResetPassword, setSuccessfullyResetPassword] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof resetPasswordSchema>) {
    const res = await safeTry(
      api.auth["reset-password"][":temporal-token"].$post({ json: data, param: { "temporal-token": temporalToken } }),
    );

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      const { message } = await res.result.json();

      form.setError("root", { message });
      return;
    }

    setSuccessfullyResetPassword(true);
  }

  if (successfullyResetPassword) {
    return (
      <>
        <h1 className="text-pretty text-center text-lg font-medium">
          Your Threads Clone password has been updated successfully.
        </h1>
        <Link to="/login">
          <Button className="mt-8 w-full rounded-xl py-6 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary">
            Go to login
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-sm md:max-w-lg">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Reset Password</h1>
        <p className="mb-8 mt-2 text-pretty text-center text-sm text-muted-foreground">
          Write your new password two times to update it.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="mx-auto max-w-sm space-y-2 pb-16">
          <InputPassword
            {...form.register("newPassword")}
            error={form.formState.errors.newPassword?.message}
            placeholder="Password"
            className="flex-grow border-none bg-transparent px-4 py-7 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
          />
          <InputPassword
            {...form.register("confirmNewPassword")}
            error={form.formState.errors.confirmNewPassword?.message}
            placeholder="Confirm password"
            className="flex-grow border-none bg-transparent px-4 py-7 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
          />
          <Button
            type="submit"
            aria-disabled={
              form.watch("newPassword") === "" || form.watch("confirmNewPassword") === "" || form.formState.isSubmitting
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
          <Link to="/login" className="!mt-5 inline-block w-full text-center text-[.9375rem] text-muted-foreground">
            Return to the login page
          </Link>
        </div>
      </form>
    </>
  );
}
