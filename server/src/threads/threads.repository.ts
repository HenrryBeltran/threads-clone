export type ThreadAuthor = {
    username: string;
    name: string;
    profilePictureId: string | null;
};

export type ThreadRow = {
    id: string;
    postId: string;
    authorId: string;
    rootId: string;
    parentId: string | null;
    text: string;
    resources: string[] | null;
    hashtags: string[] | null;
    mentions: string[] | null;
    likesCount: number;
    repliesCount: number;
    createdAt: string;
    updatedAt: string;
    author: ThreadAuthor;
    parent?: ThreadRow | null;
};

export type CreateThreadData = {
    id: string;
    postId: string;
    authorId: string;
    rootId: string;
    parentId: string | null;
    text: string;
    resources: string[] | null;
    hashtags: string[];
    mentions: string[];
    createdAt: string;
    updatedAt: string;
};

export type ThreadForDelete = {
    id: string;
    authorId: string;
    resources: string[] | null;
    parentId: string | null;
};

export abstract class ThreadsRepository {
    abstract findFeed(offset: number, limit: number): Promise<ThreadRow[]>;
    abstract searchPosts(query: string, offset: number, limit: number): Promise<ThreadRow[]>;
    abstract findUserRootPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]>;
    abstract findAuthorIdByUsername(username: string): Promise<{ id: string } | null>;
    abstract findByUrl(authorId: string, postId: string): Promise<ThreadRow | null>;
    abstract findById(id: string): Promise<ThreadRow | null>;
    abstract createThread(data: CreateThreadData): Promise<void>;
    abstract findParentAuthorId(parentId: string): Promise<{ authorId: string } | null>;
    abstract incrementReplyCount(threadId: string): Promise<void>;
    abstract findByUsernames(usernames: string[]): Promise<{ id: string }[]>;
    abstract findForDelete(threadId: string): Promise<ThreadForDelete | null>;
    abstract decrementParentReplyCount(parentId: string): Promise<void>;
    abstract deleteThread(threadId: string): Promise<void>;
    abstract findReplies(parentId: string, offset: number, limit: number): Promise<ThreadRow[]>;
    abstract findReplyPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]>;
    abstract findLikedPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]>;
    abstract findSavedPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]>;
}
