import { useCountdown } from "@/hooks/countdown";
import { get } from "@/lib/api/client";
import { safeTry } from "@/lib/safe-try";
import { useMutation } from "@tanstack/react-query";

export function OTPResendButton() {
  const mutation = useMutation({
    mutationFn: async () => {
      const { error, result } = await safeTry(
        get<{ sended: boolean; timeLeft: number }>("/auth/verify-account/resend"),
      );

      if (error) throw new Error("Server error");
      if (!result.ok) throw new Error("Something went wrong");

      return result.data;
    },
  });

  return (
    <>
      <p className="select-none text-center">
        You didn&apos;t receive an email?{" "}
        <span
          className="cursor-pointer whitespace-nowrap text-blue-500 underline-offset-2 hover:underline"
          onClick={() => mutation.mutate()}
        >
          Resend code.
        </span>
      </p>
      {mutation.isPending && <p className="text-center font-bold">Sending...</p>}
      {mutation.isSuccess && mutation.data.sended && <p className="text-center font-bold">Sended.</p>}
      {mutation.isSuccess && !mutation.data.sended && <ResendCountdown waitTime={mutation.data.timeLeft} />}
      {mutation.isError && (
        <p className="text-center text-destructive dark:text-red-400">Something went wrong. Try again.</p>
      )}
    </>
  );
}

export function ResendCountdown({ waitTime }: { waitTime: number }) {
  const { timeLeft } = useCountdown(waitTime);

  return (
    <>{timeLeft > 0 && <p className="text-center text-destructive dark:text-red-400">Wait {timeLeft}s to resend.</p>}</>
  );
}
