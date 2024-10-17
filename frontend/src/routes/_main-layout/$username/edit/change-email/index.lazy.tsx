import { AlertCircleIcon, Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, UserAccount } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@server/common/schemas";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-email/")({
  component: ChangeEmail,
});

type Email = z.infer<typeof emailSchema>;

function ChangeEmail() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const [requestNewEmail, setRequestNewEmail] = useState({
    state: false,
    email: "",
  });
  const form = useForm<Email>({
    defaultValues: { email: "" },
    resolver: zodResolver(emailSchema),
  });

  const onSubmit: SubmitHandler<Email> = async (value) => {
    const res = await safeTry(api.account.user.email.$post({ json: { newEmail: value.email } }));

    if (res.error !== null) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      if ((res.result.status as number) === 429) {
        form.setError("root", { message: "Too many request, try again later." });
        return;
      }

      const { message, path } = (await res.result.json()) as {
        message?: string;
        path?: string;
      };

      form.setError((path as "email" | "root") ?? "root", { message });
      return;
    }

    setRequestNewEmail({ state: true, email: value.email });
  };

  return (
    <div className="flex min-h-svh items-center justify-center text-center">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Change Email</h2>
          <p className="mb-8 mt-2 text-pretty text-center text-sm text-muted-foreground">
            Introduce your new email address.
            <br />
            This will send you an email to confirm the updated.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label htmlFor="old-email" className="text-start text-base">
              Current email
            </Label>
            <Input
              id="old-email"
              name="old-email"
              type="email"
              value={user?.email}
              onClick={(e) => e.preventDefault()}
              onInput={(e) => e.preventDefault()}
              onFocus={(e) => e.preventDefault()}
              disabled={true}
              className="text-foreground/70"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-start text-base">
              New email
            </Label>
            <Input
              {...form.register("email")}
              id="email"
              name="email"
              type="email"
              error={form.formState.errors.email?.message}
              required
              autoFocus
              placeholder="New email address"
            />
          </div>
          <Button
            type="submit"
            aria-disabled={form.watch("email") === "" || form.formState.isSubmitting}
            className="!mt-8 w-full rounded-xl py-7 text-base shadow-none aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
            onClick={(e) => {
              if (e.currentTarget.ariaDisabled === "true") {
                e.preventDefault();
                e.stopPropagation();
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
        </form>
        {requestNewEmail.state && (
          <div className="mt-8 rounded-lg border border-amber-400/60 p-4 text-start">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircleIcon className="text-amber-100" width={24} height={24} strokeWidth={2} />
              <h3 className="text-lg font-bold tracking-tight text-amber-100">Verify email to confirm the update</h3>
            </div>
            <p className="text-pretty break-all leading-tight text-amber-200">
              We send you an email to <strong>{requestNewEmail.email}</strong> to confirm your new email address.
            </p>
          </div>
        )}
        {form.formState.errors.root && (
          <span className="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-red-400">
            ⓧ {form.formState.errors.root.message}
          </span>
        )}
        {form.formState.errors.email && (
          <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
            <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.email.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
