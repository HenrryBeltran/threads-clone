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
      <ProfilePicture
        profilePictureId={profilePictureId}
        src={{
          sm: `https://res.cloudinary.com/dglhgvcep/image/upload/h_84,w_84/dpr_2.0/v1716403676/${profilePictureId}.jpg`,
          lg: `https://res.cloudinary.com/dglhgvcep/image/upload/h_256,w_256/dpr_2.0/v1716403676/${profilePictureId}.jpg`,
        }}
        alt={`${username} profile picture`}
      />
    </div>
  );
}
