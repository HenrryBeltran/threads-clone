import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, UserAccount } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { usernameSchema as usernameFieldSchema } from "@server/common/schemas";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/change-username")({
  component: ChangeUsername,
});

const usernameSchema = z.object({ username: usernameFieldSchema });

type Username = z.infer<typeof usernameSchema>;

function ChangeUsername() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const navigate = useNavigate();
  const form = useForm<Username>({
    defaultValues: { username: user?.username },
    resolver: zodResolver(usernameSchema),
  });

  const onSubmit: SubmitHandler<Username> = async (value) => {
    const res = await safeTry(api.account.user.username.$post({ json: { newUsername: value.username } }));

    if (res.error !== null) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      const { message, path } = (await res.result.json()) as {
        message?: string;
        path?: string;
      };

      form.setError((path as "username" | "root") ?? "root", { message });
      return;
    }

    queryClient.clear();
    navigate({ to: `/@${value.username}` });
    toast("New email updated successfully!", {
      duration: 6000,
      position: "bottom-center",
      classNames: {
        title:
          "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
        toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
      },
    });
  };

  return (
    <div className="flex min-h-svh items-center justify-center text-center">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Change Username</h2>
          <p className="mb-8 mt-2 text-pretty text-center text-sm text-muted-foreground">
            Only dots and underscores are allowed for usernames
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <Label htmlFor="username" className="text-start text-base">
            Username
          </Label>
          <Input
            {...form.register("username")}
            id="username"
            name="username"
            type="username"
            error={form.formState.errors.username?.message}
            required
            autoFocus
            placeholder="New email address"
          />
          <Button
            type="submit"
            aria-disabled={form.watch("username") === user?.username || form.formState.isSubmitting}
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
        {form.formState.errors.root && (
          <span className="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-red-400">
            ⓧ {form.formState.errors.root.message}
          </span>
        )}
        {form.formState.errors.username && (
          <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
            <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.username.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
