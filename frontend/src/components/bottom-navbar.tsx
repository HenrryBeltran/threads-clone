import useScreenSize from "@/hooks/screen-size";
import { UserAccount } from "@/lib/api";
import Navbar from "./navbar";

type Props = {
  user: UserAccount | null;
};

export default function BottomNavbar({ user }: Props) {
  const screen = useScreenSize();

  return (
    <>
      {screen.width !== 0 && screen.width < 640 && (
        <Navbar username={user ? user.username : undefined} />
      )}
    </>
  );
}
