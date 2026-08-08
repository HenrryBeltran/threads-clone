import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { SavedService } from './saved.service';

@Controller('thread/post')
@UseGuards(GetUserGuard)
export class SavedController {
    constructor(private readonly savedService: SavedService) {}

    @Get('/save/:threadId')
    async getSave(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.savedService.getSave(request.user.id, threadId);
    }

    @Post('/save/:threadId')
    async saveThread(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.savedService.saveThread(request.user.id, threadId);
    }

    @Post('/unsave/:threadId')
    async unsaveThread(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.savedService.unsaveThread(request.user.id, threadId);
    }
}
