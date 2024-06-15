import { Button } from "@/components/ui/button";
import { UserImage } from "@/components/user-image";
import { UserAccount } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

const links = [
  "https://media1.giphy.com/media/xoHntNXFYkfzGAftEv/200.webp",
  "https://media0.giphy.com/media/zCpYQh5YVhdI1rVYpE/200.webp",
  "https://media0.giphy.com/media/7QdUZvxWxxDTH9vb0u/200.webp",
  "https://media4.giphy.com/media/1nfwnYf5Uz7hzhYof8/200.webp",
  "https://media3.giphy.com/media/H2u46cKU3VaXht6Iv9/200.webp",
  "https://media3.giphy.com/media/4pMX5rJ4PYAEM/200.webp",
  "https://media0.giphy.com/media/1qZ7Ny4dYqhxwftGvG/200.webp",
  "https://media1.giphy.com/media/bCcxY1ADkAqfS/200.webp",
];

export const Route = createLazyFileRoute("/_main-layout/")({
  component: Index,
});

function Index() {
  const showCreateThread = useCreateThreadStore((state) => state.show);
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount | null>(["user", "account"]);

  return (
    <>
      <div className="h-[74px] w-full"></div>
      {user && (
        <div className="mx-auto max-w-[620px] px-6">
          <div className="flex items-center justify-between border-b border-muted-foreground/20 py-4">
            <Link to={`/@${user.username}`}>
              <UserImage
                username={user.username}
                profilePictureId={user.profilePictureId}
                width={48}
                height={48}
                fetchPriority="high"
                loading="lazy"
                className="h-11 w-11"
              />
            </Link>
            <button
              className="flex-grow cursor-text self-stretch px-3 text-start text-muted-foreground/90"
              onClick={() => showCreateThread()}
            >
              Start a thread...
            </button>
            <span className="block cursor-not-allowed">
              <Button
                variant="outline"
                className="rounded-xl border-muted-foreground/30 font-semibold transition-transform duration-200 active:scale-95"
                onClick={() => showCreateThread()}
              >
                Post
              </Button>
            </span>
          </div>
        </div>
      )}
      <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 pb-16 pt-8">
        {links.map((link, i) => (
          <img
            key={i.toString()}
            src={link}
            width={320}
            height={320}
            className="mx-6 rounded-lg border-[0.5px] border-muted-foreground/30"
            loading="lazy"
          />
        ))}
      </div>
    </>
  );
}
