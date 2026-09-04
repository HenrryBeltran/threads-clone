import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { SearchRepository } from './search.repository';

describe('SearchService', () => {
    let service: SearchService;

    const mockRepo = {
        searchUsers: jest.fn(),
        findHistory: jest.fn(),
        findDuplicate: jest.fn(),
        touchHistory: jest.fn(),
        addHistory: jest.fn(),
        clearHistory: jest.fn(),
        deleteRow: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SearchService, { provide: SearchRepository, useValue: mockRepo }],
        }).compile();

        service = module.get<SearchService>(SearchService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('search', () => {
        it('should search users with keywords', async () => {
            mockRepo.searchUsers.mockResolvedValue([
                {
                    id: 'user-1',
                    username: 'testuser',
                    name: 'Test User',
                    profilePictureId: null,
                    followStatus: 0,
                },
            ]);

            const result = await service.search('user-1', 'test');

            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('testuser');
            expect(mockRepo.searchUsers).toHaveBeenCalledWith('user-1', 'test');
        });

        it('should return empty array when no matches', async () => {
            mockRepo.searchUsers.mockResolvedValue([]);

            const result = await service.search('user-1', 'nothing');

            expect(result).toEqual([]);
        });
    });

    describe('getHistory', () => {
        it('should return search history', async () => {
            const history = [
                {
                    id: 'history-1',
                    userSearch: {
                        id: 'user-2',
                        username: 'otheruser',
                        name: 'Other User',
                        profilePictureId: null,
                    },
                },
            ];
            mockRepo.findHistory.mockResolvedValue(history);

            const result = await service.getHistory('user-1');

            expect(result).toEqual(history);
            expect(mockRepo.findHistory).toHaveBeenCalledWith('user-1');
        });
    });

    describe('addHistory', () => {
        it('should touch existing duplicate history', async () => {
            mockRepo.findDuplicate.mockResolvedValue({ id: 'history-1' });
            mockRepo.touchHistory.mockResolvedValue(undefined);

            const result = await service.addHistory('user-1', 'user-2');

            expect(result).toBe(200);
            expect(mockRepo.touchHistory).toHaveBeenCalledWith('history-1');
            expect(mockRepo.addHistory).not.toHaveBeenCalled();
        });

        it('should add new history entry', async () => {
            mockRepo.findDuplicate.mockResolvedValue(null);
            mockRepo.addHistory.mockResolvedValue(undefined);

            const result = await service.addHistory('user-1', 'user-2');

            expect(result).toBe(200);
            expect(mockRepo.addHistory).toHaveBeenCalledWith('user-1', 'user-2');
        });
    });

    describe('clearHistory', () => {
        it('should clear history', async () => {
            mockRepo.clearHistory.mockResolvedValue(undefined);

            const result = await service.clearHistory('user-1');

            expect(result).toBe(200);
            expect(mockRepo.clearHistory).toHaveBeenCalledWith('user-1');
        });
    });

    describe('deleteRow', () => {
        it('should delete a specific history row', async () => {
            mockRepo.deleteRow.mockResolvedValue(undefined);

            const result = await service.deleteRow('history-1');

            expect(result).toBe(200);
            expect(mockRepo.deleteRow).toHaveBeenCalledWith('history-1');
        });
    });
});