import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository, LoginAuthUser, NewUser } from './auth.repository';
import { Response } from 'express';
import { PasswordService } from 'src/common/password.service';
import { CookieService } from 'src/common/cookie.service';
import { DeviceService } from 'src/common/device.service';
import { VerificationService } from './verification.service';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SignUpDto } from './dto/sign-up.dto';

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

        return 200;
    }

    async signUp(body: SignUpDto, response: Response) {
        const username = body.username.toLocaleLowerCase();

        let existingUsername: { id: string } | null = null;
        try {
            existingUsername = await this.repo.findByUsername(username);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (existingUsername) {
            throw new ConflictException({ message: `Username ${username} is already taken.`, path: 'username' });
        }

        let existingEmail: { id: string } | null = null;
        try {
            existingEmail = await this.repo.findByEmail(body.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (existingEmail) {
            throw new ConflictException({ message: 'This email is already register.', path: 'email' });
        }

        let hashedPassword = '';
        try {
            hashedPassword = await this.passwordService.hash(body.password);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        let newUser: NewUser | null = null;
        try {
            newUser = await this.repo.createUser({ username, email: body.email, password: hashedPassword });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        const sessionToken = nanoid();
        const expires = dayjs.utc().add(1, 'year').format('YYYY-MM-DD HH:mm:ss');

        try {
            await this.repo.createUserSession({
                token: sessionToken,
                expires,
                userId: newUser.id,
                deviceName: null,
                deviceType: null,
                ipAddress: null,
                userAgent: null,
            });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        this.cookieService.setSession(response, sessionToken);

        let token = '';
        try {
            token = await this.verificationService.ensureVerificationToken(newUser);
        } catch (e) {
            Logger.log(e);
            throw new HttpException({ token }, HttpStatus.TEMPORARY_REDIRECT);
        }

        return { token };
    }

    async logout(sessionId: string, response: Response) {
        try {
            await this.repo.deleteSession(sessionId);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        this.cookieService.clearSession(response);
        return 200;
    }
}
