import { xata } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Try } from "./safeTry";

export async function getAuth() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();

  if (!isLoggedIn) {
    redirect("/api/auth/login");
  }

  const kindeUser = await getUser();

  if (kindeUser === null) {
    redirect("/api/auth/login");
  }

  const { error, result } = await Try(
    xata.db.user
      .select(["username", "name"])
      .filter({ email: kindeUser.email })
      .getFirst(),
  );

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return result;
}
