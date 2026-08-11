import { Injectable } from '@nestjs/common';
import { UAParser } from 'ua-parser-js';

export type DeviceInfo = { deviceName: string; deviceType: string; userAgent: string };

@Injectable()
export class DeviceService {
    parse(userAgent?: string): DeviceInfo {
        const ua = new UAParser(userAgent);
        const { type } = ua.getDevice();
        const browser = ua.getBrowser().name;
        const os = ua.getOS().name;
        const deviceName = [browser, os].filter(Boolean).join(' on ') || 'Unknown device';
        return { deviceName, deviceType: type ?? 'desktop', userAgent: userAgent ?? '' };
    }
}
