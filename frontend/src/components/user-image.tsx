import { cn } from "@/lib/utils";

type Props = {
  username: string;
  profilePictureId: string | null;
  width: number;
  height: number;
  emptyProfilePicture?: string;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "lazy" | "eager";
  className?: string;
};

export function UserImage({
  username,
  profilePictureId,
  width,
  height,
  emptyProfilePicture,
  fetchPriority,
  loading,
  className,
}: Props) {
  return (
    <>
      {profilePictureId ? (
        <img
          src={`https://res.cloudinary.com/dglhgvcep/image/upload/h_${width},w_${height}/dpr_2.0/v1716403676/${profilePictureId}.jpg`}
          // @ts-ignore
          fetchpriority={fetchPriority}
          loading={loading}
          alt={`${username} profile picture`}
          draggable="false"
          className={cn("rounded-full border border-muted-foreground/30", className)}
        />
      ) : (
        <img
          src={emptyProfilePicture ?? "/images/empty-profile-picture/64x64.jpg"}
          width={width}
          height={width}
          // @ts-ignore
          fetchpriority={fetchPriority}
          loading={loading}
          draggable="false"
          className={cn("rounded-full border border-muted-foreground/30", className)}
          alt="Empty profile picture"
        />
      )}
    </>
  );
}
