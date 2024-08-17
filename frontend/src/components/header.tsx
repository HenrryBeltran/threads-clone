import { ThreadsCloneLogo } from "@/components/icons/custom-icons";
import useScreenSize from "@/hooks/screen-size";
import { UserAccount } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import Menu from "./menu";
import Navbar from "./navbar";
import { PostsPages } from "./threads-infinite-scroll";
import { Button } from "./ui/button";

type Props = {
  user: UserAccount | null;
};

export default function Header({ user }: Props) {
  const screen = useScreenSize();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function resetInfiniteQueryPagination() {
    queryClient.setQueryData<PostsPages>(["main", "threads"], (oldData) => {
      if (!oldData) return undefined;
      return {
        pages: [],
        pageParams: oldData.pageParams.slice(0, 1),
      };
    });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-10 mx-auto grid h-16 w-full grid-cols-3 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:h-[74px] sm:grid-cols-[1fr_max-content_1fr] md:max-w-screen-xl">
      <Link
        to="/"
        className="group col-start-2 ml-4 flex h-12 w-12 items-center justify-center justify-self-center sm:col-start-1 sm:justify-self-start"
        onClick={(e) => {
          if (pathname !== "/") {
            window.scrollTo({ top: 0, behavior: "instant" });
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          if (window.scrollY < 100) {
            resetInfiniteQueryPagination();
            queryClient.invalidateQueries({ queryKey: ["main", "threads"] });
            queryClient.setQueryData(["posting", "threads"], []);
          } else {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
        }}
      >
        <ThreadsCloneLogo className="h-8 w-8 transition duration-200 group-hover:scale-110 group-active:scale-100 dark:fill-white" />
      </Link>
      {screen.width > 640 && (
        <div className="w-full max-w-lg px-16 md:max-w-screen-sm">
          <Navbar username={user ? user.username : undefined} />
        </div>
      )}
      {user ? (
        <Menu />
      ) : (
        <div className="mr-5 flex justify-end">
          <Button
            className="h-9 w-fit rounded-xl text-base leading-none tracking-tight transition active:scale-95"
            onClick={() => navigate({ to: "/login" })}
          >
            Log in
          </Button>
        </div>
      )}
    </header>
  );
}
