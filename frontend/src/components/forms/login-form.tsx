import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth";
import { post } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { TestAccountsPopover } from "../test-accounts-popover";

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<LoginForm>({
    defaultValues: { username: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginForm> = async (value) => {
    const res = await safeTry(post<{ token: string }>("/auth/login", value));

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (res.result.status === 307) {
      queryClient.invalidateQueries({ queryKey: ["user", "account"] });
      const { token } = res.result.data as { token: string };

      if (token && token !== "") {
        navigate({
          to: "/account/verification",
          search: { token },
          replace: true,
        });
      } else {
        navigate({ to: "/account/verification", replace: true });
      }
      return;
    }

    if (!res.result.ok) {
      const { message, path } = res.result.data as {
        message?: string;
        path?: string;
      };

      form.setError((path as "username" | "password" | "root") ?? "root", { message });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["user", "account"] });
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <Input
          {...form.register("username")}
          id="username"
          name="username"
          type="text"
          error={form.formState.errors.username?.message}
          required
          autoFocus
          placeholder="Username or email address"
        />
        <InputPassword
          {...form.register("password")}
          id="password"
          name="password"
          error={form.formState.errors.password?.message}
          required
          placeholder="Password"
        />
        <Button
          type="submit"
          aria-disabled={form.watch("username") === "" || form.watch("password") === "" || form.formState.isSubmitting}
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
            "Log in"
          )}
        </Button>
        <TestAccountsPopover
          setUsername={(value) => form.setValue("username", value)}
          setPassword={(value) => form.setValue("password", value)}
        />
      </form>
      {form.formState.errors.root && (
        <span className="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-red-400">
          ⓧ {form.formState.errors.root.message}
        </span>
      )}
      {(form.formState.errors.username || form.formState.errors.password) && (
        <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
          {form.formState.errors.username && (
            <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.username.message}</span>
          )}
          {form.formState.errors.password && (
            <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.password.message}</span>
          )}
        </div>
      )}
    </div>
  );
}
