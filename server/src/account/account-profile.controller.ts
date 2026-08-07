import { Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { AuthRequest } from 'src/auth/auth-request';
import { AccountProfileService } from './account-profile.service';

@Controller('account/profile')
@UseGuards(GetUserGuard)
export class AccountProfileController {
    constructor(private readonly accountProfileService: AccountProfileService) {}

    @Get('/follow/:targetUsername')
    async getFollow(
        @Param('targetUsername') targetUsername: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountProfileService.getFollow(request.user, targetUsername);
    }

    @Post('/follow/:targetUsername')
    async followUser(
        @Param('targetUsername') targetUsername: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountProfileService.followUser(request.user, targetUsername);
    }

    @Post('/unfollow/:targetUsername')
    async unfollowUser(
        @Param('targetUsername') targetUsername: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountProfileService.unfollowUser(request.user, targetUsername);
    }

    @Get('/followers/:targetId')
    async getFollowers(
        @Param('targetId') targetId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountProfileService.getFollowers(request.user, targetId, page);
    }

    @Get('/followings/:targetId')
    async getFollowings(
        @Param('targetId') targetId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }
        return this.accountProfileService.getFollowings(request.user, targetId, page);
    }
}
