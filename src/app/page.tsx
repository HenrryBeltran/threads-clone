import { xata } from "@/db";
import { getAuth } from "@/lib/getAuth";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  const user = await getAuth();

  if (!user) {
    redirect("/account/register");
  }

  return (
    <main className="relative">
      <section className="mx-auto flex min-h-svh max-w-sm items-start justify-between gap-4 pt-12">
        <div className="flex flex-row-reverse items-center gap-2">
          <Suspense
            fallback={
              <div className="h-16 w-16 rounded-full border border-muted-foreground" />
            }
          >
            <UserProfile id={user.id} />
          </Suspense>
        </div>
        <LogoutLink className="mt-5 underline">Log out</LogoutLink>
      </section>
    </main>
  );
}

async function UserProfile({ id }: { id: string }) {
  const user = await xata.db.user
    .select(["username", "profile_picture"])
    .filter({ id })
    .getFirst();

  if (!user) {
    return;
  }

  return (
    <>
      <p className="text-sm font-medium">@{user.username}</p>
      <div className="h-12 w-12 overflow-hidden rounded-full border border-neutral-400/60">
        <Image
          src={user.profile_picture?.url!}
          alt="User Profile Picture"
          width={48}
          height={48}
          quality={100}
          priority
        />
      </div>
    </>
  );
}
