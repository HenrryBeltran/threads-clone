import { Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { ActivityService } from './activity.service';

@Controller('account/activity')
@UseGuards(GetUserGuard)
export class AccountActivityController {
    constructor(private readonly accountActivityService: ActivityService) {}

    @Get('/all')
    async getAllActivities(
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.accountActivityService.getAll(request.user.id, page);
    }

    @Get('/unread')
    async getUnread(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.accountActivityService.getUnread(request.user.id);
    }

    @Post('/mark-as-read')
    async markAsRead(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.accountActivityService.markAsRead(request.user.id);
    }
}
