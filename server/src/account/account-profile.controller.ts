import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { AuthRequest } from 'src/auth/auth-request';
import { NoContentException } from 'src/common/no-content.exception';
import { AccountProfileService } from './account-profile.service';

@Controller('account/profile')
@UseGuards(GetUserGuard)
export class AccountProfileController {
    constructor(private readonly accountProfileService: AccountProfileService) {}

    @Get('/follow/:targetUsername')
    async getFollow(@Param('targetUsername') targetUsername: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }
        return this.accountProfileService.getFollow(request.user, targetUsername);
    }

    @Post('/follow/:targetUsername')
    async followUser(@Param('targetUsername') targetUsername: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }
        return this.accountProfileService.followUser(request.user, targetUsername);
    }

    @Post('/unfollow/:targetUsername')
    async unfollowUser(@Param('targetUsername') targetUsername: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }
        return this.accountProfileService.unfollowUser(request.user, targetUsername);
    }

    @Get('/followers/:targetId')
    async getFollowers(@Param('targetId') targetId: string, @Req() request: AuthRequest, @Query('page') page?: string) {
        if (!request.user) {
            throw new NoContentException();
        }
        return this.accountProfileService.getFollowers(request.user, targetId, page);
    }

    @Get('/followings/:targetId')
    async getFollowings(
        @Param('targetId') targetId: string,
        @Req() request: AuthRequest,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            throw new NoContentException();
        }
        return this.accountProfileService.getFollowings(request.user, targetId, page);
    }
}
