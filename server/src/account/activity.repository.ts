export type ActivityType = 'mention' | 'reply' | 'follow' | 'like';

export type Activity = {
    senderId: string;
    receiverId: string;
    message: string;
    type: ActivityType;
    threadPostId: string | null;
};

export type ActivityRow = {
    id: string;
    message: string;
    type: 'mention' | 'reply' | 'follow' | 'like';
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

export abstract class ActivityRepository {
    abstract findFirst(
        senderId: string,
        receiverId: string,
        type: ActivityType,
        threadPostId: string | null,
    ): Promise<{ id: string } | null>;
    abstract setUnread(id: string): Promise<void>;
    abstract create({ senderId, receiverId, message, type, threadPostId }: Activity): Promise<void>;
    abstract getAll(userId: string, offset: number, limit: number): Promise<ActivityRow[]>;
    abstract getUnread(userId: string): Promise<{ readStatus: number | null } | null>;
    abstract getAllUnread(userId: string): Promise<{ id: string }[]>;
    abstract markAsRead(userId: string): Promise<void>;
}
