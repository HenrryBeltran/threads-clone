import { Injectable } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';

export const COOKIE_SESSION = 'st';

export const sessionCookieOptions: CookieOptions = {
    path: '/',
    domain: process.env.COOKIE_DOMAIN,
    sameSite: 'strict' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365 * 1000, // Cookie lifecycle in milliseconds (e.g., 365 days = 1 year)
};

@Injectable()
export class CookieService {
    setSession(response: Response, token: string): void {
        response.cookie(COOKIE_SESSION, token, sessionCookieOptions);
    }

    clearSession(response: Response): void {
        response.clearCookie(COOKIE_SESSION);
    }

    getToken(request: Request): string | undefined {
        return (request.cookies || {})[COOKIE_SESSION];
    }
}
