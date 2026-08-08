import { Injectable } from '@nestjs/common';
import { SavedRepository } from './saved.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class PrismaSavedRepository implements SavedRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findPostById(postId: string): Promise<{ id: string } | null> {
        return await this.prisma.threads.findUnique({
            select: { id: true },
            where: { id: postId },
        });
    }

    async findFirst(ownerId: string, postId: string): Promise<{ id: string } | null> {
        return await this.prisma.saved.findFirst({
            select: { id: true },
            where: { ownerId, savedPostId: postId },
        });
    }

    async create(ownerId: string, postId: string): Promise<void> {
        await this.prisma.saved.create({
            data: { id: nanoid(), ownerId, savedPostId: postId },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.saved.delete({ where: { id } });
    }
}
