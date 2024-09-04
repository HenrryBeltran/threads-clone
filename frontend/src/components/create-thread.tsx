import { useLockScrolling } from "@/hooks/lock-scrolling";
import { UserAccount, api } from "@/lib/api";
import { optimizeImage } from "@/lib/optimize-image";
import { useCreateThreadStore } from "@/store";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Editor } from "./editor";
import { Posts } from "./threads-infinite-scroll";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadAlbumButton } from "./upload-album-button";
import { Resource, UploadedAlbumCarousel, UploadedAlbumDouble, UploadedSingleView } from "./upload-album-view";
import { UserImage } from "./user-image";
import { ThreadSmallView } from "./thread";

export type Thread = {
  text: string;
  images: Resource[];
};

const upTo10AttachmentsMessage = () =>
  toast("You can have up to 10 attachments.", {
    position: "bottom-center",
    classNames: {
      title:
        "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
      toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
    },
  });

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
  const createThread = useCreateThreadStore();

  const [thread, setThread] = useState<Thread[]>([{ text: "", images: [] }]);
  const [openDiscard, setOpenDiscard] = useState(false);

  const mutation = useMutation({
    mutationKey: ["posting", "threads"],
    mutationFn: postThread,
    onSuccess: (currentData) => {
      queryClient.invalidateQueries({ queryKey: ["postring", "threads"] });
      const oldData = queryClient.getQueryData<Posts>(["posting", "threads"]) ?? [];
      queryClient.setQueryData(["posting", "threads"], [currentData, ...oldData]);
    },
  });

  useEffect(() => {
    setThread([{ text: "", images: [] }]);
  }, [createThread.data.open]);

  useLockScrolling(createThread.data.open);

  return (
    <>
      {user && createThread.data.open && (
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
                    onClick={() => createThread.hide()}
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

              if (thread[0].text.length > 0 || thread[0].images.length > 0) {
                setOpenDiscard(true);
              } else {
                createThread.hide();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (thread[0].text.length > 0 || thread[0].images.length > 0) {
                  setOpenDiscard(true);
                } else {
                  createThread.hide();
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
                    if (thread[0].text.length > 0 || thread[0].images.length > 0) {
                      setOpenDiscard(true);
                    } else {
                      createThread.hide();
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
              <div className="flex w-full flex-grow flex-col bg-background dark:bg-neutral-900 sm:max-w-xl sm:rounded-2xl sm:border sm:border-muted-foreground/20">
                <div className="w-full flex-grow overflow-y-scroll p-3 sm:max-w-xl sm:p-6">
                  {createThread.data.rootId === null && (
                    <>
                      {thread.map((_, i) => (
                        <ThreadEditor key={i} user={user} index={i} thread={thread} setThread={setThread} />
                      ))}
                      {/* <div data-enable={thread.length > 0} className="opacity-50 data-[enable=true]:opacity-100"> */}
                      {/*   <ThreadEditor */}
                      {/*     user={user} */}
                      {/*     thread={thread} */}
                      {/*     setThread={setThread} */}
                      {/*     images={images} */}
                      {/*     setImages={setImages} */}
                      {/*     placeholder="" */}
                      {/*   /> */}
                      {/* </div> */}
                    </>
                  )}
                  {createThread.data.rootId !== null && createThread.data.id && (
                    <>
                      <ThreadSmallView id={createThread.data.id} user={user} thread={thread} setThread={setThread} />
                    </>
                  )}
                  <button onClick={() => setThread((prev) => [...prev, { text: "", images: [] }])}>
                    Add new thread
                  </button>
                </div>
                <div className="flex items-center justify-end gap-4 p-3 sm:p-6 sm:pt-3">
                  {thread.length >= 450 && (
                    <span
                      aria-invalid={thread.length > 500}
                      className="aria-[invalid=true]:text-destructive dark:aria-[invalid=true]:text-red-400"
                    >
                      {500 - thread.length}
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
                        rootId: createThread.data.rootId,
                        parentId: createThread.data.id,
                        body: thread,
                      });
                      const postData = thread.map((t) => {
                        if (t.images.length > 0) {
                          return {
                            text: t.text,
                            resources: [] as string[],
                          };
                        }
                        return {
                          text: t.text,
                          resources: t.images.map((image) => image.base64),
                        };
                      });
                      mutation.mutate({
                        rootId: createThread.data.rootId,
                        parentId: createThread.data.id === undefined ? null : createThread.data.id,
                        body: postData,
                      });
                      createThread.hide();
                    }}
                  >
                    Post{createThread.data.rootId !== null && " is a reply"}
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
  thread: Thread[];
  setThread: React.Dispatch<React.SetStateAction<Thread[]>>;
  placeholder?: string;
};

export function ThreadEditor({ user, index, thread, setThread, placeholder }: ThreadEditorProps) {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const createThread = useCreateThreadStore();

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const files = Array.from<File>(e.target.files);
    const optimizedImages: Resource[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (i > 9) {
        upTo10AttachmentsMessage();
        break;
      }

      const { base64, size } = await optimizeImage(file, undefined, 1);

      optimizedImages.push({ base64, size });
    }

    setThread((p) => {
      const prev = p[index];
      const totalLength = prev.images.length + optimizedImages.length;

      if (totalLength >= 10) {
        upTo10AttachmentsMessage();

        const upTo10List: Resource[] = [];

        for (let i = 0; i < 10; i++) {
          const newItem = prev.images[i] !== undefined ? prev.images[i] : optimizedImages[i - prev.images.length];
          upTo10List.push(newItem);
        }

        return p.map((prevThread, i) => {
          if (i === index) {
            return {
              text: prevThread.text,
              images: upTo10List,
            };
          }
          return prevThread;
        });
      }

      return p.map((prevThread, i) => {
        if (i === index) {
          return {
            text: prevThread.text,
            images: [...prevThread.images, ...optimizedImages],
          };
        }
        return prevThread;
      });
    });
  }

  function deleteImage(imageIndexToDelete: number) {
    setThread((prev) => {
      return prev.map((prevThread, idx) => {
        if (idx === index) {
          return {
            text: prevThread.text,
            images: prevThread.images.filter((_, i) => i !== imageIndexToDelete),
          };
        }

        return prevThread;
      });
    });
  }

  return (
    <div ref={imageContainerRef} className="flex h-[calc(100%-64px)]">
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
        className="flex max-h-[520px] flex-col"
      >
        <div className="px-3">
          <span className="font-semibold leading-snug">{user.username}</span>
          <Editor
            placeholder={placeholder}
            value={createThread.data.content ?? thread[index].text}
            onChange={(value) =>
              setThread((prev) => {
                return prev.map((prevThread, i) => {
                  if (i === index) {
                    return {
                      text: value,
                      images: prevThread.images,
                    };
                  }
                  return prevThread;
                });
              })
            }
          />
        </div>
        <div className="flex px-1 pb-3 pt-1">
          <UploadAlbumButton imagesLength={thread[index].images.length} handleUploadFile={handleUploadFile} />
        </div>
        {thread[index].images.length === 1 && (
          <UploadedSingleView
            containerWidth={imageContainerRef.current?.clientWidth!}
            images={thread[index].images}
            deleteImage={deleteImage}
          />
        )}
        {thread[index].images.length === 2 && (
          <UploadedAlbumDouble
            containerWidth={imageContainerRef.current?.clientWidth!}
            images={thread[index].images}
            deleteImage={deleteImage}
          />
        )}
        {thread[index].images.length >= 3 && (
          <UploadedAlbumCarousel
            containerWidth={imageContainerRef.current?.clientWidth!}
            images={thread[index].images}
            deleteImage={deleteImage}
          />
        )}
      </div>
    </div>
  );
}
