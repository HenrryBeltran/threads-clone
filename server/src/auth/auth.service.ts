import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository, UserAuth } from './auth.repository';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Response } from 'express';

dayjs.extend(utc);

@Injectable()
export class AuthService {
    constructor(private readonly repo: AuthRepository) {}

    async login(usernameOrEmail: string, password: string, response: Response) {
        const username = usernameOrEmail.toLocaleLowerCase();

        let registeredUser: UserAuth | null = null;

        try {
            registeredUser = await this.repo.findRegisteredUser(username);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!registeredUser) {
            if (username.includes('@')) {
                throw new NotFoundException({ message: 'Email not found.', path: 'username' });
            } else {
                throw new NotFoundException({ message: 'Username not found..', path: 'username' });
            }
        }

        let compareResult = false;
        try {
            compareResult = await bcrypt.compare(password, registeredUser.password);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!compareResult) {
            throw new UnauthorizedException({ message: 'Wrong password.', path: 'password' });
        }

        const sessionToken = nanoid();
        const expires = dayjs.utc().add(1, 'year').format('YYYY-MM-DD HH:mm:ss');

        try {
            await this.repo.createUserSession(sessionToken, expires, registeredUser.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        response.cookie('st', sessionToken, {
            path: '/',
            domain: process.env.COOKIE_DOMAIN,
            sameSite: 'strict',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 90 * 1000, // Cookie lifecycle in milliseconds (e.g., 1 day)
        });

        return { message: 'Logged in successfully!' };
    }
}
