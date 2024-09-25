import { UserAccount, api } from "@/lib/api";
import { resetInfiniteQueryPagination } from "@/lib/reset-infinity-query";
import { useThreadModalStore, useThreadStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ThreadEditor } from "./create-thread";
import {
  BubbleChatIconModded,
  Cancel01Icon,
  Copy02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  SentIcon,
} from "./icons/hugeicons";
import { LikeButton } from "./like-button";
import { Paragraph } from "./paragraph";
import { Button } from "./ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { UserImage } from "./user-image";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1m",
    MM: "%dm",
    y: "1y",
    yy: "%dy",
  },
});

async function deleteThread(threadId: string) {
  const res = await safeTry(api.threads.post[":threadId"].$delete({ param: { threadId } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

export type ThreadProps = {
  id: string;
  rootId: string | null;
  parentId: string | null;
  postId: string;
  authorId: string;
  author: {
    name: string;
    username: string;
    profilePictureId: string | null;
  };
  text: string;
  resources: string[] | null;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  style?: "normal" | "main";
};

export function Thread({
  id,
  rootId,
  parentId,
  postId,
  authorId,
  author,
  text,
  resources,
  likesCount,
  repliesCount,
  createdAt,
  style = "normal",
}: ThreadProps) {
  const navigate = useNavigate();
  const { show } = useThreadModalStore();
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData<UserAccount>(["user", "account"]);

  const mutation = useMutation({
    mutationKey: ["threads"],
    mutationFn: deleteThread,
    onSuccess: () => {
      resetInfiniteQueryPagination(queryClient, ["main", "threads"]);
      resetInfiniteQueryPagination(queryClient, [author.username, "threads"]);
      queryClient.invalidateQueries({ queryKey: ["main", "threads"] });
      queryClient.invalidateQueries({ queryKey: [author.username, "threads"] });
    },
  });

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
              draggable={false}
            >
              {author.username}
            </Link>
            <div
              onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
              className="flex-grow cursor-pointer"
            >
              <span className="pl-3 text-muted-foreground">{dayjs.utc(createdAt).local().fromNow(true)}</span>
            </div>
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
            <div className="relative flex">
              <Link
                to={`/@${author.username}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                className="font-semibold"
                draggable={false}
              >
                {author.username}
              </Link>
              <div
                onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
                className="flex-grow cursor-pointer pb-1"
              >
                <span className="pl-3 text-muted-foreground">{dayjs.utc(createdAt).local().fromNow(true)}</span>
              </div>
              {userData?.id === authorId && <DeleteThreadButton deleteHandler={() => mutation.mutate(id)} />}
            </div>
          )}
          <Paragraph text={text} author={author.username} postId={postId} />
        </div>
        {resources && (
          <>
            {resources.length > 0 && <div className="h-2.5 w-full" />}
            {resources.length === 1 && <SinglePhoto images={resources} />}
            {resources.length === 2 && <DoublePhoto images={resources} />}
            {resources.length >= 3 && <AlbumCarousel images={resources} />}
          </>
        )}
        <div className="!mt-1.5 flex -translate-x-2 gap-2">
          <LikeButton threadId={id} likesCount={likesCount} userData={userData ?? null} />
          <Button
            variant="ghost"
            className="h-9 space-x-1 rounded-full px-2 text-foreground/60"
            onClick={() => {
              if (userData === undefined) {
                navigate({ to: "/login" });
                return;
              }

              show(id, rootId, parentId, {
                id,
                rootId,
                parentId,
                postId,
                authorId,
                author,
                text,
                resources,
                likesCount,
                repliesCount,
                createdAt,
              });
            }}
          >
            <BubbleChatIconModded width={20} height={20} strokeWidth={1.5} />
            {repliesCount > 0 && <span>{repliesCount}</span>}
          </Button>
          <ShareLinkButton link={`${window.location.origin}/@${author.username}/post/${postId}`}>
            <Button variant="ghost" className="h-9 space-x-1 rounded-full px-2 text-foreground/60">
              <SentIcon width={20} height={20} strokeWidth={1.5} />
            </Button>
          </ShareLinkButton>
          <div
            onClick={() => navigate({ to: `/@${author.username}/post/${postId}` })}
            className="flex-grow cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

function ShareLinkButton({ children, link }: { children: React.ReactNode; link: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-52 origin-top-right animate-appear rounded-2xl border border-muted-foreground/20 px-0 py-3 shadow-xl transition-all duration-100 dark:bg-neutral-900"
      >
        <button
          className="flex w-full justify-between px-5 py-2 focus-visible:outline-none"
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast("Copied", {
              position: "bottom-center",
              classNames: {
                title:
                  "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
                toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
              },
            });
          }}
        >
          <span className="text-sm">Copy link</span>
          <Copy02Icon strokeWidth={1.5} width={18} height={18} />
        </button>
      </PopoverContent>
    </Popover>
  );
}

type DeleteThreadButtonProps = {
  deleteHandler: () => void;
};

function DeleteThreadButton({ deleteHandler }: DeleteThreadButtonProps) {
  const [openWarning, setOpenWarning] = useState(false);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="absolute -top-2.5 right-0 h-10 w-10 rounded-full">
            <MoreHorizontalIcon strokeWidth={2} width={24} height={24} className="min-h-6 min-w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-52 origin-top-right animate-appear rounded-2xl border border-muted-foreground/20 px-0 py-3 shadow-xl transition-all duration-100 dark:bg-neutral-900"
        >
          <button
            className="flex w-full justify-between px-5 py-2 text-red-500 focus-visible:outline-none dark:text-red-400"
            onClick={() => setOpenWarning(true)}
          >
            <span className="text-sm">Delete thread</span>
            <Delete02Icon strokeWidth={1.5} width={18} height={18} />
          </button>
        </PopoverContent>
      </Popover>
      {openWarning && (
        <Dialog open={openWarning} onOpenChange={(value) => setOpenWarning(value)}>
          <DialogContent className="max-w-[288px] divide-y divide-muted-foreground/30 !rounded-2xl border border-muted-foreground/30 p-0">
            <DialogHeader>
              <DialogTitle className="text-balance pt-4 text-center text-base">
                Are you sure you want to delete this thread?
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-0 divide-x divide-muted-foreground/30">
              <DialogClose asChild className="basis-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-none rounded-bl-2xl text-base focus-visible:ring-blue-500"
                >
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild className="basis-1/2" autoFocus>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-none rounded-br-2xl text-base text-destructive hover:text-destructive focus-visible:ring-blue-500 dark:text-red-400 hover:dark:text-red-400"
                  onClick={() => deleteHandler()}
                >
                  Delete
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

type ThreadSmallViewProps = {
  user: {
    profilePictureId: string | null;
    username: string;
  };
  thread: ThreadProps;
};

export function ThreadSmallView({ user, thread }: ThreadSmallViewProps) {
  const threadStore = useThreadStore((state) => state.thread);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.querySelector("#thread-editor")?.scrollIntoView();
  }, []);

  return (
    <>
      <div ref={imageContainerRef} className="relative flex pb-10">
        <UserImage
          profilePictureId={thread.author.profilePictureId ?? null}
          username={thread.author.username!}
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
            <span className="font-semibold leading-snug">{thread.author.username!}</span>
            <span className="pl-3 text-muted-foreground">{dayjs.utc(thread.createdAt).local().fromNow(true)}</span>
            <Paragraph text={thread.text!} author={thread.author.username!} postId={thread.postId!} />
          </div>
          {thread.resources && (
            <div className="ml-3 mt-2">
              {thread.resources.length === 1 && (
                <div className="max-w-xs">
                  <SinglePhoto images={thread.resources} />
                </div>
              )}
              {thread.resources.length === 2 && <DoublePhoto images={thread.resources} />}
              {thread.resources.length >= 3 && <AlbumCarousel images={thread.resources} />}
            </div>
          )}
        </div>
        <div className="absolute bottom-2.5 left-[1.375rem] h-[calc(100%-64px)] w-0.5 bg-muted-foreground/40" />
      </div>
      {threadStore.map((_, i) => (
        <div id="thread-editor" className="relative" key={i}>
          <ThreadEditor
            index={i}
            user={user}
            placeholder={i === 0 ? `Reply to ${thread.author.username}...` : "Say more..."}
          />
          <div className="absolute left-[1.375rem] top-14 h-[calc(100%-66px)] w-0.5 bg-muted-foreground/40" />
        </div>
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
