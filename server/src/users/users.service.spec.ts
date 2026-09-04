import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
    let service: UsersService;

    const mockRepo = {
        getProfileByUsername: jest.fn(),
        getTestAccounts: jest.fn(),
    };

    const mockProfile = {
        id: 'user-1',
        username: 'testuser',
        name: 'Test User',
        bio: 'Test bio',
        link: 'https://example.com',
        profilePictureId: null,
        followersCount: 10,
        followingsCount: 5,
        targetId: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersService, { provide: UsersRepository, useValue: mockRepo }],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findProfile', () => {
        it('should return user profile', async () => {
            mockRepo.getProfileByUsername.mockResolvedValue(mockProfile);

            const result = await service.findProfile('testuser');

            expect(result).toEqual(mockProfile);
            expect(mockRepo.getProfileByUsername).toHaveBeenCalledWith('testuser');
        });

        it('should throw NotFoundException if profile not found', async () => {
            mockRepo.getProfileByUsername.mockResolvedValue(null);

            await expect(service.findProfile('unknownuser')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findTestAccounts', () => {
        it('should return test accounts with password', async () => {
            mockRepo.getTestAccounts.mockResolvedValue([
                {
                    username: 'test_account_1',
                    name: 'Test Account 1',
                    profilePictureId: null,
                },
            ]);

            const result = await service.findTestAccounts();

            expect(result).toHaveLength(1);
            expect(result[0].password).toBe('123456Clone');
            expect(result[0].username).toBe('test_account_1');
        });

        it('should return empty array if no test accounts', async () => {
            mockRepo.getTestAccounts.mockResolvedValue([]);

            const result = await service.findTestAccounts();

            expect(result).toEqual([]);
        });
    });
});