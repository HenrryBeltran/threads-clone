import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { LikesRepository, PostIdentifier } from './likes.repository';
import { ActivityService } from 'src/account/activity.service';

@Injectable()
export class LikesService {
    constructor(
        private readonly repo: LikesRepository,
        private readonly activityService: ActivityService,
    ) {}

    async getLike(userId: string, postId: string): Promise<{ like: boolean }> {
        let post: { id: string } | null = null;
        try {
            post = await this.repo.findPostById(postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!post) throw new NotFoundException({ message: 'Thread not found.' });

        let foundLike: { id: string } | null = null;
        try {
            foundLike = await this.repo.findFirst(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!foundLike) return { like: false };

        return { like: true };
    }

    async likeThread(userId: string, postId: string): Promise<{ like: boolean }> {
        let post: PostIdentifier | null = null;
        try {
            post = await this.repo.findPostById(postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!post) throw new NotFoundException({ message: 'Thread not found.' });

        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findFirst(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (duplicate) return { like: true };

        try {
            await this.repo.create(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (userId !== post.authorId) {
            try {
                await this.activityService.createActivity(
                    'like',
                    userId,
                    post.authorId,
                    'Liked your thread',
                    post.postId,
                );
            } catch (e) {
                Logger.log(e);
            }
        }

        return { like: true };
    }

    async unlikeThread(userId: string, postId: string): Promise<{ like: boolean }> {
        let post: PostIdentifier | null = null;
        try {
            post = await this.repo.findPostById(postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!post) throw new NotFoundException({ message: 'Thread not found.' });

        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findFirst(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!duplicate) return { like: false };

        try {
            await this.repo.delete(duplicate.id, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { like: false };
    }
}
