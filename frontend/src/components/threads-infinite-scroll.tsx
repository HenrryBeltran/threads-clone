import { api } from "@/lib/api";
import { randomInt } from "@/lib/utils";
import { DialogClose } from "@radix-ui/react-dialog";
import { QueryFunction, useInfiniteQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { InferResponseType } from "hono/client";
import { Fragment, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { BubbleChatIconModded, Cancel01Icon, FavouriteIcon, Loading03AnimatedIcon, SentIcon } from "./icons/hugeicons";
import { Paragraph } from "./paragraph";
import { ThreadsSkeleton } from "./threads-skeleton";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { UserImage } from "./user-image";

export type Posts = InferResponseType<typeof api.threads.posts.$get>;

type Props = {
  queryKey: string[];
  queryFn: QueryFunction<Posts, string[], number> | undefined;
  noMorePostsMessage?: string;
};

export function ThreadsInfiniteScroll({ queryKey, queryFn, noMorePostsMessage }: Props) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 6;
    },
    getPreviousPageParam: (_lastPage, _allPages, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 6;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      query.fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="mx-auto w-full flex min-h-svh max-w-[620px] flex-col pb-24">
      <div className="flex w-full flex-col space-y-2 divide-y divide-muted-foreground/30 px-6">
        {query.isLoading && <ThreadsSkeleton />}
        {query.isRefetching === false &&
          query.data &&
          query.data.pages.map((group, i) => (
            <Fragment key={i}>
              {group.map((thread) => (
                <Thread key={thread.postId} {...thread} />
              ))}
            </Fragment>
          ))}
        {(query.isFetchingNextPage || query.isRefetching) && (
          <div className="py-3">
            <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="mx-auto h-6 w-6" />
          </div>
        )}
        {query.hasNextPage === false && noMorePostsMessage && query.isFetching === false && (
          <div className="flex justify-center py-6">
            <p className="text-muted-foreground">{noMorePostsMessage}</p>
          </div>
        )}
      </div>
      <div ref={ref} className="h-px w-full bg-transparent" />
    </div>
  );
}

type ThreadProps = {
  postId: string;
  author: {
    name: string;
    username: string;
    profilePictureId: string | null;
  };
  text: string;
  resources: string[] | null;
};

function Thread({ postId, author, text, resources }: ThreadProps) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 pt-4">
      <div className="flex flex-col">
        <Link to={`/@${author.username}`} className="min-h-11 min-w-11">
          <UserImage
            username={author.username}
            profilePictureId={author.profilePictureId}
            width={48}
            height={48}
            fetchPriority="high"
            loading="lazy"
            className="h-11 w-11"
          />
        </Link>
        <div
          onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
          className="flex-grow cursor-pointer"
        />
      </div>
      <div className="flex-grow space-y-3">
        <div>
          <div className="flex">
            <Link to={`/@${author.username}`} className="font-semibold">
              {author.username}
            </Link>
            <div
              onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
              className="flex-grow cursor-pointer"
            />
          </div>
          <Paragraph text={text} author={author.username} postId={postId} />
        </div>
        {resources && (
          <>
            {resources.length === 1 && <SinglePhoto images={resources} />}
            {resources.length === 2 && <DoublePhoto images={resources} />}
            {resources.length >= 3 && <AlbumCarousel images={resources} />}
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
          <div
            onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
            className="flex-grow cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

type AlbumProps = {
  images: string[];
};

function AlbumCarousel({ images }: AlbumProps) {
  const pointX = useRef<number | null>(null);
  const itMoved = useRef(false);

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
            itMoved.current = true;
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
            <ImageContainer
              key={idx}
              index={idx}
              images={images}
              onClickTrigger={(e) => {
                if (itMoved.current) {
                  itMoved.current = false;
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            >
              <figure>
                <img
                  src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_240/dpr_2.0/v1716403676/${id}.jpg`}
                  width={192}
                  height={240}
                  alt="Profile picture"
                  draggable="false"
                  loading="lazy"
                  className="pointer-events-none h-60 select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
                />
              </figure>
            </ImageContainer>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoublePhoto({ images }: AlbumProps) {
  return (
    <div className="grid w-full grid-cols-2 grid-rows-1 gap-4 active:cursor-grabbing">
      {images?.map((id, idx) => (
        <ImageContainer key={idx} index={idx} images={images}>
          <figure key={idx} className="h-full w-full">
            <img
              src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_384/dpr_2.0/v1716403676/${id}.jpg`}
              width={250}
              height={384}
              alt="Profile picture"
              draggable="false"
              className="pointer-events-none h-full max-h-96 w-full select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
            />
          </figure>
        </ImageContainer>
      ))}
    </div>
  );
}

function SinglePhoto({ images }: AlbumProps) {
  const image = images[0];

  return (
    <div className="flex">
      <ImageContainer index={0} images={[image]}>
        <figure className="h-full">
          <img
            src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_520/dpr_2.0/v1716403676/${image}.jpg`}
            width={516}
            height={520}
            alt="Profile picture"
            draggable="false"
            className="pointer-events-none max-h-[520px] w-fit max-w-full select-none rounded-xl object-cover outline outline-1 -outline-offset-1 outline-neutral-50/25"
          />
        </figure>
      </ImageContainer>
    </div>
  );
}

type ContainerProps = {
  index: number;
  images: string[];
  onClickTrigger?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  children: React.ReactNode;
};

function ImageContainer({ index, images, onClickTrigger, children }: ContainerProps) {
  return (
    <Dialog>
      <DialogTrigger className="flex outline-none transition-transform active:scale-[.98]" onClick={onClickTrigger}>
        {children}
      </DialogTrigger>
      <DialogContent className="left-0 right-0 flex min-w-[100vw] translate-x-0 items-center justify-center rounded-none border-none bg-black/60 p-0 outline-none dark:bg-transparent">
        <DialogClose asChild>
          <Button
            variant="secondary"
            className="absolute left-4 top-4 z-50 h-fit w-fit rounded-full border border-neutral-700 !bg-neutral-800 p-0 text-white ring-offset-muted-foreground hover:!bg-neutral-900"
          >
            <Cancel01Icon width={28} height={28} strokeWidth={2} className="h-12 w-12 rounded-none p-3" />
          </Button>
        </DialogClose>
        <div className="flex min-h-svh max-w-[100svh] !rounded-none border-sky-200 p-0 outline-none">
          <PhotoPreview startIndex={index} images={images} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PreviewProps = {
  startIndex: number;
  images: string[];
};

function PhotoPreview({ startIndex, images }: PreviewProps) {
  return (
    <div className="flex flex-grow items-center justify-center bg-black">
      <Carousel opts={{ startIndex }}>
        <CarouselContent className="w-[100svh]">
          {images.map((image, index) => (
            <CarouselItem key={index} className="flex min-w-[100svh] max-w-[100svh]">
              <div className="flex h-svh w-full items-center justify-center bg-black">
                <img
                  src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_520/dpr_2.0/v1716403676/${image}.jpg`}
                  width={520}
                  height={520}
                  alt="Profile picture"
                  draggable="false"
                  loading="lazy"
                  className="w-fit"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="secondary"
          className="-left-16 hidden h-12 w-12 border border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800 lg:flex [&>*]:h-6 [&>*]:w-6 [&>*]:stroke-2"
        />
        <CarouselNext
          variant="secondary"
          className="-right-16 hidden h-12 w-12 border border-neutral-700 bg-neutral-900/80 text-white hover:bg-neutral-800 lg:flex [&>*]:h-6 [&>*]:w-6 [&>*]:stroke-2"
        />
      </Carousel>
    </div>
  );
}
