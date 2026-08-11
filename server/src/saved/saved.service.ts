import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { SavedRepository } from './saved.repository';

@Injectable()
export class SavedService {
    constructor(private readonly repo: SavedRepository) {}

    async getSave(userId: string, postId: string): Promise<{ saved: boolean }> {
        let post: { id: string } | null = null;
        try {
            post = await this.repo.findPostById(postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!post) throw new NotFoundException({ message: 'Thread not found.' });

        let foundSave: { id: string } | null = null;
        try {
            foundSave = await this.repo.findFirst(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!foundSave) return { saved: false };

        return { saved: true };
    }

    async saveThread(userId: string, postId: string): Promise<{ saved: boolean }> {
        let post: { id: string } | null = null;
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

        if (duplicate) return { saved: true };

        try {
            await this.repo.create(userId, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { saved: true };
    }

    async unsaveThread(userId: string, postId: string): Promise<{ saved: boolean }> {
        let post: { id: string } | null = null;
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

        if (!duplicate) return { saved: false };

        try {
            await this.repo.delete(duplicate.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { saved: false };
    }
}
