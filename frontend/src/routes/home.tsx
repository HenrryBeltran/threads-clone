import { api } from "@/lib/api";
import { createQuery } from "@tanstack/solid-query";
import { For, Suspense } from "solid-js";

async function getUsers() {
  const res = await api.users.$get();

  if (!res.ok) {
    throw new Error("Server error");
  }

  return res.json();
}

export default function Home() {
  const query = createQuery(() => ({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: Infinity,
  }));

  return (
    <div class="flex min-h-svh items-center justify-center">
      <div class="mx-6 w-full max-w-sm space-y-6 rounded-xl border border-muted-foreground/20 p-6 shadow-lg">
        <Suspense fallback={<p>Loading...</p>}>
          <For each={query.data}>
            {(user) => (
              <div class="flex items-center gap-5">
                <div class="h-9 w-9 rounded-full bg-muted-foreground/20" />
                <div class="flex flex-col">
                  <span class="font-bold">{user.username}</span>
                  <span class="text-muted-foreground">{user.name}</span>
                </div>
              </div>
            )}
          </For>
        </Suspense>
      </div>
    </div>
  );
}
