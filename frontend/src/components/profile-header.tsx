import ProfilePicture from "./profile-picture";

type Props = {
  username: string;
  name: string;
  profilePictureId: string | null;
};

export function ProfileHeader({ username, name, profilePictureId }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold leading-none tracking-tight">{name}</h1>
        <h2>{username}</h2>
      </div>
      <>
        {profilePictureId ? (
          <ProfilePicture
            src={{
              sm: `https://res.cloudinary.com/dglhgvcep/image/upload/h_84,w_84/dpr_2.0/v1716403676/${profilePictureId}.jpg`,
              lg: `https://res.cloudinary.com/dglhgvcep/image/upload/h_256,w_256/dpr_2.0/v1716403676/${profilePictureId}.jpg`,
            }}
            alt={`${username} profile picture`}
          />
        ) : (
          <img
            src="/images/profile-picture/128x128.jpg"
            width={84}
            height={84}
            // @ts-ignore
            fetchpriority="high"
            className="h-16 w-16 rounded-full border border-muted-foreground/70 dark:border-muted-foreground sm:h-[84px] sm:w-[84px]"
            alt="Empty profile picture"
          />
        )}
      </>
    </div>
  );
}
