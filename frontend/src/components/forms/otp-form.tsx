import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { inputOTPSchema } from "@server/common/schemas/auth";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Loading03AnimatedIcon } from "../icons/hugeicons";
import { OTPResendButton } from "../otp-resend-button";
import { Button } from "../ui/button";
import { FormField } from "../ui/form";

type OTPForm = z.infer<typeof inputOTPSchema>;

export function OTPForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<OTPForm>({
    defaultValues: { pin: "" },
    resolver: zodResolver(inputOTPSchema),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await safeTry(api.auth.logout.$post());

      if (error) {
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "account"] });
      navigate({ to: "/login" });
    },
  });

  const onSubmit: SubmitHandler<OTPForm> = async (value) => {
    const res = await safeTry(api.auth["verify-account"].$post({ json: value }));

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      const { message, path } = (await res.result.json()) as {
        message?: string;
        path?: string;
      };

      form.setError((path as "pin" | "root") ?? "root", { message });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["user", "account"] });

    /// TODO: navigate to 'complete account' when the page is ready to update this.
    navigate({ to: "/", replace: true });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-12 pb-16">
      <FormField
        control={form.control}
        name="pin"
        render={({ field }) => (
          <InputOTP {...field} maxLength={6}>
            <InputOTPGroup className="mx-auto font-mono">
              <InputOTPSlot
                index={0}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
              <InputOTPSlot
                index={1}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
              <InputOTPSlot
                index={2}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
              <InputOTPSlot
                index={3}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
              <InputOTPSlot
                index={4}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
              <InputOTPSlot
                index={5}
                className="h-12 w-12 bg-muted/70 text-lg shadow-none ring-foreground/40 dark:bg-muted/55"
              />
            </InputOTPGroup>
          </InputOTP>
        )}
      />
      {form.formState.errors.root && (
        <p className="!mt-4 text-center text-destructive dark:text-red-400">
          {form.formState.errors.root.message}
        </p>
      )}
      {form.formState.errors.pin && (
        <p className="!mt-4 text-center text-destructive dark:text-red-400">
          {form.formState.errors.pin.message}
        </p>
      )}
      <Button
        type="submit"
        aria-disabled={form.watch("pin").length !== 6 || form.formState.isSubmitting}
        className="mx-auto mt-8 flex w-44 rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
      >
        {form.formState.isSubmitting ? (
          <Loading03AnimatedIcon
            strokeWidth={3}
            width={24}
            height={24}
            className="text-secondary"
          />
        ) : (
          "Verify"
        )}
      </Button>
      <div>
        <OTPResendButton />
      </div>
      <div className="flex w-full select-none flex-col items-center justify-center gap-3">
        <button
          type="button"
          className="flex items-center justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground"
          onClick={() => mutation.mutate()}
        >
          Log out and to return to login
        </button>
        <Loading03AnimatedIcon
          aria-hidden={!mutation.isPending}
          className="text-foreground aria-hidden:invisible"
          strokeWidth={3}
          width={20}
          height={20}
        />
      </div>
    </form>
  );
}
