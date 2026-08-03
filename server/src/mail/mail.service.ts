import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { WelcomeTemplate } from './templates';

@Injectable()
export class MailService {
    private readonly resend = new Resend(process.env.RESEND_API_KEY);

    private from(): string {
        return process.env.NODE_ENV === 'development'
            ? 'Threads Clone <onboarding@resend.dev>'
            : 'Threads Clone <noreply@threads-clone.henrry.site>';
    }

    async sendWelcome(username: string, email: string, code: string) {
        await this.resend.emails.send({
            from: this.from(),
            to: [email],
            subject: 'Welcome to Threads Clone! Confirm Your Account',
            html: WelcomeTemplate(username, code),
        });
    }
}
