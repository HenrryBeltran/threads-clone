import { safeTry } from "@/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { get } from "./client";

async function getVerificationToken() {
  const res = await safeTry(get<{ token: string }>("/auth/verify-account/token"));

  if (res.error) {
    throw new Error("Server error");
  }

  if (!res.result.ok) {
    throw new Error("Something went wrong");
  }

  return res.result.data;
}

export const accountVerificationQueryOptions = queryOptions({
  queryKey: ["account", "verification"],
  queryFn: getVerificationToken,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
