import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FollowersCard } from "./followers-card";
import { UserImage } from "./user-image";

type Props = {
  username: string;
  followersCount: number;
  followingsCount: number;
  profilePictureIdOne: string | null;
  profilePictureIdTwo: string | null;
  userId?: string;
  targetId: string;
};

export function ProfileFollowersCount({
  username,
  followersCount,
  followingsCount,
  profilePictureIdOne,
  profilePictureIdTwo,
  userId,
  targetId,
}: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let dialog: HTMLDialogElement | null;

  useEffect(() => {
    dialog = document.querySelector("#followers-popover");

    if (dialog === null) return;

    function handleToggle(e: Event) {
      const event = e as ToggleEvent;

      if (event.newState === "open") {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }

    dialog.addEventListener("toggle", handleToggle);

    return () => dialog?.removeEventListener("toggle", handleToggle);
  });

  return (
    <>
      {followersCount !== 0 && (
        <div
          data-small={followersCount === 1}
          className="peer relative h-8 w-9 cursor-pointer data-[small=true]:w-6"
          onClick={() => {
            if (userId === undefined) {
              navigate({ to: "/login" });
              return;
            }

            dialog?.showPopover();
          }}
        >
          <div className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background bg-background">
            <UserImage
              username={username}
              profilePictureId={profilePictureIdOne}
              width={20}
              height={20}
              fetchPriority="high"
              className="border-none"
            />
          </div>
          {followersCount > 1 && (
            <div className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background bg-background">
              <UserImage
                username={username}
                profilePictureId={profilePictureIdTwo}
                width={20}
                height={20}
                fetchPriority="high"
                className="border-none"
              />
            </div>
          )}
        </div>
      )}
      <span
        className="cursor-pointer text-sm font-light text-muted-foreground underline-offset-2 hover:underline peer-[:hover]:underline"
        onClick={() => {
          if (userId === undefined) {
            navigate({ to: "/login" });
            return;
          }

          dialog?.showPopover();
        }}
      >
        {followersCount === 1 && "1 follower"}
        {followersCount !== 1 && `${followersCount} followers`}
      </span>
      <dialog
        id="followers-popover"
        // @ts-ignore
        popover="auto"
        className="w-full max-w-md bg-transparent p-5 backdrop:bg-neutral-700/50 dark:backdrop:bg-background/60"
      >
        {open && userId && (
          <FollowersCard
            followersCount={followersCount}
            followingsCount={followingsCount}
            userId={userId}
            targetId={targetId}
            handleOnClick={() => dialog?.hidePopover()}
          />
        )}
      </dialog>
    </>
  );
}
