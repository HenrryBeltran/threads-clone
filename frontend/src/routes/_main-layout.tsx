import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";
import { NotFound } from "@/components/not-found";
import { UserAccount } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main-layout")({
  component: MainLayout,
  notFoundComponent: NotFound,
});

function MainLayout() {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount | null>(["user", "account"]);

  return (
    <>
      <Header user={user ?? null} />
      <Outlet />
      <BottomNavbar user={user ?? null} />
    </>
  );
}
