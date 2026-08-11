import { Injectable } from '@nestjs/common';
import { LikesRepository, PostIdentifier } from './likes.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaLikesRepository implements LikesRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findPostById(postId: string): Promise<PostIdentifier | null> {
        return await this.prisma.threads.findUnique({
            select: { id: true, authorId: true, postId: true },
            where: { id: postId },
        });
    }

    async findFirst(userId: string, postId: string): Promise<{ id: string } | null> {
        return await this.prisma.likes.findFirst({
            select: { id: true },
            where: { userId, postId },
        });
    }

    async create(userId: string, postId: string): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.likes.create({
                data: {
                    id: nanoid(),
                    userId,
                    postId,
                },
            }),
            this.prisma.threads.update({
                where: { id: postId },
                data: {
                    likesCount: { increment: 1 },
                    updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                },
            }),
        ]);
    }

    async delete(id: string, postId: string): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.likes.delete({ where: { id } }),
            this.prisma.threads.update({
                where: { id: postId },
                data: {
                    likesCount: { decrement: 1 },
                    updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                },
            }),
        ]);
    }
}
