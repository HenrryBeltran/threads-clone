import { Injectable } from '@nestjs/common';
import { AccountRepository, Profile, VerifyEmailRecord } from './account.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findPasswordById(userId: string): Promise<{ password: string } | null> {
        return await this.prisma.users.findUnique({
            select: { password: true },
            where: { id: userId },
        });
    }

    async updateProfile(userId: string, profileData: Profile): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                ...profileData,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async updateUsername(userId: string, username: string): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                username,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async updateEmail(userId: string, newEmail: string): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                email: newEmail,
                emailVerified: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async updatePassword(userId: string, newPassword: string): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                password: newPassword,
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            },
        });
    }

    async deleteUser(userId: string): Promise<void> {
        await this.prisma.users.delete({ where: { id: userId } });
    }

    async updateCounts(userId: string, followersCount: number, followingsCount: number): Promise<void> {
        await this.prisma.users.update({
            where: { id: userId },
            data: { followersCount, followingsCount },
        });
    }

    async countFollowers(userId: string): Promise<number> {
        return await this.prisma.follows.count({ where: { targetId: userId } });
    }

    async countFollowings(userId: string): Promise<number> {
        return await this.prisma.follows.count({ where: { followerId: userId } });
    }

    async findIdByEmail(email: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findUnique({
            select: { id: true },
            where: { email },
        });
    }

    async findIdByUsername(username: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findUnique({
            select: { id: true },
            where: { username },
        });
    }

    async findVerifyEmailByOldEmail(oldEmail: string): Promise<{ id: string } | null> {
        return await this.prisma.verify_email.findFirst({
            select: { id: true },
            where: { oldEmail },
        });
    }

    async findVerifyEmailByTokenAndOldEmail(token: string, oldEmail: string): Promise<VerifyEmailRecord | null> {
        return await this.prisma.verify_email.findFirst({
            select: { id: true, newEmail: true, expires: true },
            where: { token, oldEmail },
        });
    }

    async createVerifyEmail(data: {
        id: string;
        oldEmail: string;
        newEmail: string;
        expires: string;
        token: string;
    }): Promise<void> {
        await this.prisma.verify_email.create({ data });
    }

    async updateVerifyEmail(id: string, data: { newEmail: string; expires: string; token: string }): Promise<void> {
        await this.prisma.verify_email.update({ where: { id }, data });
    }

    async deleteVerifyEmail(id: string): Promise<void> {
        await this.prisma.verify_email.delete({ where: { id } });
    }
}
