import { CompleteProfileForm } from "@/components/forms/complete-profile-form";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/account/complete-profile")({
  component: AccountCompleteProfile,
});

function AccountCompleteProfile() {
  return (
    <main>
      <section className="min-h-svh space-y-8 px-6 pt-12 sm:mx-auto sm:max-w-sm sm:px-0">
        <h1 className="text-center text-xl font-bold text-card-foreground">Complete your profile info</h1>
        <CompleteProfileForm />
      </section>
    </main>
  );
}
