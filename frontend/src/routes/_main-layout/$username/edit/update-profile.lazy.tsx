import { ProfileForm } from "@/components/forms/profile-form";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/$username/edit/update-profile")({
  component: UpdateProfile,
});

function UpdateProfile() {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-[620px] space-y-3 px-6">
        <ProfileForm />
      </div>
    </div>
  );
}
