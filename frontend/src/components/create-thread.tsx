import { UserAccount } from "@/lib/api";
import { optimizeImage } from "@/lib/optimize-image";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Editor } from "./editor";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UploadAlbumButton } from "./upload-album-button";
import { Resource, UploadAlbumView } from "./upload-album-view";
import { UserImage } from "./user-image";

export function CreateThread() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const createThread = useCreateThreadStore();
  const body = document.querySelector("body");

  const [thread, setThread] = useState("");
  const [images, setImages] = useState<Resource[]>();
  const [openDiscard, setOpenDiscard] = useState(false);

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
  }, [createThread.data.open]);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    const files = Array.from<File>(e.target.files);

    for (const file of files) {
      const { base64, size } = await optimizeImage(
        file,
        undefined,
        // {
        //   x: 1080,
        //   y: 1080,
        // },
        0.8,
      );

      setImages((prev) => {
        if (prev) {
          return [...prev, { base64, size }];
        }
        return [{ base64, size }];
      });
    }
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

              if (thread.length > 0) {
                setOpenDiscard(true);
              } else {
                createThread.hide();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (thread.length > 0) {
                  setOpenDiscard(true);
                } else {
                  createThread.hide();
                }
              }
            }}
          >
            <div
              className="mx-4 mt-2 w-full space-y-4 sm:mt-0 sm:max-w-2xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between px-6">
                <Button
                  variant="link"
                  className="px-0 text-base sm:hidden"
                  onClick={() => {
                    if (thread.length > 0) {
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
              <div className="w-full space-y-4 bg-background px-6 py-3 dark:bg-neutral-900 sm:rounded-2xl sm:border sm:border-muted-foreground/20 sm:py-6">
                <div className="flex gap-3">
                  <UserImage
                    profilePictureId={user.profilePictureId ?? null}
                    username={user.username}
                    width={44}
                    height={44}
                    fetchPriority="high"
                    className="h-11 w-11"
                  />
                  <div className="flex w-[calc(100%-44px-12px)] flex-col">
                    <span className="font-semibold leading-snug">{user.username}</span>
                    <Editor value={createThread.data.content ?? thread} onChange={(value) => setThread(value)} />
                    <UploadAlbumButton handleUploadFile={handleUploadFile} />
                    <UploadAlbumView images={images} setImages={setImages} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4">
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
                    aria-disabled={thread.split("\n").join("").length === 0 || thread.length > 500}
                    className="rounded-xl border-muted-foreground/30 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:!bg-transparent"
                    onClick={(e) => {
                      if (e.currentTarget.ariaDisabled === "true") {
                        return;
                      }
                      alert(`Submitted:\n${thread}`);
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
