export type PostIdentifier = {
    id: string;
    authorId: string;
    postId: string;
};

export abstract class LikesRepository {
    abstract findPostById(postId: string): Promise<PostIdentifier | null>;
    abstract findFirst(userId: string, postId: string): Promise<{ id: string } | null>;
    abstract create(userId: string, postId: string): Promise<void>;
    abstract delete(id: string, postId: string): Promise<void>;
}
