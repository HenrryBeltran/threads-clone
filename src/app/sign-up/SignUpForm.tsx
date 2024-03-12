"use client";

import { signUpFormSchema } from "@/common/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpAction } from "./signUpAction";
import { toast } from "sonner";
import { useState } from "react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof signUpFormSchema>) {
    const response = await signUpAction(data);

    if (response.ok) {
      toast(response.message, {
        icon: <Check size={20} absoluteStrokeWidth strokeWidth={1.5} />,
        className: "!rounded-xl dark:!bg-neutral-900",
        position: "bottom-center",
      });
    } else {
      const path = response.path as
        | "username"
        | "email"
        | "password"
        | "confirmPassword"
        | undefined;
      form.setError(path ?? "root", { message: response.message });
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="mx-auto max-w-sm space-y-2 pb-16">
          <div className="flex rounded-xl bg-muted ring-1 ring-transparent has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
            <Input
              {...form.register("username")}
              type="text"
              placeholder="Username"
              className="border-none px-4 py-7 shadow-none !ring-0"
              autoFocus
            />
            <div
              aria-hidden={form.formState.errors.username === undefined}
              className="flex w-16 items-center justify-center text-red-500 aria-hidden:hidden dark:text-foreground"
            >
              <X absoluteStrokeWidth strokeWidth={2} size={24} />
            </div>
          </div>
          <div className="flex rounded-xl bg-muted ring-1 ring-transparent has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Email address"
              className="border-none px-4 py-7 shadow-none !ring-0"
            />
            <div
              aria-hidden={form.formState.errors.email === undefined}
              className="flex w-16 items-center justify-center text-red-500 aria-hidden:hidden dark:text-foreground"
            >
              <X absoluteStrokeWidth strokeWidth={2} size={24} />
            </div>
          </div>
          <div className="flex rounded-xl bg-muted ring-1 ring-transparent has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border-none px-4 py-7 shadow-none !ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex w-16 items-center justify-center text-foreground"
            >
              {showPassword ? (
                <Eye absoluteStrokeWidth strokeWidth={1.5} size={20} />
              ) : (
                <EyeOff absoluteStrokeWidth strokeWidth={1.5} size={20} />
              )}
            </button>
            {form.formState.errors.password && (
              <div className="flex w-16 items-center justify-center text-red-500 dark:text-foreground">
                <X absoluteStrokeWidth strokeWidth={2} size={24} />
              </div>
            )}
          </div>
          <div className="flex rounded-xl bg-muted ring-1 ring-transparent has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
            <Input
              {...form.register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="border-none px-4 py-7 shadow-none !ring-0"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="flex w-16 items-center justify-center text-foreground"
            >
              {showConfirmPassword ? (
                <Eye absoluteStrokeWidth strokeWidth={1.5} size={20} />
              ) : (
                <EyeOff absoluteStrokeWidth strokeWidth={1.5} size={20} />
              )}
            </button>
            {form.formState.errors.confirmPassword && (
              <div className="flex w-16 items-center justify-center text-red-500 dark:text-foreground">
                <X absoluteStrokeWidth strokeWidth={2} size={24} />
              </div>
            )}
          </div>
          <Button
            type="submit"
            aria-disabled={
              form.watch("username") === "" ||
              form.watch("email") === "" ||
              form.watch("password") === "" ||
              form.watch("confirmPassword") === ""
            }
            className="!mt-8 w-full rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
            onClick={(e) => {
              if (e.currentTarget.ariaDisabled === "true") {
                e.preventDefault();
                return;
              }
            }}
          >
            Sign up
          </Button>
          {form.formState.errors.root && (
            <span className="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-foreground">
              ⓧ {form.formState.errors.root.message}
            </span>
          )}
          {Object.values(form.formState.errors).find(
            (value) => value.message !== undefined,
          ) && (
            <div className="!mt-5 flex flex-col text-destructive dark:text-foreground">
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
          <Link
            href="/login"
            className="!mt-5 inline-block w-full text-center text-[.9375rem] text-muted-foreground"
          >
            Already have an account? Log in here.
          </Link>
        </div>
      </form>
    </>
  );
}
