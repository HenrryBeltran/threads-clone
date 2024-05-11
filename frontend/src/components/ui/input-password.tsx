import { Cancel01Icon, ViewIcon, ViewOffIcon } from "@/components/icons/hugeicons";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const InputPassword = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-full rounded-xl bg-muted has-[:focus]:ring-1 has-[:focus]:ring-muted-foreground/60 dark:bg-muted/75">
      <input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        className={cn(
          "h-14 flex-grow bg-transparent p-5 text-base leading-none focus:outline-none",
          props.className,
        )}
      />
      <span
        onClick={() => setShowPassword((show) => !show)}
        className="mr-2 flex min-w-12 cursor-pointer select-none items-center justify-center text-foreground"
      >
        {showPassword ? (
          <ViewIcon strokeWidth={2} width={20} height={20} />
        ) : (
          <ViewOffIcon strokeWidth={2} width={20} height={20} />
        )}
      </span>
      {props.error !== undefined && (
        <div className="flex min-w-10 items-center text-destructive dark:text-red-400">
          <Cancel01Icon strokeWidth={2} width={24} height={24} />
        </div>
      )}
    </div>
  );
});
