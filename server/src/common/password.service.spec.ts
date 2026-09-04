import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
    let service: PasswordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PasswordService],
        }).compile();

        service = module.get<PasswordService>(PasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hash', () => {
        it('should hash a password', async () => {
            const password = 'TestPassword123!';
            const hash = await service.hash(password);

            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should produce different hashes for same password (salt)', async () => {
            const password = 'TestPassword123!';
            const hash1 = await service.hash(password);
            const hash2 = await service.hash(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('verify', () => {
        it('should return true for correct password', async () => {
            const password = 'TestPassword123!';
            const hash = await service.hash(password);

            const result = await service.verify(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for incorrect password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword456!';
            const hash = await service.hash(password);

            const result = await service.verify(wrongPassword, hash);
            expect(result).toBe(false);
        });

        it('should return false for empty string password', async () => {
            const password = 'TestPassword123!';
            const hash = await service.hash(password);

            const result = await service.verify('', hash);
            expect(result).toBe(false);
        });
    });
});