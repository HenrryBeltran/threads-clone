import useScreenSize from "@/hooks/screen-size";
import Navbar from "./navbar";

export default function BottomNavbar() {
  const screen = useScreenSize();

  return <>{screen.width !== 0 && screen.width < 640 && <Navbar />}</>;
}
