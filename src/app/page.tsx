export default async function Home() {
  return (
    <section className="relative flex min-h-svh items-center justify-center">
      Home
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
