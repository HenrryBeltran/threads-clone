import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@server/common/schemas/auth";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type LoginForm = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<LoginForm>({
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit: SubmitHandler<LoginForm> = async (value) => {
    const res = await safeTry(api.auth["sign-up"].$post({ json: value }));

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (res.result.status === 307) {
      queryClient.invalidateQueries({ queryKey: ["user", "account"] });
      navigate({ to: "/account/verification", replace: true });
      return;
    }

    if (!res.result.ok) {
      const { message, path } = (await res.result.json()) as {
        message?: string;
        path?: string;
      };

      form.setError(
        (path as "username" | "email" | "password" | "confirmPassword" | "root") ??
          "root",
        { message },
      );
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["user", "account"] });

    const { result } = await safeTry(res.result.json());

    if (!result) {
      navigate({ to: "/account/verification", replace: true });
      return;
    }

    navigate({
      to: "/account/verification",
      search: { token: result.token },
      replace: true,
    });
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
          placeholder="Username"
        />
        <Input
          {...form.register("email")}
          id="email"
          name="email"
          type="email"
          error={form.formState.errors.username?.message}
          required
          placeholder="Email address"
        />
        <InputPassword
          {...form.register("password")}
          id="password"
          name="password"
          error={form.formState.errors.password?.message}
          required
          placeholder="Password"
        />
        <InputPassword
          {...form.register("confirmPassword")}
          id="confirmPassword"
          name="confirmPassword"
          error={form.formState.errors.confirmPassword?.message}
          required
          placeholder="Confirm password"
        />
        <Button
          type="submit"
          aria-disabled={
            form.watch("username") === "" ||
            form.watch("email") === "" ||
            form.watch("password") === "" ||
            form.watch("confirmPassword") === "" ||
            form.formState.isSubmitting
          }
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
            <Loading03AnimatedIcon
              strokeWidth={3}
              width={24}
              height={24}
              className="text-secondary"
            />
          ) : (
            "Sign up"
          )}
        </Button>
      </form>
      {form.formState.errors.root && (
        <span className="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-red-400">
          ⓧ {form.formState.errors.root.message}
        </span>
      )}
      {(form.formState.errors.username ||
        form.formState.errors.email ||
        form.formState.errors.password ||
        form.formState.errors.confirmPassword) && (
        <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
          {form.formState.errors.username && (
            <span className="text-pretty text-sm font-medium">
              ⓧ {form.formState.errors.username.message}
            </span>
          )}
          {form.formState.errors.email && (
            <span className="text-pretty text-sm font-medium">
              ⓧ {form.formState.errors.email.message}
            </span>
          )}
          {form.formState.errors.password && (
            <span className="text-pretty text-sm font-medium">
              ⓧ {form.formState.errors.password.message}
            </span>
          )}
          {form.formState.errors.confirmPassword && (
            <span className="text-pretty text-sm font-medium">
              ⓧ {form.formState.errors.confirmPassword.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
