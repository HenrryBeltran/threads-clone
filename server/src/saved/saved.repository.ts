export abstract class SavedRepository {
    abstract findPostById(postId: string): Promise<{ id: string } | null>;
    abstract findFirst(ownerId: string, postId: string): Promise<{ id: string } | null>;
    abstract create(ownerId: string, postId: string): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
