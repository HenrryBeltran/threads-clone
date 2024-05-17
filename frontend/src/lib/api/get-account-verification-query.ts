import { safeTry } from "@server/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { api } from ".";

async function getVerifcationToken() {
  const res = await safeTry(api.auth["verify-account"].token.$get());

  if (res.error) {
    throw new Error("Server error");
  }

  if (!res.result.ok) {
    throw new Error("Something went wrong");
  }

  return res.result.json();
}

export const accountVerificationQueryOptions = queryOptions({
  queryKey: ["account", "verification"],
  queryFn: getVerifcationToken,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
