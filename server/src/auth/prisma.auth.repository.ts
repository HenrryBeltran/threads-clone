import { Injectable } from '@nestjs/common';
import { AuthRepository, CreateSessionData, LoginAuthUser, NewUser, Session, SessionWithUser } from './auth.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findRegisteredUser(usernameOrEmail: string): Promise<LoginAuthUser | null> {
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

    async findByUsername(username: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findUnique({
            select: { id: true },
            where: { username },
        });
    }

    async findByEmail(email: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findUnique({
            select: { id: true },
            where: { email },
        });
    }

    async createUser(data: { username: string; email: string; password: string }): Promise<NewUser> {
        return await this.prisma.users.create({
            data: {
                id: nanoid(),
                ...data,
                name: '',
                bio: '',
            },
            select: {
                id: true,
                username: true,
                email: true,
                emailVerified: true,
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

    async findSessionByToken(token: string): Promise<Session | null> {
        return await this.prisma.sessions.findUnique({
            where: { token },
        });
    }

    async findSessionWithUserByToken(token: string): Promise<SessionWithUser | null> {
        const data = await this.prisma.sessions.findFirst({
            where: { token },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        name: true,
                        bio: true,
                        link: true,
                        profilePictureId: true,
                        roles: true,
                        followersCount: true,
                        followingsCount: true,
                        emailVerified: true,
                        createdAt: true,
                        updatedAt: true,
                        followers: {
                            take: 2,
                            orderBy: { createdAt: 'desc' },
                            select: {
                                follower: { select: { profilePictureId: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!data) return null;

        const { users, ...session } = data;
        const { followers, ...user } = users;

        return {
            ...session,
            user: {
                ...user,
                targetId: followers.map((follow) => ({
                    userId: { profilePictureId: follow.follower.profilePictureId },
                })),
            },
        };
    }

    async deleteSession(id: string): Promise<void> {
        await this.prisma.sessions.delete({ where: { id } });
    }

    async verifyEmail(userId: string): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                emailVerified: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }
}
