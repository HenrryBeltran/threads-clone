import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountProfileService } from './account-profile.service';
import { FollowRepository } from './follow.repository';
import { ActivityService } from './activity.service';
import { AuthUser } from 'src/auth/auth.repository';

describe('AccountProfileService', () => {
    let service: AccountProfileService;

    const mockFollowRepo = {
        findTargetByUsername: jest.fn(),
        findFollow: jest.fn(),
        createFollow: jest.fn(),
        deleteFollow: jest.fn(),
        findFollowers: jest.fn(),
        findFollowings: jest.fn(),
    };

    const mockActivityService = {
        createActivity: jest.fn(),
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountProfileService,
                { provide: FollowRepository, useValue: mockFollowRepo },
                { provide: ActivityService, useValue: mockActivityService },
            ],
        }).compile();

        service = module.get<AccountProfileService>(AccountProfileService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getFollow', () => {
        it('should return { follow: true } when following', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.findFollow.mockResolvedValue({ id: 'follow-1' });

            const result = await service.getFollow(mockUser, 'targetuser');

            expect(result).toEqual({ follow: true });
        });

        it('should return { follow: false } when not following', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.findFollow.mockResolvedValue(null);

            const result = await service.getFollow(mockUser, 'targetuser');

            expect(result).toEqual({ follow: false });
        });

        it('should throw NotFoundException if target not found', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue(null);

            await expect(service.getFollow(mockUser, 'unknown')).rejects.toThrow(NotFoundException);
        });
    });

    describe('followUser', () => {
        it('should follow a user and create activity', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.createFollow.mockResolvedValue(true);
            mockFollowRepo.findFollow.mockResolvedValue(null);

            const result = await service.followUser(mockUser, 'targetuser');

            expect(result).toEqual({ follow: true });
            expect(mockFollowRepo.createFollow).toHaveBeenCalledWith('user-1', 'target-1');
            expect(mockActivityService.createActivity).toHaveBeenCalledWith(
                'follow',
                'user-1',
                'target-1',
                'Followed you',
            );
        });

        it('should create "Followed you back" activity if mutual', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.createFollow.mockResolvedValue(true);
            mockFollowRepo.findFollow.mockResolvedValue({ id: 'mutual-follow' });

            await service.followUser(mockUser, 'targetuser');

            expect(mockActivityService.createActivity).toHaveBeenCalledWith(
                'follow',
                'user-1',
                'target-1',
                'Followed you back',
            );
        });

        it('should return { follow: true } if already following', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.createFollow.mockResolvedValue(false);

            const result = await service.followUser(mockUser, 'targetuser');

            expect(result).toEqual({ follow: true });
            expect(mockActivityService.createActivity).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if target not found', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue(null);

            await expect(service.followUser(mockUser, 'unknown')).rejects.toThrow(NotFoundException);
        });
    });

    describe('unfollowUser', () => {
        it('should unfollow a user', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.findFollow.mockResolvedValue({ id: 'follow-1' });
            mockFollowRepo.deleteFollow.mockResolvedValue(undefined);

            const result = await service.unfollowUser(mockUser, 'targetuser');

            expect(result).toEqual({ follow: false });
            expect(mockFollowRepo.deleteFollow).toHaveBeenCalledWith('follow-1', 'user-1', 'target-1');
        });

        it('should return { follow: true } if not following', async () => {
            mockFollowRepo.findTargetByUsername.mockResolvedValue({ id: 'target-1' });
            mockFollowRepo.findFollow.mockResolvedValue(null);

            const result = await service.unfollowUser(mockUser, 'targetuser');

            expect(result).toEqual({ follow: true });
        });
    });

    describe('getFollowers & getFollowings', () => {
        it('should return followers', async () => {
            mockFollowRepo.findFollowers.mockResolvedValue([]);

            const result = await service.getFollowers(mockUser, 'target-1');

            expect(result).toEqual([]);
            expect(mockFollowRepo.findFollowers).toHaveBeenCalledWith('target-1', 'user-1', 0, 10);
        });

        it('should return followings', async () => {
            mockFollowRepo.findFollowings.mockResolvedValue([]);

            const result = await service.getFollowings(mockUser, 'target-1');

            expect(result).toEqual([]);
            expect(mockFollowRepo.findFollowings).toHaveBeenCalledWith('target-1', 'user-1', 0, 10);
        });
    });
});