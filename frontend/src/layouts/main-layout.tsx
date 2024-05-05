import Header from "@/components/header";
import { RouteSectionProps } from "@solidjs/router";

export default function MainLayout({ children }: RouteSectionProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
