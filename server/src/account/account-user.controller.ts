import { Body, Controller, Delete, Get, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AccountUserService } from './account-user.service';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { AuthRequest } from 'src/auth/auth-request';
import { ProfileDto } from './dto/profile.dto';
import { NewEmailDto } from './dto/new-email.dto';
import { NewUsernameDto } from './dto/new-username.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';

@Controller('account/user')
@UseGuards(GetUserGuard)
export class AccountUserController {
    constructor(private readonly accountUserService: AccountUserService) {}

    @Get('/')
    async getUserAccount(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.getAccount(request.user);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 10, ttl: 900_000 } })
    @Put('/')
    async updateUserAccount(
        @Body() dto: ProfileDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        await this.accountUserService.updateProfile(request.user, dto, response);
    }

    @Delete('/')
    async deleteUserAccount(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        await this.accountUserService.deleteAccount(request.user, response);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 3, ttl: 120_000 } })
    @Post('/email')
    async updateEmail(
        @Body() dto: NewEmailDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.updateEmail(request.user, dto);
    }

    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 600_000 } })
    @Post('/email/verification')
    async verifyNewEmail(
        @Query('token') token: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.verifyNewEmail(request.user, token);
    }

    @Post('/username')
    async updateUsername(
        @Body() dto: NewUsernameDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.updateUsername(request.user, dto);
    }

    @Post('/password')
    async updatePassword(
        @Body() dto: ResetPasswordDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.updatePassword(request.user, dto);
    }

    @Post('/sync')
    async syncAccount(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountUserService.syncAccount(request.user);
    }
}
