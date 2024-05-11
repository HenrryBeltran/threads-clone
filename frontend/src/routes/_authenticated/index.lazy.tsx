import { Button } from "@/components/ui/button";
import { AuthUser } from "@/lib/api";
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

export const Route = createLazyFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<AuthUser>(["auth", "user"]);

  return (
    <>
      {data && (
        <div className="mx-auto mt-[74px] max-w-[620px] px-6">
          <div className="flex items-center justify-between border-b border-muted-foreground/20 py-4">
            <Link to={`/@${data.user.username}`}>
              <img
                src={data.user.profilePictureUrl!}
                alt={`${data.user.username} profile picture`}
                className="h-10 w-10 rounded-full border-[0.5px] border-muted-foreground/30"
              />
            </Link>
            <button
              className="flex-grow self-stretch px-3 text-start text-muted-foreground/90"
              onClick={() => alert("In the future you can post here. 👷🏽‍")}
            >
              Start a thread...
            </button>
            <span className="block cursor-not-allowed">
              <Button disabled className="max-h-12 rounded-full disabled:opacity-40">
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
