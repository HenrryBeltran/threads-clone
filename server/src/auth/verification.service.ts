import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { VerificationRepository, VerificationRecord } from './verification.repository';
import { MailService } from 'src/mail/mail.service';
import { customAlphabet, nanoid } from 'nanoid';
import daysjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AuthUser } from './auth.repository';

daysjs.extend(utc);

@Injectable()
export class VerificationService {
    constructor(
        private readonly verificationRepo: VerificationRepository,
        private readonly mailService: MailService,
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
        const expires = daysjs.utc().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

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

    async verifyAccount(user: AuthUser, pin: string) {}

    async getVerificationToken(user: AuthUser) {}
}
