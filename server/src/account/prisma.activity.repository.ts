import { Injectable } from '@nestjs/common';
import { Activity, ActivityRepository, ActivityRow, ActivityType } from './activity.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaActivityRepository implements ActivityRepository {
    constructor(private readonly prisma: PrismaService) {}
    async findFirst(
        senderId: string,
        receiverId: string,
        type: ActivityType,
        threadPostId: string | null = null,
    ): Promise<{ id: string } | null> {
        return await this.prisma.activities.findFirst({
            select: { id: true },
            where: { senderId, receiverId, type, ...(threadPostId === null ? {} : { threadPostId }) },
        });
    }

    async setRead(id: string): Promise<void> {
        await this.prisma.activities.update({
            where: { id },
            data: {
                readStatus: 1,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async setUnread(id: string): Promise<void> {
        await this.prisma.activities.update({
            where: { id },
            data: {
                readStatus: 0,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async create({ senderId, receiverId, message, type, threadPostId }: Activity): Promise<void> {
        await this.prisma.activities.create({
            data: { id: nanoid(), senderId, receiverId, message, type, threadPostId },
        });
    }

    async getAll(userId: string, offset: number, limit: number): Promise<ActivityRow[]> {
        const rows = await this.prisma.activities.findMany({
            include: {
                sender: { select: { username: true, profilePictureId: true } },
                receiver: { select: { username: true, profilePictureId: true } },
            },
            where: { receiverId: userId },
            orderBy: [{ readStatus: 'asc' }, { updatedAt: 'desc' }],
            take: limit,
            skip: offset,
        });

        return rows.map((row) => {
            const { senderId, receiverId, sender, receiver, type, readStatus, ...activities } = row;
            return {
                ...activities,
                readStatus: readStatus !== 0,
                type: type as ActivityType,
                sender: senderId,
                receiver: receiverId,
                senderInfo: sender,
                receiverInfo: receiver,
            };
        });
    }

    async getUnread(userId: string): Promise<{ readStatus: number | null } | null> {
        return await this.prisma.activities.findFirst({
            select: { readStatus: true },
            where: { receiverId: userId, readStatus: 0 },
        });
    }

    async getAllUnread(userId: string): Promise<{ id: string }[]> {
        return await this.prisma.activities.findMany({
            select: { id: true },
            where: { receiverId: userId, readStatus: 0 },
        });
    }

    async markAsRead(userId: string): Promise<void> {
        await this.prisma.activities.updateMany({
            where: { receiverId: userId, readStatus: 0 },
            data: {
                readStatus: 1,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }
}
