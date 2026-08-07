import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { LikesService } from './likes.service';
import { AuthRequest } from 'src/auth/auth-request';
import { Response } from 'express';

@Controller('thread/post')
@UseGuards(GetUserGuard)
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Get('/like/:threadId')
    async getLike(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.likesService.getLike(request.user.id, threadId);
    }

    @Post('/like/:threadId')
    async likeThread(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.likesService.likeThread(request.user.id, threadId);
    }

    @Post('/unlike/:threadId')
    async unlikeThread(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.likesService.unlikeThread(request.user.id, threadId);
    }
}
