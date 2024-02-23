import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { isAuthenticated } = getKindeServerSession();
  const auth = await isAuthenticated();

  if (auth) {
    redirect("/api/auth/login");
  }

  return (
    <main className="relative">
      <section className="flex min-h-svh flex-col items-center justify-center gap-4">
        <h1>App Content 🚀</h1>
        <LogoutLink className="underline">Log out</LogoutLink>
      </section>
    </main>
  );
}
