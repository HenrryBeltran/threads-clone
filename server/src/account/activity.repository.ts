export type ActivityType = 'mention' | 'reply' | 'follow' | 'like';

export type Activity = {
    senderId: string;
    receiverId: string;
    message: string;
    type: ActivityType;
    threadPostId: string | null;
};

export abstract class ActivityRepository {
    abstract findFirst(
        senderId: string,
        receiverId: string,
        type: ActivityType,
        threadPostId: string | null,
    ): Promise<{ id: string } | null>;
    abstract setUnread(id: string): Promise<void>;
    abstract create({ senderId, receiverId, message, type, threadPostId }: Activity): Promise<void>;
}
