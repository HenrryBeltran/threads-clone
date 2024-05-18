import { useCountdown } from "@/hooks/countdown";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useMutation } from "@tanstack/react-query";

export function OTPResendButton() {
  const mutation = useMutation({
    mutationFn: async () => {
      const { error, result } = await safeTry(api.auth["verify-account"].resend.$get());

      if (error) throw new Error("Server error");
      if (!result.ok) throw new Error("Something went wrong");

      const { result: data } = await safeTry(result.json());

      if (!data) throw new Error("JSON parse fail.");

      return data;
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
      {mutation.isSuccess && mutation.data.sended && (
        <p className="text-center font-bold">Sended.</p>
      )}
      {mutation.isSuccess && !mutation.data.sended && (
        <ResendCountdown waitTime={mutation.data.timeLeft} />
      )}
      {mutation.isError && (
        <p className="text-center text-destructive dark:text-red-400">
          Something went wrong. Try again.
        </p>
      )}
    </>
  );
}

export function ResendCountdown({ waitTime }: { waitTime: number }) {
  const { timeLeft } = useCountdown(waitTime);

  return (
    <>
      {timeLeft > 0 && (
        <p className="text-center text-destructive dark:text-red-400">
          Wait {timeLeft}s to resend.
        </p>
      )}
    </>
  );
}
