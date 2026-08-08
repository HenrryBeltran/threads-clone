import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ThreadsRepository, ThreadRow, ThreadAuthor, CreateThreadData } from './threads.repository';
import { AuthUser } from 'src/auth/auth.repository';
import { CreateThreadDto, CreateThreadBody } from './dto/create-thread.dto';
import { ActivityService } from 'src/account/activity.service';
import { CloudinaryService } from 'src/common/cloudinary.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { customAlphabet, nanoid } from 'nanoid';

dayjs.extend(utc);

const shortNanoId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 11);

function filterHashtagAndMentions(text: string, char: '#' | '@'): string[] {
    const splitSpaces = text.split(/[\s]/).filter((s) => s.startsWith(char));
    const splitChars = splitSpaces
        .join('')
        .split(char)
        .filter((s) => s.length > 1);
    const reduceDuplicates = [...new Set(splitChars)];
    const words = reduceDuplicates.map((word) => `${char}${word.toLowerCase()}`);

    return words;
}

@Injectable()
export class ThreadsService {
    constructor(
        private readonly repo: ThreadsRepository,
        private readonly activityService: ActivityService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async getPosts(page?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findFeed(page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getPostsSearch(q?: string, page?: string): Promise<ThreadRow[]> {
        if (q === undefined) {
            throw new BadRequestException({ message: 'Query is undefined.' });
        }

        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.searchPosts(q, page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getPostsByUser(userId: string, page?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findUserRootPosts(userId, page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getThreadByUrl(username: string, postId: string): Promise<ThreadRow> {
        let author: { id: string } | null = null;
        try {
            author = await this.repo.findAuthorIdByUsername(username);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!author) throw new NotFoundException({ message: 'Thread author not found.' });

        let thread: ThreadRow | null = null;
        try {
            thread = await this.repo.findByUrl(author.id, postId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!thread) throw new NotFoundException({ message: 'Thread not found.' });

        return thread;
    }

    async getThreadById(id: string): Promise<ThreadRow> {
        let thread: ThreadRow | null = null;
        try {
            thread = await this.repo.findById(id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!thread) throw new NotFoundException({ message: 'Thread not found.' });

        return thread;
    }

    async createThreads(user: AuthUser, dto: CreateThreadDto): Promise<ThreadRow[]> {
        const newId = nanoid();
        const rootId = dto.rootId !== null ? dto.rootId : newId;

        const author: ThreadAuthor = {
            username: user.username,
            name: user.name,
            profilePictureId: user.profilePictureId,
        };

        let previousId = '';
        const allThreads: ThreadRow[] = [];

        for (let i = 0; i < dto.body.length; i++) {
            const post = dto.body[i];

            const hashtags = filterHashtagAndMentions(post.text, '#');
            const mentions = filterHashtagAndMentions(post.text, '@');

            const resources = await this.resolveResources(post);

            const id = i === 0 ? newId : nanoid();

            let parentId: string | null = null;
            if (i === 0 && dto.parentId !== null) {
                parentId = dto.parentId;
            }
            if (i > 0) {
                parentId = previousId;
            }

            const postId = shortNanoId();

            const data: CreateThreadData = {
                id,
                postId,
                authorId: user.id,
                rootId,
                parentId,
                text: post.text,
                resources,
                hashtags,
                mentions,
                createdAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
                updatedAt: dayjs.utc().format('YYYY-MM-DD HH:mm:ss'),
            };

            try {
                await this.repo.createThread(data);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }

            allThreads.push({
                ...data,
                likesCount: 0,
                repliesCount: 0,
                author,
            });

            if (dto.parentId !== null && i === 0) {
                try {
                    await this.repo.incrementReplyCount(dto.parentId);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }

                let parentAuthor: { authorId: string } | null = null;
                try {
                    parentAuthor = await this.repo.findParentAuthorId(dto.parentId);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }

                if (parentAuthor !== null && parentAuthor.authorId !== user.id) {
                    try {
                        await this.activityService.createActivity(
                            'reply',
                            user.id,
                            parentAuthor.authorId,
                            'Reply to your thread',
                            postId,
                        );
                    } catch (e) {
                        Logger.log(e);
                    }
                }
            }

            if (i > 0) {
                try {
                    await this.repo.incrementReplyCount(previousId);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }
            }

            if (mentions.length > 0) {
                const usernames = mentions.map((mention) => mention.slice(1));
                let mentionedUsers: { id: string }[] = [];
                try {
                    mentionedUsers = await this.repo.findByUsernames(usernames);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }

                for (const mentionedUser of mentionedUsers) {
                    let message = 'Mention you in a thread';
                    if (i > 0) {
                        message = 'Mention you in a comment';
                    } else if (i === 0 && dto.parentId !== null) {
                        message = 'Mention you in a comment';
                    }

                    try {
                        await this.activityService.createActivity(
                            'mention',
                            user.id,
                            mentionedUser.id,
                            message,
                            postId,
                        );
                    } catch (e) {
                        Logger.log(e);
                    }
                }
            }

            previousId = id;
        }

        return allThreads;
    }

    private async resolveResources(post: CreateThreadBody): Promise<string[] | null> {
        const input = post.resources ?? null;
        if (input === null || input.length === 0) return null;
        if (input[0].includes('data:image/jpeg;base64,')) {
            try {
                return await Promise.all(input.map((image) => this.cloudinaryService.upload(image, '/threads')));
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        }
        return input;
    }

    async deleteThread(userId: string, threadId: string): Promise<{ message: string }> {
        let thread: {
            id: string;
            authorId: string;
            resources: string[] | null;
            parentId: string | null;
        } | null = null;
        try {
            thread = await this.repo.findForDelete(threadId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!thread) throw new NotFoundException({ message: 'Thread not found.' });

        if (userId !== thread.authorId) {
            throw new ForbiddenException({ message: 'Action not allowed.' });
        }

        if (thread.resources !== null && thread.resources.length > 0) {
            try {
                for (const resource of thread.resources) {
                    await this.cloudinaryService.destroy(resource);
                }
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        }

        if (thread.parentId !== null) {
            let parent: { authorId: string } | null = null;
            try {
                parent = await this.repo.findParentAuthorId(thread.parentId);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }

            if (parent !== null) {
                try {
                    await this.repo.decrementParentReplyCount(thread.parentId);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }
            }
        }

        try {
            await this.repo.deleteThread(threadId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { message: 'Thread delete successfully' };
    }

    async getReplies(parentId: string, offset?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findReplies(parentId, offset ? Number(offset) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getReplyPosts(userId: string, page?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findReplyPosts(userId, page ? Number(page) * 4 : 0, 4);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getLikedPosts(userId: string, page?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findLikedPosts(userId, page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }

    async getSavedPosts(userId: string, page?: string): Promise<ThreadRow[]> {
        let rows: ThreadRow[] = [];
        try {
            rows = await this.repo.findSavedPosts(userId, page ? Number(page) * 6 : 0, 6);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        return rows;
    }
}
