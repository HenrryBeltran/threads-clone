import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SavedService } from './saved.service';
import { SavedRepository } from './saved.repository';

describe('SavedService', () => {
    let service: SavedService;

    const mockRepo = {
        findPostById: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    };

    const mockPost = { id: 'thread-1' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SavedService, { provide: SavedRepository, useValue: mockRepo }],
        }).compile();

        service = module.get<SavedService>(SavedService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSave', () => {
        it('should return { saved: false } if not saved', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue(null);

            const result = await service.getSave('user-1', 'thread-1');

            expect(result).toEqual({ saved: false });
        });

        it('should return { saved: true } if saved', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue({ id: 'save-1' });

            const result = await service.getSave('user-1', 'thread-1');

            expect(result).toEqual({ saved: true });
        });

        it('should throw NotFoundException if post not found', async () => {
            mockRepo.findPostById.mockResolvedValue(null);

            await expect(service.getSave('user-1', 'thread-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('saveThread', () => {
        it('should save a thread', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue(null);
            mockRepo.create.mockResolvedValue(undefined);

            const result = await service.saveThread('user-1', 'thread-1');

            expect(result).toEqual({ saved: true });
            expect(mockRepo.create).toHaveBeenCalledWith('user-1', 'thread-1');
        });

        it('should return { saved: true } if already saved', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue({ id: 'save-1' });

            const result = await service.saveThread('user-1', 'thread-1');

            expect(result).toEqual({ saved: true });
            expect(mockRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('unsaveThread', () => {
        it('should unsave a thread', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue({ id: 'save-1' });
            mockRepo.delete.mockResolvedValue(undefined);

            const result = await service.unsaveThread('user-1', 'thread-1');

            expect(result).toEqual({ saved: false });
            expect(mockRepo.delete).toHaveBeenCalledWith('save-1');
        });

        it('should return { saved: false } if not saved', async () => {
            mockRepo.findPostById.mockResolvedValue(mockPost);
            mockRepo.findFirst.mockResolvedValue(null);

            const result = await service.unsaveThread('user-1', 'thread-1');

            expect(result).toEqual({ saved: false });
            expect(mockRepo.delete).not.toHaveBeenCalled();
        });
    });
});