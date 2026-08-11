import { Injectable } from '@nestjs/common';
import { TestAccount, UserProfile, UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async getProfileByUsername(username: string): Promise<UserProfile | null> {
        const user = await this.prisma.users.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                bio: true,
                link: true,
                profilePictureId: true,
                followersCount: true,
                followingsCount: true,
                followers: {
                    select: { follower: { select: { profilePictureId: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 2,
                },
            },
        });

        if (!user) return null;

        const { followers, ...profile } = user;

        return {
            ...profile,
            targetId: followers.map((f) => ({ userId: { profilePictureId: f.follower.profilePictureId } })),
        };
    }

    async getTestAccounts(): Promise<TestAccount[]> {
        return await this.prisma.users.findMany({
            where: { roles: 'viewer' },
            orderBy: { createdAt: 'asc' },
            select: { username: true, name: true, profilePictureId: true },
        });
    }
}
