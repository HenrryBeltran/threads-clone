import { Button } from "@/components/ui/button";
import { Loading03AnimatedIcon } from "@/components/ui/hugeicons";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { api } from "@/lib/api";
import {
  SubmitHandler,
  createForm,
  getErrors,
  getValues,
  zodForm,
} from "@modular-forms/solid";
import { loginSchema } from "@server/common/schemas";
import { safeTry } from "@server/lib/safe-try";
import { useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Match, Show, Switch, createEffect } from "solid-js";
import { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

async function login({ username, password }: { username: string; password: string }) {
  const res = await safeTry(api.auth.session.$post({ json: { username, password } }));

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (!res.result.ok) {
    throw new Error("Something went wrong");
  }
}

export default function LoginForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, { Form, Field }] = createForm<LoginForm>({
    initialValues: { username: "", password: "" },
    validate: zodForm(loginSchema),
  });

  const handleSubmit: SubmitHandler<LoginForm> = async (values) => {
    await login(values);

    console.log("~ submitted", values);

    queryClient.invalidateQueries({ queryKey: ["todos"] });
    navigate("/", { replace: true });
  };

  let submitButton: HTMLButtonElement | undefined;

  createEffect(() => {
    const ariaDisabled =
      getValues(form).username === undefined ||
      getValues(form).username === "" ||
      getValues(form).password === undefined ||
      getValues(form).password === "" ||
      form.submitting;

    if (submitButton) {
      submitButton.ariaDisabled = ariaDisabled ? "true" : "false";
    }
  });

  return (
    <div class="w-full max-w-sm">
      <Form onSubmit={handleSubmit} class="space-y-2">
        <Field name="username">
          {(field, props) => (
            <Input
              {...props}
              id={field.name}
              value={field.value}
              error={!!field.error}
              type="text"
              placeholder="Username or email address"
              autofocus
              required
            />
          )}
        </Field>
        <Field name="password">
          {(field, props) => (
            <InputPassword
              {...props}
              id={field.name}
              value={field.value}
              error={!!field.error}
              placeholder="Password"
              required
            />
          )}
        </Field>
        <Button
          ref={submitButton}
          type="submit"
          aria-disabled="true"
          class="!mt-8 w-full rounded-xl py-7 text-base shadow-none aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
          onClick={(e) => {
            if (e.currentTarget.ariaDisabled === "true") {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }}
        >
          <Switch>
            <Match when={form.submitting}>
              <Loading03AnimatedIcon
                stroke-width={3}
                width={24}
                height={24}
                class="text-secondary"
              />
            </Match>
            <Match when={!form.submitting}>Log in</Match>
          </Switch>
        </Button>
      </Form>
      <Show when={form.response.message}>
        <span class="!mt-5 inline-block w-full text-sm font-medium text-destructive dark:text-red-400">
          ⓧ {form.response.message}
        </span>
      </Show>
      <Show when={Object.keys(getErrors(form)).length !== 0}>
        <div class="!mt-5 flex flex-col text-destructive dark:text-red-400">
          <Show when={getErrors(form).username}>
            <span class="text-pretty text-sm font-medium">
              ⓧ {getErrors(form).username}
            </span>
          </Show>
          <Show when={getErrors(form).password}>
            <span class="text-pretty text-sm font-medium">
              ⓧ {getErrors(form).password}
            </span>
          </Show>
        </div>
      </Show>
    </div>
  );
}
