import { useIsMutating, useQuery } from "@tanstack/react-query";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { Thread } from "./thread";
import { Posts } from "./threads-infinite-scroll";

export function NewPostThread() {
  const query = useQuery<Posts>({
    queryKey: ["posting", "threads"],
    initialData: [],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const isMutating = useIsMutating({ mutationKey: ["posting", "threads"] });

  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-col px-6 sm:px-0">
      {isMutating !== 0 && (
        <div className="py-3">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
        </div>
      )}
      {query.data.length > 0 && query.isSuccess && (
        <div className="cool-border mt-4 flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 rounded-lg bg-background px-6 py-3">
          {query.data.map((thread, i) => (
            <Thread key={i} {...thread} />
          ))}
        </div>
      )}
    </div>
  );
}
