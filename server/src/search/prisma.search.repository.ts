import { Injectable } from '@nestjs/common';
import { SearchRepository, SearchResultRow, SearchHistoryRow } from './search.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PrismaSearchRepository implements SearchRepository {
    constructor(private readonly prisma: PrismaService) {}

    async searchUsers(userId: string, keywords: string): Promise<SearchResultRow[]> {
        const transformed = keywords.split(' ').join('').toLowerCase();

        const rows = await this.prisma.users.findMany({
            where: { username: { contains: transformed } },
            select: {
                id: true,
                username: true,
                name: true,
                profilePictureId: true,
                _count: {
                    select: { followers: { where: { followerId: userId } } },
                },
            },
        });

        return rows.map((row) => ({
            id: row.id,
            username: row.username,
            name: row.name,
            profilePictureId: row.profilePictureId,
            followStatus: row._count.followers,
        }));
    }

    async findHistory(userId: string): Promise<SearchHistoryRow[]> {
        const rows = await this.prisma.search_history.findMany({
            select: {
                id: true,
                searchedUser: {
                    select: { id: true, username: true, name: true, profilePictureId: true },
                },
            },
            where: { ownerId: userId },
            orderBy: { updatedAt: 'desc' },
        });

        return rows.map((row) => ({ id: row.id, userSearch: row.searchedUser }));
    }

    async findDuplicate(ownerId: string, userSearch: string): Promise<{ id: string } | null> {
        return await this.prisma.search_history.findFirst({
            select: { id: true },
            where: { ownerId, userSearch },
        });
    }

    async touchHistory(id: string): Promise<void> {
        await this.prisma.search_history.update({
            where: { id },
            data: { updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss') },
        });
    }

    async addHistory(ownerId: string, userSearch: string): Promise<void> {
        await this.prisma.search_history.create({
            data: { id: nanoid(), ownerId, userSearch },
        });
    }

    async clearHistory(userId: string): Promise<void> {
        await this.prisma.search_history.deleteMany({ where: { ownerId: userId } });
    }

    async deleteRow(rowId: string): Promise<void> {
        await this.prisma.search_history.delete({ where: { id: rowId } });
    }
}
