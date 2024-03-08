"use client";

import { loginFormSchema } from "@/common/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginAction } from "./loginAction";

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, {
    message: "",
  });
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      ...(state?.fields ?? {}),
    },
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      {state.message !== "" && !state.issues && <span>{state.message}</span>}
      <form
        ref={formRef}
        action={formAction}
        onSubmit={() => form.handleSubmit(() => formRef?.current?.submit())}
        className="w-full"
      >
        <div className="mx-auto max-w-sm space-y-2 pb-16">
          <Input
            {...form.register("username")}
            type="text"
            placeholder="Username or email address"
            className="rounded-xl border-none bg-muted px-4 py-7 focus:!ring-muted-foreground/60 dark:bg-muted/75"
            autoFocus
          />
          <Input
            {...form.register("password")}
            type="password"
            placeholder="Password"
            className="rounded-xl border-transparent bg-muted px-4 py-7 focus:!ring-muted-foreground/60 dark:bg-muted/75"
          />
          {form.formState.errors.username && (
            <span>{form.formState.errors.username.message}</span>
          )}
          {form.formState.errors.password && (
            <span>{form.formState.errors.password.message}</span>
          )}
          <Button
            type="submit"
            aria-disabled={form.watch("username") === "" || form.watch("password") === ""}
            className="!mt-8 w-full rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
            onClick={(e) => {
              if (e.currentTarget.ariaDisabled === "true") {
                e.preventDefault();
                return;
              }
            }}
          >
            Log in
          </Button>
          <Link
            href="/accounts/recover-password"
            className="!mt-5 inline-block w-full text-center text-[.9375rem] text-muted-foreground"
          >
            Forgotten password?
          </Link>
          <div className="!mt-8 grid w-full grid-cols-[1fr_min-content_1fr] grid-rows-1 items-center gap-4">
            <div className="h-px bg-muted-foreground/70" />
            <span className="text-muted-foreground/70">or</span>
            <div className="h-px bg-muted-foreground/70" />
          </div>
          <Link href="/sign-up">
            <Button
              type="button"
              variant="secondary"
              className="!mt-8 w-full rounded-xl py-7 text-base"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </form>
    </>
  );
}
