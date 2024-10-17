import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";
import { NotFound } from "@/components/not-found";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main-layout")({
  component: MainLayout,
  notFoundComponent: NotFound,
});

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <BottomNavbar />
    </>
  );
}
