import { UserAccount } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Editor } from "./editor";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { UserImage } from "./user-image";

export function CreateThread() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const createThread = useCreateThreadStore();
  const body = document.querySelector("body");

  const [thread, setThread] = useState("");
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

  return (
    <>
      {user && createThread.data.open && (
        <>
          <Dialog open={openDiscard} onOpenChange={(value) => setOpenDiscard(value)}>
            <DialogContent className="max-w-[288px] divide-y divide-muted-foreground/30 !rounded-3xl border border-muted-foreground/30 p-0">
              <DialogHeader>
                <DialogTitle className="pt-4 text-center text-xl">Discard Thread?</DialogTitle>
              </DialogHeader>
              <div className="flex gap-0 divide-x divide-muted-foreground/30">
                <DialogClose asChild className="basis-1/2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-none rounded-bl-3xl text-lg focus-visible:ring-blue-500"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild className="basis-1/2" autoFocus>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-none rounded-br-3xl text-lg text-destructive hover:text-destructive focus-visible:ring-blue-500 dark:text-red-400 hover:dark:text-red-400"
                    onClick={() => createThread.hide()}
                  >
                    Discard
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <section
            className="absolute left-0 top-0 z-50 flex h-svh w-svw items-center justify-center bg-neutral-700/50 dark:bg-black/80"
            onClick={() => {
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
              className="w-full max-w-md space-y-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <h2 className="text-center text-lg font-bold text-white [text-shadow:0px_4px_4px_rgba(23,23,23,0.24)]">
                New Thread
              </h2>
              <div className="w-full space-y-4 rounded-2xl border border-muted-foreground/20 bg-background p-5 dark:bg-neutral-900">
                <div className="flex gap-4">
                  <UserImage
                    profilePictureId={user.profilePictureId ?? null}
                    username={user.username}
                    width={48}
                    height={48}
                    fetchPriority="high"
                    className="h-12 w-12"
                  />
                  <div className="flex w-[calc(100%-48px-16px)] flex-col">
                    <span className="font-semibold leading-snug">{user.username}</span>
                    <Editor value={createThread.data.content ?? thread} onChange={(value) => setThread(value)} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    aria-disabled={thread.split("\n").join("").length === 0}
                    className="h-9 rounded-2xl px-5 aria-disabled:cursor-not-allowed aria-disabled:opacity-35 aria-disabled:hover:bg-primary"
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
