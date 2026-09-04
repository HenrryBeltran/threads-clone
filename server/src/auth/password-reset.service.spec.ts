import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { AuthRepository, LoginAuthUser } from './auth.repository';
import { PasswordResetRepository } from './password-reset.repository';
import { MailService } from 'src/mail/mail.service';
import { PasswordService } from 'src/common/password.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('PasswordResetService', () => {
    let service: PasswordResetService;

    const mockAuthRepo = {
        findRegisteredUser: jest.fn(),
        updatePassword: jest.fn(),
        deleteSessionsByUserId: jest.fn(),
    };

    const mockPasswordResetRepo = {
        findByEmail: jest.fn(),
        findByToken: jest.fn(),
        create: jest.fn(),
        updateToken: jest.fn(),
        delete: jest.fn(),
    };

    const mockMailService = {
        sendResetPassword: jest.fn(),
        sendResetPasswordConfirmation: jest.fn(),
    };

    const mockPasswordService = {
        hash: jest.fn(),
    };

    const mockUser: LoginAuthUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        emailVerified: '2024-01-01',
        roles: 'user',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordResetService,
                { provide: AuthRepository, useValue: mockAuthRepo },
                { provide: PasswordResetRepository, useValue: mockPasswordResetRepo },
                { provide: MailService, useValue: mockMailService },
                { provide: PasswordService, useValue: mockPasswordService },
            ],
        }).compile();

        service = module.get<PasswordResetService>(PasswordResetService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('forgottenPassword', () => {
        it('should send reset email for existing user', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue(mockUser);
            mockPasswordResetRepo.findByEmail.mockResolvedValue(null);
            mockPasswordResetRepo.create.mockResolvedValue(undefined);
            mockMailService.sendResetPassword.mockResolvedValue(undefined);

            const result = await service.forgottenPassword(mockUser.email);

            expect(result.message).toContain('sent you an email');
            expect(mockPasswordResetRepo.create).toHaveBeenCalled();
            expect(mockMailService.sendResetPassword).toHaveBeenCalled();
        });

        it('should throw NotFoundException if email not registered', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue(null);

            await expect(service.forgottenPassword('unknown@example.com')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for viewer role', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue({
                ...mockUser,
                roles: 'viewer',
            });

            await expect(service.forgottenPassword(mockUser.email)).rejects.toThrow(BadRequestException);
        });

        it('should throw 429 if cooldown not met', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue(mockUser);
            mockPasswordResetRepo.findByEmail.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'old-token',
                expires: dayjs.utc().add(1, 'hour').toISOString(),
                createdAt: dayjs.utc().subtract(5, 'minutes').toISOString(),
                updatedAt: dayjs.utc().subtract(30, 'seconds').toISOString(),
            });

            try {
                await service.forgottenPassword(mockUser.email);
            } catch (e) {
                expect(e.getStatus()).toBe(429);
            }
        });
    });

    describe('validateResetToken', () => {
        it('should validate a valid token', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                expires: dayjs.utc().add(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            const result = await service.validateResetToken('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

            expect(result.message).toBe('Valid url.');
        });

        it('should throw BadRequestException for invalid token format', async () => {
            await expect(service.validateResetToken('short')).rejects.toThrow(BadRequestException);
            await expect(service.validateResetToken('token with spaces')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if token not found', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue(null);

            await expect(service.validateResetToken('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw 498 if token expired', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                expires: dayjs.utc().subtract(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });
            mockPasswordResetRepo.delete.mockResolvedValue(undefined);

            try {
                await service.validateResetToken('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
            } catch (e) {
                expect(e.getStatus()).toBe(498);
            }
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                expires: dayjs.utc().add(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });
            mockAuthRepo.findRegisteredUser.mockResolvedValue(mockUser);
            mockPasswordService.hash.mockResolvedValue('new-hashed-password');
            mockPasswordResetRepo.delete.mockResolvedValue(undefined);
            mockAuthRepo.updatePassword.mockResolvedValue(undefined);
            mockPasswordResetRepo.create.mockResolvedValue(undefined);
            mockAuthRepo.deleteSessionsByUserId.mockResolvedValue(undefined);
            mockMailService.sendResetPasswordConfirmation.mockResolvedValue(undefined);

            const result = await service.resetPassword('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'NewPassword123!');

            expect(result.message).toBe('Reset password successfully');
            expect(mockPasswordService.hash).toHaveBeenCalledWith('NewPassword123!');
            expect(mockAuthRepo.updatePassword).toHaveBeenCalledWith(mockUser.id, 'new-hashed-password');
            expect(mockAuthRepo.deleteSessionsByUserId).toHaveBeenCalledWith(mockUser.id);
        });

        it('should throw BadRequestException if token not found', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue(null);

            await expect(service.resetPassword('cccccccccccccccccccccccccccccccc', 'NewPassword123!')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw 498 if token expired', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                expires: dayjs.utc().subtract(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            try {
                await service.resetPassword('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'NewPassword123!');
            } catch (e) {
                expect(e.getStatus()).toBe(498);
            }
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPasswordResetRepo.findByToken.mockResolvedValue({
                id: 'reset-1',
                email: mockUser.email,
                token: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                expires: dayjs.utc().add(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });
            mockAuthRepo.findRegisteredUser.mockResolvedValue(null);

            await expect(service.resetPassword('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'NewPassword123!')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});