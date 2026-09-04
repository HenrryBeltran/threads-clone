import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { AuthRepository, Session } from './auth.repository';
import { CookieService } from 'src/common/cookie.service';
import { Response } from 'express';

describe('SessionsService', () => {
    let service: SessionsService;

    const mockAuthRepo = {
        findSessionsByUserId: jest.fn(),
        deleteUserSession: jest.fn(),
        deleteSessionsByUserId: jest.fn(),
    };

    const mockCookieService = {
        clearSession: jest.fn(),
    };

    const mockResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;

    const mockSessions: Session[] = [
        {
            id: 'session-1',
            userId: 'user-1',
            token: 'token-1',
            expires: '2025-01-01',
            deviceName: 'Chrome',
            deviceType: 'desktop',
            ipAddress: '127.0.0.1',
            lastActiveAt: '2024-01-01',
            userAgent: 'Mozilla/5.0',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
        },
        {
            id: 'session-2',
            userId: 'user-1',
            token: 'token-2',
            expires: '2025-01-01',
            deviceName: 'Firefox',
            deviceType: 'desktop',
            ipAddress: '192.168.1.1',
            lastActiveAt: '2024-01-02',
            userAgent: 'Mozilla/5.0',
            createdAt: '2024-01-02',
            updatedAt: '2024-01-02',
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                { provide: AuthRepository, useValue: mockAuthRepo },
                { provide: CookieService, useValue: mockCookieService },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAll', () => {
        it('should return all sessions for a user', async () => {
            mockAuthRepo.findSessionsByUserId.mockResolvedValue(mockSessions);

            const result = await service.getAll('user-1', 'session-1');

            expect(result).toHaveLength(2);
            expect(result[0].isCurrent).toBe(true);
            expect(result[1].isCurrent).toBe(false);
            expect(result[0].token).toBeUndefined();
            expect(result[1].token).toBeUndefined();
        });

        it('should return empty array if no sessions', async () => {
            mockAuthRepo.findSessionsByUserId.mockResolvedValue([]);

            const result = await service.getAll('user-1', 'session-1');

            expect(result).toHaveLength(0);
        });
    });

    describe('deleteOne', () => {
        it('should delete a session successfully', async () => {
            mockAuthRepo.deleteUserSession.mockResolvedValue(true);

            const result = await service.deleteOne('session-1', 'user-1', 'session-2', mockResponse);

            expect(result).toBe(200);
            expect(mockAuthRepo.deleteUserSession).toHaveBeenCalledWith('session-1', 'user-1');
            expect(mockCookieService.clearSession).not.toHaveBeenCalled();
        });

        it('should clear cookie when deleting current session', async () => {
            mockAuthRepo.deleteUserSession.mockResolvedValue(true);

            const result = await service.deleteOne('session-1', 'user-1', 'session-1', mockResponse);

            expect(result).toBe(200);
            expect(mockCookieService.clearSession).toHaveBeenCalledWith(mockResponse);
        });

        it('should throw NotFoundException if session not found', async () => {
            mockAuthRepo.deleteUserSession.mockResolvedValue(false);

            await expect(service.deleteOne('session-999', 'user-1', 'session-1', mockResponse)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('deleteAll', () => {
        it('should delete all sessions except current', async () => {
            mockAuthRepo.deleteSessionsByUserId.mockResolvedValue(undefined);

            const result = await service.deleteAll('user-1', 'session-1');

            expect(result).toBe(200);
            expect(mockAuthRepo.deleteSessionsByUserId).toHaveBeenCalledWith('user-1', 'session-1');
        });
    });
});