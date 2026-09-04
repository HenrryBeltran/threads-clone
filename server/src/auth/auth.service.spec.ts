import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { PasswordService } from 'src/common/password.service';
import { CookieService } from 'src/common/cookie.service';
import { DeviceService } from 'src/common/device.service';
import { VerificationService } from './verification.service';
import { SignUpDto } from './dto/sign-up.dto';
import { Response } from 'express';

describe('AuthService', () => {
    let service: AuthService;

    const mockAuthRepo = {
        findRegisteredUser: jest.fn(),
        findByUsername: jest.fn(),
        findByEmail: jest.fn(),
        createUser: jest.fn(),
        createUserSession: jest.fn(),
        deleteSession: jest.fn(),
    };

    const mockPasswordService = {
        hash: jest.fn(),
        verify: jest.fn(),
    };

    const mockCookieService = {
        setSession: jest.fn(),
        clearSession: jest.fn(),
    };

    const mockDeviceService = {
        parse: jest.fn(),
    };

    const mockVerificationService = {
        ensureVerificationToken: jest.fn(),
    };

    const mockResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
    } as unknown as Response;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: AuthRepository, useValue: mockAuthRepo },
                { provide: PasswordService, useValue: mockPasswordService },
                { provide: CookieService, useValue: mockCookieService },
                { provide: DeviceService, useValue: mockDeviceService },
                { provide: VerificationService, useValue: mockVerificationService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        const loginData = {
            usernameOrEmail: 'testuser',
            password: 'TestPass123!',
            userAgent: 'Mozilla/5.0 Chrome/120',
            ip: '127.0.0.1',
        };

        it('should login successfully with verified email', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashed-password',
                emailVerified: '2024-01-01',
                roles: 'user',
            });
            mockPasswordService.verify.mockResolvedValue(true);
            mockDeviceService.parse.mockReturnValue({ deviceName: 'Chrome', deviceType: 'desktop' });

            const result = await service.login(
                loginData.usernameOrEmail,
                loginData.password,
                loginData.userAgent,
                loginData.ip,
                mockResponse,
            );

            expect(result).toBe(200);
            expect(mockAuthRepo.findRegisteredUser).toHaveBeenCalledWith('testuser');
            expect(mockPasswordService.verify).toHaveBeenCalledWith(loginData.password, 'hashed-password');
            expect(mockAuthRepo.createUserSession).toHaveBeenCalled();
            expect(mockCookieService.setSession).toHaveBeenCalled();
        });

        it('should throw NotFoundException if user not found', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue(null);

            await expect(
                service.login(loginData.usernameOrEmail, loginData.password, loginData.userAgent, loginData.ip, mockResponse),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException with email message if @ in username', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue(null);

            await expect(
                service.login('test@example.com', loginData.password, loginData.userAgent, loginData.ip, mockResponse),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashed-password',
                emailVerified: '2024-01-01',
                roles: 'user',
            });
            mockPasswordService.verify.mockResolvedValue(false);

            await expect(
                service.login(loginData.usernameOrEmail, loginData.password, loginData.userAgent, loginData.ip, mockResponse),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw 307 with token for unverified email', async () => {
            mockAuthRepo.findRegisteredUser.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashed-password',
                emailVerified: null,
                roles: 'user',
            });
            mockPasswordService.verify.mockResolvedValue(true);
            mockDeviceService.parse.mockReturnValue({ deviceName: 'Chrome', deviceType: 'desktop' });
            mockVerificationService.ensureVerificationToken.mockResolvedValue('verification-token-123');

            try {
                await service.login(
                    loginData.usernameOrEmail,
                    loginData.password,
                    loginData.userAgent,
                    loginData.ip,
                    mockResponse,
                );
            } catch (e) {
                expect(e.getStatus()).toBe(307);
                expect(e.getResponse()).toEqual({ token: 'verification-token-123' });
            }
        });
    });

    describe('signUp', () => {
        const signUpDto: SignUpDto = {
            username: 'newuser',
            email: 'new@example.com',
            password: 'NewPass123!',
        };

        it('should create new user successfully', async () => {
            mockAuthRepo.findByUsername.mockResolvedValue(null);
            mockAuthRepo.findByEmail.mockResolvedValue(null);
            mockPasswordService.hash.mockResolvedValue('hashed-new-password');
            mockAuthRepo.createUser.mockResolvedValue({
                id: 'user-2',
                email: 'new@example.com',
                username: 'newuser',
                emailVerified: null,
            });
            mockVerificationService.ensureVerificationToken.mockResolvedValue('new-token-123');

            const result = await service.signUp(signUpDto, mockResponse);

            expect(result).toEqual({ token: 'new-token-123' });
            expect(mockAuthRepo.createUser).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashed-new-password',
            });
            expect(mockAuthRepo.createUserSession).toHaveBeenCalled();
            expect(mockCookieService.setSession).toHaveBeenCalled();
        });

        it('should throw ConflictException if username exists', async () => {
            mockAuthRepo.findByUsername.mockResolvedValue({ id: 'existing-user' });

            await expect(service.signUp(signUpDto, mockResponse)).rejects.toThrow(ConflictException);
        });

        it('should throw ConflictException if email exists', async () => {
            mockAuthRepo.findByUsername.mockResolvedValue(null);
            mockAuthRepo.findByEmail.mockResolvedValue({ id: 'existing-email' });

            await expect(service.signUp(signUpDto, mockResponse)).rejects.toThrow(ConflictException);
        });

        it('should lowercase the username', async () => {
            mockAuthRepo.findByUsername.mockResolvedValue(null);
            mockAuthRepo.findByEmail.mockResolvedValue(null);
            mockPasswordService.hash.mockResolvedValue('hashed-new-password');
            mockAuthRepo.createUser.mockResolvedValue({
                id: 'user-2',
                email: 'new@example.com',
                username: 'newuser',
                emailVerified: null,
            });
            mockVerificationService.ensureVerificationToken.mockResolvedValue('new-token-123');

            await service.signUp({ ...signUpDto, username: 'NEWUSER' }, mockResponse);

            expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
                expect.objectContaining({ username: 'newuser' }),
            );
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            mockAuthRepo.deleteSession.mockResolvedValue(undefined);

            const result = await service.logout('session-123', mockResponse);

            expect(result).toBe(200);
            expect(mockAuthRepo.deleteSession).toHaveBeenCalledWith('session-123');
            expect(mockCookieService.clearSession).toHaveBeenCalled();
        });
    });
});