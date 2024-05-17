// import { safeTry } from "@server/lib/safe-try";
import { useCountdown } from "@/hooks/countdown";
// import { useState } from "react";
// import { resendVerificationAction } from "./resend-verification-action";

/// TODO: missing the api and queries
export function OTPResendButton() {
  // const [timeLeft, setTimeLeft] = useState<number>();
  // const [activeResend, setActiveResend] = useState(false);
  // const [cooldownWarning, setCooldownWarning] = useState(false);
  // const [sended, setSended] = useState(false);

  return (
    <>
      <p className="select-none text-center">
        You didn&apos;t receive an email?{" "}
        <span
          className="cursor-pointer text-blue-500 underline-offset-2 hover:underline"
          onClick={async () => {
            // setActiveResend(true);
            // setSended(false);
            // const { error, result } = await safeTry(resendVerificationAction());
            // if (error) {
            //   return;
            // }
            // setTimeLeft(result.timeLeft);
            // setActiveResend(false);
            // if (result.sended) {
            //   setSended(true);
            //   setCooldownWarning(false);
            // } else {
            //   setCooldownWarning(true);
            // }
          }}
        >
          Resend code.
        </span>
      </p>
      {/* {activeResend && <p className="text-center font-bold">Sending...</p>} */}
      {/* {sended && <p className="text-center font-bold">Sended.</p>} */}
      {/* {timeLeft && cooldownWarning && !activeResend && ( */}
      {/*   <ResendCountdown waitTime={timeLeft} /> */}
      {/* )} */}
    </>
  );
}

type Props = {
  waitTime: number;
};

export function ResendCountdown({ waitTime }: Props) {
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
