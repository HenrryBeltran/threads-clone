import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { VerificationRepository, VerificationRecord } from './verification.repository';
import { MailService } from 'src/mail/mail.service';
import { customAlphabet, nanoid } from 'nanoid';
import { AuthRepository, AuthUser } from './auth.repository';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class VerificationService {
    constructor(
        private readonly verificationRepo: VerificationRepository,
        private readonly mailService: MailService,
        private readonly authRepo: AuthRepository,
    ) {}

    async ensureVerificationToken(user: { username: string; email: string }): Promise<string> {
        let existing: VerificationRecord | null = null;
        try {
            existing = await this.verificationRepo.findByEmail(user.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (existing) return existing.token;

        const code = customAlphabet('0123456789', 6)();
        const token = nanoid(32);
        const expires = dayjs.utc().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        try {
            await this.verificationRepo.upsert(user.email, code, token, expires);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.mailService.sendWelcome(user.username, user.email, code);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return token;
    }

    async verifyAccount(user: AuthUser, pin: string): Promise<string> {
        let verifiedUser: VerificationRecord | null = null;
        try {
            verifiedUser = await this.verificationRepo.findByEmail(user.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!verifiedUser) {
            throw new NotFoundException({ message: 'Verification linked to account not found.' });
        }

        if (pin !== verifiedUser.code) {
            throw new NotAcceptableException({ message: 'Pin not valid.' });
        }

        if (dayjs.utc().isAfter(dayjs.utc(verifiedUser.expires))) {
            throw new HttpException({ message: 'Your verification code is already expired.' }, 498);
        }

        try {
            await this.authRepo.verifyEmail(user.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.verificationRepo.delete(verifiedUser.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return 'Account verify successfully';
    }

    async getVerificationToken(user: AuthUser): Promise<{ token: string }> {
        let record: VerificationRecord | null = null;
        try {
            record = await this.verificationRepo.findByEmail(user.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!record) {
            throw new NotFoundException({ message: 'Requested verification not found.' });
        }

        return { token: record.token };
    }
}
