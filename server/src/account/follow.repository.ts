export type FollowRow = {
    id: string;
    username: string;
    name: string;
    profilePictureId: string | null;
    followStatus: number;
};

export abstract class FollowRepository {
    abstract findTargetByUsername(username: string): Promise<{ id: string } | null>;
    abstract findFollow(followerId: string, targetId: string): Promise<{ id: string } | null>;
    abstract createFollow(followerId: string, targetId: string): Promise<boolean>;
    abstract deleteFollow(id: string, followerId: string, targetId: string): Promise<void>;
    abstract findFollowers(targetId: string, userId: string, offset: number, limit: number): Promise<FollowRow[]>;
    abstract findFollowings(targetId: string, userId: string, offset: number, limit: number): Promise<FollowRow[]>;
}
