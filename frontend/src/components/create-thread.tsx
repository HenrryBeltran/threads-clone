import { UserAccount } from "@/lib/api";
import { useCreateThreadStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Editor } from "./editor";
import { UserImage } from "./user-image";

export function CreateThread() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);
  const createThread = useCreateThreadStore();
  const body = document.querySelector("body");

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

  return (
    <>
      {user && createThread.data.open && (
        <section
          className="absolute left-0 top-0 z-50 flex h-svh w-svw items-center justify-center bg-neutral-700/50 dark:bg-black/80"
          onClick={() => createThread.hide()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              createThread.hide();
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
            <h2 className="text-center text-lg font-bold text-white [text-shadow:0px_4px_4px_rgba(23,23,23,0.6)]">
              New Thread
            </h2>
            <div className="h-full w-full rounded-lg border border-muted-foreground/20 bg-background p-5 dark:bg-neutral-900">
              <div className="flex gap-4">
                <UserImage
                  profilePictureId={user.profilePictureId ?? null}
                  username={user.username}
                  width={48}
                  height={48}
                  fetchPriority="high"
                  className="h-12 w-12"
                />
                <div className="h-full w-full">
                  <span className="font-semibold leading-snug">{user.username}</span>
                  <Editor />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
