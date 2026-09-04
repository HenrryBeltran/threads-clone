import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { ActivityRepository, ActivityRow } from './activity.repository';

describe('ActivityService', () => {
    let service: ActivityService;

    const mockRepo = {
        findFirst: jest.fn(),
        setUnread: jest.fn(),
        create: jest.fn(),
        getAll: jest.fn(),
        getUnread: jest.fn(),
        getAllUnread: jest.fn(),
        markAsRead: jest.fn(),
    };

    const mockActivityRow: ActivityRow = {
        id: 'activity-1',
        message: 'Followed you',
        type: 'follow',
        sender: 'sender-1',
        receiver: 'receiver-1',
        readStatus: null,
        threadPostId: null,
        senderInfo: { username: 'sender', profilePictureId: null },
        receiverInfo: { username: 'receiver', profilePictureId: null },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityService,
                { provide: ActivityRepository, useValue: mockRepo },
            ],
        }).compile();

        service = module.get<ActivityService>(ActivityService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createActivity', () => {
        it('should create new activity if none exists', async () => {
            mockRepo.findFirst.mockResolvedValue(null);
            mockRepo.create.mockResolvedValue(undefined);

            await service.createActivity('follow', 'sender-1', 'receiver-1', 'Followed you');

            expect(mockRepo.create).toHaveBeenCalledWith({
                senderId: 'sender-1',
                receiverId: 'receiver-1',
                message: 'Followed you',
                type: 'follow',
                threadPostId: null,
            });
            expect(mockRepo.setUnread).not.toHaveBeenCalled();
        });

        it('should set existing activity as unread if it already exists', async () => {
            mockRepo.findFirst.mockResolvedValue({ id: 'activity-1' });
            mockRepo.setUnread.mockResolvedValue(undefined);

            await service.createActivity('like', 'sender-1', 'receiver-1', 'Liked your thread', 'post-1');

            expect(mockRepo.setUnread).toHaveBeenCalledWith('activity-1');
            expect(mockRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('getAll', () => {
        it('should return activities for a user', async () => {
            mockRepo.getAll.mockResolvedValue([mockActivityRow]);

            const result = await service.getAll('user-1');

            expect(result).toEqual([mockActivityRow]);
            expect(mockRepo.getAll).toHaveBeenCalledWith('user-1', 0, 6);
        });
    });

    describe('getUnread', () => {
        it('should return { unread: true } when there are unread', async () => {
            mockRepo.getUnread.mockResolvedValue({ readStatus: 1 });

            const result = await service.getUnread('user-1');

            expect(result).toEqual({ unread: true });
        });

        it('should return { unread: false } when no unread', async () => {
            mockRepo.getUnread.mockResolvedValue(null);

            const result = await service.getUnread('user-1');

            expect(result).toEqual({ unread: false });
        });
    });

    describe('markAsRead', () => {
        it('should mark unread as read', async () => {
            mockRepo.getAllUnread.mockResolvedValue([{ id: 'activity-1' }]);
            mockRepo.markAsRead.mockResolvedValue(undefined);

            const result = await service.markAsRead('user-1');

            expect(result.message).toBe('Read');
            expect(mockRepo.markAsRead).toHaveBeenCalledWith('user-1');
        });

        it('should return Already read when no unread', async () => {
            mockRepo.getAllUnread.mockResolvedValue([]);

            const result = await service.markAsRead('user-1');

            expect(result.message).toBe('Already read');
            expect(mockRepo.markAsRead).not.toHaveBeenCalled();
        });
    });
});