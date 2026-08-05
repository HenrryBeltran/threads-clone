import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AuthRepository, Session, SessionResponse } from './auth.repository';
import { Response } from 'express';
import { CookieService } from 'src/common/cookie.service';

@Injectable()
export class SessionsService {
    constructor(
        private readonly repo: AuthRepository,
        private readonly cookieService: CookieService,
    ) {}

    async getAll(userId: string, currentSessionId: string): Promise<SessionResponse[]> {
        let sessions: Session[] = [];
        try {
            sessions = await this.repo.findSessionsByUserId(userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return sessions.map((session) => {
            const { token, ...remaining } = session;
            return { ...remaining, isCurrent: remaining.id === currentSessionId };
        });
    }

    async deleteOne(sessionId: string, userId: string, currentSessionId: string, response: Response): Promise<void> {
        let deleted = false;
        try {
            deleted = await this.repo.deleteUserSession(sessionId, userId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!deleted) throw new NotFoundException({ message: 'Session not found.' });

        if (sessionId === currentSessionId) {
            this.cookieService.clearSession(response);
        }

        response.json(200);
    }

    async deleteAll(userId: string, currentSessionId: string, response: Response): Promise<void> {
        try {
            await this.repo.deleteSessionsByUserId(userId, currentSessionId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }
        response.json(200);
    }
}
