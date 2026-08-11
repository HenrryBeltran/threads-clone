import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { NoContentException } from 'src/common/no-content.exception';
import { ActivityService } from './activity.service';

@Controller('account/activity')
@UseGuards(GetUserGuard)
export class AccountActivityController {
    constructor(private readonly accountActivityService: ActivityService) {}

    @Get('/all')
    async getAllActivities(@Req() request: AuthRequest, @Query('page') page?: string) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.accountActivityService.getAll(request.user.id, page);
    }

    @Get('/unread')
    async getUnread(@Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.accountActivityService.getUnread(request.user.id);
    }

    @Post('/mark-as-read')
    async markAsRead(@Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.accountActivityService.markAsRead(request.user.id);
    }
}
