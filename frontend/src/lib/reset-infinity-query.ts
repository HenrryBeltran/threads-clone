import { PostsPages } from "@/components/threads-infinite-scroll";
import { QueryClient } from "@tanstack/react-query";

export function resetInfiniteQueryPagination(queryClient: QueryClient, key: string[]) {
  queryClient.setQueryData<PostsPages>(key, (oldData) => {
    if (!oldData) return undefined;
    return {
      pages: [],
      pageParams: oldData.pageParams.slice(0, 1),
    };
  });
}
