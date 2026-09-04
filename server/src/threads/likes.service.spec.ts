import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesRepository } from './likes.repository';
import { ActivityService } from 'src/account/activity.service';

describe('LikesService', () => {
    let service: LikesService;

    const mockLikesRepo = {
        findPostById: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    };

    const mockActivityService = {
        createActivity: jest.fn(),
    };

    const mockPost = {
        id: 'thread-1',
        authorId: 'author-1',
        postId: 'POST12345',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LikesService,
                { provide: LikesRepository, useValue: mockLikesRepo },
                { provide: ActivityService, useValue: mockActivityService },
            ],
        }).compile();

        service = module.get<LikesService>(LikesService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getLike', () => {
        it('should return { like: false } if not liked', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue(null);

            const result = await service.getLike('user-1', 'thread-1');

            expect(result).toEqual({ like: false });
        });

        it('should return { like: true } if liked', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue({ id: 'like-1' });

            const result = await service.getLike('user-1', 'thread-1');

            expect(result).toEqual({ like: true });
        });

        it('should throw NotFoundException if post not found', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(null);

            await expect(service.getLike('user-1', 'thread-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('likeThread', () => {
        it('should like a thread and create activity if not own', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue(null);
            mockLikesRepo.create.mockResolvedValue(undefined);

            const result = await service.likeThread('user-1', 'thread-1');

            expect(result).toEqual({ like: true });
            expect(mockLikesRepo.create).toHaveBeenCalledWith('user-1', 'thread-1');
            expect(mockActivityService.createActivity).toHaveBeenCalledWith(
                'like',
                'user-1',
                'author-1',
                expect.any(String),
                'POST12345',
            );
        });

        it('should not create activity when liking own post', async () => {
            mockLikesRepo.findPostById.mockResolvedValue({ ...mockPost, authorId: 'user-1' });
            mockLikesRepo.findFirst.mockResolvedValue(null);
            mockLikesRepo.create.mockResolvedValue(undefined);

            await service.likeThread('user-1', 'thread-1');

            expect(mockActivityService.createActivity).not.toHaveBeenCalled();
        });

        it('should return { like: true } if already liked', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue({ id: 'like-1' });

            const result = await service.likeThread('user-1', 'thread-1');

            expect(result).toEqual({ like: true });
            expect(mockLikesRepo.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if post not found', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(null);

            await expect(service.likeThread('user-1', 'thread-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('unlikeThread', () => {
        it('should unlike a thread', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue({ id: 'like-1' });
            mockLikesRepo.delete.mockResolvedValue(undefined);

            const result = await service.unlikeThread('user-1', 'thread-1');

            expect(result).toEqual({ like: false });
            expect(mockLikesRepo.delete).toHaveBeenCalledWith('like-1', 'thread-1');
        });

        it('should return { like: false } if not liked', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(mockPost);
            mockLikesRepo.findFirst.mockResolvedValue(null);

            const result = await service.unlikeThread('user-1', 'thread-1');

            expect(result).toEqual({ like: false });
            expect(mockLikesRepo.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if post not found', async () => {
            mockLikesRepo.findPostById.mockResolvedValue(null);

            await expect(service.unlikeThread('user-1', 'thread-1')).rejects.toThrow(NotFoundException);
        });
    });
});