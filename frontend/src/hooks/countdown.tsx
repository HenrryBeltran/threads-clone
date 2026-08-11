import { useEffect, useState } from "react";

export function useCountdown(seconds: number) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
    const intervalId = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  return { timeLeft };
}
