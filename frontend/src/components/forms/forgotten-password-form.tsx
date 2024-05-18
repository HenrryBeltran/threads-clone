import { Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@server/common/schemas";
import { safeTry } from "@server/lib/safe-try";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function ForgottenPasswordForm() {
  const form = useForm<z.infer<typeof emailSchema>>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(emailSchema),
  });

  async function onSubmit(data: z.infer<typeof emailSchema>) {
    const res = await safeTry(api.auth["forgotten-password"].$post({ json: data }));

    if (res.error) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    if (!res.result.ok) {
      const { message, path } = (await res.result.json()) as { message?: string; path?: string };

      form.setError((path as "email" | "root") ?? "root", { message });
      return;
    }

    const { result } = await safeTry(res.result.json());

    if (!result) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    toast(result.message, {
      position: "bottom-center",
      classNames: {
        title: "text-base text-center",
        toast: "rounded-xl dark:!bg-neutral-900",
      },
    });
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="mx-auto max-w-sm space-y-2 pb-16">
          <Input
            {...form.register("email")}
            error={form.formState.errors.email?.message}
            type="email"
            placeholder="Email address"
            className="flex-grow border-none bg-transparent px-4 py-7 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
            autoFocus
          />
          <Button
            type="submit"
            aria-disabled={form.watch("email") === "" || form.formState.isSubmitting}
            className="!mt-8 w-full rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
            onClick={(e) => {
              if (e.currentTarget.ariaDisabled === "true") {
                e.preventDefault();
                return;
              }
            }}
          >
            {form.formState.isSubmitting ? (
              <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-secondary" />
            ) : (
              "Send"
            )}
          </Button>
          {Object.values(form.formState.errors).find((value) => value.message !== undefined) && (
            <div className="!mt-5 flex flex-col text-destructive dark:text-red-400">
              {form.formState.errors.root && (
                <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.root.message}</span>
              )}
              {form.formState.errors.email && (
                <span className="text-pretty text-sm font-medium">ⓧ {form.formState.errors.email.message}</span>
              )}
            </div>
          )}
          <Link to="/login" className="!mt-5 inline-block w-full text-center text-[.9375rem] text-muted-foreground">
            Return to the login page
          </Link>
        </div>
      </form>
    </>
  );
}
