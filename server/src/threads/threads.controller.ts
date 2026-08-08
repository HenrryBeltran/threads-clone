import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthRequest } from 'src/auth/auth-request';
import { GetUserGuard } from 'src/auth/guards/get-user.guard';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';

@Controller('threads')
export class ThreadsController {
    constructor(private readonly threadsService: ThreadsService) {}

    @Get('/posts')
    getPosts(@Query('page') page?: string) {
        return this.threadsService.getPosts(page);
    }

    @Get('/posts/search')
    @UseGuards(GetUserGuard)
    getPostsSearch(
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('q') q?: string,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.threadsService.getPostsSearch(q, page);
    }

    @Get('/posts/:userId')
    getPostsByUser(@Param('userId') userId: string, @Query('page') page?: string) {
        return this.threadsService.getPostsByUser(userId, page);
    }

    @Get('/liked/posts')
    @UseGuards(GetUserGuard)
    getLikedPosts(
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.threadsService.getLikedPosts(request.user.id, page);
    }

    @Get('/saved/posts')
    @UseGuards(GetUserGuard)
    getSavedPosts(
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
        @Query('page') page?: string,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.threadsService.getSavedPosts(request.user.id, page);
    }

    @Get('/post/:username/:postId')
    getThreadByUrl(@Param('username') username: string, @Param('postId') postId: string) {
        return this.threadsService.getThreadByUrl(username, postId);
    }

    @Get('/post/:id')
    getThreadById(@Param('id') id: string) {
        return this.threadsService.getThreadById(id);
    }

    @Post('/post')
    @UseGuards(GetUserGuard)
    createThreads(
        @Body() body: CreateThreadDto,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.threadsService.createThreads(request.user, body);
    }

    @Delete('/post/:threadId')
    @UseGuards(GetUserGuard)
    deleteThread(
        @Param('threadId') threadId: string,
        @Req() request: AuthRequest,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (!request.user) {
            response.status(204).send();
            return;
        }

        return this.threadsService.deleteThread(request.user.id, threadId);
    }

    @Get('/replies/posts/:userId')
    getReplyPosts(@Param('userId') userId: string, @Query('page') page?: string) {
        return this.threadsService.getReplyPosts(userId, page);
    }

    @Get('/replies/:parentId')
    getReplies(@Param('parentId') parentId: string, @Query('offset') offset?: string) {
        return this.threadsService.getReplies(parentId, offset);
    }
}
