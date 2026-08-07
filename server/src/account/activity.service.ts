import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ActivityRepository, ActivityRow, ActivityType } from './activity.repository';

@Injectable()
export class ActivityService {
    constructor(private readonly repo: ActivityRepository) {}

    async createActivity(
        type: ActivityType,
        senderId: string,
        receiverId: string,
        message: string,
        threadPostId: string | null = null,
    ): Promise<void> {
        let activity: { id: string } | null = null;
        try {
            activity = await this.repo.findFirst(senderId, receiverId, type, threadPostId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (activity) {
            try {
                await this.repo.setUnread(activity.id);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
            return;
        }

        try {
            await this.repo.create({ senderId, receiverId, message, type, threadPostId });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return;
    }

    async getAll(userId: string, page?: string): Promise<ActivityRow[]> {
        let rows: ActivityRow[] = [];
        try {
            rows = await this.repo.getAll(userId, page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getUnread(userId: string): Promise<{ unread: boolean }> {
        let result: { readStatus: number | null } | null = null;
        try {
            result = await this.repo.getUnread(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!result) return { unread: false };
        return { unread: true };
    }

    async markAsRead(userId: string): Promise<{ message: string }> {
        let rows: { id: string }[] = [];
        try {
            rows = await this.repo.getAllUnread(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (rows.length === 0) return { message: 'Already read' };

        try {
            await this.repo.markAsRead(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { message: 'Read' };
    }
}
