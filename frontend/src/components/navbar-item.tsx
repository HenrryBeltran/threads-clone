import { resetInfiniteQueryPagination } from "@/lib/reset-infinity-query";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

type Props = {
  children: React.ReactNode;
  href?: string;
  pathname?: string;
  extraPathname?: string;
  username?: string;
  readMark?: boolean;
  handleOnClick?: () => void;
};

export function NavbarItem({ children, href, pathname, extraPathname, username, readMark, handleOnClick }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <div className="relative h-full transition-transform active:scale-95 sm:h-auto">
      <div className="relative h-full sm:h-auto">
        <Link
          to={href}
          className="group relative z-0 flex h-full min-h-0 min-w-0 flex-shrink basis-auto touch-manipulation items-center justify-center rounded-lg sm:mx-0.5 sm:my-1 sm:items-stretch sm:px-8 sm:py-5"
          onClick={(e) => {
            if (href && href === "/" && pathname === href) {
              e.preventDefault();
              e.stopPropagation();

              if (window.scrollY < 100) {
                resetInfiniteQueryPagination(queryClient, ["main", "threads"]);
                queryClient.invalidateQueries({ queryKey: ["main", "threads"] });
                queryClient.setQueryData(["posting", "threads"], []);
              } else {
                window.scrollTo({ top: 0, behavior: "instant" });
              }
              return;
            }

            if (username && href && href.startsWith("/@")) {
              resetInfiniteQueryPagination(queryClient, [username, "threads"]);
              queryClient.invalidateQueries({ queryKey: [username, "threads"] });
            }

            if (!username && href !== "/") {
              e.preventDefault();
              e.stopPropagation();

              navigate({ to: "/login" });
              return;
            }

            if (!href && handleOnClick) {
              e.preventDefault();
              e.stopPropagation();

              handleOnClick();
              return;
            }

            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          <div
            aria-selected={!!href && !!pathname && (pathname === href || pathname === extraPathname)}
            className="group z-10 fill-none text-neutral-400 transition-transform duration-200 [-webkit-transform:translateZ(0)] aria-selected:fill-foreground aria-selected:text-foreground dark:text-neutral-500 aria-selected:dark:text-foreground"
          >
            {children}
          </div>
          <div className="absolute left-0 top-0 z-0 m-1 h-[calc(100%-8px)] w-[calc(100%-8px)] scale-90 rounded-lg bg-transparent transition-all duration-200 group-hover:scale-100 group-hover:bg-neutral-400/20 dark:group-hover:bg-neutral-600/20 sm:m-0 sm:h-full sm:w-full" />
        </Link>
      </div>
      <div
        hidden={readMark === undefined || readMark === false}
        className="absolute bottom-2.5 left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-500 sm:top-2.5"
      />
    </div>
  );
}
