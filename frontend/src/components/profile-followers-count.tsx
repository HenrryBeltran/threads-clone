import { useEffect, useRef, useState } from "react";
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
  const dialog = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (dialog.current === null) return;

    function handleToggle(e: Event) {
      const event = e as ToggleEvent;

      if (event.newState === "open") {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }

    dialog.current.addEventListener("toggle", handleToggle);

    return () => dialog.current?.removeEventListener("toggle", handleToggle);
  });

  return (
    <>
      {followersCount !== 0 && (
        <div
          data-small={followersCount === 1}
          className="peer relative h-8 w-9 cursor-pointer data-[small=true]:w-6"
          onClick={() => dialog.current?.showPopover()}
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
        onClick={() => dialog.current?.showPopover()}
      >
        {followersCount === 1 && "1 follower"}
        {followersCount !== 1 && `${followersCount} followers`}
      </span>
      <dialog
        ref={dialog}
        // @ts-ignore
        popover="auto"
        className="w-full max-w-sm bg-transparent p-5 backdrop:bg-neutral-700/50 dark:backdrop:bg-background/60 sm:max-w-md"
      >
        {open && (
          <FollowersCard
            followersCount={followersCount}
            followingsCount={followingsCount}
            userId={userId}
            targetId={targetId}
          />
        )}
      </dialog>
    </>
  );
}
