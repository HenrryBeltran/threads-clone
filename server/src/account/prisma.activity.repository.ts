import { Injectable } from '@nestjs/common';
import { Activity, ActivityRepository, ActivityType } from './activity.repository';
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
}
