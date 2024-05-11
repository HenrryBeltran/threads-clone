import useScreenSize from "@/hooks/screen-size";
import { AuthUser } from "@/lib/api";
import Navbar from "./navbar";

type Props = {
  auth?: AuthUser;
};

export default function BottomNavbar({ auth }: Props) {
  const screen = useScreenSize();

  return (
    <>
      {screen.width !== 0 && screen.width < 640 && (
        <Navbar username={auth?.user.username} />
      )}
    </>
  );
}
