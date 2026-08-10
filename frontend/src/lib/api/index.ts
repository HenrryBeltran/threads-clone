import { safeTry } from "@/lib/safe-try";
import { queryOptions } from "@tanstack/react-query";
import { get } from "./client";

export type UserAccount = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  link: string | null;
  profilePictureId: string | null;
  roles: string;
  followersCount: number;
  followingsCount: number;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  targetId: { userId: { profilePictureId: string | null } }[];
};

export type ThreadRow = {
  id: string;
  postId: string;
  rootId: string | null;
  parentId: string | null;
  authorId: string;
  author: { name: string; username: string; profilePictureId: string | null };
  text: string;
  resources: string[] | null;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
};

export type ActivityResult = {
  id: string;
  message: string;
  type: "mention" | "reply" | "follow" | "like";
  sender: string;
  receiver: string;
  readStatus: boolean | null;
  threadPostId: string | null;
  senderInfo: {
    username: string;
    profilePictureId: string | null;
  };
  receiverInfo: {
    username: string;
    profilePictureId: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export async function getUserAccount(): Promise<UserAccount | null> {
  const res = await safeTry(get<UserAccount>("/account/user"));

  if (res.error) {
    console.error(res.error.message);
    return null;
  }

  if (!res.result.ok) {
    console.error("~ Server error");
    return null;
  }

  return res.result.data;
}

export const userAccountQueryOptions = queryOptions({
  queryKey: ["user", "account"],
  queryFn: getUserAccount,
  retry: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: Infinity,
});
