import { useEffect, useState } from "react";

export function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((t: number) => t - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return { timeLeft };
}
