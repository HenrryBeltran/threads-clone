import {
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository, LoginAuthUser } from './auth.repository';
import { Response } from 'express';
import { PasswordService } from 'src/common/password.service';
import { CookieService } from 'src/common/cookie.service';
import { DeviceService } from 'src/common/device.service';
import { VerificationService } from './verification.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class AuthService {
    constructor(
        private readonly repo: AuthRepository,
        private readonly passwordService: PasswordService,
        private readonly cookieService: CookieService,
        private readonly deviceService: DeviceService,
        private readonly verificationService: VerificationService,
    ) {}

    async login(usernameOrEmail: string, password: string, userAgent: string, ip: string, response: Response) {
        const username = usernameOrEmail.toLocaleLowerCase();

        let registeredUser: LoginAuthUser | null = null;
        try {
            registeredUser = await this.repo.findRegisteredUser(username);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!registeredUser) {
            throw new NotFoundException({
                message: username.includes('@') ? 'Email not found.' : 'Username not found.',
                path: 'username',
            });
        }

        let compareResult = false;
        try {
            compareResult = await this.passwordService.verify(password, registeredUser.password);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!compareResult) {
            throw new UnauthorizedException({ message: 'Wrong password.', path: 'password' });
        }

        const sessionToken = nanoid();
        const expires = dayjs.utc().add(1, 'year').format('YYYY-MM-DD HH:mm:ss');
        const { deviceName, deviceType } = this.deviceService.parse(userAgent);

        try {
            await this.repo.createUserSession({
                token: sessionToken,
                expires,
                userId: registeredUser.id,
                deviceName,
                deviceType,
                ipAddress: ip,
                userAgent,
            });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        this.cookieService.setSession(response, sessionToken);

        if (registeredUser.emailVerified === null && !registeredUser.roles.includes('viewer')) {
            let token = '';
            try {
                token = await this.verificationService.ensureVerificationToken(registeredUser);
            } catch (e) {
                Logger.log(e);
            }
            throw new HttpException({ token }, HttpStatus.TEMPORARY_REDIRECT);
        }

        response.json(200);
    }
}
