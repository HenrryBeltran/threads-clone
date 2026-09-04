import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
    let service: DeviceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DeviceService],
        }).compile();

        service = module.get<DeviceService>(DeviceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('parse', () => {
        it('should parse Chrome on macOS user agent', () => {
            const userAgent =
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

            const result = service.parse(userAgent);

            expect(result).toEqual({
                deviceName: 'Chrome on macOS',
                deviceType: 'desktop',
                userAgent,
            });
        });

        it('should parse Firefox on Windows user agent', () => {
            const userAgent =
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';

            const result = service.parse(userAgent);

            expect(result).toEqual({
                deviceName: 'Firefox on Windows',
                deviceType: 'desktop',
                userAgent,
            });
        });

        it('should parse Safari on macOS user agent', () => {
            const userAgent =
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';

            const result = service.parse(userAgent);

            expect(result).toEqual({
                deviceName: 'Safari on macOS',
                deviceType: 'desktop',
                userAgent,
            });
        });

        it('should parse mobile iOS user agent', () => {
            const userAgent =
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';

            const result = service.parse(userAgent);

            expect(result.deviceType).toBe('mobile');
            expect(result.userAgent).toBe(userAgent);
        });

        it('should parse mobile Android user agent', () => {
            const userAgent =
                'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

            const result = service.parse(userAgent);

            expect(result.deviceType).toBe('mobile');
            expect(result.userAgent).toBe(userAgent);
        });

        it('should handle undefined user agent', () => {
            const result = service.parse(undefined);

            expect(result).toEqual({
                deviceName: 'Unknown device',
                deviceType: 'desktop',
                userAgent: '',
            });
        });

        it('should handle empty string user agent', () => {
            const result = service.parse('');

            expect(result).toEqual({
                deviceName: 'Unknown device',
                deviceType: 'desktop',
                userAgent: '',
            });
        });
    });
});