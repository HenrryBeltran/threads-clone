import { ThreadsCloneLogo } from "@/components/icons/custom-icons";
import useScreenSize from "@/hooks/screen-size";
import { UserAccount } from "@/lib/api";
import { resetInfiniteQueryPagination } from "@/lib/reset-infinity-query";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft02Icon } from "./icons/hugeicons";
import Menu from "./menu";
import Navbar from "./navbar";
import { Button } from "./ui/button";

const beyondPages = ["/search", "/liked", "/saved"];

export default function Header() {
  const screen = useScreenSize();
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<UserAccount>(["user", "account"]);

  const paths = pathname.split("/");

  const backButtonPredicate = paths.length > 2 && paths[paths.length - 1] !== "replies";
  const isOnBeyondPages = beyondPages.includes(pathname);
  let searchBackButtonPredicate = isOnBeyondPages;

  if (pathname === "/search" && search.q !== undefined) {
    searchBackButtonPredicate = true;
  } else if (pathname === "/search" && search.q === undefined) {
    searchBackButtonPredicate = false;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-20 mx-auto grid h-16 w-full grid-cols-3 grid-rows-1 items-center bg-background/85 backdrop-blur-3xl sm:h-[74px] sm:grid-cols-[1fr_max-content_1fr] md:max-w-screen-xl">
      {(backButtonPredicate || searchBackButtonPredicate) && (
        <button
          className="group ml-3 flex h-12 w-12 items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95 sm:hidden"
          onClick={() => window.history.back()}
        >
          <ArrowLeft02Icon width={26} height={26} strokeWidth={2} className="fill-none text-foreground" />
        </button>
      )}

      <Link
        to="/"
        className="group col-start-2 flex h-12 w-12 items-center justify-center justify-self-center sm:col-start-1 sm:ml-4 sm:justify-self-start"
        onClick={(e) => {
          if (pathname !== "/") {
            window.scrollTo({ top: 0, behavior: "instant" });
            return;
          }

          e.preventDefault();
          e.stopPropagation();

          if (window.scrollY < 100) {
            resetInfiniteQueryPagination(queryClient, ["main", "threads"]);
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
          <Navbar />
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
