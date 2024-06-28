import { UserAccount, api } from "@/lib/api";
import { optimizeImage } from "@/lib/optimize-image";
import { useCreateThreadStore } from "@/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Editor } from "./editor";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadAlbumButton } from "./upload-album-button";
import { Resource, UploadedAlbumCarousel, UploadedAlbumDouble, UploadedSingleView } from "./upload-album-view";
import { UserImage } from "./user-image";
import { safeTry } from "@server/lib/safe-try";

const upTo10AttachmentsMessage = () =>
  toast("You can have up to 10 attachments.", {
    position: "bottom-center",
    classNames: {
      title:
        "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
      toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
    },
  });

async function postThread({ text, resources }: { text: string; resources?: string[] }) {
  const res = await safeTry(api.threads.post.$post({ json: { text, resources } }));

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
  const body = document.querySelector("body");
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [thread, setThread] = useState("");
  const [images, setImages] = useState<Resource[]>([]);
  const [openDiscard, setOpenDiscard] = useState(false);

  const mutation = useMutation({
    mutationKey: ["threads"],
    mutationFn: postThread,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["threads"] }),
  });

  useEffect(() => {
    if (!body) return;

    if (createThread.data.open) {
      body.style.height = "100svh";
      body.style.overflow = "hidden";
    } else {
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  }, [createThread.data.open]);

  useEffect(() => {
    setThread("");
    setImages([]);
  }, [createThread.data.open]);

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

      const { base64, size } = await optimizeImage(file, undefined, 0.8);

      optimizedImages.push({ base64, size });
    }

    setImages((prev) => {
      const totalLength = prev.length + optimizedImages.length;

      if (totalLength >= 10) {
        upTo10AttachmentsMessage();

        const upTo10List: Resource[] = [];

        for (let i = 0; i < 10; i++) {
          const newItem = prev[i] !== undefined ? prev[i] : optimizedImages[i - prev.length];
          upTo10List.push(newItem);
        }

        return upTo10List;
      }

      if (prev) {
        return [...prev, ...optimizedImages];
      }

      return optimizedImages;
    });
  }

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
            className="absolute left-0 top-0 z-50 flex h-svh w-svw border border-muted-foreground/20 bg-background dark:bg-neutral-900 sm:items-center sm:justify-center sm:border-none sm:bg-neutral-700/50 sm:dark:bg-black/80"
            onClick={(e) => {
              if (e.currentTarget.clientWidth < 640) {
                return;
              }

              if (thread.length > 0 || images.length > 0) {
                setOpenDiscard(true);
              } else {
                createThread.hide();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (thread.length > 0 || images.length > 0) {
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
                    if (thread.length > 0 || images.length > 0) {
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
                        <Editor value={createThread.data.content ?? thread} onChange={(value) => setThread(value)} />
                      </div>
                      <div className="flex px-1 pb-3 pt-1">
                        <UploadAlbumButton imagesLength={images.length} handleUploadFile={handleUploadFile} />
                      </div>
                      {images.length === 1 && (
                        <UploadedSingleView
                          containerWidth={imageContainerRef.current?.clientWidth!}
                          images={images}
                          setImages={setImages}
                        />
                      )}
                      {images.length === 2 && (
                        <UploadedAlbumDouble
                          containerWidth={imageContainerRef.current?.clientWidth!}
                          images={images}
                          setImages={setImages}
                        />
                      )}
                      {images.length >= 3 && (
                        <UploadedAlbumCarousel
                          containerWidth={imageContainerRef.current?.clientWidth!}
                          images={images}
                          setImages={setImages}
                        />
                      )}
                    </div>
                  </div>
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
                      (images.length === 0 && thread.split("\n").join("").length === 0) || thread.length > 500
                    }
                    className="rounded-xl border-muted-foreground/30 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:!bg-transparent"
                    onClick={(e) => {
                      if (e.currentTarget.ariaDisabled === "true") {
                        return;
                      }

                      const resources = images.length === 0 ? undefined : images.map((img) => img.base64);
                      mutation.mutate({ text: thread, resources });
                      createThread.hide();
                    }}
                  >
                    Post
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
