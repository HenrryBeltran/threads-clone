import { api } from "@/lib/api";
import { randomInt } from "@/lib/utils";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { BubbleChatIconModded, FavouriteIcon, SentIcon } from "./icons/hugeicons";
import { ThreadsSkeleton } from "./threads-skeleton";
import { Button } from "./ui/button";
import { UserImage } from "./user-image";

async function fetcher() {
  const res = await safeTry(api.threads.posts.$get());

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

export function ThreadsInfinityScroll() {
  const query = useQuery({ queryKey: ["threads"], queryFn: fetcher });
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mx-auto flex min-h-svh max-w-[620px] flex-col space-y-2 divide-y divide-muted-foreground/30 px-6 pb-24">
      {query.isLoading && <ThreadsSkeleton />}
      {query.data &&
        query.data.map((thread, i) => (
          <div key={i} className="flex gap-3 pt-4">
            <Link to={`/@${thread.author.username}`} className="min-h-11 min-w-11">
              <UserImage
                username={thread.author.username}
                profilePictureId={thread.author.profilePictureId}
                width={48}
                height={48}
                fetchPriority="high"
                loading="lazy"
                className="h-11 w-11"
              />
            </Link>
            <div ref={containerRef} className="flex-grow space-y-3">
              <div>
                <Link to={`/@${thread.author.username}`} className="font-semibold">
                  {thread.author.username}
                </Link>
                <p className="whitespace-pre-wrap">{thread.text}</p>
              </div>
              {thread.resources && (
                <>
                  {thread.resources.length === 1 && <SinglePhoto images={thread.resources} />}
                  {thread.resources.length === 2 && <DoublePhoto images={thread.resources} />}
                  {thread.resources.length >= 3 && <AlbumCarousel images={thread.resources} />}
                </>
              )}
              <div className="!mt-1.5 flex -translate-x-2 gap-2">
                <Button variant="ghost" className="h-9 space-x-1 rounded-full px-2 text-foreground/60">
                  <FavouriteIcon width={20} height={20} strokeWidth={1.5} />
                  {Math.random() > 0.25 && <span>{randomInt(1, 50)}</span>}
                </Button>
                <Button variant="ghost" className="h-9 space-x-1 rounded-full px-2 text-foreground/60">
                  <BubbleChatIconModded width={20} height={20} strokeWidth={1.5} />
                  {Math.random() > 0.25 && <span>{randomInt(1, 50)}</span>}
                </Button>
                <Button variant="ghost" className="h-9 space-x-1 rounded-full px-2 text-foreground/60">
                  <SentIcon width={20} height={20} strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

type AlbumProps = {
  images: string[];
};

export function AlbumCarousel({ images }: AlbumProps) {
  const pointX = useRef<number | null>(null);

  return (
    <div className="h-60 w-[calc(100%+56px)] -translate-x-14 overflow-hidden">
      <div
        className="relative h-64 overflow-x-scroll"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;

          pointX.current = x;
        }}
        onPointerMove={(e) => {
          if (pointX.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const delta = pointX.current - x;

            e.currentTarget.scrollLeft += delta;
            pointX.current = x;
          }
        }}
        onPointerUp={() => {
          if (pointX.current) {
            pointX.current = null;
          }
        }}
        onPointerLeave={() => (pointX.current = null)}
      >
        <div className="absolute left-0 top-0 flex w-max gap-4 pl-14 active:cursor-grabbing">
          {images?.map((id, idx) => (
            <figure key={idx}>
              <img
                src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_240/dpr_2.0/v1716403676/${id}.jpg`}
                width={192}
                height={240}
                alt="Profile picture"
                draggable="false"
                className="pointer-events-none h-60 select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoublePhoto({ images }: AlbumProps) {
  return (
    <div className="grid w-full grid-cols-2 grid-rows-1 gap-4 active:cursor-grabbing">
      {images?.map((id, idx) => (
        <figure key={idx} className="w-full">
          <img
            src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_384/dpr_2.0/v1716403676/${id}.jpg`}
            width={250}
            height={384}
            alt="Profile picture"
            draggable="false"
            className="pointer-events-none h-full max-h-96 w-full select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
          />
        </figure>
      ))}
    </div>
  );
}

export function SinglePhoto({ images }: AlbumProps) {
  const image = images[0];

  return (
    <div className="flex">
      <figure>
        <img
          src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_520/dpr_2.0/v1716403676/${image}.jpg`}
          width={516}
          height={520}
          alt="Profile picture"
          draggable="false"
          className="pointer-events-none max-h-[520px] w-fit max-w-full select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
        />
      </figure>
    </div>
  );
}
