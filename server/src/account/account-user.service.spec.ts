import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { AccountUserService } from './account-user.service';
import { AccountRepository } from './account.repository';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { CookieService } from 'src/common/cookie.service';
import { PasswordService } from 'src/common/password.service';
import { MailService } from 'src/mail/mail.service';
import { AuthUser } from 'src/auth/auth.repository';
import { Response } from 'express';

describe('AccountUserService', () => {
    let service: AccountUserService;

    const mockRepo = {
        findPasswordById: jest.fn(),
        updateProfile: jest.fn(),
        updateUsername: jest.fn(),
        updateEmail: jest.fn(),
        updatePassword: jest.fn(),
        deleteUser: jest.fn(),
        updateCounts: jest.fn(),
        countFollowers: jest.fn(),
        countFollowings: jest.fn(),
        findIdByEmail: jest.fn(),
        findIdByUsername: jest.fn(),
        findVerifyEmailByOldEmail: jest.fn(),
        findVerifyEmailByTokenAndOldEmail: jest.fn(),
        createVerifyEmail: jest.fn(),
        updateVerifyEmail: jest.fn(),
        deleteVerifyEmail: jest.fn(),
    };

    const mockCloudinaryService = {
        upload: jest.fn(),
        destroy: jest.fn(),
    };

    const mockCookieService = {
        clearSession: jest.fn(),
    };

    const mockPasswordService = {
        hash: jest.fn(),
        verify: jest.fn(),
    };

    const mockMailService = {
        sendNewEmailRequest: jest.fn(),
        sendNewEmailConfirmation: jest.fn(),
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

    const mockResponse = { cookie: jest.fn(), clearCookie: jest.fn() } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountUserService,
                { provide: AccountRepository, useValue: mockRepo },
                { provide: CloudinaryService, useValue: mockCloudinaryService },
                { provide: CookieService, useValue: mockCookieService },
                { provide: PasswordService, useValue: mockPasswordService },
                { provide: MailService, useValue: mockMailService },
            ],
        }).compile();

        service = module.get<AccountUserService>(AccountUserService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAccount', () => {
        it('should return the user', () => {
            expect(service.getAccount(mockUser)).toBe(mockUser);
        });
    });

    describe('updateProfile', () => {
        it('should update profile without profile picture', async () => {
            mockRepo.updateProfile.mockResolvedValue(undefined);

            const result = await service.updateProfile(mockUser, {
                name: 'New Name',
                bio: 'New bio',
                link: 'https://example.com',
            });

            expect(result).toBe(200);
            expect(mockRepo.updateProfile).toHaveBeenCalledWith('user-1', {
                name: 'New Name',
                bio: 'New bio',
                link: 'https://example.com',
                profilePictureId: null,
            });
        });

        it('should upload profile picture when provided', async () => {
            mockUser.profilePictureId = 'existing-id';
            mockCloudinaryService.upload.mockResolvedValue('new-cloudinary-id');
            mockRepo.updateProfile.mockResolvedValue(undefined);

            const result = await service.updateProfile(mockUser, {
                name: 'New Name',
                bio: 'New bio',
                link: '',
                profilePicture: { base64: 'data:image/jpeg;base64,/9j/4AAQ' },
            });

            expect(result).toBe(200);
            expect(mockCloudinaryService.destroy).toHaveBeenCalledWith('existing-id');
            expect(mockCloudinaryService.upload).toHaveBeenCalledWith(
                'data:image/jpeg;base64,/9j/4AAQ',
                '/profile_pictures',
            );
            expect(mockRepo.updateProfile).toHaveBeenCalledWith(
                'user-1',
                expect.objectContaining({ profilePictureId: 'new-cloudinary-id' }),
            );
        });
    });

    describe('deleteAccount', () => {
        it('should delete user and clear session', async () => {
            mockRepo.deleteUser.mockResolvedValue(undefined);

            const result = await service.deleteAccount(mockUser, mockResponse);

            expect(result).toBe(200);
            expect(mockRepo.deleteUser).toHaveBeenCalledWith('user-1');
            expect(mockCookieService.clearSession).toHaveBeenCalledWith(mockResponse);
        });

        it('should throw 401 for viewer role', async () => {
            try {
                await service.deleteAccount({ ...mockUser, roles: 'viewer' }, mockResponse);
            } catch (e) {
                expect(e.getStatus()).toBe(401);
            }
        });
    });

    describe('updateEmail', () => {
        it('should send verification email for new email', async () => {
            mockUser.email = 'test@example.com';
            mockRepo.findIdByEmail.mockResolvedValue(null);
            mockRepo.findVerifyEmailByOldEmail.mockResolvedValue(null);
            mockRepo.createVerifyEmail.mockResolvedValue(undefined);
            mockMailService.sendNewEmailRequest.mockResolvedValue(undefined);

            const result = await service.updateEmail(mockUser, { newEmail: 'new@example.com' });

            expect(result.message).toBe('Request sended successfully');
            expect(mockRepo.createVerifyEmail).toHaveBeenCalled();
            expect(mockMailService.sendNewEmailRequest).toHaveBeenCalled();
        });

        it('should throw 409 if new email is same as current', async () => {
            mockUser.email = 'same@example.com';

            try {
                await service.updateEmail(mockUser, { newEmail: 'same@example.com' });
            } catch (e) {
                expect(e.getStatus()).toBe(409);
            }
        });

        it('should throw 409 if email already in use', async () => {
            mockRepo.findIdByEmail.mockResolvedValue({ id: 'other-user' });

            try {
                await service.updateEmail(mockUser, { newEmail: 'taken@example.com' });
            } catch (e) {
                expect(e.getStatus()).toBe(409);
            }
        });
    });

    describe('verifyNewEmail', () => {
        it('should verify and update email', async () => {
            mockUser.email = 'test@example.com';
            const record = {
                id: 'verify-1',
                newEmail: 'new@example.com',
                expires: new Date(Date.now() + 600000).toISOString(),
            };
            mockRepo.findVerifyEmailByTokenAndOldEmail.mockResolvedValue(record);
            mockRepo.deleteVerifyEmail.mockResolvedValue(undefined);
            mockRepo.updateEmail.mockResolvedValue(undefined);
            mockMailService.sendNewEmailConfirmation.mockResolvedValue(undefined);

            const result = await service.verifyNewEmail(mockUser, 'valid-token');

            expect(result.message).toBe('New email updated successfully');
            expect(mockRepo.updateEmail).toHaveBeenCalledWith('user-1', 'new@example.com');
        });

        it('should throw 401 if token undefined', async () => {
            try {
                await service.verifyNewEmail(mockUser, undefined as any);
            } catch (e) {
                expect(e.getStatus()).toBe(401);
            }
        });
    });

    describe('updateUsername', () => {
        it('should update username', async () => {
            mockRepo.findIdByUsername.mockResolvedValue(null);
            mockRepo.updateUsername.mockResolvedValue(undefined);

            const result = await service.updateUsername(mockUser, { newUsername: 'newusername' });

            expect(result.message).toBe('New username updated successfully');
            expect(mockRepo.updateUsername).toHaveBeenCalledWith('user-1', 'newusername');
        });

        it('should throw 409 if username is same as current', async () => {
            mockUser.username = 'sameuser';

            try {
                await service.updateUsername(mockUser, { newUsername: 'sameuser' });
            } catch (e) {
                expect(e.getStatus()).toBe(409);
            }
        });

        it('should throw 409 if username taken', async () => {
            mockRepo.findIdByUsername.mockResolvedValue({ id: 'other-user' });

            try {
                await service.updateUsername(mockUser, { newUsername: 'takenuser' });
            } catch (e) {
                expect(e.getStatus()).toBe(409);
            }
        });
    });

    describe('updatePassword', () => {
        it('should update password', async () => {
            mockRepo.findPasswordById.mockResolvedValue({ password: 'old-hash' });
            mockPasswordService.verify.mockResolvedValue(false);
            mockPasswordService.hash.mockResolvedValue('new-hash');
            mockRepo.updatePassword.mockResolvedValue(undefined);

            const result = await service.updatePassword(mockUser, { newPassword: 'NewPassword123!' });

            expect(result.message).toBe('New password updated successfully');
            expect(mockRepo.updatePassword).toHaveBeenCalledWith('user-1', 'new-hash');
        });

        it('should throw 400 if new password is same as old', async () => {
            mockRepo.findPasswordById.mockResolvedValue({ password: 'old-hash' });
            mockPasswordService.verify.mockResolvedValue(true);

            try {
                await service.updatePassword(mockUser, { newPassword: 'SamePassword123!' });
            } catch (e) {
                expect(e.getStatus()).toBe(400);
            }
        });
    });

    describe('syncAccount', () => {
        it('should sync counts when different', async () => {
            mockRepo.countFollowers.mockResolvedValue(5);
            mockRepo.countFollowings.mockResolvedValue(3);
            mockRepo.updateCounts.mockResolvedValue(undefined);

            const result = await service.syncAccount({
                ...mockUser,
                followersCount: 1,
                followingsCount: 1,
            });

            expect(result.message).toBe('Account synchronized');
            expect(mockRepo.updateCounts).toHaveBeenCalledWith('user-1', 5, 3);
        });

        it('should not update when counts match', async () => {
            mockRepo.countFollowers.mockResolvedValue(0);
            mockRepo.countFollowings.mockResolvedValue(0);

            const result = await service.syncAccount(mockUser);

            expect(result.message).toBe('Account already up to date');
            expect(mockRepo.updateCounts).not.toHaveBeenCalled();
        });
    });
});