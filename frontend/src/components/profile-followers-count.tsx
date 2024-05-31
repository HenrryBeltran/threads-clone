import { useState } from "react";

type Props = {
  followersCount: number;
  profilePictureIdOne: string | null;
  profilePictureIdTwo: string | null;
};

export function ProfileFollowersCount({ followersCount, profilePictureIdOne, profilePictureIdTwo }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {followersCount !== 0 && (
        <div
          data-small={followersCount === 1}
          className="relative h-8 w-9 data-[small=true]:w-6"
          onClick={() => setOpen(true)}
        >
          <div className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background bg-background">
            {profilePictureIdOne ? (
              <img
                src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_20,w_20/dpr_2.0/v1716403676/${profilePictureIdOne}.jpg`}
                width={20}
                height={20}
                // @ts-ignore
                fetchpriority="high"
                className="rounded-full"
                alt="Empty profile picture"
              />
            ) : (
              <img
                src="/images/empty-profile-picture/64x64.jpg"
                width={20}
                height={20}
                // @ts-ignore
                fetchpriority="high"
                className="rounded-full"
                alt="Empty profile picture"
              />
            )}
          </div>
          {followersCount > 1 && (
            <div className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-background bg-background">
              {profilePictureIdTwo ? (
                <img
                  src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_20,w_20/dpr_2.0/v1716403676/${profilePictureIdTwo}.jpg`}
                  width={20}
                  height={20}
                  // @ts-ignore
                  fetchpriority="high"
                  className="rounded-full"
                  alt="Empty profile picture"
                />
              ) : (
                <img
                  src="/images/empty-profile-picture/64x64.jpg"
                  width={20}
                  height={20}
                  // @ts-ignore
                  fetchpriority="high"
                  className="rounded-full"
                  alt="Empty profile picture"
                />
              )}
            </div>
          )}
        </div>
      )}
      <span
        className="text-sm font-light text-muted-foreground group-hover:underline group-hover:underline-offset-2"
        onClick={() => setOpen(true)}
      >
        {followersCount === 1 && "1 follower"}
        {followersCount !== 1 && `${followersCount} followers`}
      </span>
      {open && (
        <div className="absolute left-1/2 top-1/2 m-5 -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5">
          Followers content
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
      {/* </ProfileFollowersDialog> */}
    </>
  );
}
