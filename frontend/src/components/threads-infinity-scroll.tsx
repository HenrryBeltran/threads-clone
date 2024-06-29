import { api } from "@/lib/api";
import { randomInt } from "@/lib/utils";
import { safeTry } from "@server/lib/safe-try";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { BubbleChatIconModded, FavouriteIcon, Loading03AnimatedIcon, SentIcon } from "./icons/hugeicons";
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

  console.log("~ query result", query.data);

  return (
    <div className="mx-auto flex min-h-svh max-w-[620px] flex-col space-y-2 divide-y divide-muted-foreground/30 px-6 pb-24">
      {query.isLoading && <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto" />}
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
                <p>{thread.text}</p>
              </div>
              {thread.resources && (
                <>
                  {thread.resources.length === 1 && (
                    <SinglePhoto images={thread.resources} containerWidth={containerRef.current?.clientWidth!} />
                  )}
                  {thread.resources.length === 2 && (
                    <DoublePhoto images={thread.resources} containerWidth={containerRef.current?.clientWidth!} />
                  )}
                  {thread.resources.length >= 3 && (
                    <AlbumCarousel images={thread.resources} containerWidth={containerRef.current?.clientWidth!} />
                  )}
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
  containerWidth: number;
  images: string[];
};

/// TODO: Refine the display image size
export function AlbumCarousel({ containerWidth, images }: AlbumProps) {
  const pointX = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ height: `${carouselRef.current?.clientHeight!}px` }} className="h-56 overflow-hidden">
      <div
        style={{ height: `${carouselRef.current?.clientHeight! + 16}px` }}
        className="relative h-60 overflow-x-scroll"
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
        <div ref={carouselRef} className="absolute left-0 top-0 flex w-max gap-4 active:cursor-grabbing">
          {images?.map((id, idx) => (
            <figure key={idx}>
              <img
                src={`https://res.cloudinary.com/dglhgvcep/image/upload/w_256/dpr_2.0/v1716403676/${id}.jpg`}
                // width={image.}
                // height={image.size.height * 0.4}
                alt="Profile picture"
                draggable="false"
                style={
                  {
                    // width: image.size.width > image.size.height ? `calc(${containerWidth / 2}px - 8px)` : "9rem",
                  }
                }
                className="pointer-events-none h-52 select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoublePhoto({ containerWidth, images }: AlbumProps) {
  return (
    <div className="ml-3">
      <div className="grid w-max grid-cols-2 grid-rows-1 gap-4 active:cursor-grabbing">
        {images?.map((id, idx) => (
          <figure key={idx} className="flex">
            <img
              src={`https://res.cloudinary.com/dglhgvcep/image/upload/w_256/dpr_2.0/v1716403676/${id}.jpg`}
              // width={image.size.width * 0.4}
              // height={image.size.height * 0.4}
              alt="Profile picture"
              draggable="false"
              style={{
                // -8 is for gap, -22 is for the left profile picture, -6 is for the container padding
                width: `${containerWidth * 0.5 - 8 - 22 - 6}px`,
              }}
              className="pointer-events-none h-full max-h-96 select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function SinglePhoto({ images }: AlbumProps) {
  const image = images[0];
  // const imageWidth = image.size.width * 0.15;
  // const imageHeight = image.size.height * 0.15;
  // const resizeImageWidth =
  //   (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageWidth : image.size.width * 0.3;
  // const resizeImageHeight =
  //   (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageHeight : image.size.height * 0.3;
  // const width = image.size.width > image.size.height ? "100%" : `${resizeImageWidth}px`;
  // const height = image.size.width > image.size.height ? "100%" : `${resizeImageHeight}px`;

  return (
    <div className="flex">
      <figure>
        <img
          src={`https://res.cloudinary.com/dglhgvcep/image/upload/w_1024/dpr_2.0/v1716403676/${image}.jpg`}
          // width={resizeImageWidth}
          // height={resizeImageHeight}
          alt="Profile picture"
          draggable="false"
          // style={{ width, height }}
          className="pointer-events-none max-h-[520px] max-w-full select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
        />
      </figure>
    </div>
  );
}
