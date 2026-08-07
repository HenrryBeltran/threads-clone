import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ActivityRepository, ActivityType } from './activity.repository';

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
}
