import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { FollowRepository, FollowRow } from './follow.repository';
import { AuthUser } from 'src/auth/auth.repository';
import { ActivityService } from './activity.service';

@Injectable()
export class AccountProfileService {
    constructor(
        private readonly repo: FollowRepository,
        private readonly activityService: ActivityService,
    ) {}

    async getFollow(user: AuthUser, targetUsername: string): Promise<{ follow: boolean }> {
        let target: { id: string } | null = null;
        try {
            target = await this.repo.findTargetByUsername(targetUsername);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!target) throw new NotFoundException({ message: 'Current profile not found.' });

        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findFollow(user.id, target.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!duplicate) return { follow: false };

        return { follow: true };
    }

    async followUser(user: AuthUser, targetUsername: string): Promise<{ follow: boolean }> {
        let target: { id: string } | null = null;
        try {
            target = await this.repo.findTargetByUsername(targetUsername);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!target) throw new NotFoundException({ message: 'Target not found.' });

        let created = false;
        try {
            created = await this.repo.createFollow(user.id, target.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!created) return { follow: true };

        let isFollowingMe: { id: string } | null = null;
        try {
            isFollowingMe = await this.repo.findFollow(target.id, user.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.activityService.createActivity(
                'follow',
                user.id,
                target.id,
                !isFollowingMe ? 'Followed you' : 'Followed you back',
            );
        } catch (e) {
            Logger.log(e);
        }

        return { follow: true };
    }

    async unfollowUser(user: AuthUser, targetUsername: string): Promise<{ follow: boolean }> {
        let target: { id: string } | null = null;
        try {
            target = await this.repo.findTargetByUsername(targetUsername);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!target) throw new NotFoundException({ message: 'Target not found.' });

        let existing: { id: string } | null = null;
        try {
            existing = await this.repo.findFollow(user.id, target.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!existing) return { follow: true };

        try {
            await this.repo.deleteFollow(existing.id, user.id, target.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { follow: false };
    }

    async getFollowers(user: AuthUser, targetId: string, page?: string): Promise<FollowRow[]> {
        let rows: FollowRow[] = [];
        try {
            rows = await this.repo.findFollowers(targetId, user.id, page ? Number(page) * 10 : 0);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getFollowings(user: AuthUser, targetId: string, page?: string): Promise<FollowRow[]> {
        let rows: FollowRow[] = [];
        try {
            rows = await this.repo.findFollowings(targetId, user.id, page ? Number(page) * 10 : 0);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }
}
