import BottomNavbar from "@/components/bottom-navbar";
import Header from "@/components/header";
import LoginModal from "@/components/modals/login-modal";
import { RouteSectionProps } from "@solidjs/router";

export default function MainLayout({ children }: RouteSectionProps) {
  return (
    <>
      <Header />
      <LoginModal />
      {children}
      <BottomNavbar />
    </>
  );
}
