import { type ApiRoutes } from "@server/app";
import { safeTry } from "@server/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { hc, type InferResponseType } from "hono/client";

const client = hc<ApiRoutes>("/");

export const api = client.api;

export async function getAuthUser() {
  const res = await safeTry(api.auth.user.$get());

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (!res.result.ok) {
    throw new Error("Server error");
  }

  return res.result.json();
}

export type AuthUser = InferResponseType<typeof api.auth.user.$get>;

export const userAuthQueryOptions = queryOptions({
  queryKey: ["auth", "user"],
  queryFn: getAuthUser,
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: Infinity,
});
