import { Injectable } from '@nestjs/common';
import { AuthRepository, UserAuth } from './auth.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export type CreateSessionData = {
    token: string;
    expires: string;
    userId: string;
    deviceName: string | null;
    deviceType: string | null;
    ipAddress: string | null;
    userAgent: string | null;
};

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findRegisteredUser(usernameOrEmail: string): Promise<UserAuth | null> {
        return await this.prisma.users.findFirst({
            select: {
                id: true,
                email: true,
                username: true,
                password: true,
                emailVerified: true,
                roles: true,
            },
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });
    }

    async createUserSession(data: CreateSessionData): Promise<void> {
        await this.prisma.sessions.create({
            data: {
                id: nanoid(),
                ...data,
                lastActiveAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }
}
