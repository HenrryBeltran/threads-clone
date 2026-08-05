import {
    BadRequestException,
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { PasswordResetRecord, PasswordResetRepository } from './password-reset.repository';
import { MailService } from 'src/mail/mail.service';
import { PasswordService } from 'src/common/password.service';
import { AuthRepository, LoginAuthUser } from './auth.repository';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class PasswordResetService {
    constructor(
        private readonly authRepo: AuthRepository,
        private readonly passwordResetRepo: PasswordResetRepository,
        private readonly mailService: MailService,
        private readonly passwordService: PasswordService,
    ) {}

    async forgottenPassword(email: string) {
        let registeredUser: LoginAuthUser | null = null;
        try {
            registeredUser = await this.authRepo.findRegisteredUser(email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!registeredUser) throw new NotFoundException({ message: 'Email not register.', path: 'email' });

        if (registeredUser.roles.includes('viewer')) {
            throw new BadRequestException({ message: 'Invalid email.', path: 'email' });
        }

        const token = nanoid(32);
        const expires = dayjs.utc().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

        let existingMail: PasswordResetRecord | null = null;
        try {
            existingMail = await this.passwordResetRepo.findByEmail(registeredUser.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (existingMail) {
            const isFirstRequest = existingMail.createdAt === existingMail.updatedAt;
            const now = dayjs.utc();
            const cooldown = dayjs.utc(existingMail.updatedAt).add(120, 'seconds');

            if (!isFirstRequest && now.isBefore(cooldown)) {
                throw new HttpException({ message: 'Failed to send email. Too many attempts try again later.' }, 429);
            }

            try {
                await this.passwordResetRepo.updateToken(existingMail.id, token, expires);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        } else {
            try {
                await this.passwordResetRepo.create(email, token, expires);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        }

        const resetPasswordLink = `${process.env.SITE_URL}/account/reset-password?temporal_token=${token}`;

        try {
            await this.mailService.sendResetPassword(email, resetPasswordLink);
        } catch (e) {
            Logger.log(e);
        }

        return { message: "Success! We've sent you an email to confirm your password change." };
    }

    async validateResetToken(token: string) {
        if (token.length !== 32 || token.includes(' ')) {
            throw new BadRequestException({ message: 'Invalid token.' });
        }

        let existingToken: PasswordResetRecord | null = null;
        try {
            existingToken = await this.passwordResetRepo.findByToken(token);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!existingToken) throw new BadRequestException({ message: 'Invalid token.' });

        const now = dayjs.utc();
        const expires = dayjs.utc(existingToken.expires);

        if (now.isAfter(expires)) {
            try {
                await this.passwordResetRepo.delete(existingToken.id);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }

            throw new HttpException({ message: 'Your token is already expired.' }, 498);
        }

        return { message: 'Valid url.' };
    }

    async resetPassword(token: string, newPassword: string) {
        let existingToken: PasswordResetRecord | null = null;
        try {
            existingToken = await this.passwordResetRepo.findByToken(token);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!existingToken) throw new BadRequestException({ message: 'Invalid token.' });

        const now = dayjs.utc();
        const expires = dayjs.utc(existingToken.expires);

        if (now.isAfter(expires)) {
            throw new HttpException({ message: 'Your token is already expired.' }, 498);
        }

        let registeredUser: LoginAuthUser | null = null;
        try {
            registeredUser = await this.authRepo.findRegisteredUser(existingToken.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!registeredUser) throw new NotFoundException({ message: 'Could not find the user account.' });

        let hashedPassword = '';
        try {
            hashedPassword = await this.passwordService.hash(newPassword);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.passwordResetRepo.delete(existingToken.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.authRepo.updatePassword(registeredUser.id, hashedPassword);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        const newTemporalToken = nanoid(32);
        const newExpires = dayjs.utc().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

        try {
            await this.passwordResetRepo.create(registeredUser.email, newTemporalToken, newExpires);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.authRepo.deleteAllUserSessions(registeredUser.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        const resetPasswordLink = `${process.env.SITE_URL}/account/reset-password?temporal_token=${newTemporalToken}`;
        const shortResetPasswordLink = `${process.env.SITE_URL}/account/reset-password`;

        try {
            await this.mailService.sendResetPasswordConfirmation(
                registeredUser.email,
                resetPasswordLink,
                shortResetPasswordLink,
            );
        } catch (e) {
            Logger.log(e);
        }

        return { message: 'Reset password successfully' };
    }
}
