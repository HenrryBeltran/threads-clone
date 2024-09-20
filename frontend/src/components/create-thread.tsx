import { useLockScrolling } from "@/hooks/lock-scrolling";
import { UserAccount, api } from "@/lib/api";
import { useThreadModalStore, useThreadStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Editor } from "./editor";
import { Cancel01Icon } from "./icons/hugeicons";
import { ThreadSmallView } from "./thread";
import { Posts } from "./threads-infinite-scroll";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadAlbumButton } from "./upload-album-button";
import { Resource, UploadedAlbumCarousel, UploadedAlbumDouble, UploadedSingleView } from "./upload-album-view";
import { UserImage } from "./user-image";

export type Thread = {
  text: string;
  images: Resource[];
};

type JSONPost = {
  rootId: string | null;
  parentId: string | null;
  body: {
    text: string;
    resources: string[] | null;
  }[];
};

async function postThread(json: JSONPost) {
  const res = await safeTry(api.threads.post.$post({ json }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

export function CreateThread() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  const threadModalData = useThreadModalStore((state) => state.data);
  const hideThreadModal = useThreadModalStore((state) => state.hide);
  const thread = useThreadStore((state) => state.thread);
  const currentIndex = useThreadStore((state) => state.currentIndex);
  const addThread = useThreadStore((state) => state.addThread);
  const resetThread = useThreadStore((state) => state.resetThread);

  const [openDiscard, setOpenDiscard] = useState(false);

  const mutation = useMutation({
    mutationKey: ["posting", "threads"],
    mutationFn: postThread,
    onSuccess: (currentData) => {
      queryClient.invalidateQueries({ queryKey: ["postring", "threads"] });
      const oldData = queryClient.getQueryData<Posts>(["posting", "threads"]) ?? [];
      queryClient.setQueryData(["posting", "threads"], [...currentData, ...oldData]);
      console.log("~ from success mutation", queryClient.getQueryData(["posting", "threads"]));
    },
  });

  useEffect(() => {
    if (threadModalData.open === false) {
      resetThread();
    }
  }, [threadModalData.open]);

  useLockScrolling(threadModalData.open);

  return (
    <>
      {user && threadModalData.open && (
        <>
          <Dialog open={openDiscard} onOpenChange={(value) => setOpenDiscard(value)}>
            <DialogContent className="max-w-[288px] divide-y divide-muted-foreground/30 !rounded-2xl border border-muted-foreground/30 p-0">
              <DialogHeader>
                <DialogTitle className="pt-4 text-center text-xl">Discard Thread?</DialogTitle>
              </DialogHeader>
              <div className="flex gap-0 divide-x divide-muted-foreground/30">
                <DialogClose asChild className="basis-1/2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-none rounded-bl-2xl text-lg focus-visible:ring-blue-500"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild className="basis-1/2" autoFocus>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-none rounded-br-2xl text-lg text-destructive hover:text-destructive focus-visible:ring-blue-500 dark:text-red-400 hover:dark:text-red-400"
                    onClick={() => hideThreadModal()}
                  >
                    Discard
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <section
            className="fixed left-0 top-0 z-50 flex h-svh w-svw border border-muted-foreground/20 bg-background dark:bg-neutral-900 sm:items-center sm:justify-center sm:border-none sm:bg-neutral-700/50 sm:dark:bg-black/80"
            onClick={(e) => {
              if (e.currentTarget.clientWidth < 640) {
                return;
              }

              if (thread.every((t) => t.text.length > 0) || thread.every((t) => t.images.length > 0)) {
                setOpenDiscard(true);
              } else {
                hideThreadModal();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (thread.every((t) => t.text.length > 0) || thread.every((t) => t.images.length > 0)) {
                  setOpenDiscard(true);
                } else {
                  hideThreadModal();
                }
              }
            }}
          >
            <div
              className="flex w-full flex-col space-y-4 pt-2 sm:mx-4 sm:max-w-xl sm:pt-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between px-3 text-sm">
                <Button
                  variant="link"
                  className="px-0 text-base sm:hidden"
                  onClick={() => {
                    if (thread.every((t) => t.text.length > 0) || thread.every((t) => t.images.length > 0)) {
                      setOpenDiscard(true);
                    } else {
                      hideThreadModal();
                    }
                  }}
                >
                  Cancel
                </Button>
                <h2 className="flex-grow text-center text-base font-bold sm:text-white sm:[text-shadow:0px_4px_4px_rgba(23,23,23,0.24)]">
                  New Thread
                </h2>
                <div className="w-[53px] sm:hidden" />
              </div>
              <div className="flex max-h-[520px] w-full flex-grow flex-col bg-background dark:bg-neutral-900 sm:max-w-xl sm:rounded-2xl sm:border sm:border-muted-foreground/20">
                <div className="w-full flex-grow overflow-y-scroll p-3 sm:max-w-xl sm:p-6">
                  {threadModalData.rootId === null && (
                    <>
                      {thread.map((_, i) => (
                        <div key={i} className="relative">
                          <ThreadEditor user={user} index={i} placeholder={i > 0 ? "Say more..." : undefined} />
                          <div className="absolute left-[1.375rem] top-14 h-[calc(100%-66px)] w-0.5 bg-muted-foreground/60" />
                        </div>
                      ))}
                    </>
                  )}
                  {threadModalData.rootId !== null && threadModalData.id && (
                    <>
                      <ThreadSmallView id={threadModalData.id} user={user} />
                    </>
                  )}
                  <button
                    data-fill={thread.every((t) => t.text.length > 0) || thread.every((t) => t.images.length > 0)}
                    className="flex items-center gap-[1.375rem] opacity-50 data-[fill=false]:cursor-not-allowed data-[fill=true]:opacity-100"
                    onClick={() => {
                      const hasText = thread.every((t) => t.text.length > 0);
                      const hasImages = thread.every((t) => t.images.length > 0);

                      if (hasText || hasImages) {
                        addThread();
                      }
                    }}
                  >
                    <UserImage
                      profilePictureId={user.profilePictureId ?? null}
                      username={user.username}
                      width={24}
                      height={24}
                      fetchPriority="high"
                      className="ml-2.5 h-6 w-6"
                    />
                    <span>Add to thread</span>
                  </button>
                </div>
                <div className="flex items-center justify-end gap-4 p-3 sm:p-6 sm:pt-3">
                  {thread[currentIndex].text.length >= 450 && (
                    <span
                      aria-invalid={thread[currentIndex].text.length > 500}
                      className="aria-[invalid=true]:text-destructive dark:aria-[invalid=true]:text-red-400"
                    >
                      {500 - thread[currentIndex].text.length}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    aria-disabled={
                      (thread.every((t) => t.images.length === 0) &&
                        thread.every((t) => t.text.split("\n").join("").length === 0)) ||
                      thread.every((t) => t.text.length > 500)
                    }
                    className="rounded-xl border-muted-foreground/30 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:!bg-transparent"
                    onClick={(e) => {
                      if (e.currentTarget.ariaDisabled === "true") {
                        return;
                      }

                      // TODO: Mutate the data
                      console.log("~ POST", {
                        rootId: threadModalData.rootId,
                        parentId: threadModalData.id,
                        body: thread,
                      });
                      const postData = thread.map((t) => {
                        if (t.images.length === 0) {
                          return {
                            text: t.text,
                            resources: null,
                          };
                        }

                        return {
                          text: t.text,
                          resources: t.images.map((image) => image.base64),
                        };
                      });
                      mutation.mutate({
                        rootId: threadModalData.rootId,
                        parentId: threadModalData.id === undefined ? null : threadModalData.id,
                        body: postData,
                      });
                      hideThreadModal();
                    }}
                  >
                    Post{threadModalData.rootId !== null && " is a reply"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

type ThreadEditorProps = {
  user: {
    profilePictureId: string | null;
    username: string;
  };
  index: number;
  placeholder?: string;
};

export function ThreadEditor({ user, index, placeholder }: ThreadEditorProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const threadStore = useThreadStore();

  return (
    <div ref={imageContainerRef} className="flex h-fit">
      <UserImage
        profilePictureId={user.profilePictureId ?? null}
        username={user.username}
        width={44}
        height={44}
        fetchPriority="high"
        className="h-11 w-11"
      />
      <div
        style={{ width: `${imageContainerRef.current?.clientWidth! - 44}px` }}
        className="relative flex max-h-[520px] flex-col"
      >
        <div className="px-3">
          <span className="font-semibold leading-snug">{user.username}</span>
          <Editor index={index} placeholder={placeholder} />
        </div>
        <div className="flex px-1 pb-3 pt-1">
          <UploadAlbumButton index={index} />
        </div>
        {threadStore.thread[index].images.length === 1 && (
          <div className="mb-3">
            <UploadedSingleView
              threadIndex={index}
              containerWidth={imageContainerRef.current?.clientWidth!}
              images={threadStore.thread[index].images}
            />
          </div>
        )}
        {threadStore.thread[index].images.length === 2 && (
          <div className="mb-3">
            <UploadedAlbumDouble
              threadIndex={index}
              containerWidth={imageContainerRef.current?.clientWidth!}
              images={threadStore.thread[index].images}
            />
          </div>
        )}
        {threadStore.thread[index].images.length >= 3 && (
          <div className="mb-3">
            <UploadedAlbumCarousel
              threadIndex={index}
              containerWidth={imageContainerRef.current?.clientWidth!}
              images={threadStore.thread[index].images}
            />
          </div>
        )}
      </div>
      {threadStore.thread.length > 1 && index !== 0 && (
        <button
          className="mt-5 flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-95"
          onClick={() => threadStore.removeThread(index)}
        >
          <Cancel01Icon
            strokeWidth={2}
            width={24}
            height={24}
            className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground"
          />
        </button>
      )}
    </div>
  );
}
