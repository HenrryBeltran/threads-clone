import { JSX, Match, Show, Switch, createSignal } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Cancel01Icon, ViewIcon, ViewOffIcon } from "./hugeicons";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function InputPassword(props: InputProps) {
  const [showPassword, setShowPassword] = createSignal(false);

  return (
    <div class="flex w-full rounded-xl bg-muted has-[:focus]:ring-1 has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
      <input
        {...props}
        type={showPassword() ? "text" : "password"}
        class={twMerge(
          "h-14 flex-grow bg-transparent p-5 text-base leading-none focus:outline-none",
          props.class,
        )}
      />
      <span
        onClick={() => setShowPassword((show) => !show)}
        class="mr-2 flex min-w-12 cursor-pointer select-none items-center justify-center text-foreground"
      >
        <Switch>
          <Match when={showPassword()}>
            <ViewIcon stroke-width={2} width={20} height={20} />
          </Match>
          <Match when={!showPassword()}>
            <ViewOffIcon stroke-width={2} width={20} height={20} />
          </Match>
        </Switch>
      </span>
      <Show when={props.error === true}>
        <div class="flex min-w-10 items-center text-destructive dark:text-red-400">
          <Cancel01Icon stroke-width={2} width={24} height={24} />
        </div>
      </Show>
    </div>
  );
}
