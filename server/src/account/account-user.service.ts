import { HttpException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Response } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { nanoid } from 'nanoid';
import { AccountRepository, VerifyEmailRecord } from './account.repository';
import { AuthUser } from 'src/auth/auth.repository';
import { CloudinaryService } from 'src/common/cloudinary.service';
import { CookieService } from 'src/common/cookie.service';
import { PasswordService } from 'src/common/password.service';
import { MailService } from 'src/mail/mail.service';
import { ProfileDto } from './dto/profile.dto';
import { NewEmailDto } from './dto/new-email.dto';
import { NewUsernameDto } from './dto/new-username.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

dayjs.extend(utc);

@Injectable()
export class AccountUserService {
    constructor(
        private readonly repo: AccountRepository,
        private readonly cloudinaryService: CloudinaryService,
        private readonly cookieService: CookieService,
        private readonly passwordService: PasswordService,
        private readonly mailService: MailService,
    ) {}

    getAccount(user: AuthUser): AuthUser {
        return user;
    }

    async updateProfile(user: AuthUser, dto: ProfileDto): Promise<number> {
        let profilePictureId: string | null = user.profilePictureId;

        if (dto.profilePicture) {
            if (user.name.length > 0 && user.profilePictureId !== null) {
                try {
                    await this.cloudinaryService.destroy(user.profilePictureId);
                } catch (e) {
                    Logger.log(e);
                    throw new InternalServerErrorException('Something went wrong');
                }
            }

            try {
                profilePictureId = await this.cloudinaryService.upload(dto.profilePicture.base64, '/profile_pictures');
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }
        }

        const link = !dto.link ? null : dto.link.length > 0 ? dto.link : null;

        try {
            await this.repo.updateProfile(user.id, {
                name: dto.name,
                bio: dto.bio,
                link,
                profilePictureId,
            });
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return 200;
    }

    async deleteAccount(user: AuthUser, response: Response): Promise<number> {
        if (user.roles === 'viewer') {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        try {
            await this.repo.deleteUser(user.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        this.cookieService.clearSession(response);
        return 200;
    }

    async updateEmail(user: AuthUser, dto: NewEmailDto): Promise<{ message: string }> {
        if (user.roles === 'viewer') {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        if (dto.newEmail === user.email) {
            throw new HttpException({ message: 'This is your current email' }, 409);
        }

        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findIdByEmail(dto.newEmail);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (duplicate) {
            throw new HttpException({ message: 'This email is already in use' }, 409);
        }

        let existingRequest: { id: string } | null = null;
        try {
            existingRequest = await this.repo.findVerifyEmailByOldEmail(user.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        const verificationToken = nanoid(32);
        const expires = dayjs.utc().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        try {
            if (existingRequest) {
                await this.repo.updateVerifyEmail(existingRequest.id, {
                    newEmail: dto.newEmail,
                    expires,
                    token: verificationToken,
                });
            } else {
                await this.repo.createVerifyEmail({
                    id: nanoid(),
                    oldEmail: user.email,
                    newEmail: dto.newEmail,
                    expires,
                    token: verificationToken,
                });
            }
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        const newEmailLink = `${process.env.SITE_URL}/@${user.username}/edit/change-email/confirm?temporal_token=${verificationToken}`;

        try {
            await this.mailService.sendNewEmailRequest(dto.newEmail, user.username, newEmailLink);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { message: 'Request sended successfully' };
    }

    async verifyNewEmail(user: AuthUser, token: string): Promise<{ message: string }> {
        if (token === undefined) {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        if (user.roles === 'viewer') {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        let record: VerifyEmailRecord | null = null;
        try {
            record = await this.repo.findVerifyEmailByTokenAndOldEmail(token, user.email);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!record) {
            throw new HttpException({ message: 'Invalid token' }, 401);
        }

        try {
            await this.repo.deleteVerifyEmail(record.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (dayjs.utc().isAfter(dayjs.utc(record.expires))) {
            throw new HttpException({ message: 'Your token is already expired.' }, 498);
        }

        try {
            await this.repo.updateEmail(user.id, record.newEmail);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.mailService.sendNewEmailConfirmation(record.newEmail, user.username);
        } catch (e) {
            Logger.log(e);
        }

        return { message: 'New email updated successfully' };
    }

    async updateUsername(user: AuthUser, dto: NewUsernameDto): Promise<{ message: string }> {
        if (user.roles === 'viewer') {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        if (dto.newUsername === user.username) {
            throw new HttpException({ message: 'You are already using this username', path: 'username' }, 409);
        }

        let duplicate: { id: string } | null = null;
        try {
            duplicate = await this.repo.findIdByUsername(dto.newUsername);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (duplicate) {
            throw new HttpException({ message: 'Username already taken', path: 'username' }, 409);
        }

        try {
            await this.repo.updateUsername(user.id, dto.newUsername);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { message: 'New username updated successfully' };
    }

    async updatePassword(user: AuthUser, dto: ResetPasswordDto): Promise<{ message: string }> {
        if (user.roles === 'viewer') {
            throw new HttpException({ message: 'Unauthorized' }, 401);
        }

        let account: { password: string } | null = null;
        try {
            account = await this.repo.findPasswordById(user.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (!account) {
            throw new HttpException({ message: 'Account not found' }, 400);
        }

        let passwordMatch = false;
        try {
            passwordMatch = await this.passwordService.verify(dto.newPassword, account.password);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (passwordMatch) {
            throw new HttpException({ message: 'Your new password must be different.', path: 'password' }, 400);
        }

        let hashedNewPassword = '';
        try {
            hashedNewPassword = await this.passwordService.hash(dto.newPassword);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        try {
            await this.repo.updatePassword(user.id, hashedNewPassword);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        return { message: 'New password updated successfully' };
    }

    async syncAccount(user: AuthUser): Promise<{ message: string }> {
        let followersCount = 0;
        let followingsCount = 0;
        try {
            followersCount = await this.repo.countFollowers(user.id);
            followingsCount = await this.repo.countFollowings(user.id);
        } catch (e) {
            Logger.log(e);
            throw new InternalServerErrorException('Something went wrong');
        }

        if (user.followersCount !== followersCount || user.followingsCount !== followingsCount) {
            try {
                await this.repo.updateCounts(user.id, followersCount, followingsCount);
            } catch (e) {
                Logger.log(e);
                throw new InternalServerErrorException('Something went wrong');
            }

            return { message: 'Account synchronized' };
        }

        return { message: 'Account already up to date' };
    }
}
