"use client";

import { signUpFormSchema } from "@/common/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signUpAction } from "./signUpAction";

export default function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, {
    message: "",
  });
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
            placeholder="Username"
            className="rounded-xl border-none bg-muted px-4 py-7 focus:!ring-muted-foreground/60 dark:bg-muted/75"
          />
          <Input
            {...form.register("email")}
            type="email"
            placeholder="Email address"
            className="rounded-xl border-none bg-muted px-4 py-7 focus:!ring-muted-foreground/60 dark:bg-muted/75"
          />
          <Input
            {...form.register("password")}
            type="password"
            placeholder="Password"
            className="rounded-xl border-transparent bg-muted px-4 py-7 focus:!ring-muted-foreground/60 dark:bg-muted/75"
          />
          <Input
            {...form.register("confirmPassword")}
            type="password"
            placeholder="Confirm password"
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
