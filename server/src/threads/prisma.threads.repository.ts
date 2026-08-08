import { Injectable } from '@nestjs/common';
import { ThreadsRepository, ThreadRow, CreateThreadData, ThreadForDelete } from './threads.repository';
import { PrismaService } from 'src/prisma/prisma.service';

function parseJson(value: string | null): string[] | null {
    if (value === null) return null;
    try {
        return JSON.parse(value) as string[];
    } catch {
        return null;
    }
}

type ThreadRowWithAuthor = {
    id: string;
    postId: string;
    authorId: string;
    rootId: string;
    parentId: string | null;
    text: string;
    resources: string | null;
    hashtags: string | null;
    mentions: string | null;
    likesCount: number;
    repliesCount: number;
    createdAt: string;
    updatedAt: string;
    users: { username: string; name: string; profilePictureId: string | null };
};

@Injectable()
export class PrismaThreadsRepository implements ThreadsRepository {
    constructor(private readonly prisma: PrismaService) {}

    private authorInclude = {
        users: { select: { username: true, name: true, profilePictureId: true } },
    };

    private mapRow(row: ThreadRowWithAuthor): ThreadRow {
        return {
            id: row.id,
            postId: row.postId,
            authorId: row.authorId,
            rootId: row.rootId,
            parentId: row.parentId,
            text: row.text,
            resources: parseJson(row.resources),
            hashtags: parseJson(row.hashtags),
            mentions: parseJson(row.mentions),
            likesCount: row.likesCount,
            repliesCount: row.repliesCount,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            author: row.users,
        };
    }

    async findFeed(offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { parentId: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        return rows.map((row) => this.mapRow(row));
    }

    async searchPosts(query: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { parentId: null, text: { contains: query } },
            orderBy: [{ likesCount: 'desc' }, { repliesCount: 'desc' }],
            take: limit,
            skip: offset,
        });
        return rows.map((row) => this.mapRow(row));
    }

    async findUserRootPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { authorId: userId, parentId: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        return rows.map((row) => this.mapRow(row));
    }

    async findAuthorIdByUsername(username: string): Promise<{ id: string } | null> {
        return await this.prisma.users.findFirst({
            select: { id: true },
            where: { username },
        });
    }

    async findByUrl(authorId: string, postId: string): Promise<ThreadRow | null> {
        const row = await this.prisma.threads.findFirst({
            include: this.authorInclude,
            where: { authorId, postId },
        });
        return row ? this.mapRow(row) : null;
    }

    async findById(id: string): Promise<ThreadRow | null> {
        const row = await this.prisma.threads.findUnique({
            include: this.authorInclude,
            where: { id },
        });
        return row ? this.mapRow(row) : null;
    }

    async createThread(data: CreateThreadData): Promise<void> {
        await this.prisma.threads.create({
            data: {
                id: data.id,
                postId: data.postId,
                authorId: data.authorId,
                rootId: data.rootId,
                parentId: data.parentId,
                text: data.text,
                resources: data.resources === null ? null : JSON.stringify(data.resources),
                hashtags: JSON.stringify(data.hashtags),
                mentions: JSON.stringify(data.mentions),
                likesCount: 0,
                repliesCount: 0,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            },
        });
    }

    async findParentAuthorId(parentId: string): Promise<{ authorId: string } | null> {
        return await this.prisma.threads.findFirst({
            select: { authorId: true },
            where: { id: parentId },
        });
    }

    async incrementReplyCount(threadId: string): Promise<void> {
        await this.prisma.threads.update({
            where: { id: threadId },
            data: { repliesCount: { increment: 1 } },
        });
    }

    async findByUsernames(usernames: string[]): Promise<{ id: string }[]> {
        if (usernames.length === 0) return [];
        return await this.prisma.users.findMany({
            select: { id: true },
            where: { username: { in: usernames } },
        });
    }

    async findForDelete(threadId: string): Promise<ThreadForDelete | null> {
        const row = await this.prisma.threads.findUnique({
            select: { id: true, authorId: true, resources: true, parentId: true },
            where: { id: threadId },
        });
        if (!row) return null;
        return {
            id: row.id,
            authorId: row.authorId,
            resources: parseJson(row.resources),
            parentId: row.parentId,
        };
    }

    async decrementParentReplyCount(parentId: string): Promise<void> {
        await this.prisma.threads.update({
            where: { id: parentId },
            data: { repliesCount: { decrement: 1 } },
        });
    }

    async deleteThread(threadId: string): Promise<void> {
        await this.prisma.threads.delete({ where: { id: threadId } });
    }

    async findReplies(parentId: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { parentId },
            orderBy: [{ repliesCount: 'desc' }, { likesCount: 'desc' }],
            take: limit,
            skip: offset,
        });
        return rows.map((row) => this.mapRow(row));
    }

    async findReplyPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { authorId: userId, parentId: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const rowsWithParent = rows.map((row) => this.mapRow(row));
        const parentIds = rowsWithParent.map((row) => row.parentId).filter((id): id is string => id !== null);
        if (parentIds.length === 0) return rowsWithParent;

        const parents = await this.prisma.threads.findMany({
            include: this.authorInclude,
            where: { id: { in: parentIds } },
        });
        const parentMap = new Map(parents.map((row) => [row.id, this.mapRow(row)]));

        return rowsWithParent.map((row) => ({
            ...row,
            parent: row.parentId === null ? null : (parentMap.get(row.parentId) ?? null),
        }));
    }

    async findLikedPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.likes.findMany({
            include: {
                threads: {
                    include: this.authorInclude,
                },
            },
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        return rows
            .map((row) => (row.threads ? this.mapRow(row.threads) : null))
            .filter((row): row is ThreadRow => row !== null);
    }

    async findSavedPosts(userId: string, offset: number, limit: number): Promise<ThreadRow[]> {
        const rows = await this.prisma.saved.findMany({
            include: {
                savedPost: {
                    include: this.authorInclude,
                },
            },
            where: { ownerId: userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        return rows
            .map((row) => (row.savedPost ? this.mapRow(row.savedPost) : null))
            .filter((row): row is ThreadRow => row !== null);
    }
}
