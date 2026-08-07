import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { FollowRow, FollowRepository } from './follow.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaFollowRepository implements FollowRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findTargetByUsername(username: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findUnique({ select: { id: true }, where: { username } });
    }

    async findFollow(followerId: string, targetId: string): Promise<{ id: string } | null> {
        return await this.prisma.follows.findFirst({ select: { id: true }, where: { followerId, targetId } });
    }

    async createFollow(followerId: string, targetId: string): Promise<boolean> {
        try {
            await this.prisma.$transaction([
                this.prisma.follows.create({
                    data: {
                        id: nanoid(),
                        followerId,
                        targetId,
                    },
                }),
                this.prisma.users.update({
                    where: { id: followerId },
                    data: {
                        followingsCount: { increment: 1 },
                        updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                    },
                }),
                this.prisma.users.update({
                    where: { id: targetId },
                    data: {
                        followersCount: { increment: 1 },
                        updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                    },
                }),
            ]);
        } catch (e) {
            Logger.log(e);
            if ((e as { code?: string }).code === 'P2002') return false;
            throw new InternalServerErrorException('Something went wrong');
        }

        return true;
    }

    async deleteFollow(id: string, followerId: string, targetId: string): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.follows.delete({
                where: { id },
            }),
            this.prisma.users.update({
                where: { id: followerId },
                data: {
                    followingsCount: { decrement: 1 },
                    updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                },
            }),
            this.prisma.users.update({
                where: { id: targetId },
                data: {
                    followersCount: { decrement: 1 },
                    updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                },
            }),
        ]);
    }

    async findFollowers(targetId: string, userId: string, offset: number): Promise<FollowRow[]> {
        const rows = await this.prisma.follows.findMany({
            select: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profilePictureId: true,
                        _count: {
                            select: { followers: { where: { followerId: userId } } },
                        },
                    },
                },
            },
            where: { targetId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            skip: offset,
        });

        return rows.map((row) => ({
            id: row.follower.id,
            username: row.follower.username,
            name: row.follower.name,
            profilePictureId: row.follower.profilePictureId,
            followStatus: row.follower._count.followers > 0 ? 1 : 0,
        }));
    }

    async findFollowings(targetId: string, userId: string, offset: number): Promise<FollowRow[]> {
        const rows = await this.prisma.follows.findMany({
            select: {
                target: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        profilePictureId: true,
                        _count: {
                            select: { followers: { where: { followerId: userId } } },
                        },
                    },
                },
            },
            where: { followerId: targetId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            skip: offset,
        });

        return rows.map((row) => ({
            id: row.target.id,
            username: row.target.username,
            name: row.target.name,
            profilePictureId: row.target.profilePictureId,
            followStatus: row.target._count.followers > 0 ? 1 : 0,
        }));
    }
}
