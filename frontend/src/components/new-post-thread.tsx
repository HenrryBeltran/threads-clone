import { useQuery } from "@tanstack/react-query";
import { Loading03AnimatedIcon } from "./icons/hugeicons";
import { Thread } from "./thread";
import { Posts } from "./threads-infinite-scroll";
import { useEffect } from "react";

export function NewPostThread() {
  const query = useQuery<Posts>({
    queryKey: ["posting", "threads"],
    initialData: [],
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    console.log("~ query data", query.data);
  }, [query.data]);

  if (query.data.length === 0) {
    return <></>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[620px] flex-col">
      {(query.isLoading || query.isRefetching) && (
        <div className="py-3">
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
        </div>
      )}
      <div className="cool-border mt-4 flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 rounded-lg bg-background px-6 py-3">
        {query.data.map((thread, i) => (
          <Thread key={i} {...thread} />
        ))}
      </div>
    </div>
  );
}
