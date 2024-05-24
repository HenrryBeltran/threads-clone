import type { HonoApiRoutes } from "@server/app";
import { safeTry } from "@server/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { hc, type InferResponseType } from "hono/client";

const client = hc<HonoApiRoutes>("/");

export const api = client.api;
export type UserAccount = InferResponseType<typeof api.account.user.$get>;

export async function getUserAccount(): Promise<UserAccount | null> {
  const res = await safeTry(api.account.user.$get());

  if (res.error) {
    console.error(res.error.message);
    return null;
  }

  if (!res.result.ok) {
    console.error("~ Server error");
    return null;
  }

  const data = await safeTry(res.result.json());

  if (data.error) {
    return null;
  }

  return data.result;
}

export const userAccountQueryOptions = queryOptions({
  queryKey: ["user", "account"],
  queryFn: getUserAccount,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
