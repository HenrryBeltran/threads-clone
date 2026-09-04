import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationRepository } from './verification.repository';
import { MailService } from 'src/mail/mail.service';
import { AuthRepository, AuthUser } from './auth.repository';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('VerificationService', () => {
    let service: VerificationService;

    const mockVerificationRepo = {
        findByEmail: jest.fn(),
        upsert: jest.fn(),
        updateCode: jest.fn(),
        delete: jest.fn(),
    };

    const mockMailService = {
        sendWelcome: jest.fn(),
    };

    const mockAuthRepo = {
        verifyEmail: jest.fn(),
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
        emailVerified: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        targetId: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VerificationService,
                { provide: VerificationRepository, useValue: mockVerificationRepo },
                { provide: MailService, useValue: mockMailService },
                { provide: AuthRepository, useValue: mockAuthRepo },
            ],
        }).compile();

        service = module.get<VerificationService>(VerificationService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('ensureVerificationToken', () => {
        it('should return existing token if found', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'existing-token',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            const result = await service.ensureVerificationToken(mockUser);

            expect(result).toBe('existing-token');
            expect(mockVerificationRepo.upsert).not.toHaveBeenCalled();
            expect(mockMailService.sendWelcome).not.toHaveBeenCalled();
        });

        it('should create new token and send email if no existing', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue(null);
            mockVerificationRepo.upsert.mockResolvedValue(undefined);
            mockMailService.sendWelcome.mockResolvedValue(undefined);

            const result = await service.ensureVerificationToken(mockUser);

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
            expect(result.length).toBe(32);
            expect(mockVerificationRepo.upsert).toHaveBeenCalled();
            expect(mockMailService.sendWelcome).toHaveBeenCalledWith(
                mockUser.username,
                mockUser.email,
                expect.stringMatching(/^\d{6}$/),
            );
        });
    });

    describe('verifyAccount', () => {
        it('should verify account with correct PIN', async () => {
            const verifyRecord = {
                id: 'verify-1',
                email: 'test@example.com',
                token: 'token-123',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            };

            mockVerificationRepo.findByEmail.mockResolvedValue(verifyRecord);
            mockAuthRepo.verifyEmail.mockResolvedValue(undefined);
            mockVerificationRepo.delete.mockResolvedValue(undefined);

            const result = await service.verifyAccount(mockUser, '123456');

            expect(result).toBe('Account verify successfully');
            expect(mockAuthRepo.verifyEmail).toHaveBeenCalledWith(mockUser.id);
            expect(mockVerificationRepo.delete).toHaveBeenCalledWith(verifyRecord.id);
        });

        it('should throw NotFoundException if verification record not found', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue(null);

            await expect(service.verifyAccount(mockUser, '123456')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotAcceptableException for invalid PIN', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'token-123',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            await expect(service.verifyAccount(mockUser, '000000')).rejects.toThrow(NotAcceptableException);
        });

        it('should throw HttpException 498 for expired PIN', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'token-123',
                code: '123456',
                expires: dayjs.utc().subtract(1, 'hour').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            try {
                await service.verifyAccount(mockUser, '123456');
            } catch (e) {
                expect(e.getStatus()).toBe(498);
            }
        });
    });

    describe('getVerificationToken', () => {
        it('should return token if record exists', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'my-token-123',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().toISOString(),
                updatedAt: dayjs.utc().toISOString(),
            });

            const result = await service.getVerificationToken(mockUser);

            expect(result).toEqual({ token: 'my-token-123' });
        });

        it('should throw NotFoundException if record not found', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue(null);

            await expect(service.getVerificationToken(mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('resend', () => {
        it('should resend email and update code', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'token-123',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().subtract(5, 'minutes').toISOString(),
                updatedAt: dayjs.utc().subtract(2, 'minutes').toISOString(),
            });
            mockMailService.sendWelcome.mockResolvedValue(undefined);
            mockVerificationRepo.updateCode.mockResolvedValue(undefined);

            const result = await service.resend(mockUser);

            expect(result).toEqual({ sended: true, timeLeft: 60 });
            expect(mockMailService.sendWelcome).toHaveBeenCalled();
            expect(mockVerificationRepo.updateCode).toHaveBeenCalled();
        });

        it('should return sended: false with timeLeft if cooldown not met', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue({
                id: 'verify-1',
                email: 'test@example.com',
                token: 'token-123',
                code: '123456',
                expires: dayjs.utc().add(10, 'minutes').toISOString(),
                createdAt: dayjs.utc().subtract(5, 'minutes').toISOString(),
                updatedAt: dayjs.utc().subtract(30, 'seconds').toISOString(),
            });

            const result = await service.resend(mockUser);

            expect(result.sended).toBe(false);
            expect(result.timeLeft).toBeGreaterThan(0);
            expect(result.timeLeft).toBeLessThanOrEqual(60);
        });

        it('should throw NotFoundException if record not found', async () => {
            mockVerificationRepo.findByEmail.mockResolvedValue(null);

            await expect(service.resend(mockUser)).rejects.toThrow(NotFoundException);
        });
    });
});