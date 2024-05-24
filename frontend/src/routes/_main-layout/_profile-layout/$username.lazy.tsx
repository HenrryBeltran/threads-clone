import FollowButton from "@/components/follow-button";
import ProfilePicture from "@/components/profile-picture";
import { Button } from "@/components/ui/button";
import { UserAccount } from "@/lib/api";
import { shortUrl } from "@/lib/utils";
import { createLazyFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username")({
  component: Profile,
});

function Profile() {
  const ctx = useRouteContext({ from: "/_main-layout/_profile-layout" });

  if (typeof ctx.profile === "number") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center">
        <h1>Profile acccount not found.</h1>
        <pre className="text-sm tracking-tight">{JSON.stringify(ctx, null, 2)}</pre>
      </div>
    );
  }

  const profile = (ctx.user as UserAccount | null) ?? ctx.profile;

  if (!profile) {
    throw new Error("Something went wrong");
  }

  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="mx-auto w-full max-w-screen-sm px-6 pt-20 sm:pt-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-none tracking-tight">{profile.name}</h1>
            <h2>{profile.username}</h2>
          </div>
          <>
            {profile.profilePictureId ? (
              <ProfilePicture
                src={{
                  sm: `https://res.cloudinary.com/dglhgvcep/image/upload/h_128,w_128/dpr_2.0/v1716403676/${profile.profilePictureId}.jpg`,
                  lg: `https://res.cloudinary.com/dglhgvcep/image/upload/h_256,w_256/dpr_2.0/v1716403676/${profile.profilePictureId}.jpg`,
                }}
                alt={`${profile.username} profile picture`}
              />
            ) : (
              <img
                src="/images/profile-picture/128x128.jpg"
                width={84}
                height={84}
                className="h-16 w-16 rounded-full border border-muted-foreground/70 dark:border-muted-foreground sm:h-[84px] sm:w-[84px]"
                alt="Empty profile picture"
              />
            )}
          </>
        </div>
        <Bio text={profile.bio} />
        <div className="flex min-h-8 items-center gap-1.5">
          {/* <ProfileFollowersDialog sessionUsername={sessionUsername} profileUsername={profileUsername}> */}
          {/*   {followersCount !== 0 && ( */}
          {/*     <div data-small={followersCount === 1} className="relative h-8 w-10 data-[small=true]:w-6"> */}
          {/*       {twoFollowers[0].profilePictureUrl && ( */}
          {/*         <Image */}
          {/*           src={twoFollowers[0].profilePictureUrl} */}
          {/*           width={20} */}
          {/*           height={20} */}
          {/*           quality={85} */}
          {/*           className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-background" */}
          {/*           alt="Empty profile picture" */}
          {/*         /> */}
          {/*       )} */}
          {/*       {!twoFollowers[0].profilePictureUrl && ( */}
          {/*         <Image */}
          {/*           src={emptyProfilePicture} */}
          {/*           width={20} */}
          {/*           height={20} */}
          {/*           quality={85} */}
          {/*           className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-background" */}
          {/*           alt="Empty profile picture" */}
          {/*         /> */}
          {/*       )} */}
          {/*       {followersCount > 1 && ( */}
          {/*         <> */}
          {/*           {twoFollowers[1].profilePictureUrl ? ( */}
          {/*             <Image */}
          {/*               src={twoFollowers[1].profilePictureUrl} */}
          {/*               width={20} */}
          {/*               height={20} */}
          {/*               quality={85} */}
          {/*               className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-full border-2 border-background" */}
          {/*               alt="Empty profile picture" */}
          {/*             /> */}
          {/*           ) : ( */}
          {/*             <Image */}
          {/*               src={emptyProfilePicture} */}
          {/*               width={20} */}
          {/*               height={20} */}
          {/*               quality={85} */}
          {/*               className="absolute left-3.5 top-1/2 -translate-y-1/2 rounded-full border-2 border-background" */}
          {/*               alt="Empty profile picture" */}
          {/*             /> */}
          {/*           )} */}
          {/*         </> */}
          {/*       )} */}
          {/*     </div> */}
          {/*   )} */}
          {/*   <span className="text-sm font-light text-muted-foreground group-hover:underline group-hover:underline-offset-2"> */}
          {/*     {followersCount === 1 && "1 follower"} */}
          {/*     {followersCount !== 1 && `${followersCount} followers`} */}
          {/*   </span> */}
          {/* </ProfileFollowersDialog> */}
          {profile.link && (
            <>
              <span className="text-sm font-light text-muted-foreground">•</span>
              <a
                href={profile.link}
                target="_blank"
                className="text-sm font-light text-muted-foreground hover:underline hover:underline-offset-2"
              >
                {shortUrl(profile.link)}
              </a>
            </>
          )}
        </div>
        {ctx.follow !== null &&
          ((profile as UserAccount).id ? (
            <Button variant="outline" className="my-4 w-full rounded-xl border-muted-foreground/40">
              Edit profile
            </Button>
          ) : (
            <div className="flex gap-4">
              <FollowButton
                follow={ctx.follow}
                targetUsername={profile.username}
                pathToRevalidate={`/@${profile.username}`}
              />
              <Button variant="outline" className="my-4 w-full rounded-xl border-muted-foreground/40">
                Mention
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}

function Bio({ text }: { text: string }) {
  const [readMore, setReadMore] = useState(false);

  return (
    <div className="max-w-[65%] py-4">
      <p id="bio-par" className="line-clamp-3 whitespace-pre-line leading-tight">
        {text}
      </p>
      {text.split(/\r\n|\r|\n/).length > 3 && (
        <span
          className="cursor-pointer text-muted-foreground hover:underline hover:underline-offset-2"
          onClick={() => {
            const bio = document.querySelector("#bio-par");
            if (bio) {
              if (readMore) {
                bio.classList.add("line-clamp-3");
              } else {
                bio.classList.remove("line-clamp-3");
              }

              setReadMore((prev) => !prev);
            }
          }}
        >
          {readMore ? "Show less" : "Read more"}
        </span>
      )}
    </div>
  );
}
