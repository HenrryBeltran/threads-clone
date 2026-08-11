import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { CookieService } from 'src/common/cookie.service';
import { Response } from 'express';
import { AuthRepository, SessionWithUser } from '../auth.repository';
import { AuthRequest } from '../auth-request';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        private readonly cookieService: CookieService,
        private readonly repo: AuthRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        const response = context.switchToHttp().getResponse<Response>();

        const token = this.cookieService.getToken(request);
        if (!token) throw new NotFoundException({ message: 'Session token not found.' });

        let session: SessionWithUser | null = null;
        try {
            session = await this.repo.findSessionWithUserByToken(token);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!session) throw new NotFoundException({ message: 'Session not found.' });

        if (dayjs.utc().isAfter(dayjs.utc(session.expires))) {
            try {
                await this.repo.deleteSession(session.id);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }

            this.cookieService.clearSession(response);
            throw new HttpException({ message: 'Session expired.' }, 498);
        }

        request.user = session.user;
        request.sessionId = session.id;

        return true;
    }
}
