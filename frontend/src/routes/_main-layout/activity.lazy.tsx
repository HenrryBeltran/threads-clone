import { UserImage } from "@/components/user-image";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { ActivityResult } from "@server/routes/account/activity";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { Fragment, useEffect } from "react";
import { useInView } from "react-intersection-observer";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1m",
    MM: "%dm",
    y: "1y",
    yy: "%dy",
  },
});

export const Route = createLazyFileRoute("/_main-layout/activity")({
  component: Activity,
});

async function getAllActivities({ pageParam }: { pageParam: number }) {
  const res = await safeTry(api.account.activity.all.$get({ query: { page: pageParam.toString() } }));

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

async function markAsRead() {
  const res = await safeTry(api.account.activity["mark-as-read"].$post());

  if (res.error) throw new Error("Something went wrong");
  if (!res.result.ok) throw new Error("Something went wrong");

  const { error, result } = await safeTry(res.result.json());

  if (error) throw new Error("Something went wrong");

  return result;
}

function Activity() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["activity"],
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    },
  });
  const activities = useInfiniteQuery({
    queryKey: ["activity"],
    queryFn: getAllActivities,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { ref: scrollRef, inView: inViewScroll } = useInView();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inViewScroll) {
      activities.fetchNextPage();
    }
  }, [inViewScroll, activities.status]);

  useEffect(() => {
    if (inView) {
      mutation.mutate();
    }
  }, [inView]);

  return (
    <div className="pt-[74px]">
      <div ref={ref} className="mx-auto max-w-[620px] px-6 pb-8">
        {activities.data && activities.data.pages[0].filter((u) => u.readStatus === false).length > 0 && (
          <h2 className="mt-2 font-semibold">New</h2>
        )}
        {activities.data &&
          activities.data.pages.map((group) =>
            group
              .filter((unread) => unread.readStatus === false)
              .map((unread, i) => (
                <Fragment key={i}>
                  <ActivityRow data={unread} />
                  <div className="ml-14 h-px w-[calc(100%-44px-12px)] bg-muted-foreground/30" />
                </Fragment>
              )),
          )}
        {activities.data && activities.data.pages[0].filter((r) => r.readStatus === true).length > 0 && (
          <h2 className="mt-6 font-semibold">Activities</h2>
        )}
        <div className="mt-3">
          {activities.data &&
            activities.data.pages.map((group) =>
              group
                .filter((read) => read.readStatus === true)
                .map((read, i) => (
                  <Fragment key={i}>
                    <ActivityRow data={read} />
                    <div className="ml-14 h-px w-[calc(100%-44px-12px)] bg-muted-foreground/30" />
                  </Fragment>
                )),
            )}
          <div ref={scrollRef} className="w-ful h-px w-full" />
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ data }: { data: ActivityResult }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 py-3">
      <Link
        to={`/@${data.senderInfo.username}`}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
        className="min-h-11 min-w-11"
      >
        <UserImage
          username={data.senderInfo.username}
          profilePictureId={data.senderInfo.profilePictureId}
          width={48}
          height={48}
          fetchPriority="high"
          loading="lazy"
          className="h-11 w-11"
        />
      </Link>
      <div
        className="w-full cursor-pointer"
        onClick={() => {
          if (data.type === "follow") {
            navigate({ to: `/@${data.senderInfo.username}` });
          } else if (data.type === "like") {
            navigate({ to: `/@${data.receiverInfo.username}/post/${data.threadPostId}` });
          } else {
            navigate({ to: `/@${data.senderInfo.username}/post/${data.threadPostId}` });
          }
        }}
      >
        <div className="space-x-3">
          <strong>{data.senderInfo.username} </strong>
          <span className="text-muted-foreground">{dayjs.utc(data.updatedAt).local().fromNow(true)}</span>
        </div>
        <span className="text-muted-foreground">{data.message}</span>
      </div>
    </div>
  );
}
