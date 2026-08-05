import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import {
    ResetPasswordConfirmationTemplate,
    ResetPasswordTemplate,
    WelcomeTemplate,
    NewEmailConfirmationTemplate,
    NewEmailRequestTemplate,
} from './templates';

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

    async sendResetPassword(email: string, link: string) {
        await this.resend.emails.send({
            from: this.from(),
            to: [email],
            subject: 'Reset your Threads Clone password',
            html: ResetPasswordTemplate(email, link),
        });
    }

    async sendResetPasswordConfirmation(email: string, link: string, shortLink: string) {
        await this.resend.emails.send({
            from: this.from(),
            to: [email],
            subject: 'Your Threads Clone password has been updated',
            html: ResetPasswordConfirmationTemplate(link, shortLink),
        });
    }

    async sendNewEmailRequest(newEmail: string, username: string, link: string) {
        await this.resend.emails.send({
            from: this.from(),
            to: [newEmail],
            subject: 'New Email Address Confirmation',
            html: NewEmailRequestTemplate(username, link),
        });
    }

    async sendNewEmailConfirmation(newEmail: string, username: string) {
        await this.resend.emails.send({
            from: this.from(),
            to: [newEmail],
            subject: 'Email Address Updated Successfully',
            html: NewEmailConfirmationTemplate(username),
        });
    }
}
