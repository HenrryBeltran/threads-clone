import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { LikesService } from './likes.service';
import { AuthRequest } from 'src/auth/auth-request';
import { NoContentException } from 'src/common/no-content.exception';

@Controller('thread/post')
@UseGuards(GetUserGuard)
export class LikesController {
    constructor(private readonly likesService: LikesService) {}

    @Get('/like/:threadId')
    async getLike(@Param('threadId') threadId: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.likesService.getLike(request.user.id, threadId);
    }

    @Post('/like/:threadId')
    async likeThread(@Param('threadId') threadId: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.likesService.likeThread(request.user.id, threadId);
    }

    @Post('/unlike/:threadId')
    async unlikeThread(@Param('threadId') threadId: string, @Req() request: AuthRequest) {
        if (!request.user) {
            throw new NoContentException();
        }

        return this.likesService.unlikeThread(request.user.id, threadId);
    }
}
