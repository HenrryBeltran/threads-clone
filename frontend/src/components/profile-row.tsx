import { Link } from "@tanstack/react-router";
import { FollowButton } from "./follow-button";
import { UserImage } from "./user-image";

type Props = {
  name: string;
  username: string;
  profilePictureId: string | null;
  followStatus: number;
  isMyProfile: boolean;
};

export function ProfileRow({ name, username, profilePictureId, followStatus, isMyProfile }: Props) {
  return (
    <div className="flex items-center justify-between">
      <Link to={`/@${username}`} className="flex flex-grow items-center gap-4">
        <UserImage
          username={username}
          profilePictureId={profilePictureId}
          width={40}
          height={40}
          fetchPriority="high"
          loading="lazy"
          className="h-10 w-10 border-muted-foreground/30"
        />
        <div className="flex flex-col justify-center gap-0.5">
          <span className="font-medium leading-none underline-offset-2 hover:underline">{username}</span>
          <span className="font-light text-muted-foreground">{name}</span>
        </div>
      </Link>
      {isMyProfile === false && (
        <FollowButton targetUsername={username} followStatus={followStatus === 1} className="my-0 w-fit" />
      )}
    </div>
  );
}
