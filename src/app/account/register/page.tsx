import { getAuth } from "@/lib/getAuth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export default async function RegisterAccountPage() {
  const user = await getAuth();

  if (user) {
    redirect("/");
  }

  return (
    <main>
      <section className="mx-6 space-y-5 pt-16 md:mx-auto md:max-w-sm">
        <h1 className="text-center text-xl font-bold text-card-foreground">
          Account Registration
        </h1>
        <RegisterForm />
      </section>
    </main>
  );
}
