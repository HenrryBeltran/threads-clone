import { Cancel01Icon } from "@/components/icons/hugeicons";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <div className="flex w-full rounded-xl bg-muted has-[:focus]:ring-1 has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
      <input
        {...props}
        ref={ref}
        className={cn(
          "h-14 flex-grow bg-transparent p-5 text-base leading-none focus:outline-none",
          props.className,
        )}
      />
      {props.error !== undefined && (
        <div className="flex min-w-10 items-center text-destructive dark:text-red-400">
          <Cancel01Icon strokeWidth={2} width={24} height={24} />
        </div>
      )}
    </div>
  );
});
