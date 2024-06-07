import { Cancel01Icon } from "@/components/icons/hugeicons";
import { Link } from "@tanstack/react-router";
import { UserImage } from "./user-image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { safeTry } from "@server/lib/safe-try";
import { api } from "@/lib/api";

type Result = {
  id: string;
  userSearch: {
    username: string;
    id: string;
    profilePictureId: string | null;
    name: string;
  };
};

type Props = {
  result: Result[];
};

export function SearchHistory({ result }: Props) {
  const queryClient = useQueryClient();
  const deleteOneRow = useMutation({
    mutationKey: ["user", "history"],
    mutationFn: async (rowId: string) => {
      const res = await safeTry(api.search.history[":rowId"].$delete({ param: { rowId } }));

      if (res.error) throw new Error("Something went wrong");
      if (!res.result.ok) throw new Error("Something went wrong");

      const { result: data } = await safeTry(res.result.json());

      if (!data) return null;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "history"] }),
  });
  const clearHistory = useMutation({
    mutationKey: ["user", "history"],
    mutationFn: async () => {
      const res = await safeTry(api.search.history.$delete());

      if (res.error) throw new Error("Something went wrong");
      if (!res.result.ok) throw new Error("Something went wrong");

      const { result: data } = await safeTry(res.result.json());

      if (!data) return null;

      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "history"] }),
  });

  return (
    <>
      {result.length > 0 && (
        <div className="flex items-end justify-between">
          <span className="text-lg font-bold">Recent</span>
          <button
            type="button"
            className="text-blue-500 underline-offset-2 transition-colors hover:text-blue-600 hover:underline dark:hover:text-blue-400"
            onClick={() => clearHistory.mutate()}
          >
            Clear all
          </button>
        </div>
      )}
      <div className="divide-y divide-muted-foreground/15">
        {result.map((row) => (
          <div
            key={row.userSearch.username}
            data-deleting={deleteOneRow.isPending || clearHistory.isPending}
            className="flex items-center gap-5 transition-opacity data-[deleting=true]:opacity-30"
          >
            <Link to={`/@${row.userSearch.username}`} className="flex h-16 cursor-pointer items-center">
              <UserImage
                profilePictureId={row.userSearch.profilePictureId}
                username={row.userSearch.username}
                width={36}
                height={36}
                fetchPriority="high"
                loading="lazy"
                className="h-9 w-9 border border-muted-foreground/15"
              />
            </Link>
            <div className="flex flex-grow items-center">
              <Link
                to={`/@${row.userSearch.username}`}
                className="flex flex-grow cursor-pointer flex-col justify-center space-y-1 py-4"
              >
                <span className="font-medium leading-none underline-offset-2 hover:underline">
                  {row.userSearch.username}
                </span>
                <span className="font-light leading-none text-muted-foreground">{row.userSearch.name}</span>
              </Link>
              <button type="button" onClick={() => deleteOneRow.mutate(row.id)}>
                <Cancel01Icon
                  strokeWidth={2}
                  width={20}
                  height={20}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
