import { JSX, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { Cancel01Icon } from "./hugeicons";

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input(props: InputProps) {
  return (
    <div class="flex w-full rounded-xl bg-muted has-[:focus]:ring-1 has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
      <input
        {...props}
        class={twMerge(
          "h-14 flex-grow bg-transparent p-5 text-base leading-none focus:outline-none",
          props.class,
        )}
      />
      <Show when={props.error === true}>
        <div class="flex min-w-10 items-center text-destructive dark:text-red-400">
          <Cancel01Icon stroke-width={2} width={24} height={24} />
        </div>
      </Show>
    </div>
  );
}
