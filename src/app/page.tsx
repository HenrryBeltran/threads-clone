export default async function Home() {
  return (
    <section className="relative flex min-h-svh items-center justify-center">
      Home
      {/* <section className="mx-auto flex min-h-svh max-w-sm items-start justify-between gap-4 pt-12"> */}
      {/*   <div className="flex flex-row-reverse items-center gap-2"> */}
      {/*     <Suspense */}
      {/*       fallback={ */}
      {/*         <div className="h-16 w-16 rounded-full border border-muted-foreground" /> */}
      {/*       } */}
      {/*     > */}
      {/*       <UserProfile id={user.id} /> */}
      {/*     </Suspense> */}
      {/*   </div> */}
      {/* </section> */}
    </section>
  );
}

// async function UserProfile({ id }: { id: string }) {
//   const user = await xata.db.user
//     .select(["username", "profile_picture"])
//     .filter({ id })
//     .getFirst();
//
//   if (!user) {
//     return;
//   }
//
//   return (
//     <>
//       <p className="text-sm font-medium">@{user.username}</p>
//       <div className="h-12 w-12 overflow-hidden rounded-full border border-neutral-400/60">
//         <Image
//           src={user.profile_picture?.url!}
//           alt="User Profile Picture"
//           width={48}
//           height={48}
//           quality={100}
//           priority
//         />
//       </div>
//     </>
//   );
// }
