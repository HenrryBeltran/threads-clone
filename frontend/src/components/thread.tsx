import { useThreadModalStore, useThreadStore } from "@/store";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ThreadEditor } from "./create-thread";
import { BubbleChatIconModded, Cancel01Icon, SentIcon } from "./icons/hugeicons";
import { LikeButton } from "./like-button";
import { Paragraph } from "./paragraph";
import { PostsPages } from "./threads-infinite-scroll";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { UserImage } from "./user-image";

type ThreadProps = {
  id: string;
  rootId: string | null;
  parentId: string | null;
  postId: string;
  author: {
    name: string;
    username: string;
    profilePictureId: string | null;
  };
  text: string;
  resources: string[] | null;
  likesCount: number;
  repliesCount: number;
  style?: "normal" | "main";
};

export function Thread({
  id,
  rootId,
  parentId,
  postId,
  author,
  text,
  resources,
  likesCount,
  repliesCount,
  style = "normal",
}: ThreadProps) {
  const navigate = useNavigate();
  const { show } = useThreadModalStore();

  return (
    <div data-style={style} className="group flex pt-4 data-[style=main]:flex-col">
      <div className="flex group-data-[style=normal]:flex-col group-data-[style=main]:pb-3">
        <Link
          to={`/@${author.username}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          className="mr-3 min-h-11 min-w-11"
        >
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
        {style === "main" && (
          <div className="flex flex-grow items-center">
            <Link
              to={`/@${author.username}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="font-semibold"
            >
              {author.username}
            </Link>
            <div
              onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
              className="flex-grow cursor-pointer pb-8"
            />
          </div>
        )}
        {style === "normal" && (
          <div
            onClick={() => {
              navigate({ to: `/@${author.username}/post/${postId}` });
            }}
            className="flex-grow cursor-pointer"
          />
        )}
      </div>
      <div className="flex-grow">
        <div>
          {style === "normal" && (
            <div className="flex">
              <Link
                to={`/@${author.username}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                className="font-semibold"
              >
                {author.username}
              </Link>
              <div
                onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
                className="flex-grow cursor-pointer pb-8"
              />
            </div>
          )}
          <Paragraph text={text} author={author.username} postId={postId} />
        </div>
        {resources && (
          <>
            {text.length > 0 && <div className="h-1.5 w-full" />}
            {resources.length === 1 && <SinglePhoto images={resources} />}
            {resources.length === 2 && <DoublePhoto images={resources} />}
            {resources.length >= 3 && <AlbumCarousel images={resources} />}
          </>
        )}
        <div className="!mt-1.5 flex -translate-x-2 gap-2">
          <LikeButton threadId={id} likesCount={likesCount} />
          <Button
            variant="ghost"
            className="h-9 space-x-1 rounded-full px-2 text-foreground/60"
            onClick={() => show(id, rootId, parentId)}
          >
            <BubbleChatIconModded width={20} height={20} strokeWidth={1.5} />
            {repliesCount > 0 && <span>{repliesCount}</span>}
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

type ThreadSmallViewProps = {
  id: string;
  user: {
    profilePictureId: string | null;
    username: string;
  };
};

export function ThreadSmallView({ id, user }: ThreadSmallViewProps) {
  const location = useLocation();
  const queryClient = useQueryClient();

  const pathnameSlices = location.pathname.split("/");
  const source = pathnameSlices[1].startsWith("@") ? pathnameSlices[1].slice(1) : "main";

  const { pages } = queryClient.getQueryData<PostsPages>([source, "threads"])!;
  const [post, setPost] = useState<ThreadProps>();
  const threadStore = useThreadStore();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (let j = 0; pages.length > j; j++) {
      for (let k = 0; pages[j].length > k; k++) {
        if (pages[j][k].id == id) {
          setPost(pages[j][k]);
          break;
        }
      }
    }
  }, []);

  if (post === undefined) {
    return <></>;
  }

  return (
    <>
      <div ref={imageContainerRef} className="flex h-[calc(100%-64px)]">
        <UserImage
          profilePictureId={post.author.profilePictureId ?? null}
          username={post.author.username!}
          width={44}
          height={44}
          fetchPriority="high"
          className="h-11 w-11"
        />
        <div
          style={{ width: `${imageContainerRef.current?.clientWidth! - 44}px` }}
          className="flex max-h-[520px] flex-col"
        >
          <div className="px-3">
            <span className="font-semibold leading-snug">{post.author.username!}</span>
            <Paragraph text={post.text!} author={post.author.username!} postId={post.postId!} />
          </div>
          {post.resources && (
            <>
              {post.resources.length === 1 && (
                <div className="max-w-xs">
                  <SinglePhoto images={post.resources} />
                </div>
              )}
              {post.resources.length === 2 && <DoublePhoto images={post.resources} />}
              {post.resources.length >= 3 && <AlbumCarousel images={post.resources} />}
            </>
          )}
        </div>
      </div>
      {threadStore.thread.map((_, i) => (
        <ThreadEditor
          key={i}
          index={0}
          user={user}
          placeholder={i === 0 ? `Reply to ${post.author.username}...` : undefined}
        />
      ))}
    </>
  );
}

type AlbumProps = {
  images: string[];
};

function AlbumCarousel({ images }: AlbumProps) {
  const pointX = useRef<number | null>(null);
  const itMoved = useRef(false);

  return (
    <div className="h-60 w-full overflow-hidden">
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
        <div className="absolute left-0 top-0 flex w-max gap-4 active:cursor-grabbing">
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
        <div className="flex min-h-svh max-w-[100svh] !rounded-none p-0 outline-none">
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
