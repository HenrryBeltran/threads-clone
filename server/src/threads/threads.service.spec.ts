import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsRepository, ThreadRow } from './threads.repository';
import { ActivityService } from 'src/account/activity.service';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { AuthUser } from 'src/auth/auth.repository';

describe('ThreadsService', () => {
    let service: ThreadsService;

    const mockThreadRepo = {
        findFeed: jest.fn(),
        searchPosts: jest.fn(),
        findUserRootPosts: jest.fn(),
        findAuthorIdByUsername: jest.fn(),
        findByUrl: jest.fn(),
        findById: jest.fn(),
        createThread: jest.fn(),
        findParentAuthorId: jest.fn(),
        incrementReplyCount: jest.fn(),
        findByUsernames: jest.fn(),
        findForDelete: jest.fn(),
        decrementParentReplyCount: jest.fn(),
        deleteThread: jest.fn(),
        findReplies: jest.fn(),
        findReplyPosts: jest.fn(),
        findLikedPosts: jest.fn(),
        findSavedPosts: jest.fn(),
    };

    const mockActivityService = {
        createActivity: jest.fn(),
    };

    const mockCloudinaryService = {
        upload: jest.fn(),
        destroy: jest.fn(),
    };

    const mockUser: AuthUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        link: null,
        profilePictureId: null,
        roles: 'user',
        followersCount: 0,
        followingsCount: 0,
        emailVerified: '2024-01-01',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        targetId: [],
    };

    const mockThreadRow: ThreadRow = {
        id: 'thread-1',
        postId: 'ABC123XYZ',
        authorId: 'user-1',
        rootId: 'root-1',
        parentId: null,
        text: 'Hello world',
        resources: null,
        hashtags: ['#hello'],
        mentions: [],
        likesCount: 0,
        repliesCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        author: { username: 'testuser', name: 'Test User', profilePictureId: null },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ThreadsService,
                { provide: ThreadsRepository, useValue: mockThreadRepo },
                { provide: ActivityService, useValue: mockActivityService },
                { provide: CloudinaryService, useValue: mockCloudinaryService },
            ],
        }).compile();

        service = module.get<ThreadsService>(ThreadsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getPosts', () => {
        it('should return feed posts', async () => {
            mockThreadRepo.findFeed.mockResolvedValue([mockThreadRow]);

            const result = await service.getPosts('0');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.findFeed).toHaveBeenCalledWith(0, 6);
        });

        it('should return empty array when no posts', async () => {
            mockThreadRepo.findFeed.mockResolvedValue([]);

            const result = await service.getPosts();

            expect(result).toEqual([]);
        });
    });

    describe('getThreadByUrl', () => {
        it('should return thread for valid username and postId', async () => {
            mockThreadRepo.findAuthorIdByUsername.mockResolvedValue({ id: 'user-1' });
            mockThreadRepo.findByUrl.mockResolvedValue(mockThreadRow);

            const result = await service.getThreadByUrl('testuser', 'ABC123XYZ');

            expect(result).toEqual(mockThreadRow);
        });

        it('should throw NotFoundException if author not found', async () => {
            mockThreadRepo.findAuthorIdByUsername.mockResolvedValue(null);

            await expect(service.getThreadByUrl('unknown', 'ABC123XYZ')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if thread not found', async () => {
            mockThreadRepo.findAuthorIdByUsername.mockResolvedValue({ id: 'user-1' });
            mockThreadRepo.findByUrl.mockResolvedValue(null);

            await expect(service.getThreadByUrl('testuser', 'NONEXISTENT')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getThreadById', () => {
        it('should return thread for valid id', async () => {
            mockThreadRepo.findById.mockResolvedValue(mockThreadRow);

            const result = await service.getThreadById('thread-1');

            expect(result).toEqual(mockThreadRow);
        });

        it('should throw NotFoundException if thread not found', async () => {
            mockThreadRepo.findById.mockResolvedValue(null);

            await expect(service.getThreadById('bad-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createThreads', () => {
        it('should create a single thread', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);

            const result = await service.createThreads(mockUser, {
                rootId: null,
                parentId: null,
                body: [{ text: 'Hello world!' }],
            });

            expect(result).toHaveLength(1);
            expect(result[0].text).toBe('Hello world!');
            expect(result[0].author).toEqual(mockThreadRow.author);
            expect(mockThreadRepo.createThread).toHaveBeenCalledTimes(1);
        });

        it('should create multiple threads in a chain', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);

            const result = await service.createThreads(mockUser, {
                rootId: null,
                parentId: null,
                body: [{ text: 'First' }, { text: 'Second' }, { text: 'Third' }],
            });

            expect(result).toHaveLength(3);
            expect(mockThreadRepo.createThread).toHaveBeenCalledTimes(3);
            expect(mockThreadRepo.incrementReplyCount).toHaveBeenCalledTimes(2);
        });

        it('should upload resources when base64 images provided', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);
            mockCloudinaryService.upload.mockResolvedValue('cloudinary-id-1');

            const result = await service.createThreads(mockUser, {
                rootId: null,
                parentId: null,
                body: [{ text: 'Check this', resources: ['data:image/jpeg;base64,/9j/4AAQ'] }],
            });

            expect(result[0].resources).toEqual(['cloudinary-id-1']);
            expect(mockCloudinaryService.upload).toHaveBeenCalledTimes(1);
        });

        it('should keep existing resource URLs without upload', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);

            const result = await service.createThreads(mockUser, {
                rootId: null,
                parentId: null,
                body: [{ text: 'Check this', resources: ['https://example.com/image.jpg'] }],
            });

            expect(result[0].resources).toEqual(['https://example.com/image.jpg']);
            expect(mockCloudinaryService.upload).not.toHaveBeenCalled();
        });

        it('should create activity when replying to another user', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);
            mockThreadRepo.findParentAuthorId.mockResolvedValue({ authorId: 'other-user' });

            await service.createThreads(mockUser, {
                rootId: null,
                parentId: 'parent-thread-id',
                body: [{ text: 'A reply' }],
            });

            expect(mockThreadRepo.incrementReplyCount).toHaveBeenCalled();
            expect(mockActivityService.createActivity).toHaveBeenCalledWith(
                'reply',
                'user-1',
                'other-user',
                expect.any(String),
                expect.any(String),
            );
        });

        it('should create mention activities', async () => {
            mockThreadRepo.createThread.mockResolvedValue(undefined);
            mockThreadRepo.findByUsernames.mockResolvedValue([{ id: 'mentioned-user' }]);

            const result = await service.createThreads(mockUser, {
                rootId: null,
                parentId: null,
                body: [{ text: 'Hello @friend' }],
            });

            expect(result).toHaveLength(1);
            expect(mockActivityService.createActivity).toHaveBeenCalledWith(
                'mention',
                'user-1',
                'mentioned-user',
                expect.any(String),
                expect.any(String),
            );
        });
    });

    describe('deleteThread', () => {
        it('should delete thread owned by user', async () => {
            mockThreadRepo.findForDelete.mockResolvedValue({
                id: 'thread-1',
                authorId: 'user-1',
                resources: null,
                parentId: null,
            });
            mockThreadRepo.deleteThread.mockResolvedValue(undefined);

            const result = await service.deleteThread('user-1', 'thread-1');

            expect(result).toEqual({ message: 'Thread delete successfully' });
            expect(mockThreadRepo.deleteThread).toHaveBeenCalledWith('thread-1');
        });

        it('should throw NotFoundException if thread not found', async () => {
            mockThreadRepo.findForDelete.mockResolvedValue(null);

            await expect(service.deleteThread('user-1', 'thread-1')).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if not owner', async () => {
            mockThreadRepo.findForDelete.mockResolvedValue({
                id: 'thread-1',
                authorId: 'other-user',
                resources: null,
                parentId: null,
            });

            await expect(service.deleteThread('user-1', 'thread-1')).rejects.toThrow(ForbiddenException);
        });

        it('should destroy resources if present', async () => {
            mockThreadRepo.findForDelete.mockResolvedValue({
                id: 'thread-1',
                authorId: 'user-1',
                resources: ['cloudinary-1', 'cloudinary-2'],
                parentId: null,
            });
            mockCloudinaryService.destroy.mockResolvedValue(undefined);
            mockThreadRepo.deleteThread.mockResolvedValue(undefined);

            await service.deleteThread('user-1', 'thread-1');

            expect(mockCloudinaryService.destroy).toHaveBeenCalledTimes(2);
            expect(mockCloudinaryService.destroy).toHaveBeenCalledWith('cloudinary-1');
            expect(mockCloudinaryService.destroy).toHaveBeenCalledWith('cloudinary-2');
        });
    });

    describe('getReplies', () => {
        it('should return replies for a thread', async () => {
            mockThreadRepo.findReplies.mockResolvedValue([mockThreadRow]);

            const result = await service.getReplies('thread-1');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.findReplies).toHaveBeenCalledWith('thread-1', 0, 6);
        });
    });

    describe('getReplyPosts', () => {
        it('should return reply posts for user', async () => {
            mockThreadRepo.findReplyPosts.mockResolvedValue([mockThreadRow]);

            const result = await service.getReplyPosts('user-1');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.findReplyPosts).toHaveBeenCalledWith('user-1', 0, 4);
        });
    });

    describe('getLikedPosts & getSavedPosts', () => {
        it('should return liked posts', async () => {
            mockThreadRepo.findLikedPosts.mockResolvedValue([mockThreadRow]);

            const result = await service.getLikedPosts('user-1');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.findLikedPosts).toHaveBeenCalledWith('user-1', 0, 6);
        });

        it('should return saved posts', async () => {
            mockThreadRepo.findSavedPosts.mockResolvedValue([mockThreadRow]);

            const result = await service.getSavedPosts('user-1');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.findSavedPosts).toHaveBeenCalledWith('user-1', 0, 6);
        });
    });

    describe('getPostsSearch', () => {
        it('should throw BadRequestException if query undefined', async () => {
            await expect(service.getPostsSearch(undefined)).rejects.toThrow(BadRequestException);
        });

        it('should return search results', async () => {
            mockThreadRepo.searchPosts.mockResolvedValue([mockThreadRow]);

            const result = await service.getPostsSearch('hello');

            expect(result).toHaveLength(1);
            expect(mockThreadRepo.searchPosts).toHaveBeenCalledWith('hello', 0, 6);
        });
    });
});