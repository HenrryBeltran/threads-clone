import { NotFound } from "@/components/not-found";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_main-layout/_profile-layout/$username/replies")({
  component: ProfileReplies,
  notFoundComponent: NotFound,
});

function ProfileReplies() {
  /// TODO: Here goes the profile replies
  /// TODO: Add the tabs to navigate
  return <div className="flex min-h-screen items-center justify-center">Hello /_main-layout/$username/replies!</div>;
}
